'use client';
import {useEffect,useMemo,useState} from 'react';
import {
  LayoutDashboard,Layers3,ListTodo,ChartNoAxesCombined,ShieldCheck,BookOpen,AlertTriangle,
  CalendarDays,ClipboardCheck,TestTube2,Headphones,Workflow,Settings2,Plug,WalletCards,
  Plus,Search,ChevronRight,Check,Clock3,Menu,LogOut,X,KeyRound,ArrowLeft,UserRound,MessageSquare,Send,Camera,Phone,Route,BarChart3,RefreshCw
} from 'lucide-react';
import s from './vectta.module.css';

const SUPA='https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY='sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';
const VT='https://588b1eb0-7217-4ce5-a0c1-281504d2838d.sandbox.floot.app/_cdn/static/302c58fd-b5fb-4f6e-ad67-88ed9875cc81-vectta-vt-official.png';
const MASCOT='https://588b1eb0-7217-4ce5-a0c1-281504d2838d.sandbox.floot.app/_cdn/static/fe3b931e-e202-4799-b08a-f388c75ed8ac-chai-mascot-official.png';
const CHAI='https://588b1eb0-7217-4ce5-a0c1-281504d2838d.sandbox.floot.app/_cdn/static/f9508fc8-d95a-4d32-a012-7ee04104da7d-chai-logo-official.png';

type Risk='Baixo'|'Médio'|'Alto';
type Project={id:string;client:string;segment:string;system:string;owner:string;phase:string;start_date:string|null;due_date:string|null;completed_date?:string|null;scope:string;manual_risk_level:Risk;metadata:any;cnpj?:string;contact_name?:string;contact_email?:string;contact_phone?:string;message_opt_in?:boolean;preferred_channel?:string};
type Task={id:string;project_id:string;title:string;owner:string;due_date:string|null;done:boolean;critical:boolean;kind:string;priority:string;blocked:boolean;detail:any};
type Op={id:string;project_id:string;kind:string;title:string;owner:string;due_date:string|null;status:string;priority:string;detail:string;evidence:string;strategy:string;progress:number};
type Session={access_token:string;refresh_token?:string;user:{id:string;email?:string;user_metadata?:any}};
type Profile={id:string;full_name:string;workspace_name:string;phone?:string;avatar_url?:string};
type Feedback={id:string;project_id:string;contact_name:string;contact_role:string;channel:string;csat:number|null;nps:number|null;ces:number|null;comment:string;created_at:string};
type Campaign={id:string;name:string;channel:string;message:string;audience:string;status:string;target_filter:any;scheduled_at:string|null;created_at:string};

const phases=['Descoberta','Planejamento e desenho','Configuração','Integrações','Migração','Testes','Treinamento','Prontidão e cutover','Entrada em operação','Acompanhamento','Concluída'];
const trailStages=[
 {phase:'Descoberta',title:'Descoberta',desc:'Objetivos, processos, escopo, stakeholders e critérios de sucesso.'},
 {phase:'Planejamento e desenho',title:'Planejamento',desc:'Plano, arquitetura, responsabilidades, cronograma e desenho da solução.'},
 {phase:'Configuração',title:'Configuração',desc:'Parametrização, construção, regras, segurança e preparação do ambiente.'},
 {phase:'Integrações',title:'Integrações',desc:'Conexões com sistemas externos, APIs, dependências e cenários de falha.'},
 {phase:'Migração',title:'Migração de dados',desc:'Limpeza, carga, reconciliação e validações com dados reais.'},
 {phase:'Testes',title:'Testes e UAT',desc:'Testes funcionais, integrados, performance e aceite dos usuários.'},
 {phase:'Treinamento',title:'Treinamento',desc:'Capacitação, comunicação, materiais e preparação para mudança.'},
 {phase:'Prontidão e cutover',title:'Prontidão e cutover',desc:'Checklist de go-live, plano de virada, contingência e aprovações.'},
 {phase:'Entrada em operação',title:'Go-live',desc:'Entrada em produção, validação do negócio e monitoramento intensivo.'},
 {phase:'Acompanhamento',title:'Hypercare',desc:'Estabilização, suporte reforçado, adoção e transferência para operação.'},
 {phase:'Concluída',title:'Evolução contínua',desc:'Encerramento formal, lições aprendidas, ganhos e próximos ciclos.'}
];
const nav=[
['Início',LayoutDashboard],['Visão geral',ChartNoAxesCombined],['Implantações',Layers3],['Pendências',ListTodo],
['Resultados',WalletCards],['Relatórios e dados',BarChart3],['Feedbacks',MessageSquare],['Campanhas',Send],['Segurança',ShieldCheck],['Guia de uso',BookOpen],['Riscos e estratégias',AlertTriangle],
['Cronograma',CalendarDays],['Requisitos',ClipboardCheck],['Testes',TestTube2],['Chamados',Headphones],
['Processos',Workflow],['Manual ERP',Settings2],['Entrada em operação',Check],['Integrações',Plug],['Rentabilidade',WalletCards]
] as const;

