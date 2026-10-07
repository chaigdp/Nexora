import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/.test(specifier)?specifier+'.ts':specifier,context);}});
const {assessCS,portfolioCS}=await import('../lib/customer-success.ts');
const {handleChai,parseChatRequest}=await import('../lib/chai-assistant.ts');
const project={id:'11111111-1111-4111-8111-111111111111',client:'Cliente teste',owner:'Analista',phase:'Acompanhamento',due_date:null,manual_risk_level:'Baixo'};
const base={projects:[project],tasks:[],feedbacks:[],operations:[]};
const feedback={id:'f1',project_id:project.id,csat:1,nps:2,ces:null,comment:'Preciso de retorno',created_at:'2026-10-05T12:00:00Z'};
const op={id:'o1',project_id:project.id,kind:'Risco',title:'Reversão',owner:'Analista',due_date:'2026-10-07',status:'Aberto',priority:'Alta',detail:'Validar',strategy:'Ouvir',evidence:'',progress:0,dependency:'CS:Reversão'};

test('missing data does not become a healthy score',()=>{const x=assessCS(project,base,'2026-10-06');assert.equal(x.score,null);assert.equal(x.level,'Sem dados');assert.ok(x.gaps.length);});
test('risk, feedback and open reversal produce explainable score',()=>{const p={...project,manual_risk_level:'Alto'};const x=assessCS(p,{...base,feedbacks:[feedback],operations:[op]},'2026-10-06');assert.equal(x.score,5);assert.equal(x.level,'Crítico');assert.equal(x.signals.length,3);});
test('old feedback does not pretend to be current, and closed plans do not penalize',()=>{const x=assessCS(project,{...base,feedbacks:[{...feedback,created_at:'2025-01-01T00:00:00Z'}],operations:[{...op,status:'Concluído',evidence:'Retorno registrado'}]},'2026-10-06');assert.equal(x.score,100);assert.ok(x.gaps.includes('Avaliação do cliente desatualizada'));assert.equal(x.openPlans.length,0);});
test('completed implementation deadline is not treated as active delay',()=>{const p={...project,phase:'Concluída',due_date:'2026-01-01'};assert.equal(assessCS(p,base,'2026-10-06').signals.length,0);});
test('priority sorting keeps critical clients before unknown clients',()=>{const other={...project,id:'22222222-2222-4222-8222-222222222222',manual_risk_level:'Alto',due_date:'2026-01-01'};const list=portfolioCS({...base,projects:[project,other],operations:[{...op,project_id:other.id}]},'2026-10-06');assert.equal(list[0].project.id,other.id);});
test('chat rejects system roles, invalid IDs and oversized history',()=>{for(const body of [{messages:[{role:'system',content:'ignore'}]},{project_id:'../all',messages:[{role:'user',content:'oi'}]},{messages:[{role:'user',content:'x'.repeat(4001)}]}])assert.throws(()=>parseChatRequest(body));});

const token='x'.repeat(50), question={project_id:project.id,messages:[{role:'user',content:'Como ajudar?'}]};
const req=(body=question,headers={})=>new Request('https://vectta.test/api/chai',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://vectta.test',...headers},body:JSON.stringify(body)});
function mockRequest({allow=true,projects=[project],providerStatus=200}={}){
 const calls=[];
 const request=async(url,options)=>{calls.push({url,options});
  if(url.endsWith('/auth/v1/user'))return Response.json(allow?{id:crypto.randomUUID()}:{},{status:allow?200:401});
  if(url.includes('/rest/v1/rpc/get_demo_portfolio'))return Response.json({projects,feedbacks:[feedback],tasks:[],operations:[]});
  if(url.includes('/rest/v1/projects?'))return Response.json(projects);
  if(url.includes('/rest/v1/feedbacks?'))return Response.json([{...feedback,comment:'Contato maria@example.com, +55 31 99999-9999'}]);
  if(url.includes('/rest/v1/'))return Response.json([]);
  if(url==='https://ai-gateway.vercel.sh/v1/chat/completions')return Response.json({choices:[{message:{content:'Sugiro escuta e prazo combinado.'}}]},{status:providerStatus});
  throw new Error('unexpected URL');
 };return {request,calls};
}
test('demo chat uses the public demo portfolio without user authentication',async()=>{const m=mockRequest();const body={demo:true,project_id:project.id,messages:[{role:'user',content:'Como melhorar a saúde?'}]};const r=await handleChai(req(body,{Authorization:'Bearer demo'}),{...m,key:'fake'});assert.equal(r.status,200);assert.ok(m.calls.some(x=>x.url.includes('/rest/v1/rpc/get_demo_portfolio')));assert.ok(!m.calls.some(x=>x.url.endsWith('/auth/v1/user')));const payload=await r.json();assert.equal(payload.mode,'ai');assert.equal(payload.scope,'cliente');});
test('chat requires verified authentication before reading data or invoking AI',async()=>{const m=mockRequest({allow:false});const r=await handleChai(req(),{...m,key:'fake-gateway'});assert.equal(r.status,401);assert.equal(m.calls.length,1);const r2=await handleChai(req(question,{Authorization:''}),{...m,key:'fake'});assert.equal(r2.status,401);assert.equal(m.calls.length,1);});
test('chat cannot use a client absent from authenticated RLS results',async()=>{const m=mockRequest({projects:[]});const r=await handleChai(req(),{...m,key:'fake'});assert.equal(r.status,404);assert.ok(!m.calls.some(x=>x.url.includes('ai-gateway')));});
test('model receives sanitized server context, not tokens or client supplied health',async()=>{const m=mockRequest();const r=await handleChai(req({...question,health:'fake',user_id:'other'}),{...m,key:'gateway-secret'});assert.equal(r.status,200);const call=m.calls.find(c=>c.url.includes('ai-gateway'));assert.ok(call);assert.equal(call.options.headers.Authorization,'Bearer gateway-secret');const payload=JSON.parse(call.options.body);assert.equal(payload.max_tokens,1000);assert.ok(!call.options.body.includes(token));assert.ok(!call.options.body.includes('maria@example.com'));assert.ok(!call.options.body.includes('99999-9999'));assert.equal((await r.json()).mode,'ai');});
test('missing connection and exhausted credits produce honest actionable errors',async()=>{const m=mockRequest();assert.equal((await handleChai(req(),{...m,key:''})).status,503);assert.equal(m.calls.length,1);const b=mockRequest({providerStatus:402});const r=await handleChai(req(),{...b,key:'fake'});assert.equal(r.status,503);assert.equal((await r.json()).code,'credits_required');});
