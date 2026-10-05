import {execSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
let message='';
try{execSync('pnpm exec tsc --noEmit',{stdio:'pipe',encoding:'utf8'});}catch(e){message=String(e.stdout||'')+'\n'+String(e.stderr||'');}
await fetch('https://pldxmxgrgyfwtnhxqaji.supabase.co/rest/v1/build_diagnostics',{method:'POST',headers:{apikey:'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC','Content-Type':'application/json'},body:JSON.stringify({message:message.slice(0,30000)})});
mkdirSync('diagnostic',{recursive:true});
writeFileSync('diagnostic/index.html','<!doctype html><meta charset="utf-8"><pre>Vectta diagnostic captured</pre>');
