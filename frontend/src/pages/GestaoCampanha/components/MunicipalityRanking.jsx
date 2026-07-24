import styles from "../GestaoCampanha.module.css";

function MunicipalityRanking({ items }) {
  if (!items.length) {
    return <p className={styles.emptyPanelState}>Nenhum município ranqueado ainda.</p>;
  }

  return (
    <div className={styles.municipalityRanking}>
      {items.map((item, index) => (
        <article className={styles.rankingItem} key={item.name}>
          <strong>{index + 1}º</strong>
          <div>
            <span>{formatMunicipalityName(item.name)}</span>
            <i style={{ "--value": `${item.value}%` }} />
          </div>
          <small>{item.value}%</small>
        </article>
      ))}
    </div>
  );
}

function formatMunicipalityName(value) {
  const text = String(value || "").trim();
  const map = {
    Campinas: "Campinas",
    "Sao Paulo": "São Paulo",
    "Sao Jose dos Campos": "São José dos Campos",
    "Sao Jose do Rio Preto": "São José do Rio Preto",
    "Ribeirao Preto": "Ribeirão Preto",
    Guaratingueta: "Guaratinguetá",
    Taubate: "Taubaté",
    Sumare: "Sumaré",
    Maua: "Mauá",
  };

  return map[text] ?? text;
}

export default MunicipalityRanking;
