# Nexora

Plataforma de acompanhamento de implantações de sistemas, criada para a área da analista de implementação de Chaiane de Paula.

## Acesso de demonstração

- Usuário: demo@nexora.app
- Senha: NexoraDemo2026!
- Cada entrada cria uma carteira isolada com 30 empresas inventadas e 210 entregas.
- E-mail e senha são solicitados em toda abertura ou recarga. Não existe entrada automática por cookie. A autorização fica somente na memória da abertura atual e expira em até 8 horas. Um novo acesso à demonstração cria outra carteira; os dados pessoais permanecem associados à conta.
- Para sua carteira pessoal, use Criar minha conta pessoal. O cadastro começa vazio e permite retornar usando e-mail e senha.

## Tela inicial

Depois de entrar com e-mail e senha, o Nexora abre a tela Início. Os módulos são organizados em cartões: Implantações e Pendências na operação; Visão geral, Resultados e Guia de uso no acompanhamento. O botão Início permite retornar a essa seleção.

## Funcionalidades implementadas

Carteira de implantações, cadastro e edição de clientes, etapas, escopo, datas, responsável e risco informado. Entregas e pendências com prioridade, bloqueio, dependência, responsável, prazo e indicação de criticidade. Histórico de alterações. Indicadores de carteira atual, conclusões por período e duração média. Exportação CSV e guia de uso.

A conclusão de uma implantação exige data válida e nenhuma entrega crítica pendente. Concluir uma tarefa bloqueada ou dependente de uma tarefa aberta é recusado pelo servidor.

## Arquitetura

Interface React em português; serviço TypeScript em Cloudflare Workers; banco relacional Cloudflare D1. Senhas pessoais derivadas por PBKDF2, sessões opacas em cookies HttpOnly, verificação de origem, consultas parametrizadas e isolamento de todas as consultas e alterações por carteira. O banco não é o armazenamento do navegador.

A proposta inicial priorizava Python. A hospedagem disponível utiliza o ambiente Workers do starter; a primeira versão foi implementada em TypeScript para entregar aplicação hospedada e banco persistente. Integrações futuras podem usar Python, sem exigir que a interface seja reescrita.

## Executar

Requer Node.js 22 ou superior. O pnpm-lock.yaml é o arquivo de versões reproduzíveis.

1. Instalar dependências: `pnpm install --frozen-lockfile`.
2. Gerar aplicação: `pnpm build`.
3. Aplicar cada arquivo SQL de drizzle/ em ordem no banco local, usando `pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --file drizzle/0000_calm_preak.sql --persist-to .wrangler/state`, seguido da migração 0001.
4. Iniciar aplicação local: `pnpm start`.
5. Testar: `NEXORA_TEST_URL=http://localhost:8787 python3 tests/api-smoke.py`. Ajuste o endereço para o mostrado no terminal.

Para uma hospedagem própria, provisione um banco D1 e configure seu identificador real no arquivo Wrangler gerado. O identificador de banco do starter é somente um marcador para desenvolvimento local. A publicação gerenciada provisiona o banco a partir do vínculo lógico DB do manifesto.

Não colocar dados pessoais, chaves de serviço ou senhas privadas no repositório. A senha de demonstração é intencionalmente pública e não concede acesso a carteiras pessoais.

## Validação

Verificação de tipos, compilação e testes locais de login válido/inválido, cadastro, persistência após novo acesso pessoal, logout, gravação, isolamento entre visitantes, bloqueio de conclusão, histórico e origem externa. Veja docs/VALIDACAO.md. O teste adicional de acesso obrigatório é executado com `node tests/auth-session.mjs`.

## Próximas versões e limites

Acompanhamento do cliente, integração Orbytta, recuperação e verificação de e-mail, permissões por equipe, anexos, exclusão/arquivamento, capacidade de horas, custos, aprovações formais e automação de risco não fazem parte desta entrega. Domínio próprio não foi comprado. As carteiras de demonstração expiram para acesso após 7 dias, mas ainda não têm rotina de exclusão física. Antes de usar dados reais sensíveis, validar recuperação de acesso, proteção de dados e cópias de segurança com restauração.

Consulte docs/DECISOES.md e docs/ROTEIRO_DEMONSTRACAO.md.
