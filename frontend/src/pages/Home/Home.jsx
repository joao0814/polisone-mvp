import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import bannerImage from "../../assets/images/home/banner.png";
import biImage from "../../assets/images/home/BI.png";
import { useCommunications } from "../../hooks/useCommunications";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import gestaoCampanhaImage from "../../assets/images/home/gestao_campanha.png";
import gestaoMandatoImage from "../../assets/images/home/gestao_mandato.png";
import iaImage from "../../assets/images/home/IA.png";
import logoNav from "../../assets/images/home/logo nav.png";

const links = [
  { label: "Chamados", icon: "support", tone: "yellow" },
  { label: "Materiais de Campanha", icon: "briefcase", tone: "black" },
  { label: "Check-in", icon: "check", tone: "black" },
  { label: "Outlook", icon: "mail", tone: "blue" },
  { label: "YouTube", icon: "play", tone: "red" },
  { label: "Canva", icon: "canva", tone: "cyan" },
];

const systems = [
  { label: "Gestão de Campanha", image: gestaoCampanhaImage, path: "/gestao-campanha" },
  { label: "Gestão de Mandato", image: gestaoMandatoImage },
  { label: "BI", image: biImage },
  { label: "IA", image: iaImage },
];

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const eventDays = [12, 16, 18, 26];
const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

function Home({ session, onLogout }) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header user={session?.user} onLogout={onLogout} />
        <SearchLinks />
        <HeroSection />
        <Comunicados />
        <Calendar />
        <BrandSignature />
      </div>
      <Footer />
    </main>
  );
}

function Header({ user, onLogout }) {
  return <PortalNavbar user={user} onLogout={onLogout} />;
}

