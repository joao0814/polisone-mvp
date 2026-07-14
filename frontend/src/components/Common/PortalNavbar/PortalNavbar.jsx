import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoNav from "../../../assets/images/home/logo nav.png";
import ProtectedStorageImage from "../ProtectedStorageImage/ProtectedStorageImage";
import styles from "./PortalNavbar.module.css";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || "U"}${parts.at(-1)?.[0] || parts[0]?.[1] || ""}`.toUpperCase();
}

export default function PortalNavbar({ user, onLogout, activeResource = "" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentResource = activeResource || (pathname.startsWith("/comunicados") ? "comunicados" : pathname.startsWith("/chamados") ? "chamados" : "");
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  function go(path) {
    setResourcesOpen(false);
    navigate(path);
  }

  return <header className={styles.header}>
    <Link to="/" className={styles.logo}><img src={logoNav} alt="Polis One" /></Link>
    <nav className={styles.nav} aria-label="Menu principal">
      <Link className={!currentResource && pathname === "/" ? styles.active : ""} to="/">Home</Link>
      <a href="/#institucional">Institucional</a>
      <Link to="/#calendarios">Calendários e comunicados</Link>
      <div className={styles.navSelect}>
        <button className={currentResource ? styles.active : ""} type="button" onClick={() => setResourcesOpen((open) => !open)} aria-expanded={resourcesOpen} aria-haspopup="menu">Recursos <span className={`${styles.caret} ${resourcesOpen ? styles.caretOpen : ""}`} /></button>
        {resourcesOpen && <div className={styles.navMenu} role="menu">
          <button className={currentResource === "chamados" ? styles.currentItem : ""} type="button" onClick={() => go("/chamados")} role="menuitem" aria-current={currentResource === "chamados" ? "page" : undefined}>Chamados</button>
          <button className={currentResource === "comunicados" ? styles.currentItem : ""} type="button" onClick={() => go("/comunicados")} role="menuitem" aria-current={currentResource === "comunicados" ? "page" : undefined}>Comunicados</button>
          <button className={currentResource === "banners" ? styles.currentItem : ""} type="button" onClick={() => go("/banners/admin")} role="menuitem" aria-current={currentResource === "banners" ? "page" : undefined}>Gestão de banners</button>
        </div>}
      </div>
    </nav>
    <div className={styles.headerRight}>
      <div className={styles.clock}><span>Horário de Brasília</span><strong>{now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong><small>{now.toLocaleDateString("pt-BR")}</small></div>
      <div className={styles.userWrap}><button className={styles.userButton} type="button" onClick={() => setUserOpen((open) => !open)} aria-expanded={userOpen} aria-haspopup="menu"><ProtectedStorageImage storagePath={user?.profile_image_path} alt={`Foto de ${user?.name || "usuário"}`} className={styles.userImage} fallback={getInitials(user?.name)} /></button>{userOpen && <div className={styles.userMenu} role="menu"><button type="button" onClick={() => go("/meus-dados")} role="menuitem">Alterar dados do perfil</button><button type="button" onClick={onLogout} role="menuitem">Sair da conta</button></div>}</div>
    </div>
  </header>;
}
