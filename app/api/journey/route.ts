import { handleJourneySave } from "../../../lib/journey-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return handleJourneySave(request);
}
