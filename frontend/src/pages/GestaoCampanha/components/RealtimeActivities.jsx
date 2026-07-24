import styles from "../GestaoCampanha.module.css";

const textMap = {
  "Sao Paulo": "São Paulo",
  "Sao Jose dos Campos": "São José dos Campos",
  "Sao Jose do Rio Preto": "São José do Rio Preto",
  "Ribeirao Preto": "Ribeirão Preto",
  Guaratingueta: "Guaratinguetá",
  Taubate: "Taubaté",
  Sumare: "Sumaré",
  Maua: "Mauá",
  "reuniao": "reunião",
  "adesivagem": "adesivagem",
  "pesquisa_campo": "pesquisa campo",
  "check-in": "check-in",
  "cancelado": "cancelado",
  "concluiu": "concluiu",
  "iniciou": "iniciou",
  "outro": "outro",
};

function RealtimeActivities({ items }) {
  if (!items.length) {
    return <p className={styles.emptyPanelState}>Nenhuma atividade registrada ainda.</p>;
  }

  return (
    <div className={styles.activitiesList}>
      {items.slice(0, 10).map((item) => (
        <article
          className={styles.activityItem}
          key={`${item.time}-${item.person}-${item.description}`}
        >
          <span className={styles.activityAvatar}>{getInitials(item.person)}</span>
          <time>{item.time}</time>
          <p>{formatText(item.description)}</p>
          <strong>{formatText(item.tag)}</strong>
        </article>
      ))}
    </div>
  );
}

function getInitials(name) {
  const [firstName = "", lastName = ""] = String(name || "").split(" ");
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatText(value) {
  let text = String(value || "").trim();

  Object.entries(textMap).forEach(([from, to]) => {
    const pattern = new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi");
    text = text.replace(pattern, to);
  });

  return text.replace(/_/g, " ");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default RealtimeActivities;
