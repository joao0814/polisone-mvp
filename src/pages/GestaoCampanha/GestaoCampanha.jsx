import { useEffect, useState } from "react";
import BrazilMunicipalMap from "./components/BrazilMunicipalMap";
import CampaignHeader from "./components/CampaignHeader";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import CostRanking from "./components/CostRanking";
import DailySummaryCard from "./components/DailySummaryCard";
import DashboardPanel from "./components/DashboardPanel";
import FieldTeamsPanel from "./components/FieldTeamsPanel";
import MetricCard from "./components/MetricCard";
import MunicipalityRanking from "./components/MunicipalityRanking";
import ProgressBar from "./components/ProgressBar";
import RealtimeActivities from "./components/RealtimeActivities";
import {
  getCostRanking,
  getDailySummary,
  getMunicipalityRanking,
  getRealtimeActivities,
} from "../../services/dashboard";
import { getProfile } from "../../services/profile";
import { getTeamsMap, getTeamsSummary } from "../../services/teams";
import campaignRegions from "./data/campaignRegions";
import styles from "./GestaoCampanha.module.css";

const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visao Geral", path: "/gestao-campanha" },
  { label: "Inteligencia Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municipios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Territorio" },
];

const metrics = [
  { label: "Meta de votos", value: null, icon: "chart" },
  { label: "Votos necessarios", value: "80.000", icon: "ballot" },
  { label: "Total de votos", value: "86.000", icon: "vote" },
  { label: "Municipios ativos", value: "142", icon: "pin" },
  { label: "Liderancas", value: "180", icon: "network" },
  { label: "Representantes", value: "650", icon: "person" },
];

