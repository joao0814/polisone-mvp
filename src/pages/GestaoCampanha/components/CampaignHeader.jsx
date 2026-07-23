import styles from "../GestaoCampanha.module.css";

const countdowns = [
  { value: "38", label: "Dias para o início da campanha", progress: 68 },
  { value: "72", label: "Dias para o dia da eleição", progress: 24 },
];

function CampaignHeader({ userName }) {
  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <span className={styles.eyebrow}>Visão Geral</span>
        <h1>Bom dia, {userName}!</h1>
        <p>Aqui está o panorama completo da sua campanha no momento atual.</p>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.countdownStack} aria-label="Contagem regressiva">
          {countdowns.map((item) => (
            <article className={styles.countdownCard} key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <i style={{ "--value": `${item.progress}%` }} />
            </article>
          ))}
        </div>
        <time className={styles.dateBox} dateTime="2026-10-04">
          <strong>04/10</strong>
          <span />
          <small>10:06</small>
        </time>
      </div>
    </header>
  );
}

export default CampaignHeader;
