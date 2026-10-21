import type {WorkItem} from './workspace';
import {validDate} from './post-meeting';

export const goalFields:[string,string,string][]=[
 ['origin','Origem da meta','Empresa ou desenvolvimento pessoal'],
 ['indicator','Indicador ou critério de sucesso','O que será observado e como saberemos que a meta foi atingida?'],
 ['unit','Unidade de medida','Ex.: dias, %, clientes ou entregas'],
 ['baseline','Valor inicial','Número no início do período, sem separador de milhar'],
 ['target','Valor da meta','Número acordado com a liderança'],
 ['current','Valor atual','Último número medido, com fonte no campo Evidência'],
 ['periodStart','Início do período','AAAA-MM-DD'],
 ['measuredAt','Data da medição','AAAA-MM-DD'],
 ['action','Plano de ação','O que você fará para alcançar o resultado?'],
 ['owner','Responsável','Quem acompanha a meta com você?'],
 ['nextAction','Próxima ação','Qual é o próximo passo concreto?'],
 ['result','Resultado e avaliação','Conclusão observada e validação da liderança'],
 ['evidence','Fonte e evidência','Documento da empresa, relatório, período e referência da medição'],
 ['managerFeedback','Alinhamento com a liderança','Critério confirmado, dúvidas e ajustes combinados']
];
export const isGoal=(item:WorkItem)=>item.kind==='growth'&&item.data.goalType==='goal';
export function numberValue(value:string|undefined){if(!value?.trim()||!/^[-+]?\d+(?:[.,]\d+)?$/.test(value.trim()))return null;const n=Number(value.trim().replace(',','.'));return Number.isFinite(n)?n:null;}
export function validateGoal(item:WorkItem){
 for(const key of ['baseline','target','current'])if(item.data[key]?.trim()&&numberValue(item.data[key])===null)return 'Use números sem separador de milhar nos valores inicial, atual e meta.';
 for(const key of ['periodStart','measuredAt'])if(item.data[key]&&!validDate(item.data[key]))return 'Informe as datas da meta no formato AAAA-MM-DD.';
 if(item.data.periodStart&&item.due_date&&item.data.periodStart>item.due_date)return 'O prazo deve ser igual ou posterior ao início do período.';
 if(item.data.current?.trim()&&(!item.data.evidence?.trim()||!item.data.measuredAt))return 'O valor atual precisa de fonte e data da medição.';
 if(item.status==='Concluído'&&(!item.data.indicator?.trim()||!item.data.result?.trim()))return 'Registre o critério e o resultado observado antes de concluir a meta.';
 return '';
}
export function goalProgress(item:WorkItem){
 const start=numberValue(item.data.baseline),target=numberValue(item.data.target),current=numberValue(item.data.current);
 if(start===null||target===null||current===null||target===start)return null;
 const raw=Math.round((current-start)/(target-start)*100);
 return {raw,bar:Math.max(0,Math.min(100,raw)),formula:`(${current} − ${start}) ÷ (${target} − ${start}) × 100`,direction:target>start?'Aumentar':'Reduzir'};
}

