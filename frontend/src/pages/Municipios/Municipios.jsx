import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import AsyncSectionState from "../../components/Common/AsyncSectionState/AsyncSectionState";
import CampaignStatusPanel from "../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import {
  menuItems,
  municipalitiesByMode,
  summaryCardsByMode,
} from "./data/municipiosData";
import styles from "./Municipios.module.css";

function Municipios({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [mode, setMode] = useState("campaign");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const municipalityRows = municipalitiesByMode[mode] ?? [];
  const summaryCards = summaryCardsByMode[mode] ?? [];
  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return municipalityRows.filter((municipality) => {
      if (!normalizedSearch) return true;

      return normalizeText(
        `${municipality.name} ${municipality.region} ${municipality.population} ${municipality.voters}`,
      ).includes(normalizedSearch);
    });
  }, [municipalityRows, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRows.length / pageSize)),
    [filteredRows.length],
  );
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredRows]);
  const paginationRange = useMemo(() => {
    if (!filteredRows.length) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, filteredRows.length);
    return {
      start,
      end,
      total: filteredRows.length,
    };
  }, [currentPage, filteredRows.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [mode, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Municipios"
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
            <h1>Municipios</h1>
          </div>

          <CampaignStatusPanel className={styles.headerRight} />
        </header>

        <section className={styles.summaryGrid} aria-label="Indicadores dos municipios">
          {summaryCards.map((card) => (
            <article className={styles.summaryCard} key={card.label}>
              <span className={styles.summaryIcon} aria-hidden="true">
                <i />
              </span>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.note}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.tablePanel} aria-label="Lista de municipios">
          <div className={styles.tableToolbar}>
            <label className={styles.searchBox}>
              <input
                aria-label="Buscar municipio"
                placeholder="Busca"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="button" aria-label="Buscar municipio">
                <span aria-hidden="true" />
              </button>
            </label>

            <div className={styles.segmented} aria-label="Filtros de periodo">
              <button
                className={mode === "campaign" ? styles.segmentedActive : ""}
                type="button"
                onClick={() => setMode("campaign")}
              >
                Periodo de campanha
              </button>
              <button
                className={mode === "votes" ? styles.segmentedActive : ""}
                type="button"
                onClick={() => setMode("votes")}
              >
                Apuracao dos votos
              </button>
            </div>
          </div>

          <p className={styles.scrollHint}>Arraste a tabela para ver todas as colunas.</p>

          {municipalityRows.length ? (
            <div className={styles.tableMeta}>
              <span>{filteredRows.length} resultado(s)</span>
            </div>
          ) : null}

          {municipalityRows.length ? (
            <>
            <div className={styles.tableScroll}>
              <table className={styles.municipalityTable}>
                <thead>
                  <tr>
                    <th>Municipios</th>
                    <th>Regiao</th>
                    <th>Representantes</th>
                    <th>Populacao</th>
                    <th>Eleitores</th>
                    <th>Emendas (R$)</th>
                    <th>Emendas (QTD)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length ? (
                    paginatedRows.map((municipality) => (
                      <tr key={municipality.id}>
                        <td>{municipality.name}</td>
                        <td>{municipality.region}</td>
                        <td>{municipality.representatives}</td>
                        <td>{municipality.population}</td>
                        <td>{municipality.voters}</td>
                        <td>{municipality.amendmentsValue}</td>
                        <td>{municipality.amendmentsCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={styles.emptyCell} colSpan="7">
                        Nenhum municipio encontrado com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className={styles.pagination}>
              <span>
                Mostrando {paginationRange.start} a {paginationRange.end} de {paginationRange.total}
              </span>
              <nav aria-label="Paginacao de municipios">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    className={currentPage === index + 1 ? styles.pageActive : ""}
                    key={`municipios-page-${index + 1}`}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
              <button type="button">{pageSize} por pagina</button>
            </footer>
            </>
          ) : (
            <AsyncSectionState
              description="Os municipios aparecerao aqui assim que a fonte de dados desta tela estiver conectada."
              state="empty"
              title="Nenhum municipio disponivel"
            />
          )}
        </section>
      </section>
    </main>
  );
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default Municipios;
