import styles from "../GestaoCampanha.module.css";

function ProgressBar({ label, value }) {
  return (
    <div className={styles.progressRow}>
      <span>{label}</span>
      <strong>{value}%</strong>
      <i style={{ "--value": `${value}%` }} />
    </div>
  );
}

export default ProgressBar;
