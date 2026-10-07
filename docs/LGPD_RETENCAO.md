# Política técnica de LGPD e retenção do Vectta

> Documento técnico de operação. Deve ser validado juridicamente antes de uso externo em escala.

## Princípios

O Vectta adota minimização, finalidade, necessidade, controle de acesso e rastreabilidade. Dados reais só devem ser cadastrados quando necessários à implantação, Customer Success, suporte, comunicação autorizada ou obrigação operacional documentada.

## Categorias tratadas

- identificação empresarial e contato profissional;
- dados de implantação, tarefas, requisitos, testes, chamados e evidências;
- feedbacks, CSAT, NPS e CES;
- dados de comunicação e consentimento;
- registros de auditoria e integração;
- métricas de esforço, receita e custo operacional.

Não cadastrar dados sensíveis sem necessidade e base legal definida.

## IA

A chAI recebe contexto autorizado pelo servidor. E-mails e números encontrados em texto passam por filtragem básica antes do envio ao modelo. A IA não recebe ferramenta de escrita direta no banco, não envia mensagens por conta própria e não substitui revisão humana.

## Retenção técnica

O banco possui política automática conservadora para registros transitórios:

- eventos de auditoria: 730 dias;
- logs de entrega de campanha concluídos: 180 dias;
- jobs de integração cancelados: 90 dias.

Projetos, tarefas, feedbacks, evidências e demais registros de negócio NÃO são apagados automaticamente. A exclusão depende de encerramento contratual, solicitação válida do titular ou política corporativa aplicável.

A rotina automática executa diariamente pelo PostgreSQL.

## Direitos e solicitações

A tabela `privacy_requests` registra pedidos de acesso, correção, exclusão, portabilidade, revogação e informação. Cada pedido deve ser validado antes de qualquer exclusão.

## Consentimento

A tabela `consent_events` mantém trilha de concessão e revogação de consentimento, com finalidade, canal, origem, evidência e responsável pelo registro.

## Incidentes

Em suspeita de incidente:
1. preservar logs e evidências;
2. restringir o acesso afetado;
3. revogar chaves ou sessões comprometidas;
4. avaliar escopo e categorias de dados;
5. registrar linha do tempo;
6. seguir o processo jurídico e regulatório aplicável.

## Subprocessadores técnicos

A operação atual depende de serviços gerenciados como Supabase, Vercel e do provedor de modelo acessado pelo Vercel AI Gateway. Contratos, localização de dados, DPA e termos dos fornecedores devem ser revisados antes da entrada em produção corporativa.
