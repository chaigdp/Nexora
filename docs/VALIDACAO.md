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
