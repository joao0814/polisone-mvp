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
  { label: "Visão Geral", path: "/gestao-campanha" },
  { label: "Inteligência Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municípios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Território" },
];

const metrics = [
  { label: "Meta de votos", value: null, icon: "chart" },
  { label: "Votos necessários", value: "80.000", icon: "ballot" },
  { label: "Total de votos", value: "86.000", icon: "vote" },
  { label: "Municípios ativos", value: "142", icon: "pin" },
  { label: "Lideranças", value: "180", icon: "network" },
  { label: "Representantes", value: "650", icon: "person" },
];

const dailySummary = [
  { key: "events_scheduled", label: "Eventos", value: "--", note: "Agendados", icon: "events" },
  { key: "municipalities_visited_today", label: "Municípios visitados", value: "--", note: "Hoje", icon: "visited" },
  { key: "field_teams_active_now", label: "Equipes em campo", value: "--", note: "Ativas agora", icon: "teams" },
  { key: "activities_registered_today", label: "Atividades registradas", value: "0", note: "Hoje", icon: "activities" },
  { key: "new_leaders_today", label: "Novas lideranças", value: "0", note: "Hoje", icon: "newLeaders" },
];

const municipalityRanking = [
  { name: "Campinas", value: 100 },
  { name: "São Paulo", value: 75 },
  { name: "Santos", value: 50 },
  { name: "Ribeirão Preto", value: 25 },
];

const costRanking = [
  { region: "Região metropolitana de SP", amount: "R$ 800.000", percent: 44 },
  { region: "Região de Campinas", amount: "R$ 520.000", percent: 29 },
  { region: "Baixada Santista", amount: "R$ 310.000", percent: 17 },
  { region: "Região de Ribeirão Preto", amount: "R$ 190.000", percent: 10 },
];

const realtimeActivities = [
  {
    person: "Julia Rocha",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratinguetá",
    tag: "Panfletagem",
  },
  {
    person: "Marcos Lima",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratinguetá",
    tag: "Panfletagem",
  },
  {
    person: "Rafael Torres",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratinguetá",
    tag: "Panfletagem",
  },
  {
    person: "Alan Leal",
    time: "08:42",
    description: "Equipe de centro registrou panfletagem em Guaratinguetá",
    tag: "Panfletagem",
  },
];

const fieldTeams = [
  {
    id: "centro-1",
    name: "Equipe Centro",
    city: "São José dos Campos",
    activities: 12,
    people: ["Julia Rocha", "Marcos Lima", "Ana Paula"],
  },
  {
    id: "centro-2",
    name: "Equipe Centro",
    city: "São José dos Campos",
    activities: 12,
    people: ["Rafael Torres", "Camila Reis", "Bruna Alves"],
  },
  {
    id: "centro-3",
    name: "Equipe Centro",
    city: "São José dos Campos",
    activities: 12,
    people: ["Leandro Dias", "Paula Nunes", "Daniel Costa"],
  },
  {
    id: "centro-4",
    name: "Equipe Centro",
    city: "São José dos Campos",
    activities: 12,
    people: ["Marina Souza", "Igor Ramos", "Bianca Prado"],
  },
];

function GestaoCampanha({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
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
      ([
        profileResult,
        summaryResult,
        mapResult,
        dailySummaryResult,
        municipalityRankingResult,
        costRankingResult,
        realtimeActivitiesResult,
      ]) => {
        if (!active) return;

        setVoteGoal(
          profileResult.status === "fulfilled"
            ? profileResult.value?.campaign?.vote_goal ?? null
            : null,
        );
        setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
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

    if (metric.label === "Municípios ativos") {
      return {
        ...metric,
        value: formatInteger(summary?.metrics?.municipalities_active),
      };
    }

    if (metric.label === "Lideranças") {
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

    const resolvedValue = apiItem.value ?? apiItem.fallback_value ?? item.value;

    return {
      ...item,
      value: resolvedValue === "--" ? resolvedValue : formatInteger(resolvedValue),
    };
  });

  const resolvedMunicipalityRanking =
    municipalityRankingData?.items?.length ? municipalityRankingData.items : municipalityRanking;

  const resolvedFieldTeams = summary?.field_teams?.length ? summary.field_teams : fieldTeams;
  const resolvedCostRanking =
    costRankingData?.items?.length
      ? costRankingData.items.map((item) => ({
          region: item.label,
          amount: formatCurrency(item.amount),
          percent: item.percent,
        }))
      : costRanking;
  const resolvedRealtimeActivities =
    realtimeActivitiesData?.items?.length ? realtimeActivitiesData.items : realtimeActivities;

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
        activeItem="Visão Geral"
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
                <button type="button">Período de campanha</button>
                <button type="button">Apuração dos votos</button>
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
            title="Desempenho por região"
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
                icon={item.icon}
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
            title="Ranking de Municípios"
          >
            <MunicipalityRanking items={resolvedMunicipalityRanking} />
          </DashboardPanel>

          <DashboardPanel
            actions={
              <div className={styles.smallSegmented}>
                <button type="button" onClick={() => setCostRankingMode("region")}>
                  Região
                </button>
                <button type="button" onClick={() => setCostRankingMode("city")}>
                  Cidades
                </button>
              </div>
            }
            className={styles.costPanel}
            subtitle="Ranking de custo financeiro"
            title="Custo por região"
          >
            <CostRanking items={resolvedCostRanking} />
            <button className={styles.moreButton} type="button">
              Ver mais
            </button>
          </DashboardPanel>
        </section>

        <section className={styles.operationGrid} aria-label="Operação em campo">
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
