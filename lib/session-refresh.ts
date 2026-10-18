export type BrowserSession={access_token:string;refresh_token?:string;user:{id:string;email?:string;user_metadata?:Record<string,unknown>}};

// Reading exp only schedules renewal. APIs still authenticate every request.
export function needsRenewal(session:BrowserSession,now=Date.now()){
 try{
  const payload=JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
  return typeof payload.exp!=='number'||payload.exp*1000-now<120000;
 }catch{return true;}
}

export async function renewSession(session:BrowserSession,url:string,key:string,request:typeof fetch=fetch):Promise<BrowserSession>{
 if(!needsRenewal(session))return session;
 if(!session.refresh_token)throw Error('Sua sessão expirou. Entre novamente para continuar.');
 const response=await request(url+'/auth/v1/token?grant_type=refresh_token',{
  method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
  body:JSON.stringify({refresh_token:session.refresh_token}),cache:'no-store',signal:AbortSignal.timeout(10000)
 });
 const next=await response.json() as BrowserSession;
 if(!response.ok||!next.access_token||!next.refresh_token||next.user?.id!==session.user.id)
  throw Error('Não foi possível renovar sua sessão. Copie alterações não salvas e entre novamente.');
 return next;
}
