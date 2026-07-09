import styles from "../GestaoCampanha.module.css";

function CostRanking({ items }) {
  return (
    <div className={styles.costRanking}>
      {items.map((item, index) => (
        <article className={styles.costRow} key={item.region}>
          <span>{item.region}</span>
          <strong style={{ "--scale": `${100 - index * 10}%` }}>{item.amount}</strong>
          <small>{item.percent}%</small>
        </article>
      ))}
    </div>
  );
}

export default CostRanking;
