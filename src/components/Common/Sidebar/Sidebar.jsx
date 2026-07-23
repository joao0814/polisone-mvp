import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProtectedStorageImage from "../ProtectedStorageImage/ProtectedStorageImage";
import styles from "./Sidebar.module.css";

function Sidebar({
  activeItem,
  brandImage,
  brandLabel = "Campanha",
  items = [],
  onLogout,
  profileImagePath,
  roleLabel = "Candidato",
  userName = "Usuario",
}) {
  const navigate = useNavigate();
  const hasActiveTerritoryChild = items.some(
    (item) => isTerritoryChild(item.label) && item.label === activeItem,
  );
  const [isTerritoryOpen, setIsTerritoryOpen] = useState(hasActiveTerritoryChild);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(min-width: 761px)");
    const syncState = (event) => {
      if (event.matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    syncState(mediaQuery);
    mediaQuery.addEventListener("change", syncState);

    return () => {
      mediaQuery.removeEventListener("change", syncState);
    };
  }, []);

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    navigate("/login", { replace: true });
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  return (
    <>
      <button
        aria-expanded={isMobileSidebarOpen}
        aria-label={isMobileSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        className={styles.mobileToggle}
        type="button"
        onClick={() => setIsMobileSidebarOpen((current) => !current)}
      >
        <span className={styles.mobileToggleLine} />
        <span className={styles.mobileToggleLine} />
        <span className={styles.mobileToggleLine} />
      </button>

      {isMobileSidebarOpen ? (
        <button
          aria-label="Fechar menu lateral"
          className={styles.backdrop}
          type="button"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <aside className={`${styles.sidebar} ${isMobileSidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarContent}>
          <Link className={styles.brand} to="/" aria-label="Voltar para Home" onClick={closeMobileSidebar}>
            {brandImage ? <img src={brandImage} alt="Polis One" /> : null}
            <span>{brandLabel}</span>
          </Link>

          <section className={styles.user} aria-label="Candidato">
            <button
              aria-expanded={isProfileMenuOpen}
              aria-label="Abrir opções do perfil"
              className={styles.avatarButton}
              type="button"
              onClick={() => setIsProfileMenuOpen((current) => !current)}
            >
              <ProtectedStorageImage
                storagePath={profileImagePath}
                alt={`Foto de ${userName}`}
                className={styles.avatarImage}
                fallback={<span className={styles.avatar}>{getInitials(userName)}</span>}
              />
            </button>
            <p className={styles.name}>{userName}</p>
            <p className={styles.role}>{roleLabel}</p>

            {isProfileMenuOpen ? (
              <div className={styles.profileMenu}>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileSidebar();
                    navigate("/meus-dados");
                  }}
                >
                  Alterar dados do perfil
                </button>
                <button type="button" onClick={handleLogout}>
                  Sair da conta
                </button>
              </div>
            ) : null}
          </section>

          <nav aria-label="Menu principal">
            <ul className={styles.sideItems}>
              {items.map((item) => {
                const isTerritoryParent = item.label === "Território";
                const isChild = isTerritoryChild(item.label);
                const isActive =
                  item.label === activeItem || (isTerritoryParent && hasActiveTerritoryChild);

                if (isChild && !isTerritoryOpen) {
                  return null;
                }

                const content = (
                  <>
                    <span
                      className={`${styles.sideItemsIcons} ${styles[getIconClass(item.label)]}`}
                      aria-hidden="true"
                    />
                    <span className={styles.itemDescription}>{item.label}</span>
                    {isTerritoryParent ? (
                      <span
                        className={`${styles.chevronIcon} ${isTerritoryOpen ? styles.chevronOpen : ""}`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </>
                );

                return (
                  <li
                    className={`${styles.sideItem} ${isActive ? styles.active : ""} ${
                      isChild ? styles.childItem : ""
                    }`}
                    key={item.label}
                  >
                    {item.path ? (
                      <Link className={styles.sideLink} to={item.path} onClick={closeMobileSidebar}>
                        {content}
                      </Link>
                    ) : isTerritoryParent ? (
                      <button
                        aria-expanded={isTerritoryOpen}
                        className={styles.sideButton}
                        type="button"
                        onClick={() => setIsTerritoryOpen((current) => !current)}
                      >
                        {content}
                      </button>
                    ) : (
                      <button className={styles.sideButton} type="button">
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <footer className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} type="button" onClick={handleLogout}>
            <span className={styles.logoutIcon} aria-hidden="true" />
            <span className={styles.itemDescription}>Sair</span>
          </button>
        </footer>
      </aside>
    </>
  );
}

function getInitials(name = "") {
  const [firstName = "", lastName = ""] = name.trim().split(" ");
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim();

  return initials.toUpperCase() || "U";
}

function getIconClass(label = "") {
  const icons = {
    "Portal do Candidato": "iconHome",
    "Visão Geral": "iconTarget",
    "Inteligência Eleitoral": "iconIdea",
    Municípios: "iconCity",
    Emendas: "iconMoney",
    Equipes: "iconUsers",
    "Check-in": "iconCheck",
    "Pesquisa de campo": "iconSearch",
    Território: "iconMap",
    "Mapa eleitoral": "iconMapPin",
    Métricas: "iconBars",
  };

  return icons[label] || "iconTarget";
}

function isTerritoryChild(label = "") {
  return ["Mapa eleitoral", "Métricas"].includes(label);
}

export default Sidebar;
