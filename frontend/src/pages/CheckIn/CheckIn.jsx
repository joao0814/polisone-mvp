import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  activeTeams,
  activityTypes,
  checkPerformance,
  countdowns,
  menuItems,
  photoCards,
  summaryCards,
} from "./data/checkInData";
import styles from "./CheckIn.module.css";

function CheckIn({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Check-in"
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
            <h1>Check-in</h1>
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

        <section className={styles.summaryGrid} aria-label="Resumo de check-in">
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

        <h2 className={styles.sectionTitle}>Equipes em atividade agora</h2>

        <section className={styles.activityGrid} aria-label="Equipes em atividade">
          <article className={styles.tablePanel}>
            <div className={styles.tableToolbar}>
              <label className={styles.searchBox}>
                <input aria-label="Busca em equipes em atividade" placeholder="Busca" type="search" />
                <button type="button" aria-label="Buscar na lista">
                  <span aria-hidden="true" />
                </button>
              </label>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTeams.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className={styles.personCell}>
                          <span className={styles.avatar}>{team.initials}</span>
                          <div>
                            <strong>{team.name}</strong>
                            <small>{team.city}</small>
                          </div>
                          <em className={styles[team.badgeTone]}>{team.badge}</em>
                        </div>
                      </td>
                      <td>
                        <span className={styles.statusBadge}>{team.status}</span>
                      </td>
                      <td>{team.checkin}</td>
                      <td>{team.checkout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className={styles.pagination}>
              <span>Mostrando 1 a 10 de 48</span>
              <nav aria-label="Paginacao de check-in">
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
          </article>

          <aside className={styles.sidePanels}>
            <DonutPanel items={activityTypes} title="Atividades por tipo" />
            <DonutPanel center="300" items={checkPerformance} title="Desempenho de Check" />
          </aside>
        </section>

        <section className={styles.photosPanel} aria-label="Fotos de check-in e atividades">
          {photoCards.map((card) => (
            <PhotoCard card={card} key={card.title} />
          ))}
        </section>
      </section>
    </main>
  );
}

function DonutPanel({ center, items, title }) {
  return (
    <article className={styles.donutPanel}>
      <h2>{title}</h2>
      <div className={styles.donutWrap}>
        <div className={styles.donut} aria-hidden="true">
          {center ? (
            <>
              <strong>{center}</strong>
              <small>Total</small>
            </>
          ) : null}
        </div>
        <ul>
          {items.map((item) => (
            <li key={item.label}>
              <i style={{ "--color": item.color }} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function PhotoCard({ card }) {
  return (
    <article className={styles.photoCard}>
      <h2>{card.title}</h2>
      <img alt={card.title} src={card.photo} />
      <div className={styles.photoMeta}>
        <strong>
          {card.time}
          <small>{card.date}</small>
        </strong>
        <span>{card.person}</span>
      </div>
      <div className={styles.locationBox}>
        <strong>{card.location}</strong>
        <span>{card.role}</span>
        <small>Lideranca: {card.leader}</small>
      </div>
      <button className={styles[card.tone]} type="button">
        {card.action}
      </button>
    </article>
  );
}

export default CheckIn;
