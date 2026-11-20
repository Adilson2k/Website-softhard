import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Lightbulb,
  Megaphone,
  MoveHorizontal,
  Package,
} from "lucide-react";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { PageRoute } from "./routes";

const portfolioItems = [
  {
    title: "Acqua ETA",
    category: "Projecto em destaque",
    image: "/acqua-eta.jpg",
    alt: "Equipa de profissionais junto à instalação da ETA Sudeste",
  },
  {
    title: "Visita de campo",
    category: "Tecnologia no terreno",
    image: "/softhard-field.jpg",
    alt: "Profissionais numa visita de campo a uma instalação industrial",
  },
  {
    title: "Corrida Odebrecht",
    category: "Evento",
    image: "/odebrecht-corrida.jpg",
    alt: "Participantes junto ao arco de partida da corrida Odebrecht",
  },
];

export const serviceItems = [
  {
    category: "ESTRATÉGIA",
    title: "Estratégia digital",
    description:
      "Planeamento orientado por objectivos para aproximar marcas, pessoas e canais digitais.",
    image: "/softhard-field.jpg",
  },
  {
    category: "MARKETING",
    title: "Marketing corporativo",
    description:
      "Comunicação integrada para reforçar a presença, a mensagem e a reputação da sua organização.",
    image: "/odebrecht-corrida.jpg",
  },
  {
    category: "CRIATIVIDADE",
    title: "Conteúdo e criatividade",
    description:
      "Ideias e conteúdos consistentes com a identidade e os objectivos de cada marca.",
    image: "/acqua-eta.jpg",
  },
  {
    category: "TECNOLOGIA",
    title: "Soluções tecnológicas",
    description:
      "Ferramentas e experiências digitais pensadas para responder a necessidades reais.",
    image: "/softhard-field.jpg",
  },
];

const blogCategories = [
  "Todos",
  "Estratégia digital",
  "Marketing corporativo",
  "Experiências",
] as const;

const blogPosts = [
  {
    category: "Estratégia digital",
    title: "A estratégia digital começa antes da escolha dos canais",
    excerpt:
      "Mais do que estar presente em várias plataformas, importa saber o que a organização pretende alcançar.",
    image: "/softhard-field.jpg",
    imageAlt: "Profissionais numa visita de campo a uma instalação industrial",
    paragraphs: [
      "Uma estratégia digital útil começa com objectivos claros, conhecimento das pessoas a quem queremos chegar e uma compreensão realista dos recursos disponíveis.",
      "Com essas bases, a escolha de canais e formatos deixa de ser uma tendência a seguir e passa a ser uma decisão ligada às prioridades da organização.",
    ],
  },
  {
    category: "Marketing corporativo",
    title: "Comunicação consistente constrói confiança",
    excerpt:
      "Cada ponto de contacto contribui para a forma como as pessoas percebem uma organização.",
    image: "/acqua-eta.jpg",
    imageAlt: "Equipa de profissionais junto à instalação da ETA Sudeste",
    paragraphs: [
      "Mensagens, identidade e comportamento comunicam em conjunto. Quando são coerentes, ajudam colaboradores, clientes e parceiros a compreender o que a organização representa.",
      "Essa consistência não significa repetir as mesmas palavras em todo o lado: significa manter uma intenção reconhecível, adaptando a linguagem a cada contexto.",
    ],
  },
  {
    category: "Experiências",
    title: "Uma experiência de marca prolonga-se para lá do evento",
    excerpt:
      "O que as pessoas sentem, recordam e partilham também faz parte da experiência.",
    image: "/odebrecht-corrida.jpg",
    imageAlt: "Participantes junto ao arco de partida da corrida Odebrecht",
    paragraphs: [
      "Uma activação ou evento é um momento dentro de uma relação maior. A preparação, a participação e a comunicação posterior influenciam a forma como esse momento é vivido.",
      "Pensar a experiência como um percurso ajuda a criar ligações mais relevantes entre organizações, comunidades e pessoas.",
    ],
  },
];

function PageIntro({
  eyebrow,
  title,
  highlight,
  description,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
}) {
  return (
    <section aria-labelledby="page-title" className="page-intro">
      <div className="page-shell page-intro-content" data-reveal>
        <p className="eyebrow">
          <span className="eyebrow-mark" />
          {eyebrow}
        </p>
        <h1 id="page-title" tabIndex={-1}>
          {title} <span>{highlight}</span>
        </h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

function PageLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="brand-button inner-page-button" href={href}>
      {children}
      <ArrowRight aria-hidden="true" size={17} />
    </a>
  );
}

