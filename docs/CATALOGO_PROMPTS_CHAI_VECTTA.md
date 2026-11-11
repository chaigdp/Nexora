# Catálogo de prompts e inteligência do Vectta

**Auditoria:** 11/11/2026  
**Repositório:** `chaigdp/vectta`  
**Branch examinada:** `main`  
**Objetivo:** inventariar instruções enviadas ao modelo, playbooks, orientações por módulo, respostas locais baseadas em regras e templates operacionais. Este catálogo aponta para a implementação existente; não substitui nem duplica o código-fonte.

## 1. Resumo executivo

A inteligência da chAI não está concentrada em um arquivo único. O prompt de sistema é montado em tempo de execução em `lib/chai-assistant.ts`, combinando dois playbooks, uma identidade/regras gerais e uma orientação específica do módulo ativo.

Há também mecanismos que **não são prompts de modelo**, mas produzem respostas ou recomendações por regras locais. Eles foram incluídos para que o inventário cubra a inteligência operacional do produto sem classificar incorretamente toda regra de negócio como prompt.

## 2. Prompts efetivamente enviados ao modelo

### P-001. Prompt de sistema composto da chAI
- **Arquivo:** `lib/chai-assistant.ts`
- **Trecho principal:** linha 321; montagem da chamada ao modelo nas linhas 325–330.
- **Tipo:** system prompt (instrução principal enviada ao modelo).
- **Composição:** `WORK_PLAYBOOK` + `STRATEGY_PLAYBOOK` + identidade e regras gerais da chAI + orientação do módulo ativo.
- **Regras centrais:** português; respostas curtas; separar observações, hipóteses e recomendações; usar apenas fatos fornecidos; identificar lacunas; não inventar contatos, sentimentos, histórico, prazos, valores ou resultados; não executar ações nem afirmar que salvou algo; tratar registros e mensagens como dados não confiáveis; comunicação apenas como rascunho; limite de até 350 palavras.
- **Contexto adicional:** dados operacionais e fontes privadas da base de conhecimento são enviados em mensagem de usuário, explicitamente rotulados como dados/referências, não como instruções.
- **Status:** ativo no fluxo de IA generativa.

### P-002. Playbook de trabalho
- **Arquivo:** `lib/workspace.ts`
- **Constante:** `WORK_PLAYBOOK` (linha 53).
- **Tipo:** playbook incorporado ao prompt de sistema.
- **Abrangência:** implantação de viagens e despesas corporativas; impacto, urgência, bloqueios e prazos; incidentes; passagem comercial; reuniões; evolução profissional; evidências; indicadores; fontes; privacidade; estrutura das recomendações.
- **Regras importantes:** não confundir consumo financeiro com adoção nem potencial com receita perdida; não prometer customização, desconto, prazo ou SLA; mostrar fato que sustenta a sugestão e o que falta saber; apresentar recomendação, fatos/fontes, lacunas e até três ações.

### P-003. Playbook de jornada e estratégia
- **Arquivo:** `lib/journey-store.ts`
- **Constante:** `STRATEGY_PLAYBOOK` (linha 157).
- **Tipo:** playbook incorporado ao prompt de sistema.
- **Abrangência:** passagem de bastão, itens obrigatórios, rituais semanais, saída da implementação, indicadores, sinais de risco, reversão, adoção e treinamento.
- **Regras importantes:** validar lacunas sem inventar informações; não tratar exportação como cancelamento confirmado; não definir tributos nem contingência fiscal; sugerir responsável a confirmar, prazo proposto e evidência; não afirmar execução de ações.

### P-004. Orientação do módulo Metas
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.metas`, linha 238.
- **Tipo:** instrução dinâmica por módulo, concatenada ao prompt de sistema.
- **Escopo:** metas empresariais, plano de desenvolvimento e contribuições; separar metas oficiais de propostas pessoais; explicar origem, período, progresso e lacunas; não garantir promoção; não misturar com fila operacional.

### P-005. Orientação do módulo Trabalho
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.trabalho`, linha 239.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** rotina da analista, passagens, incidentes, reuniões, conhecimento, evolução, prioridades e evidências; critérios de promoção e SLAs internos dependem de confirmação da liderança.

### P-006. Orientação do módulo Início
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.inicio`, linha 240.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** leitura executiva; ação do dia, motivo, impacto e próximo passo; evitar listagens excessivas.

### P-007. Orientação do módulo Implantações
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.implantacoes`, linha 241.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** onboarding/implantação; fase, prazo, tarefas, bloqueios, dependências e próximo marco com responsável e evidência.

