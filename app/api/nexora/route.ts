import { database } from '../../../db/raw';
import { sample } from '../../../lib/seed';
import { phases } from '../../../lib/model';
import { z } from 'zod';
const DEMO_HASH='0a59b3d6bd44192b9b819d493dbd2d77050f1a8f0c5a5d60ac5f1febc05c3cf9';
const enc=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(n=>n.toString(16).padStart(2,'0')).join('');
const digest=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function password(s:string,salt:string){const k=await crypto.subtle.importKey('raw',enc.encode(s),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},k,256));}
const reply=(value:unknown,status=200,cookie?:string)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(cookie?{'Set-Cookie':cookie}:{})}});
const cookie=(token:string,req:Request,age: number | null=null)=>`nexora_session=${token}; Path=/; HttpOnly; SameSite=Strict${age===null?'':`; Max-Age=${age}`}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
async function session(req:Request){const raw=req.headers.get('cookie')?.match(/(?:^|;\s*)nexora_session=([^;]+)/)?.[1];if(!raw||req.headers.get('X-Nexora-Access')!==raw)return null;return database().prepare('SELECT * FROM sessions WHERE token=? AND expires>?').bind(await digest(raw),Date.now()).first<{token:string;workspace:string;name:string;demo:number;expires:number}>();}
async function state(s:NonNullable<Awaited<ReturnType<typeof session>>>){const db=database();const [p,t,e]=await Promise.all([db.prepare('SELECT * FROM projects WHERE workspace=? ORDER BY due').bind(s.workspace).all(),db.prepare('SELECT * FROM tasks WHERE workspace=? ORDER BY due').bind(s.workspace).all(),db.prepare('SELECT * FROM events WHERE workspace=? ORDER BY created DESC LIMIT 100').bind(s.workspace).all()]);return {name:s.name,demo:!!s.demo,expires:s.expires,projects:p.results,tasks:t.results,events:e.results};}
const str=z.string().trim().min(1).max(200);const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s);
const projectSchema=z.object({id:z.string().uuid().optional(),client:str,segment:str,system:str,owner:str,phase:z.enum(phases as [string,...string[]]),start:date,due:date,completed:z.union([date,z.literal('')]).default(''),scope:z.string().max(4000),risk:z.enum(['Baixo','Médio','Alto'])}).refine(p=>p.due>=p.start,{message:'O prazo deve ser posterior ao início.'});
const taskSchema=z.object({id:z.string().uuid().optional(),project:z.string().uuid(),title:str,owner:str,due:date,done:z.number().int().min(0).max(1),critical:z.number().int().min(0).max(1),kind:z.enum(['Entrega','Pendência','Solicitação extra']),priority:z.enum(['Baixa','Normal','Alta']).default('Normal'),dependency:z.union([z.string().uuid(),z.literal('')]).default(''),blocked:z.number().int().min(0).max(1).default(0)});
export async function GET(req:Request){try{const s=await session(req);return s?reply(await state(s)):reply({error:'Entre para acessar sua carteira.'},401);}catch{console.error('Falha ao carregar carteira');return reply({error:'Banco indisponível. Tente novamente.'},503);}}
export async function POST(req:Request){try{
if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Origem inválida.'},403);
if(Number(req.headers.get('content-length')||0)>16000)return reply({error:'Solicitação muito grande.'},413);
const raw=await req.text();if(raw.length>16000)return reply({error:'Solicitação muito grande.'},413);const b=JSON.parse(raw);const db=database();
if(b.action==='login'||b.action==='register'){
 const bucket=await digest((req.headers.get('cf-connecting-ip')||'local')+':'+Math.floor(Date.now()/900000));
 const attempt=await db.prepare('INSERT INTO attempts(bucket,count) VALUES(?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket).first<{count:number}>();
 if((attempt?.count||0)>20)return reply({error:'Muitas tentativas. Aguarde 15 minutos.'},429);
 const input=z.object({email:z.string().email().max(200),password:z.string().min(10).max(128),name:str.optional()}).parse(b);let workspace='',name='',demo=0;
 if(input.email.toLowerCase()==='demo@nexora.app'){
 if(b.action!=='login'||await password(input.password,'nexora-demo-v1')!==DEMO_HASH)return reply({error:'Usuário ou senha incorretos.'},401);
 workspace=crypto.randomUUID();name='Visitante';demo=1;const seed=sample(workspace);const stmts: D1PreparedStatement[]=[];
 for(const p of seed.projects)stmts.push(db.prepare('INSERT INTO projects(id,workspace,client,segment,system,owner,phase,start,due,completed,scope,risk) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,workspace,p.client,p.segment,p.system,p.owner,p.phase,p.start,p.due,p.completed,p.scope,p.risk));
 for(const t of seed.tasks)stmts.push(db.prepare('INSERT INTO tasks(id,workspace,project,title,owner,due,done,critical,kind) VALUES(?,?,?,?,?,?,?,?,?)').bind(t.id,workspace,t.project,t.title,t.owner,t.due,t.done,t.critical,t.kind));
 for(let i=0;i<stmts.length;i+=80)await db.batch(stmts.slice(i,i+80));
 }else if(b.action==='register'){
 if(!input.name)return reply({error:'Informe seu nome.'},400);if(await db.prepare('SELECT id FROM users WHERE email=?').bind(input.email.toLowerCase()).first())return reply({error:'Não foi possível cadastrar esse e-mail. Tente entrar.'},409);
 const salt=crypto.randomUUID();workspace=crypto.randomUUID();name=input.name;await db.prepare('INSERT INTO users(id,email,name,password,salt,workspace) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),input.email.toLowerCase(),name,await password(input.password,salt),salt,workspace).run();
 }else{const u=await db.prepare('SELECT * FROM users WHERE email=?').bind(input.email.toLowerCase()).first<{password:string;salt:string;workspace:string;name:string}>();const hash=await password(input.password,u?.salt||'nonexistent');if(!u||u.password!==hash)return reply({error:'Usuário ou senha incorretos.'},401);workspace=u.workspace;name=u.name;}
 const token=crypto.randomUUID()+crypto.randomUUID();await db.prepare('INSERT INTO sessions(token,workspace,name,demo,expires) VALUES(?,?,?,?,?)').bind(await digest(token),workspace,name,demo,Date.now()+28800000).run();return reply({ok:true,access:token},200,cookie(token,req));
}
const s=await session(req);if(!s)return reply({error:'Sua sessão terminou. Entre novamente.'},401);
if(b.action==='logout'){await db.prepare('DELETE FROM sessions WHERE token=?').bind(s.token).run();return reply({ok:true},200,cookie('',req,0));}
const audit=(project:string,message:string)=>db.prepare('INSERT INTO events(id,workspace,project,message,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),s.workspace,project,message,new Date().toISOString());
if(b.action==='project.save'){
 const p=projectSchema.parse(b.project);const id=p.id||crypto.randomUUID();if(p.id&&!await db.prepare('SELECT id FROM projects WHERE id=? AND workspace=?').bind(id,s.workspace).first())return reply({error:'Implantação não encontrada.'},404);
 if(p.phase==='Concluída'){
 const pending=await db.prepare('SELECT COUNT(*) as n FROM tasks WHERE project=? AND workspace=? AND critical=1 AND done=0').bind(id,s.workspace).first<{n:number}>();if(pending?.n)return reply({error:'Resolva as entregas críticas antes de concluir.'},409);if(!p.completed)return reply({error:'Informe a data de conclusão.'},400);if(p.completed<p.start)return reply({error:'A conclusão deve ser posterior ao início.'},400);
 }else p.completed='';
 await db.batch([db.prepare('INSERT INTO projects(id,workspace,client,segment,system,owner,phase,start,due,completed,scope,risk) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET client=excluded.client,segment=excluded.segment,system=excluded.system,owner=excluded.owner,phase=excluded.phase,start=excluded.start,due=excluded.due,completed=excluded.completed,scope=excluded.scope,risk=excluded.risk WHERE projects.workspace=excluded.workspace').bind(id,s.workspace,p.client,p.segment,p.system,p.owner,p.phase,p.start,p.due,p.completed,p.scope,p.risk),audit(id,p.id?'Implantação atualizada: '+p.client:'Implantação criada: '+p.client)]);return reply({ok:true,id});
}
if(b.action==='task.save'){
 const t=taskSchema.parse(b.task);const project=await db.prepare('SELECT phase FROM projects WHERE id=? AND workspace=?').bind(t.project,s.workspace).first<{phase:string}>();if(!project)return reply({error:'Implantação não encontrada.'},404);if(project.phase==='Concluída'&&t.critical&&!t.done)return reply({error:'Reabra a implantação antes de adicionar uma entrega crítica pendente.'},409);
 if(t.dependency){if(t.dependency===t.id)return reply({error:'Uma entrega não pode depender dela mesma.'},400);const dependency=await db.prepare('SELECT done FROM tasks WHERE id=? AND workspace=? AND project=?').bind(t.dependency,s.workspace,t.project).first<{done:number}>();if(!dependency)return reply({error:'Dependência inválida.'},400);if(t.done&&!dependency.done)return reply({error:'Conclua primeiro a entrega da qual esta depende.'},409);}
 if(t.done&&t.blocked)return reply({error:'Remova o bloqueio antes de concluir a entrega.'},409);
 if(t.id&&!await db.prepare('SELECT id FROM tasks WHERE id=? AND workspace=? AND project=?').bind(t.id,s.workspace,t.project).first())return reply({error:'Entrega não encontrada.'},404);
 await db.batch([db.prepare('INSERT INTO tasks(id,workspace,project,title,owner,due,done,critical,kind,priority,dependency,blocked) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,owner=excluded.owner,due=excluded.due,done=excluded.done,critical=excluded.critical,kind=excluded.kind,priority=excluded.priority,dependency=excluded.dependency,blocked=excluded.blocked WHERE tasks.workspace=excluded.workspace AND tasks.project=excluded.project').bind(t.id||crypto.randomUUID(),s.workspace,t.project,t.title,t.owner,t.due,t.done,t.critical,t.kind,t.priority,t.dependency,t.blocked),audit(t.project,`${t.done?'Concluída':'Registrada'}: ${t.title}`)]);return reply({ok:true});
}
return reply({error:'Ação inválida.'},400);
}catch(e){if(e instanceof z.ZodError)return reply({error:e.issues[0]?.message||'Confira os campos.'},400);if(e instanceof SyntaxError)return reply({error:'Solicitação inválida.'},400);console.error('Falha na operação do Nexora');return reply({error:'Não foi possível salvar. Seus dados no formulário foram preservados.'},503);}}
