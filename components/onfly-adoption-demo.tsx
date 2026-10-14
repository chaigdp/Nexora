'use client';
import {useEffect,useMemo,useState} from 'react';

const STORAGE='vectta.demo.onfly.dell.interview.v1';
type Note={diagnosis:string;barriers:string;expectations:string;agreements:string;nextSteps:string;owner:string;deadline:string;priority:'Baixa'|'Média'|'Alta';extra:string};
type RecordEntry={id:string;date:string;notes:Note};
const empty:Note={diagnosis:'',barriers:'',expectations:'',agreements:'',nextSteps:'',owner:'',deadline:'',priority:'Média',extra:''};
const baseSteps=[
 {title:'Validar o diagnóstico com Natália',owner:'Analista de implantação',due:'Reunião inicial',why:'Entender por que a Dell utiliza menos a plataforma do que o potencial comercial estimado.',metric:'Causa principal registrada'},
 {title:'Mapear o fluxo real de viagens',owner:'Natália + áreas envolvidas',due:'Após o diagnóstico',why:'Comparar reservas na Onfly com os caminhos externos, sem presumir a causa.',metric:'Fluxo e barreiras documentados'},
 {title:'Executar piloto de reengajamento',owner:'Equipe Onfly + responsável Dell',due:'Prazo a combinar',why:'Testar uma correção ou orientação com grupo reduzido antes de expandir.',metric:'Adesão e percepção do piloto'},
 {title:'Revisar resultados e próximos passos',owner:'Analista + Natália',due:'Data acordada em reunião',why:'Medir utilização, objeções remanescentes e necessidade de ajustes.',metric:'Evolução de adoção acompanhada'}
];
const questions=[
 'Como nasce, é aprovada e é concluída uma solicitação de viagem atualmente?',
 'Quando a reserva não acontece pela Onfly, que alternativa é utilizada e por quê?',
 'Em qual etapa surgem mais dificuldades para você e para os viajantes?',
 'Que mudança tornaria a Onfly mais útil na sua operação?'
];
const responses:Record<string,string>={
 'Preço':'Entendo. Podemos comparar uma emissão com as mesmas condições e identificar o que pesa mais na decisão?',
 'Uso por fora':'O que o processo atual resolve melhor? Em que etapa ele exige mais trabalho manual?',
 'Sem tempo para treinar':'Qual formato de orientação caberia na sua rotina, sem gerar mais trabalho?',
 'Expectativa não atendida':'O que foi combinado, qual foi o impacto e qual seria um retorno útil para você?'
};
const panel:React.CSSProperties={background:'rgba(90,100,155,.1)',padding:18,borderRadius:16};
const field:React.CSSProperties={display:'block',width:'100%',boxSizing:'border-box',padding:11,borderRadius:9,marginTop:6,background:'#17223d',color:'#fff',border:'1px solid #65739b',font:'inherit'};
const btn:React.CSSProperties={padding:'11px 18px',borderRadius:10,background:'#06b6d4',color:'#081425',fontWeight:700,border:0,cursor:'pointer'};
function splitItems(text:string){return text.split(/\n|;/).map(t=>t.replace(/^[-*•\d.)\s]+/,'').trim()).filter(Boolean);}
function unique(items:string[]){return [...new Set(items.map(i=>i.trim()).filter(Boolean))];}
export default function OnflyAdoptionDemo(){
 const [draft,setDraft]=useState<Note>(empty);
 const [saved,setSaved]=useState<Note|null>(null);
 const [history,setHistory]=useState<RecordEntry[]>([]);
 const [done,setDone]=useState<string[]>([]);
 const [objection,setObjection]=useState('');
 const [ready,setReady]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{
  try{const value=localStorage.getItem(STORAGE);if(value){const parsed=JSON.parse(value);if(parsed?.saved){const restored={...empty,...parsed.saved};setSaved(restored);setDraft(restored);}if(Array.isArray(parsed?.history))setHistory(parsed.history);if(Array.isArray(parsed?.done))setDone(parsed.done);}}catch{setMessage('Não foi possível ler o registro anterior deste navegador.');}
  setReady(true);
 },[]);
 const set=(name:keyof Note,value:string)=>{setDraft(current=>({...current,[name]:value}));setMessage('Alterações ainda não salvas.');};
 const actions=useMemo(()=>{
  const custom=saved?unique([...splitItems(saved.nextSteps),...splitItems(saved.agreements)]):[];
  return [...baseSteps.map((a,i)=>({...a,id:'base-'+i,custom:false})),...custom.map((title,i)=>({id:'custom-'+title,title,owner:saved?.owner||'A definir',due:saved?.deadline||'A combinar',why:'Ação ou compromisso registrado na reunião simulada.',metric:'Validar evidência de conclusão',custom:true}))];
 },[saved]);
 const save=()=>{
  if(!draft.diagnosis.trim()&&!draft.barriers.trim()&&!draft.expectations.trim()&&!draft.agreements.trim()&&!draft.nextSteps.trim()&&!draft.extra.trim()){
   setMessage('Registre ao menos uma informação da conversa antes de salvar.');return;
  }
  const now=new Date();
  const entry={id:now.toISOString(),date:now.toLocaleString('pt-BR'),notes:{...draft}};
  const nextHistory=[entry,...history].slice(0,30);
  const nextDone=done;
  try{
   localStorage.setItem(STORAGE,JSON.stringify({saved:draft,history:nextHistory,done:nextDone}));
   setSaved({...draft});setHistory(nextHistory);
   setMessage('Registro salvo! Diagnóstico, combinados e plano de ação atualizados nesta demonstração.');
  }catch{setMessage('Não foi possível salvar neste navegador. Verifique o armazenamento disponível.');}
 };
 const toggle=(id:string,checked:boolean)=>{
  const next=checked?unique([...done,id]):done.filter(x=>x!==id);
  setDone(next);
  try{localStorage.setItem(STORAGE,JSON.stringify({saved,history,done:next}));}catch{setMessage('Não foi possível persistir esta alteração.');}
 };
 const completed=actions.filter(a=>done.includes(a.id)).length;
 return <div style={{display:'grid',gap:18}}>
  <header><span style={{letterSpacing:2,fontSize:12,color:'#06b6d4'}}>LABORATÓRIO DE DEMONSTRAÇÃO · CENÁRIO FICTÍCIO</span><h1 style={{margin:'10px 0'}}>Dell + Onfly | Recuperação de adoção</h1><p>Cliente já implantado. Objetivo: investigar barreiras, contornar objeções e construir um plano de reengajamento. Simulação sem acesso à conta real da Dell.</p></header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12}}>
   {[['900','Colaboradores no Brasil'],['150','Viajantes recorrentes'],['R$ 300 mil','Potencial mensal estimado'],['R$ 50 mil','Média mensal dos últimos 3 meses'],['16,7%','Consumo / potencial']].map(([v,l])=><div key={l} style={{background:'rgba(90,100,155,.13)',border:'1px solid rgba(140,160,210,.23)',borderRadius:14,padding:16}}><div style={{fontSize:23,fontWeight:700}}>{v}</div><div style={{fontSize:12,opacity:.8}}>{l}</div></div>)}
  </div>
  <p style={{fontSize:13,opacity:.85}}>A diferença de R$ 250 mil é entre consumo observado e potencial estimado, não uma perda financeira comprovada. Não há histórico suficiente para afirmar queda de consumo.</p>
  <section style={panel}><h2>1. Diagnóstico consultivo</h2><p>Converse com Natália antes de apresentar uma solução. Escolha perguntas conforme suas respostas.</p><ol>{questions.map(q=><li key={q} style={{margin:'9px 0'}}>{q}</li>)}</ol></section>
  <section style={panel}><h2>2. Tratamento de objeções</h2><label htmlFor="onfly-objection">Objeção mencionada pela cliente</label><select id="onfly-objection" value={objection} onChange={e=>setObjection(e.target.value)} style={{...field,maxWidth:420,margin:'9px 0 12px'}}><option value="">Selecione uma objeção para simular</option>{Object.keys(responses).map(x=><option key={x}>{x}</option>)}</select>{objection&&<p style={{borderLeft:'3px solid #06b6d4',paddingLeft:12}}>{responses[objection]}</p>}</section>
  <section style={{...panel,border:'1px solid rgba(6,182,212,.45)'}}>
   <h2>3. Bloco de notas da reunião</h2>
   <p>Registre o que Natália disser durante a entrevista simulada. Ao clicar em <strong>Salvar anotações</strong>, as informações aparecem no diagnóstico, nos combinados e no plano de ação abaixo.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
    {([
     ['diagnosis','Diagnóstico e contexto','O que a cliente contou? Como funciona hoje?'],
     ['barriers','Dificuldades e objeções','Quais obstáculos foram identificados?'],
     ['expectations','Expectativas e objetivos','O que ela espera da Onfly?'],
     ['agreements','Combinados','Um compromisso por linha. Ex.: Natália enviará dados de reservas.'],
     ['nextSteps','Próximas ações','Uma ação por linha. Ex.: Agendar treinamento dos viajantes.'],
     ['extra','Outras observações','Informações importantes que não se encaixam nos campos anteriores.']
    ] as [keyof Note,string,string][]).map(([key,title,hint])=><label key={key} style={{fontWeight:600}}>{title}<textarea value={draft[key]} onChange={e=>set(key,e.target.value)} placeholder={hint} rows={4} style={{...field,resize:'vertical',fontWeight:400}}/></label>)}
    <label style={{fontWeight:600}}>Responsável pelos novos compromissos<input value={draft.owner} onChange={e=>set('owner',e.target.value)} placeholder="Ex.: Natália e analista Onfly" style={{...field,fontWeight:400}}/></label>
    <label style={{fontWeight:600}}>Prazo combinado<input type="date" value={draft.deadline} onChange={e=>set('deadline',e.target.value)} style={{...field,fontWeight:400}}/></label>
    <label style={{fontWeight:600}}>Prioridade<select value={draft.priority} onChange={e=>set('priority',e.target.value)} style={{...field,fontWeight:400}}><option>Baixa</option><option>Média</option><option>Alta</option></select></label>
   </div>
   <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,marginTop:17}}><button type="button" onClick={save} style={btn}>Salvar anotações e atualizar plano</button><span role="status" aria-live="polite" style={{fontSize:13}}>{message|| (ready?'Anotações disponíveis para edição.':'Carregando anotações…')}</span></div>
   <p style={{fontSize:12,opacity:.75,marginTop:12}}>Salvamento somente neste navegador, neste dispositivo e neste cenário fictício. Não altera clientes ou tarefas reais no Vectta. Não cole dados pessoais ou sigilosos de empresas reais.</p>
   {history.length>0&&<details style={{marginTop:12}}><summary style={{cursor:'pointer'}}>Histórico de salvamentos ({history.length})</summary><ol>{history.map(item=><li key={item.id} style={{marginTop:10}}><strong>{item.date}</strong> <button type="button" style={{marginLeft:8,cursor:'pointer',border:'1px solid #65739b',borderRadius:7,padding:'5px 8px',background:'transparent',color:'inherit'}} onClick={()=>{setDraft({...empty,...item.notes});setMessage('Versão recuperada para edição. Clique em Salvar para aplicá-la ao plano.');}}>Recuperar para edição</button></li>)}</ol></details>}
  </section>
  {saved&&<section style={panel}><h2>4. Resumo estruturado da reunião</h2><p>Consolidado a partir do último salvamento. Campos vazios permanecem pendentes de confirmação.</p><div style={{display:'grid',gap:10}}>{([['Diagnóstico',saved.diagnosis],['Barreiras identificadas',saved.barriers],['Expectativas',saved.expectations],['Combinados',saved.agreements],['Outras observações',saved.extra]] as [string,string][]).map(([title,value])=><div key={title}><strong>{title}</strong><p style={{whiteSpace:'pre-wrap',margin:'5px 0'}}>{value||'Não informado na reunião.'}</p></div>)}</div><p><strong>Responsável:</strong> {saved.owner||'A definir'} | <strong>Prazo:</strong> {saved.deadline?new Date(saved.deadline+'T12:00:00').toLocaleDateString('pt-BR'):'A combinar'} | <strong>Prioridade:</strong> {saved.priority}</p></section>}
  <section style={panel}><h2>5. Plano de recuperação de adoção</h2><p>As quatro ações iniciais são sugestões. As ações e os combinados registrados no bloco de notas são acrescentados após salvar. A conclusão de atividades também fica salva neste navegador.</p><div style={{display:'grid',gap:10}}>{actions.map(step=><label key={step.id} style={{display:'flex',gap:12,padding:14,border:'1px solid rgba(160,175,210,.2)',borderRadius:12}}><input type="checkbox" checked={done.includes(step.id)} onChange={e=>toggle(step.id,e.target.checked)} style={{width:18,alignSelf:'start'}}/><span><strong>{step.title}</strong>{step.custom&&<span style={{fontSize:11,marginLeft:8,color:'#22d3ee'}}>REGISTRADO NA REUNIÃO</span>}<span style={{display:'block',fontSize:13,opacity:.82,marginTop:5}}>{step.why}</span><span style={{display:'block',fontSize:12,marginTop:6}}>Responsável: {step.owner} | Prazo: {step.due} | Evidência: {step.metric}</span></span></label>)}</div><p style={{marginTop:12}}>Progresso simulado: {completed} de {actions.length} ações</p><div role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={actions.length} aria-label="Ações simuladas concluídas" style={{height:8,borderRadius:8,overflow:'hidden',background:'rgba(150,165,200,.25)'}}><div style={{height:'100%',width:(completed/actions.length*100)+'%',background:'#06b6d4'}}/></div></section>
  <section style={panel}><h2>6. Critérios de acompanhamento</h2><p>Acompanhar a proporção de reservas efetuadas pela Onfly, motivos de reservas fora da plataforma, participação dos viajantes no piloto, satisfação de Natália e resolução dos impedimentos identificados. Estabelecer metas somente após validar a linha de base e os responsáveis.</p><strong>Fechamento consultivo:</strong><p>“Natália, qual obstáculo devemos resolver primeiro, quem precisa participar e quando revisitaremos os resultados?”</p></section>
 </div>;
}
