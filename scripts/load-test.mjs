const target=(process.env.TARGET_URL||'https://vectta.vercel.app').replace(/\/$/,'');
const concurrency=Math.max(1,Number(process.env.CONCURRENCY||20));
const total=Math.max(concurrency,Number(process.env.REQUESTS||200));
const timeoutMs=Math.max(1000,Number(process.env.TIMEOUT_MS||10000));

const paths=['/'];
try{
  const probe=await fetch(target+'/api/health',{signal:AbortSignal.timeout(5000)});
  if(probe.ok)paths.push('/api/health');
}catch{}

const times=[];
let ok=0,failed=0,next=0;
async function worker(){
  while(true){
    const i=next++;
    if(i>=total)return;
    const path=paths[i%paths.length];
    const start=performance.now();
    try{
      const r=await fetch(target+path,{redirect:'follow',signal:AbortSignal.timeout(timeoutMs),headers:{'User-Agent':'vectta-load-test/1.0'}});
      const ms=performance.now()-start;
      times.push(ms);
      if(r.ok)ok++;else failed++;
      await r.arrayBuffer();
    }catch{
      times.push(performance.now()-start);
      failed++;
    }
  }
}
await Promise.all(Array.from({length:concurrency},worker));
times.sort((a,b)=>a-b);
const percentile=p=>times[Math.min(times.length-1,Math.floor(times.length*p))]||0;
const result={
  target,paths,requests:total,concurrency,ok,failed,
  error_rate:Number((failed/total).toFixed(4)),
  p50_ms:Math.round(percentile(.50)),
  p95_ms:Math.round(percentile(.95)),
  p99_ms:Math.round(percentile(.99)),
  max_ms:Math.round(times[times.length-1]||0)
};
console.log(JSON.stringify(result,null,2));
if(result.error_rate>.02||result.p95_ms>3000)process.exit(1);
