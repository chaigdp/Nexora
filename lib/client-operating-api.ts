import {PLAN_KEY,localDay,planIssue,planSchema,readPlan,stageActions,stages,transitionIssue,type OperatingProject} from './client-operating';
const SUPA=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL??'https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY=process.env.SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleOperatingSave(req:Request,request:typeof fetch=fetch){
 if(req.method!=='POST')return reply({message:'Método não permitido.'},405);
 if((req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')return reply({message:'Origem não autorizada.'},403);
 const auth=req.headers.get('authorization')||'';if(!/^Bearer [A-Za-z0-9._-]{40,8192}$/.test(auth))return reply({message:'Entre na sua conta.'},401);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({message:'Envie JSON.'},415);
 let body:{projectId:string;plan:unknown;updatedAt:string};
 try{const reader=req.body?.getReader();if(!reader)throw Error();let raw='',size=0;const decoder=new TextDecoder();try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>180000){await reader.cancel();throw Error();}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader.releaseLock();}body=JSON.parse(raw);if(!body||!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(body.projectId)||typeof body.updatedAt!=='string')throw Error();}catch{return reply({message:'Registro inválido ou maior que 180 KB.'},400);}
 const issue=planIssue(body.plan);if(issue)return reply({message:issue},400);const plan=planSchema.parse(body.plan);
 const headers={apikey:KEY,Authorization:auth,'Content-Type':'application/json'};
 try{
  const a=await request(SUPA+'/auth/v1/user',{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});const user=await a.json() as {id?:string};if(!a.ok||!user.id)return reply({message:'Sessão expirada. Entre novamente.'},401);
  const url=SUPA+'/rest/v1/projects?id=eq.'+body.projectId+'&user_id=eq.'+encodeURIComponent(user.id);
  const r=await request(url+'&select=*',{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const rows=await r.json();const project:OperatingProject=Array.isArray(rows)?rows[0]:null;if(!project)return reply({message:'Cliente não encontrado na sua carteira pessoal.'},404);
  const previous=readPlan(project);if(project.metadata?.[PLAN_KEY]&&!planSchema.safeParse(project.metadata[PLAN_KEY]).success)return reply({message:'Há um plano em formato desconhecido. Preserve os dados e solicite revisão.'},409);
  if(!project.updated_at||project.updated_at!==body.updatedAt||previous.revision!==plan.revision)return reply({message:'O cliente foi atualizado em outra sessão. Recarregue antes de salvar; seu rascunho foi preservado.'},409);
  const transition=transitionIssue(previous,plan);if(transition)return reply({message:transition},409);
  const changed=previous.stage!==plan.stage;
  const complete=plan.stage==='handoff'&&stageActions(plan,project.owner).every(a=>a.status==='done'&&a.evidence.trim());
  if(complete&&(!plan.csOwner.trim()||!plan.csAcceptance.trim()))return reply({message:'O encerramento exige responsável e aceite de CS.'},409);
  if((changed&&['activation','handoff'].includes(plan.stage))||complete){
   const checks=await Promise.all(['tasks?select=id&project_id=eq.'+body.projectId+'&done=eq.false&or=(critical.eq.true,blocked.eq.true)&limit=1','operations?select=id&project_id=eq.'+body.projectId+'&kind=eq.Chamado&priority=in.(Alta,Crítica)&status=not.in.(Concluído,Aprovado)&limit=1'].map(q=>request(SUPA+'/rest/v1/'+q,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)})));
   const results=await Promise.all(checks.map(async r=>{if(!r.ok)throw Error();const rows=await r.json();if(!Array.isArray(rows))throw Error();return rows;}));
   if(results.some(rows=>rows.length))return reply({message:'Resolva as pendências críticas ou bloqueadas e os chamados impeditivos antes de avançar.'},409);
  }
  const next={...plan,revision:previous.revision+1,history:changed?[...previous.history,{stage:previous.stage,date:localDay(),evidence:'Ações da etapa concluídas com evidências.'}].slice(-30):previous.history};
  const metadata={...project.metadata,[PLAN_KEY]:next};
  const reopened=previous.actions.some(a=>a.id.startsWith('handoff:')&&a.status==='done'&&plan.actions.find(x=>x.id===a.id)?.status!=='done');
  const phase=complete?'Concluída':next.stage==='handoff'?(reopened?'Acompanhamento':project.phase==='Concluída'?'Concluída':'Acompanhamento'):changed?stages.find(s=>s.key===next.stage)!.phase:project.phase;
  const saved=await request(url+'&updated_at=eq.'+encodeURIComponent(project.updated_at),{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({metadata,phase,...(complete?{completed_date:localDay()}:reopened?{completed_date:null}:{})}),cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!saved.ok)return reply({message:saved.status===403?'Seu perfil não permite editar este cliente.':'Não foi possível salvar. O rascunho foi preservado.'},saved.status===403?403:503);
  const result=await saved.json();if(!Array.isArray(result)||!result[0])return reply({message:'Conflito de atualização. Recarregue a carteira antes de salvar.'},409);
  return reply({project:result[0]});
 }catch{return reply({message:'Não foi possível confirmar o salvamento. Atualize a carteira antes de repetir.'},503);}
}
