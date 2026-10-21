import type {WorkItem} from './workspace';

export const proposalKinds = {context:'Contexto',decision:'Decisão',action:'Próxima ação',blocker:'Bloqueio',question:'Falta saber',result:'Resultado relatado'} as const;
export type Proposal = {id:string;kind:keyof typeof proposalKinds;text:string;quote:string;owner:string;due:string|null;status:'open'|'blocked'|'done';completion:string};
export type MeetingReview = {version:1;reviewedAt:string;entries:Proposal[]};
export type WorkTask = {id:string;project_id?:string;title:string;done:boolean;blocked:boolean;critical?:boolean;owner?:string;due_date:string|null};
export type DayEntry = {id:string;title:string;source:string;sourceId:string;item?:WorkItem;task?:WorkTask;actionId?:string;reason:string;fact:string;missing:string[];next:string;owner:string;due:string|null;blocked:boolean;rank:number};
export const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;

// Local, literal extraction. A label is a suggestion until the user reviews it.
export function proposeNotes(notes:string):Proposal[]{
 return notes.split(/\n+/).map(line=>line.trim()).filter(Boolean).slice(0,24).map((quote,i)=>{
  const normalized=quote.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let kind:Proposal['kind']='context';
  if(/^(bloqueio|risco|impedimento)\s*:/.test(normalized))kind='blocker';
  else if(/^(duvida|pergunta|falta saber|pendente de confirmar)\s*:/.test(normalized)||quote.endsWith('?'))kind='question';
  else if(/^(decisao|decidido|aprovado)\s*:/.test(normalized))kind='decision';
  else if(/^(acao|proxima acao|combinado|compromisso)\s*:/.test(normalized))kind='action';
  else if(/^(resultado|primeiro valor|validacao)\s*:/.test(normalized))kind='result';
  const owner=quote.match(/(?:respons[aá]vel|dono)\s*:\s*([^|;]+)/i)?.[1]?.trim()||'';
  const date=quote.match(/prazo\s*:\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i)?.[1];
  const iso=date?.includes('/')?date.split('/').reverse().join('-'):date;
  return {id:'p'+(i+1),kind,text:quote.slice(0,1000),quote,owner:owner.slice(0,180),due:iso&&validDate(iso)?iso:null,status:kind==='blocker'?'blocked':'open',completion:''};
 });
}

export function validateReview(raw:string,notes:string):string {
 try{
  const review=JSON.parse(raw) as MeetingReview;
  if(review.version!==1||!Array.isArray(review.entries)||review.entries.length>24||!review.entries.length||typeof review.reviewedAt!=='string'||!Number.isFinite(Date.parse(review.reviewedAt)))return 'Revise as propostas antes de salvar.';
  const ids=new Set<string>();
  for(const p of review.entries){
   if(!p||typeof p.id!=='string'||!/^p\d{1,2}$/.test(p.id)||ids.has(p.id)||!Object.hasOwn(proposalKinds,p.kind))return 'Há uma proposta inválida ou repetida.';
   ids.add(p.id);
   if(typeof p.text!=='string'||!p.text.trim()||p.text.length>1000||typeof p.quote!=='string'||!p.quote.trim()||p.quote.length>1000||!notes.split(/\n+/).some(line=>line.trim()===p.quote))return 'Cada proposta precisa de um trecho literal das anotações de origem.';
   if(typeof p.owner!=='string'||p.owner.length>180||typeof p.completion!=='string'||p.completion.length>1000||!['open','blocked','done'].includes(p.status)||(p.due!==null&&(typeof p.due!=='string'||!validDate(p.due))))return 'Revise responsável, prazo e situação da proposta.';
   if(p.status==='done'&&!p.completion.trim())return 'Informe evidência de conclusão para o combinado.';
  }
  return '';
 }catch{return 'Não foi possível ler a revisão da reunião.';}
}
export function readReview(item:WorkItem):MeetingReview|null{
 const raw=item.data.review;
 if(item.kind!=='meeting'||!raw||validateReview(raw,item.data.notes||''))return null;
 return JSON.parse(raw) as MeetingReview;
}
export function missingFor(p:Proposal){
 const missing:string[]=[];
 if(['action','blocker'].includes(p.kind)){
  if(!p.owner.trim())missing.push('Responsável não informado');
  if(!p.due)missing.push('Prazo não combinado');
  if(p.status!=='done')missing.push('Evidência de conclusão ainda não registrada');
 }
 if(p.kind==='decision')missing.push('Confirmar autoridade e aceite da decisão');
 if(p.kind==='result')missing.push('Validar resultado com fonte, período e critério de sucesso');
 if(p.kind==='question')missing.push('Resposta ainda não registrada');
 return missing;
}
function rank(priority:string,due:string|null,blocked:boolean,today:string){return ({P0:1000,P1:300,P2:100,P3:0}[priority]??100)+(due&&due<today?80:0)+(blocked?40:0)+(due===today?20:0);}
function reason(priority:string,due:string|null,blocked:boolean,today:string){return priority==='P0'?'Impacto crítico informado':due&&due<today?'Prazo vencido':blocked?'Bloqueio registrado':due===today?'Prazo de hoje':'Próximo compromisso';}

