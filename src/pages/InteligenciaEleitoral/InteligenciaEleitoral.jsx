import Sidebar from "../../components/Common/Sidebar/Sidebar";
import cityNightImage from "../../assets/images/campaign/sao-jose-night.jpg";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  ageRanges,
  ballotStats,
  businessStats,
  cityStats,
  countdowns,
  menuItems,
  mostVoted,
} from "./data/inteligenciaEleitoralData";
import styles from "./InteligenciaEleitoral.module.css";

const votedAvatars = {
  "Dr. Elton": "https://i.pravatar.cc/120?img=12",
  "Dulce Rita": "https://i.pravatar.cc/120?img=32",
  "Letícia Aguiar": "https://i.pravatar.cc/120?img=47",
  "LetÃ­cia Aguiar": "https://i.pravatar.cc/120?img=47",
  "Carlos Abranches": "https://i.pravatar.cc/120?img=14",
  "Fernando Petiti": "https://i.pravatar.cc/120?img=18",
};

function getVotedAvatar(name) {
  return votedAvatars[name] ?? "https://i.pravatar.cc/120?img=14";
}

function InteligenciaEleitoral({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Inteligencia Eleitoral"
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
            <p className={styles.kicker}>Visão Geral da Campanha</p>
            <h1>Inteligencia Eleitoral</h1>
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

        <section className={styles.insightGrid} aria-label="Filtros e contexto">
          <form className={styles.filterBar}>
            <label>
              <span>UF</span>
              <select defaultValue="SP">
                <option>SP</option>
              </select>
            </label>
            <label>
              <span>Região</span>
              <select defaultValue="Vale do Paraíba">
                <option>Vale do Paraíba</option>
              </select>
            </label>
            <label>
              <span>Município</span>
              <select defaultValue="São José dos Campos">
                <option>São José dos Campos</option>
              </select>
            </label>
            <button type="button">Analisar</button>
          </form>

          <aside className={styles.salaryInsight}>
            <strong>+20%</strong>
            <p>
              Contexto Salarial: A media salarial na cidade tende a superar as
              medias nacionais, com estimativas que apontam valores cerca de 20%
              acima da media do pais.
            </p>
          </aside>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.cityPanel}>
            <h2>São José dos Campos</h2>

            <div className={styles.cityOverview}>
              <figure className={styles.cityPhoto}>
                <img src={cityNightImage} alt="Vista noturna de São José dos Campos" />
              </figure>

              <div className={styles.workforceCard}>
                <h3>Força de Trabalho por Região</h3>
                <p>
                  Municipio com alto potencial eleitoral, boas taxas de
                  engajamento e historico consistente de crescimento do seu grupo
                  politico.
                </p>

                <div className={styles.statGrid}>
                  {cityStats.map((stat) => (
                    <article key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </article>
                  ))}
                </div>

                <div className={styles.ballotGrid}>
                  {ballotStats.map((stat) => (
                    <article key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      {stat.note ? <small>{stat.note}</small> : null}
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.businessGrid}>
              {businessStats.map((stat) => (
                <article key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>
          </article>

          <aside className={styles.rankingPanel}>
            <div className={styles.panelTitle}>
              <h2>Mais votados 2022</h2>
              <button type="button">Deputado Estadual</button>
            </div>

            <div className={styles.votedList}>
              {mostVoted.map((candidate) => (
                <article className={styles.votedItem} key={candidate.name}>
                  <img
                    className={styles.votedAvatar}
                    src={getVotedAvatar(candidate.name)}
                    alt={`Foto de ${candidate.name}`}
                  />
                  <div className={styles.votedInfo}>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.party}</span>
                    <i style={{ "--score": `${candidate.score}%` }} />
                  </div>
                  <div className={styles.votedScore}>
                    <strong>{candidate.votes}</strong>
                    <span>{candidate.percent}</span>
                  </div>
                </article>
              ))}
            </div>

            <button className={styles.moreButton} type="button">
              Ver mais
            </button>
          </aside>
        </section>

        <section className={styles.profilePanel} aria-label="Perfil de eleitores">
          <div className={styles.genderBlock}>
            <h2>Perfil de Eleitores</h2>
            <p>Genero:</p>

            <div className={styles.genderRow}>
              <div className={`${styles.genderIcon} ${styles.genderFemale}`} />
              <div className={styles.peopleGrid} aria-hidden="true">
                {Array.from({ length: 20 }).map((_, index) => (
                  <span
                    className={index < 14 ? styles.personYellow : styles.personMuted}
                    key={`female-${index}`}
                  />
                ))}
              </div>
              <strong className={styles.femaleValue}>70%</strong>
            </div>

            <div className={styles.genderRow}>
              <div className={`${styles.genderIcon} ${styles.genderMale}`} />
              <div className={styles.peopleGrid} aria-hidden="true">
                {Array.from({ length: 20 }).map((_, index) => (
                  <span
                    className={index < 6 ? styles.personBlue : styles.personMuted}
                    key={`male-${index}`}
                  />
                ))}
              </div>
              <strong className={styles.maleValue}>30%</strong>
            </div>
          </div>

          <div className={styles.ageBlock}>
            <h3>Faixa Etaria:</h3>
            {ageRanges.map((range) => (
              <div className={styles.ageRow} key={range.label}>
                <span>{range.label}</span>
                <i style={{ "--value": `${range.value}%` }} />
                <strong>{range.percent}</strong>
              </div>
            ))}
          </div>

          <aside className={styles.averageCard}>
            <h3>Idade Media</h3>
            <strong>32</strong>
            <div className={styles.averageMeta}>
              <span className={styles.averageFemale}>
                <i aria-hidden="true" />
                25
              </span>
              <span className={styles.averageMale}>
                <i aria-hidden="true" />
                35
              </span>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default InteligenciaEleitoral;
