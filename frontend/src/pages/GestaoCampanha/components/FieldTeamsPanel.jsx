import AvatarStack from "./AvatarStack";
import styles from "../GestaoCampanha.module.css";

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
            <span>{team.city}</span>
          </div>
          <AvatarStack people={team.people} />
          <small>{team.activities} Atividades</small>
        </article>
      ))}
    </div>
  );
}

export default FieldTeamsPanel;
