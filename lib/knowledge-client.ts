import type {KnowledgeSource} from './knowledge';
export const KNOWLEDGE_DATA_TIMEOUT=15000;
export const KNOWLEDGE_FILE_TIMEOUT=90000;
export function knowledgeRequestError(error:unknown){
 if(error instanceof Error&&['TimeoutError','AbortError'].includes(error.name))return 'O serviço de dados demorou a responder. O salvamento não foi confirmado. Seu conteúdo continua no campo; tente novamente quando a conexão voltar.';
 if(error instanceof TypeError)return 'Não foi possível conectar ao serviço de dados. Seu conteúdo continua no campo.';
 return error instanceof Error?error.message:'Não foi possível confirmar a operação.';
}
export async function requireKnowledgeResponse(response:Response){
 if(response.ok)return response;
 if([502,503,504].includes(response.status))throw Error('O serviço de dados está temporariamente indisponível. O salvamento não foi confirmado; mantenha seu conteúdo e tente novamente mais tarde.');
 if(response.status===401)throw Error('Sua sessão expirou. Copie ou baixe o rascunho antes de entrar novamente.');
 if(response.status===403)throw Error('Sua conta não recebeu permissão para esta operação. O conteúdo não foi descartado.');
 if(response.status===413)throw Error('O conteúdo ultrapassa o limite permitido. O rascunho foi mantido.');
 if(response.status===409)throw Error('Este registro já existe ou mudou. Atualize a lista antes de editar.');
 throw Error('Não foi possível confirmar a operação (código '+response.status+'). Seu conteúdo foi mantido.');
}
export type KnowledgeRequest=(path:string,init?:RequestInit)=>Promise<Response>;
// A retry uses the same client-generated ID. Ignore conflicts instead of
// overwriting an already committed record after a lost response.
export async function insertKnowledge(request:KnowledgeRequest,row:Record<string,unknown>){
 if(typeof row.id!=='string')throw Error('O envio precisa de um identificador.');
 const response=await request('/rest/v1/knowledge_sources?on_conflict=id',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},body:JSON.stringify(row)});
 const rows=await response.json() as KnowledgeSource[];
 if(!Array.isArray(rows))throw Error('Não foi possível confirmar o registro.');
 if(rows[0]?.id===row.id)return rows[0];
 const query=new URLSearchParams({select:'*',id:'eq.'+row.id,limit:'1'});
 const saved=await (await request('/rest/v1/knowledge_sources?'+query)).json() as KnowledgeSource[];
 if(!Array.isArray(saved)||saved[0]?.id!==row.id)throw Error('Não foi possível confirmar o registro. O rascunho foi mantido.');
 return saved[0];
}
export type KnowledgeDraft={tab:'text'|'link'|'file';title:string;text:string;url:string;submissionId:string;signature:string};
export function parseKnowledgeDraft(raw:string|null):KnowledgeDraft|null{
 if(!raw)return null;
 try{const d=JSON.parse(raw);if(!d||!['text','link','file'].includes(d.tab)||!['title','text','url','submissionId','signature'].every(k=>typeof d[k]==='string')||d.title.length>180||d.text.length>200000||d.url.length>4000||!/^([0-9a-f-]{36})?$/.test(d.submissionId))return null;return d;}catch{return null;}
}
