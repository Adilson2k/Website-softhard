# Softhard CMS

Frontend de gestão do blogue e dos pedidos recebidos pelo site. O CMS usa Firebase Authentication no navegador para o login Google e envia as operações editoriais para a API Express; não acede directamente ao Firestore.

## Desenvolvimento

Na raiz do monorepo, execute `npm run dev` para iniciar o site institucional, o CMS e a API em paralelo:

- Site institucional: `http://localhost:5174`
- CMS: `http://localhost:3002`
- API: `http://localhost:3001`

O CMS encaminha pedidos `/api` para `http://localhost:3001`. Configure em `.env.local` os campos públicos da aplicação Web Firebase: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID`. O provedor Google deve estar activo no Firebase Authentication.

Na API, configure `FIREBASE_PROJECT_ID`, credenciais Firebase Admin, `CMS_ADMIN_EMAILS` e `BLOB_READ_WRITE_TOKEN` em `apps/api/.env` ou no gestor de segredos do ambiente. A conta administradora deve usar um email verificado. Editores recebem a claim `cmsRole=editor`. Em produção, defina `VITE_API_URL` no build do CMS para a URL HTTPS pública da API, terminada em `/api`.

A página de Configurações permite aos administradores listar contas e criar utilizadores CMS com papel de editor ou administrador. A API protege estas operações com a sessão Firebase Admin; configure `CORS_ORIGIN` na API com a origem exacta do CMS quando estiverem em domínios Vercel separados. A palavra-passe inicial é definida pelo administrador e deve ser partilhada directamente com a pessoa criada.

## Segurança

- Chaves privadas Firebase e tokens Blob existem apenas na API. Nunca use esses valores em variáveis `VITE_*`.
- O CMS envia o token de sessão Firebase como Bearer token; a API valida-o antes de autorizar posts, leads ou uploads.
- A lista de administradores é configurada no servidor em `CMS_ADMIN_EMAILS`, nunca no bundle do frontend.
- Administradores podem criar contas e atribuir permissões pela página Configurações; essa operação usa Firebase Admin no servidor.
- O login Google só concede acesso quando o email verificado está em `CMS_ADMIN_EMAILS` ou a conta possui uma claim editorial reconhecida pela API.
