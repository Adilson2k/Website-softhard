# Relatório de execução — CMS Softhard
Data: 23/11/2026  
Nome: Adilson Soares  
Função: Programador Fullstack  
Projecto: Website institucional Softhard — API, blogue e funil de leads

## 1. O que foi feito
- Implementada a API Express para gestão de artigos, com rotas públicas para conteúdo publicado e rotas editoriais protegidas por autenticação e autorização.
- Ligado o blogue público à API Softhard.
- Ligado o CMS editorial à API para gerir artigos, incluindo operações de criação, consulta, edição e remoção.
- Ligado o formulário de contacto à API e implementada a gestão administrativa de pedidos, com estados do funil, responsável, notas e próximos passos.
- Configurada a autenticação do CMS com Firebase Web e Google, com controlo de acesso por perfil.
- Aplicada a identidade visual Softhard ao CMS, incluindo a paleta vermelha e laranja e o logótipo.
- Ajustada a navegação mobile para usar uma barra inferior, mantendo a navegação lateral no desktop e o perfil na barra superior.
- Reorganizados os botões do dashboard para ficarem abaixo dos indicadores e da lista de artigos recentes.
- Corrigidos caracteres acentuados e textos com codificação incorrecta no website e no CMS.
- Compilados com sucesso a API, o website e o CMS.

## 2. O que falta
- Corrigir a referência local de `GOOGLE_APPLICATION_CREDENTIALS` ou configurar `FIREBASE_SERVICE_ACCOUNT_JSON` para que o Firebase Admin consiga carregar as credenciais.
- Validar operações reais de leitura e escrita no Firestore, autenticação de tokens e permissões administrativas no projecto Softhard.
- Executar uma verificação integrada do fluxo completo: publicação de artigo no CMS até à exibição no blogue e submissão de contacto até à gestão no painel de pedidos.

## 3. Bloqueios
- O projecto Firebase Softhard está indicado nas variáveis locais, mas o ficheiro de credenciais apontado por `GOOGLE_APPLICATION_CREDENTIALS` não existe neste ambiente. Assim, não foi possível confirmar o acesso real do Firebase Admin ao Firestore.
- Os builds confirmam a compilação do código; não substituem a validação de integração com o Firebase configurado.

## 4. Resumo da situação actual
- As rotas da API, a ligação do blogue, o CMS editorial e a interface administrativa de leads estão implementados.
- Os builds de API, website e CMS foram concluídos com sucesso em 23/11/2026.
- A autenticação Firebase Web está configurada no ambiente local do CMS.
- A integração real com Firestore permanece pendente até que a credencial de servidor seja encontrada ou configurada correctamente.

## 5. Observações adicionais
- As credenciais e tokens permanecem em ficheiros de ambiente locais ignorados pelo Git; nenhum valor secreto foi incluído neste relatório.
- Não foram executados testes automatizados nesta actualização. A validação realizada foi a compilação dos três workspaces.
- Após corrigir a credencial, recomenda-se validar a criação, edição, publicação e remoção de artigos, bem como a recepção e actualização de pedidos no funil.
