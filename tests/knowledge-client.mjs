import test from 'node:test';
import assert from 'node:assert/strict';
import {insertKnowledge,parseKnowledgeDraft,requireKnowledgeResponse,knowledgeRequestError,KNOWLEDGE_DATA_TIMEOUT} from '../lib/knowledge-client.ts';
test('lost save response can be retried with the same ID without overwriting or duplicating',async()=>{
 const row={id:'11111111-1111-4111-8111-111111111111',title:'Texto',kind:'text',content:'Preservar meu texto'};let stored=null,requests=0;
 const request=async(path,init)=>{requests++;if(init?.method==='POST'){const body=JSON.parse(init.body);assert.match(init.headers.Prefer,/resolution=ignore-duplicates/);if(!stored){stored=body;throw new DOMException('Lost response','TimeoutError');}assert.equal(body.id,stored.id);return Response.json([]);}assert.match(path,/id=eq/);return Response.json([stored]);};
 await assert.rejects(insertKnowledge(request,row),{name:'TimeoutError'});
 assert.deepEqual(await insertKnowledge(request,row),row);assert.equal(requests,3);
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
