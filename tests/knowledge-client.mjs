import test from 'node:test';
import assert from 'node:assert/strict';
import {insertKnowledge,parseKnowledgeDraft,requireKnowledgeResponse,knowledgeRequestError,KNOWLEDGE_DATA_TIMEOUT} from '../lib/knowledge-client.ts';
test('lost save response is confirmed by readback without duplicate writes',async()=>{
 const row={id:'11111111-1111-4111-8111-111111111111',title:'Texto',kind:'text',content:'Preservar meu texto'};
 let stored=null,posts=0,reads=0;
 const request=async(path,init)=>{
  if(init?.method==='POST'){
   posts++;
   const body=JSON.parse(init.body);
   assert.match(init.headers.Prefer,/resolution=ignore-duplicates/);
   if(!stored){stored=body;throw new DOMException('Lost response','TimeoutError');}
   return Response.json([]);
  }
  reads++;
  assert.match(path,/id=eq/);
  return Response.json([stored]);
 };
 assert.deepEqual(await insertKnowledge(request,row),row);
 assert.equal(posts,1);
 assert.equal(reads,1);
});
test('unconfirmed or malformed insert never reports success',async()=>{
 await assert.rejects(insertKnowledge(async()=>Response.json([]),{id:'11111111-1111-4111-8111-111111111111'}),/confirmar/);
 await assert.rejects(insertKnowledge(async()=>Response.json({}),{id:'11111111-1111-4111-8111-111111111111'}),/confirmar/);
});
test('gateway timeout has an actionable message and data waits are bounded',async()=>{
 await assert.rejects(requireKnowledgeResponse(new Response('',{status:504})),/temporariamente indisponível/);
 assert.match(knowledgeRequestError(new DOMException('timeout','TimeoutError')),/não foi confirmado/);
 assert.equal(KNOWLEDGE_DATA_TIMEOUT,15000);
});
test('draft restoration preserves exact text and retry identifier; broken drafts are rejected',()=>{
 const draft={tab:'text',title:'Estudo',text:'Texto\ncom acentuação.',url:'',submissionId:'11111111-1111-4111-8111-111111111111',signature:'original'};
 assert.deepEqual(parseKnowledgeDraft(JSON.stringify(draft)),draft);
 assert.equal(parseKnowledgeDraft('{broken'),null);assert.equal(parseKnowledgeDraft(JSON.stringify({...draft,text:5})),null);
});

test('transient 503 retries with the identical ID and confirms persisted content',async()=>{
 const row={id:'22222222-2222-4222-8222-222222222222',title:'Nota',kind:'text',content:'Persistir'};
 let posts=0;
 const request=async(path,init)=>{
  if(init?.method==='POST'){
   posts++;
   assert.equal(JSON.parse(init.body).id,row.id);
   if(posts===1)throw Error('O serviço de dados está temporariamente indisponível.');
   return Response.json([row]);
  }
  return Response.json([]);
 };
 assert.deepEqual(await insertKnowledge(request,row),row);
 assert.equal(posts,2);
});
test('permanent permission errors do not retry or claim a save',async()=>{
 let requests=0;
 await assert.rejects(insertKnowledge(async()=>{requests++;throw Error('Sua conta não recebeu permissão para esta operação.');},{id:'33333333-3333-4333-8333-333333333333'}),/permissão/);
 assert.equal(requests,1);
});
test('three unavailable attempts never claim a successful save',async()=>{
 let posts=0;
 await assert.rejects(insertKnowledge(async(path,init)=>{
  if(init?.method==='POST')posts++;
  throw Error('O serviço de dados está temporariamente indisponível.');
 },{id:'44444444-4444-4444-8444-444444444444'}),/indisponível/);
 assert.equal(posts,3);
});
