import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  createTeam,
  createTeamMember,
  getTeamMembers,
  getTeams,
  removeTeam,
  removeTeamMember,
  updateTeam,
  updateTeamMember,
} from "../../services/teams";
import {
  createCampaignLeader,
  getCampaignLeaders,
} from "../../services/campaignOperations";
import styles from "./Equipes.module.css";

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

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const teamStatuses = [
  { value: "ALL", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativas" },
  { value: "INACTIVE", label: "Inativas" },
];

const memberStatuses = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

const initialTeamModalForm = {
  name: "",
  cityName: "",
  cityIbgeCode: "",
  state: "SP",
  coordinatorName: "",
  linkedLeaderId: "",
  status: "ACTIVE",
  notes: "",
};

const initialMemberModalForm = {
  teamId: "",
  name: "",
  phone: "",
  email: "",
  role: "",
  status: "ACTIVE",
  cityIbgeCode: "",
};

const initialLeaderModalForm = {
  name: "",
  phone: "",
  teamId: "",
  notes: "",
};

const initialRepresentativeModalForm = {
  name: "",
  email: "",
  phone: "",
  role: "Representante de campo",
  teamId: "",
};

function Equipes({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [teams, setTeams] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalError, setModalError] = useState("");
  const [teamModalForm, setTeamModalForm] = useState(initialTeamModalForm);
  const [memberModalForm, setMemberModalForm] = useState(initialMemberModalForm);
  const [leaderModalForm, setLeaderModalForm] = useState(initialLeaderModalForm);
  const [representativeModalForm, setRepresentativeModalForm] = useState(
    initialRepresentativeModalForm,
  );
  const [teamMessage, setTeamMessage] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let active = true;

    Promise.allSettled([loadTeams(undefined, () => active), loadLeaders(() => active)]).finally(
      () => {
        if (active) {
          setLoading(false);
        }
      },
    );

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      setMembers([]);
      return;
    }

    let active = true;

    getTeamMembers(selectedTeamId)
      .then((data) => {
        if (!active) return;
        setMembers(data.items ?? []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [selectedTeamId]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        [
          team.name,
          team.city_name,
          team.coordinator_name,
          team.linked_leader_name,
          team.city_ibge_code,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesCity = cityFilter === "ALL" || team.city_name === cityFilter;
      const matchesStatus = statusFilter === "ALL" || team.status === statusFilter;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [cityFilter, search, statusFilter, teams]);

  const cities = useMemo(
    () => ["ALL", ...new Set(teams.map((team) => team.city_name).filter(Boolean))],
    [teams],
  );

  const summaryCards = useMemo(() => {
    const activeTeams = teams.filter((team) => team.status === "ACTIVE").length;
    const totalMembers = teams.reduce(
      (accumulator, team) => accumulator + (team.active_members_count ?? team.members_count ?? 0),
      0,
    );
    const citiesCovered = new Set(teams.map((team) => team.city_name)).size;

    return [
      { tone: "blue", title: "Total de equipes", value: teams.length, note: "bases cadastradas" },
      { tone: "green", title: "Equipes ativas", value: activeTeams, note: "operando agora" },
      { tone: "cyan", title: "Total de membros", value: totalMembers, note: "membros ativos nas equipes" },
      { tone: "orange", title: "Municipios cobertos", value: citiesCovered, note: "com equipe ativa ou reserva" },
      { tone: "red", title: "Equipes inativas", value: Math.max(teams.length - activeTeams, 0), note: "aguardando reativacao" },
    ];
  }, [teams]);

  async function loadTeams(preferredTeamId = selectedTeamId, isActive = () => true) {
    try {
      const data = await getTeams();
      if (!isActive()) return;

      const items = data.items ?? [];
      setTeams(items);

      if (!items.length) {
        setSelectedTeamId(null);
        return;
      }

      const nextTeamId =
        preferredTeamId && items.some((team) => team.id === preferredTeamId)
          ? preferredTeamId
          : items[0].id;

      setSelectedTeamId(nextTeamId);
    } catch (requestError) {
      if (isActive()) {
        setError(requestError.message);
      }
    }
  }

  async function loadLeaders(isActive = () => true) {
    try {
      const data = await getCampaignLeaders();
      if (!isActive()) return;
      setLeaders(data.items ?? []);
    } catch {
      if (isActive()) {
        setLeaders([]);
      }
    }
  }

  function closeManagementModal() {
    if (savingMember || savingTeam) return;
    setModalType(null);
    setModalError("");
    setEditingTeamId(null);
    setEditingMemberId(null);
    setTeamModalForm(initialTeamModalForm);
    setMemberModalForm(initialMemberModalForm);
    setLeaderModalForm(initialLeaderModalForm);
    setRepresentativeModalForm(initialRepresentativeModalForm);
  }

  function openTeamModal() {
    setModalType("team");
    setModalError("");
    setEditingTeamId(null);
    setTeamModalForm(initialTeamModalForm);
  }

  function openEditTeamModal(team) {
    setModalType("team");
    setModalError("");
    setEditingTeamId(team.id);
    setTeamModalForm({
      name: team.name ?? "",
      cityName: team.city_name ?? "",
      cityIbgeCode: team.city_ibge_code ?? "",
      state: team.state ?? "SP",
      coordinatorName: team.coordinator_name ?? "",
      linkedLeaderId: team.linked_leader_id ?? "",
      status: team.status ?? "ACTIVE",
      notes: team.notes ?? "",
    });
  }

  function openMemberModal() {
    const defaultTeam = selectedTeam ?? teams[0] ?? null;

    setModalType("member");
    setModalError("");
    setEditingMemberId(null);
    setMemberModalForm({
      ...initialMemberModalForm,
      teamId: defaultTeam?.id ?? "",
      cityIbgeCode: defaultTeam?.city_ibge_code ?? "",
    });
  }

  function openEditMemberModal(member) {
    if (!selectedTeam) return;

    setModalType("member");
    setModalError("");
    setEditingMemberId(member.id);
    setMemberModalForm({
      teamId: selectedTeam.id,
      name: member.name ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      role: member.role ?? "",
      status: member.status ?? "ACTIVE",
      cityIbgeCode: member.city_ibge_code ?? selectedTeam.city_ibge_code ?? "",
    });
  }

  function openLeaderModal() {
    setModalType("leader");
    setModalError("");
    setLeaderModalForm({
      ...initialLeaderModalForm,
      teamId: selectedTeam?.id ?? teams[0]?.id ?? "",
    });
  }

  function openRepresentativeModal() {
    setModalType("representative");
    setModalError("");
    setRepresentativeModalForm({
      ...initialRepresentativeModalForm,
      teamId: selectedTeam?.id ?? teams[0]?.id ?? "",
    });
  }

  async function refreshMembers(teamId) {
    const data = await getTeamMembers(teamId);
    setMembers(data.items ?? []);
  }

  async function submitTeamModal() {
    setSavingTeam(true);
    setModalError("");

    try {
      if (editingTeamId) {
        await updateTeam(editingTeamId, normalizeTeamPayload(teamModalForm));
        setTeamMessage("Equipe atualizada com sucesso.");
        await Promise.all([loadTeams(editingTeamId), loadLeaders()]);
      } else {
        const created = await createTeam(normalizeTeamPayload(teamModalForm));
        setTeamMessage("Equipe criada com sucesso.");
        await Promise.all([loadTeams(created.id), loadLeaders()]);
      }

      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleInactivateTeam() {
    if (!editingTeamId) return;

    setSavingTeam(true);
    setModalError("");

    try {
      await updateTeam(editingTeamId, { status: "INACTIVE" });
      setTeamMessage("Equipe inativada com sucesso.");
      await loadTeams(editingTeamId);
      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleRemoveTeam() {
    if (!editingTeamId) return;

    setSavingTeam(true);
    setModalError("");

    try {
      await removeTeam(editingTeamId);
      setTeamMessage("Equipe removida com sucesso.");
      await Promise.all([loadTeams(), loadLeaders()]);
      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingTeam(false);
    }
  }

  async function submitMemberModal() {
    const team = teams.find((item) => item.id === memberModalForm.teamId);

    if (!team) {
      setModalError("Selecione a equipe do membro.");
      return;
    }

    if (!memberModalForm.name.trim() || !memberModalForm.email.trim()) {
      setModalError("Informe nome e e-mail do membro.");
      return;
    }

    setSavingMember(true);
    setModalError("");

    try {
      if (editingMemberId) {
        await updateTeamMember(team.id, editingMemberId, normalizeMemberPayload(memberModalForm));
        setMemberMessage("Membro atualizado com sucesso.");
      } else {
        const createdMember = await createTeamMember(team.id, {
          ...normalizeMemberPayload(memberModalForm),
          role: memberModalForm.role.trim() || "Membro de equipe",
          cityIbgeCode: memberModalForm.cityIbgeCode || team.city_ibge_code,
          status: memberModalForm.status,
        });

        setMemberMessage(
          createdMember?.access_invite
            ? `Membro cadastrado com sucesso. Login: ${createdMember.access_invite.email} | Senha provisoria: ${createdMember.access_invite.temporary_password}`
            : "Membro cadastrado com sucesso.",
        );
      }

      setSelectedTeamId(team.id);
      await Promise.all([loadTeams(team.id), refreshMembers(team.id)]);
      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  async function handleToggleMemberStatus(member) {
    if (!selectedTeam) return;

    setSavingMember(true);
    setMemberMessage("");
    setError("");

    try {
      const nextStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateTeamMember(selectedTeam.id, member.id, { status: nextStatus });
      setMemberMessage(nextStatus === "ACTIVE" ? "Membro reativado com sucesso." : "Membro inativado com sucesso.");
      await Promise.all([loadTeams(selectedTeam.id), refreshMembers(selectedTeam.id)]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  async function handleRemoveMember(memberId) {
    if (!selectedTeam) return;

    setSavingMember(true);
    setMemberMessage("");
    setError("");

    try {
      await removeTeamMember(selectedTeam.id, memberId);
      setMemberMessage("Membro removido com sucesso.");
      await Promise.all([loadTeams(selectedTeam.id), refreshMembers(selectedTeam.id)]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  async function submitLeaderModal() {
    const team = teams.find((item) => item.id === leaderModalForm.teamId);

    if (!team) {
      setModalError("Selecione uma equipe para vincular a liderança.");
      return;
    }

    if (!leaderModalForm.name.trim()) {
      setModalError("Informe o nome da liderança.");
      return;
    }

    setSavingMember(true);
    setModalError("");

    try {
      await createCampaignLeader({
        name: leaderModalForm.name.trim(),
        phone: leaderModalForm.phone.trim() || undefined,
        teamId: team.id,
        cityIbgeCode: team.city_ibge_code,
        cityName: team.city_name,
        state: team.state,
        source: "teams",
        notes: leaderModalForm.notes.trim() || undefined,
      });

      setTeamMessage("Liderança cadastrada com sucesso.");
      await Promise.all([loadTeams(team.id), loadLeaders()]);
      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  async function submitRepresentativeModal() {
    const team = teams.find((item) => item.id === representativeModalForm.teamId);

    if (!team) {
      setModalError("Selecione a equipe do representante.");
      return;
    }

    if (!representativeModalForm.name.trim() || !representativeModalForm.email.trim()) {
      setModalError("Informe nome e e-mail do representante.");
      return;
    }

    setSavingMember(true);
    setModalError("");

    try {
      const createdMember = await createTeamMember(team.id, {
        name: representativeModalForm.name.trim(),
        email: representativeModalForm.email.trim(),
        phone: representativeModalForm.phone.trim() || undefined,
        role: representativeModalForm.role.trim() || "Representante de campo",
        cityIbgeCode: team.city_ibge_code,
        status: "ACTIVE",
      });

      setMemberMessage(
        createdMember?.access_invite
          ? `Representante cadastrado com sucesso. Login: ${createdMember.access_invite.email} | Senha provisoria: ${createdMember.access_invite.temporary_password}`
          : "Representante cadastrado com sucesso.",
      );
      setSelectedTeamId(team.id);
      await Promise.all([loadTeams(team.id), refreshMembers(team.id)]);
      closeManagementModal();
    } catch (requestError) {
      setModalError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  if (loading) {
    return <main className={styles.loading}>Carregando equipes...</main>;
  }

  return (
    <main className={styles.page}>
      <Sidebar
        activeItem="Equipes"
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
            <p className={styles.kicker}>Operacao territorial da campanha</p>
            <h1>Equipes</h1>
            <span>
              Cadastre equipes, acompanhe a cobertura por municipio e gerencie os
              membros de campo da campanha.
            </span>
          </div>

          <div className={styles.headerActions}>
            <button type="button" onClick={openTeamModal}>
              <span aria-hidden="true" />
              Nova equipe
            </button>
            <button type="button" onClick={openLeaderModal} disabled={!teams.length}>
              <span aria-hidden="true" />
              Cadastrar liderança
            </button>
            <button type="button" onClick={openMemberModal} disabled={!teams.length}>
              <span aria-hidden="true" />
              Novo membro
            </button>
            <button type="button" onClick={openRepresentativeModal} disabled={!teams.length}>
              <span aria-hidden="true" />
              Cadastrar representante
            </button>
          </div>

          <div className={styles.headerStatus}>
            <strong>{summaryCards[0].value}</strong>
            <small>Equipes mapeadas</small>
            <span>
              {selectedTeam ? `${selectedTeam.name} selecionada` : "Nenhuma equipe selecionada"}
            </span>
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="Resumo de equipes">
          {summaryCards.map((card) => (
            <article className={`${styles.summaryCard} ${styles[card.tone]}`} key={card.title}>
              <span className={styles.summaryIcon} aria-hidden="true" />
              <div>
                <strong>{card.title}</strong>
                <p>{formatNumber(card.value)}</p>
                <small>{card.note}</small>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.filtersPanel} aria-label="Filtros de equipes">
          <label className={styles.filterField}>
            <span>Busca</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Equipe, coordenador, liderança, municipio ou codigo IBGE"
            />
          </label>

          <label className={styles.filterField}>
            <span>Municipio</span>
            <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city === "ALL" ? "Todos os municipios" : city}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {teamStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {(teamMessage || memberMessage || error) && (
          <section className={styles.feedbackStack} aria-live="polite">
            {teamMessage ? <p className={styles.success}>{teamMessage}</p> : null}
            {memberMessage ? <p className={styles.success}>{memberMessage}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </section>
        )}

        <section className={styles.contentGrid}>
          <article className={styles.tablePanel}>
            <div className={styles.panelHeading}>
              <div>
                <small>Listagem operacional</small>
                <h2>Equipes cadastradas</h2>
              </div>
              <span>{filteredTeams.length} resultado(s)</span>
            </div>

            <div className={styles.tableScroll}>
              <table className={styles.teamsTable}>
                <thead>
                  <tr>
                    <th>Equipe</th>
                    <th>Municipio</th>
                    <th>UF</th>
                    <th>Codigo IBGE</th>
                    <th>Coordenador</th>
                    <th>Status</th>
                    <th>Membros</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.length ? (
                    filteredTeams.map((team) => (
                      <tr
                        key={team.id}
                        className={team.id === selectedTeamId ? styles.rowActive : ""}
                      >
                        <td>
                          <button
                            type="button"
                            className={styles.teamButton}
                            onClick={() => setSelectedTeamId(team.id)}
                          >
                            <span className={styles.avatar}>{getInitials(team.name)}</span>
                            <div>
                              <strong>{team.name}</strong>
                              <small>
                                {team.linked_leader_name
                                  ? `Liderança vinculada: ${team.linked_leader_name}`
                                  : team.notes || "Sem observacoes adicionais"}
                              </small>
                            </div>
                          </button>
                        </td>
                        <td>{team.city_name}</td>
                        <td>{team.state}</td>
                        <td>{team.city_ibge_code}</td>
                        <td>{team.coordinator_name || "--"}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              team.status === "ACTIVE" ? styles.statusActive : styles.statusInactive
                            }`}
                          >
                            {team.status === "ACTIVE" ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.membersMetric}>
                            <strong>{formatNumber(team.active_members_count ?? team.members_count ?? 0)}</strong>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.inlineAction}
                            onClick={() => openEditTeamModal(team)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className={styles.emptyCell}>
                        Nenhuma equipe encontrada com os filtros atuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

        </section>
      </section>

      {modalType ? (
        <EntityManagementModal
          editingMemberId={editingMemberId}
          editingTeamId={editingTeamId}
          leaderForm={leaderModalForm}
          leaderTeam={teams.find((team) => team.id === leaderModalForm.teamId) ?? null}
          memberForm={memberModalForm}
          memberTeam={teams.find((team) => team.id === memberModalForm.teamId) ?? null}
          modalError={modalError}
          modalType={modalType}
          onClose={closeManagementModal}
          onInactivateTeam={handleInactivateTeam}
          onLeaderChange={setLeaderModalForm}
          onMemberChange={setMemberModalForm}
          onRemoveTeam={handleRemoveTeam}
          onRepresentativeChange={setRepresentativeModalForm}
          onSubmitLeader={submitLeaderModal}
          onSubmitMember={submitMemberModal}
          onSubmitRepresentative={submitRepresentativeModal}
          onSubmitTeam={submitTeamModal}
          onTeamChange={setTeamModalForm}
          representativeForm={representativeModalForm}
          representativeTeam={teams.find((team) => team.id === representativeModalForm.teamId) ?? null}
          saving={savingMember}
          savingTeam={savingTeam}
          teamForm={teamModalForm}
          teams={teams}
        />
      ) : null}
    </main>
  );
}

function normalizeTeamPayload(form) {
  return {
    name: form.name,
    cityName: form.cityName,
    cityIbgeCode: form.cityIbgeCode,
    state: form.state,
    coordinatorName: form.coordinatorName,
    linkedLeaderId: form.linkedLeaderId || null,
    status: form.status,
    notes: form.notes,
  };
}

function normalizeMemberPayload(form) {
  return {
    name: form.name,
    phone: form.phone,
    email: form.email,
    role: form.role,
    status: form.status,
    cityIbgeCode: form.cityIbgeCode,
  };
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || "E"}${parts.at(-1)?.[0] || parts[0]?.[1] || ""}`.toUpperCase();
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
}

function formatPhoneInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function EntityManagementModal({
  editingMemberId,
  editingTeamId,
  leaderForm,
  leaderTeam,
  memberForm,
  memberTeam,
  modalError,
  modalType,
  onClose,
  onInactivateTeam,
  onLeaderChange,
  onMemberChange,
  onRemoveTeam,
  onRepresentativeChange,
  onSubmitLeader,
  onSubmitMember,
  onSubmitRepresentative,
  onSubmitTeam,
  onTeamChange,
  representativeForm,
  representativeTeam,
  saving,
  savingTeam,
  teamForm,
  teams,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving && !savingTeam) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving, savingTeam]);

  const isTeam = modalType === "team";
  const isMember = modalType === "member";
  const isLeader = modalType === "leader";
  const title = isTeam
    ? editingTeamId
      ? "Atualizar equipe"
      : "Cadastrar equipe"
    : isMember
      ? editingMemberId
        ? "Atualizar membro"
        : "Cadastrar membro"
      : isLeader
        ? "Cadastrar liderança"
        : "Cadastrar representante";

  return (
    <div className={styles.modalOverlay} onMouseDown={onClose}>
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipes-entity-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalEyebrow}>Operacao territorial</span>
            <h2 className={styles.modalTitle} id="equipes-entity-modal-title">
              {title}
            </h2>
          </div>
          <button
            className={styles.modalCloseButton}
            type="button"
            onClick={onClose}
            disabled={saving || savingTeam}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {isTeam ? (
            <div className={styles.modalGrid}>
              <label className={styles.modalField}>
                <span>Nome da equipe</span>
                <input type="text" value={teamForm.name} onChange={(event) => onTeamChange((current) => ({ ...current, name: event.target.value }))} disabled={savingTeam} />
              </label>
              <label className={styles.modalField}>
                <span>Municipio</span>
                <input type="text" value={teamForm.cityName} onChange={(event) => onTeamChange((current) => ({ ...current, cityName: event.target.value }))} disabled={savingTeam} />
              </label>
              <label className={styles.modalField}>
                <span>Codigo IBGE</span>
                <input type="text" value={teamForm.cityIbgeCode} onChange={(event) => onTeamChange((current) => ({ ...current, cityIbgeCode: event.target.value }))} disabled={savingTeam} />
              </label>
              <label className={styles.modalField}>
                <span>UF</span>
                <select value={teamForm.state} onChange={(event) => onTeamChange((current) => ({ ...current, state: event.target.value }))} disabled={savingTeam}>
                  {states.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
              <label className={styles.modalField}>
                <span>Coordenador</span>
                <input type="text" value={teamForm.coordinatorName} onChange={(event) => onTeamChange((current) => ({ ...current, coordinatorName: event.target.value }))} disabled={savingTeam} />
              </label>
              <label className={styles.modalField}>
                <span>Status</span>
                <select value={teamForm.status} onChange={(event) => onTeamChange((current) => ({ ...current, status: event.target.value }))} disabled={savingTeam}>
                  {memberStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </label>
              <label className={styles.modalField}>
                <span>Observacoes</span>
                <input type="text" value={teamForm.notes} onChange={(event) => onTeamChange((current) => ({ ...current, notes: event.target.value }))} disabled={savingTeam} />
              </label>
            </div>
          ) : isMember ? (
            <div className={styles.modalGrid}>
              <label className={styles.modalField}>
                <span>Equipe</span>
                <select
                  value={memberForm.teamId}
                  onChange={(event) => {
                    const nextTeamId = event.target.value;
                    const nextTeam = teams.find((team) => team.id === nextTeamId) ?? null;
                    onMemberChange((current) => ({
                      ...current,
                      teamId: nextTeamId,
                      cityIbgeCode: nextTeam?.city_ibge_code ?? current.cityIbgeCode,
                    }));
                  }}
                  disabled={saving}
                >
                  <option value="">Selecione</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.city_name}</option>)}
                </select>
              </label>
              <label className={styles.modalField}>
                <span>Nome</span>
                <input type="text" value={memberForm.name} onChange={(event) => onMemberChange((current) => ({ ...current, name: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>E-mail</span>
                <input type="email" value={memberForm.email} onChange={(event) => onMemberChange((current) => ({ ...current, email: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Telefone</span>
                <input type="text" value={memberForm.phone} onChange={(event) => onMemberChange((current) => ({ ...current, phone: formatPhoneInput(event.target.value) }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Funcao</span>
                <input type="text" value={memberForm.role} onChange={(event) => onMemberChange((current) => ({ ...current, role: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Municipio</span>
                <input type="text" value={memberTeam?.city_name || "--"} readOnly />
              </label>
            </div>
          ) : isLeader ? (
            <>
              <div className={styles.modalGrid}>
                <label className={styles.modalField}>
                  <span>Nome</span>
                  <input type="text" value={leaderForm.name} onChange={(event) => onLeaderChange((current) => ({ ...current, name: event.target.value }))} disabled={saving} />
                </label>
                <label className={styles.modalField}>
                  <span>Equipe</span>
                  <select value={leaderForm.teamId} onChange={(event) => onLeaderChange((current) => ({ ...current, teamId: event.target.value }))} disabled={saving}>
                    <option value="">Selecione</option>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.city_name}</option>)}
                  </select>
                </label>
                <label className={styles.modalField}>
                  <span>Telefone</span>
                  <input type="text" value={leaderForm.phone} onChange={(event) => onLeaderChange((current) => ({ ...current, phone: formatPhoneInput(event.target.value) }))} disabled={saving} />
                </label>
                <label className={styles.modalField}>
                  <span>Municipio</span>
                  <input type="text" value={leaderTeam?.city_name || "--"} readOnly />
                </label>
              </div>
              <label className={styles.modalTextareaField}>
                <span>Observacoes</span>
                <textarea rows={4} maxLength={400} value={leaderForm.notes} onChange={(event) => onLeaderChange((current) => ({ ...current, notes: event.target.value }))} disabled={saving} />
              </label>
            </>
          ) : (
            <div className={styles.modalGrid}>
              <label className={styles.modalField}>
                <span>Nome</span>
                <input type="text" value={representativeForm.name} onChange={(event) => onRepresentativeChange((current) => ({ ...current, name: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Equipe</span>
                <select value={representativeForm.teamId} onChange={(event) => onRepresentativeChange((current) => ({ ...current, teamId: event.target.value }))} disabled={saving}>
                  <option value="">Selecione</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.city_name}</option>)}
                </select>
              </label>
              <label className={styles.modalField}>
                <span>E-mail</span>
                <input type="email" value={representativeForm.email} onChange={(event) => onRepresentativeChange((current) => ({ ...current, email: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Funcao</span>
                <input type="text" value={representativeForm.role} onChange={(event) => onRepresentativeChange((current) => ({ ...current, role: event.target.value }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Telefone</span>
                <input type="text" value={representativeForm.phone} onChange={(event) => onRepresentativeChange((current) => ({ ...current, phone: formatPhoneInput(event.target.value) }))} disabled={saving} />
              </label>
              <label className={styles.modalField}>
                <span>Municipio</span>
                <input type="text" value={representativeTeam?.city_name || "--"} readOnly />
              </label>
            </div>
          )}

          {modalError ? <p className={styles.modalErrorMessage}>{modalError}</p> : null}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalSecondaryButton} type="button" onClick={onClose} disabled={saving || savingTeam}>
            Cancelar
          </button>

          {isTeam && editingTeamId ? (
            <>
              <button className={styles.modalSecondaryButton} type="button" onClick={onInactivateTeam} disabled={savingTeam}>
                Inativar equipe
              </button>
              <button className={styles.modalPrimaryButton} type="button" onClick={onRemoveTeam} disabled={savingTeam}>
                Remover equipe
              </button>
            </>
          ) : null}

          <button
            className={styles.modalPrimaryButton}
            type="button"
            onClick={
              isTeam
                ? onSubmitTeam
                : isMember
                  ? onSubmitMember
                  : isLeader
                    ? onSubmitLeader
                    : onSubmitRepresentative
            }
            disabled={saving || savingTeam}
          >
            {saving || savingTeam ? "Salvando..." : title}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Equipes;
