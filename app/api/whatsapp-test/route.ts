import {NextRequest,NextResponse} from 'next/server';

export const runtime='nodejs';

const digits=(v:string)=>String(v||'').replace(/\D/g,'');

export async function POST(req:NextRequest){
  const origin=req.headers.get('origin');
  const ownOrigin=new URL(req.url).origin;
  if(origin&&origin!==ownOrigin){
    return NextResponse.json({error:'origin_not_allowed',message:'Origem não autorizada.'},{status:403});
  }

  let p:any={};
  try{p=await req.json()}catch{
    return NextResponse.json({error:'invalid_json',message:'Dados inválidos.'},{status:400});
  }

  const token=String(p.access_token||'').trim();
  const phoneId=String(p.phone_number_id||'').trim();
  const recipient=digits(p.recipient_phone||'');
  const version=String(p.graph_version||'').trim();

  if(!token||!phoneId||!recipient||!version){
    return NextResponse.json({
      error:'missing_fields',
      message:'Preencha token temporário, Phone Number ID, versão da Graph API e telefone destinatário.'
    },{status:400});
  }

  if(!/^v\d+\.\d+$/.test(version)){
    return NextResponse.json({
      error:'invalid_version',
      message:'A versão deve estar no formato vXX.X, exatamente como aparece na Meta.'
    },{status:400});
  }

  try{
    const wa=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{
      method:'POST',
      headers:{
        Authorization:'Bearer '+token,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        messaging_product:'whatsapp',
        to:recipient,
        type:'template',
        template:{
          name:'hello_world',
          language:{code:'en_US'}
        }
      }),
      cache:'no-store'
    });

    const data:any=await wa.json().catch(()=>({}));
    if(!wa.ok){
      return NextResponse.json({
        error:'meta_error',
        message:data?.error?.message||'A Meta recusou o envio.',
        details:data?.error||data
      },{status:400});
    }

    return NextResponse.json({
      ok:true,
      recipient,
      message_id:data?.messages?.[0]?.id||'',
      contact_wa_id:data?.contacts?.[0]?.wa_id||'',
      note:'Teste enviado usando o template hello_world da Meta.'
    });
  }catch(e){
    return NextResponse.json({
      error:'network_error',
      message:e instanceof Error?e.message:'Falha ao chamar a Meta.'
    },{status:500});
  }
}
