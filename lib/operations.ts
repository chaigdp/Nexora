import type {Project,Task} from './model';
export const modules=['Riscos e estratégias','Cronograma','Requisitos','Chamados','Processos','Entrada em operação','Integrações','Rentabilidade'];
export const recordKinds=['Requisito','Teste','Chamado','Processo','Parametrização','Prontidão','Risco','Melhoria'];
export type Operation={id:string;project:string;kind:string;title:string;owner:string;due:string;status:string;priority:string;detail:string;evidence:string;strategy:string;dependency:string;progress:number;updated:string};
export type Business={contact?:string;email?:string;phone?:string;taxId?:string;crm?:string;externalId?:string;revenue?:number;plannedHours?:number;actualHours?:number;hourCost?:number;success?:string;riskReason?:string;riskPlan?:string};
export type TaskDetail={description?:string;needs?:string;waitingOn?:string;status?:string;progress?:number;evidence?:string};
export function metadata<T>(s?:string):T {try{return JSON.parse(s||'{}')}catch{return {} as T}}
export function assess(p:Project,tasks:Task[],records:Operation[],today:string){
 const pending=tasks.filter(t=>t.project===p.id&&!t.done),items=records.filter(r=>r.project===p.id);const causes:{level:string;reason:string;action:string;exit:string}[]=[];
 if(p.phase!=='Concluída'&&p.due<today)causes.push({level:'Alto',reason:'Prazo da implantação vencido em '+p.due,action:'Replanejar com o cliente, priorizar o caminho crítico e registrar novo compromisso.',exit:'Cronograma aprovado e marcos vencidos resolvidos.'});
 const blocked=pending.filter(t=>t.blocked);if(blocked.length)causes.push({level:blocked.some(t=>t.critical)?'Alto':'Médio',reason:blocked.length+' entregas bloqueadas: '+blocked.map(t=>t.title).join(', '),action:'Acionar cada responsável e registrar insumo, prazo de retorno e alternativa.',exit:'Bloqueios removidos com evidências nas entregas.'});
 const late=pending.filter(t=>t.due<today);if(late.length)causes.push({level:late.some(t=>t.critical)?'Alto':'Médio',reason:late.length+' entregas atrasadas: '+late.map(t=>t.title).join(', '),action:'Negociar plano de recuperação, redistribuir trabalho e revisar dependências.',exit:'Entregas atrasadas concluídas ou prazo renegociado formalmente.'});
 const failed=items.filter(r=>r.kind==='Teste'&&r.status==='Reprovado');if(failed.length)causes.push({level:'Alto',reason:failed.length+' testes reprovados',action:'Abrir chamado, corrigir causa e repetir o teste com evidência.',exit:'Todos os testes críticos aprovados.'});
 const plans=items.filter(r=>r.kind==='Risco'&&!['Concluído','Aprovado'].includes(r.status));for(const plan of plans)causes.push({level:['Alta','Crítica'].includes(plan.priority)?'Alto':'Médio',reason:'Plano aberto: '+plan.title,action:plan.strategy||'Definir estratégia, responsável e prazo.',exit:'Resolver a causa e concluir o plano com evidência.'});
 const manual=metadata<Business>(p.metadata);if(manual.riskReason)causes.push({level:p.risk,reason:'Avaliação da analista: '+manual.riskReason,action:manual.riskPlan||'Definir plano de resposta com responsável e prazo.',exit:'Revisar evidência e registrar resolução.'});
 const level=causes.some(c=>c.level==='Alto')?'Alto':causes.some(c=>c.level==='Médio')?'Médio':'Baixo';return {level,causes,explanation:causes.length?'Regras sobre registros atuais; não é previsão estatística.':'Nenhum alerta pelas regras atuais. A ausência de registro não comprova prontidão.'};
}
export function readiness(p:Project,tasks:Task[],records:Operation[]){const own=records.filter(r=>r.project===p.id),critical=tasks.filter(t=>t.project===p.id&&t.critical&&!t.done);return [
 {name:'Entregas críticas resolvidas',ok:critical.length===0&&tasks.some(t=>t.project===p.id),reason:critical.length+' entregas críticas abertas'},
 {name:'Requisitos aprovados',ok:own.some(r=>r.kind==='Requisito')&&own.filter(r=>r.kind==='Requisito').every(r=>r.status==='Aprovado'),reason:'Registre e aprove os requisitos do escopo'},
 {name:'Testes aprovados com evidência',ok:own.some(r=>r.kind==='Teste')&&own.filter(r=>r.kind==='Teste').every(r=>r.status==='Aprovado'&&!!r.evidence),reason:'Registre resultado e evidência de cada teste'},
 {name:'Aceite do cliente e plano de retorno',ok:own.some(r=>r.kind==='Prontidão'&&r.status==='Aprovado'&&!!r.evidence&&!!r.strategy),reason:'Exige aceite, evidência e plano de retorno se houver falha'},
 {name:'Sem chamados críticos abertos',ok:!own.some(r=>r.kind==='Chamado'&&r.priority==='Crítica'&&!['Concluído','Aprovado'].includes(r.status)),reason:'Resolva os chamados que impedem a operação'}];}

