# Cabeçalho motivacional do Vectta

Solicitado por Chai em 27/10/2026. Visível exclusivamente em **Início**, fora da ficha de cliente. A imagem escolhida mostra os mascotes Onfly e chAI comemorando como amigos e parceiros. O PNG foi copiado integralmente, sem redesenho. Logo SVG original da Onfly, obtida anteriormente em https://www.onfly.com.br/wp-content/uploads/2025/02/logo-onfly-azul.svg, preservada sem alterar suas letras.

## Conteúdo e apresentação

As 250 frases e atribuições vêm do arquivo fornecido pela usuária, reproduzido em [FRASES_SEMANAIS.md](FRASES_SEMANAIS.md). Não foram inventadas frases ou autores nem realizada auditoria das atribuições históricas. A ordem temática fornecida é preservada. Cada bloco de 50 corresponde a um dia útil. Fonte dos dados em `lib/home-quotes.ts`.

Cabeçalho azul-marinho, mascotes à esquerda, marca em cápsula branca, saudação e nome à direita, data em português e frase abaixo. Nome Chai e trecho final (35% das palavras, arredondado para cima) usam degradê ciano, lilás e magenta. Abaixo da frase aparece somente o autor; a chamada breve fica em um parágrafo separado. A interface se adapta a celular. A animação respeita a preferência de movimento reduzido.

## Regra do relógio

Minutos locais desde meia-noite: `hora * 60 + minuto`. Índice diário: `((floor((minutos - 480) / 10) % 50) + 50) % 50`. Sem sorteio, armazenamento, API, contador acumulativo ou fuso fixo.

- 08h00: primeira frase; 16h10 até 16h19: última; 16h20: primeira novamente.
- 07h50: última frase do próprio dia. À meia-noite passa a usar a lista do novo dia.
- Sábado usa segunda; domingo usa terça; toda semana repete a sequência.
- Verificação imediata ao montar o cabeçalho e a cada 30 segundos. Também ao retornar à aba ou focar a janela. Em aba ativa, a mudança pode ocorrer até 30 segundos depois da fronteira de dez minutos. Abas suspensas são corrigidas ao retornar.
- Aparelhos com a mesma data e hora locais exibem a mesma frase. Relógios ou fusos locais diferentes podem exibir frases distintas.
- Bom dia: 00h00–11h59; boa tarde: 12h00–17h59; boa noite: 18h00–23h59. Chamadas curtas alternam deterministicamente pelo índice do horário.
- Ao sair de Início, intervalo e eventos são removidos. Nenhuma notificação é enviada.

## Manutenção e verificação

`lib/home-clock.ts`: cálculo puro e saudações. `components/home-welcome.tsx`: relógio, conteúdo e ciclo de vida. `components/home-welcome.module.css`: apresentação. `public/onfly-chai-high-five.png`: arquivo selecionado, sem alterações. Os testes `tests/home-clock.mjs` verificam 250 textos únicos, a semana completa, limites de dez minutos, módulo negativo, fim de semana, saudações e preservação do texto no degradê. Integrados ao fluxo de validação do GitHub.

Não há mudanças na autenticação, dados de clientes, permissões, banco, metas ou regras de implantação.