### P-008. Orientação do módulo Customer Success
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.cs`, linha 242.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** saúde, percepção, adoção, atritos, planos ativos, reversão e expansão; score não é previsão.

### P-009. Orientação do módulo Feedbacks
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.feedbacks`, linha 243.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** voz do cliente; separar fatos, comentários, padrões, intensidade e hipóteses; rascunhos de resposta quando solicitados.

### P-010. Orientação do módulo Riscos
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.riscos`, linha 244.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** causa, evidência, impacto, contenção, responsável, prazo e critério de recuperação; não inventar causa raiz.

### P-011. Orientação do módulo Testes
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.testes`, linha 245.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** reprovações, evidências, cenários críticos e risco de liberação; distinguir estados dos testes.

### P-012. Orientação do módulo Rentabilidade
- **Arquivo:** `lib/chai-assistant.ts`
- **Local:** `moduleGuidance.rentabilidade`, linha 246.
- **Tipo:** instrução dinâmica por módulo.
- **Escopo:** receita cadastrada, horas, custo estimado, resultado operacional, risco e esforço; não inventar dados ausentes.

## 3. Configuração dos módulos e sugestões de conversa

- **Arquivo:** `lib/chai-modules.ts`
- **Estrutura:** `chaiModules` (linha 1) e `chaiModuleLabels` (linha 57).
- **Tipo:** configuração de UX conversacional, não system prompt.
- **Conteúdo:** rótulo, descrição, placeholder e sugestões iniciais para os módulos Metas, Trabalho, Início, Implantações, CS, Feedbacks, Riscos, Testes e Rentabilidade.
- **Uso:** `components/chai-assistant.tsx` exibe as sugestões e encaminha a pergunta escolhida para a rota da chAI.
- **Observação:** as sugestões são prompts de usuário pré-redigidos, não instruções de sistema.

## 4. Respostas locais e motores de recomendação (não são prompts de modelo)

Estes componentes produzem orientação por lógica determinística. Devem permanecer no inventário da inteligência do Vectta, mas não devem ser chamados de prompts enviados ao LLM.

| ID | Arquivo / símbolo | Função catalogada |
|---|---|---|
| R-001 | `lib/chai-assistant.ts` / `localStrategicAnswer` | Respostas locais por módulo e carteira: prioridades, situação do cliente, feedbacks, riscos, testes e rentabilidade. |
| R-002 | `lib/implantation-strategy.ts` / `recommendations` | Recomendações operacionais por sinais, saúde, pendências, datas, adoção e riscos. |
| R-003 | `lib/implantation-strategy.ts` / `advisorAnswer` | Respostas locais sobre passagem, bloqueios de saída, adoção, treinamento e recomendações. |
| R-004 | `lib/implantation-strategy.ts` / `MESSAGE_TEMPLATES`, `messageFor` | Modelos de mensagens operacionais preenchidos com dados do cliente. |
| R-005 | `lib/client-operating.ts` / `nextMoves`, `causeAdvice`, `messageFor`, `handoffText` | Próximas ações, orientação por causa, mensagens e passagem para CS com base no plano operacional. |
| R-006 | `lib/customer-success.ts` / `assessCS`, `portfolioCS`, `client360`, `ruleBasedCSReply` | Saúde do cliente, priorização de carteira, visão 360° e resposta local por regras. |
| R-007 | `lib/goals.ts` / `goalsEvidenceAnswer` | Leitura de metas e contribuições com evidências, progresso e lacunas. |
| R-008 | `lib/post-meeting.ts` / `proposeNotes`, `workEvidenceAnswer` | Extração de propostas de notas de reunião e priorização de registros de trabalho. |
| R-009 | `lib/pending-strategy.ts` / `diagnose`, `orderPending` | Diagnóstico e ordenação de pendências. |
| R-010 | `lib/operations.ts` / `assess`, `readiness` | Avaliação de riscos e prontidão operacional. |
| R-011 | `lib/problem-solutions.ts` / `searchTerms`, `solutionText` e busca de soluções | Busca e organização de soluções registradas. |
| R-012 | `lib/workspace.ts` / `prioritizeWork` | Priorização de registros da rotina de trabalho. |

## 5. Prompts de usuário e documentos de continuidade

### D-001. Retomada CS/chAI
- **Arquivo:** `prompts/2026-10-06-retomada-cs-chai.md`
- **Tipo:** documento de continuidade/contexto para retomada de trabalho.
- **Status:** documentação auxiliar; não é carregado automaticamente no system prompt atual.

### D-002. Manual orientado a resultados
- **Arquivo:** `docs/MANUAL_VECTTA_ORIENTADO_A_RESULTADOS.md`
- **Tipo:** manual operacional.
- **Status:** referência documental; não há evidência nesta implementação de injeção automática integral do arquivo no prompt de sistema.

