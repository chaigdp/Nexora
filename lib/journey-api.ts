import {
  JOURNEY_KEY,
  journeyRevision,
  journeySaveErrors,
  parseJourney,
  type JourneyProject,
} from "./journey-store";
import { todayISO } from "./implantation-strategy";
const SUPA =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://pldxmxgrgyfwtnhxqaji.supabase.co";
const KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC";
const reply = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function handleJourneySave(
  req: Request,
  request: typeof fetch = fetch,
) {
  const origin = req.headers.get("origin");
  if (
    (origin && origin !== new URL(req.url).origin) ||
    req.headers.get("sec-fetch-site") === "cross-site"
  )
    return reply({ message: "Origem não autorizada." }, 403);
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    return reply({ message: "Envie dados JSON." }, 415);
  const authorization = req.headers.get("authorization") || "";
  if (!/^Bearer [A-Za-z0-9._-]{40,8192}$/.test(authorization))
    return reply({ message: "Entre na sua conta para salvar a jornada." }, 401);
  let payload: Record<string, unknown>;
  try {
    const reader = req.body?.getReader();
    if (!reader) throw Error();
    let size = 0,
      text = "";
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 262144) {
          await reader.cancel();
          throw Error();
        }
        text += decoder.decode(value, { stream: true });
      }
      text += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    payload = JSON.parse(text);
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      throw Error();
  } catch {
    return reply(
      { message: "O registro é inválido ou excede 256 KB. Revise os campos." },
      400,
    );
  }
  const customer = parseJourney(payload.customer);
  const revision = payload.revision;
  if (
    !customer ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      customer.id,
    ) ||
    typeof revision !== "number" ||
    !Number.isSafeInteger(revision) ||
    revision < 0
  )
    return reply({ message: "Revise os campos da jornada." }, 400);
  const errors = journeySaveErrors(customer, todayISO());
  if (errors.length) return reply({ message: errors.join(" ") }, 400);
  const headers = {
    apikey: KEY,
    Authorization: authorization,
    "Content-Type": "application/json",
  };
  try {
    const auth = await request(SUPA + "/auth/v1/user", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const user = (await auth.json()) as { id?: string };
    if (!auth.ok || !user.id)
      return reply({ message: "Sua sessão expirou. Entre novamente." }, 401);
    const read = await request(
      SUPA +
        "/rest/v1/projects?select=id,client,owner,metadata,updated_at&id=eq." +
        customer.id,
      { headers, cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!read.ok)
      return reply(
        { message: "Não foi possível consultar a implantação." },
        503,
      );
    const rows = (await read.json()) as JourneyProject[];
    const project = Array.isArray(rows) ? rows[0] : undefined;
    if (!project)
      return reply(
        { message: "Implantação não encontrada na sua carteira." },
        404,
      );
    if (journeyRevision(project) !== revision || !project.updated_at)
      return reply(
        {
          message:
            "A jornada foi atualizada em outra sessão. Reabra a carteira antes de salvar para preservar as alterações da equipe.",
        },
        409,
      );
    const metadata = {
      ...project.metadata,
      [JOURNEY_KEY]: {
        revision: revision + 1,
        saved_at: new Date().toISOString(),
        customer: { ...customer, name: project.client },
      },
    };
    const response = await request(
      SUPA +
        "/rest/v1/projects?id=eq." +
        customer.id +
        "&updated_at=eq." +
        encodeURIComponent(project.updated_at),
      {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({ metadata }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok)
      return reply(
        {
          message:
            response.status === 403
              ? "Seu perfil não permite editar esta implantação."
              : "Não foi possível salvar a jornada. Tente novamente.",
        },
        response.status === 403 ? 403 : 503,
      );
    const saved = await response.json();
    if (!Array.isArray(saved) || !saved[0])
      return reply(
        {
          message:
            "A implantação mudou ou seu perfil não pode editá-la. Atualize a carteira antes de tentar novamente.",
        },
        409,
      );
    return reply({ project: saved[0] });
  } catch {
    return reply(
      {
        message:
          "Não foi possível confirmar o salvamento. Recarregue a carteira antes de repetir a operação.",
      },
      503,
    );
  }
}
