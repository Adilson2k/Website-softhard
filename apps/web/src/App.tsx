import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Menu,
  MoveHorizontal,
  Newspaper,
  Pause,
  Package,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentPages, {
  LeadCaptureForm,
  NotFoundPage,
  portfolioItems,
  ProductSpotlight,
  ServiceCards,
} from "./ContentPages";
import {
  normalizePageRoute,
  notFoundRoute,
  getPageMetadata,
  isBlogPostRoute,
  pageRoutes,
  type AppRoute,
  type PageRoute,
} from "./routes";

const navigation = [
  { label: "Sobre nós", href: "/sobre/" },
  { label: "Serviços", href: "/servicos/" },
  { label: "Produtos", href: "/produtos/" },
  { label: "Portfólio", href: "/portfolio/" },
  { label: "Blogue", href: "/noticias/" },
  { label: "Carreiras", href: "/carreiras/" },
];

const highlights = [
  {
    number: "01",
    title: "Serviços",
    description:
      "Marketing corporativo e estratégia digital para aproximar marcas, pessoas e organizações.",
    href: "/servicos/",
    icon: Cpu,
  },
  {
    number: "02",
    title: "Produtos",
    description:
      "Conheça o OPS e os produtos relacionados com Marketing da Softhard.",
    href: "/produtos/",
    icon: Package,
  },
  {
    number: "03",
    title: "Portfólio",
    description:
      "Conheça alguns trabalhos e experiências realizados pela Softhard.",
    href: "/portfolio/",
    icon: ArrowUpRight,
  },
];

const heroSlides = [
  {
    image: "/softhard-field.jpg",
    eyebrow: "Marketing corporativo e estratégia digital",
    title: "Estratégia que aproxima",
    highlight: "marcas e pessoas.",
    description:
      "Ajudamos organizações a alinhar a sua comunicação, presença digital e objectivos de negócio.",
    action: "Conheça os nossos serviços",
    href: "/servicos/",
  },
  {
    image: "/acqua-eta.jpg",
    eyebrow: "Soluções pensadas para o impacto",
    title: "Ideias que ganham",
    highlight: "vida no terreno.",
    description:
      "Conheça projectos e experiências que fazem parte do portefólio da Softhard.",
    action: "Explorar o portfólio",
    href: "/portfolio/",
  },
  {
    image: "/odebrecht-corrida.jpg",
    eyebrow: "Criatividade, comunicação e experiência",
    title: "Cada marca tem",
    highlight: "uma história.",
    description:
      "Criamos ligações entre organizações, comunidades e as pessoas que lhes dão vida.",
    action: "Fale connosco",
    href: "/contactos/",
  },
];

const clientLogos = [
  { name: "NP Gandour Angola", image: "/NP_Gandoor.png" },
  { name: "Refriango", image: "/refriango.jpg" },
  { name: "Chef's Borges", image: "/Chefes-borges.jpg" },
  { name: "Restaurante Ceano", image: "/ceano.jpg" },
  { name: "Royal", image: "/Royal.jpeg", imageClass: "client-logo-image-royal" },
  { name: "Torinho Eventos", image: "/ju-torinho.jpeg" },
  { name: "Delicate Angola", image: "/delicate.jpeg" },
  { name: "Restaurante Moquecas", image: "/moquecas.jpg" },
];

