import {
  blankCustomer,
  restoreStrategy,
  missingHandoff,
  exitBlockers,
  dateTime,
  health,
  recommendations,
} from "./implantation-strategy";
import type { Customer } from "./implantation-strategy";

export type JourneyProject = {
  id: string;
  client: string;
  owner: string;
  contact_name?: string;
  scope?: string;
  metadata?: Record<string, unknown> & {
    implantation_journey_v1?: { revision?: unknown; customer?: unknown };
  };
  updated_at?: string;
};
export const JOURNEY_KEY = "implantation_journey_v1";
export function parseJourney(value: unknown): Customer | null {
  const restored = restoreStrategy(
    JSON.stringify({ version: 1, selectedId: "", customers: [value] }),
  );
  if (!restored) return null;
  const c = restored.customers[0];
  const dates = [
    c.contractDate,
    c.promisedDate,
    c.liveDate,
    c.acceptedAt,
    c.completedAt,
    c.metricsDate,
    c.certificateDate,
    c.recoveryStart,
    c.trainingDate,
  ];
  if (
    dates.some((d) => d !== "" && dateTime(d) === null) ||
    new Set(c.tasks.map((t) => t.id)).size !== c.tasks.length
  )
    return null;
  if (
    c.tasks.some(
      (t) =>
        !t.id ||
        t.id.length > 200 ||
        t.title.length > 2500 ||
        t.owner.length > 300 ||
        t.source.length > 200 ||
        (t.due !== "" && dateTime(t.due) === null),
    )
  )
    return null;
  if (c.gains.some((g) => g.length > 2000) || c.dossierNotes.length > 10000)
    return null;
  const clean = Object.fromEntries(
    Object.keys(blankCustomer(c.id, c.name)).map((key) => [
      key,
      c[key as keyof Customer],
    ]),
  ) as Customer;
  return clean;
}
export function journeyRevision(project: JourneyProject): number {
  const n = project.metadata?.[JOURNEY_KEY]?.revision;
  return typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : 0;
}
export function savedJourney(project: JourneyProject): Customer | null {
  const c = parseJourney(project.metadata?.[JOURNEY_KEY]?.customer);
  return c && c.id === project.id ? { ...c, name: project.client } : null;
}
export function projectJourney(project: JourneyProject): Customer {
  const saved = savedJourney(project);
  if (saved) return saved;
  const c = blankCustomer(project.id, project.client);
  c.analyst = project.owner || "";
  c.contact = project.contact_name || "";
  c.handoff.modules.detail = (project.scope || "").slice(0, 2000);
  return c;
}
export function journeySaveErrors(c: Customer, today: string): string[] {
  const errors: string[] = [];
  if (c.acceptedAt && (c.acceptedAt > today || missingHandoff(c).length))
    errors.push(
      "A passagem só pode ser aceita após conferir todos os itens obrigatórios, sem data futura.",
    );
  if (c.completedAt && (c.completedAt > today || exitBlockers(c, today).length))
    errors.push(
      "A conclusão exige operação assistida, aceite e dossiê completos, sem data futura.",
    );
  return errors;
}
export function journeySnapshot(project: JourneyProject, today: string) {
  const c = projectJourney(project),
    h = health(c, today);
  const redact = (text: string) =>
    text
      .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[e-mail omitido]")
      .replace(/(?:\+?\d[\d ().-]{8,}\d)/g, "[número omitido]");
  return {
    registered: !!savedJourney(project),
    handoff: {
      acceptedAt: c.acceptedAt || null,
      missing: missingHandoff(c).map((i) => i.label),
      expectation: redact(c.handoff.expectation.detail).slice(0, 500),
    },
    dates: {
      contract: c.contractDate,
      promised: c.promisedDate,
      live: c.liveDate,
      metrics: c.metricsDate,
    },
    adoptionHealth: {
      score: h.score,
      label: h.label,
      drivers: h.drivers,
      adoption: h.adoption,
    },
    metrics: c.metrics,
    adoptionCause: c.adoptionCause,
    recovery: {
      cause: c.recoveryCause,
      start: c.recoveryStart,
      gains: c.gains.map((g) => redact(g).slice(0, 400)),
    },
    training: {
      date: c.trainingDate,
      role: c.trainingRole,
      completed: c.trainingChecks.filter(Boolean).length,
    },
    exit: {
      blockers: exitBlockers(c, today),
      completedAt: c.completedAt || null,
    },
    nextActions: recommendations(c, today)
      .slice(0, 4)
      .map((r) => ({
        title: r.title,
        reason: r.why,
        action: r.action,
        days: r.days,
      })),
    tasks: c.tasks
      .filter((t) => !t.done)
      .slice(0, 8)
      .map((t) => ({
        title: redact(t.title).slice(0, 400),
        due: t.due,
        owner: redact(t.owner).slice(0, 120),
      })),
  };
}
export const STRATEGY_PLAYBOOK = `A jornada do Vectta inclui: passagem de bastão com 10 itens, 7 obrigatórios (módulos/caixas, UF/documento fiscal validado, regime tributário, contador, sistema antigo/exportação, decisor/operador e data prometida validada pela implantação). Verifique lacunas sem inventar informações. Ritual: segunda revisar carteira; terça a quinta executar/treinar/entrar em operação fora dos picos; sexta atualizar; conversa semanal com coordenação. Saída: 15 dias assistidos, critérios e aceite, reunião com Suporte/CS e dossiê de configurações, contatos, riscos e módulos não adotados. Indicadores: tempo até operar, prazo, horas/orçamento, reimportações, rejeição fiscal, módulos usados, chamados 30/60/90, satisfação e cancelamento 90 dias; valores ausentes são desconhecidos e metas são referências calibráveis. Investigue exportação solicitada, vendas fora do sistema, saída do usuário-chave, chamados repetidos, atraso de pagamento, dois adiamentos ou certificado perto de vencer; exportação não confirma cancelamento. Reversão: conversar com decisor, alinhar expectativa, distinguir produto/uso/preço/relação, combinar 2 ou 3 ganhos com responsáveis em 7 dias, envolver área competente e revisar no dia 7. Adoção: não sabe -> prática por função; não vê valor -> demonstrar ganho com dados; não consegue -> resolver barreira; não tem tempo -> rotina curta. Treinamento de 50 min: 5 valor, 10 demonstração, 25 prática, 5 explicar de volta, 5 dúvidas; usuário-chave e reforços D+7/D+30. Proponha rascunhos para reunião inicial, coleta, contador e véspera; nada é enviado automaticamente. Não defina tributos ou contingência fiscal: encaminhe ao contador/equipe responsável. Sugira próximo passo, motivo, responsável a confirmar, prazo proposto e evidência. Nunca afirme executar/salvar/agendar uma ação por conta própria.`;
