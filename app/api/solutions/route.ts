import {handleSolutions} from '../../../lib/solutions-api';
export const runtime='nodejs';
export async function GET(req:Request){return handleSolutions(req);}
export async function POST(req:Request){return handleSolutions(req);}
