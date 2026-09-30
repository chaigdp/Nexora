# Vectta 2.0: produto e operação

## Implementado nesta entrega

- Visual claro, marca Vectta principal e símbolo CP pequeno no rodapé. Logo oficial preservada como ativo.
- Banco D1 persistente por carteira; registros operacionais e fila de integração em tabelas próprias.
- Cadastro com contato, identificação empresarial, CRM e ID externo, objetivo de sucesso, receita, horas e custo por hora.
- Pendências com descrição, insumos, dependência, responsável, status, andamento e evidência.
- Riscos derivados de atraso do projeto, tarefas atrasadas/bloqueadas e testes reprovados; avaliação manual só entra com motivo registrado. Cada regra apresenta causa, ação sugerida e critério de resolução. A recomendação é uma regra, não uma decisão automática nem previsão estatística.
- Requisitos, testes, chamados, processos, parametrizações, riscos e prontidão: cadastro, edição, status, prioridade, responsável, prazo, andamento e evidência textual.
- Cronograma ordenado por datas de entregas, marcos críticos e dependências. Não é ainda um gráfico de Gantt nem uma ferramenta de nivelamento automático de capacidade.
- Entrada em operação e conclusão protegidas no servidor: entregas críticas resolvidas, requisitos aprovados, testes aprovados com evidência, aceite com plano de retorno e nenhum chamado crítico aberto. Reabrir critérios exige voltar a implantação para Testes.
- Importação CSV com mapeamento e prévia; até 50 projetos; validação e transação; CRM + ID externo não pode repetir. Revisão humana de prazo, escopo e segmento é necessária após importar.
- Exportação CSV de carteira, campos comerciais e origem CRM; proteção contra fórmulas em planilhas.
- Resultado operacional estimado = receita - horas realizadas × custo por hora. Não equivale ao lucro contábil.
- Histórico de alterações por carteira, endpoint de saúde, logs de falhas e validação contínua no GitHub.

## Arquitetura em uso

React + TypeScript para interface e serviço. Cloudflare Workers para execução e D1 para banco relacional. Consultas parametrizadas, validação Zod, verificação de origem, PBKDF2, sessões HttpOnly e comprovação de acesso em memória por abertura. A conta pessoal é dona de uma carteira; não há administração de equipe nem perfis de leitura/escrita compartilhados. IAM (gestão de identidade e acesso) atual significa isolamento individual, não uma implementação completa de IAM empresarial.

Leituras independentes usam Promise.all para E/S assíncrona (entrada e saída sem bloquear enquanto aguarda o banco). Alteração de implantação e registro de evento para CRM são gravados na mesma transação. A fila persistente ainda NÃO tem consumidor: nenhuma sincronização de CRM é executada. Importação inicial funciona sem credenciais externas.

## Infraestrutura e entrega

A hospedagem existente oferece HTTPS e endereço vectta.chaianegdp.chatgpt.site. Domínio próprio não foi comprado nem conectado. Scripts de compilação e manifesto de hospedagem foram preservados. As migrações SQL são versionadas e compatíveis com registros anteriores. CI (integração contínua) verifica tipos, testes e compilação em cada mudança. O arquivo de CI será executado pelo GitHub após o envio; isso não prova que uma execução remota passou. A publicação atual usa Sites; implantação automática após cada alteração futura ainda requer integração de entrega e credenciais protegidas. Não há provisionamento Terraform ou Kubernetes porque a aplicação usa infraestrutura gerenciada, e esses itens não seriam necessários só para aumentar a complexidade.

## Monitoramento e recuperação

GET /api/health consulta o banco sem expor clientes ou credenciais e retorna 200 ou 503. Logs não registram senhas. A configuração de compilação inclui observabilidade. Alertas externos, objetivos de disponibilidade e teste de restauração não estão configurados. D1 oferece mecanismos de recuperação pelo provedor, mas retenção, permissões e exercício de restauração da conta gerenciada precisam ser confirmados antes de afirmar que há cópia de segurança testada.

Referências técnicas consultadas em 30/09/2026:
- https://developers.cloudflare.com/d1/reference/time-travel/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.hubspot.com/docs/apps/developer-platform/build-apps/features/configure-webhooks

## Próximas entregas que dependem de conexão externa

1. HubSpot: autorização da conta, seleção de objetos, mapeamento, assinatura de notificações, identificador de evento, reenvio com espera progressiva, prevenção de repetição/eco e tratamento de conflitos. Sem sobrescrever mudanças concorrentes silenciosamente.
2. Axis: contrato de eventos autenticado para centralizar alterações do Vectta sem copiar credenciais pessoais.
3. Recuperação/verificação de e-mail, autenticação adicional e equipes com permissões auditáveis.
4. Anexos privados com controle de acesso; cópia de segurança exportável e teste documentado de restauração.
5. Domínio próprio: escolher nome disponível, comprar e configurar DNS na conta da proprietária.
6. Portal do cliente com aceite atribuído a identidade autenticada. Atualmente o aceite é registrado pela analista como evidência, não assinado digitalmente pelo cliente.

## Diferenciais propostos, ainda não implementados

- Tempo até o primeiro valor: medir quando o cliente obtém o primeiro resultado útil, separado da data de conclusão técnica.
- Capacidade e margem: cruzar esforço previsto, trabalho em andamento e rentabilidade para recusar prazos inviáveis e precificar serviços adicionais.
- Playbooks por segmento: roteiros reutilizáveis para varejo, indústria e serviços com evidências mínimas e critérios de sucesso.
- Retenção: revisões pós-operação, adoção, responsáveis ausentes e pendências recorrentes como sinais explicáveis, sem inventar risco de cancelamento.
- Expansão: converter necessidades fora do escopo em oportunidades propostas ao cliente e rastrear autorização e receita.
- Memória de implantação: reaproveitar soluções aprovadas e reduzir retrabalho sem compartilhar dados de uma carteira com outra.

## Limites de utilização

Manual ERP é um módulo de documentação e parametrização por cliente, não um manual oficial de qualquer fabricante. Regras fiscais precisam do especialista responsável. Demonstrações usam 30 empresas fictícias e mantêm as alterações isoladas. Recuperação de senha, remoção de dados antigos de demonstração e governança de equipe ainda precisam de trabalho. Não apresentar esta entrega como auditoria completa de segurança, integração CRM bidirecional ativa ou infraestrutura com recuperação comprovada.
