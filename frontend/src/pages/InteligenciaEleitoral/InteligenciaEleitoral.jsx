import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import cityNightImage from "../../assets/images/campaign/sao-jose-night.jpg";
import logoNav from "../../assets/images/home/logo nav.png";
import AsyncSectionState from "../../components/Common/AsyncSectionState/AsyncSectionState";
import CampaignStatusPanel from "../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import {
  intelligenceFilters,
  intelligenceScenarios,
  menuItems,
} from "./data/inteligenciaEleitoralData";
import styles from "./InteligenciaEleitoral.module.css";

function InteligenciaEleitoral({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [draftFilters, setDraftFilters] = useState({
    uf: intelligenceFilters.uf[0] ?? "SP",
    region: intelligenceFilters.region[0] ?? "",
    city:
      intelligenceFilters.city?.SP?.[intelligenceFilters.region[0] ?? ""]?.[0] ?? "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    uf: intelligenceFilters.uf[0] ?? "SP",
    region: intelligenceFilters.region[0] ?? "",
    city:
      intelligenceFilters.city?.SP?.[intelligenceFilters.region[0] ?? ""]?.[0] ?? "",
  });
  const [showAllCandidates, setShowAllCandidates] = useState(false);

  const regionOptions = intelligenceFilters.region;
  const cityOptions =
    intelligenceFilters.city?.[draftFilters.uf]?.[draftFilters.region] ?? [];
  const scenario = useMemo(
    () =>
      intelligenceScenarios.find(
        (item) =>
          item.uf === appliedFilters.uf &&
          item.region === appliedFilters.region &&
          item.city === appliedFilters.city,
      ) ?? null,
    [appliedFilters],
  );
  const hasIntelligenceData = intelligenceScenarios.length > 0;
  const visibleCandidates = useMemo(() => {
    if (!scenario) return [];
    return showAllCandidates ? scenario.mostVoted : scenario.mostVoted.slice(0, 5);
  }, [scenario, showAllCandidates]);

  useEffect(() => {
    const nextCities =
      intelligenceFilters.city?.[draftFilters.uf]?.[draftFilters.region] ?? [];

    if (!nextCities.includes(draftFilters.city)) {
      setDraftFilters((current) => ({
        ...current,
        city: nextCities[0] ?? "",
      }));
    }
  }, [draftFilters.city, draftFilters.region, draftFilters.uf]);

  function handleAnalyze(event) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setShowAllCandidates(false);
  }

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
            <p className={styles.kicker}>Visao Geral da Campanha</p>
            <h1>Inteligencia Eleitoral</h1>
          </div>

          <CampaignStatusPanel className={styles.headerRight} />
        </header>

        {!hasIntelligenceData ? (
          <AsyncSectionState
            description="Os blocos de inteligencia serao exibidos aqui quando a tela receber a fonte definitiva de dados."
            state="empty"
            title="Nenhum dado de inteligencia disponivel"
          />
        ) : (
          <>
        <section className={styles.insightGrid} aria-label="Filtros e contexto">
          <form className={styles.filterBar} onSubmit={handleAnalyze}>
            <label>
              <span>UF</span>
              <select
                value={draftFilters.uf}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    uf: event.target.value,
                    region: intelligenceFilters.region[0] ?? "",
                    city:
                      intelligenceFilters.city?.[event.target.value]?.[
                        intelligenceFilters.region[0] ?? ""
                      ]?.[0] ?? "",
                  }))
                }
              >
                {intelligenceFilters.uf.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Regiao</span>
              <select
                value={draftFilters.region}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    region: event.target.value,
                    city:
                      intelligenceFilters.city?.[current.uf]?.[event.target.value]?.[0] ?? "",
                  }))
                }
              >
                {regionOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Municipio</span>
              <select
                value={draftFilters.city}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              >
                {cityOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <button type="submit">Analisar</button>
          </form>

          <aside className={styles.salaryInsight}>
            <strong>{scenario?.salaryInsight.highlight ?? "--"}</strong>
            <p>{scenario?.salaryInsight.description ?? "Nenhum contexto disponivel."}</p>
          </aside>
        </section>

        {scenario ? (
          <>
        <section className={styles.contentGrid}>
          <article className={styles.cityPanel}>
            <h2>{scenario.cityTitle}</h2>

            <div className={styles.cityOverview}>
              <figure className={styles.cityPhoto}>
                <img src={cityNightImage} alt={`Vista da cidade de ${scenario.cityTitle}`} />
              </figure>

              <div className={styles.workforceCard}>
                <h3>Forca de Trabalho por Regiao</h3>
                <p>{scenario.workforceText}</p>

                <div className={styles.statGrid}>
                  {scenario.cityStats.map((stat) => (
                    <article key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </article>
                  ))}
                </div>

                <div className={styles.ballotGrid}>
                  {scenario.ballotStats.map((stat) => (
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
              {scenario.businessStats.map((stat) => (
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
              {visibleCandidates.map((candidate) => (
                <article className={styles.votedItem} key={candidate.name}>
                  <div className={styles.votedAvatar} aria-hidden="true" />
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

            <button
              className={styles.moreButton}
              type="button"
              onClick={() => setShowAllCandidates((current) => !current)}
            >
              {showAllCandidates ? "Ver menos" : "Ver mais"}
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
                    className={
                      index < Math.round((scenario.gender.female / 100) * 20)
                        ? styles.personYellow
                        : styles.personMuted
                    }
                    key={`female-${index}`}
                  />
                ))}
              </div>
              <strong className={styles.femaleValue}>{scenario.gender.female}%</strong>
            </div>

            <div className={styles.genderRow}>
              <div className={`${styles.genderIcon} ${styles.genderMale}`} />
              <div className={styles.peopleGrid} aria-hidden="true">
                {Array.from({ length: 20 }).map((_, index) => (
                  <span
                    className={
                      index < Math.round((scenario.gender.male / 100) * 20)
                        ? styles.personBlue
                        : styles.personMuted
                    }
                    key={`male-${index}`}
                  />
                ))}
              </div>
              <strong className={styles.maleValue}>{scenario.gender.male}%</strong>
            </div>
          </div>

          <div className={styles.ageBlock}>
            <h3>Faixa Etaria:</h3>
            {scenario.ageRanges.map((range) => (
              <div className={styles.ageRow} key={range.label}>
                <span>{range.label}</span>
                <i style={{ "--value": `${range.value}%` }} />
                <strong>{range.percent}</strong>
              </div>
            ))}
          </div>

          <aside className={styles.averageCard}>
            <h3>Idade Media</h3>
            <strong>{scenario.averageAge.total}</strong>
            <div className={styles.averageMeta}>
              <span className={styles.averageFemale}>
                <i aria-hidden="true" />
                {scenario.averageAge.female}
              </span>
              <span className={styles.averageMale}>
                <i aria-hidden="true" />
                {scenario.averageAge.male}
              </span>
            </div>
          </aside>
        </section>
          </>
        ) : (
          <AsyncSectionState
            description="Nao encontramos um cenario local para esse conjunto de filtros. Ajuste UF, regiao ou municipio e analise novamente."
            state="empty"
            title="Nenhum cenario disponivel"
          />
        )}
          </>
        )}
      </section>
    </main>
  );
}

export default InteligenciaEleitoral;
