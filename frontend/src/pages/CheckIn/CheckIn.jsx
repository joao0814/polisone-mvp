import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import CampaignStatusPanel from "../../components/Common/CampaignStatusPanel/CampaignStatusPanel";
import {
  menuItems,
  photoCards,
} from "./data/checkInData";
import {
  cancelCampaignCheckIn,
  checkoutCampaignCheckIn,
  createCampaignCheckIn,
  getCampaignActivities,
  getCampaignCheckIns,
  getCampaignLeaders,
} from "../../services/campaignOperations";
import { getTeams } from "../../services/teams";
import styles from "./CheckIn.module.css";

const ACTIVITY_TYPE_OPTIONS = [
  { value: "PANFLETAGEM", label: "Panfletagem" },
  { value: "ADESIVAGEM", label: "Adesivagem" },
  { value: "VISITA", label: "Visita" },
  { value: "REUNIAO", label: "Reuniao" },
  { value: "EVENTO", label: "Evento" },
  { value: "PESQUISA_CAMPO", label: "Pesquisa de campo" },
  { value: "OUTRO", label: "Outro" },
];

function CheckIn({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [search, setSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [checkIns, setCheckIns] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamsResponse, setTeamsResponse] = useState(null);
  const [isMutating, setIsMutating] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [formError, setFormError] = useState("");
  const [createForm, setCreateForm] = useState({
    personType: "LEADER",
    selectedPersonId: "",
    activityType: "VISITA",
    notes: "",
  });
  const [statusForm, setStatusForm] = useState({
    action: "checkout",
    notes: "",
  });
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    loadData({ isActive: () => active, searchTerm: submittedSearch });

    return () => {
      active = false;
    };
  }, [submittedSearch]);

  async function loadData({
    isActive = () => true,
    searchTerm = submittedSearch,
  } = {}) {
    const [checkInsResult, leadersResult, activitiesResult, teamsResult] =
      await Promise.allSettled([
        getCampaignCheckIns({ search: searchTerm }),
        getCampaignLeaders(),
        getCampaignActivities(),
        getTeams(),
      ]);

    if (!isActive()) return;

    setCheckIns(
      checkInsResult.status === "fulfilled"
        ? checkInsResult.value?.items ?? []
        : [],
    );
    setLeaders(
      leadersResult.status === "fulfilled"
        ? leadersResult.value?.items ?? []
        : [],
    );
    setActivities(
      activitiesResult.status === "fulfilled"
        ? activitiesResult.value?.items ?? []
        : [],
    );
    setTeamsResponse(teamsResult.status === "fulfilled" ? teamsResult.value : null);
  }

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const allRepresentatives = useMemo(
    () =>
      (teamsResponse?.items ?? []).flatMap((team) =>
        (team.members ?? []).map((member) => ({
          ...member,
          city_name: team.city_name,
          team_id: team.id,
        })),
      ),
    [teamsResponse],
  );
  const todayCheckIns = useMemo(
    () =>
      checkIns.filter((item) => String(item.checked_in_at).slice(0, 10) === todayKey),
    [checkIns, todayKey],
  );
  const tableSearchTerm = normalizeText(tableSearch);
  const activeTeamRows = useMemo(() => {
    return todayCheckIns
      .filter((item) => item.status === "CHECKED_IN")
      .filter((item) => {
        if (!tableSearchTerm) return true;

        return normalizeText(
          `${item.person_name} ${item.city_name} ${item.activity_type}`,
        ).includes(tableSearchTerm);
      })
      .map((item) => ({
        id: item.id,
        raw: item,
        name: item.person_name,
        city: item.city_name,
        badge: formatActivityType(item.activity_type),
        badgeTone: resolveBadgeTone(item.activity_type),
        initials: getInitials(item.person_name),
        status: "Em atividade",
        checkin: formatTime(item.checked_in_at),
        checkout: item.checked_out_at ? formatTime(item.checked_out_at) : "--",
      }));
  }, [tableSearchTerm, todayCheckIns]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(activeTeamRows.length / pageSize)),
    [activeTeamRows.length],
  );
  const paginatedActiveTeamRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return activeTeamRows.slice(startIndex, startIndex + pageSize);
  }, [activeTeamRows, currentPage]);
  const paginationRange = useMemo(() => {
    if (!activeTeamRows.length) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, activeTeamRows.length);
    return {
      start,
      end,
      total: activeTeamRows.length,
    };
  }, [activeTeamRows.length, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [submittedSearch, tableSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  function handleSearchSubmit(event) {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  }

  function handleSearchClear(nextValue) {
    setSearch(nextValue);

    if (!nextValue.trim() && submittedSearch) {
      setSubmittedSearch("");
    }
  }

  const summaryCards = useMemo(() => {
    const leadersToday = todayCheckIns.filter(
      (item) =>
        item.person_type === "LEADER" && item.status === "CHECKED_IN",
    ).length;
    const repsToday = todayCheckIns.filter(
      (item) =>
        item.person_type === "REPRESENTATIVE" && item.status === "CHECKED_IN",
    ).length;
    const activitiesToday = activities.filter(
      (item) => String(item.created_at).slice(0, 10) === todayKey,
    );
    const leadersCreatedToday = leaders.filter(
      (item) => String(item.created_at).slice(0, 10) === todayKey,
    ).length;
    const repsCreatedToday = allRepresentatives.filter(
      (item) => String(item.created_at).slice(0, 10) === todayKey,
    ).length;

    return [
      {
        tone: "blue",
        title: "Liderancas ativas hoje",
        value: formatInteger(leadersToday),
        note: `${formatPercent(leadersToday, leaders.length)} do total`,
      },
      {
        tone: "green",
        title: "Representantes ativos hoje",
        value: formatInteger(repsToday),
        note: `${formatPercent(repsToday, allRepresentatives.length)} do total`,
      },
      {
        tone: "cyan",
        title: "Atividades realizadas",
        value: formatInteger(
          activitiesToday.reduce(
            (accumulator, item) => accumulator + (Number(item.quantity) || 1),
            0,
          ),
        ),
        note: "100% do total do dia",
      },
      {
        tone: "orange",
        title: "Check-in",
        value: formatInteger(todayCheckIns.length),
        note: `${formatPercent(
          todayCheckIns.length,
          leaders.length + allRepresentatives.length,
        )} do total`,
      },
      {
        tone: "red",
        title: "Novos cadastros hoje",
        value: formatInteger(leadersCreatedToday + repsCreatedToday),
        note: "base cadastrada no dia",
      },
    ];
  }, [activities, allRepresentatives, leaders, todayCheckIns, todayKey]);

  const activityTypes = useMemo(() => {
    const totals = groupByActivityType(todayCheckIns);
    return buildPercentLegend(totals);
  }, [todayCheckIns]);

  const checkPerformance = useMemo(() => {
    const checkedIn = todayCheckIns.filter(
      (item) => item.status === "CHECKED_IN",
    ).length;
    const checkedOut = todayCheckIns.filter(
      (item) => item.status === "CHECKED_OUT",
    ).length;
    const canceled = todayCheckIns.filter(
      (item) => item.status === "CANCELED",
    ).length;
    const baseTotal = leaders.length + allRepresentatives.length;
    const noAction = Math.max(baseTotal - todayCheckIns.length, 0);

    return buildPercentLegend([
      { label: "Check-in", total: checkedIn, color: "#00b765" },
      { label: "Check-Out", total: checkedOut, color: "#1687df" },
      { label: "Cancelado", total: canceled, color: "#ff9518" },
      { label: "Nao realizado", total: noAction, color: "#ff3030" },
    ]);
  }, [allRepresentatives.length, leaders.length, todayCheckIns]);

  const resolvedPhotoCards = useMemo(() => {
    const latestCheckIn = todayCheckIns.find(
      (item) => item.status === "CHECKED_IN",
    );
    const latestActivity = [...activities]
      .sort(
        (left, right) =>
          new Date(right.happened_at || right.created_at).getTime() -
          new Date(left.happened_at || left.created_at).getTime(),
      )[0];
    const latestCheckout = [...todayCheckIns]
      .filter((item) => item.status === "CHECKED_OUT")
      .sort(
        (left, right) =>
          new Date(right.checked_out_at || right.updated_at).getTime() -
          new Date(left.checked_out_at || left.updated_at).getTime(),
      )[0];

    return photoCards.map((card) => {
      if (card.title === "Foto de Check-in" && latestCheckIn) {
        return {
          ...card,
          person: latestCheckIn.person_name,
          time: formatTime(latestCheckIn.checked_in_at),
          date: formatShortDate(latestCheckIn.checked_in_at),
          location: `${latestCheckIn.city_name} - ${latestCheckIn.state}`,
          role:
            latestCheckIn.person_type === "LEADER"
              ? "Lideranca"
              : "Representante",
          leader:
            latestCheckIn.person_type === "LEADER"
              ? latestCheckIn.person_name
              : findLeaderForCity(latestCheckIn.city_ibge_code)?.name || "--",
        };
      }

      if (card.title === "Fotos das atividades" && latestActivity) {
        return {
          ...card,
          action: formatActivityType(latestActivity.activity_type),
          person: findPersonName(latestActivity) || card.person,
          time: formatTime(latestActivity.happened_at || latestActivity.created_at),
          date: formatShortDate(latestActivity.happened_at || latestActivity.created_at),
          location: `${latestActivity.city_name} - ${latestActivity.state}`,
          role: "Operacao",
          leader:
            findLeaderForCity(latestActivity.city_ibge_code)?.name || "--",
        };
      }

      if (card.title === "Foto de Check-out" && latestCheckout) {
        return {
          ...card,
          person: latestCheckout.person_name,
          time: formatTime(latestCheckout.checked_out_at),
          date: formatShortDate(latestCheckout.checked_out_at),
          location: `${latestCheckout.city_name} - ${latestCheckout.state}`,
          role:
            latestCheckout.person_type === "LEADER"
              ? "Lideranca"
              : "Representante",
          leader:
            latestCheckout.person_type === "LEADER"
              ? latestCheckout.person_name
              : findLeaderForCity(latestCheckout.city_ibge_code)?.name || "--",
        };
      }

      return card;
    });
  }, [activities, leaders, todayCheckIns]);

  async function submitCreateCheckIn() {
    let selected = null;
    let team = null;

    if (!isValidActivityType(createForm.activityType)) {
      setFormError("Selecione um tipo de atividade valido.");
      return;
    }

    setIsMutating(true);
    setFormError("");
    setAccessInvite(null);

    try {
      selected =
        createOptions.find((item) => item.id === createForm.selectedPersonId) || null;

      if (!selected) {
        setFormError("Selecione uma pessoa para registrar o check-in.");
        setIsMutating(false);
        return;
      }

      const teamId =
        selected.team_id ??
        findTeamForCity(selected.city_ibge_code, selected.city_name)?.id;

      if (!teamId) {
        setFormError("Nao foi encontrada equipe vinculada para registrar esse check-in.");
        setIsMutating(false);
        return;
      }

      team = findTeamById(teamId);

      await createCampaignCheckIn({
        teamId: team.id,
        personId: selected.id,
        personName: selected.name,
        personType: createForm.personType,
        memberId:
          createForm.personType === "REPRESENTATIVE"
            ? selected.member_id ?? selected.id
            : undefined,
        cityIbgeCode: selected.city_ibge_code ?? team?.city_ibge_code,
        cityName: selected.city_name ?? team?.city_name,
        state: selected.state ?? team?.state ?? "SP",
        activityType: createForm.activityType,
        notes: createForm.notes.trim() || undefined,
      });

      await loadData();
      closeModal();
    } catch (error) {
      setFormError(error.message || "Nao foi possivel registrar o check-in.");
    } finally {
      setIsMutating(false);
    }
  }

  async function submitStatusAction() {
    if (!modalState?.item) return;
    setIsMutating(true);
    setFormError("");
    try {
      if (statusForm.action === "checkout") {
        await checkoutCampaignCheckIn(modalState.item.id, {
          notes: statusForm.notes.trim() || undefined,
        });
      } else {
        await cancelCampaignCheckIn(modalState.item.id);
      }

      await loadData();
      closeModal();
    } catch (error) {
      setFormError(error.message || "Nao foi possivel atualizar o check-in.");
    } finally {
      setIsMutating(false);
    }
  }

  function handleCreateCheckIn(personType) {
    const nextOptions = getCreateOptions(personType);
    setCreateForm({
      personType,
      selectedPersonId: nextOptions[0]?.id ?? "",
      activityType: "VISITA",
      notes: "",
    });
    setFormError("");
    setModalState({ type: "create" });
  }

  function handleStatusAction(item) {
    setStatusForm({
      action: "checkout",
      notes: "",
    });
    setFormError("");
    setModalState({ type: "status", item });
  }

  function closeModal() {
    setModalState(null);
    setFormError("");
    setCreateForm({
      personType: "LEADER",
      selectedPersonId: "",
      activityType: "VISITA",
      notes: "",
    });
    setStatusForm({
      action: "checkout",
      notes: "",
    });
  }

  function findTeamForCity(cityIbgeCode, cityName) {
    return (teamsResponse?.items ?? []).find(
      (team) =>
        team.city_ibge_code === cityIbgeCode ||
        normalizeText(team.city_name) === normalizeText(cityName),
    );
  }

  function findTeamById(teamId) {
    return (teamsResponse?.items ?? []).find((team) => team.id === teamId);
  }

  function findLeaderForCity(cityIbgeCode) {
    return leaders.find((leader) => leader.city_ibge_code === cityIbgeCode);
  }

  function findPersonName(activity) {
    const representative = allRepresentatives.find(
      (item) => item.id === activity.member_id,
    );

    if (representative) return representative.name;

    const team = findTeamById(activity.team_id);
    return team?.coordinator_name || team?.name || null;
  }

  function handleStatusKeyDown(event, item) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStatusAction(item);
    }
  }

  function getCreateOptions(personType) {
    return personType === "LEADER"
      ? leaders
      : allRepresentatives.map((item) => ({
          id: item.id,
          name: item.name,
          city_name: item.city_name,
          team_id: item.team_id,
          city_ibge_code: item.city_ibge_code,
          state: findTeamById(item.team_id)?.state ?? "SP",
          member_id: item.id,
        }));
  }

  const createOptions = useMemo(
    () => getCreateOptions(createForm.personType),
    [allRepresentatives, createForm.personType, leaders, teamsResponse],
  );
  const selectedCreatePerson = useMemo(
    () =>
      createOptions.find((item) => item.id === createForm.selectedPersonId) ||
      createOptions[0] ||
      null,
    [createForm.selectedPersonId, createOptions],
  );
  const selectedCreateTeam = useMemo(() => {
    if (!selectedCreatePerson) return null;

    const teamId =
      selectedCreatePerson.team_id ??
      findTeamForCity(
        selectedCreatePerson.city_ibge_code,
        selectedCreatePerson.city_name,
      )?.id;

    return teamId ? findTeamById(teamId) : null;
  }, [selectedCreatePerson, teamsResponse]);

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Check-in"
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
            <h1>Check-in</h1>
          </div>

          <CampaignStatusPanel className={styles.headerRight} />
        </header>

        <form
          className={styles.mainSearch}
          aria-label="Buscar lideranca ou representante"
          onSubmit={handleSearchSubmit}
        >
          <input
            placeholder="Buscar por lideranca/representante"
            type="search"
            value={search}
            onChange={(event) => handleSearchClear(event.target.value)}
          />
          <button type="submit">
            <span aria-hidden="true" />
            Buscar
          </button>
        </form>

        <section className={styles.summaryGrid} aria-label="Resumo de check-in">
          {summaryCards.map((card) => (
            <article className={`${styles.summaryCard} ${styles[card.tone]}`} key={card.title}>
              <span className={styles.summaryIcon} aria-hidden="true" />
              <div>
                <strong>{card.title}</strong>
                <p>{card.value}</p>
                <small>{card.note}</small>
              </div>
            </article>
          ))}
        </section>

        <h2 className={styles.sectionTitle}>Equipes em atividade agora</h2>

        <section className={styles.activityGrid} aria-label="Equipes em atividade">
          <article className={styles.tablePanel}>
            <div className={styles.tableToolbar}>
              <label className={styles.searchBox}>
                <input
                  aria-label="Busca em equipes em atividade"
                  placeholder="Busca"
                  type="search"
                  value={tableSearch}
                  onChange={(event) => setTableSearch(event.target.value)}
                />
                <button type="button" aria-label="Buscar na lista">
                  <span aria-hidden="true" />
                </button>
              </label>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Atividade</th>
                    <th>Status</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActiveTeamRows.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className={styles.personCell}>
                          <span className={styles.avatar}>{team.initials}</span>
                          <div>
                            <strong>{team.name}</strong>
                            <small>{team.city}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <em className={`${styles.activityBadge} ${styles[team.badgeTone]}`}>
                          {team.badge}
                        </em>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          onClick={() => handleStatusAction(team.raw)}
                          onKeyDown={(event) => handleStatusKeyDown(event, team.raw)}
                          role="button"
                          tabIndex={0}
                        >
                          {team.status}
                        </span>
                      </td>
                      <td>{team.checkin}</td>
                      <td>{team.checkout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className={styles.pagination}>
              <span>
                Mostrando {paginationRange.start} a {paginationRange.end} de {paginationRange.total}
              </span>
              <nav aria-label="Paginacao de check-in">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    className={currentPage === index + 1 ? styles.pageActive : ""}
                    key={`page-${index + 1}`}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
              <button type="button">{pageSize} por pagina</button>
            </footer>
          </article>

          <aside className={styles.sidePanels}>
            <DonutPanel
              center={formatInteger(todayCheckIns.length)}
              items={activityTypes}
              title="Atividades por tipo"
            />
            <DonutPanel
              center={formatInteger(todayCheckIns.length)}
              items={checkPerformance}
              title="Desempenho de Check"
            />
          </aside>
        </section>

        <section className={styles.photosPanel} aria-label="Fotos de check-in e atividades">
          {resolvedPhotoCards.map((card) => (
            <PhotoCard card={card} key={card.title} />
          ))}
        </section>
      </section>

      {modalState ? (
        <CheckInModal
          createForm={createForm}
          createOptions={createOptions}
          errorMessage={formError}
          isMutating={isMutating}
          modalState={modalState}
          onClose={closeModal}
          onCreateChange={setCreateForm}
          onStatusChange={setStatusForm}
          onSubmitCreate={submitCreateCheckIn}
          onSubmitStatus={submitStatusAction}
          selectedCreatePerson={selectedCreatePerson}
          selectedCreateTeam={selectedCreateTeam}
          statusForm={statusForm}
        />
      ) : null}
    </main>
  );
}

