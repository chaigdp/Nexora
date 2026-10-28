# Acervo chAI

Portal independente em `/conhecimento`, usando a mesma conta do Vectta e infraestrutura existente. Nome provisório, sem pressupor o conceito futuro da usuária.

## Primeira versão

- Login e renovação de sessão Supabase; não exige outra conta.
- Caixa de entrada com arquivos múltiplos, arrastar e soltar, prints colados da área de transferência, textos e links HTTP(S).
- Até 10 arquivos por envio, 20 MiB por arquivo. Qualquer extensão é armazenada como objeto binário privado; nunca executada ou incorporada na página.
- Originais em bucket privado `chai-knowledge`, caminho proprietário/registro/original. Metadados e texto na tabela `knowledge_sources`, com RLS por proprietário. Sem permissões anônimas e sem chave privilegiada no navegador.
- Leitura UTF-8 automática de TXT, MD, CSV, JSON, LOG, SRT e VTT até 200 mil caracteres. Erro de leitura não descarta o original; conteúdo permanece aguardando leitura.
- Outros formatos, incluindo PDF, DOCX, imagens, áudio e vídeo, são recebidos, mas não há OCR, transcrição ou extração automática nesta versão. Links são referências, sem crawler. A interface explica isso antes e depois do envio.
- Busca textual PostgreSQL em português por título, URL, conteúdo disponível e notas, com paginação de 50 registros.
- Revisão manual de texto, observações, validação, arquivamento e restauração. Atualizações exigem a versão temporal lida para evitar sobrescrever outra sessão. Original binário imutável.
- Download autenticado do original. Sem URLs públicas ou compartilhamento automático.

## Relação com a chAI

A tabela é a base de entrada do conhecimento, separada das tarefas operacionais. Esta versão não envia seu conteúdo ao provedor gratuito, não altera parâmetros do modelo e não afirma aprendizado automático. O próximo estágio deve criar leitura assistida dos formatos pendentes e recuperação de fontes aprovadas para a chAI com um provedor adequado à confidencialidade. Não existe processamento em segundo plano oculto. A usuária pode começar a reunir materiais imediatamente.

## Custos e limites

Não adiciona serviço ou plano pago. Compartilha cotas de banco, arquivos e tráfego do projeto existente. Os limites gratuitos não são ilimitados; vídeo e áudio podem consumir a cota rapidamente. Upload direto ao Storage evita enviar arquivos grandes pela função Vercel. Arquivamento mantém o original e não libera armazenamento.

## Validação

Testes unitários de protocolos de URL, preservação UTF-8, dados binários, limites sem truncamento e distinção entre armazenamento e extração. Verificação TypeScript e build Next.js. Migração versionada com tabela, índice de busca, bucket privado e políticas por usuário. Testes SQL transacionais validam isolamento e regras sem manter dados sintéticos. Login/upload com a sessão real da usuária depende de teste autenticado no navegador.
