import {NextResponse} from 'next/server';

export const dynamic='force-dynamic';

const SUPA=process.env.SUPABASE_URL??process.env.NEXT_PUBLIC_SUPABASE_URL??'https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY=process.env.SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';

export async function GET(){
  const started=Date.now();
  try{
    const r=await fetch(SUPA+'/rest/v1/projects?select=id&limit=0',{
      headers:{apikey:KEY},
      cache:'no-store',
      signal:AbortSignal.timeout(5000)
    });
    if(!r.ok)throw new Error('database_unavailable');
    return NextResponse.json({
      status:'ok',
      database:'ok',
      latency_ms:Date.now()-started,
      timestamp:new Date().toISOString()
    },{headers:{'Cache-Control':'no-store'}});
  }catch{
    return NextResponse.json({
      status:'degraded',
      database:'unavailable',
      latency_ms:Date.now()-started,
      timestamp:new Date().toISOString()
    },{status:503,headers:{'Cache-Control':'no-store'}});
  }
}

