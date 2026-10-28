# Relatório da reestruturação

## Problema e resultado

A navegação distribuía a rotina entre cerca de vinte módulos e a visão financeira antiga não distinguia GMV de receita. O novo centro operacional organiza cadastro manual, sequência de implantação, comunicação, capacitação e captura de potencial com evidências.

## Mudanças

- Seis áreas principais: Início, Implantações, Crescimento, Treinamentos, Conhecimento e Resultados.
- Recursos existentes preservados em grupos secundários recolhidos; a jornada estratégica antiga deixa de disputar espaço com a rota principal.
- Ficha por cliente com seis abas, sete etapas, critérios de conclusão, prazos editáveis, bloqueios e histórico.
- Rascunhos de comunicação por etapa e diagnóstico de GMV, sem disparo automático.
- GMV mensal com potencial, meta, realizado, fonte, data, cobertura e fórmulas explícitas.
- Gestão de capacitações por perfil e ciclo, com avaliação de autonomia e reforço.
- Vínculos para Línio, HubSpot e plataforma separada, sem simular integração.
- Registro de contribuição e resumo para CS.
- chAI passa a considerar o novo plano.
- Persistência atômica do plano e fase, com sessão validada e controle de concorrência.

## Preservação

Nenhuma tabela, política de acesso, senha, carteira ou registro antigo foi removido. Não foi executada migração de dados. Valores financeiros antigos não foram reinterpretados como GMV. Não se criaram clientes fictícios na carteira real. Recursos de campanhas não foram acionados.

## Validação

Suíte existente: 66 testes automatizados aprovados. Nova suíte inicial: 13 testes aprovados sobre cálculos, origem, datas, autonomia, progressão, propriedade, persistência, concorrência e impedimentos operacionais. Teste de autenticação existente aprovado. TypeScript e build de produção verificados no código final; revisão visual em ambiente separado com dados fictícios, quando disponível.

A validação de persistência desta entrega usa respostas controladas que exercitam a sequência autenticação → leitura → validação → escrita → reabertura. Não equivale a um teste autenticado no banco de produção. A sessão de navegador disponível encontrou a tela de login, sem acesso à carteira pessoal.

## Pendências e limites

1. Validar com a Gabi os prazos, classificação de porte, critérios de ativação e responsabilidade após passagem para CS.
2. Informar o link do Línio e o destino da futura plataforma de aulas.
3. Confirmar regras oficiais de metas e comissão antes de simular remuneração.
4. Automatização com HubSpot e sincronização de treinamentos ficam para uma integração futura.
5. Pendências dos módulos antigos e ações da rota continuam registros distintos; não há deduplicação automática nem uma fila universal de todos os módulos.
6. Guias por regra e rascunhos cobrem as etapas previstas, sem interpretar qualquer situação real ou substituir políticas internas.

Manual: `docs/MANUAL_VECTTA_ORIENTADO_A_RESULTADOS.md`.
