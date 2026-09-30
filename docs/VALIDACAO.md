# Validação da versão 1

Testes automatizados locais em banco D1 de desenvolvimento:
- Acesso sem sessão recusado.
- Senha incorreta recusada.
- 30 implantações e 210 entregas por visitante.
- Identificadores distintos entre carteiras de demonstração.
- Edição persistida após nova leitura.
- Alteração de projeto e tarefa de outro visitante recusada.
- Conclusão com entregas críticas abertas recusada.
- Cadastro de implantação e tarefa.
- Conclusão válida após resolver tarefa crítica.
- Registro de histórico.
- Logout invalida a sessão.
- Cadastro pessoal começa vazio.
- Dados pessoais persistem ao sair e entrar novamente.
- Solicitação de origem externa recusada.

Também executadas verificação TypeScript e compilação do pacote de publicação.

Não houve inspeção visual com navegador automatizado. O endereço publicado será confirmado pelo serviço de publicação; esses testes não constituem auditoria de segurança ou ensaio de restauração de backup.

## Atualização de acesso obrigatório e módulos

Teste adicional: `node tests/auth-session.mjs`. O teste executa os manipuladores reais do serviço com SQLite em memória e confirma login inválido, exigência da comprovação da abertura atual, rejeição de leitura/escrita usando somente cookie antigo, cookie não persistente, isolamento da demonstração, logout e preservação de registros pessoais após novo login. Verificação de tipos executada após a alteração.

A prévia supervisionada informou estar ativa, mas não foi alcançada pelo teste HTTP neste ambiente. A atualização foi verificada pelo teste direto do serviço; não houve inspeção visual com navegador.
