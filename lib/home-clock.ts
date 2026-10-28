import {homeQuotes} from './home-quotes';

export const CLOCK_INTERVAL_MS = 30_000;
export const QUOTE_MINUTES = 10;
export const QUOTES_PER_DAY = 50;
// Sunday reuses Tuesday; Saturday reuses Monday. All getters use local device time.
const dayGroups = [1, 0, 1, 2, 3, 4, 0];
export function homeMoment(now: Date) {
  const minute = now.getHours() * 60 + now.getMinutes();
  const slot = ((Math.floor((minute - 480) / QUOTE_MINUTES) % QUOTES_PER_DAY) + QUOTES_PER_DAY) % QUOTES_PER_DAY;
  const group = dayGroups[now.getDay()];
  const index = group * QUOTES_PER_DAY + slot;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const prompts = hour < 12 ? ['Vamos começar?', 'O que vamos construir hoje?', 'Um passo de cada vez.'] : hour < 18 ? ['O que tem de novo?', 'Vamos ao próximo passo?', 'Vamos transformar ideias em ação?'] : ['Como foi o seu dia?', 'Vamos organizar as ideias?', 'Hora de reconhecer os avanços.'];
  const date = new Intl.DateTimeFormat('pt-BR', {weekday:'long', day:'numeric', month:'long'}).format(now);
  return {index, slot, group, quote:homeQuotes[index], greeting, prompt:prompts[slot % prompts.length], date};
}
export function quoteParts(text: string) {
  const words = text.split(' ');
  const count = Math.max(1, Math.ceil(words.length * .35));
  return {start:words.slice(0, -count).join(' '), end:words.slice(-count).join(' ')};
}
