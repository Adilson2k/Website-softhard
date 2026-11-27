# Website institucional

Monorepo npm com aplicações independentes:

- `apps/web`: React, Vite, TypeScript, Tailwind CSS v4 e componentes compatíveis com shadcn/ui.
- `apps/api`: Express e TypeScript.
- `apps/cms`: CMS de posts e pedidos, servido pela API Express.

## Requisitos
- Node.js LTS
- npm (incluído com Node.js LTS)

## Instalar e iniciar

Execute na raiz do projeto:

```powershell
npm install
npm run dev
```

O frontend institucional inicia em `http://localhost:5174`, o CMS em `http://localhost:3002` e a API em `http://localhost:3001`. O script `npm run dev` inicia os três processos; também é possível iniciar cada aplicação separadamente com `npm run dev:web`, `npm run dev:cms` e `npm run dev:api`.

## CMS

O CMS de posts e pedidos corre em `http://localhost:3002`. Para iniciar tudo de uma vez, execute `npm run dev` na raiz do monorepo. A configuração local está descrita em `apps/cms/README.md`.

## shadcn/ui

O frontend já tem Tailwind CSS v4, aliases `@/` e `components.json` configurados. O botão inicial está em `apps/web/src/components/ui/button.tsx`. Para adicionar outros componentes:

```powershell
Push-Location apps\web
npx shadcn@latest add card
Pop-Location
```

## API

- `GET /api/health`: verifica se a API está ativa.
- `GET /api/posts` e `GET /api/posts/:slug`: artigos publicados do blogue.
- `/api/admin/posts`: gestão de artigos com token Firebase (admin/editor).
- `POST /api/leads`: recebe pedidos do formulário de contactos, valida-os e limita o volume de submissões.
- `/api/admin/leads`: consulta e acompanha pedidos no funil (admin).
- Porta configurável com `PORT` (padrão `3001`).
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` configuram Firebase Admin como segredos de ambiente; também é aceite `FIREBASE_SERVICE_ACCOUNT_JSON`. Veja `apps/api/README.md`; não adicione credenciais ao Git.
- `CORS_ORIGIN` define a allowlist de origens (padrão `http://localhost:5174,http://localhost:3002`; aceita uma lista separada por vírgulas).
- `VITE_API_URL` no frontend permite substituir a URL base da API; por padrão, o frontend usa `/api` e o proxy do Vite encaminha os pedidos locais para `http://localhost:3001`.

## Build

```powershell
npm run build
```

O build gera HTML pré-renderizado para a página inicial, as páginas institucionais e a página `404.html` em `apps/web/dist/`, além dos assets de produção.

## Deploy no Vercel

O `vercel.json` na raiz configura os três serviços do monorepo: website em `/`, CMS em `/cms` e API em `/api`. No projecto Vercel, ligue o repositório com a raiz definida para a raiz do monorepo e seleccione **Services** como Framework Preset. A funcionalidade Services está em beta e requer esta configuração do projecto.

Configure as variáveis no ambiente do projecto Vercel. Para a API: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CMS_ADMIN_EMAILS` e `BLOB_READ_WRITE_TOKEN`. Para o CMS: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID`. Quando o CMS for implantado como projecto próprio no domínio raiz, deixe `VITE_CMS_BASE_PATH` por configurar. Se o CMS for servido sob `/cms` junto do website, defina `VITE_CMS_BASE_PATH=/cms/`. Não é necessário definir `VITE_API_URL` para produção: website e CMS usam a API no mesmo domínio, em `/api`.

Para executar localmente com o CLI do Vercel instalado e autenticado, use `vercel dev` na raiz do monorepo.

## SEO

- Conteúdo principal pré-renderizado em cada rota institucional, incluindo páginas individuais de serviços (`/servicos/*`) e projectos (`/portfolio/*`), para indexação sem depender da execução inicial do JavaScript.
- O Portfólio apresenta os trabalhos numa galeria horizontal acessível por arrasto, toque, teclado e controlos; cada trabalho tem uma página própria. O Blogue em `/noticias` permite filtrar e expandir artigos por tema.
- O formulário de contactos envia pedidos para a API; a gravação no Firestore exige a configuração de Firebase Admin.
- A página de Carreiras apresenta as áreas profissionais da Softhard e um formulário de candidatura espontânea demonstrativo, sem envio ou armazenamento de dados.
- A página `404.html` apresenta o erro para endereços desconhecidos e usa `noindex` para evitar que seja indexada como conteúdo.
- Título, descrição, Open Graph, Twitter Cards, dados estruturados `Organization`, hierarquia semântica e `robots.txt`.
- Idioma definido como português de Angola (`pt-AO`); contactos empresariais e Instagram incluídos nos dados estruturados.
- O domínio oficial ainda é necessário para configurar URL canónica, sitemap e dados estruturados completos.

As referências visuais por secção, o catálogo detalhado de serviços e o logótipo oficial serão incorporados quando forem fornecidos ou validados.
