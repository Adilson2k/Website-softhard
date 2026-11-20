export const pageRoutes = [
  "/",
  "/sobre",
  "/servicos",
  "/produtos",
  "/portfolio",
  "/noticias",
  "/carreiras",
  "/contactos",
] as const;

export type PageRoute = (typeof pageRoutes)[number];
export const notFoundRoute = "/404" as const;
export type AppRoute = PageRoute | typeof notFoundRoute;

export const pageMetadata: Record<
  AppRoute,
  { title: string; description: string }
> = {
  "/": {
    title: "Softhard | Marketing corporativo e estratégia digital em Angola",
    description:
      "Conheça a Softhard: marketing corporativo, estratégia digital, soluções, produtos e trabalhos em destaque em Angola.",
  },
  "/sobre": {
    title: "Sobre nós | Softhard Angola",
    description:
      "Conheça a Softhard, empresa angolana de marketing corporativo e estratégia digital.",
  },
  "/servicos": {
    title: "Serviços | Softhard Angola",
    description:
      "Explore os serviços de marketing corporativo, estratégia digital, comunicação e tecnologia da Softhard.",
  },
  "/produtos": {
    title: "Produtos | Softhard Angola",
    description:
      "Conheça os produtos Softhard, incluindo OPS e soluções relacionadas com Marketing.",
  },
  "/portfolio": {
    title: "Portfólio | Softhard Angola",
    description:
      "Veja uma selecção de trabalhos, projectos e actividades apresentados pela Softhard.",
  },
  "/noticias": {
    title: "Blogue | Softhard Angola",
    description:
      "Leia as perspectivas da Softhard sobre marketing corporativo, estratégia digital e experiências de marca.",
  },
  "/carreiras": {
    title: "Carreiras | Softhard Angola",
    description:
      "Descubra como entrar em contacto com a Softhard para oportunidades e candidaturas.",
  },
  "/contactos": {
    title: "Contactos | Softhard Angola",
    description:
      "Entre em contacto com a equipa Softhard em Luanda para falar sobre serviços, produtos e projectos.",
  },
  [notFoundRoute]: {
    title: "404 | Página não encontrada | Softhard",
    description:
      "A página que procura não foi encontrada. Volte à página inicial da Softhard ou explore o nosso portfólio.",
  },
};

export function normalizePageRoute(pathname: string): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return pageRoutes.includes(normalizedPath as PageRoute)
    ? (normalizedPath as PageRoute)
    : notFoundRoute;
}
