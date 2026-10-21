'use client';
import {useState} from 'react';
import {missingFor,proposalKinds,proposeNotes,readReview,type Proposal} from '../lib/post-meeting';
import type {WorkItem} from '../lib/workspace';
import s from './workspace.module.css';

export default function MeetingReviewEditor({item,onChange}:{item:WorkItem;onChange:(data:Record<string,string>)=>void}){
 const initial=readReview(item)?.entries||[];
 const [entries,setEntries]=useState<Proposal[]>(initial);
 const [selected,setSelected]=useState<Set<string>>(new Set(initial.map(p=>p.id)));
 const [notice,setNotice]=useState('');
 function write(next:Proposal[],ids:Set<string>){
  setEntries(next);setSelected(ids);
  onChange({...item.data,review:ids.size?JSON.stringify({version:1,reviewedAt:new Date().toISOString(),entries:next.filter(p=>ids.has(p.id))}):''});
 }
 function generate(){
  const notes=item.data.notes||'';
  if(!notes.trim()){setNotice('Escreva suas anotações primeiro.');return;}
  const lines=notes.split(/\n+/).filter(line=>line.trim());
  if(lines.length>24||lines.some(line=>line.trim().length>1000)){setNotice('Divida a reunião em até 24 trechos, com até 1.000 caracteres em cada linha. Nenhum trecho foi descartado.');return;}
  const next=proposeNotes(notes);write(next,new Set(next.map(p=>p.id)));setNotice('Propostas geradas por regras locais. Confira a classificação e o conteúdo. Nada foi salvo ainda.');
 }
 function change(id:string,patch:Partial<Proposal>){write(entries.map(p=>p.id===id?{...p,...patch}:p),selected);}
 return <section className={s.review} aria-label="Assistente pós-reunião">
  <span className={s.eyebrow}>ASSISTENTE PÓS-REUNIÃO</span><h3>Das anotações aos combinados</h3>
  <p className={s.muted}>Organização por regras locais, sem envio das notas a um modelo. Revise as propostas antes de salvar. Um resultado relatado ainda precisa de comprovação.</p>
  <label>Anotações da reunião<textarea rows={8} maxLength={4000} value={item.data.notes||''} placeholder={'Uma informação por linha. Exemplo de formato:\nDecisão: validar a política de viagens com o cliente.\nAção: revisar o fluxo de aprovação | Responsável: nome | Prazo: AAAA-MM-DD\nBloqueio: integração aguardando acesso.\nDúvida: quem confirma o primeiro uso?'} onChange={e=>{onChange({...item.data,notes:e.target.value,review:''});setEntries([]);setSelected(new Set());setNotice('Anotações alteradas. Gere novas propostas para revisar.');}}/></label>
  <small>{(item.data.notes||'').length}/4.000 caracteres · até 24 linhas. Datas relativas precisam ser confirmadas.</small>
  <div className={s.actions}><button type="button" onClick={generate}>Gerar propostas para revisão</button></div>
  {notice&&<p className={s.notice} role="status">{notice}</p>}
  {!!entries.length&&<><p><strong>{selected.size} de {entries.length} propostas selecionadas.</strong> Edite ou desmarque o que não deve ser salvo.</p><div className={s.list}>
   {entries.map((p,index)=><article className={s.card} key={p.id}>
    <label className={s.check}><input type="checkbox" checked={selected.has(p.id)} onChange={e=>{const ids=new Set(selected);if(e.target.checked)ids.add(p.id);else ids.delete(p.id);write(entries,ids);}}/>Incluir proposta {index+1}</label>
    <div className={s.form}>
     <label className={s.full}>Tipo da proposta {index+1}<select value={p.kind} onChange={e=>change(p.id,{kind:e.target.value as Proposal['kind'],status:e.target.value==='blocker'?'blocked':'open',completion:''})}>{Object.entries(proposalKinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
     <label className={s.full}>Conteúdo proposto {index+1}<textarea maxLength={1000} value={p.text} onChange={e=>change(p.id,{text:e.target.value})}/></label>
     {['action','blocker'].includes(p.kind)&&<><label>Responsável {index+1}<input maxLength={180} placeholder="A definir" value={p.owner} onChange={e=>change(p.id,{owner:e.target.value})}/></label><label>Prazo {index+1}<input type="date" value={p.due||''} onChange={e=>change(p.id,{due:e.target.value||null})}/></label><label className={s.full}>Situação {index+1}<select value={p.status} onChange={e=>change(p.id,{status:e.target.value as Proposal['status']})}><option value="open">Aberta</option><option value="blocked">Bloqueada</option><option value="done">Concluída</option></select></label>{p.status==='done'&&<label className={s.full}>Evidência de conclusão {index+1}<textarea maxLength={1000} value={p.completion} placeholder="Resultado, referência e data da confirmação" onChange={e=>change(p.id,{completion:e.target.value})}/></label>}</>}
    </div>
    <div className={s.evidence}><strong>Qual fato sustenta essa sugestão?</strong><blockquote>{p.quote}</blockquote><small>Fonte: suas anotações, trecho {p.id}. Alterações no conteúdo, responsável e prazo são informações revisadas por você.</small><p><strong>O que ainda falta saber?</strong><br/>{missingFor(p).join('. ')||'Confirmar se o registro representa corretamente a conversa.'}</p></div>
   </article>)}
  </div><p className={s.notice}>Ao confirmar o salvamento, ações e bloqueios selecionados passam a integrar Meu dia e o resumo para CS. Desmarcar uma proposta já salva retira esse combinado do acompanhamento. As pendências do módulo operacional continuam independentes.</p></>}
 </section>;
}
