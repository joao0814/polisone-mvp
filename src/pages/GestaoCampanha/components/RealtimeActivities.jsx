import styles from "../GestaoCampanha.module.css";

function RealtimeActivities({ items }) {
  return (
    <div className={styles.activitiesList}>
      {items.map((item) => (
        <article className={styles.activityItem} key={`${item.time}-${item.person}`}>
          <span className={styles.activityAvatar}>{getInitials(item.person)}</span>
          <time>{item.time}</time>
          <p>{item.description}</p>
          <strong>{item.tag}</strong>
        </article>
      ))}
    </div>
  );
}

function getInitials(name) {
  const [firstName = "", lastName = ""] = name.split(" ");
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default RealtimeActivities;
