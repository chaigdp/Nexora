# Vectta

Plataforma web para gestão de implementação, Customer Success e inteligência operacional.

## Produção e demonstração

Aplicação atual: https://vectta.vercel.app

A produção e a demonstração são separadas no banco.

- Produção começa sem clientes fictícios e persiste somente dados autenticados.
- A demonstração lê um snapshot somente leitura com 35 empresas fictícias.
- Registros marcados como dados de teste são bloqueados nas tabelas operacionais de produção.
- O backup lógico pré-go-live foi validado com restauração tipada em ambiente temporário.

## Stack atual

- Next.js 16
- React 19
- TypeScript 5
- PostgreSQL e Supabase Auth
- RLS no banco
- Vercel
- GitHub Actions
- Vercel AI Gateway para a chAI

## Acesso e permissões

O Vectta possui workspace com quatro papéis:

- Owner: propriedade do workspace e controle de acessos.
- Admin: administração operacional e integrações.
- Analyst: criação e atualização de registros operacionais.
- Viewer: consulta sem escrita.

A autorização é aplicada no PostgreSQL por RLS. Não depende apenas da interface.

## chAI

A rota `POST /api/chai` valida a sessão, consulta apenas dados autorizados por RLS, reduz o contexto enviado ao modelo e aplica filtragem básica de e-mails e telefones. A IA não recebe ferramentas de escrita direta no banco nem envia mensagens por conta própria.

O modelo é acessado pelo Vercel AI Gateway. Se o provedor estiver indisponível, análises estratégicas limitadas podem usar regras locais do Vectta.

## Segurança e operação

- RLS ativo nas tabelas operacionais.
- Demo pública restrita a snapshot fictício.
- Headers HTTP de segurança configurados.
- Recuperação de senha com fluxo dedicado de definição de nova senha.
- Endpoint `/api/health`.
- Monitoramento sintético por GitHub Actions.
- Retenção automática de logs transitórios.
- Registro de solicitações LGPD e eventos de consentimento.
- CI executa TypeScript, testes e build.

## Teste de carga de go-live

Em 07/10/2026 o fluxo automatizado executou 200 requisições com concorrência 20, sem erros. O teste é um baseline técnico e não substitui teste de capacidade com a carga real esperada.

## Pendências externas antes de produção comercial plena

- habilitar Leaked Password Protection no Supabase, disponível em plano pago compatível;
- adotar backup gerenciado/PITR e testar restauração do provedor;
- usar planos comerciais adequados de Vercel e Supabase;
- configurar SMTP transacional próprio;
- validar a política LGPD juridicamente;
- realizar revisão periódica de segurança e recuperação de desastre.

Consulte `docs/GO_LIVE_2026-10-07.md` e `docs/LGPD_RETENCAO.md`.


### Metas e assistente pós-reunião (21/10/2026)

- **Metas** é uma área própria no menu, separada da operação dos clientes. Reúne metas da empresa/pessoais, o plano de evolução e contribuições. Os registros de evolução existentes continuam disponíveis em Contribuições.
- **Importar metas da empresa** aceita CSV UTF-8 (modelo disponível na tela) e TXT, com até 50 metas e 100 KB. Cada linha vira um rascunho revisável, salvo individualmente. Não armazena o arquivo original. PDF/imagens precisam ter seu texto copiado para TXT; Excel deve ser exportado como CSV.
- Metas numéricas mostram `(atual − inicial) / (meta − inicial) × 100`, inclusive para metas de redução. Valores ausentes ou inicial igual ao alvo deixam o progresso indefinido. Valor atual exige fonte e data da medição. Metas qualitativas usam critério, resultado e evidência.
- **Início → Organizar pós-reunião** classifica anotações por regras locais. Prefixos `Ação:`, `Bloqueio:`, `Decisão:`, `Dúvida:` e `Resultado:` ajudam na classificação. A pessoa pode corrigir categoria, texto, responsável, prazo e situação, mantendo o trecho literal de origem. Não há chamada a modelo na extração.
- **Revisar o que será salvo → Confirmar e salvar** é obrigatório. As propostas selecionadas são gravadas juntas no registro da reunião e alimentam Meu dia. Concluir uma ação exige evidência. Propostas desmarcadas deixam o acompanhamento após confirmação. Não cria tarefas duplicadas no módulo Pendências.
- **Indicadores com origem** expõem fórmula, recorte e registros usados. A fila reúne combinados revisados e pendências existentes, com até três prioridades; metas pessoais ficam fora. Compromissos cadastrados nas duas áreas não são deduplicados automaticamente.
- **Passagem para CS** prepara um rascunho por cliente, com contexto, resultados relatados, decisões, pendências, lacunas e IDs/revisões das fontes. É um retrato dos dados no momento da preparação. Copiar não envia; concluir exige responsável e aceite de CS. A Jornada e passagem existente mantém seus próprios critérios operacionais.
- **Contribuições** registra problema, ação, resultado, evidência e participação do time. A chAI possui contexto próprio em Metas e apresenta fatos, fontes e lacunas também na análise por regras. Continua restrita ao modelo comprovadamente gratuito, sem alternativa paga.

Persistência usa `work_items.data`, já protegido por RLS por usuário e revisão otimista. Não há nova tabela, migração ou alteração de permissões. `growth + data.goalType=goal` identifica metas; `handoff + data.handoffType=cs` identifica resumos para CS. Notas/revisões passam por limites de tamanho e validação de trechos no servidor.

Validação: `tests/post-meeting.mjs` cobre origem literal, ações sem dados inventados, indicadores, passagem, isolamento de metas/clientes, persistência e conflito. `tests/goals.mjs` cobre CSV/TXT, fórmulas, dados ausentes e atribuição ao time. Essas suítes fazem parte do CI junto aos testes existentes.
