import CampaignStatusPanel from "../../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import styles from "../GestaoCampanha.module.css";

function CampaignHeader({ userName }) {
  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <span className={styles.eyebrow}>Visão Geral</span>
        <h1>Bom dia, {userName}!</h1>
        <p>Aqui está o panorama completo da sua campanha no momento atual.</p>
      </div>

      <CampaignStatusPanel className={styles.headerRight} mode="dashboard" />
    </header>
  );
}

export default CampaignHeader;
