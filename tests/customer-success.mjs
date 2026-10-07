import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('.')&&!/\.[a-z]+$/.test(specifier)?specifier+'.ts':specifier,context);}});
const {assessCS,portfolioCS,inferCSCategory,buildCSDraft,csCategory,isCSPlan,summarizeCS,client360}=await import('../lib/customer-success.ts');
const {handleChai,parseChatRequest}=await import('../lib/chai-assistant.ts');
const {chaiModules}=await import('../lib/chai-modules.ts');
const project={id:'11111111-1111-4111-8111-111111111111',client:'Cliente teste',owner:'Analista',phase:'Acompanhamento',due_date:null,manual_risk_level:'Baixo'};
const base={projects:[project],tasks:[],feedbacks:[],operations:[]};
const feedback={id:'f1',project_id:project.id,csat:1,nps:2,ces:null,comment:'Preciso de retorno',created_at:'2026-10-05T12:00:00Z'};
const op={id:'o1',project_id:project.id,kind:'Risco',title:'Reversão',owner:'Analista',due_date:'2026-10-07',status:'Aberto',priority:'Alta',detail:'Validar',strategy:'Ouvir',evidence:'',progress:0,dependency:'CS:Reversão'};

test('chAI intent becomes the right CS plan category',()=>{
  assert.equal(inferCSCategory('Como conduzir a reversão e evitar cancelamento?'),'Reversão');
  assert.equal(inferCSCategory('Cliente reclamou e existe atrito na relação'),'Atrito');
  assert.equal(inferCSCategory('Precisamos melhorar adoção e treinamento'),'Adoção');
  assert.equal(inferCSCategory('Há oportunidade de expansão e upgrade'),'Expansão');
  assert.equal(inferCSCategory('Faça um acompanhamento executivo'),'Acompanhamento');
});
test('every requested Vectta area has a contextual chAI configuration',()=>{
  assert.deepEqual(Object.keys(chaiModules).sort(),['cs','feedbacks','implantacoes','inicio','rentabilidade','riscos','testes'].sort());
  for(const config of Object.values(chaiModules)){assert.ok(config.label);assert.ok(config.intro);assert.equal(config.suggestions.length,4);}
});

test('AI draft has category priority and a reviewable follow-up date',()=>{
  const draft=buildCSDraft(project,'Analista','Ouvir a causa e combinar próximo passo.','Reversão','2026-10-07');
  assert.equal(draft.due_date,'2026-10-09');
  assert.equal(draft.priority,'Alta');
  assert.equal(draft.kind,'Risco');
  assert.equal(csCategory(draft),'Reversão');
  assert.ok(isCSPlan(draft));
  assert.match(draft.title,/Reversão/);
});
test('saved AI plan immediately changes the CS summary used by KPIs',()=>{
  const before=summarizeCS(base,'2026-10-07');
  assert.equal(before.reversalsOpen,0);
  const draft=buildCSDraft(project,'Analista','Plano de reversão.','Reversão','2026-10-07');
  const after=summarizeCS({...base,operations:[draft]},'2026-10-07');
  assert.equal(after.reversalsOpen,1);
  assert.equal(after.activePlans.length,1);
  assert.equal(after.attention,1);
});
test('client 360 combines health, open work, next contact and relationship history',()=>{
  const draft={...buildCSDraft(project,'Analista','Ouvir e retornar.','Atrito','2026-10-07'),id:'p1',updated_at:'2026-10-07T14:00:00Z'};
  const task={id:'t1',project_id:project.id,done:false,critical:true,blocked:true,due_date:'2026-10-06',title:'Resolver bloqueio'};
  const view=client360(project.id,{...base,tasks:[task],feedbacks:[feedback],operations:[draft]},'2026-10-07');
  assert.ok(view);
  assert.equal(view.blockedCount,1);
  assert.equal(view.lateCount,1);
  assert.equal(view.activePlans.length,1);
  assert.equal(view.nextContact?.id,'p1');
  assert.equal(view.timeline.length,2);
  assert.equal(view.timeline[0].type,'plan');
});
test('missing data does not become a healthy score',()=>{const x=assessCS(project,base,'2026-10-06');assert.equal(x.score,null);assert.equal(x.level,'Sem dados');assert.ok(x.gaps.length);});
test('risk, feedback and open reversal produce explainable score',()=>{const p={...project,manual_risk_level:'Alto'};const x=assessCS(p,{...base,feedbacks:[feedback],operations:[op]},'2026-10-06');assert.equal(x.score,5);assert.equal(x.level,'Crítico');assert.equal(x.signals.length,3);});
test('old feedback does not pretend to be current, and closed plans do not penalize',()=>{const x=assessCS(project,{...base,feedbacks:[{...feedback,created_at:'2025-01-01T00:00:00Z'}],operations:[{...op,status:'Concluído',evidence:'Retorno registrado'}]},'2026-10-06');assert.equal(x.score,100);assert.ok(x.gaps.includes('Avaliação do cliente desatualizada'));assert.equal(x.openPlans.length,0);});
test('completed implementation deadline is not treated as active delay',()=>{const p={...project,phase:'Concluída',due_date:'2026-01-01'};assert.equal(assessCS(p,base,'2026-10-06').signals.length,0);});
test('priority sorting keeps critical clients before unknown clients',()=>{const other={...project,id:'22222222-2222-4222-8222-222222222222',manual_risk_level:'Alto',due_date:'2026-01-01'};const list=portfolioCS({...base,projects:[project,other],operations:[{...op,project_id:other.id}]},'2026-10-06');assert.equal(list[0].project.id,other.id);});
test('chat rejects system roles, invalid IDs, invalid modules and oversized history',()=>{for(const body of [{messages:[{role:'system',content:'ignore'}]},{project_id:'../all',messages:[{role:'user',content:'oi'}]},{module:'qualquer-coisa',messages:[{role:'user',content:'oi'}]},{messages:[{role:'user',content:'x'.repeat(4001)}]}])assert.throws(()=>parseChatRequest(body));});

