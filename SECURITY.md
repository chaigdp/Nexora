# Segurança e confidencialidade

Não envie senhas pessoais, chaves de serviços, tokens, arquivos de ambiente reais, bancos operacionais, cópias de segurança ou dados de clientes ao Git. Exemplos de configuração devem conter apenas marcadores fictícios.

O arquivo .gitignore reduz envios acidentais de arquivos locais. Ele não remove arquivos já versionados, não examina o conteúdo de outros arquivos e não torna um repositório privado. Revise o conteúdo preparado antes de cada envio.

Se uma credencial real for exposta, revogue ou substitua a credencial no serviço de origem. Apagar o arquivo no commit seguinte não remove o histórico nem inutiliza a credencial.

Não registre vulnerabilidades ou segredos em chamados públicos. Utilize um canal privado verificado com a proprietária.

A implementação dos produtos deve permanecer em repositórios privados, com acesso apenas a pessoas autorizadas. O portfólio público deve conter somente apresentações e materiais destinados à divulgação.

## Redefinição de senha

A redefinição de senha dentro do Vectta pode dispensar a senha anterior somente quando a identidade autenticada pelo ambiente gerenciado do ChatGPT/Sites corresponder ao e-mail da própria conta. Fora desse ambiente, a troca exige a senha atual.

Novas senhas são derivadas com PBKDF2-SHA256, 600.000 iterações e salt aleatório novo. O banco armazena apenas o resultado derivado e o salt, nunca a senha em texto legível. Após uma troca válida, sessões antigas baseadas em senha são invalidadas.

Os cabeçalhos de identidade `oai-authenticated-user-*` só podem ser tratados como prova de identidade quando o aplicativo estiver atrás do gateway gerenciado que os valida e controla. Em hospedagem própria, não confiar nesses cabeçalhos recebidos diretamente da internet sem um proxy de autenticação equivalente.
