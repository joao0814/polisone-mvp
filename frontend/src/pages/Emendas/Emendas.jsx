import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  amendments,
  cityRanking,
  countdowns,
  destinationTypes,
  filterOptions,
  financialCards,
  footerMetrics,
  menuItems,
  statusDistribution,
} from "./data/emendasData";
import styles from "./Emendas.module.css";

function Emendas({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Emendas"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        profileImagePath={session?.user?.profile_image_path}
        roleLabel="Candidato"
        userName={userName}
      />

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Visao Geral da Campanha</p>
            <h1>Emendas</h1>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.countdowns} aria-label="Contagem regressiva">
              {countdowns.map((countdown) => (
                <article className={styles.countdownCard} key={countdown.label}>
                  <span className={styles.countdownTitle}>Contagem regressiva</span>
                  <div className={styles.countdownBody}>
                    <strong>{countdown.value}</strong>
                    <p>{countdown.label}</p>
                    <i style={{ "--value": `${countdown.progress}%` }} />
                  </div>
                  <small>{countdown.footer}</small>
                </article>
              ))}
            </div>

            <time className={styles.dateBox} dateTime="2026-10-04T10:06">
              <strong>04/10</strong>
              <span />
              <small>10:06</small>
            </time>
          </div>
        </header>

        <section className={styles.filtersRow} aria-label="Filtros de emendas">
          <form className={styles.filtersPanel}>
            <label>
              <span>TIPO</span>
              <select defaultValue={filterOptions.type[0]}>
                {filterOptions.type.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Ano</span>
              <select defaultValue={filterOptions.year[0]}>
                {filterOptions.year.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Situacao</span>
              <select defaultValue={filterOptions.status[0]}>
                {filterOptions.status.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Municipio</span>
              <select defaultValue={filterOptions.city[0]}>
                {filterOptions.city.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Entidade</span>
              <select defaultValue={filterOptions.entity[0]}>
                {filterOptions.entity.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <div className={styles.searchLine}>
              <input
                aria-label="Buscar emendas"
                placeholder="Buscar emendas, entidades e etc..."
                type="search"
              />
              <button type="button">
                <span aria-hidden="true" />
                Buscar
              </button>
            </div>
          </form>

          <button className={styles.addButton} type="button">
            Cadastrar nova emenda
          </button>
        </section>

        <section className={styles.financialGrid} aria-label="Resumo financeiro">
          {financialCards.map((card) => (
            <article className={`${styles.financialCard} ${styles[card.tone]}`} key={card.title}>
              <span className={styles.financeIcon} aria-hidden="true" />
              <div>
                <strong>{card.title}</strong>
                <p>{card.value}</p>
                <small>{card.note}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.tablePanel} aria-label="Lista de emendas">
          <div className={styles.tableToolbar}>
            <label className={styles.searchBox}>
              <input aria-label="Busca na lista de emendas" placeholder="Busca" type="search" />
              <button type="button" aria-label="Buscar na lista">
                <span aria-hidden="true" />
              </button>
            </label>
          </div>

          <p className={styles.scrollHint}>Arraste a tabela para ver todas as colunas.</p>

          <div className={styles.tableScroll}>
            <table className={styles.amendmentsTable}>
              <thead>
                <tr>
                  <th>No Emenda</th>
                  <th>Tipo</th>
                  <th>Destino</th>
                  <th>Objeto</th>
                  <th>Valor destinado</th>
                  <th>Situacao</th>
                  <th>Data destinacao</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {amendments.map((amendment) => (
                  <tr key={amendment.id}>
                    <td>{amendment.number}</td>
                    <td>
                      <span className={styles.typeBadge}>{amendment.type}</span>
                    </td>
                    <td>{amendment.destination}</td>
                    <td>{amendment.object}</td>
                    <td>{amendment.value}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(amendment.status)}`}>
                        {amendment.status}
                      </span>
                    </td>
                    <td>{amendment.date}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" aria-label="Visualizar emenda">
                          <span />
                        </button>
                        <button type="button" aria-label="Mais opcoes da emenda">
                          <i />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className={styles.pagination}>
            <span>Mostrando 1 a 10 de 48</span>
            <nav aria-label="Paginacao de emendas">
              {Array.from({ length: 10 }).map((_, index) => (
                <button
                  className={index === 0 ? styles.pageActive : ""}
                  key={`page-${index + 1}`}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </nav>
            <button type="button">10 por pagina</button>
          </footer>
        </section>

        <section className={styles.analyticsGrid} aria-label="Analiticos de emendas">
          <article className={styles.statusPanel}>
            <h2>Distribuicao por situacao</h2>
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <strong>R$24,68</strong>
                <span>Milhoes</span>
                <small>Total</small>
              </div>
              <ul>
                {statusDistribution.map((item) => (
                  <li key={item.label}>
                    <i style={{ "--color": item.color }} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={styles.destinationPanel}>
            <h2>Destinacao por tipo</h2>
            <div className={styles.destinationList}>
              {destinationTypes.map((item) => (
                <div className={styles.destinationRow} key={item.label}>
                  <span>{item.label}</span>
                  <i style={{ "--value": `${item.value}%` }} />
                  <small>{item.value}%</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.rankingPanel}>
            <h2>Ranking de Municipios</h2>
            <p>Top 5 municipios contemplados</p>
            <div className={styles.rankingList}>
              {cityRanking.map((item) => (
                <div className={styles.rankingItem} key={item.city}>
                  <strong>{item.position}</strong>
                  <span>{item.city}</span>
                  <i style={{ "--value": `${item.value}%` }} />
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className={styles.footerMetrics} aria-label="Indicadores finais">
          {footerMetrics.map((metric) => (
            <article key={metric.title}>
              <span>{metric.title}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function getStatusClass(status) {
  if (status === "Pago/Concluido") return styles.statusPaid;
  if (status === "Em execucao") return styles.statusRunning;
  return styles.statusRelease;
}

export default Emendas;
