import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import { useMemo, useState } from "react";
import AsyncSectionState from "../../components/Common/AsyncSectionState/AsyncSectionState";
import CampaignStatusPanel from "../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import {
  filterOptions,
  menuItems,
  researchScenarios,
} from "./data/pesquisaCampoData";
import styles from "./PesquisaCampo.module.css";

const INITIAL_FILTERS = {
  type: filterOptions.type[0],
  year: filterOptions.year[0],
  status: filterOptions.status[0],
  city: "Todos",
  entity: "Todos",
  search: "",
};

function PesquisaCampo({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [feedback, setFeedback] = useState("");
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [showAllSpontaneous, setShowAllSpontaneous] = useState(false);
  const [showAllGrowth, setShowAllGrowth] = useState(false);

  const availableCities = useMemo(
    () => ["Todos", ...new Set(researchScenarios.map((scenario) => scenario.title))],
    [],
  );
  const availableEntities = useMemo(
    () => ["Todos", ...new Set(researchScenarios.map((scenario) => scenario.entity))],
    [],
  );

  const filteredScenarios = useMemo(() => {
    const normalizedSearch = normalizeText(appliedFilters.search);

    return researchScenarios.filter((scenario) => {
      if (appliedFilters.type !== "Todos" && scenario.type !== appliedFilters.type) {
        return false;
      }

      if (appliedFilters.year !== "Todos" && scenario.year !== appliedFilters.year) {
        return false;
      }

      if (appliedFilters.status !== "Todas" && scenario.status !== appliedFilters.status) {
        return false;
      }

      if (appliedFilters.city !== "Todos" && scenario.title !== appliedFilters.city) {
        return false;
      }

      if (appliedFilters.entity !== "Todos" && scenario.entity !== appliedFilters.entity) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        scenario.title,
        scenario.entity,
        scenario.type,
        scenario.status,
        scenario.year,
        ...scenario.searchTerms,
      ]
        .join(" ")
        .trim();

      return normalizeText(haystack).includes(normalizedSearch);
    });
  }, [appliedFilters]);

  const activeScenario = filteredScenarios[0] || null;
  const hasResearchData = researchScenarios.length > 0;

  const visibleSpontaneousVotes = activeScenario
    ? showAllSpontaneous
      ? activeScenario.spontaneousVotes
      : activeScenario.spontaneousVotes.slice(0, 3)
    : [];
  const visibleGrowthCandidates = activeScenario
    ? showAllGrowth
      ? activeScenario.growingCandidates
      : activeScenario.growingCandidates.slice(0, 5)
    : [];

  const handleDraftChange = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFeedback("");
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setShowAllSpontaneous(false);
    setShowAllGrowth(false);
    setFeedback("");
  };

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

          <CampaignStatusPanel className={styles.headerRight} />
        </header>

        {!hasResearchData ? (
          <AsyncSectionState
            description="A estrutura da pesquisa esta pronta e passara a exibir os resultados assim que a coleta estiver conectada."
            state="empty"
            title="Nenhum resultado de pesquisa disponivel"
          />
        ) : (
          <>
        <section className={styles.filtersRow} aria-label="Filtros de pesquisa">
          <form className={styles.filtersPanel} onSubmit={handleApplyFilters}>
            <label>
              <span>TIPO</span>
              <select
                onChange={(event) => handleDraftChange("type", event.target.value)}
                value={draftFilters.type}
              >
                {filterOptions.type.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Ano</span>
              <select
                onChange={(event) => handleDraftChange("year", event.target.value)}
                value={draftFilters.year}
              >
                {filterOptions.year.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Situacao</span>
              <select
                onChange={(event) => handleDraftChange("status", event.target.value)}
                value={draftFilters.status}
              >
                {filterOptions.status.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Municipio</span>
              <select
                onChange={(event) => handleDraftChange("city", event.target.value)}
                value={draftFilters.city}
              >
                {availableCities.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Entidade</span>
              <select
                onChange={(event) => handleDraftChange("entity", event.target.value)}
                value={draftFilters.entity}
              >
                {availableEntities.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <div className={styles.searchLine}>
              <input
                aria-label="Buscar pesquisa"
                placeholder="Buscar emendas, entidades e etc..."
                onChange={(event) => handleDraftChange("search", event.target.value)}
                value={draftFilters.search}
                type="search"
              />
              <button type="submit">
                <span aria-hidden="true" />
                Buscar
              </button>
            </div>
          </form>

          <button
            className={styles.addButton}
            type="button"
            onClick={() =>
              setFeedback(
                "O cadastro da pesquisa sera conectado depois ao formulario externo de coleta.",
              )
            }
          >
            Cadastrar nova pesquisa
          </button>
        </section>

        {feedback ? <p className={styles.infoBanner}>{feedback}</p> : null}

        {!activeScenario ? (
          <AsyncSectionState
            description="Ajuste os filtros para visualizar um recorte de pesquisa local."
            state="empty"
            title="Nenhum recorte encontrado"
          />
        ) : (
          <>
        <section className={styles.appliedSummary} aria-label="Resumo do filtro aplicado">
          <div>
            <span>Recorte ativo</span>
            <strong>{activeScenario.title}</strong>
            <small>
              {activeScenario.entity} Â· {activeScenario.type} Â· {activeScenario.status}
            </small>
          </div>
          <p>{filteredScenarios.length} resultado(s) com os filtros atuais</p>
        </section>

        <section className={styles.summaryGrid} aria-label="Resumo das pesquisas">
          {activeScenario.summaryCards.map((card) => (
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
          <DonutPanel title="Em qual cidade voce esta?" items={activeScenario.cityDistribution} />

          <BarPanel title="Qual e o principal problema da sua cidade?" items={activeScenario.cityProblems} />

          <RankingPanel
            items={activeScenario.priorityRanking}
            title="Qual dessas areas deveria ser prioridade para um deputado estadual?"
          />
        </section>

        <VoterProfile profile={activeScenario.electorateProfile} />

        <section className={styles.middleGrid} aria-label="Analise eleitoral">
          <DonutPanel title="O que mais influência seu voto?" items={activeScenario.voteInfluence} />

          <SpontaneousPanel
            items={visibleSpontaneousVotes}
            onToggle={() => setShowAllSpontaneous((current) => !current)}
            showToggle={activeScenario.spontaneousVotes.length > 3}
            showingAll={showAllSpontaneous}
          />

          <GrowthPanel
            items={visibleGrowthCandidates}
            onToggle={() => setShowAllGrowth((current) => !current)}
            showToggle={activeScenario.growingCandidates.length > 5}
            showingAll={showAllGrowth}
          />
        </section>

        <section className={styles.footerMetrics} aria-label="Metricas finais de pesquisa">
          {activeScenario.footerMetrics.map((metric) => (
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
          {activeScenario.perceptionPanels.map((panel, index) => (
            <PerceptionPanel key={`${panel.title}-${index}`} panel={panel} />
          ))}
        </section>
          </>
        )}
          </>
        )}
      </section>
    </main>
  );
}

function normalizeText(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
        <p>Gênero:</p>

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
        <h3>Faixa Etária:</h3>
        {profile.ageRanges.map((range) => (
          <div className={styles.ageRow} key={range.label}>
            <span>{range.label}</span>
            <i style={{ "--value": `${range.value}%` }} />
            <strong>{range.percent}</strong>
          </div>
        ))}
      </div>

      <aside className={styles.averageCard}>
        <h3>Idade Média</h3>
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

function SpontaneousPanel({ items, onToggle, showToggle, showingAll }) {
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
      {showToggle ? (
        <button className={styles.moreButton} onClick={onToggle} type="button">
          {showingAll ? "Ver menos" : "Ver mais"}
        </button>
      ) : null}
    </article>
  );
}

function GrowthPanel({ items, onToggle, showToggle, showingAll }) {
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
      {showToggle ? (
        <button className={styles.moreButton} onClick={onToggle} type="button">
          {showingAll ? "Ver menos" : "Ver mais"}
        </button>
      ) : null}
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
