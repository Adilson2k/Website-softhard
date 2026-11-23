export const pageRoutes = [
  "/",
  "/sobre",
  "/servicos",
  "/servicos/estrategia-digital",
  "/servicos/marketing-corporativo",
  "/servicos/conteudo-e-criatividade",
  "/servicos/solucoes-tecnologicas",
  "/produtos",
  "/portfolio",
  "/portfolio/acqua-eta",
  "/portfolio/visita-de-campo",
  "/portfolio/corrida-odebrecht",
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
      "Conheça a Softhard, empresa angolana de marketing corporativo e estratégia digital.",
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
  "/servicos/estrategia-digital": {
    title: "Estratégia digital | Serviços Softhard",
    description:
      "Planeamento digital orientado por objectivos, canais e públicos para organizações em Angola.",
  },
  "/servicos/marketing-corporativo": {
    title: "Marketing corporativo | Serviços Softhard",
    description:
      "Posicionamento, mensagens e comunicação integrada para reforçar a presença das organizações.",
  },
  "/servicos/conteudo-e-criatividade": {
    title: "Conteúdo e criatividade | Serviços Softhard",
    description:
      "Conceitos criativos e conteúdos alinhados com a estratégia, identidade e públicos de cada marca.",
  },
  "/servicos/solucoes-tecnologicas": {
    title: "Soluções tecnológicas | Serviços Softhard",
    description:
      "Soluções digitais pensadas para as necessidades e experiências das organizações.",
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
  "/portfolio/acqua-eta": {
    title: "Acqua ETA | Portfólio Softhard",
    description:
      "Registo visual de uma equipa de profissionais junto à instalação da ETA Sudeste.",
  },
  "/portfolio/visita-de-campo": {
    title: "Visita de campo | Portfólio Softhard",
    description:
      "Profissionais numa visita de campo a uma instalação industrial.",
  },
  "/portfolio/corrida-odebrecht": {
    title: "Corrida Odebrecht | Portfólio Softhard",
    description:
      "Registo de participantes junto ao arco de partida da corrida Odebrecht.",
  },
  "/noticias": {
    title: "Blogue | Softhard Angola",
    description:
      "Leia as perspectivas da Softhard sobre marketing corporativo, estratégia digital e experiências de marca.",
  },
  "/carreiras": {
    title: "Carreiras | Softhard Angola",
    description:
      "Conheça as áreas profissionais da Softhard e envie uma candidatura espontânea.",
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