function csvRows(text:string,delimiter:string){
 const rows:string[][]=[];let row:string[]=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
  else if(c===delimiter&&!quoted){row.push(value);value='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value='';}
  else value+=c;
 }
 if(quoted)throw Error('O CSV tem aspas sem fechamento. Revise o arquivo.');
 row.push(value);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function parseGoalFile(text:string,filename:string,makeId:()=>string):WorkItem[]{
 if(new TextEncoder().encode(text).length>100000)throw Error('Use um arquivo de até 100 KB.');
 const content=text.replace(/^\uFEFF/,'');
 const base=(title:string,data:Record<string,string>,due:string|null=null):WorkItem=>({id:makeId(),project_id:null,kind:'growth',title,status:'Aberto',priority:'P2',due_date:due,data:{goalType:'goal',origin:'Empresa',...data},revision:0});
 let result:WorkItem[];
 if(/\.txt$/i.test(filename))result=content.split(/\n+/).map(l=>l.trim()).filter(Boolean).map((line,i)=>base(line.slice(0,180),{indicator:line,evidence:`Arquivo ${filename}, linha ${i+1}. Confirmar critério com a liderança.`}));
 else if(/\.csv$/i.test(filename)){
  const headerLine=content.split(/\r?\n/)[0];
  const rows=csvRows(content,headerLine.includes(';')?';':',');
  const columns:Record<string,string>={titulo:'title',indicador:'indicator',unidade:'unit',inicial:'baseline',meta:'target',atual:'current',inicio:'periodStart',medicao:'measuredAt',prazo:'due',fonte:'evidence',responsavel:'owner',acao:'action'};
  const headers=(rows.shift()||[]).map(h=>h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
  if(!headers.includes('titulo')||headers.some(h=>!columns[h])||new Set(headers).size!==headers.length)throw Error('Use as colunas do modelo CSV, com titulo obrigatório e sem colunas repetidas.');
  result=rows.map((row,i)=>{
   if(row.length!==headers.length)throw Error(`Linha ${i+2}: a quantidade de colunas não corresponde ao cabeçalho.`);
   const values=Object.fromEntries(headers.map((h,index)=>[columns[h],row[index].trim()]));
   const {title,due,...data}=values;
   if(!title?.trim()||title.length>180||Object.values(data).some(v=>v.length>3000))throw Error(`Linha ${i+2}: revise o título e o tamanho dos textos.`);
   if(due&&!validDate(due))throw Error(`Linha ${i+2}: use AAAA-MM-DD no prazo.`);
   data.evidence=[data.evidence,`Importado de ${filename}, linha ${i+2}.`].filter(Boolean).join('\n');
   return base(title,data,due||null);
  });
 }else throw Error('Envie CSV ou TXT. Para planilhas Excel, exporte como CSV UTF-8.');
 if(!result.length||result.length>50)throw Error('O arquivo deve conter entre 1 e 50 metas.');
 if(result.some(i=>Object.values(i.data).some(v=>v.length>3000)))throw Error('Cada campo deve ter até 3.000 caracteres.');
 return result;
}
export function goalsEvidenceAnswer(items:WorkItem[]){
 const records=items.filter(i=>i.kind==='growth').slice(0,3);
 return records.length?records.map((i,index)=>{
  if(!isGoal(i))return `${index+1}. Contribuição: ${i.title} [${i.id}]\nQual fato sustenta essa sugestão? ${i.data.evidence||'Fonte ainda não registrada.'}\nProblema: ${i.data.baseline||'a confirmar'}\nAção: ${i.data.action||'a confirmar'}\nResultado: ${i.data.result||'a validar'}\nParticipação do time: ${i.data.team||'a registrar'}\nO que ainda falta saber? Validar atribuição, resultado e feedback da liderança.\nPróxima ação: ${i.data.nextAction||'Reunir as evidências e combinar o próximo passo.'}`;
  const p=goalProgress(i);return `${index+1}. ${i.title} [${i.id}]\nQual fato sustenta essa sugestão? ${i.data.evidence||'Fonte ainda não registrada.'}\nProgresso: ${p?p.raw+'% = '+p.formula:'sem base numérica suficiente'}; medição: ${i.data.measuredAt||'a confirmar'}.\nO que ainda falta saber? ${!i.data.indicator?'Confirmar critério de sucesso. ':''}${!i.data.owner?'Confirmar responsável. ':''}${!i.due_date?'Combinar prazo. ':''}Validar a medição e o aceite da liderança.\nPróxima ação: ${i.data.nextAction||i.data.action||'Alinhar critério e próxima ação com a liderança.'}`;
 }).join('\n\n')+'\n\nLeitura por regras dos registros disponíveis. Acompanhamento de metas não garante promoção.':'Ainda não há metas registradas neste recorte. Importe as metas da empresa ou cadastre uma meta pessoal. Falta confirmar critérios, período, fonte e responsáveis.';
}
