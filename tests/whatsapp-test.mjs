import test from 'node:test';
import assert from 'node:assert/strict';
import {handleWhatsAppTest, validateTestMessage} from '../lib/whatsapp-test.ts';

const valid = {access_token:'test-secret-not-real',phone_number_id:'123456789',graph_version:'v23.0',recipient_phone:'+55 (31) 99999-9999',message_type:'template',recipient_confirmed:true};
const req = (body, headers = {}) => new Request('https://vectta.example/api/whatsapp-test', {method:'POST',headers:{'Content-Type':'application/json',Origin:'https://vectta.example',...headers},body:typeof body === 'string' ? body : JSON.stringify(body)});
const forbiddenFetch = () => {throw new Error('Unexpected external request');};

test('template and normalized recipient are sent exactly once', async () => {
  let calls = 0;
  const response = await handleWhatsAppTest(req(valid), async (url, options) => {
    calls++;
    assert.equal(url,'https://graph.facebook.com/v23.0/123456789/messages');
    assert.equal(options.headers.Authorization,'Bearer test-secret-not-real');
    assert.equal(options.redirect,'error');
    assert.deepEqual(JSON.parse(options.body),{messaging_product:'whatsapp',to:'5531999999999',type:'template',template:{name:'hello_world',language:{code:'en_US'}}});
    return Response.json({messages:[{id:'wamid.test123'}]});
  });
  const result = await response.json();
  assert.equal(calls,1);assert.equal(response.status,200);assert.equal(result.status,'accepted');
  assert.match(result.note,/ainda não foram confirmadas/);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.ok(!JSON.stringify(result).includes(valid.access_token));
});

test('personalized text preserves newlines and does not send a template', async () => {
  const body = {...valid,message_type:'text',text_body:'Olá, Chai!\nSeu teste chegou.',window_confirmed:true};
  const response = await handleWhatsAppTest(req(body),async (_,options) => {
    const payload=JSON.parse(options.body);
    assert.equal(payload.type,'text');assert.deepEqual(payload.text,{preview_url:false,body:body.text_body});
    assert.ok(!payload.template);return Response.json({messages:[{id:'wamid.text123'}]});
  });
  assert.equal(response.status,200);
});

test('rejects invalid fields before contacting Meta', async () => {
  const variants = [null,[],{...valid,phone_number_id:'../me'},{...valid,graph_version:'v23.0/../me'},
    {...valid,recipient_phone:'abc5531999999999'}, {...valid,recipient_phone:'5531999999999,5531888888888'},
    {...valid,recipient_phone:'123'}, {...valid,recipient_confirmed:false}, {...valid,recipient_confirmed:'true'},
    {...valid,access_token:'bad\ntoken'}, {...valid,message_type:'media'},
    {...valid,message_type:'text',text_body:'Olá',window_confirmed:false},
    {...valid,message_type:'text',text_body:' ',window_confirmed:true},
    {...valid,message_type:'text',text_body:'x'.repeat(4097),window_confirmed:true}];
  let calls=0;
  for(const body of variants){const r=await handleWhatsAppTest(req(body),async()=>{calls++;return Response.json({});});assert.equal(r.status,400);}
  assert.equal(calls,0);
  assert.doesNotThrow(()=>validateTestMessage({...valid,message_type:'text',text_body:'x'.repeat(4096),window_confirmed:true}));
});

test('rejects cross-origin requests and non-JSON bodies', async () => {
  for(const headers of [{Origin:'https://another.example'},{'sec-fetch-site':'cross-site'}]) {
    assert.equal((await handleWhatsAppTest(req(valid,headers),forbiddenFetch)).status,403);
  }
  assert.equal((await handleWhatsAppTest(req(valid,{'Content-Type':'text/plain'}),forbiddenFetch)).status,415);
  assert.equal((await handleWhatsAppTest(req('{broken'),forbiddenFetch)).status,400);
  assert.equal((await handleWhatsAppTest(req('x'.repeat(25*1024)),forbiddenFetch)).status,413);
});

test('explains Meta errors without exposing provider details or tokens', async () => {
  for(const [code,expected] of [[190,/token expirou/],[131030,/não está autorizado/],[131047,/janela de resposta/],[987654,/Meta recusou/]]) {
    const r=await handleWhatsAppTest(req(valid),async()=>Response.json({error:{code,message:valid.access_token,details:'private-details'}},{status:400}));
    assert.equal(r.status,400);const body=await r.json();assert.match(body.message,expected);assert.equal(body.code,code);
    assert.ok(!JSON.stringify(body).includes(valid.access_token));assert.ok(!JSON.stringify(body).includes('private-details'));
  }
});

test('uncertain provider outcomes never claim success or retry', async () => {
  for(const outcome of ['missing-id','bad-json','network']) {
    let calls=0;
    const r=await handleWhatsAppTest(req(valid),async()=>{calls++;if(outcome==='network')throw new Error('secret');if(outcome==='bad-json')return new Response('not JSON');return Response.json({messages:[]});});
    assert.equal(calls,1);assert.equal(r.status,502);const body=await r.json();assert.equal(body.error,'unconfirmed_result');assert.ok(!body.ok);assert.match(body.message,/evitar duplicidade/);
  }
});
