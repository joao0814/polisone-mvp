import styles from "../GestaoCampanha.module.css";
import metaDeVotosIcon from "../../../assets/images/visao_geral/icons_centered/metadevotos.png";
import votosNecessariosIcon from "../../../assets/images/visao_geral/icons_centered/votosnecessarios.png";
import totalDeVotosIcon from "../../../assets/images/visao_geral/icons_centered/total de votos 1.png";
import municipiosAtivosIcon from "../../../assets/images/visao_geral/icons_centered/municipiosativos.png";
import liderancasIcon from "../../../assets/images/visao_geral/icons_centered/liderança 1.png";
import representantesIcon from "../../../assets/images/visao_geral/icons_centered/representantes 1.png";

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
