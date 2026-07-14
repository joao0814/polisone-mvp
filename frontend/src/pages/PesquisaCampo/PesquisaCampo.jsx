import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  cityDistribution,
  cityProblems,
  countdowns,
  electorateProfile,
  filterOptions,
  footerMetrics,
  growingCandidates,
  menuItems,
  perceptionPanels,
  priorityRanking,
  spontaneousVotes,
  summaryCards,
  voteInfluence,
} from "./data/pesquisaCampoData";
import styles from "./PesquisaCampo.module.css";

function PesquisaCampo({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Pesquisa de campo"
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
            <h1>Pesquisa de Campo</h1>
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

        <section className={styles.filtersRow} aria-label="Filtros de pesquisa">
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
                aria-label="Buscar pesquisa"
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

        <section className={styles.summaryGrid} aria-label="Resumo das pesquisas">
          {summaryCards.map((card) => (
            <article className={`${styles.summaryCard} ${styles[card.tone]}`} key={card.title}>
              <span className={styles.summaryIcon} aria-hidden="true" />
              <div>
                <strong>{card.title}</strong>
                <p>{card.value}</p>
                {card.note ? <small>{card.note}</small> : null}
              </div>
            </article>
          ))}
        </section>

        <section className={styles.topGrid} aria-label="Indicadores principais de campo">
          <DonutPanel title="Em qual cidade voce esta?" items={cityDistribution} />

          <BarPanel title="Qual e o principal problema da sua cidade?" items={cityProblems} />

          <RankingPanel
            items={priorityRanking}
            title="Qual dessas areas deveria ser prioridade para um deputado estadual?"
          />
        </section>

        <VoterProfile profile={electorateProfile} />

        <section className={styles.middleGrid} aria-label="Analise eleitoral">
          <DonutPanel title="O que mais influencia seu voto?" items={voteInfluence} />

          <SpontaneousPanel items={spontaneousVotes} />

          <GrowthPanel items={growingCandidates} />
        </section>

        <section className={styles.footerMetrics} aria-label="Metricas finais de pesquisa">
          {footerMetrics.map((metric) => (
            <article key={metric.title}>
              <span>{metric.title}</span>
              <strong>
                {metric.trend ? <i aria-hidden="true" /> : null}
                {metric.value}
              </strong>
              <small>{metric.note}</small>
            </article>
          ))}
        </section>

        <section className={styles.perceptionGrid} aria-label="Percepcao sobre o candidato">
          {perceptionPanels.map((panel, index) => (
            <PerceptionPanel key={`${panel.title}-${index}`} panel={panel} />
          ))}
        </section>
      </section>
    </main>
  );
}

function DonutPanel({ items, title }) {
  return (
    <article className={styles.panel}>
      <h2>{title}</h2>
      <div className={styles.donutWrap}>
        <div className={styles.donut} aria-hidden="true" />
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

function BarPanel({ items, title }) {
  return (
    <article className={styles.panel}>
      <h2>{title}</h2>
      <div className={styles.barList}>
        {items.map((item) => (
          <div className={styles.barRow} key={item.label}>
            <span>{item.label}</span>
            <i style={{ "--value": `${item.value}%` }} />
            <small>{item.value}%</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function RankingPanel({ items, title }) {
  return (
    <article className={styles.panel}>
      <h2>{title}</h2>
      <div className={styles.priorityList}>
        {items.map((item) => (
          <div className={styles.priorityItem} key={item.label}>
            <strong>{item.position}</strong>
            <span>{item.label}</span>
            <small>{item.votes}</small>
            <i style={{ "--value": `${item.value}%` }} />
          </div>
        ))}
      </div>
    </article>
  );
}

function VoterProfile({ profile }) {
  return (
    <section className={styles.profilePanel} aria-label="Perfil de eleitores">
      <div className={styles.genderBlock}>
        <h2>Perfil de Eleitores</h2>
        <p>Genero:</p>

        <div className={styles.genderRow}>
          <div className={`${styles.genderIcon} ${styles.genderFemale}`} />
          <div className={styles.peopleGrid} aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                className={index < 7 ? styles.personYellow : styles.personMuted}
                key={`female-${index}`}
              />
            ))}
          </div>
          <strong className={styles.femaleValue}>{profile.gender.female}%</strong>
        </div>

        <div className={styles.genderRow}>
          <div className={`${styles.genderIcon} ${styles.genderMale}`} />
          <div className={styles.peopleGrid} aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                className={index < 3 ? styles.personBlue : styles.personMuted}
                key={`male-${index}`}
              />
            ))}
          </div>
          <strong className={styles.maleValue}>{profile.gender.male}%</strong>
        </div>
      </div>

      <div className={styles.ageBlock}>
        <h3>Faixa Etaria:</h3>
        {profile.ageRanges.map((range) => (
          <div className={styles.ageRow} key={range.label}>
            <span>{range.label}</span>
            <i style={{ "--value": `${range.value}%` }} />
            <strong>{range.percent}</strong>
          </div>
        ))}
      </div>

      <aside className={styles.averageCard}>
        <h3>Idade Media</h3>
        <strong>{profile.averageAge.total}</strong>
        <div className={styles.averageMeta}>
          <span className={styles.averageFemale}>
            <i aria-hidden="true" />
            {profile.averageAge.female}
          </span>
          <span className={styles.averageMale}>
            <i aria-hidden="true" />
            {profile.averageAge.male}
          </span>
        </div>
      </aside>
    </section>
  );
}

function SpontaneousPanel({ items }) {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Pesquisa Espontanea de votos</h2>
        <button type="button">Deputado Estadual</button>
      </div>
      <div className={styles.spontaneousList}>
        {items.map((item) => (
          <div className={styles.spontaneousItem} key={item.name}>
            <span className={styles.avatar}>{item.avatar}</span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.party}</small>
              <i style={{ "--value": `${item.score}%` }} />
            </div>
            <aside>
              <strong>{item.votes}</strong>
              <small>{item.percent}</small>
            </aside>
          </div>
        ))}
      </div>
      <button className={styles.moreButton} type="button">
        Ver mais
      </button>
    </article>
  );
}

function GrowthPanel({ items }) {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Quem esta crescendo</h2>
        <button type="button">Deputado Estadual</button>
      </div>
      <div className={styles.growthList}>
        {items.map((item) => (
          <div className={styles.growthItem} key={item.name}>
            <strong>{item.position}</strong>
            <span className={styles.avatar}>{item.avatar}</span>
            <p>{item.name}</p>
            <small>{item.votes}</small>
            <em>{item.growth}</em>
          </div>
        ))}
      </div>
      <button className={styles.moreButton} type="button">
        Ver mais
      </button>
    </article>
  );
}

function PerceptionPanel({ panel }) {
  return (
    <article className={styles.perceptionPanel}>
      <h2>{panel.title}</h2>
      <div className={styles.perceptionBars}>
        {panel.items.map((item) => (
          <div className={styles.perceptionRow} key={item.label}>
            <span>{item.label}</span>
            <i style={{ "--value": `${item.value}%` }} />
            <small>{item.value}%</small>
          </div>
        ))}
      </div>
    </article>
  );
}

export default PesquisaCampo;
