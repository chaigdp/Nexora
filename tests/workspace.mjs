import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[a-z]+$/.test(s)?s+'.ts':s,c);}});
const {validateWork,prioritizeWork}=await import('../lib/workspace.ts');
const {handleWork}=await import('../lib/work-api.ts');
const item={id:'11111111-1111-4111-8111-111111111111',project_id:null,kind:'meeting',title:'Reunião de alinhamento',status:'Aberto',priority:'P2',due_date:null,data:{nextAction:'Validar escopo'},revision:0};
const token='x'.repeat(50);
const req=(body,headers={})=>new Request('https://vectta.test/api/work',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('completion requires evidence; invalid fields and impossible dates are rejected',()=>{
 assert.match(validateWork({...item,status:'Concluído'}),/evidência/);
 assert.match(validateWork({...item,due_date:'2026-02-30'}),/data/);
 assert.match(validateWork({...item,data:{admin:true}}),/inválidos/);
 assert.equal(validateWork({...item,status:'Concluído',data:{evidence:'Ata confirmada'}}),'');
});
test('incident and handoff have substantive completion gates',()=>{
 assert.match(validateWork({...item,kind:'incident',data:{}}),/impacto/);
 assert.match(validateWork({...item,kind:'handoff',status:'Concluído',data:{evidence:'Contrato'}}),/escopo/);
});
test('critical incident outranks overdue routine and completed items leave queue',()=>{
 const result=prioritizeWork([{...item,title:'Rotina',due_date:'2020-01-01'},{...item,title:'Crítico',priority:'P0'},{...item,title:'Feito',priority:'P0',status:'Concluído'}],'2026-10-18');
 assert.deepEqual(result.map(x=>x.item.title),['Crítico','Rotina']);
});
test('no authentication or cross-origin never reaches data',async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error();};
 assert.equal((await handleWork(req(item,{Authorization:''}),fetcher)).status,401);
 assert.equal((await handleWork(req(item,{Origin:'https://evil.test'}),fetcher)).status,403);assert.equal(calls,0);
});
test('server owns user identity and preserves optimistic version condition',async()=>{
 const calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return Response.json(url.includes('/auth/')?{id:'owner'}:[{...item,revision:2}]);};
 assert.equal((await handleWork(req({...item,user_id:'attacker'}),fetcher)).status,201);
 assert.equal(JSON.parse(calls[1].options.body).user_id,'owner');
 calls.length=0;assert.equal((await handleWork(req({...item,revision:1}),fetcher)).status,200);assert.match(calls[1].url,/revision=eq.1/);assert.equal(JSON.parse(calls[1].options.body).user_id,undefined);
});
test('inaccessible project and concurrent edit cannot report successful writes',async()=>{
 const fetcher=async(url)=>Response.json(url.includes('/auth/')?{id:'owner'}:[]);
 assert.equal((await handleWork(req({...item,project_id:item.id}),fetcher)).status,403);
 assert.equal((await handleWork(req({...item,revision:2}),fetcher)).status,409);
});
test('malformed content cannot reach persistence',async()=>{
 let writes=0;const fetcher=async(url)=>{if(!url.includes('/auth/'))writes++;return Response.json({id:'owner'});};
 for(const patch of [{data:{unexpected:'field'}},{title:42},{due_date:12},{due_date:''},{data:null}])assert.equal((await handleWork(req({...item,...patch}),fetcher)).status,400);assert.equal(writes,0);
});
