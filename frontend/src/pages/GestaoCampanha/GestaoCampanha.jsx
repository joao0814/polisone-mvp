import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  getFieldTeamsNow,
  getMunicipalityRanking,
  getOverviewMetrics,
  getRealtimeActivities,
} from "../../services/dashboard";
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
  { label: "Votos necessarios", value: null, icon: "ballot" },
  { label: "Total de votos", value: null, icon: "vote" },
  { label: "Municipios ativos", value: null, icon: "pin" },
  { label: "Liderancas", value: null, icon: "network" },
  { label: "Representantes", value: null, icon: "person" },
];

const dailySummary = [
  { key: "events_scheduled", label: "Eventos", value: "--", note: "Agendados" },
  { key: "municipalities_visited_today", label: "Municipios visitados", value: "--", note: "Hoje" },
  { key: "field_teams_active_now", label: "Equipes em campo", value: "--", note: "Ativas agora" },
  { key: "activities_registered_today", label: "Atividades registradas", value: "0", note: "Hoje" },
  { key: "new_leaders_today", label: "Novas liderancas", value: "0", note: "Hoje" },
];

const performanceRegions = campaignRegions.filter(
  (region) => region.showInPerformance !== false,
);

function GestaoCampanha({ session, onLogout }) {
  const navigate = useNavigate();
  const userName = session?.user?.name || "Candidato";
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [overviewMetricsData, setOverviewMetricsData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [dailySummaryData, setDailySummaryData] = useState(null);
  const [municipalityRankingData, setMunicipalityRankingData] = useState(null);
  const [costRankingMode, setCostRankingMode] = useState("region");
  const [costRankingData, setCostRankingData] = useState(null);
  const [realtimeActivitiesData, setRealtimeActivitiesData] = useState(null);
  const [fieldTeamsData, setFieldTeamsData] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getOverviewMetrics(),
      getTeamsSummary(),
      getTeamsMap(),
      getDailySummary(),
      getMunicipalityRanking(),
      getCostRanking(costRankingMode),
      getRealtimeActivities(),
      getFieldTeamsNow(),
    ]).then(
      ([overviewMetricsResult, summaryResult, mapResult, dailySummaryResult, municipalityRankingResult, costRankingResult, realtimeActivitiesResult, fieldTeamsResult]) => {
        if (!active) return;

        setOverviewMetricsData(
          overviewMetricsResult.status === "fulfilled"
            ? overviewMetricsResult.value
            : null,
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
        setFieldTeamsData(
          fieldTeamsResult.status === "fulfilled" ? fieldTeamsResult.value : null,
        );
      },
    );

    return () => {
      active = false;
    };
  }, [costRankingMode]);

  const resolvedMetrics = metrics.map((metric) => {
    const metricKey = getOverviewMetricKey(metric.label);
    const apiItem = metricKey ? overviewMetricsData?.items?.[metricKey] : null;

    return {
      ...metric,
      value: formatMetricValue(apiItem?.value),
    };
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

  const resolvedMunicipalityRanking = municipalityRankingData?.items ?? [];

  const resolvedFieldTeams = fieldTeamsData?.items ?? [];
  const resolvedCostRanking =
    costRankingData?.items?.length
      ? costRankingData.items.map((item) => ({
          id: item.id,
          region: item.label,
          amount: formatCurrency(item.amount),
          percent: item.percent,
        }))
      : [];
  const resolvedRealtimeActivities = realtimeActivitiesData?.items ?? [];

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
            <button
              className={styles.moreButton}
              type="button"
              onClick={() => navigate("/municipios")}
            >
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
              <button
                className={styles.moreButton}
                type="button"
                onClick={() => navigate("/municipios")}
              >
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
            <button
              className={styles.moreButton}
              type="button"
              onClick={() => navigate("/emendas")}
            >
              Ver mais
            </button>
          </DashboardPanel>
        </section>

        <section className={styles.operationGrid} aria-label="Operacao em campo">
          <DashboardPanel
            actions={
              <button
                className={styles.moreButton}
                type="button"
                onClick={() => navigate("/check-in")}
              >
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
              <button
                className={styles.moreButton}
                type="button"
                onClick={() => navigate("/equipes")}
              >
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

function formatMetricValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  return formatInteger(value);
}

function getOverviewMetricKey(label) {
  const map = {
    "Meta de votos": "vote_goal",
    "Votos necessarios": "votes_needed",
    "Total de votos": "total_votes",
    "Municipios ativos": "municipalities_active",
    Liderancas: "leaders",
    Representantes: "representatives",
  };

  return map[label] ?? null;
}

export default GestaoCampanha;
