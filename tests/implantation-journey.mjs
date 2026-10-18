import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, next) {
    return next(s.startsWith(".") && !/\.[a-z]+$/.test(s) ? s + ".ts" : s, c);
  },
});
const m = await import("../lib/implantation-strategy.ts");
const store = await import("../lib/journey-store.ts");
const { handleJourneySave } = await import("../lib/journey-api.ts");
const { handleChai, parseChatRequest, FREE_CHAI_MODEL } =
  await import("../lib/chai-assistant.ts");
const id = "11111111-1111-4111-8111-111111111111";
const token = "Bearer " + "a".repeat(50);
const project = {
  id,
  client: "Loja de teste",
  owner: "Responsável",
  phase: "Configuração",
  due_date: null,
  manual_risk_level: "Baixo",
  metadata: { revenue: 1000 },
  updated_at: "2026-10-09T10:00:00.000Z",
};
const customer = () => m.blankCustomer(id, project.client);
const json = (value, status = 200) => Response.json(value, { status });
const req = (c = customer(), revision = 0, authorization = token) =>
  new Request("https://vectta.test/api/journey", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body: JSON.stringify({ customer: c, revision }),
  });
test("passagem exige sete evidências e conferência, não apenas caixas marcadas", () => {
  let c = customer();
  for (const item of m.HANDOFF) c.handoff[item.id].checked = true;
  assert.equal(m.acceptHandoff(c, "2026-10-09").acceptedAt, "");
  for (const item of m.HANDOFF.filter((i) => i.required))
    c.handoff[item.id].detail = "Validado";
  c = m.acceptHandoff(c, "2026-10-09");
  assert.equal(c.acceptedAt, "2026-10-09");
  c.handoff.modules.detail = "";
  assert.equal(store.journeySaveErrors(c, "2026-10-09").length, 1);
});
test("saída exige 15 dias, critérios e dossiê; data futura não habilita", () => {
  const c = customer();
  c.liveDate = "2026-09-25";
  c.exitChecks.fill(true);
  c.dossierNotes = "Configurações e responsáveis";
  assert.ok(m.exitBlockers(c, "2026-10-09").length);
  assert.equal(m.exitBlockers(c, "2026-10-10").length, 0);
  c.liveDate = "2026-10-11";
  assert.ok(m.exitBlockers(c, "2026-10-09").length);
});
test("dados ausentes e denominador zero não criam indicador saudável", () => {
  assert.equal(m.health(customer(), "2026-10-09").score, null);
  assert.equal(m.ratio(0, 0), null);
  assert.equal(store.projectJourney(project).promisedDate, "");
  assert.equal(store.projectJourney(project).handoff.modules.checked, false);
});
test("reversão e treinamento geram prazos sem duplicação", () => {
  let c = customer();
  c.recoveryStart = "2026-10-09";
  c.recoveryOwner = "Analista";
  c.gains = ["Fechamento confiável", "Uso de estoque", ""];
  c = m.recoveryPlan(c);
  const count = c.tasks.length;
  assert.ok(count >= 5);
  assert.equal(m.recoveryPlan(c).tasks.length, count);
  assert.ok(c.tasks.some((t) => t.due === "2026-10-16"));
  c.trainingDate = "2026-10-09";
  c.trainingRole = "Caixa";
  c.keyUser = "Usuária de teste";
  c = m.trainingFollowups(c);
  const n = c.tasks.length;
  assert.equal(m.trainingFollowups(c).tasks.length, n);
  assert.ok(c.tasks.some((t) => t.due === "2026-11-08"));
});
test("contexto mantém clientes separados e identifica lacunas", () => {
  const c = customer();
  c.handoff.expectation.detail = "Fechar o caixa com autonomia";
  const p = {
    ...project,
    metadata: {
      ...project.metadata,
      [store.JOURNEY_KEY]: { revision: 1, customer: c },
    },
  };
  assert.equal(store.savedJourney({ ...p, id: "outro" }), null);
  assert.equal(
    store.journeySnapshot(p, "2026-10-09").handoff.missing.length,
    7,
  );
  assert.match(
    store.journeySnapshot(p, "2026-10-09").handoff.expectation,
    /autonomia/,
  );
  assert.equal(store.parseJourney({ ...c, trainingDate: "2026-02-30" }), null);
});
test("salvar exige autenticação antes de consultar ou alterar a carteira", async () => {
  let calls = 0;
  const response = await handleJourneySave(
    req(customer(), 0, "Bearer demo"),
    async () => {
      calls++;
      throw Error();
    },
  );
  assert.equal(response.status, 401);
  assert.equal(calls, 0);
});
test("projeto ausente nas políticas de acesso não recebe escrita", async () => {
  let writes = 0;
  const response = await handleJourneySave(req(), async (url, options) => {
    if (options.method === "PATCH") writes++;
    return url.includes("/auth/") ? json({ id: "user" }) : json([]);
  });
  assert.equal(response.status, 404);
  assert.equal(writes, 0);
});
test("salvar preserva metadados e usa revisão e data para concorrência", async () => {
  let written;
  const response = await handleJourneySave(req(), async (url, options) => {
    assert.equal(options.headers.Authorization, token);
    if (url.includes("/auth/")) return json({ id: "user" });
    if (options.method === "PATCH") {
      assert.match(url, /updated_at=eq\./);
      written = JSON.parse(options.body);
      return json([{ ...project, ...written }]);
    }
    return json([project]);
  });
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(written), ["metadata"]);
  assert.equal(written.metadata.revenue, 1000);
  assert.equal(written.metadata[store.JOURNEY_KEY].revision, 1);
});
test("revisão concorrente e conflito no banco não apagam alteração de outra sessão", async () => {
  const newer = {
    ...project,
    metadata: { [store.JOURNEY_KEY]: { revision: 2, customer: customer() } },
  };
  let writes = 0;
  let response = await handleJourneySave(req(), async (url, o) => {
    if (o.method === "PATCH") writes++;
    return url.includes("/auth/") ? json({ id: "user" }) : json([newer]);
  });
  assert.equal(response.status, 409);
  assert.equal(writes, 0);
  response = await handleJourneySave(req(), async (url, o) =>
    url.includes("/auth/")
      ? json({ id: "user" })
      : o.method === "PATCH"
        ? json([])
        : json([project]),
  );
  assert.equal(response.status, 409);
});
test("validação de aceite não pode ser pulada pela API", async () => {
  const c = customer();
  c.acceptedAt = "2026-10-09";
  let calls = 0;
  const response = await handleJourneySave(req(c), async () => {
    calls++;
    throw Error();
  });
  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});