export function dayEntries(items:WorkItem[],tasks:WorkTask[],today:string):DayEntry[]{
 const out:DayEntry[]=[];
 for(const item of items.filter(i=>i.kind!=='growth')){
  const review=readReview(item);
  if(review){
   for(const p of review.entries.filter(p=>['action','blocker'].includes(p.kind)&&p.status!=='done')){
    const blocked=p.status==='blocked';
    out.push({id:item.id+':'+p.id,title:p.text,source:item.title,sourceId:item.id,item,actionId:p.id,reason:reason(item.priority,p.due,blocked,today),fact:p.quote,missing:missingFor(p),next:p.text,owner:p.owner,due:p.due,blocked,rank:rank(item.priority,p.due,blocked,today)});
   }
  }else if(item.status!=='Concluído'){
   const blocked=item.status==='Aguardando';
   out.push({id:item.id,title:item.title,source:item.kind==='incident'?'Incidente':'Registro de trabalho',sourceId:item.id,item,reason:reason(item.priority,item.due_date,blocked,today),fact:'Prioridade '+item.priority+'; status '+item.status+'; prazo '+(item.due_date||'não informado')+'. '+(item.data.facts||item.data.evidence||item.data.nextAction||''),missing:[!item.data.owner&&'Responsável não informado',!item.due_date&&'Prazo não combinado',!item.data.evidence&&'Evidência ainda não registrada'].filter(Boolean) as string[],next:item.data.nextAction||'Definir a próxima ação',owner:item.data.owner||'',due:item.due_date,blocked,rank:rank(item.priority,item.due_date,blocked,today)});
  }
 }
 for(const task of tasks.filter(t=>!t.done)){
  const priority=task.critical?'P1':'P2';
  out.push({id:'task:'+task.id,title:task.title,source:'Pendência da carteira',sourceId:task.id,task,reason:reason(priority,task.due_date,task.blocked,today),fact:task.title+'; bloqueada: '+(task.blocked?'sim':'não')+'; prazo: '+(task.due_date||'não informado'),missing:[!task.owner&&'Responsável não informado',!task.due_date&&'Prazo não combinado'].filter(Boolean) as string[],next:task.blocked?'Confirmar a dependência e combinar o desbloqueio':'Executar e registrar a conclusão da pendência',owner:task.owner||'',due:task.due_date,blocked:task.blocked,rank:rank(priority,task.due_date,task.blocked,today)});
 }
 return out.sort((a,b)=>b.rank-a.rank||(a.due||'9999').localeCompare(b.due||'9999')||a.id.localeCompare(b.id));
}

export function workMetrics(items:WorkItem[],tasks:WorkTask[],today:string){
 const entries=dayEntries(items,tasks,today);
 const source=(e:DayEntry)=>({id:e.sourceId,title:e.title,item:e.item,task:e.task});
 return [
  {label:'Ações em aberto',formula:'Combinados e bloqueios revisados ainda abertos + outros registros abertos + pendências da carteira não concluídas.',sources:entries.map(source)},
  {label:'Bloqueios',formula:'Itens da fila em situação bloqueada ou registros aguardando uma dependência. Concluídos ficam fora.',sources:entries.filter(e=>e.blocked).map(source)},
  {label:'Prazos vencidos',formula:'Itens abertos com data anterior a '+today+' (horário de São Paulo). Sem prazo não conta como atraso.',sources:entries.filter(e=>e.due&&e.due<today).map(source)},
  {label:'Contribuições documentadas',formula:'Registros de contribuição com problema, ação, resultado, participação do time e referência de evidência preenchidos. Não é uma avaliação de desempenho.',sources:items.filter(i=>i.kind==='growth'&&['baseline','action','result','team','evidence'].every(k=>i.data[k]?.trim())).map(i=>({id:i.id,title:i.title,item:i,task:undefined}))}
 ];
}