const demos:Project[]=[
{id:'d1',client:'Farmácias Aurora',segment:'Varejo farmacêutico',system:'ERP Integrado',owner:'Chai',phase:'Testes',start_date:'2026-09-10',due_date:'2026-10-18',scope:'Financeiro, estoque, compras, cadastro e treinamento.',manual_risk_level:'Médio',metadata:{revenue:12500,actualHours:42,hourCost:65}},
{id:'d2',client:'Mercado Horizonte',segment:'Supermercado',system:'ERP Comercial',owner:'Chai',phase:'Configuração',start_date:'2026-09-18',due_date:'2026-10-29',scope:'Cadastro, vendas, fiscal, relatórios e gestão de lojas.',manual_risk_level:'Baixo',metadata:{revenue:18000,actualHours:29,hourCost:70}},
{id:'d3',client:'Academia Vértice',segment:'Fitness',system:'Gestão de unidades',owner:'Chai',phase:'Treinamento',start_date:'2026-09-01',due_date:'2026-10-10',scope:'Planos, recepção, financeiro e operação de 10 unidades.',manual_risk_level:'Alto',metadata:{revenue:9800,actualHours:39,hourCost:60}},
{id:'d4',client:'Oficina Cedro',segment:'Serviços automotivos',system:'ERP Oficina',owner:'Chai',phase:'Acompanhamento',start_date:'2026-08-20',due_date:'2026-10-24',scope:'Ordens de serviço, estoque, financeiro e pós-venda.',manual_risk_level:'Baixo',metadata:{revenue:7200,actualHours:31,hourCost:55}},
{id:'d5',client:'Conecta Telecom',segment:'Telecom',system:'CRM + Billing',owner:'Chai',phase:'Migração',start_date:'2026-09-15',due_date:'2026-10-14',scope:'Base de clientes, billing, suporte e integrações.',manual_risk_level:'Médio',metadata:{revenue:22400,actualHours:48,hourCost:82}}
];
const demoTasks:Task[]=[
{id:'t1',project_id:'d1',title:'Validar integração fiscal',owner:'Chai',due_date:'2026-10-07',done:false,critical:true,kind:'Entrega',priority:'Alta',blocked:false,detail:{progress:60}},
{id:'t2',project_id:'d1',title:'Executar testes de estoque',owner:'Cliente',due_date:'2026-10-08',done:false,critical:true,kind:'Entrega',priority:'Alta',blocked:false,detail:{progress:40}},
{id:'t3',project_id:'d2',title:'Configurar regras de preço',owner:'Chai',due_date:'2026-10-09',done:false,critical:false,kind:'Entrega',priority:'Normal',blocked:false,detail:{progress:30}},
{id:'t4',project_id:'d3',title:'Treinar líderes das unidades',owner:'Chai',due_date:'2026-10-06',done:false,critical:true,kind:'Entrega',priority:'Alta',blocked:true,detail:{progress:35}},
{id:'t5',project_id:'d4',title:'Revisar indicadores pós-go-live',owner:'Chai',due_date:'2026-10-12',done:false,critical:false,kind:'Entrega',priority:'Normal',blocked:false,detail:{progress:70}},
{id:'t6',project_id:'d5',title:'Conferir amostra da migração',owner:'Cliente',due_date:'2026-10-05',done:false,critical:true,kind:'Entrega',priority:'Alta',blocked:false,detail:{progress:55}}
];
const demoOps:Op[]=[
{id:'o1',project_id:'d1',kind:'Requisito',title:'Integração fiscal homologada',owner:'Cliente',due_date:'2026-10-07',status:'Aprovado',priority:'Alta',detail:'Escopo fiscal definido.',evidence:'Ata de aceite',strategy:'',progress:100},
{id:'o2',project_id:'d1',kind:'Teste',title:'Fluxo de entrada de estoque',owner:'Chai',due_date:'2026-10-08',status:'Em andamento',priority:'Alta',detail:'Teste ponta a ponta.',evidence:'',strategy:'',progress:60}
];

const fmt=(v:string|null)=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const badge=(r:Risk)=>r==='Alto'?s.bad:r==='Médio'?s.warn:s.ok;

