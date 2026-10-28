# Soluções de problemas e ajuda proativa

## Arquitetura

Aba no Vectta, dentro de Seu centro de ação, com acesso direto `/?aba=solucoes`. O mesmo registro fica em `knowledge_sources`, no Acervo, com `problem_case` estruturado e texto canônico gerado pelo banco. Não há cópias para sincronizar. A aba permite investigação, resolução e validação; os casos aparecem também na busca do Acervo, onde o texto é somente leitura e a edição estruturada é direcionada ao Vectta.

Campos: problema/sintomas, contexto, causa confirmada opcional, tentativas, solução, resultado, evidência, limites/escalonamento, responsável e data de validação. Casos em análise podem ser salvos sem inventar uma solução. Para validar são obrigatórios solução, resultado, contexto, evidência, limites, responsável e data não futura. Arquivamento retira das sugestões. Atualizações usam comparação de `updated_at` para impedir sobrescrita concorrente.

## ChAI

Consulta explícita na aba usa `/api/chai`, com intenção `Consultar soluções:`. Após autenticação e limite de frequência, consulta somente casos aprovados, validados e não arquivados do proprietário. Retorna até três referências com contexto, procedimento, resultado, limites, evidência, data e ID. A consulta não chama modelos externos e não lê a carteira para essa intenção. É busca textual em português, não busca semântica nem diagnóstico automático.

Avisos proativos aparecem em Início, Implantações, Pendências, Acompanhamento de CS, Riscos e estratégias e ficha do cliente. Consideram ações salvas do plano operacional bloqueadas ou atrasadas, tarefas abertas bloqueadas, críticas ou atrasadas e clientes ativos com risco manual alto. A busca usa até oito sinais, encontra até cinco fontes recentes pelos termos e exibe até duas referências. Os alertas mostram até três sinais. Risco alto sem descrição suficiente não gera uma solução inventada. Os sinais são os dados carregados no Vectta; o carregamento existente atualiza a carteira a cada 30 segundos. A consulta de soluções é reavaliada ao mudar sinais, focar a janela e a cada 60 segundos enquanto visível.

Limites: não monitora serviços externos, conversas ou eventos não cadastrados; não roda com o navegador fechado, não envia notificações externas e não executa correções. A correspondência por palavras é explicitamente apresentada como referência a confirmar, não causa comprovada. Variações de GMV, avaliações de treinamento e ações sugeridas ainda não registradas não são analisadas por esse detector inicial. Não há cobrança de modelo de IA; tráfego e banco usam as cotas existentes.

## Segurança e testes

API valida a sessão Supabase antes de qualquer acesso, usa JWT do usuário e as mesmas políticas RLS. O trigger do banco gera texto e aprovação a partir do caso, impedindo promover rascunhos por simples alteração de `approved` no Acervo. Sem service-role, HTML executável ou chamadas a IA externa. Testes cobrem estados, dados obrigatórios, datas, autenticação, fontes validadas, isolamento do fluxo local e concorrência. Validar também a migração com transação revertida e os checks do build.
