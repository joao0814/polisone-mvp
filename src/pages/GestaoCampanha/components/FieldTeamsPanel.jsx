import AvatarStack from "./AvatarStack";
import styles from "../GestaoCampanha.module.css";

function FieldTeamsPanel({ teams }) {
  return (
    <div className={styles.fieldTeamsList}>
      {teams.map((team) => (
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
