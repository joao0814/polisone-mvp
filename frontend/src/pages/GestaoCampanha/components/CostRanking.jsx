import styles from "../GestaoCampanha.module.css";

const labelMap = {
  "Regiao metropolitana de SP": "Região metropolitana de SP",
  "Regiao de Campinas": "Região de Campinas",
  "Vale do Paraiba": "Vale do Paraíba",
  "Regiao de Ribeirao Preto": "Região de Ribeirão Preto",
  "Regiao de Sorocaba": "Região de Sorocaba",
  "Regiao de Bauru": "Região de Bauru",
  "Regiao de Sao Jose do Rio Preto": "Região de São José do Rio Preto",
  "Sao Paulo": "São Paulo",
  "Sao Jose dos Campos": "São José dos Campos",
  "Sao Jose do Rio Preto": "São José do Rio Preto",
  "Ribeirao Preto": "Ribeirão Preto",
  "Guaratingueta": "Guaratinguetá",
  Taubate: "Taubaté",
  Sumare: "Sumaré",
  Maua: "Mauá",
};

function CostRanking({ items }) {
  if (!items.length) {
    return <p className={styles.emptyPanelState}>Nenhum custo registrado ainda.</p>;
  }

  return (
    <div className={styles.costRanking}>
      {items.map((item, index) => (
        <article className={styles.costRow} key={item.id ?? item.region}>
          <span>{formatLabel(item.region)}</span>
          <strong style={{ "--scale": `${100 - index * 10}%` }}>{item.amount}</strong>
          <small>{item.percent}%</small>
        </article>
      ))}
    </div>
  );
}

function formatLabel(value) {
  const text = String(value || "").trim();
  return labelMap[text] ?? text;
}

export default CostRanking;