function App({ initialPath }: { initialPath?: string } = {}) {
  const [pathname, setPathname] = useState<AppRoute>(() =>
    normalizePageRoute(
      initialPath ??
        (typeof window === "undefined" ? "/" : window.location.pathname),
    ),
  );
  const isHome = pathname === "/";
  const isNotFound = pathname === notFoundRoute;
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const portfolioTrackRef = useRef<HTMLDivElement>(null);
  const portfolioDragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const suppressPortfolioClickRef = useRef(false);
  const hasMountedRef = useRef(false);
  const activeHeroSlide = heroSlides[heroSlideIndex];

  useEffect(() => {
    if (
      !isHome ||
      heroPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroSlideIndex((index) => (index + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [heroPaused, isHome]);

  useEffect(() => {
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePageRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.title = metadata.title;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) description.content = metadata.description;
    const robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    if (robots) {
      robots.content = isNotFound ? "noindex, follow" : "index, follow, max-image-preview:large";
    }

    if (hasMountedRef.current) {
      document
        .querySelector<HTMLElement>("#conteudo h1")
        ?.focus({ preventScroll: true });
    } else {
      hasMountedRef.current = true;
    }
  }, [isNotFound, pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleInternalNavigation(event: ReactMouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>("a[href]");
    if (
      !link ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    if (destination.hash && destination.pathname === window.location.pathname) {
      return;
    }

    const destinationPath = destination.pathname.replace(/\/+$/, "") || "/";
    if (!pageRoutes.includes(destinationPath as PageRoute) && !isBlogPostRoute(destinationPath)) return;
    const nextPath = normalizePageRoute(destinationPath);

    event.preventDefault();
    const urlPath =
      nextPath === "/" ? "/" : `${nextPath}/${destination.search}${destination.hash}`;
    window.history.pushState({}, "", urlPath);
    const viewTransitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };
    if (viewTransitionDocument.startViewTransition) {
      viewTransitionDocument.startViewTransition(() => setPathname(nextPath));
    } else {
      setPathname(nextPath);
    }
    setMenuOpen(false);

    if (destination.hash) {
      window.setTimeout(() => {
        document
          .getElementById(destination.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function updatePortfolioIndex() {
    const track = portfolioTrackRef.current;
    if (!track) return;

    const trackLeft = track.getBoundingClientRect().left;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-portfolio-card]"),
    );
    const activeIndex = cards.reduce(
      (closestIndex, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        return distance < closestIndex.distance
          ? { index, distance }
          : closestIndex;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;

    setPortfolioIndex(activeIndex);
  }

  function scrollToPortfolioItem(index: number) {
    const card = portfolioTrackRef.current?.querySelectorAll<HTMLElement>(
      "[data-portfolio-card]",
    )[index];
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function scrollPortfolio(direction: -1 | 1) {
    const track = portfolioTrackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-portfolio-card]");
    if (!track || !card) return;

    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 16),
      behavior: "smooth",
    });
  }

  function handlePortfolioPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = portfolioTrackRef.current;
    if (!track) return;

    portfolioDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  }

  function handlePortfolioPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = portfolioDragRef.current;
    const track = portfolioTrackRef.current;
    if (!track || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 5) drag.moved = true;
    if (drag.moved) track.scrollLeft = drag.startScrollLeft - delta;
  }

  function handlePortfolioPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = portfolioDragRef.current;
    const track = portfolioTrackRef.current;
    if (!track || drag.pointerId !== event.pointerId) return;

    suppressPortfolioClickRef.current = drag.moved;
    portfolioDragRef.current.pointerId = -1;
    track.classList.remove("is-dragging");

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    window.setTimeout(() => {
      suppressPortfolioClickRef.current = false;
    }, 0);
  }

  function handlePortfolioClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressPortfolioClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressPortfolioClickRef.current = false;
  }

  return (
    <div className="app-shell" onClick={handleInternalNavigation}>
      <svg
        aria-hidden="true"
        className="logo-filter-defs"
        focusable="false"
        width="0"
        height="0"
      >
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            id="logo-black-to-transparent"
          >
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                1 1 1 0 0"
            />
          </filter>
        </defs>
      </svg>
      <a className="skip-link" href="#conteudo">
        Saltar para o conteúdo
      </a>
      <header className="site-header">
        <nav
          aria-label="Navegação principal"
          className="site-nav page-shell"
        >
          <a
            aria-label="Softhard — página inicial"
            className="brand-lockup"
            href="/"
            onClick={closeMenu}
          >
            <img alt="" className="brand-logo" src="/logo-softhard.png" />
            <span className="brand-tagline">
              MARKETING CORPORATIVO &amp; ESTRATÉGIA DIGITAL
            </span>
          </a>

          <button
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <div
            className={`nav-content${menuOpen ? " nav-content-open" : ""}`}
            id="primary-navigation"
          >
            <ul className="nav-links">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    aria-current={
                      pathname === normalizePageRoute(item.href) ||
                      pathname.startsWith(
                        `${normalizePageRoute(item.href)}/`,
                      )
                        ? "page"
                        : undefined
                    }
                    href={item.href}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <Button asChild className="brand-button nav-cta" size="sm">
              <a href="/contactos/" onClick={closeMenu}>
                Pedir orçamento <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main id="conteudo" tabIndex={-1}>
        {isNotFound ? (
          <NotFoundPage />
        ) : isHome ? (
          <>
        <section
          aria-labelledby="hero-title"
          className="hero-section"
          id="inicio"
        >
          <div aria-hidden="true" className="hero-slides">
            {heroSlides.map((slide, index) => (
              <img
                alt=""
                className={
                  index === heroSlideIndex
                    ? "hero-background hero-background-active"
                    : "hero-background"
                }
                decoding="async"
                draggable={false}
                fetchPriority={index === 0 ? "high" : "auto"}
                key={slide.image}
                loading="eager"
                src={slide.image}
              />
            ))}
          </div>
          <div className="hero-content page-shell">
            <div className="hero-copy hero-copy-enter" key={activeHeroSlide.image}>
              <p className="eyebrow">
                <span className="eyebrow-mark" />
                {activeHeroSlide.eyebrow}
              </p>
              <h1 id="hero-title" tabIndex={-1}>
                {activeHeroSlide.title}{" "}
                <span>{activeHeroSlide.highlight}</span>
              </h1>
              <p className="hero-description">
                {activeHeroSlide.description}
              </p>
              <div className="hero-actions">
                <Button asChild className="brand-button" size="lg">
                  <a href={activeHeroSlide.href}>
                    {activeHeroSlide.action}{" "}
                    <ArrowRight aria-hidden="true" size={18} />
                  </a>
                </Button>
                <a className="text-link" href="/sobre/">
                  Sobre a Softhard{" "}
                  <ArrowDown aria-hidden="true" size={16} />
                </a>
              </div>
              <p className="hero-note">
                Marketing corporativo <span>·</span> Estratégia digital{" "}
                <span>·</span> Inovação
              </p>
            </div>
            <div className="hero-meta">
              <div aria-hidden="true" className="hero-location">
                <span>SOFTHARD</span>
                <span className="hero-meta-divider" />
                <span>LUANDA, ANGOLA</span>
              </div>
              <div className="hero-carousel-controls">
                <div
                  aria-label="Escolher imagem do banner"
                  className="hero-carousel-pagination"
                  role="group"
                >
                  {heroSlides.map((slide, index) => (
                    <button
                      aria-label={`Mostrar imagem ${index + 1} de ${heroSlides.length}`}
                      aria-pressed={heroSlideIndex === index}
                      className={
                        heroSlideIndex === index
                          ? "hero-carousel-dot hero-carousel-dot-active"
                          : "hero-carousel-dot"
                      }
                      key={slide.image}
                      onClick={() => {
                        setHeroSlideIndex(index);
                        setHeroPaused(true);
                      }}
                      type="button"
                    />
                  ))}
                </div>
                <button
                  aria-label={
                    heroPaused
                      ? "Retomar rotação do banner"
                      : "Pausar rotação do banner"
                  }
                  aria-pressed={heroPaused}
                  className="hero-carousel-toggle"
                  onClick={() => setHeroPaused((paused) => !paused)}
                  type="button"
                >
                  {heroPaused ? (
                    <Play aria-hidden="true" size={16} />
                  ) : (
                    <Pause aria-hidden="true" size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Áreas em destaque" className="highlights-section">
          <div className="page-shell highlights-grid">
            {highlights.map(
              ({ number, title, description, href, icon: Icon }) => (
                <a
                  className="highlight-card"
                  data-reveal
                  href={href}
                  key={number}
                >
                  <div className="highlight-topline">
                    <span>{number}</span>
                    <Icon aria-hidden="true" size={20} strokeWidth={1.7} />
                  </div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                  <span aria-hidden="true" className="highlight-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </a>
              ),
            )}
          </div>
        </section>

        <section
          aria-labelledby="about-title"
          className="about-section page-shell section-space"
          id="sobre"
        >
          <div className="section-kicker">
            <span>01</span> / QUEM SOMOS
          </div>
          <div className="about-grid" data-reveal>
            <h2 className="section-heading" id="about-title">
              Marketing corporativo e estratégia digital com{" "}
              <span>propósito.</span>
            </h2>
            <div className="about-copy">
              <p>
                A Softhard é uma empresa angolana de marketing corporativo e
                estratégia digital. Conheça a nossa abordagem, os serviços, os
                produtos e os trabalhos que apresentamos.
              </p>
              <a className="text-link" href="/sobre/">
                Saiba mais sobre a Softhard{" "}
                <ArrowRight aria-hidden="true" size={17} />
              </a>
            </div>
          </div>
          <div className="about-showcase" data-reveal>
            <img
              alt="Profissionais numa visita de campo a uma instalação industrial"
              decoding="async"
              loading="lazy"
              src="/softhard-field.jpg"
            />
            <div className="about-showcase-copy">
              <p className="section-kicker">SOFTHARD / ANGOLA</p>
              <h3>Da estratégia à experiência no terreno.</h3>
              <p>
                Aproximamos estratégia, comunicação e tecnologia para apoiar
                marcas e organizações no contexto angolano.
              </p>
              <a className="text-link" href="/sobre/">
                Conheça a nossa abordagem{" "}
                <ArrowRight aria-hidden="true" size={17} />
              </a>
            </div>
          </div>
          <div className="about-ribbon">
            <span>Marketing corporativo</span>
            <span aria-hidden="true" />
            <span>Estratégia digital</span>
            <span aria-hidden="true" />
            <span>Ideias que avançam</span>
          </div>
        </section>

        <section
          aria-labelledby="clients-title"
          className="clients-section"
        >
          <div className="page-shell clients-heading" data-reveal>
            <p className="section-kicker">CLIENTES / PARCERIAS</p>
            <h2 className="section-heading" id="clients-title">
              Marcas que confiam <span>no nosso trabalho.</span>
            </h2>
          </div>
          <div
            aria-label="Logótipos dos clientes e parceiros da Softhard"
            className="client-marquee"
            role="region"
            tabIndex={0}
          >
            <div className="client-logo-track">
              {[false, true].map((isDuplicate) => (
                <ul
                  aria-hidden={isDuplicate}
                  className={`client-logo-group${isDuplicate ? " client-logo-group-duplicate" : ""}`}
                  key={isDuplicate ? "duplicate" : "original"}
                >
                  {clientLogos.map((logo) => (
                    <li className="client-logo-card" key={logo.name}>
                      <img
                        alt={isDuplicate ? "" : logo.name}
                        className={`client-logo-image${logo.imageClass ? ` ${logo.imageClass}` : ""}`}
                        decoding="async"
                        loading="lazy"
                        src={logo.image}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="services-title"
          className="services-section section-space"
          id="servicos"
        >
          <div className="page-shell">
            <div className="section-kicker section-kicker-light">
              <span>02</span> / O QUE FAZEMOS
            </div>
            <div className="services-heading-row">
              <div>
                <h2 className="section-heading" id="services-title">
                  Estratégia com propósito.{" "}
                  <span>Comunicação que aproxima.</span>
                </h2>
                <p className="section-intro">
                  Combinamos marketing, estratégia digital e tecnologia para
                  responder aos desafios das organizações.
                </p>
              </div>
              <a className="text-link text-link-light" href="/servicos/">
                Ver todos os serviços{" "}
                <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </div>
            <ServiceCards
              actionLabel="Saber mais"
              limit={3}
            />
          </div>
        </section>

        <section
          aria-labelledby="products-title"
          className="products-section page-shell section-space"
          id="produtos"
        >
          <div className="section-kicker">
            <span>03</span> / PRODUTOS
          </div>
          <div className="products-intro">
            <h2 className="section-heading" id="products-title">
              Tecnologia com <span>identidade Softhard.</span>
            </h2>
            <p className="section-intro">
              Conheça os produtos tecnológicos e as soluções relacionadas com
              Marketing que integram o nosso portefólio.
            </p>
          </div>
          <ProductSpotlight
            actionLabel="Explorar o OPS"
            href="/produtos/"
          />
        </section>

        <section
          aria-labelledby="portfolio-title"
          className="portfolio-section section-space"
          id="portfolio"
        >
          <div className="page-shell portfolio-inner">
            <div className="section-kicker">
              <span>04</span> / PORTFÓLIO
            </div>
            <div className="portfolio-heading">
              <div>
                <h2 className="section-heading" id="portfolio-title">
                  Experiências que mostram o que é <span>possível.</span>
                </h2>
                <p className="section-intro">
                  Uma selecção de trabalhos e experiências realizados pela
                  Softhard.
                </p>
              </div>
              <span className="portfolio-drag-hint">
                <MoveHorizontal aria-hidden="true" size={17} />
                Arraste para explorar
              </span>
            </div>
          </div>
          <div
            aria-label="Portfólio Softhard. Use as setas do teclado ou arraste para percorrer."
            aria-roledescription="carrossel"
            className="portfolio-track"
            onClickCapture={handlePortfolioClickCapture}
            onPointerCancel={handlePortfolioPointerUp}
            onPointerDown={handlePortfolioPointerDown}
            onPointerMove={handlePortfolioPointerMove}
            onPointerUp={handlePortfolioPointerUp}
            onScroll={updatePortfolioIndex}
            ref={portfolioTrackRef}
            role="region"
            tabIndex={0}
          >
            {portfolioItems.map((item, index) => (
              <figure
                className="portfolio-card"
                data-portfolio-card
                key={item.title}
              >
                <img
                  alt={item.alt}
                  className="portfolio-image"
                  decoding="async"
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                  onDragStart={(event) => event.preventDefault()}
                  src={item.image}
                />
                <figcaption className="portfolio-caption">
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <a
                    aria-label={`Ver projecto ${item.title}`}
                    href={`/portfolio/${item.slug}/`}
                  >
                    <ArrowUpRight aria-hidden="true" size={24} />
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="page-shell portfolio-controls">
            <p className="portfolio-count">
              {String(portfolioIndex + 1).padStart(2, "0")} /{" "}
              {String(portfolioItems.length).padStart(2, "0")}
            </p>
            <div className="portfolio-control-group">
              <div aria-label="Escolher trabalho" className="portfolio-pagination">
                {portfolioItems.map((item, index) => (
                  <button
                    aria-label={`Ver ${item.title}`}
                    aria-pressed={portfolioIndex === index}
                    className={
                      portfolioIndex === index
                        ? "portfolio-dot portfolio-dot-active"
                        : "portfolio-dot"
                    }
                    key={item.title}
                    onClick={() => scrollToPortfolioItem(index)}
                    type="button"
                  />
                ))}
              </div>
              <div className="portfolio-arrows">
                <button
                  aria-label="Trabalho anterior"
                  disabled={portfolioIndex === 0}
                  onClick={() => scrollPortfolio(-1)}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" size={19} />
                </button>
                <button
                  aria-label="Próximo trabalho"
                  disabled={portfolioIndex === portfolioItems.length - 1}
                  onClick={() => scrollPortfolio(1)}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" size={19} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="news-title"
          className="news-section page-shell section-space"
          id="noticias"
        >
          <div className="section-kicker">
            <span>05</span> / NOVIDADES
          </div>
          <div className="news-content">
            <div className="news-icon">
              <Newspaper aria-hidden="true" size={26} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="section-heading" id="news-title">
                Ideias, eventos e novidades <span>da Softhard.</span>
              </h2>
              <p className="section-intro">
                Acompanhe eventos, actividades e temas relevantes para a
                comunidade Softhard.
              </p>
            </div>
          </div>
          <article className="home-news-highlight" data-reveal>
            <img
              alt="Participantes reunidos num evento desportivo em Angola"
              decoding="async"
              loading="lazy"
              src="/odebrecht-corrida.jpg"
            />
            <div>
              <p className="section-kicker">ACTIVIDADES EM DESTAQUE</p>
              <h3>Ideias que também ganham vida em comunidade.</h3>
              <p>
                Veja registos de eventos e actividades apresentados pela
                Softhard.
              </p>
            </div>
            <a href="/noticias/">
              Ver novidades <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </article>
        </section>

        <section
          aria-labelledby="careers-title"
          className="careers-section page-shell"
          id="carreiras"
        >
          <div className="careers-panel">
            <div className="careers-icon">
              <BriefcaseBusiness
                aria-hidden="true"
                size={27}
                strokeWidth={1.5}
              />
            </div>
            <div className="careers-copy">
              <p className="section-kicker">CARREIRAS</p>
              <h2 id="careers-title">
                O seu talento também pode fazer parte desta história.
              </h2>
              <p>
                Consulte oportunidades profissionais e saiba como apresentar
                uma candidatura espont?nea.
              </p>
            </div>
            <a className="careers-link" href="/carreiras/">
              Saiba mais <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </div>
        </section>

        <section
          aria-labelledby="contact-title"
          className="contact-section page-shell section-space"
          id="contactos"
        >
          <div className="contact-panel">
            <div className="section-kicker section-kicker-light">
              <span>06</span> / CONTACTOS
            </div>
            <div className="contact-layout">
              <div>
                <h2 id="contact-title">
                  Conte-nos sobre a sua <span>próxima ideia.</span>
                </h2>
                <p>
                  Partilhe o seu desafio. A equipa Softhard irá conhecer o seu
                  contexto e o que pretende alcançar.
                </p>
              </div>
              <LeadCaptureForm />
            </div>
            <span aria-hidden="true" className="contact-decoration">
              SOFTHARD
            </span>
          </div>
        </section>
          </>
        ) : (
          <ContentPages route={pathname} />
        )}
      </main>

      <footer className="site-footer">
        <div className="page-shell footer-content">
          <a
            aria-label="Softhard — página inicial"
            className="footer-brand"
            href="/"
          >
            <img alt="" className="brand-logo" src="/logo-softhard.png" />
            <span className="brand-tagline">
              MARKETING CORPORATIVO &amp; ESTRATÉGIA DIGITAL
            </span>
          </a>
          <p>
            © {new Date().getFullYear()} Softhard. Todos os direitos reservados.
          </p>
          {isHome ? (
            <a className="back-to-top" href="#inicio">
              Voltar ao topo <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          ) : (
            <a className="back-to-top" href="/">
              Página inicial <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;
