import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar({
  activeItem,
  brandImage,
  brandLabel = "Campanha",
  items = [],
  onLogout,
  roleLabel = "Candidato",
  userName = "Usuario",
}) {
  const navigate = useNavigate();
  const hasActiveTerritoryChild = items.some(
    (item) => isTerritoryChild(item.label) && item.label === activeItem,
  );
  const [isTerritoryOpen, setIsTerritoryOpen] = useState(hasActiveTerritoryChild);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <Link className={styles.brand} to="/" aria-label="Voltar para Home">
          {brandImage ? <img src={brandImage} alt="Polis One" /> : null}
          <span>{brandLabel}</span>
        </Link>

        <section className={styles.user} aria-label="Candidato">
          <button
            aria-expanded={isProfileMenuOpen}
            aria-label="Abrir opcoes do perfil"
            className={styles.avatarButton}
            type="button"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
          >
            <span className={styles.avatar}>{getInitials(userName)}</span>
          </button>
          <p className={styles.name}>{userName}</p>
          <p className={styles.role}>{roleLabel}</p>

          {isProfileMenuOpen ? (
            <div className={styles.profileMenu}>
              <button type="button">Alterar dados do perfil</button>
              <button type="button" onClick={handleLogout}>
                Sair da conta
              </button>
            </div>
          ) : null}
        </section>

        <nav aria-label="Menu principal">
          <ul className={styles.sideItems}>
            {items.map((item) => {
              const isTerritoryParent = item.label === "Territorio";
              const isChild = isTerritoryChild(item.label);
              const isActive = item.label === activeItem || (isTerritoryParent && hasActiveTerritoryChild);

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
                      className={`${styles.chevronIcon} ${
                        isTerritoryOpen ? styles.chevronOpen : ""
                      }`}
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
                    <Link className={styles.sideLink} to={item.path}>
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
  );
}

function getInitials(name = "") {
  const [firstName = "", lastName = ""] = name.trim().split(" ");
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim();

  return initials.toUpperCase() || "U";
}

function getIconClass(label = "") {
  const icons = {
    "Portal do Candidato": "iconHome",
    "Visao Geral": "iconTarget",
    "Inteligencia Eleitoral": "iconIdea",
    Municipios: "iconCity",
    Emendas: "iconMoney",
    Equipes: "iconUsers",
    "Check-in": "iconCheck",
    "Pesquisa de campo": "iconSearch",
    Territorio: "iconMap",
    "Mapa eleitoral": "iconMapPin",
    Metricas: "iconBars",
  };

  return icons[label] || "iconTarget";
}

function isTerritoryChild(label = "") {
  return ["Mapa eleitoral", "Metricas"].includes(label);
}

export default Sidebar;
