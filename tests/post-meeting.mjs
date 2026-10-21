import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&!/\.[a-z]+$/.test(s)?s+'.ts':s,c);}});
const {proposeNotes,readReview,dayEntries,workMetrics,buildCSHandoff,workEvidenceAnswer}=await import('../lib/post-meeting.ts');
const {validateWork}=await import('../lib/workspace.ts');
const {handleWork}=await import('../lib/work-api.ts');
const id='11111111-1111-4111-8111-111111111111',project='22222222-2222-4222-8222-222222222222';
const notes='Ação: validar política | Responsável: Chai | Prazo: 2026-10-26\nBloqueio: acesso pendente\nDúvida: quem aprova?\nResultado: primeiro uso relatado';
const entries=proposeNotes(notes);
const item={id,project_id:project,kind:'meeting',title:'Reunião',status:'Aberto',priority:'P2',due_date:null,data:{notes,review:JSON.stringify({version:1,reviewedAt:'2026-10-21T15:00:00Z',entries})},revision:1};
test('notes preserve exact evidence and never invent missing owner/date',()=>{
 assert.equal(entries[0].owner,'Chai');assert.equal(entries[0].due,'2026-10-26');
 assert.equal(entries[1].owner,'');assert.equal(entries[1].due,null);
 assert.deepEqual(entries.map(p=>p.kind),['action','blocker','question','result']);
 assert.equal(proposeNotes('Ação: testar amanhã')[0].due,null);
 assert.equal(proposeNotes('Ação: testar | Prazo: 2026-02-30')[0].due,null);
 assert.equal(validateWork(item),'');
});
test('unreviewed notes, forged sources, invalid dates and duplicate proposal IDs cannot save',()=>{
 assert.match(validateWork({...item,data:{notes}}),/revise/);
 for(const patch of [{quote:'Inventado'},{due:'2026-02-30'},{status:'done',completion:''}]){
  const data={...item.data,review:JSON.stringify({...readReview(item),entries:[{...entries[0],...patch}]})};
  assert.notEqual(validateWork({...item,data}),'');
 }
 assert.notEqual(validateWork({...item,data:{...item.data,review:JSON.stringify({...readReview(item),entries:[entries[0],entries[0]]})}}),'');
});
test('reviewed actions feed day, metrics and handoff once, with source IDs',()=>{
 assert.equal(dayEntries([item],[],'2026-10-27').length,2);
 const metrics=workMetrics([item],[],'2026-10-27');assert.equal(metrics[1].sources.length,1);assert.equal(metrics[2].sources.length,1);
 assert.equal(metrics[0].sources[0].id,id);
 const cs=buildCSHandoff(project,[item],[]);assert.match(cs.dependencies,/2026-10-26/);assert.match(cs.dependencies,/Responsável a definir/);assert.ok(cs.evidence.includes(id));assert.match(cs.unknowns,/quem aprova/);assert.equal(cs.acceptance,'');
 const answer=workEvidenceAnswer([item],[],'2026-10-27',id);assert.match(answer,/Qual fato sustenta/);assert.match(answer,/O que ainda falta saber/);assert.ok(answer.includes(id));
});
test('finishing an action removes it from priorities but retains original evidence',()=>{
 const completed={...item,data:{...item.data,review:JSON.stringify({...readReview(item),entries:entries.map(p=>['action','blocker'].includes(p.kind)?{...p,status:'done',completion:'Reteste confirmado em ata'}:p)})}};
 assert.equal(validateWork(completed),'');assert.equal(dayEntries([completed],[],'2026-10-27').length,0);assert.equal(readReview(completed).entries[0].quote,entries[0].quote);
 assert.match(validateWork({...item,status:'Concluído',data:{...item.data,evidence:'Ata'}}),/combinados/);
});
test('personal goals never enter client priorities or CS packs, and other clients stay out',()=>{
 const personal={...item,id:'goal',kind:'growth',data:{goalType:'goal',action:'PROMOÇÃO PRIVADA'}};
 const other={...item,id:'other',project_id:'another',title:'OUTRO CLIENTE'};
 assert.equal(dayEntries([personal],[],'2026-10-27').length,0);
 const cs=JSON.stringify(buildCSHandoff(project,[item,personal,other],[{id:'t',project_id:'another',title:'OUTRA TAREFA',done:false,blocked:true,due_date:null}]));
 assert.ok(!cs.includes('PROMOÇÃO PRIVADA'));assert.ok(!cs.includes('OUTRO CLIENTE'));assert.ok(!cs.includes('OUTRA TAREFA'));
});
test('review persists atomically through API; reload retains same actions; stale update conflicts',async()=>{
 let stored=null,writes=0;
 const request=async(url,options)=>{
  if(url.includes('/auth/'))return Response.json({id:'owner'});
  if(url.includes('/projects?'))return Response.json([{id:project}]);
  if(!options.method)return Response.json(stored?[stored]:[]);
  if(options.method==='PATCH'&&!url.includes('revision=eq.'+stored.revision))return Response.json([]);
  const body=JSON.parse(options.body);stored={...stored,...body,revision:(stored?.revision||0)+1};writes++;return Response.json([stored]);
 };
 const headers={Authorization:'Bearer '+'x'.repeat(50),'Content-Type':'application/json'};
 const post=body=>new Request('https://vectta.test/api/work',{method:'POST',headers,body:JSON.stringify(body)});
 assert.equal((await handleWork(post({...item,revision:0}),request)).status,201);
 const reloaded=await (await handleWork(new Request('https://vectta.test/api/work',{headers}),request)).json();
 assert.equal(readReview(reloaded.items[0]).entries.length,4);assert.equal(dayEntries(reloaded.items,[],'2026-10-27').length,2);
 assert.equal((await handleWork(post({...item,revision:1}),request)).status,200);
 assert.equal((await handleWork(post({...item,revision:1}),request)).status,409);assert.equal(writes,2);
 const forged={...item,data:{...item.data,review:JSON.stringify({...readReview(item),entries:[{...entries[0],quote:'invenção'}]})}};
 assert.equal((await handleWork(post(forged),request)).status,400);assert.equal(writes,2);
});
