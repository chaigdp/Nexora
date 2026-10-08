'use client';
import {useEffect,useMemo,useState} from 'react';
import {
  LayoutDashboard,Layers3,ListTodo,ChartNoAxesCombined,ShieldCheck,BookOpen,AlertTriangle,
  CalendarDays,ClipboardCheck,TestTube2,Headphones,Workflow,Settings2,Plug,WalletCards,
  Plus,Search,ChevronRight,Check,Clock3,Menu,LogOut,X,KeyRound
} from 'lucide-react';
import s from './vectta.module.css';
import PendingWorkspace from '../components/pending-workspace';
import type {PendingTask} from '../lib/pending-strategy';
import WhatsAppTestLab from '../components/whatsapp-test-lab';
import CustomerSuccess from '../components/customer-success';
import ChaiAssistant from '../components/chai-assistant';
import type {ChaiModule} from '../lib/chai-modules';
import type {CSOperation} from '../lib/customer-success';

const SUPA=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://pldxmxgrgyfwtnhxqaji.supabase.co';
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_jYHHJD8SzmFb2cuJvRcPIQ_Gt-0yTYC';
const VT='/vectta-vt-mark-v2.svg';
const MASCOT='/chai-home-dashboard-hd.webp';
const HOME_MASCOT='/chai-home-dashboard-hd.webp';
const CHAI='/chai-logo.svg';

type Risk='Baixo'|'Médio'|'Alto';
type Project={id:string;client:string;segment:string;system:string;owner:string;phase:string;start_date:string|null;due_date:string|null;completed_date?:string|null;scope:string;manual_risk_level:Risk;metadata:any;cnpj?:string;contact_name?:string;contact_email?:string;contact_phone?:string;message_opt_in?:boolean;preferred_channel?:string};
type Task={id:string;project_id:string;title:string;owner:string;due_date:string|null;done:boolean;critical:boolean;kind:string;priority:string;blocked:boolean;detail:any;updated_at?:string};
type Op={id:string;project_id:string;kind:string;title:string;owner:string;due_date:string|null;status:string;priority:string;detail:string;evidence:string;strategy:string;progress:number};
type Session={access_token:string;refresh_token?:string;user:{id:string;email?:string;user_metadata?:any}};
type Profile={id:string;full_name:string;workspace_name:string;phone?:string;avatar_url?:string};
type WorkspaceRole='owner'|'admin'|'analyst'|'viewer';
type WorkspaceMember={workspace_owner_id:string;user_id:string;email:string;role:WorkspaceRole;status:'active'|'disabled';created_at:string;updated_at:string};
type WorkspaceInvite={id:string;email:string;role:Exclude<WorkspaceRole,'owner'>;status:'pending'|'accepted'|'revoked'|'expired';expires_at:string;created_at:string};
type Feedback={id:string;project_id:string;contact_name:string;contact_role:string;channel:string;csat:number|null;nps:number|null;ces:number|null;comment:string;created_at:string};
type Campaign={id:string;name:string;channel:string;message:string;audience:string;status:string;target_filter:any;scheduled_at:string|null;created_at:string;recipient_mode?:string;template_name?:string;template_language?:string};
type CampaignContact={id:string;name:string;phone:string;email:string;segment:string;group_name:string;profile:string;consent:boolean;source:string;tags:any};
type CampaignRecipient={id:string;campaign_id:string;name:string;phone:string;email:string;source:string;status:string;provider_message_id:string;error:string;created_at:string;sent_at:string|null;delivered_at:string|null;read_at:string|null};
type ImportContact={name:string;phone:string;email:string;segment:string;group_name:string;profile:string};
type CampaignTarget={name:string;phone:string;email:string;source:string;segment?:string;group_name?:string;profile?:string};