const token='x'.repeat(50), question={project_id:project.id,messages:[{role:'user',content:'Como ajudar?'}]};
const req=(body=question,headers={})=>new Request('https://vectta.test/api/chai',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://vectta.test',...headers},body:JSON.stringify(body)});
function mockRequest({allow=true,projects=[project],tasks=[],operations=[],providerStatus=200,providerStatuses=[]}={}){
 const calls=[];
 const request=async(url,options)=>{calls.push({url,options});
  if(url.endsWith('/auth/v1/user'))return Response.json(allow?{id:crypto.randomUUID()}:{},{status:allow?200:401});
  if(url.includes('/rest/v1/rpc/get_demo_portfolio'))return Response.json({projects,feedbacks:[feedback],tasks,operations});
  if(url.includes('/rest/v1/projects?'))return Response.json(projects);
  if(url.includes('/rest/v1/feedbacks?'))return Response.json([{...feedback,comment:'Contato maria@example.com, +55 31 99999-9999'}]);
  if(url.includes('/rest/v1/tasks?'))return Response.json(tasks);
  if(url.includes('/rest/v1/operations?'))return Response.json(operations);
  if(url.includes('/rest/v1/'))return Response.json([]);
  if(url==='https://ai-gateway.vercel.sh/v1/chat/completions'){const index=calls.filter(x=>x.url.includes('ai-gateway')).length-1;const status=providerStatuses[index]??providerStatus;return Response.json({choices:[{message:{content:'Sugiro escuta e prazo combinado.'}}]},{status});}
  throw new Error('unexpected URL');
 };return {request,calls};
}
test('demo chat uses the public demo portfolio without user authentication',async()=>{const m=mockRequest();const body={demo:true,project_id:project.id,messages:[{role:'user',content:'Como melhorar a saúde?'}]};const r=await handleChai(req(body,{Authorization:'Bearer demo'}),{...m,key:'fake'});assert.equal(r.status,200);assert.ok(m.calls.some(x=>x.url.includes('/rest/v1/rpc/get_demo_portfolio')));assert.ok(!m.calls.some(x=>x.url.endsWith('/auth/v1/user')));const payload=await r.json();assert.equal(payload.mode,'ai');assert.equal(payload.scope,'cliente');});
test('chat requires verified authentication before reading data or invoking AI',async()=>{const m=mockRequest({allow:false});const r=await handleChai(req(),{...m,key:'fake-gateway'});assert.equal(r.status,401);assert.equal(m.calls.length,1);const r2=await handleChai(req(question,{Authorization:''}),{...m,key:'fake'});assert.equal(r2.status,401);assert.equal(m.calls.length,1);});
test('chat cannot use a client absent from authenticated RLS results',async()=>{const m=mockRequest({projects:[]});const r=await handleChai(req(),{...m,key:'fake'});assert.equal(r.status,404);assert.ok(!m.calls.some(x=>x.url.includes('ai-gateway')));});
test('model receives sanitized server context, not tokens or client supplied health',async()=>{const m=mockRequest();const r=await handleChai(req({...question,health:'fake',user_id:'other'}),{...m,key:'gateway-secret'});assert.equal(r.status,200);const call=m.calls.find(c=>c.url.includes('ai-gateway'));assert.ok(call);assert.equal(call.options.headers.Authorization,'Bearer gateway-secret');const payload=JSON.parse(call.options.body);assert.equal(payload.max_tokens,700);assert.ok(!call.options.body.includes(token));assert.ok(!call.options.body.includes('maria@example.com'));assert.ok(!call.options.body.includes('99999-9999'));assert.equal((await r.json()).mode,'ai');});
test('360 analysis context includes open work, blockers and next contact',async()=>{const task={id:'t-ai',project_id:project.id,title:'Resolver integração',done:false,critical:true,blocked:true,due_date:'2026-10-01'};const plan={...op,id:'o-ai',dependency:'CS:Atrito',due_date:'2099-10-09',updated_at:'2026-10-07T10:00:00Z'};const m=mockRequest({tasks:[task],operations:[plan]});const r=await handleChai(req({project_id:project.id,messages:[{role:'user',content:'Analise este cliente em 360 graus'}]}),{...m,key:'fake',now:()=>Date.parse('2026-10-07T12:00:00Z')});assert.equal(r.status,200);const call=m.calls.find(c=>c.url.includes('ai-gateway'));const payload=JSON.parse(call.options.body);const context=payload.messages[1].content;assert.match(context,/"openTasks":1/);assert.match(context,/"blockedTasks":1/);assert.match(context,/"nextContact":\{"title":"Reversão"/);});
test('module choice changes the strategic context sent to chAI',async()=>{const testOp={...op,id:'test-op',kind:'Teste',status:'Reprovado',evidence:''};const m=mockRequest({operations:[testOp]});const r=await handleChai(req({module:'testes',project_id:project.id,messages:[{role:'user',content:'O que falta validar?'}]}),{...m,key:'fake',now:()=>Date.parse('2026-10-07T12:00:00Z')});assert.equal(r.status,200);const call=m.calls.find(c=>c.url.includes('ai-gateway'));const payload=JSON.parse(call.options.body);assert.match(payload.messages[0].content,/módulo atual é Testes/);assert.match(payload.messages[1].content,/"moduleName":"Testes"/);assert.match(payload.messages[1].content,/"failed":1/);assert.match(payload.messages[1].content,/"withoutEvidence":1/);});
test('missing connection stays explicit and provider failure falls back to local analysis',async()=>{const m=mockRequest();assert.equal((await handleChai(req(),{...m,key:''})).status,503);assert.equal(m.calls.length,1);const b=mockRequest({providerStatus:402});const r=await handleChai(req(),{...b,key:'fake'});assert.equal(r.status,200);const payload=await r.json();assert.equal(payload.mode,'local_analysis');assert.match(payload.answer,/Para Cliente Teste/);assert.equal(b.calls.filter(x=>x.url.includes('ai-gateway')).length,2);});
test('chAI automatically tries the second free model when the first provider fails',async()=>{const m=mockRequest({providerStatuses:[503,200]});const r=await handleChai(req(),{...m,key:'fake'});assert.equal(r.status,200);const payload=await r.json();assert.equal(payload.mode,'ai');assert.equal(payload.model,'inclusionai/ling-3.0-flash-sante-free');const calls=m.calls.filter(x=>x.url.includes('ai-gateway'));assert.equal(calls.length,2);const second=JSON.parse(calls[1].options.body);assert.equal(second.model,'inclusionai/ling-3.0-flash-sante-free');});
