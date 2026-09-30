// Teste do serviço com SQLite em memória, sem acessar dados de produção.
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('.'),out=resolve('.sites-runtime/auth-test');mkdirSync(out,{recursive:true});
for(const [source,target] of [['lib/model.ts','model.mjs'],['lib/seed.ts','seed.mjs'],['app/api/nexora/route.ts','route.mjs']]){
 let code=readFileSync(source,'utf8').replace("'../../../db/raw'","'./db.mjs'").replace("'../../../lib/seed'","'./seed.mjs'").replace("'../../../lib/model'","'./model.mjs'").replace("'./model'","'./model.mjs'").replace("'zod'",JSON.stringify(pathToFileURL(resolve('node_modules/zod/index.js')).href));
 writeFileSync(resolve(out,target),ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
writeFileSync(resolve(out,'db.mjs'),'export function database(){return globalThis.__testDb;}');
const db=new DatabaseSync(':memory:');for(const sql of ['drizzle/0000_calm_preak.sql','drizzle/0001_sharp_stick.sql'])db.exec(readFileSync(sql,'utf8'));
globalThis.__testDb={
 prepare(sql){
  return {bind(...args){
   return {async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);},execute(){return db.prepare(sql).run(...args);}};
  }};
 },
 async batch(items){db.exec('BEGIN');try{const r=items.map(x=>x.execute());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}
};
const {GET,POST}=await import(pathToFileURL(resolve(out,'route.mjs')).href);
const base='https://test.nexora.invalid';
const client=()=>({cookie:'',access:''});
async function call(c,data=null,status=200,proof=true){const req=new Request(base+'/api/nexora',{method:data?'POST':'GET',headers:{Origin:base,'Content-Type':'application/json',cookie:c.cookie,...(proof?{'X-Vectta-Access':c.access}:{})},...(data?{body:JSON.stringify(data)}:{})});const r=await(data?POST(req):GET(req));const result=await r.json();assert.equal(r.status,status,JSON.stringify(result));const cookie=r.headers.get('set-cookie');if(cookie){c.cookie=cookie.split(';')[0];if(data?.action==='login'||data?.action==='register')assert(!cookie.includes('Max-Age='),'Não deve persistir cookie de acesso');}if(result.access)c.access=result.access;return result;}
const a=client(),b=client();await call(a,null,401);
await call(a,{action:'login',email:'demo@nexora.app',password:'WrongPassword2026'},401);
for(const c of [a,b])await call(c,{action:'login',email:'demo@nexora.app',password:'VecttaDemo2026!'});
const sa=await call(a),sb=await call(b);assert.equal(sa.projects.length,30);assert.equal(sa.tasks.length,210);assert(!sb.projects.some(p=>p.id===sa.projects[0].id));
await call(a,null,401,false);await call(a,{action:'project.save',project:sa.projects[0]},401,false);
const p={...sa.projects[0],client:'Teste da abertura'};await call(a,{action:'project.save',project:p});assert.equal((await call(a)).projects.find(x=>x.id===p.id).client,p.client);await call(b,{action:'project.save',project:p},404);
const personal=client(),email='analista@example.com';await call(personal,{action:'register',email,name:'Analista',password:'PersonalTest2026!'});assert.equal((await call(personal)).projects.length,0);
const draft={client:'Minha implantação',segment:'Varejo',system:'ERP',owner:'Analista',phase:'Descoberta',start:'2026-09-01',due:'2026-10-30',completed:'',scope:'Escopo de teste',risk:'Baixo'};await call(personal,{action:'project.save',project:draft});
const sameCookie={cookie:personal.cookie,access:''};await call(sameCookie,null,401);
await call(personal,{action:'logout'});await call(personal,null,401);await call(personal,{action:'login',email,password:'PersonalTest2026!'});assert.equal((await call(personal)).projects.length,1);
console.log('PASS: credenciais obrigatórias, cookie sem entrada automática, leitura e escrita sem prova recusadas, dados pessoais preservados, logout e demonstrações isoladas.');
db.close();
