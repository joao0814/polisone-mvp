import styles from "../GestaoCampanha.module.css";

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
          {getInitials(person)}
        </span>
      ))}
    </div>
  );
}

function getInitials(name) {
  const [firstName = "", lastName = ""] = name.split(" ");
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default AvatarStack;
