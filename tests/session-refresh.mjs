import test from 'node:test';
import assert from 'node:assert/strict';
import {needsRenewal,renewSession} from '../lib/session-refresh.ts';
const jwt=exp=>'header.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.signature';
const user={id:'owner'};
test('valid sessions do not refresh; exp is a scheduling hint only',async()=>{
 const session={access_token:jwt(Date.now()/1000+3600),refresh_token:'private',user};
 assert.equal(needsRenewal(session),false);
 assert.equal(await renewSession(session,'https://auth.test','key',async()=>{throw Error('must not fetch');}),session);
 assert.equal(needsRenewal({...session,access_token:'malformed'}),true);
});
test('expired sessions rotate tokens using the auth endpoint',async()=>{
 const session={access_token:jwt(1),refresh_token:'private',user};
 const next={access_token:jwt(Date.now()/1000+3600),refresh_token:'rotated',user};
 const result=await renewSession(session,'https://auth.test','key',async(url,init)=>{
  assert.equal(url,'https://auth.test/auth/v1/token?grant_type=refresh_token');
  assert.deepEqual(JSON.parse(init.body),{refresh_token:'private'});return Response.json(next);
 });assert.deepEqual(result,next);
});
test('failed refresh or changed identity is never accepted',async()=>{
 const session={access_token:jwt(1),refresh_token:'private',user};
 await assert.rejects(renewSession(session,'https://auth.test','key',async()=>Response.json({}, {status:401})));
 await assert.rejects(renewSession(session,'https://auth.test','key',async()=>Response.json({...session,user:{id:'other'}})));
 await assert.rejects(renewSession({...session,refresh_token:undefined},'https://auth.test','key'));
});