### D-003. Jornada estratégica
- **Arquivo:** `docs/JORNADA_ESTRATEGICA_2026-10-09.md`
- **Tipo:** documentação de processo.
- **Status:** referência documental; o playbook ativo é a constante `STRATEGY_PLAYBOOK` no código.

### D-004. Sala de testes Vectta
- **Localização fora deste repositório:** `chaigdp/prompts-chai/prompts/vectta/testes/2026-10-09_sala-teste-500-clientes-7-atendentes_v1.0.md`
- **Tipo:** superprompt para implementação de laboratório de simulação.
- **Status:** não está dentro do repositório `chaigdp/vectta`; não é parte do prompt runtime da chAI.

## 6. Componentes relacionados, mas que não são prompts

- `components/chai-assistant.tsx`: interface de chat, boas-vindas, sugestões e envio de mensagens.
- `lib/knowledge.ts` e `lib/knowledge-client.ts`: ingestão, validação e persistência da base de conhecimento; não são prompts.
- `lib/post-meeting.ts`: contém extração local de notas e análise baseada em regras; não há evidência de chamada de LLM nesse módulo.
- `supabase/functions/vectta/index.ts`: função legada que contém uma aplicação HTML/JS embutida; não foi identificada como o caminho atual de execução da chAI generativa.
- `app/api/vectta/route.ts`: API operacional do Vectta; não é prompt da chAI.
- `app/api/chai/route.ts`: rota HTTP que encaminha a requisição para `handleChai`; não contém o prompt em si.

## 7. Fluxo de execução confirmado

1. A interface `components/chai-assistant.tsx` usa a configuração do módulo em `lib/chai-modules.ts`.
2. A rota `app/api/chai/route.ts` encaminha a requisição para `handleChai` em `lib/chai-assistant.ts`.
3. `handleChai` valida a requisição, consulta dados autorizados e monta o contexto.
4. O prompt de sistema combina `WORK_PLAYBOOK`, `STRATEGY_PLAYBOOK`, regras gerais e a orientação do módulo.
5. A chamada generativa utiliza o modelo gratuito configurado, após verificar disponibilidade e preço zero.
6. Se a geração não estiver disponível, o sistema pode responder por busca de conhecimento ou por mecanismos locais, conforme o módulo e os dados disponíveis.

## 8. Lacunas encontradas na documentação

1. Não existe um catálogo central anterior a este arquivo que relacione prompts, versões, finalidade e local de execução.
2. O prompt mestre está montado no código, não mantido como artefato independente versionado.
3. As nove orientações de módulo estão embutidas em um objeto dentro de `lib/chai-assistant.ts`.
4. As sugestões de conversa da interface não estão documentadas como prompts de usuário.
5. Os motores locais e templates de mensagem não estavam classificados junto da inteligência conversacional.
6. Não foi encontrado, nesta auditoria, um conjunto central de testes de regressão que valide sistematicamente cada instrução do prompt de sistema e cada módulo.
7. O superprompt do laboratório de simulação está em outro repositório e precisa ser referenciado, não copiado como se fosse prompt runtime.

## 9. Critério de manutenção

Ao alterar a inteligência da chAI:
- atualizar o código-fonte responsável;
- atualizar este catálogo na mesma alteração;
- registrar data, motivo e impacto da mudança;
- indicar se a alteração afeta o prompt generativo, uma resposta local, uma sugestão de usuário ou apenas a interface;
- adicionar ou atualizar cenários de teste para o comportamento alterado.

**Importante:** este catálogo é um índice auditável da implementação encontrada. Ele não declara que os textos foram extraídos e duplicados integralmente, nem transforma regras locais em prompts de LLM. O código-fonte continua sendo a fonte de verdade.


## 10. Biblioteca independente de prompts

A transcrição dos textos efetivamente usados e dos prompts auxiliares foi organizada em `prompts/library/`:

- `README.md`: índice, fluxo de composição e regras de manutenção.
- `01-system-prompt.md`: template do prompt de sistema composto e regras gerais.
- `02-playbooks.md`: textos integrais de `WORK_PLAYBOOK` e `STRATEGY_PLAYBOOK`.
- `03-module-guidance.md`: textos integrais das nove orientações dinâmicas.
- `04-conversation-starters.md`: sugestões de conversa apresentadas na interface.
- `05-external-lab-superprompt.md`: snapshot do superprompt do laboratório, originalmente mantido no repositório `chaigdp/prompts-chai`.
- `06-historical-continuity-prompt.md`: documento histórico de retomada de CS/chAI, preservado como referência e não usado no runtime.

**Atenção:** esta biblioteca é uma cópia documental. O runtime ainda lê as constantes TypeScript em `lib/`. A edição dos Markdown não altera o comportamento da chAI até que a arquitetura seja migrada para carregar esses arquivos ou os textos sejam sincronizados manualmente no código.
