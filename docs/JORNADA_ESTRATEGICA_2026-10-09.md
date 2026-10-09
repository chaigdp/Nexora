# Jornada estratégica no Vectta

## Destino e correção

Esta entrega pertence ao **Vectta**. A inclusão indevida no chAI GO foi revertida no commit `344692c` de `chaigdp/chai-go-testechat-01`, preservando o histórico e os recursos anteriores.

## Aplicação das referências

- Menu **Jornada e passagem**, acesso no início e botão **Passagem e estratégia** dentro de cada implantação.
- Dez itens de passagem, sete obrigatórios, com evidência e conferência. Alterar um obrigatório invalida o aceite anterior.
- Saúde da adoção explicável, dados insuficientes explícitos, sinais de risco e recomendações com motivo e próximo passo.
- Reversão em sete dias: diagnóstico, responsável, dois ou três ganhos, escalonamento e retorno. Geração sem duplicação.
- Adoção por causa: não sabe, não vê valor, não consegue ou não tem tempo.
- Treinamento por função, usuário-chave, roteiro de cinquenta minutos e reforços D+7/D+30.
- Modelos editáveis para reunião inicial, coleta de dados, contador e véspera da operação, sem envio automático.
- Nove indicadores, fórmulas e metas de referência, sem tratar ausência de dados como zero.
- Ritual semanal, quinze dias de operação assistida, critérios de saída, aceite e dossiê exportável.
- Acompanhamento de CS mostra o resumo da jornada e permite abrir a implantação correspondente.

## Persistência e isolamento

A jornada usa `projects.metadata.implantation_journey_v1`, com revisão, data de salvamento e registro por projeto. Não cria tabelas nem altera permissões. Na conta autenticada, `POST /api/journey` valida a sessão, consulta o projeto com o token do próprio usuário, preserva os demais metadados e grava sob as políticas de acesso existentes. A gravação exige revisão compatível e `updated_at` inalterado. Conflitos retornam 409, sem sobrescrever o outro registro.

Rascunhos permanecem na memória durante a navegação entre módulos. A interface informa alterações não salvas e avisa antes de fechar/recarregar. A troca de identidade limpa os rascunhos. O perfil somente leitura pode consultar as etapas, sem editar. A demonstração permanece isolada, fictícia e sem escrita persistente no banco.

O aceite de saída da jornada complementa os critérios técnicos do Vectta. Ele não altera a fase oficial nem ignora as validações existentes para entrada em operação.

## chAI

A chAI existente recebe o roteiro estratégico e um resumo dos registros salvos: lacunas da passagem, adoção, indicadores, riscos, próximos passos, treinamento e saída. Em produção, os fatos são obtidos no servidor sob as políticas de acesso. Contexto de jornada enviado pelo navegador é rejeitado fora da demonstração.

Na demonstração, a jornada da sessão pode acompanhar a pergunta apenas para um cliente existente na carteira demonstrativa. Dados de demonstração não se tornam registros reais. Não há ferramentas de escrita ou envio automáticos ligadas ao modelo. Se o provedor não responder, a análise local é identificada como análise por regras.

## Validação

- 35 testes de jornada, API, chAI e pendências passaram.
- TypeScript e compilação Next.js com Webpack passaram.
- Testes cobrem obrigatórios, evidências, datas, métricas ausentes, duplicações, autenticação, isolamento, preservação dos metadados, conflitos e contexto da chAI.
- Políticas e colunas do projeto Supabase foram consultadas sem mudança de estrutura ou acesso.
- Verificação pública após a publicação: registrar o resultado na entrega.