test("produção rejeita contexto inventado no navegador e demo rejeita outro cliente", () => {
  const c = customer(),
    message = [{ role: "user", content: "Analise a passagem" }];
  assert.throws(() =>
    parseChatRequest({
      demo: false,
      project_id: id,
      messages: message,
      demo_journey: c,
    }),
  );
  assert.throws(() =>
    parseChatRequest({
      demo: true,
      project_id: "outro",
      messages: message,
      demo_journey: c,
    }),
  );
});
test("chAI recebe a jornada salva e as estratégias como contexto de implantação", async () => {
  const c = customer();
  c.handoff.expectation.detail = "Fechamento autônomo";
  let context;
  const p = {
    ...project,
    metadata: { [store.JOURNEY_KEY]: { revision: 1, customer: c } },
  };
  const response = await handleChai(
    new Request("https://vectta.test/api/chai", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: token },
      body: JSON.stringify({
        module: "implantacoes",
        project_id: id,
        messages: [
          { role: "user", content: "O que falta na passagem de bastão?" },
        ],
      }),
    }),
    {
      key: "test-key",
      now: () => Date.now() + 120000,
      request: async (url, o) => {
        if (url.endsWith("/v1/models")) return json({data:[{id:FREE_CHAI_MODEL,type:"language",pricing:{input:"0",output:"0"}}]});
        if (url.includes("/auth/")) return json({ id: "journey-test" });
        if (url.includes("/chat/completions")) {
          context = JSON.parse(o.body);
          return json({
            choices: [
              { message: { content: "Faltam sete itens para a passagem." } },
            ],
          });
        }
        return json(url.includes("/projects?") ? [p] : []);
      },
    },
  );
  assert.equal(response.status, 200);
  assert.match(context.messages[0].content, /50 min/);
  assert.match(context.messages[1].content, /Fechamento autônomo/);
  assert.match(context.messages[1].content, /Módulos contratados/);
  assert.ok(!JSON.stringify(context).includes(token));
});

