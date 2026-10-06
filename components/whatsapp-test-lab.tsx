'use client';

import {useEffect, useRef, useState} from 'react';
import {AlertTriangle, CheckCircle2, Plug, ShieldCheck, Trash2} from 'lucide-react';
import {validateTestMessage} from '../lib/whatsapp-test';
import s from '../app/vectta.module.css';

const emptyForm = {
  access_token: '', phone_number_id: '', graph_version: '', recipient_phone: '',
  message_type: 'template', text_body: '', recipient_confirmed: false, window_confirmed: false,
};
type Result = {message: string; id?: string; recipient?: string; uncertain?: boolean; error?: boolean};
type TestResponse = {ok?: boolean; message_id?: string; recipient?: string; message?: string; error?: string};

export default function WhatsAppTestLab() {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const personalized = form.message_type === 'text';

  function update(key: keyof typeof emptyForm, value: string | boolean) {
    setResult(null);
    setForm(current => ({...current, [key]: value,
      ...(['recipient_phone', 'phone_number_id'].includes(key) ? {recipient_confirmed: false, window_confirmed: false} : {}),
      ...(key === 'message_type' ? {window_confirmed: false} : {}),
    }));
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    try { validateTestMessage(form); }
    catch (error) { setResult({error: true, message: error instanceof Error ? error.message : 'Revise os campos.'}); return; }
    inFlight.current = true;
    setBusy(true); setResult(null);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 22000);
    try {
      const response = await fetch('/api/whatsapp-test', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form), signal: abort.signal,
      });
      const data = await response.json().catch(() => null) as TestResponse | null;
      if (!response.ok || !data?.ok || !data?.message_id) {
        setResult({error: true, uncertain: !data || data.error === 'unconfirmed_result', message: data?.message || 'Não foi possível confirmar o envio. Confira seu WhatsApp antes de tentar novamente.'});
        return;
      }
      setResult({message: 'Pedido aceito pela Meta. Confira seu WhatsApp.', id: data.message_id, recipient: data.recipient});
    } catch {
      setResult({error: true, uncertain: true, message: 'Não foi possível confirmar o resultado. Confira seu WhatsApp antes de tentar novamente para evitar duplicidade.'});
    } finally {
      window.clearTimeout(timeout); controller.current = null;
      inFlight.current = false; setBusy(false);
    }
  }

  return <section className={s.metaTestPanel} aria-labelledby="meta-lab-title">
    <div className={s.metaTestIntro}>
      <div><span className={s.eyebrow}>LABORATÓRIO DE WHATSAPP</span><h2 id="meta-lab-title">Sua primeira mensagem, do seu jeito.</h2><p>Use o número de teste da Meta para experimentar. O envio é real e vai para um único celular que você verificar.</p></div>
      <span className={s.badge}>1 destinatário por teste</span>
    </div>
    <ol className={s.labSteps}>
      <li><b>01</b><div><strong>Conecte o teste</strong><span>Copie os dados da Meta e verifique seu celular como destinatário.</span></div></li>
      <li><b>02</b><div><strong>Receba a mensagem padrão</strong><span>No primeiro teste, escolha o modelo de boas-vindas.</span></div></li>
      <li><b>03</b><div><strong>Responda e personalize</strong><span>Responda pelo seu WhatsApp. Depois, escreva seu próprio texto aqui.</span></div></li>
    </ol>
    <form onSubmit={send}>
      <fieldset disabled={busy} className={s.labFieldset}>
        <legend className={s.labLegend}>1. Dados do teste</legend>
        <div className={s.form}>
          <label>Identificador do número na Meta<input className={s.input} inputMode="numeric" value={form.phone_number_id} onChange={e => update('phone_number_id', e.target.value)} placeholder="Copie o identificador numérico" maxLength={32} required/></label>
          <label>Versão da integração<input className={s.input} value={form.graph_version} onChange={e => update('graph_version', e.target.value)} placeholder="Copie da Meta: vXX.X" maxLength={8} required/></label>
          <label className={s.full}>Token temporário, a chave de acesso<input className={s.input} type="password" autoComplete="off" spellCheck={false} value={form.access_token} onChange={e => update('access_token', e.target.value)} placeholder="Cole a chave temporária gerada pela Meta" maxLength={8192} required/><small>Fica na memória desta tela. Não é salvo no cadastro nem no navegador.</small></label>
          <label className={s.full}>Seu celular de teste<input className={s.input} type="tel" autoComplete="off" value={form.recipient_phone} onChange={e => update('recipient_phone', e.target.value)} placeholder="+55 31 99999-9999" maxLength={24} required/></label>
          <label className={s.checkLabel+' '+s.full}><input type="checkbox" checked={form.recipient_confirmed} onChange={e => update('recipient_confirmed', e.target.checked)} required/><span>Este é meu número de teste e já o verifiquei como destinatário no painel da Meta.</span></label>
        </div>
        <h3 className={s.labLegend}>2. Escolha o que enviar</h3>
        <div className={s.form}>
          <label className={s.full}>Tipo de mensagem<select className={s.input} value={form.message_type} onChange={e => update('message_type', e.target.value)}><option value="template">Mensagem padrão da Meta</option><option value="text">Texto personalizado</option></select></label>
          {personalized && <>
            <div className={s.labHint+' '+s.full}><strong>Primeiro, responda pelo seu celular.</strong><p>Envie uma resposta para o número de teste da Meta. Essa resposta permite o envio de texto personalizado por 24 horas. Marcar a caixa abaixo, sozinho, não abre esse prazo.</p></div>
            <label className={s.full}>Sua mensagem<textarea className={s.textarea} value={form.text_body} onChange={e => update('text_body', e.target.value)} placeholder="Olá! Estou testando uma mensagem personalizada pelo Vectta." maxLength={4096} required aria-describedby="meta-character-count"/><small id="meta-character-count">{form.text_body.length.toLocaleString('pt-BR')} / 4.096 caracteres</small></label>
            <label className={s.checkLabel+' '+s.full}><input type="checkbox" checked={form.window_confirmed} onChange={e => update('window_confirmed', e.target.checked)} required/><span>Enviei uma mensagem do meu celular para esse número de teste nas últimas 24 horas.</span></label>
          </>}
        </div>
        <div className={s.labPreview}><span className={s.eyebrow}>PRÉVIA DO CONTEÚDO</span><p>{personalized ? form.text_body.trim() || 'Seu texto aparecerá aqui enquanto você escreve.' : 'Mensagem de boas-vindas definida pela Meta. O modelo padrão não pode ser editado.'}</p><small>Destino: {form.recipient_phone || 'preencha seu celular acima'}</small></div>
        <div className={s.metaTestActions}>
          <div><ShieldCheck size={17}/><span>{personalized ? 'A Meta valida se a conversa está dentro do prazo de resposta.' : <>Modelo <b>hello_world</b>, pronunciado “rélou uôrld”: “olá, mundo”.</>}</span></div>
          <button className={s.btn+' '+s.primary} type="submit"><Plug size={16}/>{busy ? 'Enviando uma mensagem...' : personalized ? 'Enviar meu texto para o celular' : 'Enviar mensagem padrão'}</button>
        </div>
        <button className={s.btn+' '+s.ghost} type="button" onClick={() => {setForm(emptyForm); setResult(null);}}><Trash2 size={15}/>Limpar dados do teste</button>
      </fieldset>
    </form>
    {result && <div className={result.error ? s.labError : s.metaSuccess} role={result.error ? 'alert' : 'status'}>
      {result.error ? <AlertTriangle size={19}/> : <CheckCircle2 size={19}/>}
      <div><strong>{result.message}</strong>{result.id && <><p>Destino: {result.recipient}. A entrega e a leitura ainda não foram confirmadas.</p><small className={s.labMessageId}>Identificador: {result.id}</small></>}{result.uncertain && <p>O Vectta não repete esse envio automaticamente.</p>}</div>
    </div>}
  </section>;
}
