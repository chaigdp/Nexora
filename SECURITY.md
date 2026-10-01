# Segurança e confidencialidade

Não envie senhas pessoais, chaves de serviços, tokens, arquivos de ambiente reais, bancos operacionais, cópias de segurança ou dados de clientes ao Git. Exemplos de configuração devem conter apenas marcadores fictícios.

O arquivo .gitignore reduz envios acidentais de arquivos locais. Ele não remove arquivos já versionados, não examina o conteúdo de outros arquivos e não torna um repositório privado. Revise o conteúdo preparado antes de cada envio.

Se uma credencial real for exposta, revogue ou substitua a credencial no serviço de origem. Apagar o arquivo no commit seguinte não remove o histórico nem inutiliza a credencial.

Não registre vulnerabilidades ou segredos em chamados públicos. Utilize um canal privado verificado com a proprietária.

A implementação dos produtos deve permanecer em repositórios privados, com acesso apenas a pessoas autorizadas. O portfólio público deve conter somente apresentações e materiais destinados à divulgação.
