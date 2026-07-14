import styles from "../GestaoCampanha.module.css";

function MetricCard({ icon, label, value }) {
  return (
    <article className={styles.metricCard}>
      <span className={styles.metricIconBox} aria-hidden="true">
        <MetricIcon name={icon} />
      </span>
      <div className={styles.metricContent}>
        <span title={label}>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function MetricIcon({ name }) {
  const commonProps = {
    className: styles.metricSvg,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2.2",
    viewBox: "0 0 24 24",
  };

  if (name === "chart") {
    return (
      <svg {...commonProps}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16v-6" />
      </svg>
    );
  }

  if (name === "ballot") {
    return (
      <svg {...commonProps}>
        <rect height="16" rx="2" width="16" x="4" y="4" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    );
  }

  if (name === "vote") {
    return (
      <svg {...commonProps}>
        <path d="M7 10h10l-2 8H9z" />
        <path d="M9 10V7h6v3" />
        <path d="m10 14 2 2 4-5" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...commonProps}>
        <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    );
  }

  if (name === "network") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="6" r="2.5" />
        <circle cx="6.5" cy="17" r="2.5" />
        <circle cx="17.5" cy="17" r="2.5" />
        <path d="m10.8 8.3-3.1 6.4" />
        <path d="m13.2 8.3 3.1 6.4" />
        <path d="M9 17h6" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  );
}

export default MetricCard;