function CheckInModal({
  createForm,
  createOptions,
  errorMessage,
  isMutating,
  modalState,
  onClose,
  onCreateChange,
  onStatusChange,
  onSubmitCreate,
  onSubmitStatus,
  selectedCreatePerson,
  selectedCreateTeam,
  statusForm,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isMutating) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMutating, onClose]);

  if (modalState.type === "create") {
    return (
      <div className={styles.modalOverlay} onMouseDown={onClose}>
        <div
          className={styles.modalCard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-modal-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <div>
              <span className={styles.modalEyebrow}>Operacao territorial</span>
              <h2 className={styles.modalTitle} id="checkin-modal-title">
                {createForm.personType === "LEADER"
                  ? "Novo check-in de lideranca"
                  : "Novo check-in de representante"}
              </h2>
            </div>
            <button
              className={styles.modalCloseButton}
              type="button"
              onClick={onClose}
              disabled={isMutating}
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.modalGrid}>
              <label className={styles.modalField}>
                <span>Pessoa</span>
                <select
                  value={createForm.selectedPersonId}
                  onChange={(event) =>
                    onCreateChange((current) => ({
                      ...current,
                      selectedPersonId: event.target.value,
                    }))
                  }
                  disabled={isMutating || !createOptions.length}
                >
                  {createOptions.length ? (
                    createOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.city_name || "Sem cidade"}
                      </option>
                    ))
                  ) : (
                    <option value="">Nenhuma opcao disponivel</option>
                  )}
                </select>
              </label>

              <label className={styles.modalField}>
                <span>Tipo de atividade</span>
                <select
                  value={createForm.activityType}
                  onChange={(event) =>
                    onCreateChange((current) => ({
                      ...current,
                      activityType: event.target.value,
                    }))
                  }
                  disabled={isMutating}
                >
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.modalField}>
                <span>Municipio</span>
                <input
                  type="text"
                  value={selectedCreatePerson?.city_name || "--"}
                  readOnly
                />
              </label>

              <label className={styles.modalField}>
                <span>Equipe</span>
                <input
                  type="text"
                  value={selectedCreateTeam?.name || "--"}
                  readOnly
                />
              </label>
            </div>

            <label className={styles.modalTextareaField}>
              <span>Observacao</span>
              <textarea
                rows={4}
                maxLength={400}
                value={createForm.notes}
                onChange={(event) =>
                  onCreateChange((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Adicione algum contexto da atividade"
                disabled={isMutating}
              />
            </label>

            {errorMessage ? (
              <p className={styles.modalErrorMessage}>{errorMessage}</p>
            ) : null}
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.modalSecondaryButton}
              type="button"
              onClick={onClose}
              disabled={isMutating}
            >
              Cancelar
            </button>
            <button
              className={styles.modalPrimaryButton}
              type="button"
              onClick={onSubmitCreate}
              disabled={isMutating || !createOptions.length}
            >
              {isMutating ? "Salvando..." : "Registrar check-in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-status-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalEyebrow}>Operacao territorial</span>
            <h2 className={styles.modalTitle} id="checkin-status-modal-title">
              Atualizar check-in
            </h2>
          </div>
          <button
            className={styles.modalCloseButton}
            type="button"
            onClick={onClose}
            disabled={isMutating}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSummaryBox}>
            <strong>{modalState.item.person_name}</strong>
            <span>{modalState.item.city_name}</span>
            <small>{formatActivityType(modalState.item.activity_type)}</small>
          </div>

          <div className={styles.modalChoiceGroup}>
            <button
              type="button"
              className={`${styles.modalChoiceButton} ${
                statusForm.action === "checkout" ? styles.modalChoiceButtonActive : ""
              }`}
              onClick={() =>
                onStatusChange((current) => ({ ...current, action: "checkout" }))
              }
              disabled={isMutating}
            >
              Fazer check-out
            </button>
            <button
              type="button"
              className={`${styles.modalChoiceButton} ${
                statusForm.action === "cancel" ? styles.modalChoiceButtonActive : ""
              }`}
              onClick={() =>
                onStatusChange((current) => ({ ...current, action: "cancel" }))
              }
              disabled={isMutating}
            >
              Cancelar check-in
            </button>
          </div>

          {statusForm.action === "checkout" ? (
            <label className={styles.modalTextareaField}>
              <span>Observacao do check-out</span>
              <textarea
                rows={4}
                maxLength={400}
                value={statusForm.notes}
                onChange={(event) =>
                  onStatusChange((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Adicione o encerramento da atividade"
                disabled={isMutating}
              />
            </label>
          ) : (
            <p className={styles.modalWarningText}>
              O cancelamento encerra esse registro imediatamente.
            </p>
          )}

          {errorMessage ? (
            <p className={styles.modalErrorMessage}>{errorMessage}</p>
          ) : null}
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.modalSecondaryButton}
            type="button"
            onClick={onClose}
            disabled={isMutating}
          >
            Voltar
          </button>
          <button
            className={styles.modalPrimaryButton}
            type="button"
            onClick={onSubmitStatus}
            disabled={isMutating}
          >
            {isMutating
              ? "Salvando..."
              : statusForm.action === "checkout"
                ? "Confirmar check-out"
                : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DonutPanel({ center, items, title }) {
  const donutBackground = useMemo(() => buildDonutBackground(items), [items]);

  return (
    <article className={styles.donutPanel}>
      <h2>{title}</h2>
      <div className={styles.donutWrap}>
        <div
          className={styles.donut}
          aria-hidden="true"
          style={{ background: donutBackground }}
        >
          {center ? (
            <>
              <strong>{center}</strong>
              <small>Total</small>
            </>
          ) : null}
        </div>
        <ul>
          {items.map((item) => (
            <li key={item.label}>
              <i style={{ "--color": item.color }} />
              <span>{item.label}{item.value ? ` - ${item.value}` : ""}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function PhotoCard({ card }) {
  return (
    <article className={styles.photoCard}>
      <h2>{card.title}</h2>
      <img alt={card.title} src={card.photo} />
      <div className={styles.photoMeta}>
        <strong>
          {card.time}
          <small>{card.date}</small>
        </strong>
        <span>{card.person}</span>
      </div>
      <div className={styles.locationBox}>
        <strong>{card.location}</strong>
        <span>{card.role}</span>
        <small>Lideranca: {card.leader}</small>
      </div>
      <button className={styles[card.tone]} type="button">
        {card.action}
      </button>
    </article>
  );
}

function buildPercentLegend(items) {
  const palette = ["#00b765", "#1687df", "#ff9518", "#ff3030", "#ffca18", "#7a8cff"];
  const total = items.reduce((accumulator, item) => accumulator + item.total, 0);

  return items
    .filter((item) => item.total > 0)
    .map((item, index) => ({
      label: item.label,
      value: formatPercentValue(item.total, total),
      percent: total ? (item.total / total) * 100 : 0,
      color: item.color ?? palette[index % palette.length],
    }));
}

function buildDonutBackground(items) {
  if (!items.length) {
    return "radial-gradient(circle, #081522 0 45%, transparent 46%), conic-gradient(#223247 0 100%)";
  }

  let current = 0;
  const slices = items.map((item) => {
    const start = current;
    const percent = Math.max(0, Number(item.percent) || 0);
    current += percent;
    return `${item.color} ${start}% ${Math.min(current, 100)}%`;
  });

  if (current < 100) {
    slices.push(`#223247 ${current}% 100%`);
  }

  return `radial-gradient(circle, #081522 0 45%, transparent 46%), conic-gradient(${slices.join(
    ", ",
  )})`;
}

function groupByActivityType(items) {
  const map = new Map();

  items.forEach((item) => {
    const key = item.activity_type || "OUTRO";
    const current = map.get(key) ?? {
      label: formatActivityType(key),
      total: 0,
    };

    current.total += 1;
    map.set(key, current);
  });

  return [...map.values()].sort((left, right) => right.total - left.total);
}

function formatPercent(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatPercentValue(part, total) {
  if (!total) return "0%";
  const value = (part / total) * 100;
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function formatInteger(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
}

function formatTime(value) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function getInitials(name) {
  const [firstName = "", lastName = ""] = String(name || "").split(" ");
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "CF";
}

function formatActivityType(value) {
  return String(value || "OUTRO")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function resolveBadgeTone(activityType) {
  switch (activityType) {
    case "PANFLETAGEM":
      return "yellow";
    case "PESQUISA_CAMPO":
      return "blue";
    case "VISITA":
      return "green";
    case "REUNIAO":
      return "red";
    default:
      return "cyan";
  }
}

function isValidActivityType(value) {
  return [
    "PANFLETAGEM",
    "ADESIVAGEM",
    "VISITA",
    "REUNIAO",
    "EVENTO",
    "PESQUISA_CAMPO",
    "OUTRO",
  ].includes(String(value || "").toUpperCase());
}

export default CheckIn;
