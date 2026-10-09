'use client';
import {useEffect,useRef,useState} from 'react';
import {X,MessageCircle,Send,Sparkles} from 'lucide-react';
import {chaiModules,type ChaiModule} from '../lib/chai-modules';
import s from '../app/vectta.module.css';
import type {Customer} from '../lib/implantation-strategy';

type ProjectOption={id:string;client:string;journey?:Customer|null};
type Message={role:'user'|'assistant';content:string;scope:string};
type Command={id:number;prompt:string;projectId?:string};
type Props={
  module:ChaiModule;
  demo:boolean;
  token:string;
  projects:ProjectOption[];
  projectId?:string;
  onProjectChange?:(id:string)=>void;
  onUseAnswer?:(answer:string,intent:string)=>void;
  command?:Command|null;
};

export default function ChaiAssistant({module,demo,token,projects,projectId='',onProjectChange,onUseAnswer,command}:Props){
  const config=chaiModules[module];
  const [contextId,setContextId]=useState(projectId);
  const [messages,setMessages]=useState<Message[]>([]);
  const [question,setQuestion]=useState('');
  const [asking,setAsking]=useState(false);
  const [error,setError]=useState('');
  const [collapsed,setCollapsed]=useState(true);
  const requestLock=useRef(false);
  const abortRef=useRef<AbortController|null>(null);
  const conversationRef=useRef<HTMLDivElement>(null);
  const launcherRef=useRef<HTMLButtonElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const lastCommand=useRef<number|null>(null);

  const contextName=projects.find(p=>p.id===contextId)?.client||'Toda a carteira';
  const scope=module+':'+contextName;

  useEffect(()=>{setContextId(projectId||'');},[projectId]);
  useEffect(()=>{setMessages([]);setError('');},[module,contextId]);
  useEffect(()=>{const box=conversationRef.current;if(box)box.scrollTop=box.scrollHeight;},[messages.length,asking,collapsed]);
  useEffect(()=>{if(!collapsed)closeRef.current?.focus();},[collapsed]);
  useEffect(()=>{
    if(typeof window==='undefined')return;
    const media=window.matchMedia('(max-width: 700px)');
    const update=()=>{if(media.matches)setCollapsed(true);};
    update();media.addEventListener('change',update);
    return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>()=>abortRef.current?.abort(),[]);

  async function ask(text=question,forcedProject?:string){
    const target=text.trim();if(!target||requestLock.current)return;
    const targetProject=forcedProject??contextId;
    if(forcedProject!==undefined&&forcedProject!==contextId){setContextId(forcedProject);onProjectChange?.(forcedProject);}
    const targetName=projects.find(p=>p.id===targetProject)?.client||'Toda a carteira';
    const targetScope=module+':'+targetName;
    const entry:Message={role:'user',content:target,scope:targetScope};
    const history=[...messages.filter(m=>m.scope===targetScope),entry].slice(-8);
    setMessages(m=>[...m,entry]);setQuestion('');setError('');setCollapsed(false);

    const greeting=/^(oi+|ol[aá]|opa|e a[ií]|bom dia|boa tarde|boa noite|hello|hi)[!.?\s]*$/i.test(target);
    if(greeting){
      const hello='Oi! Estou aqui. Neste módulo eu posso '+config.intro.charAt(0).toLowerCase()+config.intro.slice(1)+' Você pode me fazer uma pergunta ou usar uma das sugestões abaixo.';
      setMessages(m=>[...m,{role:'assistant',content:hello,scope:targetScope}]);
      return;
    }

    requestLock.current=true;setAsking(true);
    const controller=new AbortController();abortRef.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),32000);
    try{
      const response=await fetch('/api/chai',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        signal:controller.signal,
        body:JSON.stringify({demo,module,project_id:targetProject,demo_journey:demo?projects.find(p=>p.id===targetProject)?.journey:undefined,messages:history.map(({role,content})=>({role,content}))})
      });
      const result=await response.json() as {answer?:string;message?:string;mode?:string};
      if(!response.ok||!result.answer)throw new Error(result.message||'A chAI não conseguiu responder agora.');
      setMessages(m=>[...m,{role:'assistant',content:(result.mode==='local_analysis'?'Análise por regras dos registros disponíveis.\n\n':'')+result.answer!,scope:targetScope}]);
    }catch(e){
      const message=e instanceof Error&&e.name!=='AbortError'?e.message:'A chAI não respondeu a tempo. Tente novamente.';
      setError(message);
      setMessages(m=>[...m,{role:'assistant',content:'Não consegui concluir essa análise agora. Sua pergunta ficou registrada na conversa. Tente novamente em alguns segundos.',scope:targetScope}]);
    }finally{
      window.clearTimeout(timeout);abortRef.current=null;requestLock.current=false;setAsking(false);
    }
  }

  useEffect(()=>{
    if(!command||command.id===lastCommand.current)return;
    lastCommand.current=command.id;
    void ask(command.prompt,command.projectId);
  },[command?.id]);

  function changeContext(id:string){
    setContextId(id);onProjectChange?.(id);setMessages([]);setError('');
  }

  const relevant=messages.filter(m=>m.scope===scope);
  function close(){setCollapsed(true);requestAnimationFrame(()=>launcherRef.current?.focus());}

  return <div className={s.assistantDock} onKeyDown={e=>{if(e.key==='Escape'&&!collapsed){e.preventDefault();close();}}}>
    {!collapsed&&<aside id="chai-conversation-panel" className={s.assistantBubble} aria-label={'Assistente chAI · '+config.label}>
      <header className={s.assistantHeader}>
        <div className={s.assistantIdentity}><span className={s.assistantAvatar}><img src="/chai-curious-hd.webp" width={1122} height={1402} alt=""/></span><div><img className={s.assistantWordmark} src="/chai-logo.svg" alt="chAI"/><span>{config.label}</span></div></div>
        <button ref={closeRef} type="button" className={s.assistantClose} onClick={close} aria-label="Recolher conversa com a chAI"><X size={19}/></button>
      </header>
      <label className={s.assistantScope}><span>Analisando</span><select value={contextId} disabled={asking} onChange={e=>changeContext(e.target.value)}><option value="">Toda a carteira</option>{projects.map(p=><option key={p.id} value={p.id}>{p.client}</option>)}</select></label>
      <div ref={conversationRef} className={s.assistantConversation} role="log" aria-label="Conversa com a chAI" aria-live="polite" aria-relevant="additions text" aria-busy={asking}>
        {!relevant.length&&<div className={s.assistantWelcome}><span><Sparkles size={22}/></span><h2>Vamos pensar juntas?</h2><p>{config.intro}</p><small>{demo?'Análise com os dados fictícios da demonstração.':'Análise baseada nos registros do seu espaço.'}</small></div>}
        {relevant.map((m,i)=><article key={i} className={s.assistantMessage} data-role={m.role}><small>{m.role==='user'?'Você':'chAI'}</small><p>{m.content}</p>{m.role==='assistant'&&onUseAnswer&&contextId&&<button className={s.link} onClick={()=>{const intent=[...relevant.slice(0,i)].reverse().find(x=>x.role==='user')?.content||'';onUseAnswer(m.content,intent)}}>Transformar em plano de CS</button>}</article>)}
        {asking&&<p className={s.assistantThinking}><span/><span/><span/> Analisando sua carteira...</p>}
      </div>
      {error&&<div className={s.assistantError} role="alert">{error}</div>}
      <details className={s.assistantPrompts} open={!relevant.length}><summary>Ideias para começar</summary><div>{config.suggestions.map(q=><button key={q} disabled={asking||!projects.length} onClick={()=>void ask(q)}>{q}</button>)}</div></details>
      <form className={s.assistantComposer} onSubmit={e=>{e.preventDefault();void ask();}}>
        <div><textarea aria-label="Pergunte à chAI" value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(!asking&&question.trim())void ask();}}} maxLength={2000} rows={2} placeholder="Qual é o próximo passo?" disabled={asking}/><button type="submit" aria-label="Enviar pergunta" disabled={asking||!question.trim()}><Send size={18}/></button></div>
        <small>Você decide. A chAI ajuda a planejar.</small>
      </form>
    </aside>}
    <button ref={launcherRef} type="button" className={s.assistantLauncher} aria-label={collapsed?'Conversar com a chAI':'Recolher conversa com a chAI'} aria-expanded={!collapsed} aria-controls="chai-conversation-panel" onClick={()=>collapsed?setCollapsed(false):close()}>
      {collapsed&&<span className={s.assistantTeaser}><strong>Uma ideia para avançar?</strong><span>Converse com a chAI</span></span>}
      <span className={s.assistantOrb}>{collapsed?<><img src="/chai-curious-hd.webp" width={1122} height={1402} alt=""/><span><MessageCircle size={13}/></span></>:<X size={24}/>}</span>
    </button>
  </div>;
}
