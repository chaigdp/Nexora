# Nexora | Proposta de produto e plano de construção

Data: 30/09/2026
Responsável pelo produto: Chaiane de Paula
Estado: proposta para avaliação. A aplicação ainda não foi implementada, testada ou publicada.

## Objetivo
Plataforma utilizável para acompanhar implantações de sistemas e apresentar competências de uma analista de implementação de ERP em entrevistas. Onboarding significa orientação e acompanhamento inicial do cliente; pronúncia aproximada: ón-bór-ding.

## Direção recomendada
- Nexora independente, capaz de acompanhar vários sistemas e fornecedores.
- Integração com Orbytta em etapa posterior, após analisar os pontos de integração e permissões disponíveis.
- Interface com a identidade da referência Nexora Academy: azul escuro, ciano, verde e navegação clara.
- Serviço da aplicação em Python, respeitando a preferência da responsável. Banco relacional persistente. A escolha de hospedagem e tecnologias será registrada após verificar viabilidade, custos e recursos disponíveis.
- Repositório de trabalho: https://github.com/chaigdp/Nexora.
- Demonstração com dados inventados, identificados e separados dos dados de trabalho. Nunca apresentar exemplos como clientes reais.

## Primeira versão proposta
| Área | Uso |
| --- | --- |
| Minha carteira | Cadastrar cliente, segmento, sistema, responsável, escopo, datas e etapa da implantação |
| Plano de implantação | Descoberta, requisitos, configuração, migração, testes, treinamento, entrada em operação e acompanhamento posterior |
| Pendências | Responsável, prioridade, vencimento, dependência, bloqueio e registro de resolução |
| Visão do período | Implantações iniciadas e concluídas, atrasos e duração por filtros de datas |
| Detalhe do cliente | Requisitos, módulos, marcos, tarefas, riscos, decisões e histórico |
| Demonstração | Acesso funcional com usuário e senha e 30 casos de diversos segmentos |
| Acesso e persistência | Autenticação no servidor, autorização e dados persistidos no banco |
| Relatórios | Exportação dos registros autorizados, com proteção de campos sensíveis |

## Ideias de produto para aprovação
1. Prontidão para entrada em operação: requisitos obrigatórios, testes, migração e treinamento; pendências críticas impedem declarar prontidão.
2. Acompanhamento de escopo: registrar solicitações extras, impacto de horas e prazos e decisão sobre aprovação.
3. Saúde da implantação: critérios visíveis de risco, como atraso, bloqueios críticos e ausência de participação do cliente.
4. Capacidade da analista: carga planejada versus disponibilidade, evitando assumir implantações além da capacidade.
5. Portal do cliente em segunda etapa: visão restrita do próprio projeto, envio de pendências e confirmação de entregas.
6. Roteiro de entrevista: percurso demonstrável, do diagnóstico do cliente à entrada em operação, com problemas e decisões registradas.

## Regras dos indicadores
- Concluídas no período: contar pela data de conclusão, sem misturar com data de cadastro.
- Atrasadas: pendências abertas com vencimento anterior à data atual.
- Progresso: entregas concluídas dividido por entregas aplicáveis; mostrar critério e denominador.
- Duração: diferença entre início e conclusão; casos abertos ficam fora da média de concluídos.
- Risco: regras explicáveis, sem percentual inventado.
- Fuso horário de apresentação: America/Sao_Paulo.

## Segurança e demonstração
- Senhas armazenadas com função apropriada de derivação, nunca em texto puro.
- Autorização em todas as operações do servidor, impedindo acesso entre clientes e ambientes.
- Sessões protegidas, encerramento de acesso e limitação de tentativas de login.
- Validação de entradas, histórico de ações e tratamento de erros sem expor segredos.
- Credenciais, chaves e dados reais fora do GitHub.
- Dados de demonstração separados; acesso público de demonstração sem privilégios administrativos.
- Se a demonstração permitir edições, usar espaço isolado por sessão para evitar interferência entre visitantes.
- Credenciais de demonstração só serão entregues após criação e teste do acesso.
- Cópias de segurança e restauração verificadas antes de uso com dados reais.
- Endereço inicial hospedado; domínio próprio depende da escolha e disponibilidade do nome e do registro, que não será comprado sem autorização.

## Etapas e critérios de aceite
1. Aprovar produto: independência do Nexora, amplitude da primeira versão e comportamento da demonstração.
2. Preparar arquitetura e ambiente: dependências reproduzíveis, configuração de exemplo sem segredos e modelo de dados documentado.
3. Entregar carteira e detalhes: cadastrar, editar e consultar projetos; confirmar persistência após reiniciar a aplicação.
4. Entregar execução: tarefas, marcos, riscos, escopo e indicadores calculados a partir dos registros.
5. Entregar acesso: testar login válido e inválido, saída, bloqueio de acesso não autorizado e isolamento de dados.
6. Preparar demonstração: 30 casos coerentes, credenciais funcionais e roteiro de apresentação.
7. Publicar: verificar HTTPS, persistência, acesso e comportamento no endereço hospedado; registrar limitações.
8. Documentar entrega: instruções de execução, decisões, modelo de dados, testes, roteiro de entrevista e próximos passos no GitHub.
9. Avaliar integração Orbytta: inspecionar interfaces existentes e construir integração somente com contrato e permissões definidos.

## Decisões pendentes da responsável
- Aprova Nexora independente, com integração Orbytta posterior?
- Prefere começar com uso individual ou já incluir o portal do cliente?
- Demonstração deve permitir editar em ambiente isolado ou apenas consultar?

## Limites atuais
Este documento é uma proposta. Não confirma aplicação pronta, hospedagem, domínio, banco provisionado, integração ou credenciais existentes.
