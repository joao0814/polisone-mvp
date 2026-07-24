import { useState } from "react";
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
  const normalizedActiveItem = normalizeLabel(activeItem);
  const hasActiveTerritoryChild = items.some(
    (item) => isTerritoryChild(item.label) && normalizeLabel(item.label) === normalizedActiveItem,
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
              <button type="button" onClick={() => navigate("/meus-dados")}>
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
              const normalizedLabel = normalizeLabel(item.label);
              const isTerritoryParent = normalizedLabel === "territorio";
              const isChild = isTerritoryChild(item.label);
              const isActive =
                normalizedLabel === normalizedActiveItem ||
                (isTerritoryParent && hasActiveTerritoryChild);

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
    "portal do candidato": "iconHome",
    "visao geral": "iconTarget",
    "inteligencia eleitoral": "iconIdea",
    municipios: "iconCity",
    emendas: "iconMoney",
    equipes: "iconUsers",
    "check-in": "iconCheck",
    "pesquisa de campo": "iconSearch",
    territorio: "iconMap",
    "mapa eleitoral": "iconMapPin",
    metricas: "iconBars",
  };

  return icons[normalizeLabel(label)] || "iconTarget";
}

function isTerritoryChild(label = "") {
  return ["mapa eleitoral", "metricas"].includes(normalizeLabel(label));
}

function normalizeLabel(label = "") {
  return String(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default Sidebar;
