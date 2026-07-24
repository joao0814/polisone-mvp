import AvatarStack from "./AvatarStack";
import styles from "../GestaoCampanha.module.css";

const cityMap = {
  "Sao Paulo": "São Paulo",
  "Sao Jose dos Campos": "São José dos Campos",
  "Sao Jose do Rio Preto": "São José do Rio Preto",
  "Ribeirao Preto": "Ribeirão Preto",
  Guaratingueta: "Guaratinguetá",
  Taubate: "Taubaté",
  Sumare: "Sumaré",
  Maua: "Mauá",
};

function FieldTeamsPanel({ teams }) {
  if (!teams.length) {
    return <p className={styles.emptyPanelState}>Nenhuma equipe em campo agora.</p>;
  }

  return (
    <div className={styles.fieldTeamsList}>
      {teams.slice(0, 10).map((team) => (
        <article className={styles.fieldTeamItem} key={team.id}>
          <span className={styles.teamMarker} aria-hidden="true" />
          <div className={styles.teamInfo}>
            <strong>{team.name}</strong>
            <span>{formatCity(team.city)}</span>
          </div>
          <AvatarStack people={team.people} />
          <small>{team.activities} Atividades</small>
        </article>
      ))}
    </div>
  );
}

function formatCity(value) {
  const text = String(value || "").trim();
  return cityMap[text] ?? text;
}

export default FieldTeamsPanel;
