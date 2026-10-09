export const HANDOFF = [
  {
    id: "modules",
    label: "Módulos contratados e número de caixas",
    required: true,
    hint: "Liste o escopo e a quantidade de caixas ou posições de atendimento.",
  },
  {
    id: "fiscal",
    label: "UF e documento fiscal (NFC-e ou SAT)",
    required: true,
    hint: "Registre a UF e o documento aplicável, validado com o contador.",
  },
  {
    id: "tax",
    label: "Regime tributário",
    required: true,
    hint: "Registre o regime informado pelo contador. A chAI não define tributação.",
  },
  {
    id: "accountant",
    label: "Contato do contador",
    required: true,
    hint: "Nome e canal profissional de contato.",
  },
  {
    id: "legacy",
    label: "Sistema antigo e como exporta os dados",
    required: true,
    hint: "Sistema de origem, formato de exportação e responsável pela extração.",
  },
  {
    id: "people",
    label: "Contato de quem decide e de quem opera",
    required: true,
    hint: "Identifique decisor, operador e usuário-chave.",
  },
  {
    id: "promise",
    label: "Data prometida, validada pela implantação",
    required: true,
    hint: "Registre data, disponibilidade da equipe e confirmação de quem implanta.",
  },
  {
    id: "certificate",
    label: "Certificado digital: tipo e validade",
    required: false,
    hint: "Registre tipo e vencimento. Nunca salve senha, chave privada ou certificado aqui.",
  },
  {
    id: "particularities",
    label: "Particularidades: controlados, balança, crediário",
    required: false,
    hint: "Inclua integrações, restrições e particularidades da operação.",
  },
  {
    id: "expectation",
    label: "A principal expectativa do dono, numa frase",
    required: false,
    hint: "Qual resultado concreto fará esta implantação valer a pena?",
  },
] as const;
export type HandoffId = (typeof HANDOFF)[number]["id"];
export const SECTIONS = [
  "passagem",
  "saude",
  "reversao",
  "treinamento",
  "mensagens",
  "indicadores",
  "rotina",
] as const;
export type Section = (typeof SECTIONS)[number];
export const SECTION_LABELS: Record<Section, string> = {
  passagem: "Passagem de bastão",
  saude: "Saúde e adoção",
  reversao: "Plano de 7 dias",
  treinamento: "Treinamento",
  mensagens: "Comunicação",
  indicadores: "Indicadores",
  rotina: "Rotina e saída",
};
export const CAUSES = [
  {
    id: "knowledge",
    title: "Não sabe",
    signal: "“Onde fica isso?”",
    action:
      "Treino curto, por função, com um caso do cliente. Ao final, a pessoa executa sozinha.",
  },
  {
    id: "value",
    title: "Não vê valor",
    signal: "“Para que vou lançar isso?”",
    action:
      "Demonstre um ganho usando os números do cliente: margem, perdas, tempo ou valores a receber.",
  },
  {
    id: "barrier",
    title: "Não consegue",
    signal: "Tenta e desiste",
    action:
      "Observe a tarefa e corrija o processo, equipamento ou defeito. Encaminhe a evidência à área responsável.",
  },
  {
    id: "time",
    title: "Não tem tempo",
    signal: "“Depois eu vejo”",
    action:
      "Simplifique a tarefa e combine uma rotina fixa, curta, com o usuário-chave.",
  },
] as const;
export type AdoptionCause = (typeof CAUSES)[number]["id"] | "";
export const METRIC_FIELDS = [
  ["salesUsage", "Vendas registradas no sistema (%)", 100],
  ["modulesActive", "Módulos em uso ativo", 10000],
  ["modulesContracted", "Módulos contratados", 10000],
  ["repeatedTickets", "Chamados repetidos no mês", 10000],
  ["ownerInactiveDays", "Dias desde o último relatório do decisor", 3650],
  ["hoursUsed", "Horas lançadas", 100000],
  ["hoursBudget", "Horas orçadas", 100000],
  ["importsRedone", "Importações refeitas", 100000],
  ["importsTotal", "Importações realizadas", 100000],
  ["fiscalRejected", "Notas rejeitadas", 1000000],
  ["fiscalTotal", "Notas transmitidas", 1000000],
  ["tickets30", "Chamados de 0 a 30 dias", 100000],
  ["tickets60", "Chamados de 31 a 60 dias", 100000],
  ["tickets90", "Chamados de 61 a 90 dias", 100000],
  ["csatTotal", "Soma das notas de satisfação (1 a 5)", 500000],
  ["csatResponses", "Respostas de satisfação", 100000],
  ["cancelled90", "Cancelados em 90 dias na coorte", 100000],
  ["cohortTotal", "Implantados na mesma coorte de 90 dias", 100000],
] as const;
export type MetricKey = (typeof METRIC_FIELDS)[number][0];
export type Metrics = Record<MetricKey, number | null>;
export type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  done: boolean;
  source: string;
};
export type Customer = {
  id: string;
  name: string;
  contact: string;
  analyst: string;
  stage: "Passagem" | "Implantação" | "Operação assistida" | "Concluído";
  contractDate: string;
  promisedDate: string;
  liveDate: string;
  acceptedAt: string;
  completedAt: string;
  handoff: Record<HandoffId, { checked: boolean; detail: string }>;
  metrics: Metrics;
  metricsDate: string;
  latePayment: boolean;
  postponements: number;
  championLeft: boolean;
  certificateDate: string;
  certificateRenewed: boolean;
  exportRequested: boolean;
  adoptionCause: AdoptionCause;
  recoveryCause: "produto" | "uso" | "preço" | "relação";
  recoveryStart: string;
  recoveryOwner: string;
  gains: string[];
  trainingDate: string;
  trainingRole: string;
  keyUser: string;
  trainingChecks: boolean[];
  exitChecks: boolean[];
  dossierNotes: string;
  tasks: Task[];
};
export type StrategyState = {
  version: 1;
  selectedId: string;
  customers: Customer[];
};
export const TRAINING_STEPS = [
  [
    "5 min",
    "Conectar ao trabalho",
    "Explique por que a tarefa importa para a rotina da pessoa.",
  ],
  [
    "10 min",
    "Demonstrar um caso",
    "Use um caso real do cliente em uma base de teste.",
  ],
  ["25 min", "Praticar", "A pessoa faz a tarefa com os dados de teste."],
  [
    "5 min",
    "Explicar de volta",
    "A pessoa executa sozinha e explica o que fez.",
  ],
  ["5 min", "Tirar dúvidas", "Entregue uma cola curta e combine o reforço."],
] as const;
export const EXIT_CHECKS = [
  "Critérios de saída cumpridos, com evidências",
  "Termo de aceite registrado",
  "Reunião de passagem com Suporte e Sucesso do Cliente realizada",
  "Dossiê revisado: configurações, contatos, riscos e módulos não adotados",
];
export const WEEKLY_RITUAL = [
  ["Segunda", "Revisar a carteira, os prazos e o semáforo de saúde."],
  [
    "Terça a quinta",
    "Executar, treinar e colocar em operação. Evitar dias de pico do cliente.",
  ],
  [
    "Sexta",
    "Atualizar o andamento, resolver impedimentos e preparar a próxima semana.",
  ],
  [
    "Semanal",
    "Conversa individual com a coordenação sobre risco, capacidade e apoio necessário.",
  ],
];
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function dateTime(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const value = Date.parse(`${date}T12:00:00Z`);
  return Number.isFinite(value) &&
    new Date(value).toISOString().slice(0, 10) === date
    ? value
    : null;
}
export function daysBetween(from: string, to: string): number | null {
  const a = dateTime(from),
    b = dateTime(to);
  return a === null || b === null ? null : Math.round((b - a) / 86400000);
}
export function plusDays(date: string, count: number) {
  const n = dateTime(date);
  return n === null
    ? ""
    : new Date(n + count * 86400000).toISOString().slice(0, 10);
}
export function formatDate(date: string) {
  return dateTime(date) === null
    ? "Não informada"
    : date.split("-").reverse().join("/");
}
export function blankCustomer(id: string, name: string): Customer {
  return {
    id,
    name,
    contact: "",
    analyst: "Chai",
    stage: "Passagem",
    contractDate: "",
    promisedDate: "",
    liveDate: "",
    acceptedAt: "",
    completedAt: "",
    handoff: Object.fromEntries(
      HANDOFF.map((item) => [item.id, { checked: false, detail: "" }]),
    ) as Customer["handoff"],
    metrics: Object.fromEntries(
      METRIC_FIELDS.map(([key]) => [key, null]),
    ) as Metrics,
    metricsDate: "",
    latePayment: false,
    postponements: 0,
    championLeft: false,
    certificateDate: "",
    certificateRenewed: false,
    exportRequested: false,
    adoptionCause: "",
    recoveryCause: "uso",
    recoveryStart: "",
    recoveryOwner: "",
    gains: ["", "", ""],
    trainingDate: "",
    trainingRole: "",
    keyUser: "",
    trainingChecks: [false, false, false, false, false],
    exitChecks: [false, false, false, false],
    dossierNotes: "",
    tasks: [],
  };
}
export function initialStrategy(): StrategyState {
  const first = blankCustomer("demo-aurora", "Farmácia Aurora");
  first.contact = "Mariana";
  first.contractDate = "2026-10-01";
  first.promisedDate = "2026-10-20";
  first.handoff.modules = {
    checked: true,
    detail: "Vendas, estoque, financeiro e compras. Dois caixas.",
  };
  first.handoff.people = {
    checked: true,
    detail: "Mariana: decisora. Lucas: operador e usuário-chave.",
  };
  first.handoff.expectation = {
    checked: true,
    detail: "Conferir o caixa e o estoque no mesmo lugar, sem retrabalho.",
  };
  const second = blankCustomer("demo-casa", "Casa & Ferragem");
  second.contact = "Rafael";
  second.stage = "Implantação";
  second.metrics = {
    ...second.metrics,
    salesUsage: 45,
    modulesActive: 1,
    modulesContracted: 4,
    repeatedTickets: 4,
    ownerInactiveDays: 18,
  };
  second.metricsDate = "2026-10-09";
  second.championLeft = true;
  second.adoptionCause = "barrier";
  const third = blankCustomer("demo-flor", "Floricultura Ipê");
  third.contact = "Camila";
  third.stage = "Operação assistida";
  third.contractDate = "2026-09-05";
  third.promisedDate = "2026-09-25";
  third.liveDate = "2026-09-25";
  third.metrics = {
    ...third.metrics,
    salesUsage: 95,
    modulesActive: 4,
    modulesContracted: 4,
    repeatedTickets: 0,
    ownerInactiveDays: 2,
  };
  third.metricsDate = "2026-10-09";
  return {
    version: 1,
    selectedId: first.id,
    customers: [first, second, third],
  };
}
export function missingHandoff(c: Customer) {
  return HANDOFF.filter(
    (i) =>
      i.required && !(c.handoff[i.id].checked && c.handoff[i.id].detail.trim()),
  );
}
export function acceptHandoff(c: Customer, date: string): Customer {
  return missingHandoff(c).length || !dateTime(date)
    ? c
    : { ...c, acceptedAt: date, stage: "Implantação" };
}
export function exitBlockers(c: Customer, today: string) {
  const days = daysBetween(c.liveDate, today);
  const missing: string[] = [];
  if (days === null || days < 15)
    missing.push(
      days === null
        ? "Registrar a data de entrada em operação"
        : `Completar 15 dias de operação assistida (${Math.max(0, days)} cumpridos)`,
    );
  EXIT_CHECKS.forEach((label, index) => {
    if (!c.exitChecks[index]) missing.push(label);
  });
  if (!c.dossierNotes.trim()) missing.push("Registrar o resumo do dossiê");
  return missing;
}
export function closeImplementation(c: Customer, today: string): Customer {
  return exitBlockers(c, today).length
    ? c
    : { ...c, stage: "Concluído", completedAt: today };
}
export function ratio(n: number | null, d: number | null): number | null {
  return n === null || d === null || d <= 0
    ? null
    : Math.round((n / d) * 1000) / 10;
}
export function metricErrors(c: Customer): string[] {
  const m = c.metrics;
  const out: string[] = [];
  for (const [num, den, name] of [
    ["modulesActive", "modulesContracted", "Módulos ativos"],
    ["importsRedone", "importsTotal", "Reimportações"],
    ["fiscalRejected", "fiscalTotal", "Rejeições"],
    ["cancelled90", "cohortTotal", "Cancelamentos"],
  ] as const) {
    if (m[num] !== null && m[den] !== null && m[num] > m[den])
      out.push(`${name}: o valor não pode superar o total.`);
  }
  if (
    m.csatResponses !== null &&
    m.csatTotal !== null &&
    (m.csatTotal < m.csatResponses || m.csatTotal > m.csatResponses * 5)
  )
    out.push("Satisfação: cada resposta deve ter uma nota entre 1 e 5.");
  if (
    c.liveDate &&
    c.contractDate &&
    (daysBetween(c.contractDate, c.liveDate) ?? 0) < 0
  )
    out.push("A entrada em operação não pode ser anterior ao contrato.");
  return out;
}
export type Recommendation = {
  id: string;
  title: string;
  why: string;
  action: string;
  section: Section;
  priority: "critical" | "high" | "medium" | "info";
  owner: string;
  days: number;
};
export function health(c: Customer, today: string) {
  const m = c.metrics;
  const adoption = ratio(m.modulesActive, m.modulesContracted);
  const drivers: string[] = [];
  const valid =
    [m.salesUsage, adoption, m.repeatedTickets, m.ownerInactiveDays].every(
      (n) => n !== null,
    ) && metricErrors(c).length === 0;
  let score: number | null = null;
  if (
    valid &&
    m.salesUsage !== null &&
    adoption !== null &&
    m.repeatedTickets !== null &&
    m.ownerInactiveDays !== null
  ) {
    score =
      100 -
      (100 - m.salesUsage) * 0.35 -
      (100 - adoption) * 0.25 -
      Math.min(20, m.repeatedTickets * 4) -
      Math.min(10, Math.max(0, m.ownerInactiveDays - 7));
    if (c.latePayment) score -= 10;
    if (c.postponements >= 2) score -= 10;
    if (c.championLeft) score -= 20;
    const untilExpiry = daysBetween(today, c.certificateDate);
    if (untilExpiry !== null && untilExpiry <= 15 && !c.certificateRenewed)
      score -= 10;
    if (c.exportRequested) score = Math.min(score, 39);
    score = Math.max(0, Math.min(100, Math.round(score)));
  }
  if (c.exportRequested)
    drivers.push(
      "Pedido de exportação: confirmar o motivo, sem presumir cancelamento.",
    );
  if (c.championLeft) drivers.push("Saída do defensor do sistema.");
  if (m.salesUsage !== null && m.salesUsage < 80)
    drivers.push(`Somente ${m.salesUsage}% das vendas no sistema.`);
  if (adoption !== null && adoption < 80)
    drivers.push(`Adoção de módulos em ${adoption}%.`);
  if (m.repeatedTickets !== null && m.repeatedTickets >= 2)
    drivers.push("Chamados com o mesmo motivo.");
  if (c.latePayment) drivers.push("Pagamento em atraso.");
  if (c.postponements >= 2)
    drivers.push("Entrada em operação adiada duas vezes ou mais.");
  const expiry = daysBetween(today, c.certificateDate);
  if (expiry !== null && expiry <= 15 && !c.certificateRenewed)
    drivers.push(
      "Certificado vencido ou a vencer em até 15 dias, sem renovação confirmada.",
    );
  return {
    score,
    adoption,
    drivers,
    label:
      score === null
        ? "Dados insuficientes"
        : score < 40
          ? "Crítico"
          : score < 60
            ? "Em risco"
            : score < 75
              ? "Atenção"
              : "Saudável",
    tone:
      score === null
        ? "info"
        : score < 60
          ? "danger"
          : score < 75
            ? "warn"
            : "good",
  };
}
export function recommendations(c: Customer, today: string): Recommendation[] {
  const out: Recommendation[] = [];
  const h = health(c, today);
  const missing = missingHandoff(c);
  const m = c.metrics;
  const add = (
    id: string,
    title: string,
    why: string,
    action: string,
    section: Section,
    priority: Recommendation["priority"],
    owner = c.analyst || "Responsável a definir",
    days = 0,
  ) => out.push({ id, title, why, action, section, priority, owner, days });
  if (c.exportRequested)
    add(
      "export",
      "Conversar com o decisor hoje",
      "Foi registrado um pedido de exportação de dados. É um sinal de investigação, não uma certeza de cancelamento.",
      "Pergunte o motivo e a expectativa não atendida. Classifique a causa antes de propor um plano de 7 dias.",
      "reversao",
      "critical",
    );
  const expiry = daysBetween(today, c.certificateDate);
  if (expiry !== null && expiry <= 15 && !c.certificateRenewed)
    add(
      "certificate",
      "Alinhar a renovação do certificado",
      "O vencimento está próximo ou já ocorreu.",
      "Confirme o responsável com o contador e valide a renovação antes de operar.",
      "mensagens",
      "high",
    );
  if (c.championLeft)
    add(
      "champion",
      "Reconstruir o apoio dentro do cliente",
      "Quem defendia o sistema saiu.",
      "Converse com o decisor, escolha outro usuário-chave e agende uma prática por função.",
      "treinamento",
      "high",
    );
  if (m.salesUsage !== null && m.salesUsage < 80)
    add(
      "sales",
      "Investigar o uso fora do sistema",
      `${m.salesUsage}% das vendas foram registradas no sistema.`,
      "Observe uma hora de pico: fila, lentidão, preço, cadastro ou processo. Registre a causa antes de recomendar treino.",
      "saude",
      "high",
    );
  if (missing.length && !c.acceptedAt)
    add(
      "handoff",
      `Completar ${missing.length} itens da passagem`,
      "A implantação precisa receber contexto validado.",
      "Registre os dados e confirme os itens obrigatórios antes de aceitar o cliente.",
      "passagem",
      "medium",
    );
  if (h.adoption !== null && h.adoption < 80)
    add(
      "adoption",
      "Mostrar valor em um módulo",
      `${h.adoption}% dos módulos contratados estão em uso.`,
      "Escolha um módulo de alto valor e crie uma rotina semanal com o usuário-chave. Investigue: não sabe, não vê valor, não consegue ou não tem tempo.",
      "saude",
      "medium",
    );
  if (m.repeatedTickets !== null && m.repeatedTickets >= 2)
    add(
      "repeat",
      "Resolver a causa dos chamados repetidos",
      `${m.repeatedTickets} chamados repetidos no mês.`,
      "Se for dúvida, faça um reforço de 20 minutos. Se for defeito, encaminhe a Produto com evidência e impacto.",
      "treinamento",
      "medium",
    );
  if (c.latePayment)
    add(
      "payment",
      "Entender o atraso no pagamento",
      "Foi sinalizado um pagamento atrasado.",
      "Alinhe com Financeiro e investigue o contexto. Não confunda dificuldade financeira com falta de valor.",
      "reversao",
      "medium",
    );
  const untilLaunch = daysBetween(today, c.promisedDate);
  if (!c.liveDate && untilLaunch !== null && untilLaunch < 0)
    add(
      "promise",
      "Recombinar uma data viável",
      "A data prometida passou e ainda não há entrada em operação registrada.",
      "Confira bloqueios e responsáveis. Alinhe o novo compromisso com o cliente e a implantação.",
      "rotina",
      "high",
    );
  if (
    !c.liveDate &&
    untilLaunch !== null &&
    untilLaunch >= 0 &&
    untilLaunch <= 1
  )
    add(
      "eve",
      "Preparar a entrada em operação",
      "A data prometida é hoje ou amanhã.",
      "Confira os critérios de liberação, horário de acompanhamento e procedimento para imprevistos. Revise a mensagem da véspera.",
      "mensagens",
      "high",
    );
  if (c.postponements >= 2)
    add(
      "delay",
      "Revalidar a data e os bloqueios",
      "A entrada em operação foi adiada pelo menos duas vezes.",
      "Liste impedimentos, responsáveis e critérios de liberação. Combine uma data viável fora do pico do cliente.",
      "rotina",
      "medium",
    );
  if (c.adoptionCause) {
    const cause = CAUSES.find((item) => item.id === c.adoptionCause);
    if (cause)
      add(
        "cause",
        `Adoção: ${cause.title.toLowerCase()}`,
        `Diagnóstico registrado: ${cause.signal}.`,
        cause.action,
        "saude",
        "medium",
      );
  }
  if (h.score === null)
    add(
      "metrics",
      "Completar a leitura da saúde",
      "Ainda faltam dados válidos para calcular a pontuação.",
      "Registre uso de vendas, módulos ativos e contratados, chamados repetidos e dias sem relatório do decisor.",
      "indicadores",
      "info",
    );
  const stale = daysBetween(c.metricsDate, today);
  if (stale !== null && stale > 7)
    add(
      "stale",
      "Atualizar os indicadores",
      `A última coleta foi há ${stale} dias.`,
      "Revise os sinais antes de usar a pontuação para priorizar a carteira.",
      "indicadores",
      "medium",
    );
  const overdue = c.tasks.filter((t) => !t.done && t.due && t.due < today);
  if (overdue.length)
    add(
      "overdue",
      "Retomar ações vencidas",
      `${overdue.length} ações abertas passaram do prazo.`,
      "Alinhe os responsáveis, o impedimento e uma nova data.",
      "reversao",
      "high",
    );
  if (c.liveDate && !c.completedAt)
    add(
      "exit",
      "Preparar a saída da implantação",
      `${Math.max(0, daysBetween(c.liveDate, today) ?? 0)} dias desde a entrada em operação.`,
      "Complete a operação assistida de 15 dias, os critérios de saída, o aceite, a reunião e o dossiê.",
      "rotina",
      "info",
    );
  if (!out.length)
    add(
      "stable",
      "Manter o acompanhamento",
      "Nenhum alerta foi identificado nos dados registrados.",
      "Revise a carteira na segunda, atualize a semana na sexta e confirme o valor percebido com o cliente.",
      "rotina",
      "info",
    );
  const rank = { critical: 0, high: 1, medium: 2, info: 3 };
  return out.sort((a, b) => rank[a.priority] - rank[b.priority]);
}
export function addTask(c: Customer, task: Task): Customer {
  return c.tasks.some((t) => t.id === task.id)
    ? c
    : { ...c, tasks: [...c.tasks, task] };
}
export function recoveryPlan(c: Customer): Customer {
  const gains = c.gains.map((s) => s.trim()).filter(Boolean);
  if (!dateTime(c.recoveryStart) || !c.recoveryOwner.trim() || gains.length < 2)
    return c;
  let result = c;
  const tasks = [
    {
      title: "Conversar com o decisor e registrar a expectativa não atendida",
      day: 0,
    },
    {
      title: `Classificar a causa (${c.recoveryCause}) e alinhar a área responsável`,
      day: 0,
    },
    ...gains.map((title, index) => ({ title, day: 2 + index * 2 })),
    {
      title: "Revisar resultados com o cliente e combinar próximos passos",
      day: 7,
    },
  ];
  for (const [index, t] of tasks.entries())
    result = addTask(result, {
      id: `recovery-${c.recoveryStart}-${index}`,
      title: t.title,
      owner: c.recoveryOwner,
      due: plusDays(c.recoveryStart, t.day),
      done: false,
      source: "Plano de 7 dias",
    });
  return result;
}
export function trainingFollowups(c: Customer): Customer {
  if (!dateTime(c.trainingDate) || !c.keyUser.trim() || !c.trainingRole.trim())
    return c;
  let result = c;
  for (const day of [7, 30])
    result = addTask(result, {
      id: `training-${c.trainingDate}-${day}-${c.trainingRole}`,
      title: `Reforço D+${day}: ${c.trainingRole}, guiado pelos chamados`,
      owner: c.keyUser,
      due: plusDays(c.trainingDate, day),
      done: false,
      source: "Treinamento",
    });
  return result;
}
export const MESSAGE_TEMPLATES = [
  {
    id: "kickoff",
    title: "Convite para reunião inicial",
    why: "Apresenta o responsável, define duração e reúne quem decide e quem opera.",
    text: "Oi, [Nome]! Sou [Seu nome], da [Empresa]. Vou acompanhar a implantação na [Loja] do começo ao fim.\n\nPara começar, preciso de 40 minutos com você e com quem vai usar o sistema no dia a dia. Vamos combinar datas, responsabilidades e o que precisamos da loja.\n\nPode ser [opção 1 de horário] ou [opção 2 de horário]?",
  },
  {
    id: "data",
    title: "Pedido de dados",
    why: "Organiza o pedido em três itens e define um prazo. Evita alterações manuais antes da conferência.",
    text: "[Nome], para trazer seus produtos para o sistema, preciso de 3 coisas até [data]:\n\n1. Contato de quem sabe exportar os dados do sistema antigo. Se necessário, combinamos um acesso autorizado pelo canal seguro.\n2. Lista dos clientes que compram a prazo, com os respectivos saldos.\n3. Contato do contador.\n\nNão precisa arrumar a planilha antes. Eu confiro e mostro o que encontrar. Envie os arquivos pelo canal seguro combinado.",
  },
  {
    id: "accountant",
    title: "Itens para o contador",
    why: "Diz qual é o cliente, a quantidade, o prazo e o próximo passo de validação.",
    text: "Olá, [Contador]. Sou [Seu nome], da [Empresa], e estou implantando o sistema na [Loja], cliente de vocês.\n\nIdentificamos [quantidade] produtos sem classificação fiscal validada. Vou compartilhar a lista pelo canal combinado. Consegue revisar até [data]? Precisamos dessa validação para reduzir o risco de rejeições na emissão.\n\nDepois, podemos reservar 15 minutos para validar a configuração por grupo de produto?",
  },
  {
    id: "launch",
    title: "Véspera da entrada em operação",
    why: "Explica o que muda, quando haverá acompanhamento e o caminho combinado para imprevistos.",
    text: "[Nome], nossa entrada em operação está combinada para [data]. Após validar os critérios de liberação, as vendas da [Loja] passam pelo sistema novo.\n\nVou acompanhar [na loja / on-line], das [início] às [fim]. Se algo travar, use [canal de suporte]. Para falha na emissão, siga o procedimento de contingência validado com a equipe.\n\nNo fim do dia, conferimos o primeiro fechamento com [Operador].",
  },
] as const;
export function messageFor(
  c: Customer,
  template: (typeof MESSAGE_TEMPLATES)[number],
) {
  return template.text
    .replaceAll("[Nome]", c.contact || "[Nome]")
    .replaceAll("[Loja]", c.name)
    .replaceAll("[Seu nome]", c.analyst || "[Seu nome]");
}
export function dossier(c: Customer, today: string) {
  const h = health(c, today);
  return `# Dossiê de passagem: ${c.name}\n\nGerado em ${formatDate(today)}. Registro da jornada no Vectta.\n\nResponsável: ${c.analyst || "A definir"}\nContato: ${c.contact || "A definir"}\nEtapa: ${c.stage}\nEntrada em operação: ${formatDate(c.liveDate)}\nSaúde: ${h.score ?? "Sem dados"} (${h.label})\n\n## Contexto\n${HANDOFF.map((i) => `- ${i.label}: ${c.handoff[i.id].detail || "Não informado"} (${c.handoff[i.id].checked ? "conferido" : "pendente"})`).join("\n")}\n\n## Particularidades e módulos não adotados\n${c.dossierNotes || "Não informado"}\n\n## Sinais a acompanhar\n${h.drivers.join("\n") || "Nenhum sinal identificado nos dados disponíveis."}\n\n## Ações\n${c.tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.title} | ${t.owner} | ${formatDate(t.due)}`).join("\n")}\n\n## Critérios de saída\n${EXIT_CHECKS.map((label, index) => `- [${c.exitChecks[index] ? "x" : " "}] ${label}`).join("\n")}\n`;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function restoreStrategy(raw: string): StrategyState | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !record(data) ||
      data.version !== 1 ||
      !Array.isArray(data.customers) ||
      !data.customers.length ||
      data.customers.length > 200
    )
      return null;
    const strings = [
      "id",
      "name",
      "contact",
      "analyst",
      "contractDate",
      "promisedDate",
      "liveDate",
      "acceptedAt",
      "completedAt",
      "metricsDate",
      "certificateDate",
      "recoveryStart",
      "recoveryOwner",
      "trainingDate",
      "trainingRole",
      "keyUser",
      "dossierNotes",
    ];
    const bools = [
      "latePayment",
      "championLeft",
      "certificateRenewed",
      "exportRequested",
    ];
    for (const c of data.customers) {
      if (
        !record(c) ||
        strings.some(
          (key) => typeof c[key] !== "string" || String(c[key]).length > 20000,
        ) ||
        bools.some((key) => typeof c[key] !== "boolean")
      )
        return null;
      if (
        ![
          "Passagem",
          "Implantação",
          "Operação assistida",
          "Concluído",
        ].includes(String(c.stage)) ||
        !["", "knowledge", "value", "barrier", "time"].includes(
          String(c.adoptionCause),
        ) ||
        !["produto", "uso", "preço", "relação"].includes(
          String(c.recoveryCause),
        )
      )
        return null;
      if (
        typeof c.postponements !== "number" ||
        !Number.isInteger(c.postponements) ||
        c.postponements < 0 ||
        c.postponements > 100
      )
        return null;
      if (!record(c.handoff) || !record(c.metrics)) return null;
      for (const item of HANDOFF) {
        const v = c.handoff[item.id];
        if (
          !record(v) ||
          typeof v.checked !== "boolean" ||
          typeof v.detail !== "string" ||
          v.detail.length > 2000
        )
          return null;
      }
      for (const [key, , max] of METRIC_FIELDS) {
        const v = c.metrics[key];
        if (
          v !== null &&
          (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max)
        )
          return null;
      }
      if (
        !Array.isArray(c.gains) ||
        c.gains.length !== 3 ||
        c.gains.some((v) => typeof v !== "string")
      )
        return null;
      if (
        !Array.isArray(c.trainingChecks) ||
        c.trainingChecks.length !== 5 ||
        c.trainingChecks.some((v) => typeof v !== "boolean")
      )
        return null;
      if (
        !Array.isArray(c.exitChecks) ||
        c.exitChecks.length !== 4 ||
        c.exitChecks.some((v) => typeof v !== "boolean")
      )
        return null;
      if (
        !Array.isArray(c.tasks) ||
        c.tasks.length > 1000 ||
        c.tasks.some(
          (t) =>
            !record(t) ||
            ["id", "title", "owner", "due", "source"].some(
              (key) => typeof t[key] !== "string",
            ) ||
            typeof t.done !== "boolean",
        )
      )
        return null;
    }
    const customers = data.customers as Customer[];
    if (
      new Set(customers.map((c) => c.id)).size !== customers.length ||
      customers.some((c) => !c.id || !c.name.trim())
    )
      return null;
    return {
      version: 1,
      customers,
      selectedId: customers.some((c) => c.id === data.selectedId)
        ? String(data.selectedId)
        : (customers[0]?.id ?? ""),
    };
  } catch {
    return null;
  }
}
export function advisorAnswer(
  c: Customer,
  question: string,
  today: string,
): { text: string; section: Section } {
  const q = question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const h = health(c, today);
  const recs = recommendations(c, today);
  if (/passagem|bastao|aceitar|obrigator/.test(q)) {
    const missing = missingHandoff(c);
    return {
      section: "passagem",
      text: missing.length
        ? `Para aceitar ${c.name}, faltam ${missing.length} itens obrigatórios: ${missing.map((i) => i.label).join("; ")}. Registre a evidência e marque a conferência. Assim a implantação recebe o contexto necessário.`
        : `Os sete itens obrigatórios de ${c.name} estão preenchidos e conferidos. ${c.acceptedAt ? "A passagem já foi aceita em " + formatDate(c.acceptedAt) + "." : "Você pode revisar e aceitar a passagem."}`,
    };
  }
  if (/mensage|comunica|contador|reuniao inicial|kickoff/.test(q))
    return {
      section: "mensagens",
      text: `Para ${c.name}, prepare uma mensagem com contexto, pedido objetivo, responsável e prazo. Há modelos para reunião inicial, coleta de dados, contador e véspera da operação. Revise os campos entre colchetes e a disponibilidade real antes de copiar. Nenhuma mensagem é enviada automaticamente.`,
    };
  if (/trein|capacita|ensinar/.test(q))
    return {
      section: "treinamento",
      text: `Em ${c.name}, organize o treinamento por função, com um usuário-chave. Use 50 minutos: 5 para valor, 10 de demonstração, 25 de prática, 5 para explicar de volta e 5 de dúvidas. A pessoa precisa executar sozinha. Agende reforços em 7 e 30 dias, guiados pelos chamados.`,
    };
  if (/saida|conclu|encerrar|suporte|dossie|assistida/.test(q)) {
    const b = exitBlockers(c, today);
    return {
      section: "rotina",
      text: b.length
        ? `Para concluir a implantação de ${c.name}, ainda é necessário: ${b.join("; ")}.`
        : `Os critérios registrados de ${c.name} permitem concluir a implantação. Revise o dossiê com Suporte e Sucesso do Cliente e confirme a conclusão.`,
    };
  }
  if (/revers|cancel|sete|7 dias/.test(q))
    return {
      section: "reversao",
      text: `Em ${c.name}, fale com quem decide e pergunte o que esperava que o sistema fizesse. Separe a causa entre produto, uso, preço ou relação. Defina de 2 a 3 ganhos visíveis, responsável e datas em 7 dias. Produto recebe defeitos com impacto; Comercial, preço; coordenação, relação. No dia 7, volte com resultados. Isso é uma proposta, sem garantia de reversão.`,
    };
  if (/metrica|indicador|calculo|calcula|pontuacao/.test(q))
    return {
      section: "indicadores",
      text: `A saúde de ${c.name} está ${h.score === null ? "sem pontuação por falta de dados válidos" : `em ${h.score}/100 (${h.label.toLowerCase()})`}. Uso de vendas e módulos, chamados repetidos, engajamento do decisor e sinais adicionais compõem uma regra ilustrativa. Nos indicadores, veja tempo até operar, prazo, horas, reimportações, rejeições, adoção, chamados, satisfação e cancelamento. Metas são exemplos para calibrar, não garantias.`,
    };
  if (/adoc|ades|engaj|nao usa|nao sabe|valor/.test(q)) {
    const cause = CAUSES.find((item) => item.id === c.adoptionCause);
    return {
      section: "saude",
      text: `${c.name}: ${h.adoption === null ? "a adoção ainda não foi medida" : `${h.adoption}% dos módulos estão ativos`}. ${cause ? `O diagnóstico registrado é “${cause.title}”. ${cause.action}` : "Investigue quatro causas: não sabe, não vê valor, não consegue ou não tem tempo. Cada uma exige uma intervenção diferente. Escolha um módulo de alto valor e combine uma rotina com o usuário-chave."}`,
    };
  }
  if (/prior|risco|saude|hoje|semana|ajud|^oi|^ola/.test(q)) {
    const top = recs[0];
    return {
      section: top?.section ?? "rotina",
      text: `${c.name}: ${h.score === null ? "a saúde ainda precisa de dados" : `saúde ${h.score}/100, ${h.label.toLowerCase()}`}. ${top ? `${top.title}. ${top.why} Próximo passo: ${top.action}` : ""} ${recs.length > 1 ? `Depois: ${recs[1]?.title}.` : ""}`,
    };
  }
  return {
    section: "saude",
    text: `Posso orientar a jornada de ${c.name} usando os registros disponíveis: passagem, saúde, adoção, reversão, treino, mensagens, indicadores e conclusão. Esta orientação usa regras locais. Para aprofundar, converse com a chAI. Experimente “O que priorizar hoje?” ou “Como melhorar a adoção?”.`,
  };
}
