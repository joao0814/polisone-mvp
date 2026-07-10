import Sidebar from "../../components/Commom/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  countdowns,
  footerMetrics,
  influenceIndex,
  leadershipDistribution,
  loyaltyIndex,
  menuItems,
  people,
  summaryCards,
} from "./data/equipesData";
import styles from "./Equipes.module.css";

function Equipes({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Equipes"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        roleLabel="Candidato"
        userName={userName}
      />

      <section className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Visao Geral da Campanha</p>
            <h1>Equipes</h1>
          </div>

          <div className={styles.headerActions}>
            <button type="button">
              <span aria-hidden="true" />
              Cadastrar nova lideranca
            </button>
            <button type="button">
              <span aria-hidden="true" />
              Cadastrar representante
            </button>
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

        <form className={styles.mainSearch} aria-label="Buscar lideranca ou representante">
          <input placeholder="Buscar por lideranca/representante" type="search" />
          <button type="button">
            <span aria-hidden="true" />
            Buscar
          </button>
        </form>

        <section className={styles.summaryGrid} aria-label="Resumo de equipes">
          {summaryCards.map((card) => (
            <article className={`${styles.summaryCard} ${styles[card.tone]}`} key={card.title}>
              <span className={styles.summaryIcon} aria-hidden="true" />
              <div>
                <strong>{card.title}</strong>
                <p>{card.value}</p>
                <small>{card.note}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.tablePanel} aria-label="Lista de liderancas e representantes">
          <div className={styles.tableToolbar}>
            <label className={styles.searchBox}>
              <input aria-label="Busca na lista de equipes" placeholder="Busca" type="search" />
              <button type="button" aria-label="Buscar na lista">
                <span aria-hidden="true" />
              </button>
            </label>
          </div>

          <p className={styles.scrollHint}>Arraste a tabela para ver todas as colunas.</p>

          <div className={styles.tableScroll}>
            <table className={styles.peopleTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Lideranca</th>
                  <th>Representante</th>
                  <th>Municipio</th>
                  <th>Cargo/funcao</th>
                  <th>Relacionamento</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className={styles.personCell}>
                        <span className={styles.avatar}>{person.initials}</span>
                        <div>
                          <strong>{person.name}</strong>
                          <small className={styles[person.badgeTone]}>{person.badge}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <BooleanMark active={person.leader} />
                    </td>
                    <td>
                      <BooleanMark active={person.representative} />
                    </td>
                    <td>{person.city}</td>
                    <td>{person.role}</td>
                    <td>
                      <Stars value={person.relationship} />
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" aria-label={`Visualizar ${person.name}`}>
                          <span />
                        </button>
                        <button type="button" aria-label={`Mais opcoes de ${person.name}`}>
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
            <nav aria-label="Paginacao de equipes">
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

        <section className={styles.analyticsGrid} aria-label="Analiticos de equipes">
          <article className={styles.distributionPanel}>
            <h2>Lideranca/Representantes</h2>
            <div className={styles.donutWrap}>
              <div className={styles.donut} aria-hidden="true" />
              <ul>
                {leadershipDistribution.map((item) => (
                  <li key={item.label}>
                    <i style={{ "--color": item.color }} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={styles.loyaltyPanel}>
            <h2>Indice de Lealdade</h2>
            <div className={styles.loyaltyList}>
              {loyaltyIndex.map((item) => (
                <div className={styles.loyaltyRow} key={item.label}>
                  <span>{item.label}</span>
                  <Stars value={item.stars} />
                  <small>{item.value}%</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.influencePanel}>
            <h2>Indice de Influencia</h2>
            <div className={styles.influenceList}>
              {influenceIndex.map((item) => (
                <div className={styles.influenceRow} key={item.label}>
                  <strong>{item.position}</strong>
                  <span>{item.label}</span>
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

function BooleanMark({ active }) {
  return (
    <span className={active ? styles.checkMark : styles.crossMark} aria-label={active ? "Sim" : "Nao"}>
      {active ? "V" : "X"}
    </span>
  );
}

function Stars({ value }) {
  return (
    <span className={styles.stars} aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <i className={index < value ? styles.starFilled : ""} key={`star-${index}`} />
      ))}
    </span>
  );
}

export default Equipes;
