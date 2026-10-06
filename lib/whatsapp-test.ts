type JsonObject = Record<string, unknown>;
type Fetcher = typeof fetch;

const MAX_REQUEST_BYTES = 24 * 1024;
const json = (body: JsonObject, status = 200) => Response.json(body, {
  status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'},
});
const field = (body: JsonObject, key: string) => typeof body[key] === 'string' ? body[key].trim() : '';

export function validateTestMessage(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Preencha os campos do teste.');
  const p = body as JsonObject;
  const token = field(p, 'access_token');
  const phoneId = field(p, 'phone_number_id');
  const version = field(p, 'graph_version');
  const phone = field(p, 'recipient_phone');
  const recipient = phone.replace(/[+\s().-]/g, '');
  const type = p.message_type;
  const text = field(p, 'text_body');
  if (!token || token.length > 8192 || /\s/.test(token)) throw new Error('Cole um token temporário válido, sem espaços.');
  if (!/^\d{1,32}$/.test(phoneId)) throw new Error('O identificador do número deve conter apenas os dígitos exibidos pela Meta.');
  if (!/^v\d{1,3}\.\d{1,2}$/.test(version)) throw new Error('Copie a versão exibida pela Meta no formato vXX.X.');
  if (!/^\+?[\d\s().-]+$/.test(phone) || !/^[1-9]\d{7,14}$/.test(recipient)) throw new Error('Informe um único telefone com código do país, DDD e número. Exemplo: +55 31 99999-9999.');
  if (p.recipient_confirmed !== true) throw new Error('Confirme que este é seu número de teste, verificado no painel da Meta.');
  if (type !== 'template' && type !== 'text') throw new Error('Selecione mensagem padrão ou texto personalizado.');
  if (type === 'text' && (!text || text.length > 4096)) throw new Error('Escreva uma mensagem com 1 a 4.096 caracteres.');
  if (type === 'text' && p.window_confirmed !== true) throw new Error('Primeiro responda ao número de teste pelo seu WhatsApp e confirme que fez isso nas últimas 24 horas.');
  const payload = type === 'text'
    ? {messaging_product: 'whatsapp', to: recipient, type, text: {preview_url: false, body: text}}
    : {messaging_product: 'whatsapp', to: recipient, type, template: {name: 'hello_world', language: {code: 'en_US'}}};
  return {token, phoneId, version, recipient, type, payload};
}

const metaHelp: Record<number, string> = {
  190: 'O token expirou ou não é válido. Gere outro token temporário no painel da Meta e tente novamente.',
  131030: 'Este celular não está autorizado para o número de teste. Adicione e verifique o destinatário no painel da Meta.',
  131047: 'A janela de resposta está fechada. Envie uma mensagem do seu celular para o número de teste da Meta e tente novamente.',
  131026: 'A Meta não conseguiu entregar a mensagem. Confira o telefone e se ele pode receber mensagens pelo WhatsApp.',
  130429: 'O limite de envio foi atingido. Aguarde antes de fazer outro teste.',
  132001: 'O modelo de teste não está disponível para este número ou idioma. Confira a configuração do número de teste na Meta.',
  10: 'O token não tem permissão para este envio. Confira as permissões do aplicativo e do número na Meta.',
  200: 'O token não tem permissão para este envio. Confira as permissões do aplicativo e do número na Meta.',
};

async function readBody(req: Request) {
  if (!req.body) throw new Error('invalid_json');
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_REQUEST_BYTES) { await reader.cancel(); throw new Error('body_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

// Tokens and content exist only for this request. Never persist or log them.
export async function handleWhatsAppTest(req: Request, request: Fetcher = fetch) {
  const origin = req.headers.get('origin');
  if ((origin && origin !== new URL(req.url).origin) || req.headers.get('sec-fetch-site') === 'cross-site') {
    return json({error: 'origin_not_allowed', message: 'Origem não autorizada.'}, 403);
  }
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({error: 'invalid_content_type', message: 'Envie os dados no formato JSON.'}, 415);
  }
  let body: unknown;
  try { body = await readBody(req); }
  catch (error) {
    const large = error instanceof Error && error.message === 'body_too_large';
    return json({error: large ? 'body_too_large' : 'invalid_json', message: large ? 'O conteúdo do teste excede o tamanho permitido.' : 'Dados inválidos. Revise os campos.'}, large ? 413 : 400);
  }
  let input: ReturnType<typeof validateTestMessage>;
  try { input = validateTestMessage(body); }
  catch (error) { return json({error: 'invalid_fields', message: error instanceof Error ? error.message : 'Revise os campos.'}, 400); }
  try {
    const wa = await request(`https://graph.facebook.com/${input.version}/${input.phoneId}/messages`, {
      method: 'POST', headers: {Authorization: 'Bearer ' + input.token, 'Content-Type': 'application/json'},
      body: JSON.stringify(input.payload), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    });
    const data = await wa.json().catch(() => ({})) as {error?: {code?: unknown}; messages?: {id?: unknown}[]};
    if (!wa.ok) {
      const rawCode = data?.error?.code;
      const code = typeof rawCode === 'number' && Number.isSafeInteger(rawCode) ? rawCode : undefined;
      return json({error: 'meta_error', code, message: (code && metaHelp[code]) || 'A Meta recusou o envio. Confira o token, o identificador do número, a versão e o destinatário no painel da Meta.'}, wa.status === 429 ? 429 : 400);
    }
    const messageId = data?.messages?.[0]?.id;
    if (typeof messageId !== 'string' || !messageId.startsWith('wamid.') || messageId.length > 512) {
      return json({error: 'unconfirmed_result', message: 'A resposta não confirmou um identificador de mensagem. Confira seu WhatsApp antes de tentar novamente para evitar duplicidade.'}, 502);
    }
    return json({ok: true, status: 'accepted', recipient: input.recipient, message_id: messageId, message_type: input.type, note: 'A Meta aceitou o pedido. A entrega e a leitura ainda não foram confirmadas.'});
  } catch {
    return json({error: 'unconfirmed_result', message: 'Não foi possível confirmar o resultado do envio. Confira seu WhatsApp antes de tentar novamente para evitar duplicidade.'}, 502);
  }
}
