import styles from "../GestaoCampanha.module.css";
import atividadesRegistradasIcon from "../../../assets/images/visao_geral/icons/atividaderegistradas.png";
import equipesEmCampoIcon from "../../../assets/images/visao_geral/icons/equipesemcampo.png";
import eventosIcon from "../../../assets/images/visao_geral/icons/eventos.png";
import municipiosVisitadosIcon from "../../../assets/images/visao_geral/icons/municipiosvisitados.png";
import novasLiderancasIcon from "../../../assets/images/visao_geral/icons/novasliderancas.png";

const summaryIcons = {
  Eventos: eventosIcon,
  "Municípios visitados": municipiosVisitadosIcon,
  "Equipes em campo": equipesEmCampoIcon,
  "Atividades registradas": atividadesRegistradasIcon,
  "Novas lideranças": novasLiderancasIcon,
};

function normalizeLabel(label) {
  return String(label || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSummaryIcon(label) {
  const directMatch = summaryIcons[label];
  if (directMatch) return directMatch;

  const normalized = normalizeLabel(label);

  if (normalized === "Municipios visitados") return municipiosVisitadosIcon;
  if (normalized === "Equipes em campo") return equipesEmCampoIcon;
  if (normalized === "Atividades registradas") return atividadesRegistradasIcon;
  if (normalized === "Novas liderancas") return novasLiderancasIcon;
  return eventosIcon;
}

function DailySummaryCard({ label, note, value }) {
  const iconSrc = getSummaryIcon(label);

  return (
    <article className={styles.dailyCard}>
      <span className={styles.dailyIcon} aria-hidden="true">
        <img
          alt=""
          className={styles.dailyImage}
          draggable="false"
          src={iconSrc}
        />
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