const dailySummary = [
  { key: "events_scheduled", label: "Eventos", value: "--", note: "Agendados" },
  { key: "municipalities_visited_today", label: "Municipios visitados", value: "--", note: "Hoje" },
  { key: "field_teams_active_now", label: "Equipes em campo", value: "--", note: "Ativas agora" },
  { key: "activities_registered_today", label: "Atividades registradas", value: "0", note: "Hoje" },
  { key: "new_leaders_today", label: "Novas liderancas", value: "0", note: "Hoje" },
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
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [voteGoal, setVoteGoal] = useState(null);
  const [summary, setSummary] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [dailySummaryData, setDailySummaryData] = useState(null);
  const [municipalityRankingData, setMunicipalityRankingData] = useState(null);
  const [costRankingMode, setCostRankingMode] = useState("region");
  const [costRankingData, setCostRankingData] = useState(null);
  const [realtimeActivitiesData, setRealtimeActivitiesData] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getProfile(),
      getTeamsSummary(),
      getTeamsMap(),
      getDailySummary(),
      getMunicipalityRanking(),
      getCostRanking(costRankingMode),
      getRealtimeActivities(),
    ]).then(
      ([profileResult, summaryResult, mapResult, dailySummaryResult, municipalityRankingResult, costRankingResult, realtimeActivitiesResult]) => {
        if (!active) return;

        setVoteGoal(
          profileResult.status === "fulfilled"
            ? profileResult.value?.campaign?.vote_goal ?? null
            : null,
        );
        setSummary(
          summaryResult.status === "fulfilled" ? summaryResult.value : null,
        );
        setMapData(mapResult.status === "fulfilled" ? mapResult.value : null);
        setDailySummaryData(
          dailySummaryResult.status === "fulfilled" ? dailySummaryResult.value : null,
        );
        setMunicipalityRankingData(
          municipalityRankingResult.status === "fulfilled"
            ? municipalityRankingResult.value
            : null,
        );
        setCostRankingData(
          costRankingResult.status === "fulfilled" ? costRankingResult.value : null,
        );
        setRealtimeActivitiesData(
          realtimeActivitiesResult.status === "fulfilled"
            ? realtimeActivitiesResult.value
            : null,
        );
      },
    );

    return () => {
      active = false;
    };
  }, [costRankingMode]);

  const resolvedMetrics = metrics.map((metric) => {
    if (metric.label === "Meta de votos") {
      return { ...metric, value: formatVoteGoal(voteGoal) };
    }

    if (metric.label === "Municipios ativos") {
      return {
        ...metric,
        value: formatInteger(summary?.metrics?.municipalities_active),
      };
    }

    if (metric.label === "Liderancas") {
      return {
        ...metric,
        value: formatInteger(summary?.metrics?.leaders),
      };
    }

    if (metric.label === "Representantes") {
      return {
        ...metric,
        value: formatInteger(summary?.metrics?.representatives),
      };
    }

    return metric;
  });

  const resolvedDailySummary = dailySummary.map((item) => {
    const apiItem = dailySummaryData?.items?.[item.key];

    if (!apiItem) {
      return item;
    }

    const resolvedValue =
      apiItem.value ?? apiItem.fallback_value ?? item.value;

    return {
      ...item,
      value:
        resolvedValue === "--"
          ? resolvedValue
          : formatInteger(resolvedValue),
    };
  });

  const resolvedMunicipalityRanking =
    municipalityRankingData?.items?.length
      ? municipalityRankingData.items
      : municipalityRanking;

  const resolvedFieldTeams =
    summary?.field_teams?.length ? summary.field_teams : fieldTeams;
  const resolvedCostRanking =
    costRankingData?.items?.length
      ? costRankingData.items.map((item) => ({
          region: item.label,
          amount: formatCurrency(item.amount),
          percent: item.percent,
        }))
      : costRanking;
  const resolvedRealtimeActivities =
    realtimeActivitiesData?.items?.length
      ? realtimeActivitiesData.items
      : realtimeActivities;

  const resolvedRegions = campaignRegions.map((region) => {
    const regionStats = mapData?.regions?.find((item) => item.id === region.id);

    return regionStats
      ? {
          ...region,
          value: regionStats.value,
          teamCount: regionStats.team_count,
          membersCount: regionStats.members_count,
        }
      : region;
  });

  const resolvedPerformanceRegions = resolvedRegions.filter(
    (region) => region.showInPerformance !== false,
  );

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Visao Geral"
        brandImage={logoNav}
        brandLabel="Campanha"
        items={menuItems}
        onLogout={onLogout}
        profileImagePath={session?.user?.profile_image_path}
        roleLabel="Candidato"
        userName={userName}
      />

      <section className={styles.workspace}>
        <CampaignHeader userName={userName} />

        <section className={styles.metricsGrid} aria-label="Indicadores da campanha">
          {resolvedMetrics.map((metric) => (
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
            <BrazilMunicipalMap
              municipalityStats={mapData?.municipalities ?? []}
              onRegionChange={setSelectedRegionId}
              regions={resolvedRegions}
              selectedRegionId={selectedRegionId}
            />
          </DashboardPanel>

          <DashboardPanel
            className={styles.performancePanel}
            subtitle="Comparativo com a meta"
            title="Desempenho por regiao"
          >
            <div className={styles.performanceList}>
              {resolvedPerformanceRegions.map((region) => (
                <ProgressBar
                  key={region.label}
                  active={selectedRegionId === region.id}
                  label={region.label}
                  onClick={() =>
                    setSelectedRegionId((current) =>
                      current === region.id ? null : region.id,
                    )
                  }
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
            {resolvedDailySummary.map((item) => (
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
            <MunicipalityRanking items={resolvedMunicipalityRanking} />
          </DashboardPanel>

          <DashboardPanel
            actions={
              <div className={styles.smallSegmented}>
                <button
                  type="button"
                  onClick={() => setCostRankingMode("region")}
                >
                  Regiao
                </button>
                <button
                  type="button"
                  onClick={() => setCostRankingMode("city")}
                >
                  Cidades
                </button>
              </div>
            }
            className={styles.costPanel}
            subtitle="Ranking de custo financeiro"
            title="Custo por regiao"
          >
            <CostRanking items={resolvedCostRanking} />
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
            <RealtimeActivities items={resolvedRealtimeActivities} />
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
            <FieldTeamsPanel teams={resolvedFieldTeams} />
          </DashboardPanel>
        </section>
      </section>
    </main>
  );
}

function formatVoteGoal(value) {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "--";
  }

  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatInteger(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default GestaoCampanha;
