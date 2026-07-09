import styles from "../GestaoCampanha.module.css";

function DashboardPanel({ actions, children, className = "", subtitle, title }) {
  return (
    <article className={`${styles.panel} ${className}`}>
      <div className={styles.panelHeader}>
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.panelActions}>{actions}</div> : null}
      </div>
      {children}
    </article>
  );
}

export default DashboardPanel;
