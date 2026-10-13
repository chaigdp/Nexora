'use client';
import {useState} from 'react';

const steps=[
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
export default function OnflyAdoptionDemo(){
 const [done,setDone]=useState<number[]>([]);
 const [objection,setObjection]=useState('');
 const responses:Record<string,string>={
  'Preço':'Entendo. Podemos comparar uma emissão com as mesmas condições e identificar o que pesa mais na decisão?',
  'Uso por fora':'O que o processo atual resolve melhor? Em que etapa ele exige mais trabalho manual?',
  'Sem tempo para treinar':'Qual formato de orientação caberia na sua rotina, sem gerar mais trabalho?',
  'Expectativa não atendida':'O que foi combinado, qual foi o impacto e qual seria um retorno útil para você?'
 };
 return <div style={{display:'grid',gap:18}}>
  <header><span style={{letterSpacing:2,fontSize:12,color:'#06b6d4'}}>LABORATÓRIO DE DEMONSTRAÇÃO · CENÁRIO FICTÍCIO</span><h1 style={{margin:'10px 0'}}>Dell + Onfly | Recuperação de adoção</h1><p>Cliente já implantado. Objetivo: investigar barreiras, contornar objeções e construir um plano de reengajamento. Dados para simulação de processo seletivo, sem acesso à conta real da Dell.</p></header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12}}>
   {[['900','Colaboradores no Brasil'],['150','Viajantes recorrentes'],['R$ 300 mil','Potencial mensal estimado'],['R$ 50 mil','Média mensal dos últimos 3 meses'],['16,7%','Consumo / potencial']].map(([v,l])=><div key={l} style={{background:'rgba(90,100,155,.13)',border:'1px solid rgba(140,160,210,.23)',borderRadius:14,padding:16}}><div style={{fontSize:23,fontWeight:700}}>{v}</div><div style={{fontSize:12,opacity:.8}}>{l}</div></div>)}
  </div>
  <p style={{fontSize:13,opacity:.85}}>A diferença de R$ 250 mil é entre consumo observado e potencial estimado, não uma perda financeira comprovada. Não há histórico suficiente para afirmar queda de consumo.</p>
  <section style={{background:'rgba(90,100,155,.1)',padding:18,borderRadius:16}}><h2>1. Diagnóstico consultivo</h2><p>Converse com Natália antes de apresentar uma solução. Escolha perguntas conforme suas respostas.</p><ol>{questions.map(q=><li key={q} style={{margin:'9px 0'}}>{q}</li>)}</ol></section>
  <section style={{background:'rgba(90,100,155,.1)',padding:18,borderRadius:16}}><h2>2. Tratamento de objeções</h2><label htmlFor="onfly-objection">Objeção mencionada pela cliente</label><select id="onfly-objection" value={objection} onChange={e=>setObjection(e.target.value)} style={{display:'block',width:'100%',maxWidth:420,padding:11,borderRadius:9,margin:'9px 0 12px',background:'#17223d',color:'#fff',border:'1px solid #65739b'}}><option value="">Selecione uma objeção para simular</option>{Object.keys(responses).map(x=><option key={x}>{x}</option>)}</select>{objection&&<p style={{borderLeft:'3px solid #06b6d4',paddingLeft:12}}>{responses[objection]}</p>}</section>
  <section style={{background:'rgba(90,100,155,.1)',padding:18,borderRadius:16}}><h2>3. Plano de recuperação de adoção</h2><p>Proposta a validar com a cliente. Marcar uma atividade aqui não altera dados reais nem persiste após sair da demonstração.</p><div style={{display:'grid',gap:10}}>{steps.map((step,i)=><label key={step.title} style={{display:'flex',gap:12,padding:14,border:'1px solid rgba(160,175,210,.2)',borderRadius:12}}><input type="checkbox" checked={done.includes(i)} onChange={e=>setDone(d=>e.target.checked?[...d,i]:d.filter(n=>n!==i))} style={{width:18,alignSelf:'start'}}/><span><strong>{step.title}</strong><span style={{display:'block',fontSize:13,opacity:.82,marginTop:5}}>{step.why}</span><span style={{display:'block',fontSize:12,marginTop:6}}>Responsável sugerido: {step.owner} | Prazo: {step.due} | Evidência: {step.metric}</span></span></label>)}</div><p style={{marginTop:12}}>Progresso simulado: {done.length} de {steps.length} ações</p><div role="progressbar" aria-valuenow={done.length} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Ações simuladas concluídas" style={{height:8,borderRadius:8,overflow:'hidden',background:'rgba(150,165,200,.25)'}}><div style={{height:'100%',width:(done.length/steps.length*100)+'%',background:'#06b6d4'}}/></div></section>
  <section style={{background:'rgba(90,100,155,.1)',padding:18,borderRadius:16}}><h2>4. Critérios de acompanhamento</h2><p>Acompanhar a proporção de reservas efetuadas pela Onfly, motivos de reservas fora da plataforma, participação dos viajantes no piloto, satisfação de Natália e resolução dos impedimentos identificados. Estabelecer metas somente após validar a linha de base e os responsáveis.</p><strong>Fechamento consultivo:</strong><p>“Natália, qual obstáculo devemos resolver primeiro, quem precisa participar e quando revisitaremos os resultados?”</p></section>
 </div>
}
