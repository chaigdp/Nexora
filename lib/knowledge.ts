export const KNOWLEDGE_BUCKET='chai-knowledge';
export const MAX_FILE_BYTES=20*1024*1024;
export const MAX_TEXT_CHARS=200000;
export type KnowledgeSource={problem_case?:import('./problem-solutions').ProblemCase|null;id:string;user_id:string;title:string;kind:'text'|'link'|'file';url:string|null;original_name:string|null;file_path:string|null;file_size:number;content:string;notes:string;status:'received'|'readable'|'failed';approved:boolean;archived:boolean;created_at:string;updated_at:string};
export const sourceStatus={received:'Aguardando leitura',readable:'Texto disponível',failed:'Envio incompleto'};
export function normalizeSourceUrl(input:string){
 const value=input.trim();if(!value)return null;
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error();return url.href;}catch{throw Error('Use um link completo começando com https:// ou http://.');}
}
export function isReadableTextFile(name:string){return /\.(txt|md|csv|json|log|srt|vtt)$/i.test(name);}
export function textFromBytes(bytes:Uint8Array){
 if(bytes.length>MAX_FILE_BYTES)throw Error('O arquivo ultrapassa 20 MB.');
 let value:string;
 try{value=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('Texto em outra codificação. O original será preservado para leitura posterior.');}
 if(value.includes('\u0000'))throw Error('O arquivo não contém texto simples legível.');
 if(value.length>MAX_TEXT_CHARS)throw Error('Texto maior que 200 mil caracteres. O original será preservado para leitura posterior.');
 return value;
}
