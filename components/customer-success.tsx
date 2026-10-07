'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,CheckCircle2,HeartPulse,MessageCircle,Plus,Send,Sparkles,Target,X} from 'lucide-react';
import {buildCSDraft,closed,csCategories,csCategory,csStatuses,inferCSCategory,summarizeCS,type CSData,type CSOperation} from '../lib/customer-success';
import s from '../app/vectta.module.css';

type Props={data:CSData;demo:boolean;token:string;owner:string;onSave:(plan:CSOperation)=>Promise<void>;onOpen:(id:string)=>void};
type Message={role:'user'|'assistant';content:string;mode?:'ai'|'rules';scope:string};

const date=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value+'T12:00:00Z')):'Sem data';

export default function CustomerSuccess({data,demo,token,owner,onSave,onOpen}:Props){
  const [filter,setFilter]=useState('Todos'),[tier,setTier]=useState('Todos'),[search,setSearch]=useState(''),[selected,setSelected]=useState('');
  const [draft,setDraft]=useState<CSOperation|null>(null),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState(''),[notice,setNotice]=useState('');
  const [question,setQuestion]=useState(''),[messages,setMessages]=useState<Message[]>([]),[asking,setAsking]=useState(false),[chatError,setChatError]=useState('');
  const requestLock=useRef(false),saveLock=useRef(false),editor=useRef<HTMLElement>(null),chatEnd=useRef<HTMLDivElement>(null),abortRef=useRef<AbortController|null>(null);
  useEffect(()=>()=>abortRef.current?.abort(),[]);
  useEffect(()=>{if(draft)editor.current?.scrollIntoView({behavior:'smooth',block:'start'});},[draft?.id,draft?.project_id]);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages.length]);
  const summary=summarizeCS(data),portfolio=summary.portfolio,current=portfolio.find(x=>x.project.id===selected);
  const plans=summary.plans,activePlans=summary.activePlans,highPortfolio=summary.highPortfolio;
  const visible=portfolio.filter(x=>(filter==='Todos'||x.level===filter)&&(tier==='Todos'||x.project.metadata?.cs_portfolio===tier)&&x.project.client.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  const scope=current?.project.client||'Toda a carteira';
  const scopedPlans=plans.filter(p=>!selected||p.project_id===selected).sort((a,b)=>Number(closed(a.status))-Number(closed(b.status))||(a.due_date||'9999').localeCompare(b.due_date||'9999'));
  function createPlan(projectId=selected,suggestion='',intent=''){
    const item=portfolio.find(x=>x.project.id===(projectId||portfolio[0]?.project.id));
    if(!item)return;
    const fromChai=Boolean(suggestion.trim());
    const category=fromChai?inferCSCategory(intent+' '+suggestion):'Acompanhamento';
    const plan=buildCSDraft(item.project,item.project.owner||owner,suggestion||item.nextAction,category);
    if(!fromChai&&item.level==='Crítico')plan.priority='Alta';
    setDraft(plan);setSaveError('');
    setNotice(fromChai?'Rascunho criado pela chAI como '+category+'. Revise contexto, prazo e critério de sucesso antes de salvar.':'');
  }
  async function save(event:React.FormEvent){
    event.preventDefault();if(!draft||saveLock.current)return;
    if(!draft.project_id||!draft.title.trim()||!draft.owner.trim()||!draft.due_date||!draft.strategy.trim()||!draft.detail.trim()){setSaveError('Preencha cliente, título, responsável, data, objetivo e próxima ação.');return;}
    if(closed(draft.status)&&!draft.evidence.trim()){setSaveError('Registre a evidência e o resultado antes de concluir o acompanhamento.');return;}
    saveLock.current=true;setSaving(true);setSaveError('');
    try{await onSave({...draft,progress:closed(draft.status)?100:draft.status==='Em andamento'?50:0});setDraft(null);setNotice(demo?'Plano atualizado nesta demonstração. Ele não será mantido ao recarregar.':'Plano salvo na sua carteira.');}
    catch(e){setSaveError(e instanceof Error?e.message:'Não foi possível salvar o plano.');}
    finally{saveLock.current=false;setSaving(false);}
  }
  async function ask(text=question){
    if(requestLock.current||!text.trim())return;
    const entry:Message={role:'user',content:text.trim(),scope};
    const history=[...messages,entry];setMessages(history);setQuestion('');setChatError('');
    requestLock.current=true;setAsking(true);const controller=new AbortController();abortRef.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),55000);
    try{
      const response=await fetch('/api/chai',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},signal:controller.signal,
        body:JSON.stringify({demo,project_id:selected,messages:history.filter(m=>m.scope===scope&&m.mode!=='rules').slice(-8).map(({role,content})=>({role,content}))})});
      const result=await response.json() as {answer?:string;message?:string};
      if(!response.ok||!result.answer)throw new Error(result.message||'A chAI não conseguiu responder agora.');
      setMessages(m=>[...m,{role:'assistant',content:result.answer!,mode:'ai',scope}]);
    }catch(e){setChatError(e instanceof Error&&e.name!=='AbortError'?e.message:'A resposta demorou mais que o esperado. Tente novamente.');}
    finally{window.clearTimeout(timeout);abortRef.current=null;requestLock.current=false;setAsking(false);}
  }
  function chooseClient(id:string){setSelected(id);setMessages([]);setChatError('');}
  return <>
    <header className={s.pageHead}><div><span className={s.eyebrow}>SUCESSO DO CLIENTE</span><h1>Cuidar da relação. Sustentar o resultado.</h1><p>Saúde da carteira, atritos e reversões com próximos passos claros.</p></div><button className={s.btn+' '+s.primary} disabled={!data.projects.length} onClick={()=>createPlan()}><Plus size={17}/>Novo acompanhamento</button></header>
    {demo&&<p className={s.csDemo}>Demonstração com dados fictícios. Os planos ficam apenas nesta sessão e a chAI usa IA real sobre essa base fictícia.</p>}
    <section className={s.csKpis} aria-label="Indicadores de sucesso do cliente">
      <button onClick={()=>{setTier('Alta');setFilter('Todos')}} className={s.csKpi}><span>CARTEIRA ALTA</span><b>{highPortfolio.length}</b><small>contas estratégicas de maior valor</small></button>
      <button onClick={()=>{setTier('Todos');setFilter('Crítico')}} className={s.csKpi}><span>PRECISAM DE AÇÃO</span><b>{summary.critical}</b><small>clientes em situação crítica</small></button>
      <button onClick={()=>{setTier('Todos');setFilter('Atenção')}} className={s.csKpi}><span>EM ATENÇÃO</span><b>{summary.attention}</b><small>acompanhamento preventivo</small></button>
      <div className={s.csKpi}><span>REVERSÕES ABERTAS</span><b>{summary.reversalsOpen}</b><small>planos em condução</small></div>
      <div className={s.csKpi}><span>CONTATOS ATRASADOS</span><b>{summary.overdueContacts}</b><small>próximo contato vencido</small></div>
    </section>
    {notice&&<div role="status" className={s.metaSuccess}><CheckCircle2 size={18}/>{notice}</div>}
    <div className={s.csLayout}>
      <div className={s.csMain}>
        <section className={s.dashboardCard}>
          <div className={s.dashboardTitle}><div><h2><HeartPulse size={18}/> Saúde da carteira</h2><p>Selecione um cliente para orientar a conversa com a chAI.</p></div><span className={s.badge}>{portfolio.length} clientes</span></div>
          <div className={s.csFilters}><label>Buscar cliente<input className={s.input} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome do cliente"/></label><label>Carteira<select className={s.input} value={tier} onChange={e=>setTier(e.target.value)}><option>Todos</option><option>Alta</option></select></label><label>Saúde<select className={s.input} value={filter} onChange={e=>setFilter(e.target.value)}>{['Todos','Crítico','Atenção','Estável','Sem dados'].map(x=><option key={x}>{x}</option>)}</select></label></div>
          <div className={s.csClientList}>{visible.map(item=><button key={item.project.id} className={s.csClient+(selected===item.project.id?' '+s.csSelected:'')} disabled={asking} onClick={()=>chooseClient(item.project.id)}>
            <div className={s.csScore} data-level={item.level}><b>{item.score??'?'}</b><small>{item.score===null?'sem dados':'/ 100'}</small></div>
            <div className={s.csClientText}><strong>{item.project.client}{item.project.metadata?.cs_portfolio==='Alta'&&<em className={s.csTier}>Carteira alta</em>}</strong><span>{item.level} · {item.project.owner||'Sem responsável'} · {item.project.phase}</span><small>{item.signals[0]?.reason||item.gaps[0]||'Sem alerta nas regras atuais'}</small></div><ArrowUpRight size={16}/>
          </button>)}</div>
          {!visible.length&&<div className={s.empty}>Nenhum cliente nesse filtro.</div>}
          <details className={s.csMethod}><summary>Como a saúde é calculada?</summary><p>É uma regra de priorização, não uma previsão de cancelamento. A base é 100 pontos: risco alto −30 ou médio −15; implantação atrasada −20; bloqueio −20; entrega atrasada −10 ou crítica −20; teste reprovado −20; avaliação negativa −25 ou intermediária −10; reversão aberta −40; atrito aberto −20; contato de CS atrasado −10. A nota mínima é zero.</p><p>Abaixo de 50: crítico. De 50 a 79: atenção. De 80 a 100: estável. Sem registros suficientes, não há nota. A última avaliação só influencia a nota se tiver até 90 dias. “Estável” não comprova satisfação nem adoção.</p></details>
        </section>
        {current&&<section className={s.dashboardCard}>
          <div className={s.dashboardTitle}><div><span className={s.eyebrow}>CLIENTE EM FOCO</span><h2>{current.project.client}</h2></div><button className={s.link} onClick={()=>onOpen(current.project.id)}>Abrir implantação</button></div>
          <div className={s.csSignals}>{current.signals.map(signal=><div key={signal.reason}><span>{signal.source}</span><strong>{signal.reason}</strong><small>−{signal.points} pontos</small></div>)}{!current.signals.length&&<p>Não há alerta nas regras atuais. Confirme a percepção do cliente no próximo contato.</p>}</div>
          {current.gaps.length>0&&<p className={s.csMissing}>Informações a completar: {current.gaps.join(' · ')}.</p>}
          <div className={s.csNext}><Target size={20}/><div><strong>Próxima ação sugerida por regras</strong><p>{current.nextAction}</p></div></div>
          <button className={s.btn+' '+s.primary} onClick={()=>createPlan(current.project.id)}>Transformar em acompanhamento</button>
        </section>}
        {draft&&<section ref={editor} className={s.dashboardCard+' '+s.csEditor} aria-label="Editor de acompanhamento">
          <div className={s.dashboardTitle}><h2>{draft.id?'Editar acompanhamento':'Novo acompanhamento'}</h2><button className={s.btn+' '+s.ghost} disabled={saving} onClick={()=>setDraft(null)} aria-label="Fechar editor"><X size={18}/></button></div>
          <form onSubmit={save}><fieldset disabled={saving} className={s.labFieldset}><div className={s.form}>
            <label>Cliente<select className={s.input} value={draft.project_id} onChange={e=>setDraft({...draft,project_id:e.target.value})} required>{data.projects.map(p=><option key={p.id} value={p.id}>{p.client}</option>)}</select></label>
            <label>Objetivo do acompanhamento<select className={s.input} value={csCategory(draft)} onChange={e=>setDraft({...draft,dependency:'CS:'+e.target.value,kind:['Atrito','Reversão'].includes(e.target.value)?'Risco':'Processo'})}>{csCategories.map(c=><option key={c}>{c}</option>)}</select></label>
            <label className={s.full}>Título<input className={s.input} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} maxLength={200} required/></label>
            <label>Responsável<input className={s.input} value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})} maxLength={120} required/></label>
            <label>Próximo contato<input className={s.input} type="date" value={draft.due_date||''} onChange={e=>setDraft({...draft,due_date:e.target.value})} required/></label>
            <label>Situação<select className={s.input} value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{csStatuses.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Prioridade<select className={s.input} value={draft.priority} onChange={e=>setDraft({...draft,priority:e.target.value})}><option>Baixa</option><option>Normal</option><option>Alta</option></select></label>
            <label className={s.full}>Contexto, objetivo e critério de sucesso<textarea className={s.textarea} value={draft.detail} onChange={e=>setDraft({...draft,detail:e.target.value})} maxLength={4000} placeholder="O que aconteceu? O que precisa melhorar? Como saberemos que funcionou?" required/></label>
            <label className={s.full}>Estratégia e próxima ação<textarea className={s.textarea} value={draft.strategy} onChange={e=>setDraft({...draft,strategy:e.target.value})} maxLength={2000} required/></label>
            <label className={s.full}>Histórico de contatos e evidência do resultado<textarea className={s.textarea} value={draft.evidence} onChange={e=>setDraft({...draft,evidence:e.target.value})} maxLength={2000} required={closed(draft.status)} placeholder="Registre data, retorno do cliente e resultado. Obrigatório para concluir."/></label>
          </div>{saveError&&<p className={s.labError} role="alert">{saveError}</p>}<button className={s.btn+' '+s.primary} type="submit">{saving?'Salvando...':'Salvar acompanhamento'}</button></fieldset></form>
        </section>}
        <section className={s.dashboardCard}>
          <div className={s.dashboardTitle}><div><h2>Planos e próximos contatos</h2><p>{selected?scope:'Toda a carteira'} · {scopedPlans.length} registros</p></div>{selected&&<button className={s.link} disabled={asking} onClick={()=>chooseClient('')}>Ver todos</button>}</div>
          <div className={s.csPlans}>{scopedPlans.map(p=><article key={p.id} className={s.csPlan}>
            <div><span className={s.badge}>{csCategory(p)}</span><span>{p.status}</span></div><h3>{p.title}</h3><small>{data.projects.find(x=>x.id===p.project_id)?.client} · {p.owner}</small><p>{p.strategy}</p><div><span className={!closed(p.status)&&p.due_date&&p.due_date<new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())?s.csOverdue:''}>Próximo contato: {date(p.due_date)}</span><button className={s.link} onClick={()=>{setDraft(p);setSaveError('');}}>Atualizar</button></div>{p.evidence&&<details><summary>Histórico e resultado</summary><p>{p.evidence}</p></details>}
          </article>)}</div>{!scopedPlans.length&&<div className={s.empty}>Crie um acompanhamento para organizar ações, prazos e retornos.</div>}
        </section>
      </div>
      <aside className={s.chaiPanel} aria-labelledby="chai-heading">
        <div className={s.chaiHeading}><span className={s.chaiAvatar}><Sparkles size={23}/></span><div><h2 id="chai-heading">chAI</h2><p>Sua parceira de sucesso do cliente</p></div></div>
        <label className={s.chaiScope}>Contexto da conversa<select className={s.input} value={selected} disabled={asking} onChange={e=>chooseClient(e.target.value)}><option value="">Toda a carteira</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.client}</option>)}</select></label>
        <p className={s.chaiDisclosure}>{demo?'Modo demonstrativo com IA real sobre dados fictícios.':'A chAI consulta os registros da sua carteira para responder. As sugestões precisam da sua revisão.'}</p>
        <div className={s.chaiConversation} role="log" aria-live="polite" aria-label="Conversa com a chAI">
          {!messages.length&&<div className={s.chaiWelcome}><MessageCircle size={25}/><h3>Vamos cuidar dessa relação?</h3><p>Posso ajudar a priorizar sua carteira, entender os sinais de atrito e preparar uma estratégia de reversão.</p></div>}
          {messages.map((m,i)=><article key={i} className={s.chaiMessage} data-role={m.role}><small>{m.role==='user'?'Você':m.mode==='ai'?'chAI · resposta de IA':'Sugestão por regras'} · {m.scope}</small><p>{m.content}</p>{m.role==='assistant'&&selected&&<button className={s.link} onClick={()=>{const intent=messages.slice(0,i).reverse().find(x=>x.role==='user'&&x.scope===m.scope)?.content||'';createPlan(selected,m.content,intent)}}>Transformar em plano de CS</button>}</article>)}
          {asking&&<p role="status" className={s.chaiDisclosure}>A chAI está analisando os registros...</p>}<div ref={chatEnd}/>
        </div>
        {chatError&&<div className={s.labError} role="alert">{chatError}</div>}
        <div className={s.chaiSuggestions}>{['Quem precisa de atenção?','Como conduzir a reversão?','Sugira uma mensagem de contato'].map(q=><button key={q} disabled={asking||!data.projects.length} onClick={()=>void ask(q)}>{q}</button>)}</div>
        <form className={s.chaiComposer} onSubmit={e=>{e.preventDefault();void ask();}}><label htmlFor="chai-question">Pergunte à chAI</label><textarea id="chai-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={2000} placeholder="Como posso melhorar a saúde desta carteira?" disabled={asking}/><div><small>Conversa desta sessão</small><button className={s.btn+' '+s.primary} type="submit" disabled={asking||!question.trim()||!data.projects.length}><Send size={15}/>Perguntar</button></div></form>
        <small className={s.chaiFooter}>Nenhuma mensagem é enviada ao cliente. Uma sugestão só vira plano quando você a revisar e salvar.</small>
      </aside>
    </div>
  </>;
}
