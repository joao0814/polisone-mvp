import styles from "../GestaoCampanha.module.css";
import metaDeVotosIcon from "../../../assets/images/visao_geral/icons/metadevotos.png";
import votosNecessariosIcon from "../../../assets/images/visao_geral/icons/votosnecessarios.png";
import totalDeVotosIcon from "../../../assets/images/visao_geral/icons/total de votos 1.png";
import municipiosAtivosIcon from "../../../assets/images/visao_geral/icons/municipiosativos.png";
import liderancasIcon from "../../../assets/images/visao_geral/icons/liderança 1.png";
import representantesIcon from "../../../assets/images/visao_geral/icons/representantes 1.png";

const metricIcons = {
  chart: metaDeVotosIcon,
  ballot: votosNecessariosIcon,
  vote: totalDeVotosIcon,
  pin: municipiosAtivosIcon,
  network: liderancasIcon,
  person: representantesIcon,
};

function MetricCard({ icon, label, value }) {
  const iconSrc = metricIcons[icon];

  return (
    <article className={styles.metricCard}>
      <span className={styles.metricIconBox} aria-hidden="true">
        {iconSrc ? (
          <img
            alt=""
            className={styles.metricImage}
            draggable="false"
            src={iconSrc}
          />
        ) : null}
      </span>
      <div className={styles.metricContent}>
        <span title={label}>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default MetricCard;
