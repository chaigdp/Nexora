# Biblioteca independente de prompts da chAI | Vectta

**Versão documental:** 1.0  
**Data da extração:** 11/11/2026  
**Repositório:** `chaigdp/vectta`  
**Branch:** `main`

Esta pasta preserva os textos de instrução e os prompts de conversa encontrados na implementação do Vectta. O objetivo é facilitar leitura, auditoria, revisão e futura extração para arquivos-fonte independentes.

## Índice

| Arquivo | Conteúdo | Origem |
|---|---|---|
| [01-system-prompt.md](./01-system-prompt.md) | Prompt de sistema composto enviado ao modelo | `lib/chai-assistant.ts` |
| [02-playbooks.md](./02-playbooks.md) | Playbook de trabalho e playbook de jornada/estratégia | `lib/workspace.ts`, `lib/journey-store.ts` |
| [03-module-guidance.md](./03-module-guidance.md) | Instruções dinâmicas dos nove módulos | `lib/chai-assistant.ts` |
| [04-conversation-starters.md](./04-conversation-starters.md) | Sugestões e prompts de usuário exibidos na interface | `lib/chai-modules.ts` |
| [05-external-lab-superprompt.md](./05-external-lab-superprompt.md) | Superprompt do laboratório de simulação, originado em outro repositório | `chaigdp/prompts-chai` |
| [06-historical-continuity-prompt.md](./06-historical-continuity-prompt.md) | Prompt histórico de retomada de CS/chAI | `prompts/2026-10-06-retomada-cs-chai.md` |

## Como o prompt ativo é montado

A execução atual combina, nesta ordem:

1. `WORK_PLAYBOOK`, transcrito em 02.
2. `STRATEGY_PLAYBOOK`, transcrito em 02.
3. Identidade e regras gerais, transcritas em 01.
4. Nome do módulo atual.
5. Orientação específica do módulo, transcrita em 03.

A composição é feita em tempo de execução por `handleChai`, em `lib/chai-assistant.ts`. O contexto dos registros e as referências recuperadas da base privada são enviados em uma mensagem separada de usuário. Eles são dados, não instruções de sistema.

## Classificação

- **Prompt de sistema:** instruções que governam o comportamento do modelo.
- **Playbook:** conjunto especializado de regras incorporado ao prompt de sistema.
- **Orientação de módulo:** instrução dinâmica que muda conforme a área selecionada.
- **Prompt de usuário:** sugestão pronta que a pessoa pode selecionar e enviar.
- **Superprompt auxiliar:** documento para orientar uma tarefa de desenvolvimento, não carregado automaticamente no chat da chAI.
- **Lógica local:** regras e funções TypeScript que produzem respostas sem chamar o modelo. Não são prompts e permanecem catalogadas em `docs/CATALOGO_PROMPTS_CHAI_VECTTA.md`.

## Integridade e limites

Esta biblioteca transcreve os textos encontrados nas fontes indicadas. Não substitui o código de execução: enquanto a aplicação importar constantes diretamente dos arquivos TypeScript, o código continua sendo a fonte efetiva do runtime.

A biblioteca não afirma que os documentos auxiliares são carregados automaticamente. O superprompt externo está identificado como material de outro repositório e foi copiado como snapshot documental para consulta, preservando sua origem.

## Manutenção obrigatória

Ao alterar uma instrução:

1. Atualize primeiro a fonte efetivamente usada pela aplicação.
2. Atualize o arquivo correspondente nesta biblioteca na mesma alteração.
3. Atualize o catálogo geral em `docs/CATALOGO_PROMPTS_CHAI_VECTTA.md`.
4. Registre data, motivo, impacto e módulos afetados.
5. Revise os testes comportamentais correspondentes.

**Importante:** editar apenas os arquivos Markdown desta pasta não altera o comportamento da chAI em produção.
