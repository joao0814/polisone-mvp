import styles from "../GestaoCampanha.module.css";

function MunicipalityRanking({ items }) {
  return (
    <div className={styles.municipalityRanking}>
      {items.map((item, index) => (
        <article className={styles.rankingItem} key={item.name}>
          <strong>{index + 1}º</strong>
          <div>
            <span>{item.name}</span>
            <i style={{ "--value": `${item.value}%` }} />
          </div>
          <small>{item.value}%</small>
        </article>
      ))}
    </div>
  );
}

export default MunicipalityRanking;
