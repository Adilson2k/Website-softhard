import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Cpu,
  Lightbulb,
  MoveHorizontal,
  Play,
  Clock3,
  Quote,
} from "lucide-react";
import {
  useRef,
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { isBlogPostRoute, type AppRoute, type PageRoute } from "./routes";
import { getPublicPost, getPublicPosts, submitLead, type PublicPost } from "./lib/api";

type PortfolioFormat = "projects-campaigns" | "event-coverage" | "audiovisual-production" | "digital-communication";

type PortfolioItem = {
  slug: string;
  title: string;
  category: string;
  format: PortfolioFormat;
  image: string;
  alt: string;
  summary: string;
  story: string;
  focusItems: string[];
  videoUrl?: string;
  gallery?: { src: string; alt: string }[];
  client?: string;
  objective?: string;
  concept?: string;
  execution?: string;
  results?: string;
  eventDate?: string;
  location?: string;
};

export const portfolioCategories: { id: PortfolioFormat; number: string; title: string; description: string }[] = [
  {
    id: "projects-campaigns",
    number: "01",
    title: "Projectos e campanhas",
    description: "Trabalhos para clientes com objectivos, conceito criativo, execução e resultados disponíveis.",
  },
  {
    id: "event-coverage",
    number: "02",
    title: "Cobertura de eventos",
    description: "Aftermovies, entrevistas, reels, bastidores e fotografias que registam a experiência.",
  },
  {
    id: "audiovisual-production",
    number: "03",
    title: "Produção audiovisual",
    description: "Vídeos institucionais, spots publicitários, videoclipes e conteúdos de campanha.",
  },
  {
    id: "digital-communication",
    number: "04",
    title: "Comunicação digital",
    description: "Campanhas para redes sociais, calendários editoriais e gestão da presença digital.",
  },
];

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "acqua-eta",
    title: "Acqua ETA",
    category: "Projecto em destaque",
    format: "projects-campaigns",
    image: "/acqua-eta.jpg",
    alt: "Equipa de profissionais junto à instalação da ETA Sudeste",
    summary:
      "Um registo visual de uma equipa de profissionais junto à instalação da ETA Sudeste.",
    story:
      "Este destaque apresenta um contexto de trabalho no terreno e aproxima quem visita o portfólio das pessoas e da instalação retratada.",
    focusItems: ["ETA Sudeste", "Equipa no terreno", "Registo de projecto"],
  },
  {
    slug: "visita-de-campo",
    title: "Visita de campo",
    category: "Tecnologia no terreno",
    format: "projects-campaigns",
    image: "/softhard-field.jpg",
    alt: "Profissionais numa visita de campo a uma instalação industrial",
    summary:
      "Profissionais numa visita de campo a uma instalação industrial.",
    story:
      "A imagem dá destaque à presença no terreno e ao contacto com um ambiente industrial, reforçando a dimensão prática deste registo.",
    focusItems: ["Ambiente industrial", "Presença no terreno", "Tecnologia"],
  },
  {
    slug: "corrida-odebrecht",
    title: "Corrida Odebrecht",
    category: "Evento",
    format: "event-coverage",
    image: "/odebrecht-corrida.jpg",
    alt: "Participantes junto ao arco de partida da corrida Odebrecht",
    summary:
      "Participantes reunidos junto ao arco de partida da corrida Odebrecht.",
    story:
      "Este registo destaca o momento de partida e a participação colectiva numa actividade apresentada no portfólio Softhard.",
    focusItems: ["Evento", "Participação", "Experiência colectiva"],
  },
];

export const clientNames = [
  "NP Gandour Angola",
  "Refriango",
  "Chefe's Borges",
  "Restaurante Moquecas",
  "Restaurante Ceano",
  "Royal Language Academy",
  "Torinho Eventos",
  "Delicate Angola",
];

export const serviceItems = [
  {
    slug: "estrategia-digital",
    category: "ESTRAT?GIA",
    title: "Estratégia digital",
    description:
      "Planeamento orientado por objectivos para aproximar marcas, pessoas e canais digitais.",
    image: "/softhard-field.jpg",
    detail:
      "Definimos prioridades digitais a partir do contexto, dos objectivos e das pessoas que cada organização pretende alcançar.",
    supportItems: [
      "Clarificação de objectivos e públicos",
      "Planeamento de canais e conteúdos",
      "Critérios para acompanhar a evolução",
    ],
  },
  {
    slug: "marketing-corporativo",
    category: "MARKETING",
    title: "Marketing corporativo",
    description:
      "Comunicação integrada para reforçar a presença, a mensagem e a reputação da sua organização.",
    image: "/odebrecht-corrida.jpg",
    detail:
      "Apoiamos organizações a alinhar posicionamento, mensagens e pontos de contacto para comunicar com consistência.",
    supportItems: [
      "Posicionamento e mensagens institucionais",
      "Comunicação interna e externa",
      "Planeamento de iniciativas de marca",
    ],
  },
  {
    slug: "conteudo-e-criatividade",
    category: "CRIATIVIDADE",
    title: "Conteúdo e criatividade",
    description:
      "Ideias e conteúdos consistentes com a identidade e os objectivos de cada marca.",
    image: "/acqua-eta.jpg",
    detail:
      "Transformamos a estratégia da marca em ideias e conteúdos claros, relevantes para os canais e públicos definidos.",
    supportItems: [
      "Desenvolvimento de conceitos criativos",
      "Planeamento de conteúdos",
      "Adaptação de mensagens aos canais",
    ],
  },
  {
    slug: "solucoes-tecnologicas",
    category: "TECNOLOGIA",
    title: "Soluções tecnológicas",
    description:
      "Ferramentas e experiências digitais pensadas para responder a necessidades reais.",
    image: "/softhard-field.jpg",
    detail:
      "Exploramos soluções digitais alinhadas com os processos e as necessidades concretas de cada organização.",
    supportItems: [
      "Levantamento de necessidades",
      "Enquadramento de soluções digitais",
      "Integração da tecnologia na experiência",
    ],
  },
];

