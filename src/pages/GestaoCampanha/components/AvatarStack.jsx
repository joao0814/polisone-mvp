import styles from "../GestaoCampanha.module.css";
import { getAvatarPhoto } from "./avatarPhoto";

function AvatarStack({ people }) {
  return (
    <div className={styles.avatarStack} aria-label={people.join(", ")}>
      {people.slice(0, 3).map((person, index) => (
        <span
          className={styles.teamAvatar}
          key={person}
          style={{ "--avatar-index": index }}
          title={person}
        >
          <img alt={person} className={styles.avatarPhoto} src={getAvatarPhoto(person)} />
        </span>
      ))}
    </div>
  );
}

export default AvatarStack;
