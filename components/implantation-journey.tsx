"use client";
import { useState, type ReactNode } from "react";
import {
  HANDOFF,
  SECTION_LABELS,
  SECTIONS,
  CAUSES,
  METRIC_FIELDS,
  TRAINING_STEPS,
  EXIT_CHECKS,
  WEEKLY_RITUAL,
  MESSAGE_TEMPLATES,
  acceptHandoff,
  addTask,
  closeImplementation,
  dateTime,
  daysBetween,
  dossier,
  exitBlockers,
  formatDate,
  health,
  messageFor,
  metricErrors,
  missingHandoff,
  plusDays,
  ratio,
  recommendations,
  recoveryPlan,
  todayISO,
  trainingFollowups,
  type Customer,
  type HandoffId,
  type MetricKey,
  type Section,
  type Recommendation,
} from "../lib/implantation-strategy";
import s from "./implantation-journey.module.css";
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={s.panel}>
      <div className={s.panelHead}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
  required?: boolean;
}) {
  return (
    <label className={s.field}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={300}
        required={required}
      />
    </label>
  );
}
function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  window.document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function percent(n: number | null) {
  return n === null ? "Não informado" : `${n.toLocaleString("pt-BR")}%`;
}
function MessageCard({
  customer,
  template,
}: {
  customer: Customer;
  template: (typeof MESSAGE_TEMPLATES)[number];
}) {
  const [text, setText] = useState(() => messageFor(customer, template));
  const [status, setStatus] = useState("");
  const incomplete = /\[[^\]]+\]/.test(text);
  return (
    <article className={s.messageCard}>
      <div>
        <h3>{template.title}</h3>
        <p>{template.why}</p>
      </div>
      <label className={s.field}>
        Mensagem para revisar
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("");
          }}
          rows={8}
          maxLength={5000}
        />
      </label>
      <div className={s.actions}>
        <button
          type="button"
          className={s.primary}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setStatus("Mensagem copiada. Revise antes de enviar.");
            } catch {
              setStatus(
                "Não foi possível copiar automaticamente. Selecione o texto da mensagem e copie.",
              );
            }
          }}
        >
          Copiar mensagem
        </button>
        <span>
          {incomplete
            ? "Preencha os campos entre colchetes."
            : "Campos preenchidos. Confira os dados e o prazo."}
        </span>
      </div>
      <p role="status">{status}</p>
    </article>
  );
}
type JourneyProps = {
  customers: Customer[];
  customer: Customer;
  demo: boolean;
  dirty: boolean;
  saving: boolean;
  canEdit: boolean;
  onChange: (id: string, fn: (c: Customer) => Customer) => void;
  onSelect: (id: string) => void;
  onSave: () => Promise<void>;
  onAsk: (prompt: string) => void;
};
export function JourneyWorkspace({
  customers,
  customer,
  demo,
  dirty,
  saving,
  canEdit,
  onChange: update,
  onSelect,
  onSave,
  onAsk,
}: JourneyProps) {
  const state = { customers };
  const [section, setSection] = useState<Section>("passagem");
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskOwner, setTaskOwner] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskLimit, setTaskLimit] = useState(6);
  const c = customer;
  const today = todayISO();
  const h = health(c, today);
  const recs = recommendations(c, today);
  const missing = missingHandoff(c);
  const blockers = exitBlockers(c, today);
  const errors = metricErrors(c);
  const patch = (values: Partial<Customer>) =>
    update(c.id, (previous) => ({
      ...previous,
      ...values,
      ...(previous.completedAt &&
      ("liveDate" in values ||
        "exitChecks" in values ||
        "dossierNotes" in values)
        ? { completedAt: "", stage: "Operação assistida" as const }
        : {}),
    }));
  function navigate(id: string, next: Section) {
    if (id !== customer.id) onSelect(id);
    setSection(next);
    setNotice("");
    setTaskLimit(6);
  }
  async function save() {
    setSaveError("");
    try {
      await onSave();
      setNotice(
        demo
          ? "Jornada atualizada na demonstração. Os dados ficam nesta sessão."
          : "Jornada salva na implantação e disponível para a chAI.",
      );
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }
  function handoff(
    id: HandoffId,
    value: Partial<Customer["handoff"][HandoffId]>,
  ) {
    update(c.id, (previous) => ({
      ...previous,
      handoff: {
        ...previous.handoff,
        [id]: { ...previous.handoff[id], ...value },
      },
      ...(HANDOFF.find((i) => i.id === id)?.required && previous.acceptedAt
        ? { acceptedAt: "", stage: "Passagem" as const, completedAt: "" }
        : {}),
    }));
  }
  function number(key: MetricKey, value: string, max: number) {
    const n = value === "" ? null : Number(value);
    if (
      n !== null &&
      (!Number.isFinite(n) ||
        n < 0 ||
        n > max ||
        (!["salesUsage", "hoursUsed", "hoursBudget"].includes(key) &&
          !Number.isInteger(n)))
    )
      return;
    patch({ metrics: { ...c.metrics, [key]: n }, metricsDate: today });
  }
  const metricRows = [
    [
      "Tempo até entrar em operação",
      c.liveDate && c.contractDate && errors.length === 0
        ? `${daysBetween(c.contractDate, c.liveDate)} dias`
        : "Não informado",
      "Entrada em operação menos contrato",
      "Até 30 dias",
      "Investigar onde a implantação trava e dimensionar a carteira.",
    ],
    [
      "Entradas no prazo",
      (() => {
        const valid = state.customers.filter(
          (item) =>
            item.liveDate &&
            item.promisedDate &&
            dateTime(item.liveDate) !== null &&
            dateTime(item.promisedDate) !== null,
        );
        return percent(
          valid.length
            ? ratio(
                valid.filter((item) => item.liveDate <= item.promisedDate)
                  .length,
                valid.length,
              )
            : null,
        );
      })(),
      "Entradas até a data prometida ÷ entradas com ambas as datas",
      "Pelo menos 80%",
      "Revalidar compromissos assumidos na venda.",
    ],
    [
      "Horas por implantação",
      percent(ratio(c.metrics.hoursUsed, c.metrics.hoursBudget)),
      "Horas lançadas ÷ horas orçadas",
      "Até 110%",
      "Rever escopo, esforço e capacidade.",
    ],
    [
      "Reimportações",
      percent(
        errors.length
          ? null
          : ratio(c.metrics.importsRedone, c.metrics.importsTotal),
      ),
      "Importações refeitas ÷ importações",
      "Tendência de queda",
      "Melhorar coleta e planilha padrão.",
    ],
    [
      "Rejeição fiscal",
      percent(
        errors.length
          ? null
          : ratio(c.metrics.fiscalRejected, c.metrics.fiscalTotal),
      ),
      "Notas rejeitadas ÷ transmitidas",
      "Próxima de zero",
      "Investigar cadastro e validar configurações com o contador.",
    ],
    [
      "Adoção por módulo",
      percent(errors.length ? null : h.adoption),
      "Módulos ativos ÷ contratados",
      "Pelo menos 80%",
      "Escolher onde mostrar valor ou reforçar a prática.",
    ],
    [
      "Chamados em 30 / 60 / 90 dias",
      [c.metrics.tickets30, c.metrics.tickets60, c.metrics.tickets90]
        .map((n) => n ?? "—")
        .join(" / "),
      "Janelas de 0–30, 31–60 e 61–90 dias após a entrada",
      "Queda após o dia 30",
      "Agrupar por motivo e orientar o reforço.",
    ],
    [
      "Satisfação da implantação",
      c.metrics.csatTotal !== null &&
      c.metrics.csatResponses !== null &&
      c.metrics.csatResponses > 0 &&
      !errors.length
        ? `${(c.metrics.csatTotal / c.metrics.csatResponses).toFixed(1).replace(".", ",")} / 5`
        : "Não informado",
      "Soma das notas ÷ respostas",
      "Pelo menos 4,5 de 5",
      "Conferir a percepção do cliente sobre a entrega.",
    ],
    [
      "Cancelamento em 90 dias",
      percent(
        errors.length
          ? null
          : ratio(c.metrics.cancelled90, c.metrics.cohortTotal),
      ),
      "Cancelados em 90 dias ÷ implantados na mesma coorte",
      "Próximo de zero",
      "Investigar problemas da implantação que aparecem depois.",
    ],
  ];
  return (
    <div className={s.workspace}>
      <section className={s.intro}>
        <div>
          <span className={s.eyebrow}>DA PROMESSA AO VALOR PERCEBIDO</span>
          <h2>Cada cliente, um próximo passo claro.</h2>
          <p>
            Combine contexto, sinais e ações. A chAI ajuda a priorizar; você
            conduz a jornada.
          </p>
        </div>
        <span className={s.introMark} aria-hidden="true">
          ✓
        </span>
      </section>
      <div className={s.customerBar}>
        <label className={s.field}>
          Cliente em acompanhamento
          <select
            value={c.id}
            onChange={(e) => navigate(e.target.value, section)}
          >
            {state.customers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className={s.customerMeta}>
          <span>{c.stage}</span>
          <small>
            {demo
              ? "Demonstração isolada"
              : "Vinculado à implantação no Vectta"}
          </small>
        </div>
      </div>
      <div className={s.saveBar}>
        <div>
          <strong>
            {dirty
              ? "Alterações ainda não salvas"
              : "Jornada deste cliente"}
          </strong>
          <p>
            {demo
              ? "Dados fictícios. Ao salvar, a mudança fica nesta sessão de demonstração."
              : "Salve para compartilhar as informações com a equipe autorizada e a chAI."}
          </p>
        </div>
        <div className={s.savedActions}>
          <button
            className={s.secondary}
            type="button"
            disabled={saving || dirty}
            title={
              dirty
                ? "Salve antes de pedir uma análise dos registros atualizados"
                : undefined
            }
            onClick={() =>
              onAsk(
                "Analise a jornada deste cliente: passagem de bastão, adoção, riscos e próximo passo. Use somente os registros disponíveis.",
              )
            }
          >
            Analisar com a chAI
          </button>
          <button
            className={s.primary}
            type="button"
            disabled={saving || !dirty || !canEdit}
            onClick={() => void save()}
          >
            {saving ? "Salvando…" : "Salvar jornada"}
          </button>
        </div>
      </div>
      {saveError && (
        <p className={s.error} role="alert">
          {saveError}
        </p>
      )}
      {!canEdit && (
        <p className={s.storageNote}>
          Seu perfil permite consultar a jornada. Um responsável com permissão
          de edição pode atualizar os registros.
        </p>
      )}
      <div className={s.stats}>
        <article>
          <span>Passagem obrigatória</span>
          <strong>
            {7 - missing.length}
            <small>/7</small>
          </strong>
          <p>
            {c.acceptedAt
              ? "Aceita em " + formatDate(c.acceptedAt)
              : "Itens preenchidos e conferidos"}
          </p>
        </article>
        <article data-tone={h.tone}>
          <span>Saúde da adoção</span>
          <strong>
            {h.score ?? "—"}
            <small>{h.score === null ? "" : "/100"}</small>
          </strong>
          <p>{h.label} · regra operacional</p>
        </article>
        <article>
          <span>Adoção dos módulos</span>
          <strong>{h.adoption === null ? "—" : `${h.adoption}%`}</strong>
          <p>
            {c.metrics.modulesActive ?? "—"} de{" "}
            {c.metrics.modulesContracted ?? "—"} módulos ativos
          </p>
        </article>
        <article>
          <span>Ações em aberto</span>
          <strong>{c.tasks.filter((t) => !t.done).length}</strong>
          <p>
            {c.tasks.filter((t) => !t.done && t.due < today).length} com prazo
            vencido
          </p>
        </article>
      </div>
      <nav className={s.sectionNav} aria-label="Etapas da jornada">
        {SECTIONS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={section === key}
            onClick={() => navigate(c.id, key)}
          >
            {SECTION_LABELS[key]}
          </button>
        ))}
      </nav>
      <p className={s.notice} role="status" aria-live="polite">
        {notice}
      </p>
      <fieldset disabled={saving || !canEdit}>
        <div className={s.columns}>
          <div className={s.mainColumn}>
            {section === "passagem" ? (
              <Panel
                title="Lista de passagem de bastão"
                description="Os sete itens com asterisco são obrigatórios para aceitar o cliente. Preencha o contexto e marque o que já foi conferido."
              >
                <div className={s.formGrid}>
                  <TextField
                    label="Contato principal"
                    value={c.contact}
                    onChange={(contact) => patch({ contact })}
                  />
                  <TextField
                    label="Responsável pela implantação"
                    value={c.analyst}
                    onChange={(analyst) => patch({ analyst })}
                  />
                  <TextField
                    label="Data do contrato"
                    type="date"
                    value={c.contractDate}
                    onChange={(contractDate) => patch({ contractDate })}
                  />
                  <TextField
                    label="Data prometida"
                    type="date"
                    value={c.promisedDate}
                    onChange={(promisedDate) => patch({ promisedDate })}
                  />
                </div>
                <div className={s.checklist}>
                  {HANDOFF.map((item, index) => (
                    <div
                      className={s.checkItem}
                      key={item.id}
                      data-complete={
                        c.handoff[item.id].checked &&
                        !!c.handoff[item.id].detail.trim()
                      }
                    >
                      <label className={s.checkLabel}>
                        <input
                          type="checkbox"
                          checked={c.handoff[item.id].checked}
                          onChange={(e) =>
                            handoff(item.id, { checked: e.target.checked })
                          }
                        />
                        <span>
                          <small>{String(index + 1).padStart(2, "0")}</small>
                          {item.label}
                          {item.required ? (
                            <b aria-label="obrigatório"> *</b>
                          ) : null}
                        </span>
                      </label>
                      <label className={s.field}>
                        <span className={s.srOnly}>Detalhes: {item.label}</span>
                        <textarea
                          aria-label={`Detalhes: ${item.label}`}
                          value={c.handoff[item.id].detail}
                          onChange={(e) =>
                            handoff(item.id, { detail: e.target.value })
                          }
                          placeholder={item.hint}
                          rows={2}
                          maxLength={2000}
                        />
                      </label>
                      {c.handoff[item.id].checked &&
                      !c.handoff[item.id].detail.trim() ? (
                        <small className={s.warning}>
                          Registre o contexto para validar esta conferência.
                        </small>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className={s.actionFooter}>
                  <p>
                    {missing.length
                      ? `Faltam ${missing.length} itens obrigatórios preenchidos e conferidos.`
                      : c.acceptedAt
                        ? "Passagem aceita. Alterar um item obrigatório solicita nova validação."
                        : "Tudo pronto para revisar e aceitar."}
                  </p>
                  <button
                    type="button"
                    className={s.primary}
                    disabled={missing.length > 0 || !!c.acceptedAt}
                    onClick={() => {
                      update(c.id, (previous) =>
                        acceptHandoff(previous, today),
                      );
                      setNotice(
                        "Passagem aceita. Cliente encaminhado para implantação.",
                      );
                    }}
                  >
                    {c.acceptedAt ? "Passagem aceita" : "Aceitar passagem"}
                  </button>
                </div>
              </Panel>
            ) : null}
            {section === "saude" ? (
              <>
                <Panel
                  title="O que os sinais estão dizendo?"
                  description="Use os registros como ponto de partida para uma conversa. Um sinal isolado não confirma cancelamento."
                >
                  <div className={s.healthReading} data-tone={h.tone}>
                    <strong>
                      {h.score ?? "—"}
                      <small>/100</small>
                    </strong>
                    <div>
                      <h3>{h.label}</h3>
                      <p>
                        {h.score === null
                          ? "Complete os indicadores para calcular a saúde."
                          : "Pontuação ilustrativa. Calibre os pesos com o histórico dos seus clientes."}
                      </p>
                    </div>
                  </div>
                  <div
                    className={s.meter}
                    role="meter"
                    aria-label="Pontuação de saúde"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={h.score ?? undefined}
                  >
                    <span style={{ width: `${h.score ?? 0}%` }} />
                  </div>
                  <ul className={s.signalList}>
                    {h.drivers.map((driver) => (
                      <li key={driver}>{driver}</li>
                    ))}
                  </ul>
                  <div className={s.formGrid}>
                    {METRIC_FIELDS.slice(0, 5).map(([key, label, max]) => (
                      <label className={s.field} key={key}>
                        {label}
                        <input
                          type="number"
                          min="0"
                          max={max}
                          step={key === "salesUsage" ? "0.1" : "1"}
                          value={c.metrics[key] ?? ""}
                          onChange={(e) => number(key, e.target.value, max)}
                        />
                      </label>
                    ))}
                  </div>
                  <div className={s.flagList}>
                    {(
                      [
                        [
                          "exportRequested",
                          "Cliente pediu exportação dos dados",
                        ],
                        ["championLeft", "Quem defendia o sistema saiu"],
                        ["latePayment", "Pagamento em atraso"],
                        [
                          "certificateRenewed",
                          "Renovação do certificado confirmada",
                        ],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={c[key]}
                          onChange={(e) => patch({ [key]: e.target.checked })}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className={s.formGrid}>
                    <label className={s.field}>
                      Adiamentos da entrada em operação
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={c.postponements}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isInteger(n) && n >= 0 && n <= 100)
                            patch({ postponements: n });
                        }}
                      />
                    </label>
                    <TextField
                      label="Validade do certificado"
                      type="date"
                      value={c.certificateDate}
                      onChange={(certificateDate) => patch({ certificateDate })}
                    />
                  </div>
                  <details className={s.explanation}>
                    <summary>Como a pontuação é calculada?</summary>
                    <p>
                      Começa em 100. Desconta 35% da parcela de vendas fora do
                      sistema, 25% da parcela de módulos sem uso, 4 pontos por
                      chamado repetido (até 20) e 1 por dia sem relatório após o
                      sétimo (até 10).
                    </p>
                    <p>
                      Atraso financeiro, dois adiamentos e certificado próximo
                      do vencimento descontam 10 cada; saída do defensor, 20.
                      Pedido de exportação limita o resultado a 39 para
                      incentivar investigação. Faixas: até 39 crítico; 40–59 em
                      risco; 60–74 atenção; 75–100 saudável.
                    </p>
                    <p>
                      Esses pesos são hipóteses. Não equivalem a uma previsão
                      estatística nem substituem análise humana.
                    </p>
                  </details>
                </Panel>
                <Panel
                  title="Quatro causas, quatro intervenções"
                  description="Investigue a barreira antes de prescrever mais treinamento."
                >
                  <div className={s.causeGrid}>
                    {CAUSES.map((cause) => (
                      <button
                        key={cause.id}
                        type="button"
                        className={s.cause}
                        aria-pressed={c.adoptionCause === cause.id}
                        onClick={() => patch({ adoptionCause: cause.id })}
                      >
                        <strong>{cause.title}</strong>
                        <small>{cause.signal}</small>
                        <span>{cause.action}</span>
                      </button>
                    ))}
                  </div>
                </Panel>
              </>
            ) : null}
            {section === "reversao" ? (
              <>
                <Panel
                  title="Plano de reversão em 7 dias"
                  description="Fale com quem decide, entenda a expectativa e combine de dois a três ganhos visíveis. Cada ação precisa de responsável e data."
                >
                  <ol className={s.numbered}>
                    <li>
                      Converse com o decisor no mesmo dia do sinal relevante.
                    </li>
                    <li>
                      Pergunte: “O que você esperava que o sistema fizesse e
                      ainda não faz?”
                    </li>
                    <li>Classifique a causa e encaminhe a área certa.</li>
                    <li>
                      Defina dois ou três resultados pequenos, observáveis, com
                      datas.
                    </li>
                    <li>
                      No dia 7, apresente resultados e combine os próximos
                      passos.
                    </li>
                  </ol>
                  <div className={s.formGrid}>
                    <label className={s.field}>
                      Causa principal
                      <select
                        value={c.recoveryCause}
                        onChange={(e) =>
                          patch({
                            recoveryCause: e.target
                              .value as Customer["recoveryCause"],
                          })
                        }
                      >
                        {["produto", "uso", "preço", "relação"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <TextField
                      label="Responsável pelo plano"
                      value={c.recoveryOwner}
                      onChange={(recoveryOwner) => patch({ recoveryOwner })}
                    />
                    <TextField
                      label="Início do plano"
                      type="date"
                      value={c.recoveryStart}
                      onChange={(recoveryStart) => patch({ recoveryStart })}
                    />
                  </div>
                  <p className={s.callout}>
                    {
                      {
                        produto:
                          "Encaminhe o defeito a Produto com evidência e impacto descritos.",
                        uso: "Trabalhe a barreira de adoção com o usuário-chave e uma prática curta.",
                        preço:
                          "Alinhe a percepção de valor com o Comercial antes de negociar.",
                        relação:
                          "Envolva a coordenação para reconstruir combinados e confiança.",
                      }[c.recoveryCause]
                    }
                  </p>
                  {c.gains.map((gain, index) => (
                    <TextField
                      key={index}
                      label={`Ganho visível ${index + 1}${index === 2 ? " (opcional)" : " (obrigatório)"}`}
                      value={gain}
                      onChange={(value) =>
                        patch({
                          gains: c.gains.map((old, i) =>
                            i === index ? value : old,
                          ),
                        })
                      }
                    />
                  ))}
                  <button
                    type="button"
                    className={s.primary}
                    disabled={
                      !dateTime(c.recoveryStart) ||
                      !c.recoveryOwner.trim() ||
                      c.gains.filter((g) => g.trim()).length < 2
                    }
                    onClick={() => {
                      update(c.id, recoveryPlan);
                      setNotice(
                        "Plano registrado abaixo. Ações existentes da mesma data foram preservadas.",
                      );
                    }}
                  >
                    Criar ações e revisão do dia 7
                  </button>
                </Panel>
                <Panel
                  title="Ações do cliente"
                  description="Acompanhe o plano, os reforços e as sugestões da chAI no mesmo lugar."
                >
                  <form
                    className={s.formGrid}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (
                        !taskTitle.trim() ||
                        !taskOwner.trim() ||
                        dateTime(taskDate) === null
                      )
                        return;
                      update(c.id, (previous) =>
                        addTask(previous, {
                          id: crypto.randomUUID(),
                          title: taskTitle.trim(),
                          owner: taskOwner.trim(),
                          due: taskDate,
                          done: false,
                          source: "Ação manual",
                        }),
                      );
                      setTaskTitle("");
                      setNotice("Ação adicionada.");
                    }}
                  >
                    <TextField
                      label="Próxima ação"
                      value={taskTitle}
                      onChange={setTaskTitle}
                      required
                    />
                    <TextField
                      label="Responsável"
                      value={taskOwner}
                      onChange={setTaskOwner}
                      required
                    />
                    <TextField
                      label="Prazo"
                      type="date"
                      value={taskDate}
                      onChange={setTaskDate}
                      required
                    />
                    <button className={s.secondary} type="submit">
                      Adicionar ação
                    </button>
                  </form>
                  <div className={s.taskList}>
                    {c.tasks.length ? (
                      c.tasks.slice(0, taskLimit).map((task) => (
                        <article
                          key={task.id}
                          data-overdue={!task.done && task.due < today}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={(e) =>
                                patch({
                                  tasks: c.tasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, done: e.target.checked }
                                      : t,
                                  ),
                                })
                              }
                            />
                            <span>
                              <strong>{task.title}</strong>
                              <small>{task.source}</small>
                            </span>
                          </label>
                          <div className={s.formGrid}>
                            <TextField
                              label="Responsável da ação"
                              value={task.owner}
                              onChange={(owner) =>
                                patch({
                                  tasks: c.tasks.map((t) =>
                                    t.id === task.id ? { ...t, owner } : t,
                                  ),
                                })
                              }
                            />
                            <TextField
                              label="Prazo da ação"
                              type="date"
                              value={task.due}
                              onChange={(due) =>
                                patch({
                                  tasks: c.tasks.map((t) =>
                                    t.id === task.id ? { ...t, due } : t,
                                  ),
                                })
                              }
                            />
                          </div>
                          {!task.done && task.due < today ? (
                            <small className={s.warning}>
                              Prazo vencido. Revise o impedimento.
                            </small>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <p className={s.empty}>
                        Nenhuma ação registrada. Crie um plano ou adicione uma
                        sugestão da chAI.
                      </p>
                    )}
                  </div>
                  {c.tasks.length > taskLimit ? (
                    <button
                      className={s.secondary}
                      type="button"
                      onClick={() => setTaskLimit((n) => n + 6)}
                    >
                      Mostrar mais ações ({c.tasks.length - taskLimit})
                    </button>
                  ) : null}
                </Panel>
              </>
            ) : null}
            {section === "treinamento" ? (
              <Panel
                title="Treinar para a pessoa fazer sozinha"
                description="Trilha por função, em uma base de teste com casos do cliente. Prefira sessões de 40 a 60 minutos e um usuário-chave por operação."
              >
                <div className={s.formGrid}>
                  <TextField
                    label="Função ou público"
                    value={c.trainingRole}
                    onChange={(trainingRole) => patch({ trainingRole })}
                  />
                  <TextField
                    label="Usuário-chave"
                    value={c.keyUser}
                    onChange={(keyUser) => patch({ keyUser })}
                  />
                  <TextField
                    label="Data do treinamento"
                    type="date"
                    value={c.trainingDate}
                    onChange={(trainingDate) => patch({ trainingDate })}
                  />
                </div>
                <h3>Roteiro de 50 minutos</h3>
                <div className={s.trainingSteps}>
                  {TRAINING_STEPS.map(
                    ([minutes, title, description], index) => (
                      <label key={title}>
                        <input
                          type="checkbox"
                          checked={c.trainingChecks[index] ?? false}
                          onChange={(e) =>
                            patch({
                              trainingChecks: c.trainingChecks.map((old, i) =>
                                i === index ? e.target.checked : old,
                              ),
                            })
                          }
                        />
                        <b>{minutes}</b>
                        <span>
                          <strong>{title}</strong>
                          <small>{description}</small>
                        </span>
                      </label>
                    ),
                  )}
                </div>
                <p className={s.callout}>
                  Evidência de autonomia: a pessoa executa a tarefa sem ajuda e
                  explica de volta. Presença na sessão, sozinha, não comprova
                  adoção.
                </p>
                <button
                  className={s.primary}
                  type="button"
                  disabled={
                    !dateTime(c.trainingDate) ||
                    !c.keyUser.trim() ||
                    !c.trainingRole.trim()
                  }
                  onClick={() => {
                    update(c.id, trainingFollowups);
                    setNotice(
                      "Reforços em 7 e 30 dias registrados no plano de ações, sem duplicar os existentes.",
                    );
                  }}
                >
                  Agendar reforços D+7 e D+30
                </button>
              </Panel>
            ) : null}
            {section === "mensagens" ? (
              <Panel
                title="Comunicação que facilita o próximo passo"
                description="Edite os dados e copie o texto. Você decide onde e quando enviar. Nenhuma mensagem é enviada pelo sistema."
              >
                <div className={s.formGrid}>
                  <TextField
                    label="Nome do contato"
                    value={c.contact}
                    onChange={(contact) => patch({ contact })}
                  />
                  <TextField
                    label="Seu nome"
                    value={c.analyst}
                    onChange={(analyst) => patch({ analyst })}
                  />
                </div>
                <div className={s.messages}>
                  {MESSAGE_TEMPLATES.map((template) => (
                    <MessageCard
                      key={`${c.id}-${template.id}-${c.contact}-${c.analyst}`}
                      customer={c}
                      template={template}
                    />
                  ))}
                </div>
              </Panel>
            ) : null}
            {section === "indicadores" ? (
              <Panel
                title="Medir para decidir"
                description="Metas ilustrativas para discutir com a equipe e calibrar à realidade da carteira. Campos vazios significam dados não informados, nunca resultado zero."
              >
                <div className={s.formGrid}>
                  <TextField
                    label="Data do contrato"
                    type="date"
                    value={c.contractDate}
                    onChange={(contractDate) => patch({ contractDate })}
                  />
                  <TextField
                    label="Data prometida"
                    type="date"
                    value={c.promisedDate}
                    onChange={(promisedDate) => patch({ promisedDate })}
                  />
                  <TextField
                    label="Entrada em operação"
                    type="date"
                    value={c.liveDate}
                    onChange={(liveDate) => patch({ liveDate })}
                  />
                  <TextField
                    label="Data da coleta"
                    type="date"
                    value={c.metricsDate}
                    onChange={(metricsDate) => patch({ metricsDate })}
                  />
                </div>
                <div className={s.metricCards}>
                  {metricRows.map(
                    ([label, value, formula, target, decision]) => (
                      <article key={label}>
                        <h3>{label}</h3>
                        <strong>{value}</strong>
                        <small>{formula}</small>
                        <p>{decision}</p>
                        <span>Referência ilustrativa: {target}</span>
                      </article>
                    ),
                  )}
                </div>
                <details className={s.explanation}>
                  <summary>Registrar ou atualizar números</summary>
                  <p>
                    Preencha valores da mesma janela de observação. A coorte de
                    cancelamento deve ter 90 dias completos de acompanhamento.
                  </p>
                  <div className={s.formGrid}>
                    {METRIC_FIELDS.map(([key, label, max]) => (
                      <label className={s.field} key={key}>
                        {label}
                        <input
                          type="number"
                          min="0"
                          max={max}
                          step={
                            key === "hoursUsed" ||
                            key === "hoursBudget" ||
                            key === "salesUsage"
                              ? "0.1"
                              : "1"
                          }
                          value={c.metrics[key] ?? ""}
                          onChange={(e) => number(key, e.target.value, max)}
                        />
                      </label>
                    ))}
                  </div>
                </details>
              </Panel>
            ) : null}
            {section === "rotina" ? (
              <>
                <Panel
                  title="Ritual da semana"
                  description="Organize a execução e preserve tempo para antecipar atritos."
                >
                  <div className={s.ritual}>
                    {WEEKLY_RITUAL.map(([day, description]) => (
                      <article key={day}>
                        <b>{day}</b>
                        <p>{description}</p>
                      </article>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={s.secondary}
                    onClick={() => {
                      const date = new Date(`${today}T12:00:00Z`);
                      const monday = plusDays(
                        today,
                        -((date.getUTCDay() + 6) % 7),
                      );
                      update(c.id, (previous) =>
                        WEEKLY_RITUAL.reduce(
                          (next, [day, title], index) =>
                            addTask(next, {
                              id: `weekly-${monday}-${index}`,
                              title: `${day}: ${title}`,
                              owner:
                                previous.analyst || "Responsável a definir",
                              due: plusDays(monday, [0, 3, 4, 4][index] ?? 4),
                              done: false,
                              source: "Ritual semanal",
                            }),
                          previous,
                        ),
                      );
                      setNotice(
                        "Rotina da semana registrada no plano. Itens existentes foram preservados.",
                      );
                    }}
                  >
                    Adicionar ritual desta semana ao plano
                  </button>
                </Panel>
                <Panel
                  title="Saída da implantação, com contexto preservado"
                  description="Padrão deste roteiro: 15 dias de operação assistida após a entrada, critérios cumpridos, aceite e passagem para Suporte e Sucesso do Cliente."
                >
                  <TextField
                    label="Data real da entrada em operação"
                    type="date"
                    value={c.liveDate}
                    onChange={(liveDate) =>
                      patch({ liveDate, stage: "Operação assistida" })
                    }
                  />
                  <p className={s.callout}>
                    {c.liveDate
                      ? `${Math.max(0, daysBetween(c.liveDate, today) ?? 0)} de 15 dias de operação assistida cumpridos.`
                      : "Registre a data de entrada em operação para iniciar a contagem."}
                  </p>
                  <div className={s.flagList}>
                    {EXIT_CHECKS.map((label, index) => (
                      <label key={label}>
                        <input
                          type="checkbox"
                          checked={c.exitChecks[index] ?? false}
                          onChange={(e) =>
                            patch({
                              exitChecks: c.exitChecks.map((old, i) =>
                                i === index ? e.target.checked : old,
                              ),
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <label className={s.field}>
                    Resumo do dossiê
                    <textarea
                      value={c.dossierNotes}
                      onChange={(e) => patch({ dossierNotes: e.target.value })}
                      rows={5}
                      maxLength={10000}
                      placeholder="Configurações relevantes, particularidades, contatos, riscos, módulos ainda não adotados e próximos responsáveis."
                    />
                  </label>
                  <div className={s.actions}>
                    <button
                      type="button"
                      className={s.secondary}
                      onClick={() =>
                        download(`dossie-${c.id}.md`, dossier(c, today))
                      }
                    >
                      Baixar dossiê
                    </button>
                    <button
                      type="button"
                      className={s.primary}
                      disabled={!!c.completedAt || blockers.length > 0}
                      onClick={() => {
                        update(c.id, (previous) =>
                          closeImplementation(previous, today),
                        );
                        setNotice(
                          "Implantação concluída com os critérios registrados.",
                        );
                      }}
                    >
                      {c.completedAt
                        ? "Implantação concluída"
                        : "Validar saída da jornada"}
                    </button>
                  </div>
                  {blockers.length ? (
                    <div className={s.blockers}>
                      <strong>O que falta para concluir</strong>
                      <ul>
                        {blockers.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className={s.success}>
                      {c.completedAt
                        ? "Saída validada em " + formatDate(c.completedAt)
                        : "Critérios registrados. Revise o dossiê e confirme a conclusão."}
                    </p>
                  )}
                </Panel>
              </>
            ) : null}
            {errors.length ? (
              <div className={s.error} role="alert">
                <strong>Revise os dados</strong>
                <ul>
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <aside className={s.advisor}>
            <span className={s.eyebrow}>chAI · PRÓXIMOS PASSOS</span>
            <h2>Onde eu começaria</h2>
            <p>
              Orientações por regras, calculadas com os registros de {c.name}.
            </p>
            {recs.slice(0, 3).map((r) => (
              <Suggestion
                key={r.id}
                customer={c}
                recommendation={r}
                onChange={update}
                onOpen={(key) => navigate(c.id, key)}
              />
            ))}
            {recs.length > 3 ? (
              <details>
                <summary>Ver mais {recs.length - 3} orientações</summary>
                {recs.slice(3).map((r) => (
                  <Suggestion
                    key={r.id}
                    customer={c}
                    recommendation={r}
                    onChange={update}
                    onOpen={(key) => navigate(c.id, key)}
                  />
                ))}
              </details>
            ) : null}
          </aside>
        </div>
      </fieldset>
    </div>
  );
}

function Suggestion({
  customer,
  recommendation: r,
  onChange,
  onOpen,
}: {
  customer: Customer;
  recommendation: Recommendation;
  onChange: JourneyProps["onChange"];
  onOpen: (s: Section) => void;
}) {
  const already = customer.tasks.some((t) => t.id === `suggestion-${r.id}`);
  return (
    <article className={s.suggestion} data-priority={r.priority}>
      <small>
        {r.priority === "critical"
          ? "PRIORIDADE CRÍTICA"
          : r.priority === "high"
            ? "PRIORIDADE ALTA"
            : "PRÓXIMO PASSO"}
      </small>
      <h3>{r.title}</h3>
      <p>{r.why}</p>
      <p className={s.actionText}>{r.action}</p>
      <div className={s.actions}>
        <button type="button" onClick={() => onOpen(r.section)}>
          Abrir etapa
        </button>
        <button
          type="button"
          disabled={already}
          onClick={() =>
            onChange(customer.id, (c) =>
              addTask(c, {
                id: `suggestion-${r.id}`,
                title: r.title + ": " + r.action,
                owner: r.owner,
                due: plusDays(todayISO(), r.days),
                done: false,
                source: "Orientação estratégica",
              }),
            )
          }
        >
          {already ? "Ação no plano" : "Adicionar ao plano"}
        </button>
      </div>
    </article>
  );
}
