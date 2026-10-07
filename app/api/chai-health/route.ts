import {NextResponse} from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
  if(!key){
    return NextResponse.json({ok:false,stage:'auth',message:'OIDC/API key não disponível no runtime.'},{status:503});
  }
  try{
    const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
      cache:'no-store',
      signal:AbortSignal.timeout(20000),
      body:JSON.stringify({
        model:'inclusionai/ling-3.1-flash-free',
        max_tokens:12,
        temperature:0,
        messages:[
          {role:'system',content:'Responda somente OK.'},
          {role:'user',content:'Teste de conexão.'}
        ]
      })
    });
    const data:any=await response.json().catch(()=>({}));
    if(!response.ok){
      return NextResponse.json({ok:false,stage:'gateway',status:response.status,message:data?.error?.message||data?.message||'Falha no AI Gateway.'},{status:503});
    }
    return NextResponse.json({ok:true,model:'inclusionai/ling-3.1-flash-free',gateway:'connected'});
  }catch(e){
    return NextResponse.json({ok:false,stage:'network',message:e instanceof Error?e.message:'Falha de conexão.'},{status:503});
  }
}
