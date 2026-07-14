import styles from "../GestaoCampanha.module.css";

function ProgressBar({ active = false, label, onClick, value }) {
  const className = `${styles.progressRow} ${active ? styles.progressRowActive : ""}`;

  if (onClick) {
    return (
      <button
        className={`${className} ${styles.progressRowButton}`}
        onClick={onClick}
        type="button"
      >
        <span>{label}</span>
        <strong>{value}%</strong>
        <i style={{ "--value": `${value}%` }} />
      </button>
    );
  }

  return (
    <div className={className}>
      <span>{label}</span>
      <strong>{value}%</strong>
      <i style={{ "--value": `${value}%` }} />
    </div>
  );
}

export default ProgressBar;
