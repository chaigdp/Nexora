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