export function LegacyHeader({ user, onLogout }) {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleResourceSelect(path) {
    setIsResourcesOpen(false);
    navigate(path);
  }

  return (
    <header className={styles.header}>
      <BrandLogo small />
      <nav className={styles.nav} aria-label="Menu principal">
        <Link to="/">Home</Link>
        <a href="#institucional">Institucional</a>
        <a href="#calendarios">Calendários e comunicados</a>
        <div className={styles.navSelect}>
          <button
            type="button"
            onClick={() => setIsResourcesOpen((isOpen) => !isOpen)}
            aria-expanded={isResourcesOpen}
            aria-haspopup="menu"
          >
            Recursos{" "}
            <span
              className={`${styles.resourceCaret} ${isResourcesOpen ? styles.resourceCaretOpen : ""}`}
              aria-hidden="true"
            />
          </button>
          {isResourcesOpen && (
            <div className={styles.navMenu} role="menu">
              <button
                type="button"
                onClick={() => handleResourceSelect("/chamados")}
                role="menuitem"
              >
                Chamados
              </button>
              <button type="button" onClick={() => handleResourceSelect("/comunicados")} role="menuitem">
                Comunicados
              </button>
              <button type="button" role="menuitem">
                Gestão de banners
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.clock}>
          <span>Horário de Brasília</span>
          <strong>09:52</strong>
          <small>31.01.2026</small>
        </div>
        <div className={styles.userMenuWrap}>
          <button
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label="Abrir opcoes do usuario"
            className={styles.userButton}
            type="button"
            onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
          >
            <span>{getInitials(user?.name)}</span>
          </button>
          {isUserMenuOpen ? (
            <div className={styles.userMenu} role="menu">
              <button type="button" role="menuitem">
                Alterar dados do perfil
              </button>
              <button type="button" onClick={onLogout} role="menuitem">
                Sair da conta
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function getInitials(name = "") {
  const [firstName = "", lastName = ""] = name.trim().split(" ");
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim();

  return initials.toUpperCase() || "U";
}

function SearchLinks() {
  return (
    <section className={styles.searchLinks} aria-label="Busca e links rápidos">
      <form className={styles.search}>
        <input type="search" placeholder="Pesquise o que quiser..." />
        <button type="submit" aria-label="Pesquisar" />
      </form>

      <section className={styles.links}>
        <h2>Links</h2>
        <div className={styles.linkList}>
          {links.map((link) => (
            <button
              className={`${styles.linkCard} ${styles[link.tone]}`}
              type="button"
              key={link.label}
            >
              <span className={`${styles.linkIcon} ${styles[link.icon]}`} />
              <small>{link.label}</small>
            </button>
          ))}
          <button className={styles.addLink} type="button">
            <span>+</span>
            <small>Adicionar novo link</small>
          </button>
        </div>
      </section>
    </section>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.heroSection}>
      <aside className={styles.systems}>
        <h2>Sistemas</h2>
        <div className={styles.systemCards}>
          {systems.map((system) => (
            <button
              className={styles.systemCard}
              type="button"
              key={system.label}
              aria-label={system.label}
              onClick={() => {
                if (system.path) {
                  navigate(system.path);
                }
              }}
            >
              <img src={system.image} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </aside>

      <section
        className={styles.banner}
        aria-label="Seja bem-vindo ao Portal do Candidato Alan Leal"
      >
        <img src={bannerImage} alt="" aria-hidden="true" />
      </section>

      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span className={styles.dotActive} />
      </div>
    </section>
  );
}

function Comunicados() {
  const { list, loading, error } = useCommunications();
  const [comunicados, setComunicados] = useState([]);

  useEffect(() => {
    list({ limit: 3 }).then((result) => setComunicados(result.data)).catch(() => setComunicados([]));
  }, [list]);

  return (
    <section className={styles.comunicados} id="calendarios">
      <div className={styles.comunicadosHeading}><h2>Comunicados</h2><Link to="/comunicados">Ver todos →</Link></div>
      <div className={styles.comunicadoGrid}>
        {loading && !comunicados.length ? <p>Carregando comunicados...</p> : null}
        {!loading && error ? <p>Não foi possível carregar os comunicados.</p> : null}
        {!loading && !error && !comunicados.length ? <p>Nenhum comunicado publicado.</p> : null}
        {comunicados.map((comunicado) => (
          <Link to={`/comunicados/${comunicado.slug}`} className={styles.comunicadoCard} key={comunicado.id}>
            <div className={styles.comunicadoImage}>
              <span>POLIS ONE</span>
            </div>
            <div className={styles.comunicadoBody}>
              <h3>{comunicado.title}</h3>
              <span>{comunicado.category?.name || "Comunicado"}</span>
              <p>{comunicado.description}</p>
              <footer>
                <span>{comunicado.views} leituras</span>
                <time>{comunicado.publishedAt ? new Intl.DateTimeFormat("pt-BR").format(new Date(comunicado.publishedAt)) : ""}</time>
              </footer>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Calendar() {
  return (
    <section className={styles.calendar}>
      <aside className={styles.today}>
        <strong>01</strong>
        <span>Quarta-feira</span>
        <h2>Eventos hoje</h2>
        <EventCard />
        <EventCard />
        <button className={styles.addEvent} type="button">
          <span>+</span>
          Adicionar novo evento
        </button>
      </aside>

      <section className={styles.month}>
        <h2>2025</h2>
        <p>
          JAN - FEV - MAR - ABR - MAI - JUN - JUL - AGO - SET - OUT - NOV - DEZ
        </p>
        <div className={styles.monthGrid}>
          {weekDays.map((day) => (
            <strong key={day}>{day}</strong>
          ))}
          {days.map((day) => (
            <span
              className={`${eventDays.includes(day) ? styles.eventDay : ""} ${
                day === 18 ? styles.activeDay : ""
              }`}
              key={day}
            >
              {String(day).padStart(2, "0")}
            </span>
          ))}
        </div>
      </section>
    </section>
  );
}

function EventCard() {
  return (
    <article className={styles.eventCard}>
      <strong>Nome do evento</strong>
      <span>Descrição:</span>
    </article>
  );
}

function BrandSignature() {
  return (
    <section className={styles.signature} aria-label="Polis One">
      <BrandLogo />
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <section>
        <h2>POLIS I.A - Plataforma de gestão de campanha e mandato</h2>
        <p>
          CNPJ: 39.453.451/0001-22
          <br />
          Rua Tabapuã, 594, Edifício Itaim, 3º andar,
          <br />
          Itaim Bibi - São Paulo/SP.
        </p>
      </section>
      <section>
        <h2>Atendimento</h2>
        <p>+55 (11) 916285698</p>
        <p>Segunda - Sexta das 08:00 às 18:00</p>
      </section>
      <section>
        <h2>Baixe agora o nosso App:</h2>
        <div className={styles.storeButtons}>
          <span>Google Play</span>
          <span>App Store</span>
        </div>
        <h2>Redes sociais</h2>
        <div className={styles.socials}>
          <span>f</span>
          <span>ig</span>
          <span>in</span>
          <span>web</span>
        </div>
      </section>
    </footer>
  );
}

function BrandLogo({ small = false }) {
  if (small) {
    return (
      <div className={`${styles.logo} ${styles.logoSmall}`}>
        <img className={styles.logoImage} src={logoNav} alt="Polis One" />
      </div>
    );
  }

  return (
    <div className={styles.logo}>
      <span className={styles.logoIcon} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.logoText}>
        <strong>POLIS</strong>
        <small>ONE</small>
      </span>
    </div>
  );
}

export default Home;
