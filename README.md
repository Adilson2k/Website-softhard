# Website institucional

Monorepo npm com aplicações independentes:

- `apps/web`: React, Vite, TypeScript, Tailwind CSS v4 e componentes compatíveis com shadcn/ui.
- `apps/api`: Express e TypeScript.

## Requisitos

- Node.js LTS
- npm (incluído com Node.js LTS)

## Instalar e iniciar

Execute na raiz do projeto:

```powershell
npm install
npm run dev
```

O frontend inicia em `http://localhost:5173` e a API em `http://localhost:3001`. O script `npm run dev` inicia os dois processos; também é possível iniciar cada aplicação separadamente com `npm run dev:web` e `npm run dev:api`.

## shadcn/ui

O frontend já tem Tailwind CSS v4, aliases `@/` e `components.json` configurados. O botão inicial está em `apps/web/src/components/ui/button.tsx`. Para adicionar outros componentes:

```powershell
Push-Location apps\web
npx shadcn@latest add card
Pop-Location
```

## API

- `GET /api/health`: verifica se a API está ativa.
- Porta configurável com `PORT` (padrão `3001`).
- `CORS_ORIGIN` define a origem permitida (padrão `http://localhost:5173`).
- `VITE_API_URL` no frontend define a URL base da API (padrão `http://localhost:3001`); use `apps/web/.env.example` como referência.

## Build

```powershell
npm run build
```

O build gera HTML pré-renderizado para a página inicial, as páginas institucionais e a página `404.html` em `apps/web/dist/`, além dos assets de produção.

## SEO

- Conteúdo principal pré-renderizado em cada rota (`/sobre`, `/servicos`, `/produtos`, `/portfolio`, `/noticias`, `/carreiras` e `/contactos`) para indexação sem depender da execução inicial do JavaScript.
- O Portfólio apresenta os trabalhos numa galeria horizontal acessível por arrasto, toque, teclado e controlos; o Blogue em `/noticias` permite filtrar e expandir artigos por tema.
- A página `404.html` apresenta o erro para endereços desconhecidos e usa `noindex` para evitar que seja indexada como conteúdo.
- Título, descrição, Open Graph, Twitter Cards, dados estruturados `Organization`, hierarquia semântica e `robots.txt`.
- Idioma definido como português de Angola (`pt-AO`); contactos empresariais e Instagram incluídos nos dados estruturados.
- O domínio oficial ainda é necessário para configurar URL canónica, sitemap e dados estruturados completos.

As referências visuais por secção, o catálogo detalhado de serviços e o logótipo oficial serão incorporados quando forem fornecidos ou validados.
