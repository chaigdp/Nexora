export const solutionFields=[
 ['problem','Problema e sintomas','O que aconteceu? Qual mensagem ou comportamento foi observado?'],
 ['context','Contexto e condições','Em que etapa, recurso ou configuração ocorreu?'],
 ['cause','Causa confirmada','Se ainda não foi confirmada, deixe em branco.'],
 ['attempts','Tentativas anteriores','O que foi tentado e não resolveu?'],
 ['solution','Como foi resolvido','Passo a passo executado, sem senhas ou dados sensíveis.'],
 ['result','Resultado observado','O que mudou depois da correção?'],
 ['evidence','Evidência e origem','Referência do chamado, teste ou confirmação que demonstra a resolução.'],
 ['limits','Quando não aplicar / quando escalar','Restrições e situações que exigem apoio da equipe.'],
 ['verifiedBy','Validado por','Nome ou papel de quem confirmou o resultado.'],
 ['verifiedAt','Data da validação','AAAA-MM-DD']
] as const;
export type ProblemCase={state:'investigating'|'resolved'|'validated';problem:string;context:string;cause:string;attempts:string;solution:string;result:string;evidence:string;limits:string;verifiedBy:string;verifiedAt:string};
export type SolutionRecord={id:string;title:string;problem_case:ProblemCase;updated_at:string;archived:boolean;approved:boolean};
export const caseStates={investigating:'Em análise',resolved:'Resolvido, aguardando validação',validated:'Solução validada'};
export function blankCase():ProblemCase{return {state:'investigating',...Object.fromEntries(solutionFields.map(([key])=>[key,'']))} as ProblemCase;}
export function caseIssue(value:unknown):string|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return 'Caso inválido.';
 const c=value as ProblemCase;if(!Object.hasOwn(caseStates,c.state))return 'Situação inválida.';
 for(const [key] of solutionFields)if(typeof c[key]!=='string'||c[key].length>3000)return 'Cada campo aceita até 3.000 caracteres.';
 if(!c.problem.trim())return 'Descreva o problema.';
 if(c.state!=='investigating'&&(!c.solution.trim()||!c.result.trim()))return 'Registre a solução e o resultado antes de marcar como resolvido.';
 if(c.verifiedAt&&(!/^\d{4}-\d{2}-\d{2}$/.test(c.verifiedAt)||!Number.isFinite(Date.parse(c.verifiedAt+'T12:00:00Z'))||new Date(c.verifiedAt+'T12:00:00Z').toISOString().slice(0,10)!==c.verifiedAt))return 'Informe uma data válida.';
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(c.verifiedAt>today)return 'A validação não pode ter data futura.';
 if(c.state==='validated'&&[c.context,c.evidence,c.limits,c.verifiedBy,c.verifiedAt].some(v=>!v.trim()))return 'Para validar, informe contexto, evidência, limites, responsável e data.';
 return null;
}
export function solutionText(c:ProblemCase){return solutionFields.filter(([key])=>c[key]).map(([key,label])=>label+':\n'+c[key]).join('\n\n');}
const stop=new Set('a o as os um uma uns umas de da do das dos e em no na nos nas para por com sem que qual quais como porque preciso precisa cliente clientes problema problemas caso casos solucao solucoes consultar ajuda fazer esta esse essa isso foi ser nao sim tarefa critica bloqueio atraso'.split(' '));
export function searchTerms(value:string){return [...new Set(value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]{3,40}/g)||[])].filter(w=>!stop.has(w)).slice(0,16);}
export function solutionSearch(value:string){return searchTerms(value).join(' OR ');}
export function solutionAnswer(rows:SolutionRecord[]){
 if(!rows.length)return 'Não encontrei uma solução validada com os termos informados. Isso não significa que não exista uma solução. Descreva a mensagem de erro, o recurso e a etapa envolvidos, ou registre o caso para investigação. Não vou inventar um procedimento.';
 return 'Encontrei referências por palavras em comum, não um diagnóstico confirmado. Confira se as condições são as mesmas antes de agir.\n\n'+rows.slice(0,3).map((r,i)=>`${i+1}. ${r.title}\nContexto: ${r.problem_case.context}\nSolução registrada: ${r.problem_case.solution}\nResultado: ${r.problem_case.result}\nLimites e escalonamento: ${r.problem_case.limits}\nEvidência: ${r.problem_case.evidence}\nValidado por ${r.problem_case.verifiedBy} em ${r.problem_case.verifiedAt}.\nFonte: caso ${r.id}`).join('\n\n');
}
export type CriticalSignal={id:string;label:string;text:string};
export function criticalSignals(tasks:{id:string;title:string;done:boolean;blocked?:boolean;critical?:boolean;due_date?:string|null;detail?:string}[],projects:{id:string;client:string;manual_risk_level?:string;phase?:string}[],today:string,plans:{id:string;client:string;actions:{id:string;title:string;status:string;due:string}[]}[]=[]):CriticalSignal[]{
 return [...plans.flatMap(p=>p.actions.filter(a=>a.status!=='done'&&(a.status==='blocked'||!!a.due&&a.due<today)).map(a=>({id:p.id+':'+a.id,label:a.status==='blocked'?'Ação bloqueada no plano':'Ação atrasada no plano',text:p.client+': '+a.title}))),...tasks.filter(t=>!t.done&&(t.blocked||t.critical||!!t.due_date&&t.due_date<today)).map(t=>({id:t.id,label:t.blocked?'Tarefa bloqueada':t.critical?'Tarefa crítica':'Tarefa atrasada',text:t.title+(t.detail?' · '+t.detail:'')})),...projects.filter(p=>p.manual_risk_level==='Alto'&&p.phase!=='Concluída').map(p=>({id:p.id,label:'Risco alto registrado',text:p.client}))];
}