export default function Page(){
 const [session,setSession]=useState<Session|null>(null);
 const [projects,setProjects]=useState<Project[]>([]);
 const [tasks,setTasks]=useState<Task[]>([]);
 const [ops,setOps]=useState<Op[]>([]);
 const [feedbacks,setFeedbacks]=useState<Feedback[]>([]);
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [view,setView]=useState('Início');
 const [previousView,setPreviousView]=useState('Início');
 const [selected,setSelected]=useState('');
 const [query,setQuery]=useState('');
 const [phase,setPhase]=useState('Todas');
 const [demo,setDemo]=useState(false);
 const [mobile,setMobile]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [mode,setMode]=useState<'login'|'register'|'forgot'>('login');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [busy,setBusy]=useState(false);
 const [modal,setModal]=useState(false);
 const [showTrail,setShowTrail]=useState(false);
 const [trailFocus,setTrailFocus]=useState('');
 const [overviewRisk,setOverviewRisk]=useState<'Todos'|'Alto'|'Médio'|'Baixo'>('Todos');
 const [form,setForm]=useState({client:'',segment:'',system:'',owner:'Chai',phase:'Descoberta',due:'',scope:'',revenue:'0',cnpj:'',contact_name:'',contact_email:'',contact_phone:'',message_opt_in:false,preferred_channel:'WhatsApp'});
 const [feedbackForm,setFeedbackForm]=useState({project_id:'',contact_name:'',contact_role:'',channel:'Reunião',csat:'5',nps:'10',ces:'6',comment:''});
 const [campaignForm,setCampaignForm]=useState({name:'',channel:'WhatsApp',audience:'Todos',message:''});
 const [profileForm,setProfileForm]=useState({full_name:'',workspace_name:'Carteira pessoal',phone:'',avatar_url:''});

 useEffect(()=>{const raw=localStorage.getItem('vectta.session');if(raw){try{setSession(JSON.parse(raw))}catch{}}},[]);
 useEffect(()=>{if(session&&!demo)void load()},[session,demo]);
 useEffect(()=>{if(!session||demo)return;const id=setInterval(()=>void load(),30000);return()=>clearInterval(id)},[session?.access_token,demo]);
 useEffect(()=>{setShowTrail(false);setTrailFocus('')},[selected]);
 useEffect(()=>{if(typeof window==='undefined')return;const h=new URLSearchParams(window.location.hash.slice(1));const access=h.get('access_token'),refresh=h.get('refresh_token');if(!access)return;fetch(SUPA+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+access}}).then(r=>r.json()).then(user=>{if(user?.id){const next={access_token:access,refresh_token:refresh||undefined,user};setSession(next);localStorage.setItem('vectta.session',JSON.stringify(next));history.replaceState(null,'',location.pathname+location.search)}}).catch(()=>{})},[]);

 async function auth(path:string,body:any){
  const r=await fetch(SUPA+'/auth/v1/'+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j:any=await r.json();if(!r.ok)throw new Error(j.msg||j.message||j.error_description||'Não foi possível concluir.');return j;
 }
 async function api(table:string,token:string){
  const r=await fetch(SUPA+'/rest/v1/'+table+'?select=*',{headers:{apikey:KEY,Authorization:'Bearer '+token}});
  const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Falha ao carregar dados.');return j;
 }
 async function load(){
  if(!session)return;
  try{
   const [p,t,o,fb,ca,pr]=await Promise.all([api('projects',session.access_token),api('tasks',session.access_token),api('operations',session.access_token),api('feedbacks',session.access_token),api('campaigns',session.access_token),api('profiles',session.access_token)]);
   setProjects(p);setTasks(t);setOps(o);setFeedbacks(fb);setCampaigns(ca);const own=pr[0]||null;setProfile(own);if(own)setProfileForm({full_name:own.full_name||'',workspace_name:own.workspace_name||'Carteira pessoal',phone:own.phone||'',avatar_url:own.avatar_url||''});
  }catch(e){setError(e instanceof Error?e.message:'Falha ao carregar.')}
 }
 async function submitAuth(){
  setBusy(true);setError('');setNotice('');
  try{
   if(mode==='forgot'){
    await auth('recover',{email,redirect_to:location.origin});setNotice('Se o e-mail existir, enviamos um link de recuperação.');setMode('login');
   }else if(mode==='register'){
    const j=await auth('signup',{email,password,data:{full_name:name}});
    if(j.access_token){setSession(j);localStorage.setItem('vectta.session',JSON.stringify(j))}else{setNotice('Conta criada. Confira seu e-mail se a confirmação estiver ativa.');setMode('login')}
   }else{
    const j=await auth('token?grant_type=password',{email,password});
    setSession(j);localStorage.setItem('vectta.session',JSON.stringify(j));
   }
  }catch(e){setError(e instanceof Error?e.message:'Falha na autenticação.')}finally{setBusy(false)}
 }
 function logout(){localStorage.removeItem('vectta.session');setSession(null);setDemo(false);setProjects([]);setTasks([]);setOps([]);setFeedbacks([]);setCampaigns([]);setProfile(null)}
 function enterDemo(){setDemo(true);setSession({access_token:'demo',user:{id:'demo',email:'demo@vectta.local',user_metadata:{full_name:'Chai'}}});setProjects(demos);setTasks(demoTasks);setOps(demoOps)}
 const current=projects.find(p=>p.id===selected);
 const active=projects.filter(p=>p.phase!=='Concluída');
 const pending=tasks.filter(t=>!t.done);
 const progress=(p:Project)=>{const list=tasks.filter(t=>t.project_id===p.id&&t.kind==='Entrega');return list.length?Math.round(list.filter(t=>t.done).length/list.length*100):0};
 const risk=(p:Project):{level:Risk;causes:string[]}=>{const causes:string[]=[];const pt=tasks.filter(t=>t.project_id===p.id&&!t.done);const po=ops.filter(o=>o.project_id===p.id);if(p.due_date&&p.due_date<today()&&p.phase!=='Concluída')causes.push('Prazo da implantação vencido.');if(pt.some(t=>t.blocked&&t.critical))causes.push('Entrega crítica bloqueada.');else if(pt.some(t=>t.blocked))causes.push('Entrega bloqueada.');if(pt.some(t=>t.critical&&t.due_date&&t.due_date<today()))causes.push('Entrega crítica atrasada.');if(po.some(o=>o.kind==='Teste'&&o.status==='Reprovado'))causes.push('Teste reprovado.');const level:Risk=p.manual_risk_level==='Alto'||causes.some(c=>/crítica|vencido|reprovado/i.test(c))?'Alto':p.manual_risk_level==='Médio'||causes.length?'Médio':'Baixo';return{level,causes}};
 const high=projects.filter(p=>risk(p).level==='Alto').length;
 const filtered=useMemo(()=>projects.filter(p=>(phase==='Todas'||p.phase===phase)&&[p.client,p.system,p.segment,p.cnpj,p.contact_name,p.contact_email,p.contact_phone].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())),[projects,phase,query]);
 const displayName=demo?'Chai':profile?.full_name||session?.user.user_metadata?.full_name||session?.user.email?.split('@')[0]||'Chai';
 const avgProgress=projects.length?Math.round(projects.reduce((sum,p)=>sum+progress(p),0)/projects.length):0;
 const criticalOpen=pending.filter(t=>t.critical).length;
 const blockedOpen=pending.filter(t=>t.blocked).length;
 const completedTasks=tasks.filter(t=>t.done).length;
 const totalRevenue=projects.reduce((a,p)=>a+Number(p.metadata?.revenue||0),0);
 const totalCost=projects.reduce((a,p)=>a+Number(p.metadata?.actualHours||0)*Number(p.metadata?.hourCost||0),0);
 const operatingResult=totalRevenue-totalCost;
 const margin=totalRevenue?Math.round((operatingResult/totalRevenue)*100):0;
 const riskCounts:Record<Risk,number>={Alto:projects.filter(p=>risk(p).level==='Alto').length,Médio:projects.filter(p=>risk(p).level==='Médio').length,Baixo:projects.filter(p=>risk(p).level==='Baixo').length};
 const riskTotal=Math.max(projects.length,1);
 const highPct=Math.round(riskCounts.Alto/riskTotal*100);
 const mediumPct=Math.round(riskCounts.Médio/riskTotal*100);
 const dayBase=new Date(today()+'T12:00:00').getTime();
 const daysUntil=(date:string|null)=>date?Math.ceil((new Date(date+'T12:00:00').getTime()-dayBase)/86400000):null;
 const lateProjects=active.filter(p=>p.due_date&&p.due_date<today()).length;
 const dueSoon=active.filter(p=>{const d=daysUntil(p.due_date);return d!==null&&d>=0&&d<=14}).sort((a,b)=>(a.due_date||'').localeCompare(b.due_date||'')).slice(0,5);
 const riskRank:Record<Risk,number>={Alto:3,Médio:2,Baixo:1};
 const attentionProjects=projects.filter(p=>overviewRisk==='Todos'||risk(p).level===overviewRisk).sort((a,b)=>riskRank[risk(b).level]-riskRank[risk(a).level]||((a.due_date||'9999-12-31').localeCompare(b.due_date||'9999-12-31'))).slice(0,5);
 const phaseOverview=phases.map(name=>({name,count:projects.filter(p=>p.phase===name).length}));
 const maxPhase=Math.max(1,...phaseOverview.map(x=>x.count));
 const deadlineLabel=(d:number|null)=>d===null?'Sem prazo':d<0?Math.abs(d)+'d atrasado':d===0?'Hoje':d===1?'Amanhã':'em '+d+' dias';
 const testOps=ops.filter(o=>o.kind==='Teste');
 const uatRate=testOps.length?Math.round(testOps.filter(o=>o.status==='Aprovado'||o.status==='Concluído').length/testOps.length*100):0;
 const scheduleHealth=active.length?Math.round(active.filter(p=>!p.due_date||p.due_date>=today()).length/active.length*100):100;
 const avgImplDays=projects.length?Math.round(projects.reduce((sum,p)=>{if(!p.start_date)return sum;const end=p.completed_date||today();return sum+Math.max(0,Math.round((new Date(end+'T12:00:00').getTime()-new Date(p.start_date+'T12:00:00').getTime())/86400000))},0)/projects.length):0;
 const scoredCsat=feedbacks.filter(f=>f.csat!==null),scoredNps=feedbacks.filter(f=>f.nps!==null),scoredCes=feedbacks.filter(f=>f.ces!==null);
 const avgCsat=scoredCsat.length?(scoredCsat.reduce((a,f)=>a+(f.csat||0),0)/scoredCsat.length).toFixed(1):'—';
 const avgCes=scoredCes.length?(scoredCes.reduce((a,f)=>a+(f.ces||0),0)/scoredCes.length).toFixed(1):'—';
 const npsScore=scoredNps.length?Math.round(((scoredNps.filter(f=>(f.nps||0)>=9).length-scoredNps.filter(f=>(f.nps||0)<=6).length)/scoredNps.length)*100):0;
 const eligibleCampaignProjects=projects.filter(p=>p.message_opt_in&&(p.contact_phone||p.contact_email));
 const campaignTargets=eligibleCampaignProjects.filter(p=>campaignForm.audience==='Todos'||campaignForm.audience==='Ativos'&&p.phase!=='Concluída'||campaignForm.audience==='Em risco'&&risk(p).level!=='Baixo'||campaignForm.audience==='Pós-go-live'&&['Entrada em operação','Acompanhamento','Concluída'].includes(p.phase));

 async function sendAccessLink(){
  if(!email.trim()){setError('Informe seu e-mail.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const r=await fetch(SUPA+'/auth/v1/otp?redirect_to='+encodeURIComponent(location.origin),{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:email.trim(),create_user:false})});
   const j:any=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.msg||j.message||'Não foi possível enviar o acesso.');
   setNotice('Enviamos um acesso de uso único para seu e-mail. Você pode entrar sem lembrar a senha.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao enviar acesso.')}finally{setBusy(false)}
 }
 async function saveProfile(){
  if(!session||demo)return;
  setBusy(true);setError('');
  try{
   const r=await fetch(SUPA+'/rest/v1/profiles?id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(profileForm)});
   const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Não foi possível salvar o perfil.');setProfile(j[0]||profile);setNotice('Perfil atualizado.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar perfil.')}finally{setBusy(false)}
 }
 async function uploadAvatar(file:File){
  if(!session||demo)return;
  if(file.size>2097152){setError('A foto deve ter no máximo 2 MB.');return}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Use JPG, PNG ou WebP.');return}
  setBusy(true);setError('');
  try{
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path=session.user.id+'/avatar.'+ext;
   const r=await fetch(SUPA+'/storage/v1/object/vectta-avatars/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':file.type,'x-upsert':'true'},body:file});
   if(!r.ok){const j:any=await r.json().catch(()=>({}));throw new Error(j.message||'Não foi possível enviar a foto.')}
   const avatar_url=SUPA+'/storage/v1/object/public/vectta-avatars/'+path+'?v='+Date.now();
   setProfileForm(x=>({...x,avatar_url}));
   const pr=await fetch(SUPA+'/rest/v1/profiles?id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({avatar_url})});
   const pj:any=await pr.json();if(!pr.ok)throw new Error(pj.message||'Foto enviada, mas não foi possível atualizar o perfil.');setProfile(pj[0]||profile);setNotice('Foto atualizada.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao enviar foto.')}finally{setBusy(false)}
 }
 async function saveFeedback(){
  if(!feedbackForm.project_id||!feedbackForm.comment.trim()){setError('Escolha a implantação e escreva o feedback.');return}
  if(demo){setNotice('Na demonstração, o feedback não é persistido.');return}
  if(!session)return;
  setBusy(true);setError('');
  try{
   const body={user_id:session.user.id,project_id:feedbackForm.project_id,contact_name:feedbackForm.contact_name,contact_role:feedbackForm.contact_role,channel:feedbackForm.channel,csat:Number(feedbackForm.csat),nps:Number(feedbackForm.nps),ces:Number(feedbackForm.ces),comment:feedbackForm.comment};
   const r=await fetch(SUPA+'/rest/v1/feedbacks',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
   const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Não foi possível salvar o feedback.');setFeedbacks(x=>[j[0],...x]);setFeedbackForm(x=>({...x,contact_name:'',contact_role:'',comment:''}));setNotice('Feedback registrado.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar feedback.')}finally{setBusy(false)}
 }
 async function saveCampaign(){
  if(!campaignForm.name.trim()||!campaignForm.message.trim()){setError('Dê um nome à campanha e escreva a mensagem.');return}
  if(demo){setNotice('Na demonstração, a campanha não é persistida.');return}
  if(!session)return;
  setBusy(true);setError('');
  try{
   const body={user_id:session.user.id,name:campaignForm.name,channel:campaignForm.channel,message:campaignForm.message,audience:campaignForm.audience,status:'Pronta para integração',target_filter:{consentRequired:true,targetCount:campaignTargets.length}};
   const r=await fetch(SUPA+'/rest/v1/campaigns',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
   const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Não foi possível preparar a campanha.');setCampaigns(x=>[j[0],...x]);setCampaignForm({name:'',channel:'WhatsApp',audience:'Todos',message:''});setNotice('Campanha preparada. O envio real depende da integração do canal e só considera contatos com consentimento.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar campanha.')}finally{setBusy(false)}
 }
 function goBack(){if(selected){setSelected('');return}const target=previousView||'Início';setView(target);setPreviousView('Início');setMobile(false)}

 async function createProject(){
  if(!form.client.trim())return;
  if(demo){setProjects(x=>x.concat({id:'d'+Date.now(),client:form.client,segment:form.segment,system:form.system,owner:form.owner,phase:form.phase,start_date:today(),due_date:form.due||null,scope:form.scope,manual_risk_level:'Baixo',metadata:{revenue:Number(form.revenue||0)}}));setModal(false);return}
  if(!session)return;
  setBusy(true);
  try{
   const body={user_id:session.user.id,client:form.client,segment:form.segment,system:form.system,owner:form.owner,phase:form.phase,start_date:today(),due_date:form.due||null,scope:form.scope,manual_risk_level:'Baixo',metadata:{revenue:Number(form.revenue||0)},cnpj:form.cnpj,contact_name:form.contact_name,contact_email:form.contact_email,contact_phone:form.contact_phone,message_opt_in:form.message_opt_in,preferred_channel:form.preferred_channel};
   const r=await fetch(SUPA+'/rest/v1/projects',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
   if(!r.ok){const j:any=await r.json();throw new Error(j.message||'Falha ao salvar.');}
   setModal(false);setForm({client:'',segment:'',system:'',owner:'Chai',phase:'Descoberta',due:'',scope:'',revenue:'0',cnpj:'',contact_name:'',contact_email:'',contact_phone:'',message_opt_in:false,preferred_channel:'WhatsApp'});await load();setNotice('Implantação criada.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar.')}finally{setBusy(false)}
 }
 async function toggleTask(t:Task){
  if(demo){setTasks(x=>x.map(i=>i.id===t.id?{...i,done:!i.done}:i));return}
  if(!session)return;
  const r=await fetch(SUPA+'/rest/v1/tasks?id=eq.'+t.id,{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({done:!t.done})});
  if(!r.ok){setError('Não foi possível atualizar a entrega.');return}await load();
 }
 function changeView(v:string){setPreviousView(view);setView(v);setSelected('');setMobile(false);setError('');}
 function table(rows:Project[]){return <div className={s.tableWrap}><table><thead><tr><th>Cliente / sistema</th><th>Etapa</th><th>Progresso</th><th>Prazo</th><th>Risco</th><th/></tr></thead><tbody>{rows.map(p=>{const r=risk(p);return <tr key={p.id}><td><button className={s.client} onClick={()=>setSelected(p.id)}>{p.client}</button><span>{p.system} · {p.segment}</span></td><td><span className={s.badge}>{p.phase}</span></td><td>{progress(p)}%<div className={s.progress}><i style={{width:progress(p)+'%'}}/></div></td><td>{fmt(p.due_date)}</td><td><span className={s.badge+' '+badge(r.level)}>{r.level}</span></td><td><button className={s.btn+' '+s.ghost} onClick={()=>setSelected(p.id)}><ChevronRight size={16}/></button></td></tr>})}</tbody></table>{!rows.length&&<div className={s.empty}>Nenhuma implantação encontrada.</div>}</div>}

 if(!session&&!demo)return <div className={s.auth}>
  <section className={s.authHero}>
   <div className={s.authBrand}><img src={VT} alt="VT"/><b>Vectta</b></div>
   <div className={s.authCopy}><h1>Implante confiança.<br/><em>Entregue evolução.</em></h1><p>Gestão de implementações e experiência do cliente,<br/>da descoberta ao pós-go-live.</p></div>
   <img className={s.authMascot} src={MASCOT} alt="Mascote chAI"/>
  </section>
  <section className={s.authPanel}><form className={s.authCard} onSubmit={(e)=>{e.preventDefault();void submitAuth();}}><div className={s.brandRow}><img className={s.vt} src={VT} alt="VT"/><div className={s.brandName}>Vectta</div></div>{error&&<div className={s.error}>{error}</div>}{notice&&<div className={s.notice}>{notice}</div>}<div><h2>{mode==='login'?'Entrar':mode==='register'?'Criar conta':'Recuperar acesso'}</h2><p>Sua carteira é privada e isolada por usuário.</p></div>{mode==='register'&&<label>Nome<input className={s.input} value={name} onChange={e=>setName(e.target.value)}/></label>}<label>E-mail<input className={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=='forgot'&&<label>Senha<input className={s.input} type="password" value={password} minLength={12} onChange={e=>setPassword(e.target.value)}/></label>}<button type="submit" className={s.btn+' '+s.primary} disabled={busy}><ShieldCheck size={16}/>{mode==='login'?'Entrar':mode==='register'?'Criar conta':'Enviar link'}</button>{mode==='login'&&<button type="button" className={s.btn} disabled={busy} onClick={sendAccessLink}><KeyRound size={16}/> Entrar sem senha</button>}<div className={s.authLinks}><button type="button" className={s.link} onClick={()=>setMode(mode==='register'?'login':'register')}>{mode==='register'?'Já tenho conta':'Criar conta'}</button>{mode!=='forgot'?<button type="button" className={s.link} onClick={()=>setMode('forgot')}>Esqueci minha senha</button>:<button type="button" className={s.link} onClick={()=>setMode('login')}>Voltar</button>}</div><button type="button" className={s.btn} onClick={enterDemo}>Explorar demonstração</button></form><img className={s.authChaiCorner} src={CHAI} alt="chAI · Conversas que movem, relações que ficam"/></section>
 </div>;

 let body:any;
 if(current)body=<><header className={s.pageHead}><div><button className={s.link} onClick={()=>setSelected('')}>← Voltar à carteira</button><span className={s.eyebrow}>{current.segment} / {current.system}</span><h1>{current.client}</h1><p>{current.owner} · prazo {fmt(current.due_date)}</p></div></header><div className={s.detailGrid}><section className={s.panel}><div className={s.sectionHead}><h2>Plano de entregas</h2><span className={s.badge}>{progress(current)}%</span></div><div className={s.stack}>{tasks.filter(t=>t.project_id===current.id).map(t=><article className={s.task} key={t.id}><button className={s.check+(t.done?' '+s.done:'')} onClick={()=>toggleTask(t)}>{t.done&&<Check size={14}/>}</button><div><strong>{t.title}</strong><span>{t.owner} · {fmt(t.due_date)}</span></div>{t.critical&&<span className={s.badge+' '+s.bad}>Crítica</span>}</article>)}</div></section><div className={s.detailSide}><section className={s.panel}><span className={s.eyebrow}>PRONTIDÃO</span><h2>{progress(current)}% da implantação</h2><div className={s.progress}><i style={{width:progress(current)+'%'}}/></div><div className={s.gates}>{[['Entregas críticas resolvidas',!tasks.some(t=>t.project_id===current.id&&t.critical&&!t.done)],['Requisitos aprovados',ops.some(o=>o.project_id===current.id&&o.kind==='Requisito'&&o.status==='Aprovado')],['Testes com evidência',ops.some(o=>o.project_id===current.id&&o.kind==='Teste'&&o.status==='Aprovado'&&o.evidence)],['Sem chamados impeditivos',!ops.some(o=>o.project_id===current.id&&o.kind==='Chamado'&&o.priority==='Alta')]].map(([label,ok])=><div key={String(label)} className={s.gate+(ok?' '+s.ok:'')}><span>{ok?<Check size={14}/>:<Clock3 size={14}/>}</span><b>{String(label)}</b></div>)}</div></section><section className={s.panel}><span className={s.eyebrow}>ESCOPO</span><p>{current.scope||'Escopo ainda não registrado.'}</p><div className={s.sectionHead}><span>Risco atual</span><span className={s.badge+' '+badge(risk(current).level)}>{risk(current).level}</span></div></section></div></div></>;
 else if(view==='Início')body=<><section className={s.hero}><div className={s.heroCopy}><h1>Implante confiança.<br/><em>Entregue evolução.</em></h1><p>Gestão de implementações e experiência do cliente,<br/>da descoberta ao pós-go-live.</p></div><div className={s.heroVisual}><img className={s.heroMascot} src={MASCOT} alt="Mascote chAI"/></div></section><section className={s.metrics}><div className={s.metric}><span>IMPLANTAÇÕES ATIVAS</span><b>{active.length}</b><small>carteira em andamento</small></div><div className={s.metric}><span>PENDÊNCIAS</span><b>{pending.length}</b><small>itens abertos</small></div><div className={s.metric}><span>RISCO ALTO</span><b>{high}</b><small>requer atenção</small></div><div className={s.metric}><span>CONCLUÍDAS</span><b>{projects.filter(p=>p.phase==='Concluída').length}</b><small>total da carteira</small></div></section><section className={s.moduleGrid}>{[['Implantações',Layers3,'Carteira, escopo e etapas'],['Pendências',ListTodo,'Bloqueios e próximos passos'],['Riscos e estratégias',AlertTriangle,'Causa, ação e critério de saída'],['Cronograma',CalendarDays,'Prazos, dependências e marcos'],['Requisitos',ClipboardCheck,'Escopo e aprovação'],['Testes',TestTube2,'Evidência de aceitação'],['Chamados',Headphones,'Problemas e impeditivos'],['Rentabilidade',WalletCards,'Receita, esforço e resultado']].map(([label,Icon,desc]:any)=><button className={s.moduleCard} key={label} onClick={()=>changeView(label)}><Icon size={20}/><div><strong>{label}</strong><span>{desc}</span></div><ChevronRight size={18}/></button>)}</section></>;
 else if(view==='Visão geral')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>VISÃO GERAL</span><h1>Centro de comando da implantação.</h1><p>Saúde da carteira, riscos, prazos, execução e resultado em uma única leitura.</p></div><div className={s.actions}><button className={s.btn} onClick={()=>changeView('Implantações')}><Layers3 size={16}/> Ver carteira</button><button className={s.btn+' '+s.primary} onClick={()=>setModal(true)}><Plus size={16}/> Nova implantação</button></div></header>
 <section className={s.overviewKpis}>
  <button className={s.overviewKpi} onClick={()=>{setPhase('Todas');changeView('Implantações')}}><span>Implantações ativas</span><b>{active.length}</b><small>{projects.length} clientes na carteira</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Pendências')}><span>Execução média</span><b>{avgProgress}%</b><small>{completedTasks} entregas concluídas</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Riscos e estratégias')}><span>Risco alto</span><b>{riskCounts.Alto}</b><small>{riskCounts.Médio} em risco médio</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Pendências')}><span>Pendências críticas</span><b>{criticalOpen}</b><small>{blockedOpen} itens bloqueados</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Cronograma')}><span>Prazos vencidos</span><b>{lateProjects}</b><small>{dueSoon.length} vencem em até 14 dias</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Rentabilidade')}><span>Margem operacional</span><b>{margin}%</b><small>R$ {operatingResult.toLocaleString('pt-BR')} de resultado</small></button>
 </section>
 <div className={s.overviewGrid}>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Saúde da carteira</h2><p>Filtre o radar por nível de risco.</p></div><AlertTriangle size={20}/></div><div className={s.healthLayout}><div className={s.riskDonut} style={{background:`conic-gradient(#FF2E9A 0 ${highPct}%, #B21CF2 ${highPct}% ${highPct+mediumPct}%, #14D8FF ${highPct+mediumPct}% 100%)`}}><div><b>{projects.length}</b><span>clientes</span></div></div><div className={s.riskFilters}>{(['Todos','Alto','Médio','Baixo'] as const).map(level=><button key={level} className={s.riskFilter+(overviewRisk===level?' '+s.active:'')} onClick={()=>setOverviewRisk(level)}><span><i className={s.riskDot+' '+(level==='Alto'?s.high:level==='Médio'?s.medium:level==='Baixo'?s.low:s.all)}/>{level}</span><b>{level==='Todos'?projects.length:riskCounts[level]}</b></button>)}</div></div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Distribuição por etapa</h2><p>Clique em uma etapa para abrir a carteira filtrada.</p></div><Workflow size={20}/></div><div className={s.phaseChart}>{phaseOverview.map(item=><button key={item.name} className={s.phaseRow} onClick={()=>{setPhase(item.name);changeView('Implantações')}}><span>{item.name}</span><div className={s.phaseTrack}><i style={{width:(item.count/maxPhase*100)+'%'}}/></div><b>{item.count}</b></button>)}</div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Radar de atenção</h2><p>Clientes priorizados por risco e prazo.</p></div><button className={s.link} onClick={()=>changeView('Riscos e estratégias')}>Ver riscos</button></div><div className={s.attentionList}>{attentionProjects.map(p=>{const r=risk(p);return <button key={p.id} className={s.attentionItem} onClick={()=>setSelected(p.id)}><div><strong>{p.client}</strong><small>{p.phase} · {progress(p)}% concluído</small></div><div className={s.attentionMeta}><span className={s.badge+' '+badge(r.level)}>{r.level}</span><ChevronRight size={15}/></div></button>})}{!attentionProjects.length&&<div className={s.empty}>Nenhum cliente nesse filtro.</div>}</div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Próximos prazos</h2><p>Implantações com vencimento nos próximos 14 dias.</p></div><button className={s.link} onClick={()=>changeView('Cronograma')}>Abrir cronograma</button></div><div className={s.deadlineList}>{dueSoon.map(p=><button key={p.id} className={s.deadlineItem} onClick={()=>setSelected(p.id)}><div><strong>{p.client}</strong><small>{p.phase} · {fmt(p.due_date)}</small></div><span className={s.deadlineDate}>{deadlineLabel(daysUntil(p.due_date))}</span></button>)}{!dueSoon.length&&<div className={s.empty}>Nenhum prazo nos próximos 14 dias.</div>}</div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Operação agora</h2><p>Leitura rápida do trabalho que exige ação.</p></div><ListTodo size={20}/></div><div className={s.opsSnapshot}><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Pendências</span><b>{pending.length}</b></button><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Críticas</span><b>{criticalOpen}</b></button><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Bloqueadas</span><b>{blockedOpen}</b></button></div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Visão financeira</h2><p>Receita, custo e resultado da carteira.</p></div><button className={s.link} onClick={()=>changeView('Rentabilidade')}>Detalhar</button></div><div className={s.financeSummary}><div className={s.financeBox}><span>Receita</span><b>R$ {totalRevenue.toLocaleString('pt-BR')}</b></div><div className={s.financeBox}><span>Custo</span><b>R$ {totalCost.toLocaleString('pt-BR')}</b></div><div className={s.financeBox}><span>Resultado</span><b>R$ {operatingResult.toLocaleString('pt-BR')}</b></div><div className={s.financeBox}><span>Margem</span><b>{margin}%</b></div></div></section>
  <section className={s.dashboardCard+' '+s.dashboardWide}><div className={s.dashboardTitle}><div><h2>Acessos rápidos</h2><p>Entre direto nos pontos mais usados da operação.</p></div></div><div className={s.quickActions}><button className={s.quickAction} onClick={()=>changeView('Implantações')}><Layers3 size={18}/> Implantações</button><button className={s.quickAction} onClick={()=>changeView('Pendências')}><ListTodo size={18}/> Pendências</button><button className={s.quickAction} onClick={()=>changeView('Riscos e estratégias')}><AlertTriangle size={18}/> Riscos</button><button className={s.quickAction} onClick={()=>changeView('Resultados')}><ChartNoAxesCombined size={18}/> Resultados</button></div></section>
 </div></>;
 else if(view==='Implantações')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>IMPLANTAÇÕES</span><h1>Sua carteira.</h1><p>Clientes, etapas e entregas em um só lugar.</p></div><button className={s.btn+' '+s.primary} onClick={()=>setModal(true)}><Plus size={16}/> Nova implantação</button></header><div className={s.toolbar}><div className={s.search}><Search size={16}/><input className={s.input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cliente, sistema ou segmento"/></div><select className={s.select} value={phase} onChange={e=>setPhase(e.target.value)}><option>Todas</option>{phases.map(x=><option key={x}>{x}</option>)}</select></div>{table(filtered)}</>;
 else if(view==='Pendências'||view==='Cronograma')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>{view.toUpperCase()}</span><h1>{view==='Pendências'?'Próximos passos.':'Linha do tempo operacional.'}</h1><p>Priorize bloqueios e itens críticos antes que virem atraso.</p></div></header><div className={s.stack}>{pending.map(t=><article className={s.task} key={t.id}><button className={s.check} onClick={()=>toggleTask(t)}></button><div><strong>{t.title}</strong><span>{projects.find(p=>p.id===t.project_id)?.client} · {t.owner} · {fmt(t.due_date)}</span></div><div>{t.critical&&<span className={s.badge+' '+s.bad}>Crítica</span>}</div></article>)}</div></>;
 else if(view==='Resultados'||view==='Rentabilidade'){const revenue=projects.reduce((a,p)=>a+Number(p.metadata?.revenue||0),0),cost=projects.reduce((a,p)=>a+Number(p.metadata?.actualHours||0)*Number(p.metadata?.hourCost||0),0);body=<><header className={s.pageHead}><div><span className={s.eyebrow}>RESULTADOS</span><h1>Resultado operacional.</h1><p>Valores calculados a partir da carteira atual.</p></div></header><section className={s.metrics}><div className={s.metric}><span>RECEITA CADASTRADA</span><b>R$ {revenue.toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>CUSTO ESTIMADO</span><b>R$ {cost.toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>RESULTADO OPERACIONAL</span><b>R$ {(revenue-cost).toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>CLIENTES EM RISCO</span><b>{projects.filter(p=>risk(p).level!=='Baixo').length}</b></div></section></>}
 else if(view==='Riscos e estratégias')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>RISCOS E ESTRATÉGIAS</span><h1>Risco explicável.</h1><p>Regras sobre registros atuais; não é previsão estatística.</p></div></header><div className={s.stack}>{projects.filter(p=>risk(p).level!=='Baixo').map(p=><section className={s.panel} key={p.id}><div className={s.sectionHead}><div><h2>{p.client}</h2><span>{p.system}</span></div><span className={s.badge+' '+badge(risk(p).level)}>{risk(p).level}</span></div>{risk(p).causes.map(c=><div className={s.riskRule} key={c}><AlertTriangle size={18}/><div><b>{c}</b><p>Ação sugerida: revisar responsável, caminho crítico e próxima evidência.</p></div></div>)}</section>)}</div></>;
 else if(view==='Segurança')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>SEGURANÇA</span><h1>Proteja sua conta.</h1><p>Autenticação e dados são mantidos no Supabase com RLS.</p></div></header><section className={s.panel}><h2>Proteções ativas</h2><div className={s.stack}><div className={s.operation}><ShieldCheck size={18}/><div><strong>Carteira isolada por usuário</strong><span>RLS impede uma conta de ler os dados de outra.</span></div></div><div className={s.operation}><KeyRound size={18}/><div><strong>Recuperação de senha</strong><span>Use “Esqueci minha senha” na tela de login.</span></div></div></div></section></>;
 else body=<><header className={s.pageHead}><div><span className={s.eyebrow}>{view.toUpperCase()}</span><h1>{view}</h1><p>Registros operacionais com responsável, evidência e status.</p></div></header><section className={s.panel}><div className={s.empty}>Módulo preparado para os registros reais da implantação.</div></section></>;

 return <div className={s.shell}>
  <aside className={s.sidebar+(mobile?' '+s.open:'')}>
   <div className={s.brandRow}><img className={s.vt} src={VT} alt="VT"/><div className={s.brandName}>Vectta</div></div>
   <span className={s.workspace}>ESPAÇO DA ANALISTA</span>
   <nav className={s.nav}>{nav.map(([label,Icon])=><button key={label} className={view===label&&!selected?s.active:''} onClick={()=>changeView(label)}><Icon size={18}/><span>{label}</span>{label==='Pendências'&&<i>{pending.length}</i>}</button>)}</nav>
   <div className={s.sideBottom}><div className={s.profile}><div className={s.avatar}>{displayName[0]?.toUpperCase()}</div><div><strong>{displayName}</strong><span>{demo?'Demonstração isolada':'Carteira pessoal'}</span></div></div></div>
  </aside>
  <div className={s.main}><header className={s.topbar}><button className={s.btn+' '+s.ghost} onClick={()=>setMobile(!mobile)}><Menu size={18}/></button><span>Vectta <i>/</i> {current?.client||view}</span><div className={s.secure}><ShieldCheck size={16}/>{demo?'demo isolada':'ambiente seguro'}<button className={s.btn+' '+s.ghost} onClick={logout}><LogOut size={15}/> Sair</button></div></header><main className={s.content}>{error&&<div className={s.error}>{error}</div>}{notice&&<div className={s.notice}>{notice}</div>}{body}<footer className={s.footer}><span>Vectta · Portal de implementação</span></footer></main><img className={s.mainChaiSignature} src={CHAI} alt="chAI · Conversas que movem, relações que ficam"/></div>
  {modal&&<div className={s.modalBack}><div className={s.modal}><div className={s.modalHead}><h2>Nova implantação</h2><button className={s.btn+' '+s.ghost} onClick={()=>setModal(false)}><X size={18}/></button></div><div className={s.form}><label>Cliente<input className={s.input} value={form.client} onChange={e=>setForm({...form,client:e.target.value})}/></label><label>Sistema<input className={s.input} value={form.system} onChange={e=>setForm({...form,system:e.target.value})}/></label><label>Segmento<input className={s.input} value={form.segment} onChange={e=>setForm({...form,segment:e.target.value})}/></label><label>Responsável<input className={s.input} value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/></label><label>Etapa<select className={s.input} value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})}>{phases.map(x=><option key={x}>{x}</option>)}</select></label><label>Prazo<input className={s.input} type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/></label><label className={s.full}>Escopo<textarea className={s.textarea} value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})}/></label><label>Receita<input className={s.input} type="number" value={form.revenue} onChange={e=>setForm({...form,revenue:e.target.value})}/></label></div><div className={s.modalFoot}><button className={s.btn} onClick={()=>setModal(false)}>Cancelar</button><button className={s.btn+' '+s.primary} disabled={busy} onClick={createProject}>Criar implantação</button></div></div></div>}
 </div>;
}