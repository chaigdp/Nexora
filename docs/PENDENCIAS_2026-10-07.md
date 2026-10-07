# Central de pendências

Pedido: tornar Pendências mais intuitiva, estratégica e explicativa.

## Entrega

- Indicadores acionáveis: desbloquear, recuperar prazo, agir hoje e completar plano.
- Priorização explicada, busca e filtros por cliente e responsável; consulta de concluídas.
- Impacto, próxima ação, contexto do cliente e estratégias por bloqueio, atraso ou criticidade.
- Criação, edição e reabertura. Conclusão pela nova tela exige evidência e critério verificável.
- Próximo retorno separado do prazo da entrega, pessoa de contato e registro de contatos.
- Guia de condução e mensagem para adaptar, sem envio automático.

## Compatibilidade e limites

Plano em tasks.detail.actionPlan, preservando as demais chaves de detail. Não há migração.
Política own tasks exige usuário autenticado proprietário e projeto do mesmo usuário.
Atualizações filtram updated_at quando presente; resposta sem linha não vira sucesso.
A demonstração mantém mudanças na sessão. Não foi validada uma gravação autenticada real.
Os conselhos são regras explícitas, não inferência de IA ou comprovação de impacto.
O registro de contatos é texto editável, não uma trilha imutável.
A regra de evidência pertence à nova interface; interfaces legadas não foram alteradas.

## Verificação

20 testes passaram, incluindo ordenação, datas, conclusão e compatibilidade com registros antigos.
TypeScript aprovado. A validação contínua executa os testes da nova lógica.
