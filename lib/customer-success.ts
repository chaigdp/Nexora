export type CSProject = {id:string;client:string;owner:string;phase:string;due_date:string|null;manual_risk_level:string|null;segment?:string};
export type CSTask = {id:string;project_id:string;done:boolean;critical:boolean;blocked:boolean;due_date:string|null;title:string};
export type CSFeedback = {id:string;project_id:string;csat:number|null;nps:number|null;ces:number|null;comment:string;created_at:string};
export type CSOperation = {id:string;project_id:string;kind:string;title:string;owner:string;due_date:string|null;status:string;priority:string;detail:string;evidence:string;strategy:string;progress:number;dependency?:string;updated_at?:string};
export type CSData = {projects:CSProject[];tasks:CSTask[];feedbacks:CSFeedback[];operations:CSOperation[]};
export const csCategories = ['Acompanhamento','Atrito','Reversão','Adoção','Expansão'] as const;
export const csStatuses = ['Aberto','Em andamento','Resolvido','Concluído'] as const;
export const closed = (status:string) => ['Resolvido','Concluído','Aprovado'].includes(status);
export const isCSPlan = (op:CSOperation) => op.dependency?.startsWith('CS:') === true;
export const csCategory = (op:CSOperation) => op.dependency?.slice(3) || 'Acompanhamento';
export const csToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

export function assessCS(project:CSProject,data:CSData,date=csToday()) {
  const tasks=data.tasks.filter(t=>t.project_id===project.id), ops=data.operations.filter(o=>o.project_id===project.id);
  const feedbacks=data.feedbacks.filter(f=>f.project_id===project.id&&Number.isFinite(Date.parse(f.created_at))).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  const latest=feedbacks[0];
  const feedbackAge=latest?Math.floor((Date.parse(date+'T23:59:59Z')-Date.parse(latest.created_at))/86400000):null;
  const recent=latest&&feedbackAge!==null&&feedbackAge>=0&&feedbackAge<=90?latest:null;
  const plans=ops.filter(isCSPlan),openPlans=plans.filter(o=>!closed(o.status));
  const signals:{reason:string;points:number;source:string}[]=[];
  const add=(condition:boolean,reason:string,points:number,source:string)=>{if(condition)signals.push({reason,points,source});};
  add(project.manual_risk_level==='Alto','Risco alto registrado pela analista',30,'Cadastro');
  add(project.manual_risk_level==='Médio','Risco médio registrado pela analista',15,'Cadastro');
  add(project.phase!=='Concluída'&&!!project.due_date&&project.due_date<date,'Prazo da implantação vencido',20,'Implantação');
  add(tasks.some(t=>!t.done&&t.blocked),'Há entregas bloqueadas',20,'Entregas');
  const late=tasks.filter(t=>!t.done&&t.due_date&&t.due_date<date);
  add(late.length>0,late.some(t=>t.critical)?'Há entrega crítica atrasada':'Há entrega atrasada',late.some(t=>t.critical)?20:10,'Entregas');
  add(ops.some(o=>o.kind==='Teste'&&o.status==='Reprovado'),'Há teste reprovado',20,'Testes');
  const dissatisfied=!!recent&&((recent.csat!==null&&recent.csat<=2)||(recent.nps!==null&&recent.nps<=6));
  add(dissatisfied,'Avaliação recente com satisfação baixa ou nota de recomendação até 6',25,'Última avaliação, até 90 dias');
  add(!dissatisfied&&!!recent&&((recent.csat!==null&&recent.csat===3)||(recent.nps!==null&&recent.nps<=8)),'Avaliação recente pede atenção',10,'Última avaliação, até 90 dias');
  add(openPlans.some(o=>csCategory(o)==='Reversão'),'Plano de reversão em aberto',40,'Acompanhamento de CS');
  add(openPlans.some(o=>csCategory(o)==='Atrito'),'Atrito em acompanhamento',20,'Acompanhamento de CS');
  add(openPlans.some(o=>!!o.due_date&&o.due_date<date),'Próximo contato de CS está atrasado',10,'Acompanhamento de CS');
  const hasEvidence=tasks.length>0||!!recent||ops.length>0||signals.length>0;
  const score=hasEvidence?Math.max(0,100-signals.reduce((sum,s)=>sum+s.points,0)):null;
  const level=score===null?'Sem dados':score<50?'Crítico':score<80?'Atenção':'Estável';
  const gaps:string[]=[];
  if(!recent)gaps.push(latest?'Avaliação do cliente desatualizada':'Sem avaliação recente do cliente');
  if(!tasks.length)gaps.push('Sem entregas registradas');
  if(!plans.length)gaps.push('Sem acompanhamento de CS registrado');
  const nextAction=openPlans.some(o=>csCategory(o)==='Reversão')?'Ouvir o motivo de saída, confirmar o que ainda pode ser recuperado e pactuar um retorno sem prometer descontos ou resultados.'
    :signals.some(s=>s.source==='Entregas'||s.source==='Implantação')?'Confirmar o impacto do atraso, definir um responsável pelo desbloqueio e combinar uma data realista com o cliente.'
    :dissatisfied?'Fazer contato de escuta, registrar a causa do atrito e pactuar uma ação com prazo e critério de recuperação.'
    :!recent?'Fazer um contato de acompanhamento para validar valor percebido, dificuldades e o próximo resultado esperado.'
    :'Revisar o valor entregue, confirmar adoção e combinar o próximo objetivo com o cliente.';
  return {project,score,level,signals,gaps,latest,openPlans,plans,nextAction};
}

