import {validateWork,type WorkItem} from './workspace';
const SUPA=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL??'https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY=process.env.SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleWork(req:Request,request:typeof fetch=fetch){
 if((req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')return reply({message:'Origem não autorizada.'},403);
 const auth=req.headers.get('authorization')||'';
 if(!/^Bearer [A-Za-z0-9._-]{40,8192}$/.test(auth))return reply({message:'Entre na sua conta para acessar seu espaço.'},401);
 const headers={apikey:KEY,Authorization:auth,'Content-Type':'application/json'};
 try{
  const u=await request(SUPA+'/auth/v1/user',{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});const user=await u.json() as {id?:string};
  if(!u.ok||!user.id)return reply({message:'Sessão expirada. Entre novamente.'},401);
  if(req.method==='GET'){
   const r=await request(SUPA+'/rest/v1/work_items?select=*&order=updated_at.desc&limit=1001',{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!r.ok)throw Error();const rows=await r.json();if(!Array.isArray(rows))throw Error();
   return reply({items:rows.slice(0,1000),limited:rows.length>=1000});
  }
  if(req.method!=='POST')return reply({message:'Método não permitido.'},405);
  if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({message:'Envie JSON.'},415);
  let item:WorkItem;
  try{
   const reader=req.body?.getReader();if(!reader)throw Error();let size=0,text='';const decoder=new TextDecoder();
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>45000){await reader.cancel();throw Error();}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
   item=JSON.parse(text);if(!item||typeof item!=='object')throw Error();
  }catch{return reply({message:'Registro inválido ou maior que 45 KB.'},400);}
  if(!uuid.test(item.id)||(item.project_id!==null&&!uuid.test(item.project_id))||!Number.isSafeInteger(item.revision)||item.revision<0)return reply({message:'Identificador ou versão inválidos.'},400);
  const error=validateWork(item);if(error)return reply({message:error},400);
  if(item.project_id){const p=await request(SUPA+'/rest/v1/projects?select=id&id=eq.'+item.project_id+'&user_id=eq.'+user.id,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});const rows=await p.json();if(!p.ok||!Array.isArray(rows)||!rows[0])return reply({message:'Cliente não disponível no seu espaço pessoal.'},403);}
  const body={project_id:item.project_id,kind:item.kind,title:item.title.trim(),status:item.status,priority:item.priority,due_date:item.due_date,data:item.data};
  const creating=item.revision===0;
  const url=SUPA+'/rest/v1/work_items'+(creating?'':'?id=eq.'+item.id+'&revision=eq.'+item.revision);
  const r=await request(url,{method:creating?'POST':'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(creating?{...body,id:item.id,user_id:user.id}:body),cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(r.status===409)return reply({message:'Este registro já existe. Atualize a lista antes de tentar novamente.'},409);
  if(!r.ok)throw Error();const rows=await r.json();
  if(!Array.isArray(rows)||!rows[0])return reply({message:'O registro mudou em outra sessão. Copie suas alterações e recarregue a lista antes de editar.'},409);
  return reply({item:rows[0]},creating?201:200);
 }catch{return reply({message:'Não foi possível confirmar a operação. Atualize a lista antes de repetir um salvamento.'},503);}
}