const phases=['Descoberta','Planejamento e desenho','Configuração','Integrações','Migração','Testes','Treinamento','Prontidão e cutover','Entrada em operação','Acompanhamento','Concluída'];
const trailStages=[
 {phase:'Descoberta',title:'Descoberta',desc:'Objetivos, processos, escopo, stakeholders e critérios de sucesso.',gate:'Escopo e objetivos aprovados com responsáveis identificados.'},
 {phase:'Planejamento e desenho',title:'Planejamento',desc:'Plano, arquitetura, responsabilidades, cronograma e desenho da solução.',gate:'Cronograma, governança, desenho e critérios de aceite alinhados.'},
 {phase:'Configuração',title:'Configuração',desc:'Parametrização, construção, regras, segurança e preparação do ambiente.',gate:'Configuração principal concluída e pronta para validação integrada.'},
 {phase:'Integrações',title:'Integrações',desc:'Conexões com sistemas externos, APIs, dependências e cenários de falha.',gate:'Integrações críticas testadas com tratamento de falhas conhecido.'},
 {phase:'Migração',title:'Migração de dados',desc:'Limpeza, carga, reconciliação e validações com dados reais.',gate:'Dados reconciliados e aprovados pelo cliente.'},
 {phase:'Testes',title:'Testes e UAT',desc:'Testes funcionais, integrados, performance e aceite dos usuários.',gate:'UAT aprovado, defeitos críticos zerados e evidências registradas.'},
 {phase:'Treinamento',title:'Treinamento',desc:'Capacitação, comunicação, materiais e preparação para mudança.',gate:'Usuários-chave treinados e materiais de apoio disponíveis.'},
 {phase:'Prontidão e cutover',title:'Prontidão e cutover',desc:'Checklist de go-live, plano de virada, contingência e aprovações.',gate:'Go-live aprovado, contingência definida e checklist fechado.'},
 {phase:'Entrada em operação',title:'Go-live',desc:'Entrada em produção, validação do negócio e monitoramento intensivo.',gate:'Operação produtiva validada sem impeditivo crítico.'},
 {phase:'Acompanhamento',title:'Hypercare',desc:'Estabilização, suporte reforçado, adoção e transferência para operação.',gate:'Estabilidade comprovada, adoção acompanhada e suporte transferido.'},
 {phase:'Concluída',title:'Evolução contínua',desc:'Encerramento formal, lições aprendidas, ganhos e próximos ciclos.',gate:'Encerramento aceito, resultados registrados e próximos passos definidos.'}
];
const nav=[
['Início',LayoutDashboard],['Visão geral',ChartNoAxesCombined],['Implantações',Layers3],['Pendências',ListTodo],
['Acompanhamento de CS',Headphones],['Resultados',WalletCards],['Relatórios e dados',ChartNoAxesCombined],['Feedbacks',Headphones],['Campanhas',Plug],['Equipe e acessos',ShieldCheck],['Segurança',ShieldCheck],['Guia de uso',BookOpen],['Riscos e estratégias',AlertTriangle],
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
type ExperienceLevel='Saudável'|'Atenção'|'Insatisfeito';
const experienceBadge=(r:ExperienceLevel)=>r==='Insatisfeito'?s.bad:r==='Atenção'?s.warn:s.ok;
const feedbackHealth=(f:Feedback):{level:ExperienceLevel;signals:string[]}=>{
 const signals:string[]=[];
 if(f.nps!==null&&f.nps<=6)signals.push('NPS detrator');
 if(f.csat!==null&&f.csat<=3)signals.push('Satisfação baixa');
 if(f.ces!==null&&f.ces<=3)signals.push('Esforço alto para o cliente');
 if(signals.length)return{level:'Insatisfeito',signals};
 if((f.nps!==null&&f.nps<=8)||(f.csat!==null&&f.csat===4)||(f.ces!==null&&f.ces<=5))return{level:'Atenção',signals:['Percepção positiva, mas ainda sem margem de segurança']};
 return{level:'Saudável',signals:['Cliente em zona saudável de experiência']};
};

export default function Page(){
 const [session,setSession]=useState<Session|null>(null);
 const [projects,setProjects]=useState<Project[]>([]);
 const [tasks,setTasks]=useState<Task[]>([]);
 const [ops,setOps]=useState<Op[]>([]);
 const [feedbacks,setFeedbacks]=useState<Feedback[]>([]);
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 const [campaignContacts,setCampaignContacts]=useState<CampaignContact[]>([]);
 const [campaignRecipients,setCampaignRecipients]=useState<CampaignRecipient[]>([]);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [workspaceMembers,setWorkspaceMembers]=useState<WorkspaceMember[]>([]);
 const [workspaceInvites,setWorkspaceInvites]=useState<WorkspaceInvite[]>([]);
 const [inviteEmail,setInviteEmail]=useState('');
 const [inviteRole,setInviteRole]=useState<Exclude<WorkspaceRole,'owner'>>('analyst');
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
 const [recoveryToken,setRecoveryToken]=useState('');
 const [recoveryPassword,setRecoveryPassword]=useState('');
 const [recoveryConfirm,setRecoveryConfirm]=useState('');
 const [busy,setBusy]=useState(false);
 const [modal,setModal]=useState(false);
 const [showTrail,setShowTrail]=useState(false);
 const [trailFocus,setTrailFocus]=useState('');
 const [overviewRisk,setOverviewRisk]=useState<'Todos'|'Alto'|'Médio'|'Baixo'>('Todos');
 const [form,setForm]=useState({client:'',segment:'',system:'',owner:'Chai',phase:'Descoberta',due:'',scope:'',revenue:'0',cnpj:'',contact_name:'',contact_email:'',contact_phone:'',message_opt_in:false,preferred_channel:'WhatsApp'});
 const [feedbackForm,setFeedbackForm]=useState({project_id:'',contact_name:'',contact_role:'',channel:'Reunião',csat:'5',nps:'10',ces:'6',comment:''});
 const [campaignForm,setCampaignForm]=useState({name:'',channel:'WhatsApp',audience:'Todos',message:'',recipientMode:'base',manualName:'',manualPhone:'',manualConsent:false,segment:'Todos',phase:'Todas',risk:'Todos',listGroup:'Todos',listProfile:'Todos',template_name:'',template_language:'pt_BR'});
 const [importedContacts,setImportedContacts]=useState<ImportContact[]>([]);
 const [importConsent,setImportConsent]=useState(false);
 const [profileForm,setProfileForm]=useState({full_name:'',workspace_name:'Carteira pessoal',phone:'',avatar_url:''});

 useEffect(()=>{const raw=localStorage.getItem('vectta.session');if(raw){try{setSession(JSON.parse(raw))}catch{}}},[]);
 useEffect(()=>{if(session&&!demo)void load()},[session,demo]);
 useEffect(()=>{if(!session||demo)return;const id=setInterval(()=>void load(),30000);return()=>clearInterval(id)},[session?.access_token,demo]);
 useEffect(()=>{setShowTrail(false);setTrailFocus('')},[selected]);
 useEffect(()=>{
  if(typeof window==='undefined')return;
  const h=new URLSearchParams(window.location.hash.slice(1));
  const access=h.get('access_token'),refresh=h.get('refresh_token'),type=h.get('type'),authError=h.get('error_description');
  if(authError){setError(authError);return;}
  if(!access)return;
  fetch(SUPA+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+access}})
   .then(r=>r.json())
   .then((user:any)=>{
    if(!user?.id)return;
    if(type==='recovery'){
     localStorage.removeItem('vectta.session');
     setSession(null);setDemo(false);setRecoveryToken(access);setEmail(user.email||'');
     return;
    }
    const next:Session={access_token:access,refresh_token:refresh||undefined,user};
    setSession(next);localStorage.setItem('vectta.session',JSON.stringify(next));
    history.replaceState(null,'',location.pathname+location.search);
   })
   .catch(()=>setError('Não foi possível validar este link de acesso.'));
 },[]);

 async function auth(path:string,body:any){
  const r=await fetch(SUPA+'/auth/v1/'+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j:any=await r.json();if(!r.ok)throw new Error(j.msg||j.message||j.error_description||'Não foi possível concluir.');return j;
 }
 async function api(table:string,token:string){
  const r=await fetch(SUPA+'/rest/v1/'+table+'?select=*',{headers:{apikey:KEY,Authorization:'Bearer '+token}});
  const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Falha ao carregar dados.');return j;
 }
 async function apiFields(table:string,fields:string,token:string){
  const r=await fetch(SUPA+'/rest/v1/'+table+'?select='+fields,{headers:{apikey:KEY,Authorization:'Bearer '+token}});
  const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Falha ao carregar dados.');return j;
 }
 async function load(){
  if(!session)return;
  try{
   const [p,t,o,fb,ca,cc,cr,pr,wm,wi]=await Promise.all([
    api('projects',session.access_token),api('tasks',session.access_token),api('operations',session.access_token),api('feedbacks',session.access_token),
    api('campaigns',session.access_token),api('campaign_contacts',session.access_token),api('campaign_recipients',session.access_token),api('profiles',session.access_token),
    apiFields('workspace_members','workspace_owner_id,user_id,email,role,status,created_at,updated_at',session.access_token),
    apiFields('workspace_invites','id,email,role,status,expires_at,created_at',session.access_token)
   ]);
   setProjects(p);setTasks(t);setOps(o);setFeedbacks(fb);setCampaigns(ca);setCampaignContacts(cc);setCampaignRecipients(cr);
   setWorkspaceMembers(Array.isArray(wm)?wm:[]);setWorkspaceInvites(Array.isArray(wi)?wi:[]);
   const own=pr[0]||null;setProfile(own);if(own)setProfileForm({full_name:own.full_name||'',workspace_name:own.workspace_name||'Carteira pessoal',phone:own.phone||'',avatar_url:own.avatar_url||''});
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
 async function resetRecoveredPassword(e:React.FormEvent){
  e.preventDefault();setError('');setNotice('');
  if(!recoveryToken){setError('Link de recuperação inválido ou expirado.');return;}
  if(recoveryPassword!==recoveryConfirm){setError('As senhas não coincidem.');return;}
  if(recoveryPassword.length<12||!/[a-z]/.test(recoveryPassword)||!/[A-Z]/.test(recoveryPassword)||!/[0-9]/.test(recoveryPassword)||!(/[^A-Za-z0-9]/.test(recoveryPassword))){
   setError('Use pelo menos 12 caracteres com maiúscula, minúscula, número e símbolo.');return;
  }
  setBusy(true);
  try{
   const r=await fetch(SUPA+'/auth/v1/user',{method:'PUT',headers:{apikey:KEY,Authorization:'Bearer '+recoveryToken,'Content-Type':'application/json'},body:JSON.stringify({password:recoveryPassword})});
   const j:any=await r.json();
   if(!r.ok)throw new Error(j.msg||j.message||j.error_description||'Não foi possível atualizar a senha.');
   localStorage.removeItem('vectta.session');
   setRecoveryToken('');setRecoveryPassword('');setRecoveryConfirm('');setSession(null);setDemo(false);setMode('login');
   history.replaceState(null,'',location.pathname+location.search);
   setNotice('Senha atualizada. Entre novamente com a nova senha.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao atualizar a senha.')}finally{setBusy(false)}
 }
 function logout(){localStorage.removeItem('vectta.session');setSession(null);setDemo(false);setProjects([]);setTasks([]);setOps([]);setFeedbacks([]);setCampaigns([]);setCampaignContacts([]);setCampaignRecipients([]);setWorkspaceMembers([]);setWorkspaceInvites([]);setProfile(null)}
 async function enterDemo(){
  setBusy(true);setError('');setNotice('');
  try{
   const r=await fetch(SUPA+'/rest/v1/rpc/get_demo_portfolio',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:'{}'});
   const j:any=await r.json();
   if(!r.ok)throw new Error(j.message||'Não foi possível carregar a base demonstrativa.');
   setDemo(true);
   setSession({access_token:'demo',user:{id:'demo',email:'demo@vectta.local',user_metadata:{full_name:'Chai'}}});
   setProjects(Array.isArray(j.projects)?j.projects:demos);
   setTasks(Array.isArray(j.tasks)?j.tasks:demoTasks);
   setOps(Array.isArray(j.operations)?j.operations:demoOps);
   setFeedbacks(Array.isArray(j.feedbacks)?j.feedbacks:[]);
  }catch(e){
   setDemo(true);
   setSession({access_token:'demo',user:{id:'demo',email:'demo@vectta.local',user_metadata:{full_name:'Chai'}}});
   setProjects(demos);setTasks(demoTasks);setOps(demoOps);setFeedbacks([]);
   setError(e instanceof Error?e.message:'Falha ao carregar base demo.');
  }finally{setBusy(false)}
 }
 const current=projects.find(p=>p.id===selected);
 const currentTrailIndex=current?Math.max(0,trailStages.findIndex(x=>x.phase===current.phase)):-1;
 const focusedTrail=trailStages.find(x=>x.phase===trailFocus)||(currentTrailIndex>=0?trailStages[currentTrailIndex]:trailStages[0]);
 const active=projects.filter(p=>p.phase!=='Concluída');
 const pending=tasks.filter(t=>!t.done);
 const progress=(p:Project)=>{const list=tasks.filter(t=>t.project_id===p.id&&t.kind==='Entrega');return list.length?Math.round(list.filter(t=>t.done).length/list.length*100):0};
 const risk=(p:Project):{level:Risk;causes:string[]}=>{const causes:string[]=[];const pt=tasks.filter(t=>t.project_id===p.id&&!t.done);const po=ops.filter(o=>o.project_id===p.id);if(p.due_date&&p.due_date<today()&&p.phase!=='Concluída')causes.push('Prazo da implantação vencido.');if(pt.some(t=>t.blocked&&t.critical))causes.push('Entrega crítica bloqueada.');else if(pt.some(t=>t.blocked))causes.push('Entrega bloqueada.');if(pt.some(t=>t.critical&&t.due_date&&t.due_date<today()))causes.push('Entrega crítica atrasada.');if(po.some(o=>o.kind==='Teste'&&o.status==='Reprovado'))causes.push('Teste reprovado.');const level:Risk=p.manual_risk_level==='Alto'||causes.some(c=>/crítica|vencido|reprovado/i.test(c))?'Alto':p.manual_risk_level==='Médio'||causes.length?'Médio':'Baixo';return{level,causes}};
 const high=projects.filter(p=>risk(p).level==='Alto').length;
 const filtered=useMemo(()=>projects.filter(p=>(phase==='Todas'||p.phase===phase)&&[p.client,p.system,p.segment,p.cnpj,p.contact_name,p.contact_email,p.contact_phone].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())),[projects,phase,query]);
 const displayName=demo?'Chai':profile?.full_name||session?.user.user_metadata?.full_name||session?.user.email?.split('@')[0]||'Chai';
 const currentMembership=workspaceMembers.find(m=>m.user_id===session?.user.id);
 const currentRole:WorkspaceRole=demo?'viewer':currentMembership?.role||'viewer';
 const roleLabel=(role:WorkspaceRole)=>role==='owner'?'Proprietária':role==='admin'?'Administradora':role==='analyst'?'Analista':'Somente leitura';
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
 const completedProjects=projects.filter(p=>p.phase==='Concluída');
 const completionRate=projects.length?Math.round(completedProjects.length/projects.length*100):0;
 const overdueMilestones=pending.filter(t=>t.due_date&&t.due_date<today()).length;
 const finishedWithDates=projects.filter(p=>p.completed_date&&p.due_date);
 const avgScheduleVariance=finishedWithDates.length?Math.round(finishedWithDates.reduce((sum,p)=>sum+Math.round((new Date((p.completed_date as string)+'T12:00:00').getTime()-new Date((p.due_date as string)+'T12:00:00').getTime())/86400000),0)/finishedWithDates.length):0;
 const onTimeRate=finishedWithDates.length?Math.round(finishedWithDates.filter(p=>(p.completed_date as string)<=(p.due_date as string)).length/finishedWithDates.length*100):0;
 const normalizePhone=(value:string)=>{let d=(value||'').replace(/\D/g,'');if((d.length===10||d.length===11)&&!d.startsWith('55'))d='55'+d;return d};
 const campaignSegments=['Todos',...Array.from(new Set(projects.map(p=>p.segment).filter(Boolean))).sort()];
 const importedGroups=['Todos',...Array.from(new Set(importedContacts.map(x=>x.group_name).filter(Boolean))).sort()];
 const importedProfiles=['Todos',...Array.from(new Set(importedContacts.map(x=>x.profile).filter(Boolean))).sort()];
 const contactMatchesChannel=(phone:string,email:string)=>campaignForm.channel==='E-mail'?!!email:!!phone;
 const baseCampaignTargets:CampaignTarget[]=projects.filter(p=>
   p.message_opt_in&&
   contactMatchesChannel(p.contact_phone||'',p.contact_email||'')&&
   (campaignForm.audience==='Todos'||campaignForm.audience==='Ativos'&&p.phase!=='Concluída'||campaignForm.audience==='Em risco'&&risk(p).level!=='Baixo'||campaignForm.audience==='Pós-go-live'&&['Entrada em operação','Acompanhamento','Concluída'].includes(p.phase))&&
   (campaignForm.segment==='Todos'||p.segment===campaignForm.segment)&&
   (campaignForm.phase==='Todas'||p.phase===campaignForm.phase)&&
   (campaignForm.risk==='Todos'||risk(p).level===campaignForm.risk)
 ).map(p=>({name:p.contact_name||p.client,phone:normalizePhone(p.contact_phone||''),email:p.contact_email||'',source:'base',segment:p.segment,group_name:p.phase,profile:'Risco '+risk(p).level}));
 const manualCampaignTargets:CampaignTarget[]=campaignForm.manualConsent&&contactMatchesChannel(campaignForm.manualPhone,'')&&normalizePhone(campaignForm.manualPhone)?[{name:campaignForm.manualName||'Contato',phone:normalizePhone(campaignForm.manualPhone),email:'',source:'manual'}]:[];
 const importedCampaignTargets:CampaignTarget[]=importConsent?importedContacts.filter(x=>
   contactMatchesChannel(x.phone,x.email)&&
   (campaignForm.listGroup==='Todos'||x.group_name===campaignForm.listGroup)&&
   (campaignForm.listProfile==='Todos'||x.profile===campaignForm.listProfile)
 ).map(x=>({...x,phone:normalizePhone(x.phone),source:'planilha'})):[];
 const campaignTargets:CampaignTarget[]=campaignForm.recipientMode==='manual'?manualCampaignTargets:campaignForm.recipientMode==='list'?importedCampaignTargets:baseCampaignTargets;
 function experiencePlan(p:Project){
  const rr=risk(p);
  const pf=feedbacks.filter(f=>f.project_id===p.id).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());
  const latest=pf[0];
  const fh=latest?feedbackHealth(latest):null;
  const signals=[...rr.causes,...(fh?.signals||[])];
  const level:ExperienceLevel=(fh?.level==='Insatisfeito'||rr.level==='Alto')?'Insatisfeito':(fh?.level==='Atenção'||rr.level==='Médio'||signals.length)?'Atenção':'Saudável';
  const actions:string[]=[];
  if(p.metadata?.risk_plan)actions.push(String(p.metadata.risk_plan));
  if(signals.some(x=>/NPS|Satisfação|Esforço/i.test(x)))actions.push('Fazer contato de recuperação com escuta ativa, confirmar o impacto percebido e registrar a causa raiz.');
  if(signals.some(x=>/Prazo|atras/i.test(x)))actions.push('Replanejar o próximo marco com data realista, responsáveis e comunicação transparente do impacto.');
  if(signals.some(x=>/bloquead/i.test(x)))actions.push('Abrir uma ação de desbloqueio com dono único, dependência explícita e prazo curto para decisão.');
  if(signals.some(x=>/Teste reprovado/i.test(x)))actions.push('Definir correção, evidência esperada e nova janela de teste antes de avançar a implantação.');
  if(level==='Insatisfeito'){
   actions.push('Responder ao cliente no mesmo dia útil, assumir a condução e combinar quando ele receberá a próxima atualização.');
   actions.push('Criar um plano de recuperação com ação, responsável, prazo, contingência e critério objetivo de encerramento.');
   actions.push('Revalidar a percepção após a correção e registrar novo feedback para fechar o ciclo.');
  }else if(level==='Atenção'){
   actions.push('Fazer checkpoint proativo em até 1 dia útil e confirmar expectativas, responsabilidades e próximo marco.');
   actions.push('Manter atualização semanal curta até o sinal voltar para saudável.');
  }else{
   actions.push('Reforçar valor entregue, confirmar o próximo marco e manter comunicação preventiva.');
   actions.push('Aproveitar o próximo sucesso para pedir feedback e identificar oportunidade de referência ou expansão.');
  }
  const unique=[...new Set(actions)].slice(0,5);
  return{
   level,signals,latest,actions:unique,
   owner:level==='Insatisfeito'?p.owner+' + liderança/sponsor':p.owner,
   sla:level==='Insatisfeito'?'Primeira resposta: mesmo dia · plano: até 24h':level==='Atenção'?'Checkpoint: até 1 dia útil':'Próximo marco planejado',
   cadence:level==='Insatisfeito'?'Atualização diária até estabilizar':level==='Atenção'?'Atualização semanal':'Cadência normal',
   success:level==='Insatisfeito'?'Causa resolvida, próximo marco confirmado e nova percepção ≥ zona de atenção':level==='Atenção'?'Sem bloqueio, próximo marco confirmado e experiência voltando à zona saudável':'Cliente avançando sem sinal negativo',
   communication:level==='Insatisfeito'?'Reconhecer o impacto sem minimizar, dizer o que será feito, por quem e quando haverá retorno.':level==='Atenção'?'Antecipar o risco antes que vire cobrança e alinhar claramente a próxima responsabilidade.':'Comunicar progresso, valor alcançado e próximos passos.'
  };
 }
 const experiencePortfolio=projects.map(p=>({project:p,plan:experiencePlan(p)}));
 const dissatisfiedCount=experiencePortfolio.filter(x=>x.plan.level==='Insatisfeito').length;
 const attentionExperienceCount=experiencePortfolio.filter(x=>x.plan.level==='Atenção').length;
 const healthyExperienceCount=experiencePortfolio.filter(x=>x.plan.level==='Saudável').length;
 const experiencePriority=experiencePortfolio.filter(x=>x.plan.level!=='Saudável').sort((a,b)=>(a.plan.level==='Insatisfeito'?0:1)-(b.plan.level==='Insatisfeito'?0:1)).slice(0,5);

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
  if(!session)return;
  if(demo){setError('A foto não pode ser alterada no modo demonstração. Entre na sua conta para salvar o perfil.');return}
  if(file.size>2097152){setError('A foto deve ter no máximo 2 MB.');return}
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Use JPG, PNG ou WebP.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const stamp=Date.now();
   const path=session.user.id+'/avatar-'+stamp+'.'+ext;
   const r=await fetch(SUPA+'/storage/v1/object/vectta-avatars/'+path,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':file.type},body:file});
   if(!r.ok){const j:any=await r.json().catch(()=>({}));throw new Error(j.message||j.error||'Não foi possível enviar a foto.')}
   const avatar_url=SUPA+'/storage/v1/object/public/vectta-avatars/'+path;
   const pr=await fetch(SUPA+'/rest/v1/profiles?id=eq.'+session.user.id,{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({avatar_url})});
   const pj:any=await pr.json().catch(()=>[]);
   if(!pr.ok)throw new Error(pj.message||'Foto enviada, mas não foi possível atualizar o perfil.');
   const updated=pj[0]||{id:session.user.id,full_name:profileForm.full_name||displayName,workspace_name:profileForm.workspace_name||'Carteira pessoal',phone:profileForm.phone||'',avatar_url};
   setProfileForm(x=>({...x,avatar_url}));
   setProfile(updated);
   setNotice('Foto atualizada com sucesso.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao enviar foto.')}finally{setBusy(false)}
 }
 async function saveFeedback(){
  if(!feedbackForm.project_id||!feedbackForm.comment.trim()){setError('Escolha a implantação e escreva o feedback.');return}
  if(demo){setNotice('Na demonstração, o feedback não é persistido.');return}
  if(!session)return;
  setBusy(true);setError('');
  try{
   const body={project_id:feedbackForm.project_id,contact_name:feedbackForm.contact_name,contact_role:feedbackForm.contact_role,channel:feedbackForm.channel,csat:Number(feedbackForm.csat),nps:Number(feedbackForm.nps),ces:Number(feedbackForm.ces),comment:feedbackForm.comment};
   const r=await fetch(SUPA+'/rest/v1/feedbacks',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
   const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Não foi possível salvar o feedback.');setFeedbacks(x=>[j[0],...x]);setFeedbackForm(x=>({...x,contact_name:'',contact_role:'',comment:''}));setNotice('Feedback registrado.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar feedback.')}finally{setBusy(false)}
 }
 function parseDelimitedLine(line:string,sep:string){
  const out:string[]=[];let cur='';let quoted=false;
  for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}else if(ch===sep&&!quoted){out.push(cur.trim());cur=''}else cur+=ch}
  out.push(cur.trim());return out;
 }
 function normalizeHeader(v:string){return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
 async function importCampaignFile(file:File){
  setError('');setNotice('');
  if(file.size>3*1024*1024){setError('A lista deve ter no máximo 3 MB.');return}
  if(!/\.(csv|txt)$/i.test(file.name)){setError('Use um arquivo CSV. No Excel, salve a planilha como CSV UTF-8.');return}
  try{
   const raw=(await file.text()).replace(/^\uFEFF/,'');
   const lines=raw.split(/\r?\n/).filter(x=>x.trim());
   if(lines.length<2)throw new Error('A planilha precisa ter cabeçalho e pelo menos um contato.');
   const first=lines[0];const candidates=[';',',','\t'];const sep=candidates.sort((a,b)=>first.split(b).length-first.split(a).length)[0];
   const headers=parseDelimitedLine(first,sep).map(normalizeHeader);
   const find=(names:string[])=>headers.findIndex(h=>names.includes(h));
   const ni=find(['nome','name','contato','contact_name']),pi=find(['telefone','celular','whatsapp','phone','numero','numero de telefone']),ei=find(['email','e-mail']),si=find(['segmento','segment']),gi=find(['grupo','group','group_name']),pri=find(['perfil','profile']);
   if(pi<0&&ei<0)throw new Error('A planilha precisa ter uma coluna Telefone/Celular/WhatsApp ou E-mail.');
   const parsed:ImportContact[]=lines.slice(1).map(line=>{const row=parseDelimitedLine(line,sep);return{name:ni>=0?row[ni]||'':'',phone:pi>=0?normalizePhone(row[pi]||''):'',email:ei>=0?row[ei]||'':'',segment:si>=0?row[si]||'':'',group_name:gi>=0?row[gi]||'':'',profile:pri>=0?row[pri]||'':''}}).filter(x=>x.phone||x.email);
   const seen=new Set<string>();const unique=parsed.filter(x=>{const key=(x.phone||x.email).toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true});
   setImportedContacts(unique);setCampaignForm(x=>({...x,recipientMode:'list',listGroup:'Todos',listProfile:'Todos'}));setNotice(unique.length+' contatos carregados da planilha.');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível ler a planilha.')}
 }
 function downloadCampaignModel(){
  const content='nome;telefone;email;segmento;grupo;perfil\nMaria Silva;+5531999999999;maria@empresa.com;Saúde;Clientes ativos;Sponsor\n';
  const blob=new Blob([content],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='modelo-contatos-vectta.csv';a.click();URL.revokeObjectURL(url);
 }
 async function saveCampaign(){
  if(!campaignForm.name.trim()||!campaignForm.message.trim()){setError('Dê um nome à campanha e escreva a mensagem.');return}
  if(!campaignTargets.length){setError('Adicione pelo menos um destinatário elegível.');return}
  if(campaignForm.channel==='WhatsApp'&&!campaignForm.template_name.trim()){setError('Para disparo de WhatsApp, informe o nome do template aprovado na Meta.');return}
  if(demo){setNotice('Na demonstração, a campanha não é persistida.');return}
  if(!session)return;
  setBusy(true);setError('');setNotice('');
  try{
   const dedup=new Map<string,CampaignTarget>();
   campaignTargets.forEach(x=>{const key=campaignForm.channel==='E-mail'?x.email.toLowerCase():normalizePhone(x.phone);if(key&&!dedup.has(key))dedup.set(key,x)});
   const recipients=[...dedup.values()];
   const body={name:campaignForm.name,channel:campaignForm.channel,message:campaignForm.message,audience:campaignForm.audience,status:'Pronta para integração',recipient_mode:campaignForm.recipientMode,template_name:campaignForm.template_name,template_language:campaignForm.template_language,target_filter:{consentRequired:true,targetCount:recipients.length,segment:campaignForm.segment,phase:campaignForm.phase,risk:campaignForm.risk,listGroup:campaignForm.listGroup,listProfile:campaignForm.listProfile}};
   const r=await fetch(SUPA+'/rest/v1/campaigns',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(body)});
   const j:any=await r.json();if(!r.ok)throw new Error(j.message||'Não foi possível preparar a campanha.');
   const created=j[0];
   const rows=recipients.map(x=>({campaign_id:created.id,name:x.name||'',phone:normalizePhone(x.phone||''),email:x.email||'',source:x.source,status:'Pendente'}));
   const rr=await fetch(SUPA+'/rest/v1/campaign_recipients',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(rows)});
   const rj:any=await rr.json();if(!rr.ok)throw new Error(rj.message||'Campanha salva, mas não foi possível gravar os destinatários.');
   if(campaignForm.recipientMode!=='base'){
    const external=recipients.map(x=>({name:x.name||'',phone:normalizePhone(x.phone||''),email:x.email||'',segment:x.segment||'',group_name:x.group_name||'',profile:x.profile||'',consent:true,source:x.source,tags:{campaign_id:created.id}}));
    const cr=await fetch(SUPA+'/rest/v1/campaign_contacts',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(external)});
    if(!cr.ok){const cj:any=await cr.json().catch(()=>({}));console.warn('Contato externo não persistido',cj)}
   }
   setCampaigns(x=>[created,...x]);setCampaignRecipients(x=>[...rj,...x]);setCampaignForm({name:'',channel:'WhatsApp',audience:'Todos',message:'',recipientMode:'base',manualName:'',manualPhone:'',manualConsent:false,segment:'Todos',phase:'Todas',risk:'Todos',listGroup:'Todos',listProfile:'Todos',template_name:'',template_language:'pt_BR'});setImportedContacts([]);setImportConsent(false);
   setNotice('Campanha preparada com '+recipients.length+' destinatários. Agora você pode enviar quando o canal WhatsApp estiver conectado.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar campanha.')}finally{setBusy(false)}
 }
 async function sendCampaign(ca:Campaign){
  if(!session||demo)return;
  setBusy(true);setError('');setNotice('');
  try{
   const r=await fetch(SUPA+'/functions/v1/send-whatsapp-campaign',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({campaign_id:ca.id})});
   const j:any=await r.json().catch(()=>({}));
   if(!r.ok)throw new Error(j.message||j.error||'Não foi possível enviar a campanha.');
   setNotice('Envio concluído: '+(j.sent||0)+' enviados, '+(j.failed||0)+' com erro.');await load();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao enviar campanha.')}finally{setBusy(false)}
 }
 function goBack(){if(selected){setSelected('');return}const target=previousView||'Início';setView(target);setPreviousView('Início');setMobile(false)}


 async function inviteWorkspaceMember(){
  if(!session||demo||currentRole!=='owner')return;
  const normalized=inviteEmail.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)){setError('Informe um e-mail válido.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const r=await fetch(SUPA+'/rest/v1/workspace_invites',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({email:normalized,role:inviteRole})});
   const j:any=await r.json().catch(()=>[]);
   if(!r.ok)throw new Error(j.message||'Não foi possível registrar o convite.');
   const mail=await fetch(SUPA+'/auth/v1/otp?redirect_to='+encodeURIComponent(location.origin),{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:normalized,create_user:true,data:{vectta_invite:true}})});
   if(!mail.ok){
    setNotice('A permissão foi registrada, mas o e-mail automático não pôde ser enviado. A pessoa ainda poderá entrar ou criar conta com esse e-mail.');
   }else{
    setNotice('Convite registrado. Enviamos um link de acesso para '+normalized+'.');
   }
   setInviteEmail('');await load();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao convidar integrante.')}finally{setBusy(false)}
 }
 async function updateWorkspaceMember(member:WorkspaceMember,patch:Partial<Pick<WorkspaceMember,'role'|'status'>>){
  if(!session||demo||currentRole!=='owner'||member.role==='owner')return;
  setBusy(true);setError('');
  try{
   const r=await fetch(SUPA+'/rest/v1/workspace_members?workspace_owner_id=eq.'+encodeURIComponent(member.workspace_owner_id)+'&user_id=eq.'+encodeURIComponent(member.user_id),{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(patch)});
   const j:any=await r.json().catch(()=>[]);
   if(!r.ok)throw new Error(j.message||'Não foi possível alterar a permissão.');
   setNotice('Permissão atualizada.');await load();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao alterar permissão.')}finally{setBusy(false)}
 }
 async function revokeWorkspaceInvite(invite:WorkspaceInvite){
  if(!session||demo||currentRole!=='owner'||invite.status!=='pending')return;
  setBusy(true);setError('');
  try{
   const r=await fetch(SUPA+'/rest/v1/workspace_invites?id=eq.'+encodeURIComponent(invite.id),{method:'PATCH',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status:'revoked'})});
   const j:any=await r.json().catch(()=>[]);
   if(!r.ok)throw new Error(j.message||'Não foi possível revogar o convite.');
   setNotice('Convite revogado.');await load();
  }catch(e){setError(e instanceof Error?e.message:'Falha ao revogar convite.')}finally{setBusy(false)}
 }

 async function createProject(){
  if(!form.client.trim())return;
  if(demo){setProjects(x=>x.concat({id:'d'+Date.now(),client:form.client,segment:form.segment,system:form.system,owner:form.owner,phase:form.phase,start_date:today(),due_date:form.due||null,scope:form.scope,manual_risk_level:'Baixo',metadata:{revenue:Number(form.revenue||0)}}));setModal(false);return}
  if(!session)return;
  setBusy(true);
  try{
   const body={client:form.client,segment:form.segment,system:form.system,owner:form.owner,phase:form.phase,start_date:today(),due_date:form.due||null,scope:form.scope,manual_risk_level:'Baixo',metadata:{revenue:Number(form.revenue||0)},cnpj:form.cnpj,contact_name:form.contact_name,contact_email:form.contact_email,contact_phone:form.contact_phone,message_opt_in:form.message_opt_in,preferred_channel:form.preferred_channel};
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
 async function savePendingTask(task:PendingTask){
  if(!session)throw new Error('Entre novamente para salvar.');
  if(!projects.some(p=>p.id===task.project_id))throw new Error('Selecione um cliente da sua carteira.');
  const {id,updated_at,title,owner,due_date,done,critical,kind,priority,blocked,detail,project_id}=task;
  const fields={title:title.trim(),owner:owner.trim(),due_date,done,critical,kind,priority,blocked,detail,project_id};
  if(demo){const next={...fields,id:id||'task-'+crypto.randomUUID(),updated_at:new Date().toISOString()};setTasks(items=>id?items.map(t=>t.id===id?next:t):[next,...items]);return;}
  const query=id?'?id=eq.'+encodeURIComponent(id)+(updated_at?'&updated_at=eq.'+encodeURIComponent(updated_at):''):'';
  const response=await fetch(SUPA+'/rest/v1/tasks'+query,{method:id?'PATCH':'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(fields)});
  if(!response.ok)throw new Error('Não foi possível salvar. Confira sua sessão e tente novamente.');
  const rows=await response.json() as Task[];
  if(!Array.isArray(rows)||!rows[0])throw new Error('A pendência mudou em outra sessão. Atualize a carteira antes de editar novamente.');
  setTasks(items=>id?items.map(t=>t.id===id?rows[0]:t):[rows[0],...items]);
 }
 async function saveCSPlan(plan:CSOperation){
  if(!session)throw new Error('Entre novamente para salvar.');
  if(!projects.some(p=>p.id===plan.project_id))throw new Error('Selecione um cliente da sua carteira.');
  if(demo){const next={...plan,id:plan.id||'cs-'+crypto.randomUUID(),updated_at:new Date().toISOString()};setOps(items=>plan.id?items.map(o=>o.id===plan.id?next:o):[next,...items]);return;}
  const {id,updated_at,...fields}=plan;
  const query=id?'?id=eq.'+encodeURIComponent(id)+(updated_at?'&updated_at=eq.'+encodeURIComponent(updated_at):''):'';
  const response=await fetch(SUPA+'/rest/v1/operations'+query,{method:id?'PATCH':'POST',headers:{apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(fields)});
  const rows=await response.json() as Op[];
  if(!response.ok)throw new Error('Não foi possível salvar. Confira os campos e sua sessão.');
  if(!Array.isArray(rows)||!rows[0])throw new Error('Esse registro mudou em outra sessão. Atualize a carteira antes de editar novamente.');
  setOps(items=>id?items.map(o=>o.id===id?rows[0]:o):[rows[0],...items]);
 }
 function table(rows:Project[]){return <div className={s.tableWrap}><table><thead><tr><th>Cliente / sistema</th><th>Etapa</th><th>Progresso</th><th>Prazo</th><th>Risco</th><th/></tr></thead><tbody>{rows.map(p=>{const r=risk(p);return <tr key={p.id}><td><button className={s.client} onClick={()=>setSelected(p.id)}>{p.client}</button><span>{p.system} · {p.segment}</span></td><td><span className={s.badge}>{p.phase}</span></td><td>{progress(p)}%<div className={s.progress}><i style={{width:progress(p)+'%'}}/></div></td><td>{fmt(p.due_date)}</td><td><span className={s.badge+' '+badge(r.level)}>{r.level}</span></td><td><button className={s.btn+' '+s.ghost} onClick={()=>setSelected(p.id)}><ChevronRight size={16}/></button></td></tr>})}</tbody></table>{!rows.length&&<div className={s.empty}>Nenhuma implantação encontrada.</div>}</div>}

 if(recoveryToken)return <div className={s.auth}>
  <section className={s.authHero}>
   <div className={s.authBrand}><img src={VT} alt="VT"/><b>Vectta</b></div>
   <div className={s.authCopy}><h1>Recupere o acesso.<br/><em>Com segurança.</em></h1><p>Defina uma nova senha forte para sua conta Vectta.</p></div>
   <img className={s.authMascot} src={MASCOT} alt="Mascote chAI"/>
  </section>
  <section className={s.authPanel}>
   <form className={s.authCard} onSubmit={resetRecoveredPassword}>
    <div className={s.brandRow}><img className={s.vt} src={VT} alt="VT"/><div className={s.brandName}>Vectta</div></div>
    {error&&<div className={s.error}>{error}</div>}
    <div><h2>Criar nova senha</h2><p>{email?<>Conta: <strong>{email}</strong></>:'Link de recuperação validado.'}</p></div>
    <label>Nova senha<input className={s.input} type="password" autoComplete="new-password" value={recoveryPassword} minLength={12} onChange={e=>setRecoveryPassword(e.target.value)}/></label>
    <label>Confirmar nova senha<input className={s.input} type="password" autoComplete="new-password" value={recoveryConfirm} minLength={12} onChange={e=>setRecoveryConfirm(e.target.value)}/></label>
    <small>Use 12+ caracteres com maiúscula, minúscula, número e símbolo.</small>
    <button type="submit" className={s.btn+' '+s.primary} disabled={busy}><ShieldCheck size={16}/>{busy?'Atualizando...':'Atualizar senha'}</button>
    <button type="button" className={s.btn} onClick={()=>{setRecoveryToken('');setRecoveryPassword('');setRecoveryConfirm('');history.replaceState(null,'',location.pathname+location.search);}}>Cancelar</button>
   </form>
   <img className={s.authChaiCorner} src={CHAI} alt="chAI"/>
  </section>
 </div>;

 if(!session&&!demo)return <div className={s.auth}>
  <section className={s.authHero}>
   <div className={s.authBrand}><img src={VT} alt="VT"/><b>Vectta</b></div>
   <div className={s.authCopy}><h1>Implante confiança.<br/><em>Entregue evolução.</em></h1><p>Gestão de implementações e experiência do cliente,<br/>da descoberta ao pós-go-live.</p></div>
   <img className={s.authMascot} src={MASCOT} alt="Mascote chAI"/>
  </section>
  <section className={s.authPanel}><form className={s.authCard} onSubmit={(e)=>{e.preventDefault();void submitAuth();}}><div className={s.brandRow}><img className={s.vt} src={VT} alt="VT"/><div className={s.brandName}>Vectta</div></div>{error&&<div className={s.error}>{error}</div>}{notice&&<div className={s.notice}>{notice}</div>}<div><h2>{mode==='login'?'Entrar':mode==='register'?'Criar conta':'Recuperar acesso'}</h2><p>Sua carteira é privada e isolada por usuário.</p></div>{mode==='register'&&<label>Nome<input className={s.input} value={name} onChange={e=>setName(e.target.value)}/></label>}<label>E-mail<input className={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=='forgot'&&<label>Senha<input className={s.input} type="password" value={password} minLength={12} onChange={e=>setPassword(e.target.value)}/></label>}<button type="submit" className={s.btn+' '+s.primary} disabled={busy}><ShieldCheck size={16}/>{mode==='login'?'Entrar':mode==='register'?'Criar conta':'Enviar link'}</button>{mode==='login'&&<button type="button" className={s.btn} disabled={busy} onClick={sendAccessLink}><KeyRound size={16}/> Entrar sem senha</button>}<div className={s.authLinks}><button type="button" className={s.link} onClick={()=>setMode(mode==='register'?'login':'register')}>{mode==='register'?'Já tenho conta':'Criar conta'}</button>{mode!=='forgot'?<button type="button" className={s.link} onClick={()=>setMode('forgot')}>Esqueci minha senha</button>:<button type="button" className={s.link} onClick={()=>setMode('login')}>Voltar</button>}</div><button type="button" className={s.btn} onClick={enterDemo}>Explorar demonstração</button></form><img className={s.authChaiCorner} src={CHAI} alt="chAI"/></section>
 </div>;

 let body:any;
 if(current)body=<>
 <header className={s.pageHead}><div><span className={s.eyebrow}>{current.segment} / {current.system}</span><h1>{current.client}</h1><p>{current.owner} · prazo {fmt(current.due_date)}{current.cnpj?' · CNPJ '+current.cnpj:''}</p></div><div className={s.actions}><button className={s.btn+(showTrail?' '+s.primary:'')} onClick={()=>setShowTrail(x=>!x)}><Workflow size={16}/>{showTrail?'Ocultar Rota Vectta':'Visualizar Rota Vectta'}</button></div></header>
 {showTrail&&<section className={s.trailPanel}><div className={s.trailHeader}><div><span className={s.eyebrow}>ROTA VECTTA</span><h2>A jornada da implantação</h2><p>Uma trilha visual do diagnóstico até a evolução contínua.</p></div><span className={s.badge}>{Math.round((Math.max(currentTrailIndex,0)/(trailStages.length-1))*100)}% da rota</span></div><div className={s.trailTrack}>{trailStages.map((stage,index)=>{const done=index<currentTrailIndex,active=index===currentTrailIndex;return <button key={stage.phase} className={s.trailStop+(done?' '+s.trailDone:'')+(active?' '+s.trailActive:'')} onClick={()=>setTrailFocus(stage.phase)}><span className={s.trailNumber}>{done?<Check size={14}/>:index+1}</span><strong>{stage.title}</strong>{active&&<img src={MASCOT} alt="chAI na etapa atual" className={s.trailMascot}/>}</button>})}</div><div className={s.trailFocus}><div><span className={s.eyebrow}>CHECKPOINT</span><h3>{focusedTrail.title}</h3><p>{focusedTrail.desc}</p><div className={s.trailGate}><Check size={14}/><span><b>Critério de passagem:</b> {focusedTrail.gate}</span></div></div><div className={s.trailStatus}><b>{current.phase}</b><span>etapa atual</span></div></div></section>}
 <div className={s.detailGrid}><section className={s.panel}><div className={s.sectionHead}><h2>Plano de entregas</h2><span className={s.badge}>{progress(current)}%</span></div><div className={s.stack}>{tasks.filter(t=>t.project_id===current.id).map(t=><article className={s.task} key={t.id}><button className={s.check+(t.done?' '+s.done:'')} onClick={()=>toggleTask(t)}>{t.done&&<Check size={14}/>}</button><div><strong>{t.title}</strong><span>{t.owner} · {fmt(t.due_date)}</span></div>{t.critical&&<span className={s.badge+' '+s.bad}>Crítica</span>}</article>)}</div></section><div className={s.detailSide}><section className={s.panel}><span className={s.eyebrow}>PRONTIDÃO</span><h2>{progress(current)}% da implantação</h2><div className={s.progress}><i style={{width:progress(current)+'%'}}/></div><div className={s.gates}>{[['Entregas críticas resolvidas',!tasks.some(t=>t.project_id===current.id&&t.critical&&!t.done)],['Requisitos aprovados',ops.some(o=>o.project_id===current.id&&o.kind==='Requisito'&&o.status==='Aprovado')],['Testes com evidência',ops.some(o=>o.project_id===current.id&&o.kind==='Teste'&&o.status==='Aprovado'&&o.evidence)],['Sem chamados impeditivos',!ops.some(o=>o.project_id===current.id&&o.kind==='Chamado'&&o.priority==='Alta')]].map(([label,ok])=><div key={String(label)} className={s.gate+(ok?' '+s.ok:'')}><span>{ok?<Check size={14}/>:<Clock3 size={14}/>}</span><b>{String(label)}</b></div>)}</div></section><section className={s.panel}><span className={s.eyebrow}>CONTATO DO CLIENTE</span><h2>{current.contact_name||'Contato não cadastrado'}</h2><p>{current.contact_email||'Sem e-mail'}{current.contact_phone?' · '+current.contact_phone:''}</p><div className={s.sectionHead}><span>Canal preferido</span><span className={s.badge}>{current.preferred_channel||'—'}</span></div></section><section className={s.panel}><span className={s.eyebrow}>ESCOPO</span><p>{current.scope||'Escopo ainda não registrado.'}</p><div className={s.sectionHead}><span>Risco atual</span><span className={s.badge+' '+badge(risk(current).level)}>{risk(current).level}</span></div></section></div></div></>;
 else if(view==='Início')body=<><section className={s.hero}><div className={s.heroCopy}><span className={s.heroKicker}>VECTTA · CENTRO DE IMPLEMENTAÇÃO</span><h1>Implante confiança.<br/><em>Entregue evolução.</em></h1><p>Gestão de implementações e experiência do cliente,<br/>da descoberta ao pós-go-live.</p></div><div className={s.heroVisual}><div className={s.heroGlow}/><img className={s.heroMascot} src={HOME_MASCOT} alt="chAI acompanhando a operação"/></div></section><section className={s.gaugeGrid} aria-label="Indicadores principais da carteira"><button className={s.gaugeCard} data-tone="cyan" onClick={()=>{setPhase('Todas');changeView('Implantações')}}><div className={s.gaugeRing} style={{'--gauge':Math.min(1,active.length/Math.max(projects.length,1))} as any}><div className={s.gaugeInner}><Layers3 size={18}/><b>{active.length}</b><span>IMPLANTAÇÕES ATIVAS</span><small>carteira em andamento</small></div></div></button><button className={s.gaugeCard} data-tone="pink" onClick={()=>changeView('Pendências')}><div className={s.gaugeRing} style={{'--gauge':Math.min(1,pending.length/Math.max(tasks.length,1))} as any}><div className={s.gaugeInner}><ListTodo size={18}/><b>{pending.length}</b><span>PENDÊNCIAS</span><small>itens abertos</small></div></div></button><button className={s.gaugeCard} data-tone="orange" onClick={()=>{setOverviewRisk('Alto');changeView('Riscos e estratégias')}}><div className={s.gaugeRing} style={{'--gauge':Math.min(1,high/Math.max(projects.length,1))} as any}><div className={s.gaugeInner}><AlertTriangle size={18}/><b>{high}</b><span>RISCO ALTO</span><small>requer atenção</small></div></div></button><button className={s.gaugeCard} data-tone="violet" onClick={()=>{setPhase('Concluída');changeView('Implantações')}}><div className={s.gaugeRing} style={{'--gauge':Math.min(1,projects.filter(p=>p.phase==='Concluída').length/Math.max(projects.length,1))} as any}><div className={s.gaugeInner}><Check size={18}/><b>{projects.filter(p=>p.phase==='Concluída').length}</b><span>CONCLUÍDAS</span><small>total da carteira</small></div></div></button></section><section className={s.moduleGrid}>{[['Acompanhamento de CS',Headphones,'Saúde da carteira, reversões e chAI'],['Implantações',Layers3,'Carteira, escopo e etapas'],['Pendências',ListTodo,'Bloqueios e próximos passos'],['Riscos e estratégias',AlertTriangle,'Causa, ação e critério de saída'],['Cronograma',CalendarDays,'Prazos, dependências e marcos'],['Requisitos',ClipboardCheck,'Escopo e aprovação'],['Testes',TestTube2,'Evidência de aceitação'],['Chamados',Headphones,'Problemas e impeditivos'],['Rentabilidade',WalletCards,'Receita, esforço e resultado']].map(([label,Icon,desc]:any)=><button className={s.moduleCard} key={label} onClick={()=>changeView(label)}><Icon size={20}/><div><strong>{label}</strong><span>{desc}</span></div><ChevronRight size={18}/></button>)}</section></>;
 else if(view==='Acompanhamento de CS')body=<CustomerSuccess data={{projects,tasks,feedbacks,operations:ops}} demo={demo} token={session?.access_token||''} owner={displayName} onSave={saveCSPlan} onOpen={id=>setSelected(id)}/>;
 else if(view==='Visão geral')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>VISÃO GERAL</span><h1>Centro de comando da implantação.</h1><p>Saúde da carteira, riscos, prazos, execução e resultado em uma única leitura.</p></div><div className={s.actions}><button className={s.btn} onClick={()=>changeView('Implantações')}><Layers3 size={16}/> Ver carteira</button><button className={s.btn+' '+s.primary} onClick={()=>setModal(true)}><Plus size={16}/> Nova implantação</button></div></header>
 <section className={s.overviewKpis}>
  <button className={s.overviewKpi} onClick={()=>{setPhase('Todas');changeView('Implantações')}}><span>Implantações ativas</span><b>{active.length}</b><small>{projects.length} clientes na carteira</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Pendências')}><span>Execução média</span><b>{avgProgress}%</b><small>{completedTasks} entregas concluídas</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Feedbacks')}><span>Experiência insatisfeita</span><b>{dissatisfiedCount}</b><small>{attentionExperienceCount} clientes em atenção</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Feedbacks')}><span>Experiência saudável</span><b>{healthyExperienceCount}</b><small>sem sinal negativo atual</small></button>
  <button className={s.overviewKpi} onClick={()=>{setOverviewRisk('Alto');changeView('Riscos e estratégias')}}><span>Risco alto</span><b>{riskCounts.Alto}</b><small>exige ação prioritária</small></button>
  <button className={s.overviewKpi} onClick={()=>{setOverviewRisk('Médio');changeView('Riscos e estratégias')}}><span>Risco médio</span><b>{riskCounts.Médio}</b><small>precisa de acompanhamento</small></button>
  <button className={s.overviewKpi} onClick={()=>{setOverviewRisk('Baixo');changeView('Riscos e estratégias')}}><span>Risco baixo</span><b>{riskCounts.Baixo}</b><small>operação dentro do esperado</small></button>
  <button className={s.overviewKpi} onClick={()=>changeView('Pendências')}><span>Pendências críticas</span><b>{criticalOpen}</b><small>criticidade operacional · {blockedOpen} bloqueadas</small></button>
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
  <section className={s.dashboardCard+' '+s.dashboardWide}><div className={s.dashboardTitle}><div><h2>Ações de experiência recomendadas</h2><p>O Vectta prioriza clientes que precisam de intervenção e mostra a próxima melhor ação.</p></div><button className={s.link} onClick={()=>changeView('Feedbacks')}>Ver experiência</button></div><div className={s.experienceActionList}>{experiencePriority.map(({project,plan})=><button key={project.id} className={s.experienceAction} onClick={()=>setSelected(project.id)}><div><span className={s.badge+' '+experienceBadge(plan.level)}>{plan.level}</span><strong>{project.client}</strong><small>{plan.signals[0]||'Sinal de atenção da carteira'}</small></div><div><b>{plan.actions[0]}</b><small>{plan.sla}</small></div></button>)}{!experiencePriority.length&&<div className={s.empty}>Nenhum cliente exige intervenção de experiência agora.</div>}</div></section>
  <section className={s.dashboardCard+' '+s.dashboardWide}><div className={s.dashboardTitle}><div><h2>Acessos rápidos</h2><p>Entre direto nos pontos mais usados da operação.</p></div></div><div className={s.quickActions}><button className={s.quickAction} onClick={()=>changeView('Implantações')}><Layers3 size={18}/> Implantações</button><button className={s.quickAction} onClick={()=>changeView('Pendências')}><ListTodo size={18}/> Pendências</button><button className={s.quickAction} onClick={()=>changeView('Riscos e estratégias')}><AlertTriangle size={18}/> Riscos</button><button className={s.quickAction} onClick={()=>changeView('Resultados')}><ChartNoAxesCombined size={18}/> Resultados</button></div></section>
 </div></>;
 else if(view==='Implantações')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>IMPLANTAÇÕES</span><h1>Sua carteira.</h1><p>Clientes, etapas e entregas em um só lugar.</p></div><button className={s.btn+' '+s.primary} onClick={()=>setModal(true)}><Plus size={16}/> Nova implantação</button></header><div className={s.toolbar}><div className={s.search}><Search size={16}/><input className={s.input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por empresa, CNPJ, contato, e-mail, telefone ou sistema"/></div><select className={s.select} value={phase} onChange={e=>setPhase(e.target.value)}><option>Todas</option>{phases.map(x=><option key={x}>{x}</option>)}</select></div>{table(filtered)}</>;

 else if(view==='Relatórios e dados')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>RELATÓRIOS E DADOS</span><h1>Métricas que mostram a saúde da implantação.</h1><p>Indicadores atualizados automaticamente a cada 30 segundos a partir da carteira registrada.</p></div><button className={s.btn} onClick={()=>void load()}><Clock3 size={16}/> Atualizar agora</button></header><section className={s.overviewKpis}><div className={s.overviewKpi}><span>Saúde de prazo</span><b>{scheduleHealth}%</b><small>ativas sem prazo vencido</small></div><div className={s.overviewKpi}><span>Tempo médio</span><b>{avgImplDays}d</b><small>desde o início da implantação</small></div><div className={s.overviewKpi}><span>Execução média</span><b>{avgProgress}%</b><small>entregas concluídas</small></div><div className={s.overviewKpi}><span>Marcos vencidos</span><b>{overdueMilestones}</b><small>entregas abertas após o prazo</small></div><div className={s.overviewKpi}><span>Taxa de conclusão</span><b>{completionRate}%</b><small>implantações concluídas</small></div><div className={s.overviewKpi}><span>UAT / testes aprovados</span><b>{uatRate}%</b><small>{testOps.length} testes registrados</small></div><div className={s.overviewKpi}><span>CSAT</span><b>{avgCsat}</b><small>escala de 1 a 5</small></div><div className={s.overviewKpi}><span>NPS</span><b>{npsScore}</b><small>promotores menos detratores</small></div><div className={s.overviewKpi}><span>No prazo</span><b>{finishedWithDates.length?onTimeRate+'%':'—'}</b><small>projetos concluídos dentro da data</small></div><div className={s.overviewKpi}><span>Desvio médio</span><b>{finishedWithDates.length?(avgScheduleVariance>0?'+':'')+avgScheduleVariance+'d':'—'}</b><small>conclusão real versus planejada</small></div></section><div className={s.reportGrid}><section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Funil das etapas</h2><p>Distribuição atual das implantações.</p></div></div><div className={s.phaseChart}>{phaseOverview.map(item=><button key={item.name} className={s.phaseRow} onClick={()=>{setPhase(item.name);changeView('Implantações')}}><span>{item.name}</span><div className={s.phaseTrack}><i style={{width:(item.count/maxPhase*100)+'%'}}/></div><b>{item.count}</b></button>)}</div></section><section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Qualidade e experiência</h2><p>Sinais de aceite, esforço e satisfação.</p></div></div><div className={s.dataBars}><div><span>Saúde de prazo</span><b>{scheduleHealth}%</b><i><em style={{width:scheduleHealth+'%'}}/></i></div><div><span>Testes aprovados</span><b>{uatRate}%</b><i><em style={{width:uatRate+'%'}}/></i></div><div><span>Execução média</span><b>{avgProgress}%</b><i><em style={{width:avgProgress+'%'}}/></i></div><div><span>CES médio</span><b>{avgCes}</b><small>esforço percebido, escala 1–7</small></div></div></section><section className={s.dashboardCard+' '+s.dashboardWide}><div className={s.dashboardTitle}><div><h2>Indicadores operacionais</h2><p>O que merece atenção agora.</p></div></div><div className={s.opsSnapshot}><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Pendências abertas</span><b>{pending.length}</b></button><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Críticas</span><b>{criticalOpen}</b></button><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Bloqueadas</span><b>{blockedOpen}</b></button><button className={s.opsStat} onClick={()=>changeView('Pendências')}><span>Marcos vencidos</span><b>{overdueMilestones}</b></button><button className={s.opsStat} onClick={()=>changeView('Riscos e estratégias')}><span>Risco alto</span><b>{riskCounts.Alto}</b></button><button className={s.opsStat} onClick={()=>changeView('Feedbacks')}><span>Feedbacks</span><b>{feedbacks.length}</b></button><button className={s.opsStat} onClick={()=>changeView('Implantações')}><span>Conclusão</span><b>{completionRate}%</b></button><button className={s.opsStat} onClick={()=>changeView('Rentabilidade')}><span>Margem</span><b>{margin}%</b></button></div></section></div></>;
 else if(view==='Feedbacks')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>FEEDBACKS</span><h1>Voz do cliente com plano de ação.</h1><p>Feedback negativo não termina em um indicador: ele abre uma estratégia de recuperação da experiência.</p></div></header><section className={s.feedbackSummary}><div><span>CSAT médio</span><b>{avgCsat}</b><small>/ 5</small></div><div><span>NPS</span><b>{npsScore}</b><small>pontos</small></div><div><span>CES médio</span><b>{avgCes}</b><small>/ 7</small></div><div><span>Insatisfeitos</span><b>{dissatisfiedCount}</b><small>{attentionExperienceCount} em atenção</small></div></section><div className={s.feedbackGrid}><section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Novo feedback</h2><p>Registre uma percepção recebida em reunião, ligação, e-mail ou mensagem.</p></div></div><div className={s.form}><label className={s.full}>Implantação<select className={s.input} value={feedbackForm.project_id} onChange={e=>setFeedbackForm({...feedbackForm,project_id:e.target.value})}><option value="">Selecione</option>{projects.map(p=><option key={p.id} value={p.id}>{p.client}</option>)}</select></label><label>Contato<input className={s.input} value={feedbackForm.contact_name} onChange={e=>setFeedbackForm({...feedbackForm,contact_name:e.target.value})}/></label><label>Cargo / papel<input className={s.input} value={feedbackForm.contact_role} onChange={e=>setFeedbackForm({...feedbackForm,contact_role:e.target.value})}/></label><label>Canal<select className={s.input} value={feedbackForm.channel} onChange={e=>setFeedbackForm({...feedbackForm,channel:e.target.value})}><option>Reunião</option><option>WhatsApp</option><option>E-mail</option><option>Ligação</option><option>Pesquisa</option></select></label><label>CSAT 1–5<input className={s.input} type="number" min="1" max="5" value={feedbackForm.csat} onChange={e=>setFeedbackForm({...feedbackForm,csat:e.target.value})}/></label><label>NPS 0–10<input className={s.input} type="number" min="0" max="10" value={feedbackForm.nps} onChange={e=>setFeedbackForm({...feedbackForm,nps:e.target.value})}/></label><label>CES 1–7<input className={s.input} type="number" min="1" max="7" value={feedbackForm.ces} onChange={e=>setFeedbackForm({...feedbackForm,ces:e.target.value})}/></label><label className={s.full}>Feedback<textarea className={s.textarea} value={feedbackForm.comment} onChange={e=>setFeedbackForm({...feedbackForm,comment:e.target.value})}/></label></div><button className={s.btn+' '+s.primary} onClick={saveFeedback}>Registrar feedback</button></section><section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Histórico e recuperação</h2><p>Todo sinal insatisfatório recebe uma orientação prática de resposta.</p></div></div><div className={s.feedbackList}>{feedbacks.map(f=>{const p=projects.find(x=>x.id===f.project_id);const fh=feedbackHealth(f);const plan=p?experiencePlan(p):null;return <article key={f.id} className={s.feedbackCard}><div><div><strong>{p?.client||'Implantação'}</strong><span>{f.contact_name||'Contato'} · {f.channel}</span></div><span className={s.badge+' '+experienceBadge(fh.level)}>{fh.level}</span></div><p>{f.comment}</p><div className={s.feedbackScores}><span>CSAT <b>{f.csat??'—'}</b></span><span>NPS <b>{f.nps??'—'}</b></span><span>CES <b>{f.ces??'—'}</b></span></div>{plan&&fh.level!=='Saudável'&&<div className={s.recoveryPlan}><span className={s.eyebrow}>PLANO VECTTA DE RECUPERAÇÃO</span><strong>{plan.actions[0]}</strong><p>{plan.communication}</p><div><span><b>Responsável</b>{plan.owner}</span><span><b>Prazo de resposta</b>{plan.sla}</span><span><b>Cadência</b>{plan.cadence}</span><span><b>Sucesso</b>{plan.success}</span></div></div>}</article>})}{!feedbacks.length&&<div className={s.empty}>Nenhum feedback registrado ainda.</div>}</div></section></div></>;
 else if(view==='Campanhas')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>CAMPANHAS</span><h1>Mensagens em escala, com contexto.</h1><p>Escolha a base, segmente os contatos, revise a audiência e prepare o disparo pelo canal oficial.</p></div></header>
 <WhatsAppTestLab/>

 <div className={s.campaignGrid}>
  <section className={s.dashboardCard}>
   <div className={s.dashboardTitle}><div><h2>1. Quem vai receber?</h2><p>Use a carteira do Vectta, informe um número ou carregue uma nova lista.</p></div></div>
   <div className={s.recipientModes}>
    <button className={s.recipientMode+(campaignForm.recipientMode==='base'?' '+s.recipientModeActive:'')} onClick={()=>setCampaignForm({...campaignForm,recipientMode:'base'})}><Layers3 size={18}/><div><b>Base Vectta</b><span>Clientes já cadastrados</span></div></button>
    <button className={s.recipientMode+(campaignForm.recipientMode==='manual'?' '+s.recipientModeActive:'')} onClick={()=>setCampaignForm({...campaignForm,recipientMode:'manual'})}><Headphones size={18}/><div><b>Número manual</b><span>Um contato específico</span></div></button>
    <button className={s.recipientMode+(campaignForm.recipientMode==='list'?' '+s.recipientModeActive:'')} onClick={()=>setCampaignForm({...campaignForm,recipientMode:'list'})}><ClipboardCheck size={18}/><div><b>Nova planilha</b><span>Importar CSV</span></div></button>
   </div>

   {campaignForm.recipientMode==='base'&&<div className={s.audiencePanel}><div className={s.audienceTop}><div><strong>Toda a base Vectta</strong><span>{projects.length} empresas cadastradas · somente contatos autorizados entram no disparo</span></div><span className={s.audienceCount}>{campaignTargets.length} elegíveis</span></div><div className={s.form}><label>Público<select className={s.input} value={campaignForm.audience} onChange={e=>setCampaignForm({...campaignForm,audience:e.target.value})}><option>Todos</option><option>Ativos</option><option>Em risco</option><option>Pós-go-live</option></select></label><label>Segmento<select className={s.input} value={campaignForm.segment} onChange={e=>setCampaignForm({...campaignForm,segment:e.target.value})}>{campaignSegments.map(x=><option key={x}>{x}</option>)}</select></label><label>Etapa<select className={s.input} value={campaignForm.phase} onChange={e=>setCampaignForm({...campaignForm,phase:e.target.value})}><option>Todas</option>{phases.map(x=><option key={x}>{x}</option>)}</select></label><label>Risco<select className={s.input} value={campaignForm.risk} onChange={e=>setCampaignForm({...campaignForm,risk:e.target.value})}><option>Todos</option><option>Baixo</option><option>Médio</option><option>Alto</option></select></label></div></div>}

   {campaignForm.recipientMode==='manual'&&<div className={s.audiencePanel}><div className={s.form}><label>Nome do contato<input className={s.input} value={campaignForm.manualName} onChange={e=>setCampaignForm({...campaignForm,manualName:e.target.value})} placeholder="Ex.: Maria Souza"/></label><label>Número com DDD<input className={s.input} value={campaignForm.manualPhone} onChange={e=>setCampaignForm({...campaignForm,manualPhone:e.target.value})} placeholder="+55 31 99999-9999"/></label><label className={s.checkLabel}><input type="checkbox" checked={campaignForm.manualConsent} onChange={e=>setCampaignForm({...campaignForm,manualConsent:e.target.checked})}/><span>Confirmo que este contato autorizou receber mensagens.</span></label></div><div className={s.audienceHint}>{campaignForm.manualPhone?<><b>Número reconhecido:</b> {normalizePhone(campaignForm.manualPhone)||'inválido'}</>:<>Informe o celular para habilitar o destinatário.</>}</div></div>}

   {campaignForm.recipientMode==='list'&&<div className={s.audiencePanel}><div className={s.importRow}><label className={s.uploadButton}><ClipboardCheck size={16}/> Carregar lista CSV<input type="file" accept=".csv,.txt,text/csv" onChange={e=>{const file=e.target.files?.[0];if(file)void importCampaignFile(file)}}/></label><button className={s.btn+' '+s.ghost} onClick={downloadCampaignModel}>Baixar modelo CSV</button></div><div className={s.importStatus}><strong>{importedContacts.length} contatos carregados</strong><span>Colunas reconhecidas: nome, telefone, e-mail, segmento, grupo e perfil.</span></div>{importedContacts.length>0&&<div className={s.form}><label>Grupo<select className={s.input} value={campaignForm.listGroup} onChange={e=>setCampaignForm({...campaignForm,listGroup:e.target.value})}>{importedGroups.map(x=><option key={x}>{x}</option>)}</select></label><label>Perfil<select className={s.input} value={campaignForm.listProfile} onChange={e=>setCampaignForm({...campaignForm,listProfile:e.target.value})}>{importedProfiles.map(x=><option key={x}>{x}</option>)}</select></label><label className={s.checkLabel}><input type="checkbox" checked={importConsent} onChange={e=>setImportConsent(e.target.checked)}/><span>Confirmo que os contatos importados possuem autorização para esta comunicação.</span></label></div>}</div>}

   <div className={s.targetPreview}><div className={s.dashboardTitle}><div><h2>Prévia da audiência</h2><p>Antes de salvar, confira quem está entrando no disparo.</p></div><span className={s.audienceCount}>{campaignTargets.length}</span></div><div className={s.targetList}>{campaignTargets.slice(0,8).map((x,i)=><div className={s.targetItem} key={(x.phone||x.email)+i}><div><strong>{x.name||'Contato'}</strong><span>{campaignForm.channel==='E-mail'?x.email:x.phone}</span></div><span>{x.source==='base'?'Base Vectta':x.source==='planilha'?'Planilha':'Manual'}</span></div>)}{!campaignTargets.length&&<div className={s.empty}>Nenhum destinatário elegível com os filtros atuais.</div>}{campaignTargets.length>8&&<small className={s.moreTargets}>+ {campaignTargets.length-8} outros contatos</small>}</div></div>
  </section>

  <section className={s.dashboardCard}>
   <div className={s.dashboardTitle}><div><h2>2. Preparar mensagem</h2><p>Campanhas de WhatsApp iniciadas pela empresa usam modelo aprovado na Meta.</p></div></div>
   <div className={s.form}><label>Nome da campanha<input className={s.input} value={campaignForm.name} onChange={e=>setCampaignForm({...campaignForm,name:e.target.value})} placeholder="Ex.: Feliz Natal 2026"/></label><label>Canal<select className={s.input} value={campaignForm.channel} onChange={e=>setCampaignForm({...campaignForm,channel:e.target.value})}><option>WhatsApp</option><option>E-mail</option><option>SMS</option></select></label>{campaignForm.channel==='WhatsApp'&&<><label>Template aprovado na Meta<input className={s.input} value={campaignForm.template_name} onChange={e=>setCampaignForm({...campaignForm,template_name:e.target.value})} placeholder="Ex.: feliz_natal_2026"/></label><label>Idioma do template<select className={s.input} value={campaignForm.template_language} onChange={e=>setCampaignForm({...campaignForm,template_language:e.target.value})}><option value="pt_BR">Português (Brasil)</option><option value="en_US">Inglês (EUA)</option></select></label></>}<label className={s.full}>Mensagem / prévia<textarea className={s.textarea} value={campaignForm.message} onChange={e=>setCampaignForm({...campaignForm,message:e.target.value})} placeholder="Olá, {{nome}}! Desejamos..."/></label></div>
   <div className={s.consentNote}><ShieldCheck size={17}/><span>O Vectta não inclui contatos sem consentimento. Para WhatsApp, o envio final depende da conexão oficial com a Meta.</span></div>
   <button className={s.btn+' '+s.primary} disabled={busy||!campaignTargets.length} onClick={saveCampaign}><Plug size={16}/> Preparar campanha para {campaignTargets.length}</button>
  </section>
 </div>

 <section className={s.dashboardCard+' '+s.campaignHistory}><div className={s.dashboardTitle}><div><h2>Campanhas salvas</h2><p>Destinatários, situação do disparo e integração do canal.</p></div></div><div className={s.campaignList}>{campaigns.map(ca=>{const rec=campaignRecipients.filter(r=>r.campaign_id===ca.id);const sent=rec.filter(r=>['Enviado','Entregue','Lido'].includes(r.status)).length,errors=rec.filter(r=>r.status==='Erro').length,pendingCount=rec.filter(r=>r.status==='Pendente').length;return <article className={s.campaignCard} key={ca.id}><div><div><strong>{ca.name}</strong><span>{ca.channel} · {ca.audience} · {rec.length} destinatários</span></div><span className={s.badge}>{ca.status}</span></div><p>{ca.message}</p><div className={s.deliveryStats}><span><b>{pendingCount}</b>Pendentes</span><span><b>{sent}</b>Enviados</span><span><b>{errors}</b>Erros</span></div>{ca.channel==='WhatsApp'&&<button className={s.btn+' '+s.primary} disabled={busy||!rec.length||ca.status==='Enviada'} onClick={()=>void sendCampaign(ca)}><Plug size={15}/>{ca.status==='Enviada'?'Campanha enviada':'Enviar agora'}</button>}</article>})}{!campaigns.length&&<div className={s.empty}>Nenhuma campanha preparada.</div>}</div></section>
 </>
 else if(view==='Equipe e acessos')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>EQUIPE E ACESSOS</span><h1>Quem pode acessar o Vectta.</h1><p>Permissões aplicadas no banco por função. Usuários de leitura não conseguem alterar a operação.</p></div></header>
 <section className={s.teamRoleCallout}><ShieldCheck size={20}/><div><span>SEU PERFIL</span><strong>{roleLabel(currentRole)}</strong><small>{currentRole==='owner'?'Controle completo do workspace e das permissões.':currentRole==='admin'?'Gestão operacional com acesso administrativo, sem transferir a propriedade.':currentRole==='analyst'?'Pode criar e atualizar registros operacionais.':'Pode consultar a carteira sem alterar dados.'}</small></div></section>
 {currentRole==='owner'?<div className={s.teamGrid}>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Convidar pessoa</h2><p>O convite é vinculado ao e-mail. Ao entrar, a pessoa recebe somente o papel escolhido.</p></div></div><div className={s.teamInviteForm}><label>E-mail<input className={s.input} type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="pessoa@empresa.com"/></label><label>Permissão<select className={s.input} value={inviteRole} onChange={e=>setInviteRole(e.target.value as Exclude<WorkspaceRole,'owner'>)}><option value="admin">Administradora</option><option value="analyst">Analista</option><option value="viewer">Somente leitura</option></select></label><button className={s.btn+' '+s.primary} disabled={busy||!inviteEmail.trim()} onClick={()=>void inviteWorkspaceMember()}><KeyRound size={16}/>Convidar</button></div><div className={s.teamPermissionGuide}><div><b>Administradora</b><span>Opera a carteira e integrações.</span></div><div><b>Analista</b><span>Cria e atualiza projetos, tarefas e CS.</span></div><div><b>Somente leitura</b><span>Consulta os dados sem alterar registros.</span></div></div></section>
  <section className={s.dashboardCard}><div className={s.dashboardTitle}><div><h2>Integrantes</h2><p>{workspaceMembers.length} acesso(s) associado(s) ao workspace.</p></div></div><div className={s.teamList}>{workspaceMembers.map(member=><article className={s.teamMember} key={member.user_id}><div><strong>{member.email||'Conta Vectta'}</strong><span>{roleLabel(member.role)} · {member.status==='active'?'Ativo':'Desativado'}</span></div>{member.role==='owner'?<span className={s.badge+' '+s.ok}>Proprietária</span>:<div className={s.teamMemberActions}><select className={s.input} value={member.role} disabled={busy} onChange={e=>void updateWorkspaceMember(member,{role:e.target.value as WorkspaceRole})}><option value="admin">Administradora</option><option value="analyst">Analista</option><option value="viewer">Somente leitura</option></select><button className={s.btn+' '+s.ghost} disabled={busy} onClick={()=>void updateWorkspaceMember(member,{status:member.status==='active'?'disabled':'active'})}>{member.status==='active'?'Desativar':'Reativar'}</button></div>}</article>)}</div></section>
  <section className={s.dashboardCard+' '+s.dashboardWide}><div className={s.dashboardTitle}><div><h2>Convites</h2><p>Histórico dos acessos enviados pelo workspace.</p></div></div><div className={s.teamList}>{workspaceInvites.map(invite=><article className={s.teamMember} key={invite.id}><div><strong>{invite.email}</strong><span>{roleLabel(invite.role)} · {invite.status==='pending'?'Pendente':invite.status==='accepted'?'Aceito':invite.status==='revoked'?'Revogado':'Expirado'}</span></div>{invite.status==='pending'&&<button className={s.btn+' '+s.ghost} disabled={busy} onClick={()=>void revokeWorkspaceInvite(invite)}>Revogar</button>}</article>)}{!workspaceInvites.length&&<div className={s.empty}>Nenhum convite registrado.</div>}</div></section>
 </div>:<section className={s.dashboardCard}><div className={s.empty}>Somente a proprietária do workspace pode convidar pessoas ou alterar permissões.</div></section>}</>;
 else if(view==='Meu perfil')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>MEU PERFIL</span><h1>Seu espaço no Vectta.</h1><p>Foto, contato e formas seguras de recuperar o acesso.</p></div></header><div className={s.profileGrid}><section className={s.dashboardCard}><div className={s.profileHero}>{profileForm.avatar_url?<img src={profileForm.avatar_url} alt="Foto de perfil"/>:<div className={s.profileFallback}>{displayName[0]?.toUpperCase()}</div>}<div><h2>{displayName}</h2><p>{session?.user.email}</p></div></div><label className={s.uploadButton}><Settings2 size={16}/> Alterar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void uploadAvatar(file)}}/></label></section><section className={s.dashboardCard}><div className={s.form}><label>Nome<input className={s.input} value={profileForm.full_name} onChange={e=>setProfileForm({...profileForm,full_name:e.target.value})}/></label><label>Nome do espaço<input className={s.input} value={profileForm.workspace_name} onChange={e=>setProfileForm({...profileForm,workspace_name:e.target.value})}/></label><label className={s.full}>Celular para recuperação futura<Headphones size={14}/><input className={s.input} value={profileForm.phone} onChange={e=>setProfileForm({...profileForm,phone:e.target.value})} placeholder="+55 31 99999-9999"/></label></div><div className={s.securityCallout}><KeyRound size={18}/><div><strong>Você não precisa depender da senha.</strong><p>Na tela de entrada, use “Entrar sem senha” para receber um acesso de uso único no e-mail. O celular fica cadastrado para habilitarmos OTP por SMS quando o provedor de mensagens for conectado.</p></div></div><button className={s.btn+' '+s.primary} onClick={saveProfile}>Salvar perfil</button></section></div></>; else if(view==='Pendências')body=<PendingWorkspace tasks={tasks} projects={projects} demo={demo} owner={displayName} onSave={savePendingTask} onOpen={setSelected}/>; else if(view==='Cronograma')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>{view.toUpperCase()}</span><h1>Linha do tempo operacional.</h1><p>Bloqueio ou criticidade deve vir acompanhado de um plano de ação, não só de um alerta.</p></div></header><div className={s.stack}>{pending.map(t=>{const p=projects.find(x=>x.id===t.project_id);const plan=p?experiencePlan(p):null;return <article className={s.task+' '+(t.critical||t.blocked?s.taskWithPlan:'')} key={t.id}><button className={s.check} onClick={()=>toggleTask(t)}></button><div><strong>{t.title}</strong><span>{p?.client} · {t.owner} · {fmt(t.due_date)}</span>{(t.critical||t.blocked)&&plan&&<div className={s.taskStrategy}><b>{t.blocked?'Estratégia de desbloqueio':'Estratégia para item crítico'}</b><span>{t.blocked?'Defina um único responsável pela dependência, prazo de decisão e alternativa caso ela não seja resolvida.':plan.actions[0]}</span><small>{plan.sla} · {plan.cadence}</small></div>}</div><div>{t.critical&&<span className={s.badge+' '+s.bad}>Crítica</span>}{t.blocked&&<span className={s.badge+' '+s.warn}>Bloqueada</span>}</div></article>})}</div></>;
 else if(view==='Resultados'||view==='Rentabilidade'){const revenue=projects.reduce((a,p)=>a+Number(p.metadata?.revenue||0),0),cost=projects.reduce((a,p)=>a+Number(p.metadata?.actualHours||0)*Number(p.metadata?.hourCost||0),0);body=<><header className={s.pageHead}><div><span className={s.eyebrow}>RESULTADOS</span><h1>Resultado operacional.</h1><p>Valores calculados a partir da carteira atual.</p></div></header><section className={s.metrics}><div className={s.metric}><span>RECEITA CADASTRADA</span><b>R$ {revenue.toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>CUSTO ESTIMADO</span><b>R$ {cost.toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>RESULTADO OPERACIONAL</span><b>R$ {(revenue-cost).toLocaleString('pt-BR')}</b></div><div className={s.metric}><span>CLIENTES EM RISCO</span><b>{projects.filter(p=>risk(p).level!=='Baixo').length}</b></div></section></>}
 else if(view==='Riscos e estratégias')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>RISCOS E ESTRATÉGIAS</span><h1>Risco que gera ação.</h1><p>O Vectta identifica o sinal, explica o impacto e propõe uma estratégia para proteger experiência, prazo e retenção.</p></div></header><section className={s.riskLevelSummary}>{(['Todos','Baixo','Médio','Alto'] as const).map(level=><button key={level} className={s.riskLevelCard+(overviewRisk===level?' '+s.riskLevelActive:'')} onClick={()=>setOverviewRisk(level)}><span>{level==='Todos'?'Toda a carteira':'Risco '+level.toLowerCase()}</span><b>{level==='Todos'?projects.length:riskCounts[level]}</b><small>{level==='Baixo'?'operação dentro do esperado':level==='Médio'?'acompanhamento necessário':level==='Alto'?'ação prioritária':'clientes avaliados'}</small></button>)}</section><div className={s.stack}>{projects.filter(p=>overviewRisk==='Todos'||risk(p).level===overviewRisk).sort((a,b)=>riskRank[risk(b).level]-riskRank[risk(a).level]).map(p=>{const rr=risk(p),plan=experiencePlan(p);return <section className={s.panel} key={p.id}><div className={s.sectionHead}><div><h2>{p.client}</h2><span>{p.system} · {p.phase}</span></div><div className={s.riskBadges}><span className={s.badge+' '+badge(rr.level)}>Risco {rr.level}</span><span className={s.badge+' '+experienceBadge(plan.level)}>Experiência {plan.level}</span></div></div>{rr.causes.map(cause=><div className={s.riskRule} key={cause}><AlertTriangle size={18}/><div><b>{cause}</b><p>Impacto potencial na confiança do cliente, no próximo marco e na percepção de valor.</p></div></div>)}{!rr.causes.length&&<div className={s.riskRule}><Check size={18}/><div><b>Sem gatilho automático de risco no momento.</b><p>{rr.level==='Baixo'?'Acompanhe os próximos marcos normalmente.':p.metadata?.risk_reason||'Classificação manual para acompanhamento.'}</p></div></div>}{plan.level!=='Saudável'&&<div className={s.recoveryPlan}><span className={s.eyebrow}>ESTRATÉGIA RECOMENDADA</span><div className={s.playbookActions}>{plan.actions.map((a,i)=><div key={a}><b>{i+1}</b><span>{a}</span></div>)}</div><div className={s.playbookMeta}><span><b>Responsável</b>{plan.owner}</span><span><b>Resposta</b>{plan.sla}</span><span><b>Cadência</b>{plan.cadence}</span><span><b>Critério de recuperação</b>{plan.success}</span></div><p><b>Como comunicar:</b> {plan.communication}</p></div>}</section>})}</div></>;
 else if(view==='Segurança')body=<><header className={s.pageHead}><div><span className={s.eyebrow}>SEGURANÇA</span><h1>Proteja sua conta.</h1><p>Autenticação e dados são mantidos no Supabase com RLS.</p></div></header><section className={s.panel}><h2>Proteções ativas</h2><div className={s.stack}><div className={s.operation}><ShieldCheck size={18}/><div><strong>Carteira isolada por usuário</strong><span>RLS impede uma conta de ler os dados de outra.</span></div></div><div className={s.operation}><KeyRound size={18}/><div><strong>Recuperação de senha</strong><span>Use “Esqueci minha senha” na tela de login.</span></div></div></div></section></>;
 else body=<><header className={s.pageHead}><div><span className={s.eyebrow}>{view.toUpperCase()}</span><h1>{view}</h1><p>Registros operacionais com responsável, evidência e status.</p></div></header><section className={s.panel}><div className={s.empty}>Módulo preparado para os registros reais da implantação.</div></section></>;


 const chaiModuleByView:Partial<Record<string,ChaiModule>>={
  'Início':'inicio',
  'Visão geral':'inicio',
  'Implantações':'implantacoes',
  'Feedbacks':'feedbacks',
  'Riscos e estratégias':'riscos',
  'Testes':'testes',
  'Rentabilidade':'rentabilidade'
 };
 const contextualModule:ChaiModule|undefined=current?'implantacoes':chaiModuleByView[view];
 const showContextualChai=Boolean(contextualModule)&&view!=='Acompanhamento de CS';
 const pageBody=showContextualChai&&contextualModule
  ?<div className={s.contextPageGrid}><div className={s.contextPageBody}>{body}</div><ChaiAssistant module={contextualModule} demo={demo} token={session?.access_token||''} projects={projects.map(p=>({id:p.id,client:p.client}))} projectId={current?.id||''}/></div>
  :body;

 return <div className={s.shell}>
  <aside className={s.sidebar+(mobile?' '+s.open:'')}>
   <div className={s.brandRow}><img className={s.vt} src={VT} alt="VT"/><div className={s.brandName}>Vectta</div></div>
   <span className={s.workspace}>ESPAÇO DA ANALISTA</span>
   <nav className={s.nav}>{nav.map(([label,Icon])=><button key={label} className={view===label&&!selected?s.active:''} onClick={()=>changeView(label)}><Icon size={18}/><span>{label}</span>{label==='Pendências'&&<i>{pending.length}</i>}</button>)}</nav>
   <div className={s.sideBottom}><button className={s.profile} onClick={()=>changeView('Meu perfil')}>{profile?.avatar_url?<img className={s.avatarImg} src={profile.avatar_url} alt="Perfil"/>:<div className={s.avatar}>{displayName[0]?.toUpperCase()}</div>}<div><strong>{displayName}</strong><span>{demo?'Demonstração isolada':profile?.workspace_name||'Carteira pessoal'}</span></div></button></div>
  </aside>
  <div className={s.main}><header className={s.topbar}><div className={s.topbarStart}><button className={s.btn+' '+s.ghost} onClick={()=>setMobile(!mobile)}><Menu size={18}/></button>{(selected||view!=='Início')&&<button className={s.backBtn} onClick={goBack}>← Voltar</button>}<span>Vectta <i>/</i> {current?.client||view}</span></div><div className={s.secure}><ShieldCheck size={16}/>{demo?'demonstração · dados fictícios':'ambiente seguro'}<button className={s.btn+' '+s.ghost} onClick={logout}>{demo?<><KeyRound size={15}/> Entrar na minha conta</>:<><LogOut size={15}/> Sair</>}</button></div></header><main className={s.content}>{error&&<div className={s.error}>{error}</div>}{notice&&<div className={s.notice}>{notice}</div>}{pageBody}<footer className={s.footer}><span>Vectta · Portal de implementação</span></footer><div className={s.brandFooter}><img className={s.mainChaiSignature} src={CHAI} alt="chAI"/></div></main></div>
  {modal&&<div className={s.modalBack}><div className={s.modal}><div className={s.modalHead}><h2>Nova implantação</h2><button className={s.btn+' '+s.ghost} onClick={()=>setModal(false)}><X size={18}/></button></div><div className={s.form}><label>Cliente<input className={s.input} value={form.client} onChange={e=>setForm({...form,client:e.target.value})}/></label><label>Sistema<input className={s.input} value={form.system} onChange={e=>setForm({...form,system:e.target.value})}/></label><label>Segmento<input className={s.input} value={form.segment} onChange={e=>setForm({...form,segment:e.target.value})}/></label><label>CNPJ<input className={s.input} value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} placeholder="00.000.000/0000-00"/></label><label>Contato principal<input className={s.input} value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})}/></label><label>E-mail do contato<input className={s.input} type="email" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})}/></label><label>Celular do contato<input className={s.input} value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}/></label><label>Canal preferido<select className={s.input} value={form.preferred_channel} onChange={e=>setForm({...form,preferred_channel:e.target.value})}><option>WhatsApp</option><option>E-mail</option><option>SMS</option><option>Ligação</option></select></label><label className={s.checkLabel}><input type="checkbox" checked={form.message_opt_in} onChange={e=>setForm({...form,message_opt_in:e.target.checked})}/><span>Cliente autorizou comunicações e campanhas</span></label><label>Responsável<input className={s.input} value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/></label><label>Etapa<select className={s.input} value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})}>{phases.map(x=><option key={x}>{x}</option>)}</select></label><label>Prazo<input className={s.input} type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/></label><label className={s.full}>Escopo<textarea className={s.textarea} value={form.scope} onChange={e=>setForm({...form,scope:e.target.value})}/></label><label>Receita<input className={s.input} type="number" value={form.revenue} onChange={e=>setForm({...form,revenue:e.target.value})}/></label></div><div className={s.modalFoot}><button className={s.btn} onClick={()=>setModal(false)}>Cancelar</button><button className={s.btn+' '+s.primary} disabled={busy} onClick={createProject}>Criar implantação</button></div></div></div>}
 </div>;
}
