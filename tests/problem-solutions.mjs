import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return next(s.startsWith('.')&&!/\.[a-z]+$/.test(s)?s+'.ts':s,c);}});
const {blankCase,caseIssue,criticalSignals,solutionAnswer,solutionSearch}=await import('../lib/problem-solutions.ts');
const {handleSolutions,findSolutions}=await import('../lib/solutions-api.ts');
const {handleChai}=await import('../lib/chai-assistant.ts');
const token='Bearer '+'a'.repeat(60),id='11111111-1111-4111-8111-111111111111';
const valid={...blankCase(),state:'validated',problem:'Erro de login',context:'Perfil sem permissão',solution:'Conferir perfil com o administrador',result:'Acesso confirmado',evidence:'Teste com usuário autorizado',limits:'Não alterar acesso sem autorização',verifiedBy:'Analista',verifiedAt:'2026-10-01'};
const row={id,title:'Acesso ao sistema',problem_case:valid,approved:true,archived:false,updated_at:'2026-10-28T10:00:00Z'};
test('investigation can be saved but validation requires evidence, limits, owner and date',()=>{
 assert.equal(caseIssue({...blankCase(),problem:'Falha observada'}),null);
 assert.ok(caseIssue({...blankCase(),state:'resolved',problem:'Falha'}));
 assert.ok(caseIssue({...valid,evidence:''}));assert.ok(caseIssue({...valid,limits:''}));
 assert.ok(caseIssue({...valid,verifiedAt:'2099-01-01'}));assert.ok(caseIssue({...valid,verifiedAt:'2026-99-99'}));assert.equal(caseIssue(valid),null);
});
test('alerts use recorded open blockers, critical tasks, delays and active high risk',()=>{
 const found=criticalSignals([{id:'1',title:'Erro',done:false,blocked:true},{id:'2',title:'Encerrada',done:true,critical:true},{id:'3',title:'Atrasada',done:false,due_date:'2026-10-01'}],[{id:'p',client:'Cliente',phase:'Concluída',manual_risk_level:'Alto'}],'2026-10-28');
 assert.deepEqual(found.map(x=>x.id),['1','3']);
 assert.equal(criticalSignals([],[],'2026-10-28',[{id:'p',client:'Teste',actions:[{id:'b',title:'Perfil sem acesso',status:'blocked',due:''},{id:'x',title:'Sem prazo',status:'open',due:''}]}])[0].label,'Ação bloqueada no plano');
});
test('API authenticates before reading or writing; invalid case cannot save',async()=>{
 let calls=0;const unauth=await handleSolutions(new Request('https://app.test/api/solutions'),async()=>{calls++;throw Error();});assert.equal(unauth.status,401);assert.equal(calls,0);
 const response=await handleSolutions(new Request('https://app.test/api/solutions',{method:'POST',headers:{authorization:token,'content-type':'application/json'},body:JSON.stringify({id,title:'Teste',problem_case:{...valid,evidence:''}})}),async()=>{calls++;return Response.json({id});});assert.equal(response.status,400);assert.equal(calls,1);
});
test('search includes approval and ownership token, excludes drafts and archived records',async()=>{
 let requested='';const rows=await findSolutions('Erro login',{'Authorization':token},async(url,init)=>{requested=String(url);assert.equal(init.headers.Authorization,token);return Response.json([row,{...row,approved:false},{...row,archived:true},{...row,problem_case:{...valid,state:'investigating'}}]);});assert.equal(rows.length,1);const q=new URL(requested).searchParams;assert.equal(q.get('approved'),'eq.true');assert.equal(q.get('archived'),'eq.false');assert.match(solutionAnswer(rows),new RegExp(id));assert.match(solutionAnswer([]),/Não encontrei/);assert.equal(solutionSearch('como posso'), 'posso');
});
test('chAI solution consultation stays local and never invokes a model or reads the client portfolio',async()=>{
 const urls=[];const response=await handleChai(new Request('https://app.test/api/chai',{method:'POST',headers:{authorization:token,'content-type':'application/json'},body:JSON.stringify({module:'trabalho',messages:[{role:'user',content:'Consultar soluções: erro login'}]})}),{request:async url=>{urls.push(String(url));if(String(url).includes('/auth/v1/user'))return Response.json({id});if(String(url).includes('/knowledge_sources?'))return Response.json([row]);throw Error('unexpected external call');},key:'test-key'});
 assert.equal(response.status,200);const result=await response.json();assert.equal(result.mode,'knowledge');assert.match(result.answer,/Conferir perfil/);assert.equal(urls.length,2);assert.ok(urls.every(url=>url.includes('.supabase.co/')));
});
test('concurrent edit that affects no row returns conflict rather than reporting save',async()=>{
 let calls=0;const response=await handleSolutions(new Request('https://app.test/api/solutions',{method:'POST',headers:{authorization:token,'content-type':'application/json'},body:JSON.stringify({...row})}),async()=>Response.json(++calls===1?{id}:[]));assert.equal(response.status,409);
});
