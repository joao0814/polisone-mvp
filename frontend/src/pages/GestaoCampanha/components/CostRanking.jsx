import styles from "../GestaoCampanha.module.css";

function CostRanking({ items }) {
  if (!items.length) {
    return <p className={styles.emptyPanelState}>Nenhum custo registrado ainda.</p>;
  }

  return (
    <div className={styles.costRanking}>
      {items.map((item, index) => (
        <article className={styles.costRow} key={item.id ?? item.region}>
          <span>{item.region}</span>
          <strong style={{ "--scale": `${100 - index * 10}%` }}>{item.amount}</strong>
          <small>{item.percent}%</small>
        </article>
      ))}
    </div>
  );
}

export default CostRanking;
