import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import logoNav from "../../assets/images/home/logo nav.png";
import portalSignature from "../../assets/images/home/portal-signature.png";
import HomeCalendarSection from "./HomeCalendarSection";
import HomeCommunicationsSection from "./HomeCommunicationsSection";
import HomeFooter from "./HomeFooter";
import HomeHeroSection from "./HomeHeroSection";
import HomeQuickLinksSection from "./HomeQuickLinksSection";
import { getInitials } from "./home.utils";
import styles from "./Home.module.css";

function Home({ session, onLogout }) {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header user={session?.user} onLogout={onLogout} />
        <HomeQuickLinksSection />
        <HomeHeroSection />
        <HomeCommunicationsSection />
        <HomeCalendarSection user={session?.user} />
        <BrandSignature />
      </div>
      <HomeFooter />
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
        <a href="#calendarios">Calendarios e comunicados</a>
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
                Gestao de banners
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.clock}>
          <span>Horario de Brasilia</span>
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

function BrandSignature() {
  return (
    <section className={styles.signature} aria-label="Polis One">
      <BrandLogo />
    </section>
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
      <img className={styles.logoImage} src={portalSignature} alt="Polis One" />
    </div>
  );
}

export default Home;
