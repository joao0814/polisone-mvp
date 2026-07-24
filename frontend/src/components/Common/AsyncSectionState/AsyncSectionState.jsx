import styles from "./AsyncSectionState.module.css";

function AsyncSectionState({
  description,
  state = "empty",
  title,
}) {
  const resolvedTitle =
    title ||
    {
      loading: "Carregando informacoes",
      error: "Não foi possivel carregar",
      empty: "Nenhum dado disponivel",
    }[state];

  return (
    <div className={`${styles.state} ${styles[state]}`}>
      <span className={styles.icon} aria-hidden="true" />
      <strong>{resolvedTitle}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export default AsyncSectionState;
