# Vectta 2.0

Plataforma de gestão de implementação de sistemas da CelPhius Tecnologia. Carteira da analista com clientes, entregas, riscos fundamentados, cronograma, requisitos, testes, chamados, processos, parametrizações, prontidão e rentabilidade.

## Acessar

https://vectta.chaianegdp.chatgpt.site

Demonstração: `demo@vectta.app` / `VecttaDemo2026!`. Cada entrada cria 30 empresas fictícias e 210 entregas em uma carteira isolada. Para manter seus projetos, crie sua conta pessoal: ela começa vazia e salva os dados no banco. Login é exigido a cada abertura ou recarga; a comprovação de acesso fica na memória da página. A sessão tem limite de 8 horas.

## Negócio

Clientes incluem contato, identificação empresarial, vínculo CRM, objetivo mensurável, receita e esforço. Pendências incluem insumos, dependência, responsável, status, andamento e evidência. Entrada em operação exige critérios verificados pelo servidor. Os registros operacionais começam vazios, inclusive na demonstração, para que evidências e aceites não sejam inventados.

Importação CSV permite mapear colunas e conferir até 50 projetos antes de gravar. CRM + identificador externo não pode repetir. Exportação inclui campos comerciais. A fila de integração registra mudanças de implantação, mas nenhum conector HubSpot está ativo.

## Arquitetura

React, TypeScript, Cloudflare Workers e banco D1. Validação de entrada, consultas parametrizadas, isolamento por carteira, verificação de origem, senhas derivadas por PBKDF2 e sessões HttpOnly. A rota `/api/vectta` é canônica; `/api/nexora` e identificadores internos antigos permanecem apenas para compatibilidade de sessões e integrações existentes.

## Executar e validar

Requer Node.js 24 e pnpm 11.25.0.

1. `pnpm install --frozen-lockfile`
2. `pnpm exec tsc --noEmit`
3. `node tests/auth-session.mjs`
4. `pnpm build`
5. Aplicar os três arquivos SQL de `drizzle/`, em ordem, no banco local: `pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --file drizzle/0000_calm_preak.sql --persist-to .wrangler/state`; repetir para `0001_sharp_stick.sql` e `0002_operations.sql`.
6. `pnpm start`

A hospedagem gerenciada mantém o banco pelo vínculo DB em `.openai/hosting.json`. O identificador do banco na configuração local é um marcador de desenvolvimento. Não usá-lo como identificador real em hospedagem própria.

## Entrega e saúde

A integração contínua em `.github/workflows/ci.yml` verifica tipos, testes de serviço e compilação. A publicação atual usa Sites. `/api/health` verifica conectividade do banco e retorna 200 ou 503 sem expor dados de clientes.

## Limites explícitos

Ainda pendentes: domínio próprio, recuperação/verificação de e-mail, permissões por equipe, anexos privados, limpeza automática de demonstrações, restauração de cópia de segurança testada, alertas externos e sincronização CRM bidirecional. Manual ERP registra procedimentos do projeto; não substitui documentação oficial ou validação fiscal. O aceite é registrado pela analista, não assinado digitalmente pelo cliente.

[Escopo e próximos diferenciais](docs/VECTTA_2_PRODUTO.md). A senha demo é intencionalmente pública; não permite acessar carteiras pessoais. Não enviar segredos ou dados reais ao repositório.