export const csFields:[string,string,string][]=[
 ['scope','Contexto e escopo','Produtos e módulos contratados; referência do contrato'],
 ['success','Resultados e primeiro valor','Critério combinado, resultado observado e evidência; sem inferir adoção'],
 ['stakeholders','Pessoas e papéis','Decisor, usuário-chave e responsável de CS'],
 ['configuration','Configuração e validações','Política de viagens/despesas, centros de custo, aprovações, cadastros, integrações e testes'],
 ['dependencies','Pendências e bloqueios','Ação, responsável, prazo e dependência'],
 ['unknowns','O que ainda falta saber','Aceites, treinamento, primeiro uso e lacunas de configuração'],
 ['owner','Responsável em CS','Confirmar quem receberá o acompanhamento'],
 ['nextAction','Próximo contato','O que acontecerá após a passagem?'],
 ['acceptance','Aceite de CS','Quem confirmou o recebimento, quando e referência'],
 ['evidence','Origem do resumo','IDs e revisões dos registros que sustentam o conteúdo']
];
export function buildCSHandoff(projectId:string,items:WorkItem[],tasks:WorkTask[]):Record<string,string>{
 const related=items.filter(i=>i.project_id===projectId&&i.kind!=='growth'&&i.data.handoffType!=='cs');
 const meetings=related.flatMap(i=>(readReview(i)?.entries||[]).map(p=>({p,i})));
 const lines=(kind:Proposal['kind'])=>meetings.filter(x=>x.p.kind===kind).map(({p,i})=>`${p.text} [${i.id}/${p.id}]`).join('\n');
 const open=dayEntries(related,tasks.filter(t=>t.project_id===projectId),'0000-00-00');
 const commercial=related.filter(i=>i.kind==='handoff');
 return {handoffType:'cs',
  scope:[commercial.map(i=>`${i.data.scope||'Escopo não informado'} [${i.id}]`).join('\n')||'Escopo contratado a confirmar.',lines('context')].filter(Boolean).join('\n'),
  success:[...meetings.filter(x=>['action','blocker'].includes(x.p.kind)&&x.p.status==='done').map(({p,i})=>`Combinado concluído: ${p.text}. Evidência: ${p.completion} [${i.id}/${p.id}]`),...commercial.filter(i=>i.data.success).map(i=>`Critério: ${i.data.success} [${i.id}]`),...meetings.filter(x=>x.p.kind==='result').map(({p,i})=>`Resultado relatado, validar: ${p.text} [${i.id}/${p.id}]`),...related.filter(i=>i.kind==='growth'&&i.data.result).map(i=>`Contribuição registrada: ${i.data.result}. Evidência: ${i.data.evidence||'ausente'} [${i.id}]`)].join('\n')||'Primeiro valor e aceite ainda não documentados.',
  stakeholders:commercial.filter(i=>i.data.stakeholders).map(i=>`${i.data.stakeholders} [${i.id}]`).join('\n'),
  configuration:lines('decision')||'Validar política, centros de custo, aprovações, cadastros, integrações, treinamento e testes nos sistemas oficiais.',
  dependencies:open.map(e=>`${e.title} | ${e.owner||'Responsável a definir'} | ${e.due||'Prazo a combinar'} | ${e.blocked?'Bloqueado':'Aberto'} [${e.sourceId}${e.actionId?'/'+e.actionId:''}]`).join('\n')||'Nenhuma pendência encontrada neste recorte. Confirmar com as áreas envolvidas.',
  unknowns:[lines('question'),!commercial.length?'Passagem comercial não registrada.':'',...meetings.flatMap(({p,i})=>missingFor(p).map(m=>`${m} [${i.id}/${p.id}]`)),'Confirmar responsável de CS e aceite; revisar informações com o cliente.'].filter(Boolean).join('\n'),
  owner:'',nextAction:'Combinar a reunião de passagem com CS e validar as pendências.',acceptance:'',
  evidence:related.map(i=>`${i.title} [${i.id}] revisão ${i.revision} · atualizado ${i.updated_at||'sem data'}`).concat(tasks.filter(t=>t.project_id===projectId).map(t=>`Pendência: ${t.title} [${t.id}]`)).join('\n')||'Nenhuma fonte vinculada a este cliente.'};
}

export function workEvidenceAnswer(items:WorkItem[],tasks:WorkTask[],today:string,requestedId?:string){
 const selected=requestedId?items.find(i=>i.id===requestedId):null;
 if(requestedId&&!selected)return 'Não encontrei esse registro no contexto acessível. Falta confirmar o ID e o acesso ao cliente. Não há fato suficiente para uma sugestão específica.';
 const rows=dayEntries(selected?[selected]:items,selected?[]:tasks,today).slice(0,3);
 const review=selected&&readReview(selected);
 if(selected&&!rows.length)return `Registro: ${selected.title} [${selected.id}].\nQual fato sustenta essa sugestão?\n${review?review.entries.map(p=>`“${p.quote}” [${p.id}]`).join('\n'):selected.data.evidence||'Não há evidência registrada.'}\n\nO que ainda falta saber?\n${review?review.entries.flatMap(missingFor).join('; ')||'Confirmar se as informações continuam atuais.':'Validar o resultado e o próximo acompanhamento.'}\n\nPróximo passo sugerido: confirmar os pontos acima. Leitura por regras; não interpreta pedidos livres.`;
 return rows.length?'Prioridades sugeridas pelos registros:\n\n'+rows.map((e,i)=>`${i+1}. ${e.title}\nMotivo: ${e.reason}.\nQual fato sustenta essa sugestão? ${e.fact} [${e.sourceId}${e.actionId?'/'+e.actionId:''}]\nO que ainda falta saber? ${e.missing.join('; ')||'Confirmar se o contexto e a prioridade continuam atuais.'}\nPróxima ação: ${e.next}\nResponsável: ${e.owner||'a definir'} · Prazo: ${e.due||'a combinar'}`).join('\n\n')+'\n\nLeitura por regras sobre os registros disponíveis; não interpreta pedidos livres.':'Ainda não há registros para priorizar. Qual fato sustenta essa sugestão? Nenhum compromisso acessível. O que ainda falta saber? Escopo, primeiro valor, responsáveis, prazos e critérios da liderança. Comece registrando os combinados.';
}
