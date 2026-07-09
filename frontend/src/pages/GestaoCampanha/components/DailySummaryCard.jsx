import styles from "../GestaoCampanha.module.css";

function DailySummaryCard({ label, note, value }) {
  return (
    <article className={styles.dailyCard}>
      <span className={styles.dailyIcon} aria-hidden="true">
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect height="16" rx="2" width="16" x="4" y="5" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 10h16" />
          <path d="m9 16 2 2 4-5" />
        </svg>
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

export default DailySummaryCard;
