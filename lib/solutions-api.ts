import {caseIssue,solutionText,solutionSearch,type SolutionRecord,type ProblemCase} from './problem-solutions';
const SUPA=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL??'https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY=process.env.SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function findSolutions(question:string,headers:Record<string,string>,request:typeof fetch=fetch){
 const search=solutionSearch(question);if(!search)return [];
 const query=new URLSearchParams({select:'id,title,problem_case,updated_at,approved,archived',problem_case:'not.is.null',approved:'eq.true',archived:'eq.false','problem_case->>state':'eq.validated',search_vector:'wfts(portuguese).'+search,order:'updated_at.desc',limit:'5'});
 const response=await request(SUPA+'/rest/v1/knowledge_sources?'+query,{headers,cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Não foi possível consultar as soluções.');const rows=await response.json();if(!Array.isArray(rows))throw Error('Resposta inválida.');
 return (rows as SolutionRecord[]).filter(r=>r.approved&&!r.archived&&r.problem_case?.state==='validated'&&!caseIssue(r.problem_case));
}
export async function handleSolutions(req:Request,request:typeof fetch=fetch){
 if((req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')return reply({message:'Origem não autorizada.'},403);
 const authorization=req.headers.get('authorization')||'';if(!/^Bearer [A-Za-z0-9._-]{40,8192}$/.test(authorization))return reply({message:'Entre na sua conta.'},401);
 const headers={apikey:KEY,Authorization:authorization,'Content-Type':'application/json'};
 try{
  const auth=await request(SUPA+'/auth/v1/user',{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});const user=await auth.json() as {id?:string};if(!auth.ok||!user.id)return reply({message:'Sessão expirada. Entre novamente.'},401);
  if(req.method==='GET'){
   const url=new URL(req.url),q=(url.searchParams.get('q')||'').slice(0,2000);
   if(url.searchParams.get('recommend')==='true')return reply({items:await findSolutions(q,headers,request)});
   const offset=Number(url.searchParams.get('offset')||0);if(!Number.isSafeInteger(offset)||offset<0)return reply({message:'Página inválida.'},400);
   const params=new URLSearchParams({select:'id,title,problem_case,updated_at,approved,archived',problem_case:'not.is.null',archived:'eq.'+(url.searchParams.get('archived')==='true'),order:'created_at.desc,id.desc',limit:'51',offset:String(offset)});
   if(q.trim())params.set('search_vector','wfts(portuguese).'+q);
   const response=await request(SUPA+'/rest/v1/knowledge_sources?'+params,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();const rows=await response.json();if(!Array.isArray(rows))throw Error();return reply({items:rows.slice(0,50),more:rows.length>50});
  }
  if(req.method!=='POST')return reply({message:'Método não permitido.'},405);
  if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({message:'Envie JSON.'},415);
  let body:{id:string;title:string;problem_case:ProblemCase;updated_at?:string;archived?:boolean};
  try{const reader=req.body?.getReader();if(!reader)throw Error();let size=0,text='';const decoder=new TextDecoder();try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>100000){await reader.cancel();throw Error();}text+=decoder.decode(r.value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}body=JSON.parse(text);}catch{return reply({message:'Conteúdo inválido ou maior que 100 KB.'},400);}
  if(!body||!uuid.test(body.id)||typeof body.title!=='string'||!body.title.trim()||body.title.length>180||(body.updated_at!==undefined&&(typeof body.updated_at!=='string'||!Number.isFinite(Date.parse(body.updated_at))))||(body.archived!==undefined&&typeof body.archived!=='boolean'))return reply({message:'Título, identificador ou versão inválidos.'},400);
  const error=caseIssue(body.problem_case);if(error)return reply({message:error},400);
  const creating=!body.updated_at;
  const params=new URLSearchParams({id:'eq.'+body.id,updated_at:'eq.'+body.updated_at,problem_case:'not.is.null'});
  const row={title:body.title.trim(),problem_case:body.problem_case,content:solutionText(body.problem_case),approved:body.problem_case.state==='validated',status:'readable',archived:body.archived??false};
  const response=await request(SUPA+'/rest/v1/knowledge_sources'+(creating?'':'?'+params),{method:creating?'POST':'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(creating?{...row,id:body.id,kind:'text',user_id:user.id}:row),cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(response.status===409)return reply({message:'Registro já salvo. Atualize a lista antes de repetir.'},409);if(!response.ok)throw Error();const rows=await response.json() as SolutionRecord[];if(!rows[0])return reply({message:'O caso mudou ou não está disponível. Reabra antes de editar.'},409);return reply({item:rows[0]},creating?201:200);
 }catch{return reply({message:'Não foi possível confirmar a operação. Atualize a lista e tente novamente.'},503);}
}
