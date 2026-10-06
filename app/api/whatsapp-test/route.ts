import {handleWhatsAppTest} from '../../../lib/whatsapp-test';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  return handleWhatsAppTest(req);
}
