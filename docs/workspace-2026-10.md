# Vectta para a rotina de implantação

Preparado em 18/10/2026. Início informado: 26/10/2026. Horizonte de evolução: 26/04/2027.

## Decisões de produto

O Vectta passa a abrir no espaço de trabalho pessoal. A carteira operacional continua nos módulos existentes. A nova área conecta o contexto que costuma se perder entre comercial, implantação e atendimento: expectativa, decisão, responsável, próximo passo e evidência.

| Área | Uso concreto |
| --- | --- |
| Meu dia | Escolher prioridades pelo impacto informado, prazo e dependência; revisar pendências da carteira. |
| Passagem comercial | Distinguir contrato e promessa, confirmar escopo, decisores, dependências e primeiro valor. |
| Incidentes | Registrar impacto, contenção, responsável, escalonamento, retorno e prevenção de recorrência. |
| Reuniões e combinados | Separar fatos, decisões, dúvidas e compromissos. |
| Evolução profissional | Documentar situação inicial, contribuição, resultado, evidência e feedback. |
| Base de conhecimento | Manter orientação, fonte, validade, limites e próxima revisão. |

Registros são privados por conta e podem ser relacionados a um cliente próprio. Conclusão exige evidência. Incidentes exigem impacto, responsável, próxima ação e prazo. Atualizações usam revisão para detectar edição simultânea. Um resumo dos últimos sete dias pode ser copiado para revisão, sem envio automático.

## Pesquisa e implicações

A descrição pública de implantação da Onfly consultada durante a construção enfatiza configuração conforme políticas, treinamento, autonomia, ativação, acompanhamento de uso e resolução de demandas com outras áreas. Isso orientou o foco em passagem, primeiro valor, diagnóstico e prevenção. A relação específica com o comercial também foi informada pela usuária.

Fontes públicas de partida, consultadas em 18/10/2026:

- https://onfly.gupy.io/jobs/12657581
- https://www.onfly.com.br/
- https://lp.onfly.com.br/ajuda
- https://lp.onfly.com.br/ajuda/como-criar-um-fluxo-de-aprovacao

Essas fontes não estabelecem SLAs internos, critérios de pleno, metas individuais ou autorização para armazenar dados corporativos. Os critérios dos módulos anteriores de jornada são regras do Vectta e precisam ser alinhados à operação real; não são apresentados como política oficial da Onfly.

## Preparação e seis meses

Antes de 26/10: estudar o produto público e preparar perguntas sobre passagem comercial, ativação, ferramentas oficiais, canais de escalonamento e permissão de uso do Vectta.

Na primeira conversa com a liderança: confirmar o que diferencia júnior e pleno, quais resultados importam, o que caracteriza autonomia, como registrar evidências e quando revisar a evolução.

1. Primeiro mês: aprender produto e processos, acompanhar casos e alinhar critérios.
2. Segundo mês: ganhar consistência e estabelecer linha de base de qualidade, prazos e retrabalho.
3. Terceiro mês: demonstrar autonomia em um caso completo e pedir feedback intermediário.
4. Quarto mês: testar uma melhoria de passagem ou treinamento e comparar períodos equivalentes.
5. Quinto mês: compartilhar procedimento validado e observar sua utilização e resultados.
6. Sexto mês: consolidar casos, evidências e feedbacks; conversar sobre prontidão e lacunas.

A data de seis meses é uma meta de desenvolvimento, não uma promessa de promoção.

## Indicadores para combinar, sem metas inventadas

- Tempo até primeiro valor: definir evento inicial, evento de valor e pausas antes de medir.
- Completude da passagem: passagens com informações essenciais confirmadas / passagens revisadas.
- Retrabalho de escopo: casos com divergência de escopo / casos iniciados no período.
- Compromissos no prazo: retornos cumpridos / retornos com prazo acordado.
- Recorrência: incidentes com causa já conhecida / incidentes classificados no período.
- Autonomia do cliente: validação de uma tarefa real após treinamento, conforme critério acordado.

Os novos registros comportam essas evidências, mas não calculam automaticamente esses indicadores nem substituem relatórios oficiais. Contagem de registros atualizados não é medida de produtividade. Consumo financeiro não comprova adoção. Resultados devem informar período, denominador, fonte e contribuição de outras pessoas.

## chAI

- Consulta dados autenticados do servidor, incluindo os registros pessoais.
- Consulta separadamente o registro selecionado mesmo quando ele é antigo.
- Recebe contexto de passagem, incidentes, reuniões, conhecimento e evolução.
- Diferencia fatos, hipóteses, lacunas e recomendações; comunicações são rascunhos.
- Preserva datas e identificadores no contexto e omite padrões comuns de contato. Isso não é uma garantia completa de anonimização.
- Usa identificadores atuais do AI Gateway, com alternativa de modelo e análise por regras identificada quando a IA não responde.
- Não envia mensagens, cria compromissos, resolve incidentes ou salva decisões automaticamente.

Limites: contexto de até 20 registros priorizados entre os 100 mais recentes, mais consulta específica do registro solicitado, com 700 caracteres por campo. A tela carrega até 1.000 registros recentes e informa a cobertura. A base pessoal não é um mecanismo de busca semântica sobre todos os documentos. O limite de requisições da IA é por instância do servidor, não uma cota global distribuída.

## Limpeza e validação

O acesso demonstrativo foi retirado da entrada e bloqueado na API. O portfólio fictício foi excluído, a função pública de demonstração teve acesso revogado e o simulador de WhatsApp saiu do módulo de testes. Nenhum cliente real foi removido; a carteira estava vazia no momento da intervenção.

Foram adicionadas renovação de sessão, proteção contra saída com alterações não salvas e detecção de conflitos na edição. Testes automatizados cobrem autenticação, rejeição de demonstração, contexto da IA, validação, versões concorrentes, renovação de sessão e regressões operacionais. Verificação transacional no banco confirmou revisão, isolamento de leitura e escrita e rejeição de proprietário forjado, com rollback de todos os dados de teste.

## Limites de uso e próximos incrementos

O Vectta é um apoio pessoal. Não está integrado ao CRM da Onfly e não possui autorização institucional presumida. Referências aos sistemas oficiais são preferíveis à duplicação de dados sensíveis. A análise de banco ainda sinalizou proteção contra senhas vazadas desabilitada na configuração de autenticação; essa configuração não foi alterada nem foi contratado plano adicional.

Próximos incrementos úteis, após conhecer a operação: metas alinhadas à liderança, catálogo real de causas de incidentes, indicadores com definições aprovadas, exportação estruturada dos registros pessoais, pesquisa ampliada da base e integrações autorizadas. Não foram simulados conectores ou resultados para aparentar que essas capacidades já existem.

## Conferência após publicação

A implantação `e44bbd0` passou pela validação completa do repositório. No site publicado, o acesso anônimo aos registros retornou 401, a demonstração retornou 410 e a verificação de disponibilidade retornou 200. A sessão expirada foi renovada pelo fluxo normal. O registro pessoal “Alinhar critérios de evolução para pleno” foi salvo pela interface e permaneceu após recarregar.

A consulta real à chAI retornou análise por regras, não uma resposta generativa. As consultas de logs e configuração na Vercel foram recusadas com 403 para a equipe `chaianegdp-6988`; a conexão atual não permite concluir esse diagnóstico administrativo. A interface passou a informar o motivo seguro de indisponibilidade, distinguindo conexão ausente, autenticação, verificação de conta, créditos, limite e timeout. Não foram criadas chaves nem alterados pagamentos ou limites.
