import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import campaignRegions from "../GestaoCampanha/data/campaignRegions";
import {
  createCampaignCost,
  deleteCampaignCost,
  getCampaignCosts,
  updateCampaignCost,
} from "../../services/campaignCosts";
import {
  countdowns,
  menuItems,
} from "./data/emendasData";
import styles from "./Emendas.module.css";

const campaignSubregions = campaignRegions.filter(
  (region) => region.group === "Sub-regioes de campanha",
);

function Emendas({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";
  const [costsResponse, setCostsResponse] = useState(null);
  const [regionFilter, setRegionFilter] = useState("TODAS");
  const [cityFilter, setCityFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCostId, setEditingCostId] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    cityIbgeCode: "",
    cityName: "",
    notes: "",
    regionId: campaignSubregions[0]?.id ?? "",
    spentAt: "",
  });

  useEffect(() => {
    loadCosts();
  }, []);

  async function loadCosts() {
    const response = await getCampaignCosts();
    setCostsResponse(response);
  }

  const allCosts = costsResponse?.items ?? [];
  const cityOptions = useMemo(
    () =>
      ["TODOS", ...new Set(allCosts.map((item) => item.city_name).filter(Boolean))],
    [allCosts],
  );

  const filteredCosts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return allCosts.filter((item) => {
      const matchesRegion =
        regionFilter === "TODAS" || item.region_id === regionFilter;
      const matchesCity =
        cityFilter === "TODOS" || item.city_name === cityFilter;
      const haystack = normalizeText(
        `${item.city_name} ${item.region_name} ${item.notes ?? ""}`,
      );
      const matchesSearch =
        !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesRegion && matchesCity && matchesSearch;
    });
  }, [allCosts, cityFilter, regionFilter, search]);

  const summary = useMemo(() => buildSummary(filteredCosts), [filteredCosts]);
  const cityRanking = useMemo(() => buildCityRanking(filteredCosts), [filteredCosts]);
  const regionDistribution = useMemo(
    () => buildRegionDistribution(filteredCosts),
    [filteredCosts],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedRegion = campaignSubregions.find(
        (region) => region.id === form.regionId,
      );
      const payload = {
        amount: Number(form.amount),
        cityIbgeCode: form.cityIbgeCode,
        cityName: form.cityName,
        notes: form.notes,
        regionId: form.regionId,
        regionName: selectedRegion?.label ?? form.regionId,
        spentAt: form.spentAt || undefined,
      };

      if (editingCostId) {
        await updateCampaignCost(editingCostId, payload);
      } else {
        await createCampaignCost(payload);
      }

      resetForm();
      await loadCosts();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(cost) {
    setEditingCostId(cost.id);
    setForm({
      amount: String(cost.amount ?? ""),
      cityIbgeCode: cost.city_ibge_code ?? "",
      cityName: cost.city_name ?? "",
      notes: cost.notes ?? "",
      regionId: cost.region_id ?? campaignSubregions[0]?.id ?? "",
      spentAt: toDateTimeLocal(cost.spent_at),
    });
  }

  async function handleDelete(costId) {
    await deleteCampaignCost(costId);
    if (editingCostId === costId) {
      resetForm();
    }
    await loadCosts();
  }

  function resetForm() {
    setEditingCostId(null);
    setForm({
      amount: "",
      cityIbgeCode: "",
      cityName: "",
      notes: "",
      regionId: campaignSubregions[0]?.id ?? "",
      spentAt: "",
    });
  }

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Emendas"
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
            <p className={styles.kicker}>Financeiro da Campanha</p>
            <h1>Custos</h1>
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

        <section className={styles.filtersRow} aria-label="Filtros de custos">
          <form className={styles.filtersPanel}>
            <label>
              <span>REGIAO</span>
              <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                <option value="TODAS">Todas</option>
                {campaignSubregions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cidade</span>
              <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
                {cityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.searchLine}>
              <input
                aria-label="Buscar custos"
                placeholder="Buscar por cidade, regiao ou observacao"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="button">Filtrar</button>
            </div>
          </form>
        </section>

        <section className={styles.financialGrid} aria-label="Resumo financeiro">
          <article className={`${styles.financialCard} ${styles.blue}`}>
            <span className={styles.financeIcon} aria-hidden="true" />
            <div>
              <strong>Total investido</strong>
              <p>{formatCurrency(summary.totalInvested)}</p>
              <small>100% do total filtrado</small>
            </div>
          </article>
          <article className={`${styles.financialCard} ${styles.green}`}>
            <span className={styles.financeIcon} aria-hidden="true" />
            <div>
              <strong>Regioes com custo</strong>
              <p>{summary.regionsCount}</p>
              <small>regioes com lancamento</small>
            </div>
          </article>
          <article className={`${styles.financialCard} ${styles.cyan}`}>
            <span className={styles.financeIcon} aria-hidden="true" />
            <div>
              <strong>Cidades com custo</strong>
              <p>{summary.citiesCount}</p>
              <small>cidades alcancadas</small>
            </div>
          </article>
          <article className={`${styles.financialCard} ${styles.orange}`}>
            <span className={styles.financeIcon} aria-hidden="true" />
            <div>
              <strong>Maior aporte</strong>
              <p>{formatCurrency(summary.biggestAmount)}</p>
              <small>maior lancamento individual</small>
            </div>
          </article>
          <article className={`${styles.financialCard} ${styles.red}`}>
            <span className={styles.financeIcon} aria-hidden="true" />
            <div>
              <strong>Lancamentos</strong>
              <p>{summary.entriesCount}</p>
              <small>custos cadastrados</small>
            </div>
          </article>
        </section>

        <section className={styles.costsGrid}>
          <section className={styles.tablePanel} aria-label="Lista de custos">
            <div className={styles.tableToolbar}>
              <label className={styles.searchBox}>
                <input
                  aria-label="Busca na lista de custos"
                  placeholder="Busca rapida"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <button type="button" aria-label="Buscar na lista">
                  <span aria-hidden="true" />
                </button>
              </label>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.amendmentsTable}>
                <thead>
                  <tr>
                    <th>Cidade</th>
                    <th>Codigo IBGE</th>
                    <th>Regiao</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Observacao</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCosts.length ? (
                    filteredCosts.map((cost) => (
                      <tr key={cost.id}>
                        <td>{cost.city_name}</td>
                        <td>{cost.city_ibge_code}</td>
                        <td>{cost.region_name}</td>
                        <td>{formatCurrency(cost.amount)}</td>
                        <td>{formatDate(cost.spent_at)}</td>
                        <td>{cost.notes || "Sem observacao"}</td>
                        <td>
                          <div className={styles.actions}>
                            <button type="button" onClick={() => handleEdit(cost)}>
                              Editar
                            </button>
                            <button type="button" onClick={() => handleDelete(cost.id)}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.emptyCell}>
                        Nenhum custo encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.formPanel} aria-label="Cadastro de custo">
            <div className={styles.formHeader}>
              <p className={styles.kicker}>Lancamento financeiro</p>
              <h2>{editingCostId ? "Editar custo" : "Novo custo"}</h2>
            </div>

            <form className={styles.costForm} onSubmit={handleSubmit}>
              <label>
                <span>Cidade</span>
                <input
                  required
                  type="text"
                  value={form.cityName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, cityName: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Codigo IBGE</span>
                <input
                  required
                  type="text"
                  value={form.cityIbgeCode}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cityIbgeCode: event.target.value.replace(/\D/g, "").slice(0, 7),
                    }))
                  }
                />
              </label>
              <label>
                <span>Regiao</span>
                <select
                  value={form.regionId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, regionId: event.target.value }))
                  }
                >
                  {campaignSubregions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Valor</span>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, amount: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Data do custo</span>
                <input
                  type="datetime-local"
                  value={form.spentAt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, spentAt: event.target.value }))
                  }
                />
              </label>
              <label className={styles.notesField}>
                <span>Observacao</span>
                <textarea
                  rows="5"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </label>

              <button className={styles.addButton} disabled={isSubmitting} type="submit">
                {isSubmitting ? "Salvando..." : editingCostId ? "Salvar alteracoes" : "Cadastrar custo"}
              </button>
              {editingCostId ? (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={resetForm}
                >
                  Cancelar edicao
                </button>
              ) : null}
            </form>
          </section>
        </section>

        <section className={styles.analyticsGrid} aria-label="Analiticos de custos">
          <article className={styles.destinationPanel}>
            <h2>Distribuicao por regiao</h2>
            <div className={styles.destinationList}>
              {regionDistribution.length ? (
                regionDistribution.map((item) => (
                  <div className={styles.destinationRow} key={item.label}>
                    <span>{item.label}</span>
                    <i style={{ "--value": `${item.percent}%` }} />
                    <small>{item.percent}%</small>
                  </div>
                ))
              ) : (
                <p className={styles.emptyPanel}>Sem custos registrados ainda.</p>
              )}
            </div>
          </article>

          <article className={styles.rankingPanel}>
            <h2>Ranking de Municipios</h2>
            <p>Top 5 por valor investido</p>
            <div className={styles.rankingList}>
              {cityRanking.length ? (
                cityRanking.map((item, index) => (
                  <div className={styles.rankingItem} key={item.city}>
                    <strong>{index + 1}o</strong>
                    <span>{item.city}</span>
                    <i style={{ "--value": `${item.percent}%` }} />
                  </div>
                ))
              ) : (
                <p className={styles.emptyPanel}>Sem custos por municipio ainda.</p>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function buildSummary(items) {
  const totalInvested = items.reduce(
    (accumulator, item) => accumulator + Number(item.amount),
    0,
  );
  const regionsCount = new Set(items.map((item) => item.region_id)).size;
  const citiesCount = new Set(items.map((item) => item.city_ibge_code)).size;
  const biggestAmount = items.reduce(
    (accumulator, item) => Math.max(accumulator, Number(item.amount)),
    0,
  );

  return {
    totalInvested,
    regionsCount,
    citiesCount,
    biggestAmount,
    entriesCount: items.length,
  };
}

function buildCityRanking(items) {
  const cityMap = new Map();
  const total = items.reduce((accumulator, item) => accumulator + Number(item.amount), 0);

  items.forEach((item) => {
    const current = cityMap.get(item.city_ibge_code) ?? {
      city: item.city_name,
      amount: 0,
    };

    current.amount += Number(item.amount);
    cityMap.set(item.city_ibge_code, current);
  });

  return [...cityMap.values()]
    .sort((left, right) => right.amount - left.amount || left.city.localeCompare(right.city))
    .slice(0, 5)
    .map((item) => ({
      ...item,
      percent: total ? Math.round((item.amount / total) * 100) : 0,
    }));
}

function buildRegionDistribution(items) {
  const regionMap = new Map();
  const total = items.reduce((accumulator, item) => accumulator + Number(item.amount), 0);

  items.forEach((item) => {
    const current = regionMap.get(item.region_id) ?? {
      label: item.region_name,
      amount: 0,
    };

    current.amount += Number(item.amount);
    regionMap.set(item.region_id, current);
  });

  return [...regionMap.values()]
    .sort((left, right) => right.amount - left.amount || left.label.localeCompare(right.label))
    .slice(0, 6)
    .map((item) => ({
      ...item,
      percent: total ? Math.round((item.amount / total) * 100) : 0,
    }));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default Emendas;
