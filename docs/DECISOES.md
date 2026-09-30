# Decisões de produto e arquitetura

Aprovado em 30/09/2026: Nexora independente; primeira versão somente com área da analista; área do cliente em versão posterior; visitantes podem editar dados isolados.

## Hospedagem e linguagem

A referência inicial propunha serviço Python. A infraestrutura de publicação disponível para este projeto utiliza o starter React/Workers com serviço TypeScript. Esta versão usa essa estrutura para disponibilizar banco persistente e aplicação completa. Python permanece uma preferência para futuras integrações; nenhum serviço Python foi entregue nesta versão.

## Isolamento

O usuário demo não tem uma carteira compartilhada. Cada entrada recebe um identificador de carteira novo e uma sessão imprevisível. O banco guarda o resumo criptográfico do token; o token completo fica somente no cookie HttpOnly. Todas as consultas e alterações verificam a carteira autorizada da sessão. Identificadores enviados pelo visitante não concedem acesso a carteiras alheias.

Contas pessoais associam uma carteira persistente ao e-mail cadastrado. Uma conta cadastrada não é automaticamente uma conta de administração da hospedagem.

## Dados e indicadores

Dados relacionais no D1, com alterações de schema em migrações Drizzle. Exemplos são gerados no servidor para cada sessão. O histórico registra alterações de projetos e tarefas. As conclusões usam a data de conclusão, as pendências usam vencimento e estado aberto, e a duração usa início e conclusão. Progresso usa somente itens do tipo Entrega. Risco é informado manualmente, sem previsão artificial.

## Escopo futuro

A área do cliente requer novos papéis e autorização por projeto. A integração Orbytta depende de análise das interfaces existentes e contrato de integração. Ainda não há anexos, aprovação de escopo pelo cliente, modelo de horas, recuperação de senha ou limpeza agendada de demonstrações.
