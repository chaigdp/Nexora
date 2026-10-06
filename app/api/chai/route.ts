import {handleChai} from '../../../lib/chai-assistant';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){return handleChai(req);}
