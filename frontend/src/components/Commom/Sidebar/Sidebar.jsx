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
          <div className={styles.avatar}>{getInitials(userName)}</div>
          <p className={styles.name}>{userName}</p>
          <p className={styles.role}>{roleLabel}</p>
        </section>

        <nav aria-label="Menu principal">
          <ul className={styles.sideItems}>
            {items.map((item) => {
              const isActive = item.label === activeItem;
              const content = (
                <>
                  <span className={styles.sideItemsIcons} aria-hidden="true">
                    {item.icon || getIconFallback(item.label)}
                  </span>
                  <span className={styles.itemDescription}>{item.label}</span>
                </>
              );

              return (
                <li
                  className={`${styles.sideItem} ${isActive ? styles.active : ""}`}
                  key={item.label}
                >
                  {item.path ? (
                    <Link className={styles.sideLink} to={item.path}>
                      {content}
                    </Link>
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
          <span className={styles.logoutIcon} aria-hidden="true">
            S
          </span>
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

function getIconFallback(label = "") {
  return label.trim().charAt(0).toUpperCase() || "P";
}

export default Sidebar;
