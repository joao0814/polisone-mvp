import styles from "../GestaoCampanha.module.css";
import { getAvatarPhoto } from "./avatarPhoto";

function RealtimeActivities({ items }) {
  return (
    <div className={styles.activitiesList}>
      {items.map((item) => (
        <article className={styles.activityItem} key={`${item.time}-${item.person}`}>
          <span className={styles.activityAvatar}>
            <img alt={item.person} className={styles.avatarPhoto} src={getAvatarPhoto(item.person)} />
          </span>
          <time>{item.time}</time>
          <p>{item.description}</p>
          <strong>{item.tag}</strong>
        </article>
      ))}
    </div>
  );
}

export default RealtimeActivities;