export function portfolioCS(data:CSData,date=csToday()) {
  const rank:Record<string,number>={'Crítico':0,'Atenção':1,'Sem dados':2,'Estável':3};
  return data.projects.map(p=>assessCS(p,data,date)).sort((a,b)=>rank[a.level]-rank[b.level]||(a.score??101)-(b.score??101)||a.project.client.localeCompare(b.project.client));
}

export function ruleBasedCSReply(question:string,data:CSData,projectId:string) {
  const all=portfolioCS(data), items=projectId?all.filter(i=>i.project.id===projectId):all;
  if(!items.length)return 'Ainda não há clientes nesse contexto. Cadastre uma implantação para começar o acompanhamento.';
  const target=items[0];
  if(/mensagem|responder|dizer|falar/i.test(question))return `Sugestão de abordagem para ${target.project.client}:\n\n“Olá! Quero entender como está sua experiência e o que mais precisa da nossa atenção. Podemos conversar sobre o impacto da situação e combinar o próximo passo, com responsável e prazo?”\n\nAntes de enviar, ajuste o texto com os fatos confirmados. Esta sugestão não foi enviada ao cliente.`;
  if(/revers|cancel|atrito/i.test(question))return `Para trabalhar a reversão de ${target.project.client}:\n\n1. Confirme o motivo de saída com escuta aberta, sem presumir a causa.\n2. Separe o que já está registrado do que precisa ser validado.\n3. Proponha uma ação viável, responsável e próximo contato.\n4. Registre o que o cliente considera uma recuperação satisfatória.\n5. Só conclua o plano depois de registrar a evidência do resultado.\n\nSinal atual: ${target.signals.map(s=>s.reason).join('; ')||'nenhum alerta nas regras atuais; valide a percepção do cliente'}.`;
  return `${projectId?'Leitura do cliente':'Prioridades da carteira'}:\n\n${items.slice(0,3).map(i=>`${i.project.client}: ${i.level}${i.score!==null?' ('+i.score+'/100)':''}.\nMotivos: ${i.signals.map(s=>s.reason).join('; ')||'sem alertas identificados nos registros disponíveis'}.\nPróximo passo: ${i.nextAction}`).join('\n\n')}\n\nInformação a completar: ${target.gaps.join('; ')||'valide com o cliente se a percepção acompanha os registros'}.`;
}
