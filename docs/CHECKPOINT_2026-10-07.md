# Checkpoint Vectta — 07/10/2026

## Estado atual

O Vectta está em evolução de demo para produto funcional. A demonstração e a produção já foram separadas no banco.

## Concluído hoje

- Separação definitiva entre Demo e Produção.
- Produção zerada para clientes reais.
- Demo preservada em snapshot somente leitura com 35 clientes fictícios.
- Backup lógico pré-go-live criado.
- Teste de restauração lógica executado com sucesso.
- RLS revisado e mantido ativo.
- Papéis de acesso criados: owner, admin, analyst e viewer.
- Estrutura de convites de equipe preparada.
- Tela Equipe e acessos implementada.
- Política técnica de LGPD e retenção criada.
- Rotina automática de retenção de logs transitórios configurada.
- Recuperação de senha corrigida.
- Endpoint de health check criado.
- Monitoramento sintético configurado.
- Teste de carga executado com 200 requisições e 20 acessos simultâneos, sem erros.
- Hardening web preparado.
- Pente-fino visual realizado.
- Correção de quebra de palavras em cards e indicadores.
- Correção para impedir deslocamento lateral da página no celular.
- Central de Pendências alterada para mostrar 5 itens por vez.
- Botões Mostrar mais / Mostrar menos adicionados.
- Formulário de Nova pendência movido para a parte superior da tela.
- Filtros de Pendências agora reiniciam a paginação.

## Pendências por custo

Não executar até haver orçamento para planos pagos:

1. Migrar Supabase para plano compatível com Leaked Password Protection e backup gerenciado/PITR.
2. Migrar Vercel para plano comercial adequado.
3. Testar restauração do backup gerenciado.
4. Repetir auditoria de segurança após os upgrades.
5. Liberar formalmente o cadastro de clientes reais.

## Regra operacional atual

Não cadastrar clientes reais enquanto os itens pagos acima não forem concluídos.

## Últimos commits relevantes

- 55d87f0 — estabilizar viewport mobile e eliminar deslocamento lateral.
- f9f6bae — paginar pendências e antecipar formulário de criação.
- 5828a927 — ajuste visual da paginação de pendências.

## Publicação

As alterações estão salvas no GitHub. Alguns dos commits mais recentes ainda podem não estar no endereço público porque a Vercel atingiu o limite de builds do plano atual.

URL pública atual:
https://vectta.vercel.app

## Próxima retomada

Quando voltarmos ao Vectta:

1. testar visualmente no celular;
2. revisar Pendências com volume maior;
3. continuar refinando UX conforme observações da Chai;
4. evitar novas mudanças de infraestrutura paga até autorização;
5. manter Demo e Produção separadas.

Este arquivo é o ponto oficial de retomada do projeto.
