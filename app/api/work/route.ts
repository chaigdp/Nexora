import {handleWork} from '../../../lib/work-api';
export const dynamic='force-dynamic';
export async function GET(req:Request){return handleWork(req);}
export async function POST(req:Request){return handleWork(req);}
