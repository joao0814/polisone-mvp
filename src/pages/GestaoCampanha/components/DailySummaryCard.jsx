import styles from "../GestaoCampanha.module.css";
import atividadesRegistradasIcon from "../../../assets/images/visao_geral/icons_centered/atividaderegistradas.png";
import equipesEmCampoIcon from "../../../assets/images/visao_geral/icons_centered/equipesemcampo.png";
import eventosIcon from "../../../assets/images/visao_geral/icons_centered/eventos.png";
import municipiosVisitadosIcon from "../../../assets/images/visao_geral/icons_centered/municipiosvisitados.png";
import novasLiderancasIcon from "../../../assets/images/visao_geral/icons_centered/novasliderancas.png";

const dailyIcons = {
  activities: atividadesRegistradasIcon,
  events: eventosIcon,
  newLeaders: novasLiderancasIcon,
  teams: equipesEmCampoIcon,
  visited: municipiosVisitadosIcon,
};

function DailySummaryCard({ icon, label, note, value }) {
  const iconSrc = dailyIcons[icon];

  return (
    <article className={styles.dailyCard}>
      <span className={styles.dailyIcon} aria-hidden="true">
        {iconSrc ? (
          <img
            alt=""
            className={styles.dailyImage}
            draggable="false"
            src={iconSrc}
          />
        ) : null}
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
