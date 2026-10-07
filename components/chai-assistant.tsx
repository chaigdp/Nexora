'use client';
import {useEffect,useRef,useState} from 'react';
import {ChevronDown,ChevronUp,MessageCircle,Send} from 'lucide-react';
import {chaiModules,type ChaiModule} from '../lib/chai-modules';
import s from '../app/vectta.module.css';

type ProjectOption={id:string;client:string};
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
  const [collapsed,setCollapsed]=useState(false);
  const requestLock=useRef(false);
  const abortRef=useRef<AbortController|null>(null);
  const endRef=useRef<HTMLDivElement>(null);
  const lastCommand=useRef<number|null>(null);

  const contextName=projects.find(p=>p.id===contextId)?.client||'Toda a carteira';
  const scope=module+':'+contextName;

  useEffect(()=>{setContextId(projectId||'');},[projectId]);
  useEffect(()=>{setMessages([]);setError('');},[module,contextId]);
  useEffect(()=>{endRef.current?.scrollIntoView({block:'nearest'});},[messages.length]);
  useEffect(()=>{
    if(typeof window==='undefined')return;
    const media=window.matchMedia('(max-width: 700px)');
    const update=()=>setCollapsed(media.matches);
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
    requestLock.current=true;setAsking(true);
    const controller=new AbortController();abortRef.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),32000);
    try{
      const response=await fetch('/api/chai',{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        signal:controller.signal,
        body:JSON.stringify({demo,module,project_id:targetProject,messages:history.map(({role,content})=>({role,content}))})
      });
      const result=await response.json() as {answer?:string;message?:string;mode?:string};
      if(!response.ok||!result.answer)throw new Error(result.message||'A chAI não conseguiu responder agora.');
      setMessages(m=>[...m,{role:'assistant',content:result.answer!,scope:targetScope}]);
    }catch(e){
      setError(e instanceof Error&&e.name!=='AbortError'?e.message:'A chAI não respondeu a tempo. Tente novamente.');
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
  return <aside className={s.chaiPanel+(collapsed?' '+s.chaiCollapsed:'')} aria-label={'Assistente chAI · '+config.label}>
    <div className={s.chaiCompactHead}>
      <div className={s.chaiIdentity}>
        <img src="/chai-logo.svg" alt="chAI"/>
        <div><span>{config.eyebrow}</span><strong>{config.label}</strong></div>
      </div>
      <button className={s.chaiToggle} onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Abrir chAI':'Recolher chAI'}>{collapsed?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
    </div>
    {!collapsed&&<>
      <p className={s.chaiIntro}>{config.intro}</p>
      <label className={s.chaiScope}>Contexto da análise<select className={s.input} value={contextId} disabled={asking} onChange={e=>changeContext(e.target.value)}><option value="">Toda a carteira</option>{projects.map(p=><option key={p.id} value={p.id}>{p.client}</option>)}</select></label>
      <div className={s.chaiConversation} role="log" aria-live="polite">
        {!relevant.length&&<div className={s.chaiWelcome}><MessageCircle size={20}/><strong>O que você quer entender?</strong><p>{demo?'Estou usando a base fictícia desta demonstração.':'Vou analisar os dados registrados no Vectta para este módulo.'}</p></div>}
        {relevant.map((m,i)=><article key={i} className={s.chaiMessage} data-role={m.role}><small>{m.role==='user'?'Você':'chAI'} · {contextName}</small><p>{m.content}</p>{m.role==='assistant'&&onUseAnswer&&contextId&&<button className={s.link} onClick={()=>{const intent=[...relevant.slice(0,i)].reverse().find(x=>x.role==='user')?.content||'';onUseAnswer(m.content,intent)}}>Transformar em plano de CS</button>}</article>)}
        {asking&&<p className={s.chaiThinking}>Analisando os registros...</p>}
        <div ref={endRef}/>
      </div>
      {error&&<div className={s.labError} role="alert">{error}</div>}
      <div className={s.chaiSuggestions}>{config.suggestions.map(q=><button key={q} disabled={asking||!projects.length} onClick={()=>void ask(q)}>{q}</button>)}</div>
      <form className={s.chaiComposer} onSubmit={e=>{e.preventDefault();void ask();}}>
        <textarea aria-label="Pergunte à chAI" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={2000} placeholder={config.placeholder} disabled={asking}/>
        <div><small>Nenhuma ação é executada automaticamente.</small><button className={s.btn+' '+s.primary} type="submit" disabled={asking||!question.trim()}><Send size={14}/>Perguntar</button></div>
      </form>
    </>}
  </aside>;
}