type BlogArticle = {
  id?: string;
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  mediaUrl?: string;
  author?: string;
  publishedAt?: string | null;
  images?: { src: string; alt: string }[];
  paragraphs: string[];
};

const blogPosts: BlogArticle[] = [
  {
    slug: "estrategia-digital-antes-dos-canais",
    category: "Estratégia digital",
    title: "A estratégia digital começa antes da escolha dos canais",
    excerpt:
      "Mais do que estar presente em várias plataformas, importa saber o que a organização pretende alcançar.",
    image: "/softhard-field.jpg",
    mediaUrl: "/softhard-blogue.mp4",
    imageAlt: "Profissionais numa visita de campo a uma instalação industrial",
    paragraphs: [
      "Uma estratégia digital útil começa com objectivos claros, conhecimento das pessoas a quem queremos chegar e uma compreensão realista dos recursos disponíveis.",
      "Com essas bases, a escolha de canais e formatos deixa de ser uma tendência a seguir e passa a ser uma decisão ligada às prioridades da organização.",
    ],
  },
  {
    slug: "comunicacao-consistente-constroi-confianca",
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
    slug: "experiencia-de-marca-para-la-do-evento",
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

export function ProductSpotlight({
  href,
  actionLabel,
}: {
  href: string;
  actionLabel: string;
}) {
  return (
    <article className="product-spotlight" data-reveal>
      <div aria-hidden="true" className="product-spotlight-art">
        <span className="product-spotlight-overline">
          SOFTHARD / TECNOLOGIA
        </span>
        <span className="product-spotlight-mark">OPS</span>
        <span className="product-spotlight-orbit product-spotlight-orbit-one" />
        <span className="product-spotlight-orbit product-spotlight-orbit-two" />
        <span className="product-spotlight-index">PRODUTO 01</span>
      </div>
      <div className="product-spotlight-copy">
        <p className="section-kicker">PRODUTO SOFTHARD</p>
        <h3>OPS</h3>
        <p>
          Uma solução tecnológica do portefólio Softhard. Peça uma apresentação
          para conhecer as suas funcionalidades e perceber o enquadramento para
          a sua organização.
        </p>
        <a href={href}>
          {actionLabel} <ArrowRight aria-hidden="true" size={17} />
        </a>
      </div>
    </article>
  );
}

export function LeadCaptureForm() {
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setSubmissionState("sending");
    setSubmissionMessage("A enviar o seu pedido?");
    try {
      await submitLead({
        name: String(fields.get("name") ?? ""),
        email: String(fields.get("email") ?? ""),
        organization: String(fields.get("organization") ?? ""),
        phone: String(fields.get("phone") ?? ""),
        interest: String(fields.get("interest") ?? ""),
        message: String(fields.get("message") ?? ""),
        sourcePage: window.location.pathname,
        website: String(fields.get("website") ?? ""),
      });
      form.reset();
      setSubmissionState("success");
      setSubmissionMessage("Pedido recebido. A equipa Softhard entrará em contacto consigo.");
    } catch {
      setSubmissionState("error");
      setSubmissionMessage("Não foi possível enviar agora. Tente novamente ou contacte-nos por email.");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} aria-busy={submissionState === "sending"}>
      <label aria-hidden="true" className="lead-honeypot">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <div className="lead-form-grid">
        <label>
          Nome
          <input autoComplete="name" name="name" required />
        </label>
        <label>
          E-mail profissional
          <input
            autoComplete="email"
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          Organização (opcional)
          <input autoComplete="organization" name="organization" />
        </label>
        <label>
          Telefone (opcional)
          <input autoComplete="tel" name="phone" type="tel" />
        </label>
        <label className="lead-form-wide">
          Como podemos ajudar?
          <select defaultValue="" name="interest" required>
            <option disabled value="">
              Seleccione um tema
            </option>
            <option>Marketing corporativo</option>
            <option>Estratégia digital</option>
            <option>Conteúdo e criatividade</option>
            <option>Soluções tecnológicas</option>
            <option>Parcerias ou outro assunto</option>
          </select>
        </label>
        <label className="lead-form-wide">
          Mensagem
          <textarea name="message" required rows={3} />
        </label>
      </div>
      <div className="lead-form-footer">
        <p aria-live="polite" className={`lead-form-status${submissionState === "error" ? " is-error" : ""}`} role="status">
          {submissionMessage || "Os dados são usados para responder ao seu pedido."}
          {submissionState === "error" && <> <a href="mailto:softhard@dcinvestimentos.com">softhard@dcinvestimentos.com</a></>}
        </p>
        <button disabled={submissionState === "sending"} type="submit">
          {submissionState === "sending" ? "A enviar?" : "Enviar pedido"} <ArrowRight aria-hidden="true" size={17} />
        </button>
      </div>
    </form>
  );
}

export function ServiceCards({
  limit,
  actionLabel,
}: {
  limit?: number;
  actionLabel?: string;
}) {
  const items = serviceItems.slice(0, limit ?? serviceItems.length);

  return (
    <div
      className={`service-cards${limit === undefined ? " service-cards-all" : ""}`}
    >
      {items.map(({ slug, category, title, description, image }, index) => (
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
            <a href={`/servicos/${slug}/`}>
              {actionLabel ?? "Explorar serviço"}{" "}
              <ArrowRight aria-hidden="true" size={16} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function ServiceDetailPage({ route }: { route: PageRoute }) {
  const service = serviceItems.find(
    (item) => route === `/servicos/${item.slug}`,
  );
  if (!service) return null;

  return (
    <>
      <PageIntro
        eyebrow={`Serviços / ${service.category}`}
        title={service.title}
        highlight="com propósito."
        description={service.description}
      />
      <section
        aria-labelledby="service-detail-title"
        className="page-shell service-detail-section"
      >
        <div className="service-detail-copy" data-reveal>
          <p className="section-kicker">
            <span>01</span> / COMO PODEMOS APOIAR
          </p>
          <h2 className="section-heading" id="service-detail-title">
            Uma resposta pensada para <span>o seu contexto.</span>
          </h2>
          <p className="section-intro">{service.detail}</p>
          <ul className="service-detail-list">
            {service.supportItems.map((item) => (
              <li key={item}>
                <ArrowUpRight aria-hidden="true" size={17} />
                {item}
              </li>
            ))}
          </ul>
          <PageLink href="/contactos/">Fale sobre este serviço</PageLink>
        </div>
        <figure className="service-detail-visual" data-reveal>
          <img
            alt=""
            decoding="async"
            loading="lazy"
            src={service.image}
          />
          <figcaption>{service.category} / SOFTHARD</figcaption>
        </figure>
      </section>
      <section className="inner-band">
        <div className="page-shell inner-band-layout" data-reveal>
          <h2>Vamos transformar objectivos em próximos passos.</h2>
          <PageLink href="/contactos/">Iniciar uma conversa</PageLink>
        </div>
      </section>
    </>
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
      <section className="page-shell mt-16" aria-labelledby="ceo-message">
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-[.7fr_1.3fr]" data-reveal>
          <div className="relative min-h-[320px] overflow-hidden bg-[#fff0ed] sm:min-h-[380px]">
            <img
              src="/ceo-softhard.jpg"
              alt="Retrato do CEO da Softhard"
              className="absolute inset-0 size-full object-cover object-[center_32%]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Quote aria-hidden="true" className="size-7 text-brand" />
            <p className="eyebrow mt-6 text-brand">Mensagem do CEO</p>
            <h2 id="ceo-message" className="mt-3 text-2xl font-bold tracking-[-.045em] sm:text-3xl">Uma palavra de quem lidera a Softhard.</h2>
            <blockquote className="mt-4 max-w-xl border-l-2 border-brand pl-4 text-base italic leading-7 text-ink sm:text-lg">“Se todos os grandes caminham para uma direção, é muito provável que seja aquele o caminho para o crescimento!”</blockquote>
            <p className="mt-8 border-t border-line pt-5 text-sm font-bold">CEO da Softhard</p>
          </div>
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
            actionLabel="Explorar serviço"
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
      <section className="page-shell inner-section products-page-section">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>01</span> / PRODUTOS
          </p>
          <h2 className="section-heading">
            Tecnologia com <span>identidade Softhard.</span>
          </h2>
          <p className="section-intro">
            Damos destaque ao OPS, produto tecnológico da Softhard. Peça uma
            apresentação para conhecer melhor a solução.
          </p>
        </div>
        <ProductSpotlight
          actionLabel="Pedir apresentação"
          href="/contactos/"
        />
        <div className="product-related-note" data-reveal>
          <div>
            <p className="section-kicker">OUTRAS SOLU??ESES</p>
            <h3>Produtos relacionados com Marketing</h3>
            <p>
              Fale connosco para conhecer as soluções disponíveis para a sua
              organização.
            </p>
          </div>
          <PageLink href="/contactos/">Pedir informações</PageLink>
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
    moved: false,
  });
  const suppressPortfolioClickRef = useRef(false);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [activePortfolioFormat, setActivePortfolioFormat] = useState<PortfolioFormat | "all">("all");
  const visiblePortfolioItems = activePortfolioFormat === "all"
    ? portfolioItems
    : portfolioItems.filter((item) => item.format === activePortfolioFormat);

  useEffect(() => {
    setPortfolioIndex(0);
    portfolioTrackRef.current?.scrollTo({ left: 0 });
  }, [activePortfolioFormat]);

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
      moved: false,
    };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  }

  function handlePortfolioPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    if (Math.abs(event.clientX - drag.startX) > 6) drag.moved = true;

    event.currentTarget.scrollLeft =
      drag.startScrollLeft - (event.clientX - drag.startX);
  }

  function handlePortfolioPointerUp(event: PointerEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    if (dragRef.current.pointerId !== event.pointerId) return;

    if (dragRef.current.moved) {
      suppressPortfolioClickRef.current = true;
      window.setTimeout(() => {
        suppressPortfolioClickRef.current = false;
      }, 0);
    }
    dragRef.current.pointerId = -1;
    track.classList.remove("is-dragging");
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  }

  function handlePortfolioClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressPortfolioClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressPortfolioClickRef.current = false;
  }

  function handlePortfolioKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" && portfolioIndex > 0) {
      event.preventDefault();
      scrollToPortfolioItem(portfolioIndex - 1);
    } else if (
      event.key === "ArrowRight" &&
      portfolioIndex < visiblePortfolioItems.length - 1
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
        description="Projectos e campanhas, cobertura de eventos, produção audiovisual e comunicação digital — apresentados com contexto e imagem em movimento."
      />
      <section className="portfolio-page-section">
        <div className="page-shell portfolio-page-heading" data-reveal>
          <div>
            <p className="section-kicker">
              <span>01</span> / TRABALHOS EM DESTAQUE
            </p>
            <h2 className="section-heading">
              Do conceito à <span>experiência.</span>
            </h2>
            <p className="section-intro">
              Projectos, campanhas e coberturas apresentados com contexto e formatos audiovisuais.
            </p>
          </div>
          <p className="portfolio-page-hint">
            <MoveHorizontal aria-hidden="true" size={18} />
            Arraste para explorar
          </p>
        </div>
        <div className="page-shell portfolio-format-grid" aria-label="Áreas do portfólio">
          {portfolioCategories.map((category) => {
            const itemCount = portfolioItems.filter((item) => item.format === category.id).length;
            return (
              <button
                aria-pressed={activePortfolioFormat === category.id}
                className={`portfolio-format-card${activePortfolioFormat === category.id ? " is-active" : ""}`}
                key={category.id}
                onClick={() => setActivePortfolioFormat(category.id)}
                type="button"
              >
                <span className="portfolio-format-number">{category.number} / PORTFÓLIO</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <span className="portfolio-format-count">{itemCount ? `${itemCount} ${itemCount === 1 ? "registo" : "registos"}` : "Conteúdo em preparação"}<ArrowUpRight aria-hidden="true" size={15} /></span>
              </button>
            );
          })}
        </div>
        <div className="page-shell portfolio-format-filter" aria-label="Filtrar trabalhos por formato" role="group">
          <button aria-pressed={activePortfolioFormat === "all"} className={activePortfolioFormat === "all" ? "is-active" : ""} onClick={() => setActivePortfolioFormat("all")} type="button">Todos os trabalhos</button>
          {portfolioCategories.map((category) => <button aria-pressed={activePortfolioFormat === category.id} className={activePortfolioFormat === category.id ? "is-active" : ""} key={category.id} onClick={() => setActivePortfolioFormat(category.id)} type="button">{category.title}</button>)}
        </div>
        <div className="page-shell portfolio-page-controls">
          <p aria-live="polite" className="portfolio-page-count">
            {visiblePortfolioItems.length ? String(portfolioIndex + 1).padStart(2, "0") : "00"} /{" "}
            {String(visiblePortfolioItems.length).padStart(2, "0")}
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
              disabled={portfolioIndex >= visiblePortfolioItems.length - 1}
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
          onClickCapture={handlePortfolioClickCapture}
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
          {visiblePortfolioItems.map((item, index) => (
            <article
              className="portfolio-page-card"
              data-portfolio-page-card
              key={item.title}
            >
              <figure>
                <a
                  aria-label={`Abrir projecto ${item.title}`}
                  className="portfolio-page-image-link"
                  href={`/portfolio/${item.slug}/`}
                >
                  <div className="portfolio-page-image">
                    <img
                      alt={item.alt}
                      decoding="async"
                      loading={index === 0 ? "eager" : "lazy"}
                      src={item.image}
                      style={{ viewTransitionName: `portfolio-${item.slug}` }}
                    />
                    {item.format === "event-coverage" && <span className="portfolio-media-pending"><Play aria-hidden="true" size={12} fill="currentColor" /> Cobertura audiovisual</span>}
                    <span className="portfolio-page-image-index">
                      0{index + 1}
                    </span>
                  </div>
                </a>
                <figcaption className="portfolio-page-caption">
                  <div>
                    <p className="section-kicker">{item.category}</p>
                    <h3>{item.title}</h3>
                    <a
                      className="portfolio-page-link"
                      href={`/portfolio/${item.slug}/`}
                    >
                      Ver projecto
                      <ArrowUpRight aria-hidden="true" size={17} />
                    </a>
                  </div>
                  <span>
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(visiblePortfolioItems.length).padStart(2, "0")}
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
          {visiblePortfolioItems.map((item, index) => (
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
        {!visiblePortfolioItems.length && <div className="page-shell portfolio-empty-state"><span>SOFTHARD / PORTFÓLIO</span><h3>Estamos a preparar os trabalhos desta área.</h3><p>Em breve, esta selecção poderá incluir os materiais, formatos e contexto de cada projecto.</p></div>}
      </section>
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="page-shell" data-reveal>
          <p className="section-kicker">CLIENTES E PARCEIROS</p>
          <h2 className="section-heading">Marcas que caminham com a Softhard.</h2>
          <p className="section-intro">Empresas e organizações com quem construímos relações de trabalho.</p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {clientNames.map((client) => (
              <li key={client} className="flex min-h-24 items-center justify-center rounded-xl border border-line bg-paper px-4 py-5 text-center text-sm font-semibold text-ink sm:min-h-28 sm:text-base">
                {client}
              </li>
            ))}
          </ul>
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

function ProjectDetailPage({ route }: { route: PageRoute }) {
  const project = portfolioItems.find(
    (item) => route === `/portfolio/${item.slug}`,
  );
  if (!project) return null;

  const projectNumber = String(
    portfolioItems.findIndex((item) => item.slug === project.slug) + 1,
  ).padStart(2, "0");
  const caseStudyDetails = [
    { label: "Objectivo", value: project.objective },
    { label: "Conceito criativo", value: project.concept },
    { label: "Execução", value: project.execution },
    { label: "Resultados", value: project.results },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  return (
    <article className="project-detail-page">
      <section
        aria-labelledby="project-detail-title"
        className="project-detail-hero"
      >
        <img
          alt={project.alt}
          decoding="async"
          fetchPriority="high"
          src={project.image}
          style={{ viewTransitionName: `portfolio-${project.slug}` }}
        />
        <div aria-hidden="true" className="project-detail-shade" />
        <div className="page-shell project-detail-heading" data-reveal>
          <p className="project-detail-eyebrow">
            {project.category} <span>?</span> PORTF?LIO SOFTHARD
          </p>
          <h1 id="project-detail-title" tabIndex={-1}>
            {project.title}
          </h1>
          <p>{project.summary}</p>
          <a href="#project-detail-story">
            Explorar projecto
            <ArrowDown aria-hidden="true" size={17} />
          </a>
        </div>
        <span aria-hidden="true" className="project-detail-number">
          PROJECTO {projectNumber}
        </span>
      </section>
      {(project.videoUrl || project.format === "event-coverage") && (
        <section className="page-shell project-detail-av-section" aria-label="Cobertura audiovisual">
          <div className="project-detail-av-heading">
            <p className="section-kicker">COBERTURA AUDIOVISUAL</p>
            <h2>{project.videoUrl ? "Veja a experiência em movimento." : "Os momentos também merecem ser vistos."}</h2>
            {project.eventDate && <span>{project.eventDate}</span>}
            {project.location && <span>{project.location}</span>}
          </div>
          {project.videoUrl ? (
            <BlogVideo title={project.title} url={project.videoUrl} />
          ) : (
            <div className="project-video-placeholder">
              <Play aria-hidden="true" size={26} fill="currentColor" />
              <div><strong>Vídeo do evento em preparação</strong><span>O aftermovie e restantes materiais serão publicados após validação.</span></div>
            </div>
          )}
          <div className="project-media-types">
            {["Aftermovie", "Entrevistas", "Reels", "Bastidores", "Fotografias"].map((format) => <span key={format}>{format}</span>)}
          </div>
        </section>
      )}
      <section
        aria-labelledby="project-detail-story-title"
        className="page-shell project-detail-content"
        id="project-detail-story"
      >
        <div data-reveal>
          <p className="section-kicker">
            <span>{projectNumber}</span> / SOBRE ESTE REGISTO
          </p>
          <h2 className="section-heading" id="project-detail-story-title">
            Histórias que ganham <span>forma no terreno.</span>
          </h2>
        </div>
        <div className="project-detail-story" data-reveal>
          <p>{project.story}</p>
          <div className="project-detail-focus">
            <p className="section-kicker">EM FOCO</p>
            <ul>
              {project.focusItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {caseStudyDetails.length > 0 && (
        <section className="page-shell project-case-study">
          <p className="section-kicker">PROJECTO / CONTEXTO</p>
          <div className="project-case-study-grid">
            {caseStudyDetails.map(({ label, value }) => <article key={label}><h3>{label}</h3><p>{value}</p></article>)}
          </div>
        </section>
      )}
      {project.gallery && project.gallery.length > 0 && (
        <section className="page-shell project-detail-gallery" aria-label="Galeria do projecto">
          {project.gallery.map((media) => <figure key={media.src}><img src={media.src} alt={media.alt} loading="lazy" decoding="async" /></figure>)}
        </section>
      )}
      <section className="inner-band">
        <div className="page-shell inner-band-layout" data-reveal>
          <h2>Quer criar uma experiência para a sua marca?</h2>
          <PageLink href="/contactos/">Fale connosco</PageLink>
        </div>
      </section>
    </article>
  );
}

type VideoEmbedSource = { kind: "file" | "embed"; src: string };

function resolveVideoEmbed(value: string): VideoEmbedSource | null {
  try {
    const isAbsoluteUrl = /^https?:\/\//i.test(value);
    const url = new URL(value, "https://softhard.invalid");
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const videoId = host === "youtu.be"
      ? url.pathname.slice(1).split("/")[0]
      : ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)
        ? url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]
        : null;
    if (videoId && /^[\w-]{6,}$/.test(videoId)) {
      return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${videoId}` };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const videoId = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      if (videoId) return { kind: "embed", src: `https://player.vimeo.com/video/${videoId}` };
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: "file", src: isAbsoluteUrl ? url.toString() : value };
    return null;
  } catch {
    return null;
  }
}

function BlogVideo({ url, title }: { url: string; title: string }) {
  const video = resolveVideoEmbed(url);
  if (!video) return null;
  if (video.kind === "file") {
    return <video className="blog-inline-video" controls playsInline preload="metadata" src={video.src} aria-label={title} />;
  }
  return (
    <div className="blog-inline-video-frame">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={video.src}
        title={title}
      />
    </div>
  );
}

function articleFromApi(post: PublicPost): BlogArticle {
  const parsed = new DOMParser().parseFromString(post.content, "text/html");
  const images = Array.from(parsed.body.querySelectorAll("img[src]"))
    .map((image) => {
      const rawSource = image.getAttribute("src") || "";
      try {
        const source = new URL(rawSource, window.location.origin);
        return (source.protocol === "https:" || source.origin === window.location.origin)
          ? { src: source.toString(), alt: image.getAttribute("alt") || post.title }
          : null;
      } catch {
        return null;
      }
    })
    .filter((image): image is { src: string; alt: string } => image !== null);
  const paragraphs = Array.from(parsed.body.querySelectorAll("p, li, h2, h3, blockquote"))
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean);
  if (paragraphs.length === 0) {
    paragraphs.push(...(parsed.body.textContent ?? "").split(/\n+/).map((part) => part.trim()).filter(Boolean));
  }
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category || "Geral",
    excerpt: post.excerpt || paragraphs.join(" ").slice(0, 200),
    image: post.coverImage || "/softhard-field.jpg",
    imageAlt: post.title,
    mediaUrl: post.mediaUrl || undefined,
    author: post.author || "Softhard",
    publishedAt: post.publishedAt,
    images,
    paragraphs,
  };
}

function articlePath(post: BlogArticle) {
  const slug = post.slug || post.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/noticias/${slug}/`;
}

function ArticleReadMore({ post }: { post: BlogArticle }) {
  return (
    <a className="blog-article-link" href={articlePath(post)}>
      {post.mediaUrl ? "Ver reportagem" : "Ler artigo"}
      <ArrowUpRight aria-hidden="true" size={17} />
    </a>
  );
}

function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [posts, setPosts] = useState<BlogArticle[]>(import.meta.env.DEV ? blogPosts : []);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState("");
  const [showingDemo, setShowingDemo] = useState(import.meta.env.DEV);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const controller = new AbortController();
    getPublicPosts(controller.signal)
      .then((remotePosts) => {
        const articles = remotePosts.map(articleFromApi);
        const useDemoContent = import.meta.env.DEV && articles.length === 0;
        setPosts(useDemoContent ? blogPosts : articles);
        setShowingDemo(useDemoContent);
        setLoadMessage(useDemoContent
          ? "A mostrar conteúdos de demonstração; os artigos publicados no CMS substituirão esta selecção."
          : articles.length === 0 ? "Ainda não há publicações." : "");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        if (import.meta.env.DEV) {
          setPosts(blogPosts);
          setShowingDemo(true);
          setLoadMessage("A mostrar conteúdos de demonstração; configure a ligação à API para carregar artigos publicados.");
        } else {
          setPosts([]);
          setShowingDemo(false);
          setLoadMessage("Não foi possível carregar o blogue neste momento. Tente novamente mais tarde.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const visiblePosts = activeCategory === "Todos"
    ? posts
    : posts.filter((post) => post.category === activeCategory);
  const categories = ["Todos", ...new Set(posts.map((post) => post.category))];
  const featuredPost = visiblePosts[0];
  const latestPosts = visiblePosts.slice(1, visibleCount + 1);
  const hasMorePosts = visiblePosts.length > visibleCount + 1;

  function formatPublishedDate(value?: string | null) {
    if (!value) return "Softhard";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Softhard";
    return new Intl.DateTimeFormat("pt-AO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function readingTime(post: BlogArticle) {
    const words = post.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 190));
  }

  return (
    <>
      <section aria-labelledby="news-page-title" className="news-hero">
        <div className="page-shell news-hero-content" data-reveal>
          <div className="news-hero-intro">
            <p className="eyebrow"><span className="eyebrow-mark" />Blogue Softhard</p>
            <h1 id="news-page-title">Histórias que <span>põem marcas em movimento.</span></h1>
            <p className="news-hero-description">Ideias, reportagens e bastidores da comunicação que aproxima empresas e pessoas.</p>
            <a className="news-hero-link" href="#news-articles">Explorar o blogue <ChevronDown aria-hidden="true" size={18} /></a>
            <p className="news-hero-meta">Estratégia · Marcas · Audiovisual · Cultura</p>
          </div>
          {featuredPost ? (
            <article className="news-featured" aria-label="Destaque editorial">
              <div className="news-featured-visual">
                <img src={featuredPost.image} alt={featuredPost.imageAlt} fetchPriority="high" />
                {featuredPost.mediaUrl && <span className="news-media-badge"><Play aria-hidden="true" size={13} fill="currentColor" /> Vídeo</span>}
              </div>
              <div className="news-featured-copy">
                <div className="news-featured-meta"><span>{featuredPost.category}</span><span>{formatPublishedDate(featuredPost.publishedAt)}</span></div>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.excerpt}</p>
                <ArticleReadMore post={featuredPost} />
              </div>
            </article>
          ) : (
            <div className="news-featured-empty"><span>SOFTHARD / EDITORIAL</span><strong>Ideias com impacto.</strong></div>
          )}
        </div>
      </section>
      <section aria-labelledby="news-articles-title" className="page-shell inner-section blog-section" id="news-articles">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker"><span>01</span> / IDEIAS E PERSPECTIVAS</p>
          <h2 className="section-heading" id="news-articles-title">Comunicação em <span>todas as formas.</span></h2>
          <p className="section-intro">Artigos, imagens e vídeo sobre o trabalho, as ideias e as histórias que partilhamos com os nossos clientes.</p>
        </div>
        <div className="blog-category-heading"><h3>Explore categorias</h3><span>{posts.length} {posts.length === 1 ? "publicação" : "publicações"}</span></div>
        <div aria-label="Filtrar artigos por tema" className="blog-filters" role="group">
          {categories.map((category) => (
            <button aria-pressed={activeCategory === category} className={activeCategory === category ? "is-active" : ""} key={category} onClick={() => { setActiveCategory(category); setVisibleCount(6); }} type="button">
              {category}
            </button>
          ))}
        </div>
        {loading && <p className="blog-load-message" role="status">A carregar publicações…</p>}
        {!loading && loadMessage && <p className={`blog-load-message${showingDemo ? " is-demo" : ""}`} role="status">{loadMessage}</p>}
        <div className="blog-recent-heading"><h3>Publicações recentes</h3><span>O que estamos a criar e a pensar</span></div>
        {latestPosts.length > 0 ? (
          <div aria-live="polite" className="blog-grid">
            {latestPosts.map((post) => (
              <article className="blog-card" key={post.id ?? post.title}>
                <div className="blog-card-art">
                  <img alt={post.imageAlt} decoding="async" loading="lazy" src={post.image} />
                  {post.mediaUrl && <span className="blog-card-video"><Play aria-hidden="true" size={12} fill="currentColor" /> Vídeo</span>}
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta"><p className="section-kicker">{post.category}</p><span>{formatPublishedDate(post.publishedAt)}</span></div>
                  <h3>{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <div className="blog-card-bottom"><span><Clock3 aria-hidden="true" size={14} /> {readingTime(post)} min de leitura</span><ArticleReadMore post={post} /></div>
                </div>
              </article>
            ))}
          </div>
        ) : !loading && !featuredPost ? (
          <div className="blog-empty-state">As próximas histórias da Softhard serão publicadas aqui.</div>
        ) : null}
        {hasMorePosts && <button className="blog-load-more" onClick={() => setVisibleCount((count) => count + 6)} type="button">Carregar mais publicações <ArrowDown aria-hidden="true" size={16} /></button>}
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
function BlogPostPage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [related, setRelated] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const demoArticle = import.meta.env.DEV ? blogPosts.find((post) => post.slug === slug) : undefined;
    if (demoArticle) {
      setArticle(demoArticle);
      setRelated(blogPosts.filter((post) => post.slug !== slug));
      setLoading(false);
      setError(false);
      return () => controller.abort();
    }

    setLoading(true);
    setError(false);
    getPublicPost(slug, controller.signal)
      .then((post) => setArticle(articleFromApi(post)))
      .catch(() => { if (!controller.signal.aborted) { setArticle(null); setError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    getPublicPosts(controller.signal)
      .then((posts) => setRelated(posts.map(articleFromApi).filter((post) => post.slug !== slug)))
      .catch(() => undefined);

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const title = `${article.title} | Blogue Softhard`;
    const description = article.excerpt || article.paragraphs.join(" ").slice(0, 180);
    document.title = title;
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = description;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = description;
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (ogImage) ogImage.content = new URL(article.image, window.location.origin).toString();
  }, [article]);

  function formatDate(value?: string | null) {
    if (!value) return "Blogue Softhard";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Blogue Softhard" : new Intl.DateTimeFormat("pt-AO", { day: "2-digit", month: "long", year: "numeric" }).format(date);
  }

  const readingMinutes = article ? Math.max(1, Math.ceil(article.paragraphs.join(" ").split(/\s+/).filter(Boolean).length / 190)) : 1;

  return (
    <section className="blog-detail-page">
      <div className="page-shell blog-detail-shell">
        <a className="blog-detail-back" href="/noticias/"><ChevronLeft aria-hidden="true" size={17} /> Voltar ao blogue</a>
        {loading ? (
          <p className="blog-detail-message" role="status">A carregar artigo…</p>
        ) : !article ? (
          <section className="blog-detail-missing"><p className="section-kicker">BLOGUE SOFTHARD</p><h1>{error ? "Este artigo não está disponível." : "Artigo não encontrado."}</h1><p>O artigo pode ter sido removido ou ainda não foi publicado.</p><a className="blog-detail-return" href="/noticias/">Explorar o blogue <ArrowUpRight aria-hidden="true" size={16} /></a></section>
        ) : (
          <>
            <header className="blog-detail-heading">
              <p className="section-kicker"><span>{article.category}</span></p>
              <h1>{article.title}</h1>
              <p className="blog-detail-excerpt">{article.excerpt}</p>
              <div className="blog-detail-byline"><span>{article.author || "Softhard"}</span><i aria-hidden="true" /><span>{formatDate(article.publishedAt)}</span><i aria-hidden="true" /><span>{readingMinutes} min de leitura</span></div>
            </header>
            <figure className="blog-detail-cover"><img src={article.image} alt={article.imageAlt || article.title} fetchPriority="high" /></figure>
            <div className="blog-detail-layout">
              <article className="blog-detail-body">
                {article.mediaUrl && <BlogVideo title={article.title} url={article.mediaUrl} />}
                {article.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
                {article.images?.map((image) => <figure className="blog-article-image" key={image.src}><img src={image.src} alt={image.alt || article.title} loading="lazy" decoding="async" /></figure>)}
              </article>
              <aside className="blog-detail-aside"><span className="section-kicker">SOFTHARD / BLOGUE</span><p>Ideias, experiências e histórias de comunicação partilhadas pela nossa equipa.</p><a href="/contactos/">Fale connosco <ArrowUpRight aria-hidden="true" size={15} /></a></aside>
            </div>
            {related.length > 0 && <section className="blog-related"><div className="blog-related-heading"><p className="section-kicker">CONTINUE A LER</p><h2>Mais histórias do blogue.</h2></div><div className="blog-related-grid">{related.slice(0, 3).map((post) => <a className="blog-related-card" href={articlePath(post)} key={post.slug ?? post.title}><img src={post.image} alt="" loading="lazy" /><span>{post.category}</span><h3>{post.title}</h3><ArrowUpRight aria-hidden="true" size={17} /></a>)}</div></section>}
          </>
        )}
      </div>
    </section>
  );
}

function CareersPage() {
  return (
    <>
      <PageIntro
        eyebrow="Carreiras"
        title="Boas ideias começam"
        highlight="com pessoas."
        description="Explore as áreas profissionais da Softhard e apresente a sua candidatura espontânea à equipa."
      />
      <section className="inner-values-section">
        <div className="page-shell">
          <div className="inner-section-heading" data-reveal>
            <p className="section-kicker section-kicker-light">
              <span>01</span> / ÁREAS PROFISSIONAIS
            </p>
            <h2 className="section-heading">
              Há espaço para diferentes <span>talentos.</span>
            </h2>
          </div>
          <div className="inner-values-grid">
            {[
              {
                title: "Marketing",
                text: "Estratégia, posicionamento e comunicação para marcas e organizações.",
              },
              {
                title: "Tráfego pago",
                text: "Planeamento e optimização de campanhas em canais digitais.",
              },
              {
                title: "Social media",
                text: "Conteúdo e gestão da presença de marcas nas redes sociais.",
              },
              {
                title: "Design",
                text: "Identidade visual e materiais gráficos para comunicação.",
              },
              {
                title: "Fotógrafo(a)",
                text: "Produção de fotografia para projectos, campanhas e eventos.",
              },
              {
                title: "Desenvolvedor(a) de software",
                text: "Criação e manutenção de aplicações e soluções digitais.",
              },
            ].map(({ title, text }, index) => (
              <article className="inner-value-card" data-reveal key={title}>
                <span className="inner-card-number">
                  0{index + 1} / CARREIRAS
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell inner-section lead-contact-section careers-application-section">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>02</span> / CANDIDATURA ESPONT?NEA
          </p>
          <h2 className="section-heading">
            Vamos conhecer <span>o seu talento.</span>
          </h2>
          <p className="section-intro">
            Conte-nos sobre si, escolha a área em que gostaria de colaborar e
            partilhe um link para o seu portfólio ou perfil profissional, se
            tiver.
          </p>
        </div>
        <CareersApplicationForm />
      </section>
    </>
  );
}

function CareersApplicationForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="lead-form-grid">
        <label>
          Nome completo
          <input autoComplete="name" name="name" required />
        </label>
        <label>
          E-mail
          <input
            autoComplete="email"
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          Telefone (opcional)
          <input autoComplete="tel" name="phone" type="tel" />
        </label>
        <label>
          Área de interesse
          <select defaultValue="" name="interest" required>
            <option disabled value="">
              Seleccione uma área
            </option>
            <option>Marketing</option>
            <option>Tráfego pago</option>
            <option>Social media</option>
            <option>Design</option>
            <option>Fotógrafo(a)</option>
            <option>Desenvolvedor(a) de software</option>
          </select>
        </label>
        <label className="lead-form-wide">
          Portfólio, LinkedIn ou outro link (opcional)
          <input
            autoComplete="url"
            name="portfolio"
            placeholder="https://"
            type="url"
          />
        </label>
        <label className="lead-form-wide">
          Apresentação
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Conte-nos sobre a sua experiência e motivação."
          />
        </label>
      </div>
      <div className="lead-form-footer">
        <p aria-live="polite" className="lead-form-status" role="status">
          {submitted
            ? "Candidatura simulada. Nenhum dado foi enviado ou guardado."
            : "Formulário demonstrativo: os dados não são enviados nem guardados."}
        </p>
        <button type="submit">
          Enviar candidatura <ArrowRight aria-hidden="true" size={17} />
        </button>
      </div>
    </form>
  );
}

function ContactsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contactos"
        title="Vamos conhecer"
        highlight="o seu desafio."
        description="Partilhe o que pretende alcançar e indique como podemos entrar em contacto."
      />
      <section className="page-shell inner-section lead-contact-section">
        <div className="inner-section-heading" data-reveal>
          <p className="section-kicker">
            <span>01</span> / FALE CONNOSCO
          </p>
          <h2 className="section-heading">
            Uma boa conversa começa <span>com contexto.</span>
          </h2>
          <p className="section-intro">
            Conte-nos sobre a sua organização, o tema que procura e os
            resultados que pretende alcançar.
          </p>
        </div>
        <LeadCaptureForm />
      </section>
    </>
  );
}

export default function ContentPages({ route }: { route: AppRoute }) {
  if (isBlogPostRoute(route)) {
    return <BlogPostPage slug={route.slice("/noticias/".length)} />;
  }
  if (route.startsWith("/servicos/")) {
    return <ServiceDetailPage route={route as PageRoute} />;
  }
  if (route.startsWith("/portfolio/")) {
    return <ProjectDetailPage route={route as PageRoute} />;
  }

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
            <span>404</span> / P?GINA N?O ENCONTRADA
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
