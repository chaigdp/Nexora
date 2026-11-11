# D-004 | Superprompt externo: laboratório de simulação operacional

**Origem:** repositório `chaigdp/prompts-chai`, arquivo `prompts/vectta/testes/2026-10-09_sala-teste-500-clientes-7-atendentes_v1.0.md`.  
**Data/versão do original:** 09/10/2026, versão 1.0.  
**Classificação:** superprompt auxiliar de desenvolvimento.  
**Status no Vectta:** não é carregado automaticamente pelo runtime da chAI. Esta cópia é um snapshot documental para manter a referência junto da biblioteca.

## Texto integral original

```text
# VECTTA | LABORATÓRIO DE SIMULAÇÃO OPERACIONAL E EXPERIÊNCIA EM TEMPO REAL
**Superprompt para Claude Code | Versão 1.0 | 09/10/2026**

## 1. Missão
Atue como arquiteto de software sênior, engenheiro de QA e desempenho, especialista em IA conversacional, CX (experiência do cliente), EX (experiência do profissional), operações de atendimento, ciência de dados, UX/UI, segurança e observabilidade.

Desenvolva e execute uma **Sala de Testes Operacional Inteligente no Vectta**, capaz de simular uma operação, visualizar eventos ao vivo, testar intervenções e produzir relatórios de evidências. **Não faça apenas um protótipo visual**: construa motor de simulação funcional, persistência, eventos, indicadores calculados e testes executados.

## 2. Regras inegociáveis
1. Inspecione primeiro o código, arquitetura, banco, módulos e infraestrutura existentes.
2. Preserve funcionalidades e identidade visual atuais do Vectta. **Não inserir no chAI GO.**
3. Reaproveite componentes e integrações existentes quando adequado.
4. Apenas identidades e conversas sintéticas; nada de dados reais.
5. Isole execução, banco, integrações e filas da produção. Não envie mensagens nem notificações externas reais.
6. Identifique tudo explicitamente como **SIMULADO**.
7. Nunca invente métricas, resultados de testes ou evidências. Derive-os dos eventos.
8. Implemente testes automatizados, auditoria e documentação.
9. Não publique, dispare ações ou altere produção sem autorização.
10. Identifique com precisão qualquer limitação ou parte não implementada.

## 3. Cenário principal
- **500 clientes simultâneos no cenário**, com perfis e solicitações distintos.
- **7 atendentes cadastrados**, dos quais **6 inicialmente disponíveis e 1 em pausa**.
- chAI como agente de apoio a clientes, profissionais e supervisores.
- Demandas simples, moderadas, complexas e críticas.
- Variedade de paciência, urgência, expectativa, comportamento e sentimento.
- Canal conversacional simulado, eventos e dashboard ao vivo.

Estados exclusivos e contabilização consistente: aguardando na fila, em autoatendimento por IA, aguardando humano, em atendimento humano, abandono e concluído. Modele transições válidas sem duplicidades. Distribuição de perfis configurável.

## 4. Motor de simulação
Gere eventos realistas de entrada e acúmulo de fila; alocação; mudança de sentimento; prioridade; pausa e retorno; reclamações; falhas de entendimento; transferência incorreta; bom atendimento; abandono; sobrecarga; falhas técnicas simuladas; intervenção da chAI; escalonamento; resolução e encerramento.

Cada cliente deve possuir máquina de estados e linha do tempo cronológica, rastreável. Ofereça controles **INICIAR, PAUSAR, RETOMAR, ACELERAR, DESACELERAR, REINICIAR, ENCERRAR** e velocidades **1x, 2x, 5x, 10x**. Separe tempo da simulação do tempo real. Registre configuração versionada e semente aleatória para reprodução.

## 5. Experiência e sentimento do cliente
Registre paciência inicial, urgência, complexidade, histórico sintético, tolerância à espera, propensão a abandonar, sentimento atual, risco estimado de insatisfação/abandono e expectativa de resolução.

Categorias possíveis: muito satisfeito, satisfeito, neutro, impaciente, frustrado, irritado, muito irritado, risco de abandono. São **categorias da simulação, não diagnósticos psicológicos**.

Exiba gráfico e linha do tempo emocional de cada cliente. Exemplo meramente ilustrativo: chegada neutro → espera → impaciência → reclamação → intervenção chAI → atendimento → conclusão. **Não fixe essas linhas como dados; gere a partir de eventos reais do motor.**

Métricas: espera média e máxima; espera individual; P50/P90/P95; distribuição e evolução de sentimentos; abandonos; reclamações; severidade; clientes em risco; evolução após intervenções; casos acima de limites. Diferencie estados sintéticos, inferência e respostas explícitas.

## 6. Experiência e sobrecarga do atendente
Crie sete perfis fictícios individuais com experiência, especialidades, capacidade simultânea configurável, velocidade, produtividade sintética, disponibilidade, pausas, tempo ativo, carteira e complexidade.

Simule: demanda acima da capacidade, concentração de casos críticos, mensagens simultâneas, excesso de tempo contínuo, retorno da pausa, indisponibilidade, aumento de tempo de resposta, deterioração de resolução, apoio da chAI e redistribuição do supervisor.

Exiba por atendente: ocupação, conversas simultâneas, primeira resposta, TMA, resoluções, reaberturas, reclamações, retrabalho, erros simulados, tempo sem pausa, carga ponderada pela complexidade, qualidade e **índice de pressão operacional**.

Não inferir estresse, esgotamento ou estado mental de profissionais reais com base apenas em produtividade. Em produção, qualquer dado subjetivo depende de manifestação voluntária.

## 7. chAI como inteligência operacional
**Clientes:** identificar sinais simulados de frustração, atrasos, risco de abandono, posição estimada na fila e alternativas adequadas, sem justificativas inventadas ou mensagens repetitivas.

**Atendentes:** sugerir respostas, resumir históricos, identificar lacunas, sinalizar casos irritados, sugerir pausas viáveis, transferência adequada, prioridade e passagem de bastão.

**Supervisores:** antecipar gargalos, sugerir redistribuição, acionamento de capacidade disponível, gestão de pausas, automação e prevenção de deterioração.

Para cada recomendação: problema, evidências, confiança quando cabível, ação proposta, impacto esperado, riscos, aprovação/rejeição e resultado observado. Ações relevantes exigem política de autorização, sem execução automática irrestrita.

## 8. Painel operacional ao vivo
Nome sugerido: **Vectta | Live Experience Lab** (laboratório de experiência ao vivo).

**Visão executiva:** clientes totais, aguardando, atendidos, disponíveis, ocupados, em pausa, espera média/máxima, índice simulado de satisfação, abandono, ocupação, reclamações, críticos, intervenções, resoluções, alertas.

**Mapa da fila:** representação navegável dos 500 clientes com filtros, agrupamentos e virtualização para desempenho. Ao clicar: perfil, posição, espera, solicitação, conversa sintética, sentimento, evolução, reclamações, atendente, intervenções e desfecho.

**Central dos atendentes:** sete cartões, status, carga, clientes, tempos, riscos e produtividade, com detalhamento individual.

**Feed de eventos:** acontecimentos ao vivo e auditáveis: reclamações, SLA violado, ocupação máxima, recomendação chAI, aprovação da supervisão, resultado posterior. Exemplos são apenas ilustrativos; eventos verdadeiros devem surgir na execução.

Controles de simulação, filtros por estado/severidade/atendente, gráficos, histórico, pausa e exportação. Indique claramente conexão ativa, reconexão e atraso de atualização.

## 9. Reclamações e conversas
Exiba **conteúdo das reclamações**, não só contagens. Classifique: demora, resposta inadequada, não resolução, informação errada, transferências, falta de empatia, repetição, falha técnica, processo e outros.

Para cada registro: cliente, atendimento, instante, trecho exato sintético da conversa, categoria, severidade, causa provável, evidência, intervenção e resultado. Inclua também exemplos positivos para boas práticas.

## 10. Indicadores e fórmulas
**CX:** CSAT (satisfação declarada), CES (esforço declarado), FCR (resolução no primeiro contato), abandono, reclamações por 100 atendimentos, espera, primeira resposta.

**Operação:** TMA (tempo médio de atendimento), TME (tempo médio de espera), SLA (nível de serviço conforme limite configurado), produtividade, ocupação, retrabalho, escalonamento, transferência, capacidade e vazão/minuto.

**IA:** intervenções sugeridas, aceitas, rejeitadas, úteis, incorretas, falsos alertas, resolução por autoatendimento, tempo economizado *estimado* e impacto observado.

**Atendente:** índice de pressão, desigualdade de carga, tempo sem pausa, pausas cumpridas/interrompidas, críticos simultâneos, retrabalho e qualidade durante alta demanda.

Defina matematicamente numerador, denominador, janelas, exclusões e fonte para cada indicador. Distinga medido/estimado/declarado. Exiba **Dados insuficientes** quando faltar amostra.

## 11. Experimentos controlados
A. **Sem chAI:** 500 clientes; 6 ativos, 1 em pausa; IA desabilitada.
B. **Com chAI:** mesmas condições e semente, IA recomendando.
C. **Retorno do sétimo atendente:** medir efeitos na operação.
D. **Sobrecarga crítica:** mais complexidade, falhas e abandono.
E. **Gestão preventiva:** redistribuição, prioridade, apoio IA, pausas.
F. **Falha de IA:** classificação incorreta, recomendação ruim e indisponibilidade temporária.

Compare os cenários com condições equivalentes, repetições, dispersão dos resultados e limitações. Não alegue causalidade só porque uma métrica melhorou.

## 12. Segurança
Banco e ambiente isolados; tenant fictício; integrações externas desabilitadas; sem SMS, WhatsApp, Instagram, e-mail, cobrança ou dados de produção; acesso autorizado; auditoria; limpeza dos dados sintéticos; proteção contra duplicação, corrida de eventos e efeitos colaterais.

## 13. Testes automatizados e desempenho
Valide de fato:
1. Criação de **exatamente 500 clientes** e **7 atendentes**, seis disponíveis e um em pausa.
2. Distribuição conforme capacidade e nenhuma duplicação/transição inválida.
3. Espera, percentis, indicadores e reconciliação de contagens.
4. Evolução de sentimentos, reclamações e histórias individuais.
5. Recomendações chAI rastreáveis e aprovações registradas.
6. Atualização ao vivo, reconexão e ordenação de eventos.
7. Pausa/retomada, velocidade, reinício e encerramento.
8. Reprodução com semente e configuração.
9. Exportações e consistência do relatório.
10. Falhas simuladas, isolamento, acessibilidade, responsividade, regressões e desempenho da interface.

**Diferencie simular 500 entidades de comprovar 500 conexões simultâneas reais.** Faça um teste de carga separado com usuários virtuais/conexões concorrentes, se o ambiente suportar, registrando infraestrutura, throughput, latência, erros, limites e evidências. Se não executar, declare explicitamente.

## 14. Relatório final automático
Inclua: resumo executivo; operação; experiência cliente; atendentes; chAI; o que funcionou; o que falhou; reclamações exemplificadas e causas prováveis; cenários comparados; ações prioritárias; próximos passos e tickets técnicos.

Atribua **notas de 0 a 10** com critérios, pesos predefinidos, fórmulas e evidências a: estabilidade, desempenho, experiência sintética do cliente, operação, apoio ao atendente, efetividade da chAI, qualidade das recomendações, usabilidade, segurança/isolamento e confiabilidade dos dados. Calcule a média ponderada. Não apresente nota simulada como qualidade comprovada em produção.

Cada melhoria: severidade, impacto, esforço, risco, evidência, responsável sugerido e critério verificável de sucesso.

## 15. UX/UI
Respeite o design do Vectta. Interface profissional, responsiva, acessível, clara, com gráficos interativos, bom contraste, desempenho com 500 itens, estados vazios, carregamento, falhas e reconexão.

Seções: visão geral ao vivo; mapa da fila; cliente; atendentes; inteligência chAI; reclamações e conversas; análises e comparativos; relatórios; configuração e histórico de cenários. Quero observar tudo visualmente, sem depender de logs técnicos.

## 16. Arquitetura
Inspecione stack, banco, entidades, fluxos, autenticação, canais, infraestrutura e testes. Justifique escolha de WebSocket ou SSE (Server-Sent Events, eventos enviados pelo servidor) para atualização ao vivo. Implemente motor, cenários, event log, persistência, agregadores, dashboard, exportação e testes com a arquitetura mais simples compatível. Evite dependências supérfluas.

## 17. Critérios de aceite
Concluído somente quando: sala acessível no Vectta; cenário inicia com 500 clientes e 7 atendentes (1 em pausa); estados e eventos evoluem; sentimentos sintéticos e reclamações são navegáveis; sobrecarga aparece; chAI recomenda e registra; supervisor testa intervenções; indicadores são calculados; painel atualiza sem recarregar; relatórios exportam; testes relevantes passam; produção permanece intocada. Pendências não podem ser marcadas como entregues.

## 18. Plano de execução
**Fase 1:** diagnóstico do repositório e riscos.
**Fase 2:** isolamento, entidades, eventos, persistência.
**Fase 3:** clientes, atendentes, fila e regras.
**Fase 4:** sentimento sintético, chAI e recomendações.
**Fase 5:** central em tempo real, gráficos e controles.
**Fase 6:** testes automatizados e desempenho.
**Fase 7:** cenários experimentais.
**Fase 8:** relatórios, notas e recomendações.
**Fase 9:** documentação, comandos de execução e versionamento; não publicar em produção sem autorização.

Não entregue somente plano. **Implemente, execute, valide e forneça evidências**, relatando limitações.

## 19. Perguntas que a sala deve responder
- Quantos aguardam? Quem está mais irritado ou pode abandonar? Qual causa?
- Quais reclamações reais **da simulação** estão surgindo, com conversas?
- Quem está sobrecarregado? Quem necessita ajuda?
- Como a pausa e o retorno do sétimo atendente alteram a fila?
- Onde existem gargalos, erros, retrabalho e abandono?
- O que a chAI sugeriu? O que foi aprovado, funcionou ou falhou?
- Como variam espera, qualidade e risco por cenário?
- Qual nota justificada da simulação e quais correções vêm primeiro?

**Diretriz final:** Este laboratório existe para compreender relações entre experiência do cliente, capacidade operacional, experiência profissional e recomendações de IA, não apenas para exibir 500 avatares. Entregar implementação verificável, observação ao vivo, análises auditáveis e melhorias concretas.
```
