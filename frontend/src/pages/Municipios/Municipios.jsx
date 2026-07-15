import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import AsyncSectionState from "../../components/Common/AsyncSectionState/AsyncSectionState";
import CampaignStatusPanel from "../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import {
  menuItems,
  municipalities,
  summaryCards,
} from "./data/municipiosData";
import styles from "./Municipios.module.css";

function Municipios({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const municipalityRows = municipalities ?? [];

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
              <input aria-label="Buscar municipio" placeholder="Busca" type="search" />
              <button type="button" aria-label="Buscar municipio">
                <span aria-hidden="true" />
              </button>
            </label>

            <div className={styles.segmented} aria-label="Filtros de periodo">
              <button className={styles.segmentedActive} type="button">
                Periodo de campanha
              </button>
              <button type="button">Apuracao dos votos</button>
            </div>
          </div>

          <p className={styles.scrollHint}>Arraste a tabela para ver todas as colunas.</p>

          {municipalityRows.length ? (
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
                  {municipalityRows.map((municipality) => (
                    <tr key={municipality.id}>
                      <td>{municipality.name}</td>
                      <td>{municipality.region}</td>
                      <td>{municipality.representatives}</td>
                      <td>{municipality.population}</td>
                      <td>{municipality.voters}</td>
                      <td>{municipality.amendmentsValue}</td>
                      <td>{municipality.amendmentsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default Municipios;
