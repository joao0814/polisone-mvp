import BrazilMunicipalMap from "./components/BrazilMunicipalMap";
import CampaignHeader from "./components/CampaignHeader";
import Sidebar from "../../components/Commom/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import CostRanking from "./components/CostRanking";
import DailySummaryCard from "./components/DailySummaryCard";
import DashboardPanel from "./components/DashboardPanel";
import FieldTeamsPanel from "./components/FieldTeamsPanel";
import MetricCard from "./components/MetricCard";
import MunicipalityRanking from "./components/MunicipalityRanking";
import ProgressBar from "./components/ProgressBar";
import RealtimeActivities from "./components/RealtimeActivities";
import styles from "./GestaoCampanha.module.css";

const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visao Geral", path: "/gestao-campanha" },
  { label: "Inteligencia Eleitoral" },
  { label: "Municipios" },
  { label: "Emendas" },
  { label: "Equipes" },
  { label: "Check-in" },
  { label: "Pesquisa de campo" },
  { label: "Territorio" },
];

const metrics = [
  { label: "Meta de votos", value: "120.000", icon: "chart" },
  { label: "Votos necessarios", value: "80.000", icon: "ballot" },
  { label: "Total de votos", value: "86.000", icon: "vote" },
  { label: "Municipios ativos", value: "142", icon: "pin" },
  { label: "Liderancas", value: "180", icon: "network" },
  { label: "Representantes", value: "650", icon: "person" },
];

const regionPerformance = [
  { label: "Regiao metropolitana", value: 42 },
  { label: "Regiao de Campinas", value: 71 },
  { label: "Vale do Paraiba", value: 50 },
  { label: "Litoral Sul", value: 32 },
  { label: "Regiao de Ribeirao Preto", value: 82 },
];

const dailySummary = [
  { label: "Eventos", value: "21", note: "Agendados" },
  { label: "Municipios visitados", value: "5", note: "Hoje" },
  { label: "Equipes em campo", value: "18", note: "Ativas agora" },
  { label: "Atividades registradas", value: "312", note: "Hoje" },
  { label: "Novas liderancas", value: "28", note: "Hoje" },
];

const municipalityRanking = [
  { name: "Sumare", value: 95 },
  { name: "Guaratingueta", value: 89 },
  { name: "Sao Paulo", value: 85 },
  { name: "Campinas", value: 83 },
  { name: "Sao Jose dos Campos", value: 79 },
];

const costRanking = [
  { region: "Regiao metropolitana", amount: "R$ 800.000", percent: 38 },
  { region: "Regiao de Campinas", amount: "R$ 650.000", percent: 31 },
  { region: "Vale do Paraiba", amount: "R$ 400.000", percent: 26 },
  { region: "Litoral Sul", amount: "R$ 230.000", percent: 16 },
  { region: "Regiao de Ribeirao Preto", amount: "R$ 200.000", percent: 14 },
];

const realtimeActivities = [
  {
    person: "Julia Rocha",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratingueta",
    tag: "Panfletagem",
  },
  {
    person: "Marcos Lima",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratingueta",
    tag: "Panfletagem",
  },
  {
    person: "Rafael Torres",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratingueta",
    tag: "Panfletagem",
  },
  {
    person: "Alan Leal",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratingueta",
    tag: "Panfletagem",
  },
];

const fieldTeams = [
  {
    id: "centro-1",
    name: "Equipe Centro",
    city: "Sao Jose dos Campos",
    activities: 12,
    people: ["Julia Rocha", "Marcos Lima", "Ana Paula"],
  },
  {
    id: "centro-2",
    name: "Equipe Centro",
    city: "Sao Jose dos Campos",
    activities: 12,
    people: ["Rafael Torres", "Camila Reis", "Bruna Alves"],
  },
  {
    id: "centro-3",
    name: "Equipe Centro",
    city: "Sao Jose dos Campos",
    activities: 12,
    people: ["Leandro Dias", "Paula Nunes", "Daniel Costa"],
  },
  {
    id: "centro-4",
    name: "Equipe Centro",
    city: "Sao Jose dos Campos",
    activities: 12,
    people: ["Marina Souza", "Igor Ramos", "Bianca Prado"],
  },
];

function GestaoCampanha({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato Alan Leal";

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Visao Geral"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        roleLabel="Candidato"
        userName={userName}
      />

      <section className={styles.workspace}>
        <CampaignHeader userName={userName} />

        <section className={styles.metricsGrid} aria-label="Indicadores da campanha">
          {metrics.map((metric) => (
            <MetricCard
              icon={metric.icon}
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </section>

        <section className={styles.mainGrid}>
          <DashboardPanel
            actions={
              <div className={styles.segmented}>
                <button type="button">Periodo de campanha</button>
                <button type="button">Apuracao dos votos</button>
              </div>
            }
            className={styles.mapPanel}
            subtitle="Mapa de calor"
            title="Mapa Eleitoral"
          >
            <BrazilMunicipalMap />
          </DashboardPanel>

          <DashboardPanel
            className={styles.performancePanel}
            subtitle="Comparativo com a meta"
            title="Desempenho por regiao"
          >
            <div className={styles.performanceList}>
              {regionPerformance.map((region) => (
                <ProgressBar
                  key={region.label}
                  label={region.label}
                  value={region.value}
                />
              ))}
            </div>
            <button className={styles.moreButton} type="button">
              Ver mais
            </button>
          </DashboardPanel>
        </section>

        <section className={styles.dailySection} aria-label="Resumo do dia">
          <h2>Resumo do dia</h2>
          <div className={styles.dailyGrid}>
            {dailySummary.map((item) => (
              <DailySummaryCard
                key={item.label}
                label={item.label}
                note={item.note}
                value={item.value}
              />
            ))}
          </div>
        </section>

        <section className={styles.rankingsGrid} aria-label="Rankings da campanha">
          <DashboardPanel
            actions={
              <button className={styles.moreButton} type="button">
                Ver mais
              </button>
            }
            className={styles.municipalityPanel}
            subtitle="Top 5 por desempenho"
            title="Ranking de Municipios"
          >
            <MunicipalityRanking items={municipalityRanking} />
          </DashboardPanel>

          <DashboardPanel
            actions={
              <div className={styles.smallSegmented}>
                <button type="button">Regiao</button>
                <button type="button">Cidades</button>
              </div>
            }
            className={styles.costPanel}
            subtitle="Ranking de custo financeiro"
            title="Custo por regiao"
          >
            <CostRanking items={costRanking} />
            <button className={styles.moreButton} type="button">
              Ver mais
            </button>
          </DashboardPanel>
        </section>

        <section className={styles.operationGrid} aria-label="Operacao em campo">
          <DashboardPanel
            actions={
              <button className={styles.moreButton} type="button">
                Ver todas
              </button>
            }
            className={styles.activitiesPanel}
            title="Atividade em tempo real"
          >
            <RealtimeActivities items={realtimeActivities} />
          </DashboardPanel>

          <DashboardPanel
            actions={
              <button className={styles.moreButton} type="button">
                Ver todas
              </button>
            }
            className={styles.fieldTeamsPanel}
            title="Equipes em campo agora"
          >
            <FieldTeamsPanel teams={fieldTeams} />
          </DashboardPanel>
        </section>
      </section>
    </main>
  );
}

export default GestaoCampanha;