export function ServiceCards({
  limit,
  actionHref,
  actionLabel,
}: {
  limit?: number;
  actionHref: string;
  actionLabel: string;
}) {
  const items = serviceItems.slice(0, limit ?? serviceItems.length);

  return (
    <div
      className={`service-cards${limit === undefined ? " service-cards-all" : ""}`}
    >
      {items.map(({ category, title, description, image }, index) => (
        <article className="service-card" data-reveal key={title}>
          <img
            alt=""
            aria-hidden="true"
            className="service-card-image"
            decoding="async"
            loading="lazy"
            src={image}
          />
          <div className="service-card-content">
            <span className="service-card-index">
              0{index + 1} / {category}
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={actionHref}>
              {actionLabel} <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="Sobre a Softhard"
        title="Estratégia que dá"
        highlight="forma às ideias."
        description="Somos uma empresa angolana de marketing corporativo e estratégia digital. Ajudamos organizações a pensar, comunicar e evoluir num mundo cada vez mais digital."
      />
      <section className="page-shell inner-section inner-story">
        <div className="inner-story-copy" data-reveal>
          <p className="section-kicker">
            <span>01</span> / QUEM SOMOS
          </p>
          <h2 className="section-heading">
            Pensamento estratégico. <span>Acção com propósito.</span>
          </h2>
          <p className="section-intro">
            A Softhard combina marketing corporativo, estratégia digital e
            tecnologia para criar soluções relevantes para os desafios das
            organizações. Trabalhamos a partir do contexto de cada projecto,
            com clareza nos objectivos e atenção à experiência das pessoas.
          </p>
        </div>
        <div className="inner-story-visual" data-reveal>
          <img
            alt="Equipa reunida numa visita técnica em Angola"
            decoding="async"
            loading="lazy"
            src="/softhard-field.jpg"
          />
          <span>Ideias que avançam, em conjunto.</span>
        </div>
      </section>
      <section className="inner-values-section">
        <div className="page-shell">
          <div className="inner-section-heading" data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>02</span> / COMO PENSAMOS
            </p>
            <h2 className="section-heading">
              A nossa forma de <span>fazer acontecer.</span>
            </h2>
          </div>
          <div className="inner-values-grid">
            {[
              {
                icon: Compass,
                title: "Direcção",
                text: "Começamos por compreender o contexto e definir o que importa.",
              },
              {
                icon: Lightbulb,
                title: "Criatividade",
                text: "Transformamos desafios em ideias claras e experiências relevantes.",
              },
              {
                icon: Cpu,
                title: "Evolução",
                text: "Usamos canais e ferramentas digitais para aproximar marcas e pessoas.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <article className="inner-value-card" data-reveal key={title}>
                <span className="inner-card-number">
                  0{index + 1} / SOFTHARD
                </span>
                <Icon aria-hidden="true" size={26} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell inner-cta-band" data-reveal>
        <div>
          <p className="section-kicker">VAMOS CONVERSAR</p>
          <h2>O próximo capítulo começa com uma conversa.</h2>
        </div>
        <PageLink href="/contactos/">Fale com a nossa equipa</PageLink>
      </section>
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Serviços"
        title="Marcas fortes começam"
        highlight="com uma boa estratégia."
        description="Aproximamos estratégia, comunicação e tecnologia para ajudar a sua organização a avançar com confiança."
      />
      <section className="services-section section-space dedicated-services-section">
        <div className="page-shell">
          <div className="inner-section-heading" data-reveal>
            <p className="section-kicker section-kicker-light">
            <span>01</span> / O QUE FAZEMOS
            </p>
            <h2 className="section-heading">
              Soluções pensadas para <span>os seus objectivos.</span>
            </h2>
            <p className="section-intro">
              Cada desafio é diferente. Combinamos as nossas áreas de actuação
              de acordo com o contexto, as pessoas e as ambições de cada
              organização.
            </p>
          </div>
          <ServiceCards
            actionHref="/contactos/"
            actionLabel="Vamos conversar"
          />
        </div>
      </section>
      <section className="inner-values-section service-process-section">
        <div className="page-shell">
          <div className="inner-section-heading" data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>02</span> / COMO TRABALHAMOS
            </p>
            <h2 className="section-heading">
              Da primeira pergunta <span>à próxima possibilidade.</span>
            </h2>
          </div>
          <div className="inner-values-grid">
            {[
              {
                title: "Compreender",
                text: "Conhecemos o contexto, as pessoas envolvidas e o desafio a resolver.",
              },
              {
                title: "Definir",
                text: "Alinhamos prioridades, mensagens e canais com os objectivos do projecto.",
              },
              {
                title: "Activar",
                text: "Pomos a estratégia em prática e acompanhamos a sua evolução.",
              },
            ].map(({ title, text }, index) => (
              <article className="inner-value-card" data-reveal key={title}>
                <span className="inner-card-number">
                  0{index + 1} / ABORDAGEM
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="inner-band">
        <div className="page-shell inner-band-layout" data-reveal>
          <h2>Estratégia, criatividade e tecnologia. Em sintonia.</h2>
          <PageLink href="/portfolio/">Veja o nosso portfólio</PageLink>
        </div>
      </section>
    </>
  );
}

function ProductsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Produtos Softhard"
        title="Ferramentas criadas"
        highlight="para fazer mais."
        description="Conheça os produtos Softhard e as soluções que fazem parte do nosso ecossistema."
      />
      <section className="page-shell inner-section">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>01</span> / PRODUTOS
          </p>
          <h2 className="section-heading">
            Soluções para <span>necessidades reais.</span>
          </h2>
          <p className="section-intro">
            Estamos a preparar mais informação sobre os produtos da Softhard.
            Entre em contacto para saber mais.
          </p>
        </div>
        <div className="inner-products-grid">
          {[
            {
              name: "OPS",
              text: "Produto Softhard",
              icon: Package,
            },
            {
              name: "Marketing",
              text: "Produtos e soluções relacionadas",
              icon: Megaphone,
            },
          ].map(({ name, text, icon: Icon }, index) => (
            <article className="inner-product-card" data-reveal key={name}>
              <div className="inner-product-top">
                <span>0{index + 1} / PRODUTO</span>
                <Icon aria-hidden="true" size={24} />
              </div>
              <h3>{name}</h3>
              <p>{text}</p>
              <a href="/contactos/">
                Pedir informações <ArrowUpRight aria-hidden="true" size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PortfolioPage() {
  const portfolioTrackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const [portfolioIndex, setPortfolioIndex] = useState(0);

  function updatePortfolioIndex() {
    const track = portfolioTrackRef.current;
    if (!track) return;

    const trackLeft = track.getBoundingClientRect().left;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-portfolio-page-card]"),
    );
    const activeIndex = cards.reduce(
      (closest, card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        return distance < closest.distance ? { index, distance } : closest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    ).index;

    setPortfolioIndex(activeIndex);
  }

  function scrollToPortfolioItem(index: number) {
    const track = portfolioTrackRef.current;
    const card = track?.querySelectorAll<HTMLElement>(
      "[data-portfolio-page-card]",
    )[index];
    if (!track || !card) return;

    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  function handlePortfolioPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
    };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  }

  function handlePortfolioPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    event.currentTarget.scrollLeft =
      drag.startScrollLeft - (event.clientX - drag.startX);
  }

  function handlePortfolioPointerUp(event: PointerEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    if (dragRef.current.pointerId !== event.pointerId) return;

    dragRef.current.pointerId = -1;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  }

  function handlePortfolioKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" && portfolioIndex > 0) {
      event.preventDefault();
      scrollToPortfolioItem(portfolioIndex - 1);
    } else if (
      event.key === "ArrowRight" &&
      portfolioIndex < portfolioItems.length - 1
    ) {
      event.preventDefault();
      scrollToPortfolioItem(portfolioIndex + 1);
    }
  }

  return (
    <>
      <PageIntro
        eyebrow="Portfólio"
        title="Experiências que"
        highlight="aproximam pessoas."
        description="Cada projecto é uma oportunidade para transformar estratégia em experiências memoráveis para marcas e comunidades."
      />
      <section className="portfolio-page-section">
        <div className="page-shell portfolio-page-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>01</span> / EXPERIÊNCIAS EM DESTAQUE
            </p>
            <h2 className="section-heading">
              Ideias que ganham <span>vida.</span>
            </h2>
            <p className="section-intro">
              Percorra alguns trabalhos e momentos do universo Softhard.
            </p>
          </div>
          <p className="portfolio-page-hint">
            <MoveHorizontal aria-hidden="true" size={18} />
            Arraste para explorar
          </p>
        </div>
        <div className="page-shell portfolio-page-controls">
          <p aria-live="polite" className="portfolio-page-count">
            {String(portfolioIndex + 1).padStart(2, "0")} /{" "}
            {String(portfolioItems.length).padStart(2, "0")}
          </p>
          <div className="portfolio-page-arrows">
            <button
              aria-label="Trabalho anterior"
              disabled={portfolioIndex === 0}
              onClick={() => scrollToPortfolioItem(portfolioIndex - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="Próximo trabalho"
              disabled={portfolioIndex === portfolioItems.length - 1}
              onClick={() => scrollToPortfolioItem(portfolioIndex + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
        <div
          aria-label="Portfólio Softhard. Use as setas do teclado ou arraste para percorrer."
          className="portfolio-page-track"
          onKeyDown={handlePortfolioKeyDown}
          onPointerCancel={handlePortfolioPointerUp}
          onPointerDown={handlePortfolioPointerDown}
          onPointerMove={handlePortfolioPointerMove}
          onPointerUp={handlePortfolioPointerUp}
          onScroll={updatePortfolioIndex}
          onDragStart={(event) => event.preventDefault()}
          ref={portfolioTrackRef}
          role="region"
          tabIndex={0}
        >
          {portfolioItems.map((item, index) => (
            <article
              className="portfolio-page-card"
              data-portfolio-page-card
              key={item.title}
            >
              <figure>
                <div className="portfolio-page-image">
                  <img
                    alt={item.alt}
                    decoding="async"
                    loading={index === 0 ? "eager" : "lazy"}
                    src={item.image}
                  />
                  <span className="portfolio-page-image-index">
                    0{index + 1}
                  </span>
                </div>
                <figcaption className="portfolio-page-caption">
                  <div>
                    <p className="section-kicker">{item.category}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <span>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(portfolioItems.length).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
        <div
          aria-label="Escolher trabalho"
          className="page-shell portfolio-page-pagination"
        >
          {portfolioItems.map((item, index) => (
            <button
              aria-label={`Ver ${item.title}`}
              aria-pressed={portfolioIndex === index}
              className={portfolioIndex === index ? "is-active" : ""}
              key={item.title}
              onClick={() => scrollToPortfolioItem(index)}
              type="button"
            />
          ))}
        </div>
      </section>
      <section className="inner-band">
        <div className="page-shell inner-band-layout" data-reveal>
          <h2>Tem uma experiência em mente?</h2>
          <PageLink href="/contactos/">Fale connosco</PageLink>
        </div>
      </section>
    </>
  );
}

function NewsPage() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof blogCategories)[number]>("Todos");
  const visiblePosts =
    activeCategory === "Todos"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  return (
    <>
      <section aria-labelledby="news-page-title" className="news-hero">
        <div className="page-shell news-hero-content" data-reveal>
          <p className="eyebrow">
            <span className="eyebrow-mark" />
            Blogue Softhard
          </p>
          <h1 id="news-page-title">
            Menos ruído.
            <br />
            <span>Mais ideias.</span>
          </h1>
          <p className="news-hero-description">
            Perspectivas sobre estratégia, comunicação e experiências que
            aproximam marcas e pessoas.
          </p>
          <a className="news-hero-link" href="#news-articles">
            Explorar artigos
            <ChevronDown aria-hidden="true" size={18} />
          </a>
          <p className="news-hero-meta">
            Estratégia digital · Marcas · Experiências
          </p>
        </div>
      </section>
      <section
        aria-labelledby="news-articles-title"
        className="page-shell inner-section blog-section"
        id="news-articles"
      >
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>01</span> / IDEIAS E PERSPECTIVAS
          </p>
          <h2 className="section-heading" id="news-articles-title">
            Conversas para <span>avançar.</span>
          </h2>
          <p className="section-intro">
            Leituras breves para pensar a comunicação, as marcas e a relação
            com as pessoas.
          </p>
        </div>
        <div
          aria-label="Filtrar artigos por tema"
          className="blog-filters"
          role="group"
        >
          {blogCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="blog-grid">
          {visiblePosts.map((post, index) => {
            const postNumber = String(index + 1).padStart(2, "0");
            return (
              <article
                className={`blog-card${
                  activeCategory === "Todos" && index === 0
                    ? " blog-card-featured"
                    : ""
                }`}
                key={post.title}
              >
                <div className="blog-card-art">
                  <img
                    alt={post.imageAlt}
                    decoding="async"
                    loading="lazy"
                    src={post.image}
                  />
                  <span aria-hidden="true" className="blog-card-image-index">
                    {postNumber}
                  </span>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <p className="section-kicker">{post.category}</p>
                    <span>Perspectiva {postNumber}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <details className="blog-article-details">
                    <summary>
                      Ler perspectiva
                      <ChevronDown aria-hidden="true" size={17} />
                    </summary>
                    <div className="blog-article-body">
                      {post.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="inner-band">
        <div className="page-shell inner-band-layout" data-reveal>
          <h2>Tem uma ideia para partilhar connosco?</h2>
          <PageLink href="/contactos/">Vamos conversar</PageLink>
        </div>
      </section>
    </>
  );
}

function CareersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Carreiras"
        title="Boas ideias começam"
        highlight="com pessoas."
        description="Conheça a forma como pensamos e apresente-se à equipa Softhard, mesmo que ainda não tenha encontrado a oportunidade certa."
      />
      <section className="inner-values-section">
        <div className="page-shell">
          <div className="inner-section-heading" data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>01</span> / O QUE VALORIZAMOS
            </p>
            <h2 className="section-heading">
              Pessoas curiosas. <span>Ideias com propósito.</span>
            </h2>
          </div>
          <div className="inner-values-grid">
            {[
              {
                title: "Curiosidade",
                text: "Vontade de aprender, fazer perguntas e compreender novos contextos.",
              },
              {
                title: "Iniciativa",
                text: "Disponibilidade para transformar desafios em propostas concretas.",
              },
              {
                title: "Colaboração",
                text: "Respeito por diferentes perspectivas e compromisso com o trabalho em equipa.",
              },
            ].map(({ title, text }, index) => (
              <article className="inner-value-card" data-reveal key={title}>
                <span className="inner-card-number">
                  0{index + 1} / SOFTHARD
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell inner-section inner-careers" data-reveal>
        <div>
          <p className="section-kicker">
            <span>02</span> / CANDIDATURA ESPONTÂNEA
          </p>
          <h2 className="section-heading">
            Vamos descobrir o que podemos <span>criar em conjunto.</span>
          </h2>
          <p className="section-intro">
            Envie uma breve apresentação, indique a área em que gostaria de
            colaborar e, se tiver, partilhe o seu portfólio.
          </p>
        </div>
        <PageLink href="mailto:softhard@dcinvestimentos.com?subject=Candidatura%20Softhard">
          Enviar candidatura
        </PageLink>
      </section>
    </>
  );
}

function ContactsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contactos"
        title="Vamos conversar"
        highlight="sobre a sua próxima ideia."
        description="Fale com a equipa Softhard sobre serviços, produtos, projectos ou oportunidades."
      />
      <section className="page-shell inner-section inner-contact">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>01</span> / FALE CONNOSCO
          </p>
          <h2 className="section-heading">
            Estamos prontos para <span>ouvir.</span>
          </h2>
          <p className="section-intro">
            Diga-nos o que pretende alcançar. A nossa equipa está disponível
            para conversar consigo.
          </p>
        </div>
        <address className="inner-contact-details" data-reveal>
          <a href="mailto:softhard@dcinvestimentos.com">
            <span>E-mail</span>
            softhard@dcinvestimentos.com
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <a href="tel:+244932799790">
            <span>Telefone</span>
            +244 932 799 790
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <a href="tel:+244956007537">
            <span>Telefone</span>
            +244 956 007 537
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <a
            href="https://www.instagram.com/softhard_ao/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>Instagram</span>
            @softhard_ao
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
          <p>
            <span>Morada</span>
            Av. Lenine, Maianga, Ingombotas, Angola
          </p>
        </address>
      </section>
    </>
  );
}

export default function ContentPages({ route }: { route: PageRoute }) {
  switch (route) {
    case "/sobre":
      return <AboutPage />;
    case "/servicos":
      return <ServicesPage />;
    case "/produtos":
      return <ProductsPage />;
    case "/portfolio":
      return <PortfolioPage />;
    case "/noticias":
      return <NewsPage />;
    case "/carreiras":
      return <CareersPage />;
    case "/contactos":
      return <ContactsPage />;
    default:
      return null;
  }
}

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="not-found-page"
    >
      <div className="page-shell not-found-layout">
        <div className="not-found-copy" data-reveal>
          <p className="section-kicker">
            <span>404</span> / PÁGINA NÃO ENCONTRADA
          </p>
          <h1 id="not-found-title" tabIndex={-1}>
            Este caminho não leva a <span>nenhuma página.</span>
          </h1>
          <p>
            O endereço pode estar errado ou a página já não existe. Vamos
            ajudar a encontrar o próximo passo.
          </p>
          <div className="not-found-actions">
            <PageLink href="/">Voltar à página inicial</PageLink>
            <a className="not-found-secondary" href="/portfolio/">
              Explorar o portfólio
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        <div aria-hidden="true" className="not-found-art" data-reveal>
          <span className="not-found-orbit not-found-orbit-one" />
          <span className="not-found-orbit not-found-orbit-two" />
          <span className="not-found-art-number">404</span>
          <div className="not-found-compass">
            <Compass size={64} strokeWidth={1.2} />
          </div>
          <span className="not-found-coordinate">LUANDA · ANGOLA</span>
        </div>
      </div>
    </section>
  );
}
