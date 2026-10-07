# Segurança do Vectta

## Modelo atual

O Vectta usa Supabase Auth para autenticação e PostgreSQL Row Level Security (RLS) para autorização. Dados operacionais pertencem a um workspace, e o papel do usuário define leitura e escrita.

Papéis:

- `owner`: controle total do workspace;
- `admin`: gestão operacional e integrações;
- `analyst`: criação e atualização operacional;
- `viewer`: somente leitura.

## Credenciais

Nunca versionar senhas, service role keys, tokens, arquivos `.env`, backups reais ou dados de clientes. A chave publishable do Supabase pode existir no cliente por desenho do produto, mas não concede acesso fora das políticas RLS. Chaves privilegiadas devem permanecer exclusivamente no servidor/serviço de origem.

Se uma credencial privilegiada for exposta, rotacione-a no provedor. Apagar o commit não revoga a credencial.

## Sessão e recuperação

A autenticação é feita pelo Supabase. O fluxo de recuperação envia um link de uso único e, quando aberto como recuperação, o Vectta solicita uma nova senha forte em tela dedicada. O token de recuperação não é persistido como uma sessão comum no armazenamento local.

Para produção comercial, recomenda-se SMTP próprio, MFA quando aplicável e proteção contra senhas vazadas.

## Banco

As tabelas operacionais usam RLS. A demo não compartilha as tabelas de produção: lê um snapshot fictício somente leitura.

Funções privilegiadas usadas apenas por triggers não possuem permissão direta de execução para usuários finais.

## IA

A chAI valida a sessão no servidor e consulta o contexto com o token do próprio usuário, preservando RLS. Campos de texto passam por filtragem básica de e-mail e telefone antes do envio ao modelo. Essa filtragem reduz exposição, mas não substitui classificação completa de dados pessoais.

A IA não possui ferramenta de escrita autônoma no banco.

## Web

O Next.js aplica CSP, HSTS, bloqueio de iframe, `nosniff`, política de permissões e referrer policy. Dependências externas de protótipo devem ser evitadas em produção.

## Backup e retenção

Existe snapshot lógico pré-go-live e o procedimento de desserialização/restauração foi validado. O mecanismo não substitui backup gerenciado, PITR ou um exercício real de disaster recovery do provedor.

Logs transitórios têm retenção automatizada. Registros de negócio não são apagados automaticamente.

## Pendências conhecidas

O Supabase Security Advisor ainda sinaliza proteção contra senhas vazadas desativada. Esse recurso depende de plano compatível. Antes de dados reais em produção comercial, habilitar o recurso e repetir a auditoria.

Relatar vulnerabilidades por canal privado. Não publicar segredos ou detalhes exploráveis em issues públicas.
