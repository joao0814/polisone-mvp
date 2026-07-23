import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  createTeam,
  createTeamMember,
  getTeamMembers,
  getTeams,
  updateTeam,
} from "../../services/teams";
import styles from "./Equipes.module.css";

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

const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const teamStatuses = [
  { value: "ALL", label: "Todos os status" },
  { value: "ACTIVE", label: "Ativas" },
  { value: "INACTIVE", label: "Inativas" },
];
const memberStatuses = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

const initialTeamForm = {
  name: "",
  cityName: "",
  cityIbgeCode: "",
  state: "SP",
  coordinatorName: "",
  status: "ACTIVE",
  notes: "",
};

const initialMemberForm = {
  name: "",
  phone: "",
  role: "",
  status: "ACTIVE",
  cityIbgeCode: "",
};

function Equipes({ session, onLogout }) {
  const userName = session?.user?.name || "Candidato";
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState(initialTeamForm);
  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [teamMessage, setTeamMessage] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadTeams();
    // A carga inicial deve acontecer apenas na montagem da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
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

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        [team.name, team.city_name, team.coordinator_name, team.city_ibge_code]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesCity = cityFilter === "ALL" || team.city_name === cityFilter;
      const matchesStatus = statusFilter === "ALL" || team.status === statusFilter;

      return matchesSearch && matchesCity && matchesStatus;
    });
  }, [cityFilter, search, statusFilter, teams]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const summaryCards = useMemo(() => {
    const activeTeams = teams.filter((team) => team.status === "ACTIVE").length;
    const totalMembers = teams.reduce(
      (accumulator, team) => accumulator + (team.members_count ?? 0),
      0,
    );
    const cities = new Set(teams.map((team) => team.city_name)).size;

    return [
      { tone: "blue", title: "Total de equipes", value: teams.length, note: "bases cadastradas" },
      { tone: "green", title: "Equipes ativas", value: activeTeams, note: "operando agora" },
      { tone: "cyan", title: "Total de membros", value: totalMembers, note: "vinculados as equipes" },
      { tone: "orange", title: "Municipios cobertos", value: cities, note: "com equipe ativa ou reserva" },
      { tone: "red", title: "Equipes inativas", value: Math.max(teams.length - activeTeams, 0), note: "aguardando reativacao" },
    ];
  }, [teams]);

  const cities = useMemo(
    () => ["ALL", ...new Set(teams.map((team) => team.city_name).filter(Boolean))],
    [teams],
  );

  async function loadTeams(preferredTeamId = selectedTeamId) {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams();
      const items = data.items ?? [];
      setTeams(items);

      if (!items.length) {
        setSelectedTeamId(null);
        setMembers([]);
        return;
      }

      const nextTeamId =
        preferredTeamId && items.some((team) => team.id === preferredTeamId)
          ? preferredTeamId
          : items[0].id;

      setSelectedTeamId(nextTeamId);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNewTeam() {
    setEditingTeamId(null);
    setTeamForm(initialTeamForm);
    setTeamMessage("");
    setError("");
  }

  function handleEditTeam(team) {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name ?? "",
      cityName: team.city_name ?? "",
      cityIbgeCode: team.city_ibge_code ?? "",
      state: team.state ?? "SP",
      coordinatorName: team.coordinator_name ?? "",
      status: team.status ?? "ACTIVE",
      notes: team.notes ?? "",
    });
    setTeamMessage("");
    setError("");
  }

  async function submitTeam(event) {
    event.preventDefault();
    setSavingTeam(true);
    setTeamMessage("");
    setError("");

    try {
      if (editingTeamId) {
        await updateTeam(editingTeamId, normalizeTeamPayload(teamForm));
        setTeamMessage("Equipe atualizada com sucesso.");
        await loadTeams(editingTeamId);
      } else {
        const created = await createTeam(normalizeTeamPayload(teamForm));
        setTeamMessage("Equipe criada com sucesso.");
        setEditingTeamId(created.id);
        await loadTeams(created.id);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingTeam(false);
    }
  }

  async function submitMember(event) {
    event.preventDefault();

    if (!selectedTeam) {
      setError("Selecione uma equipe antes de cadastrar membros.");
      return;
    }

    setSavingMember(true);
    setMemberMessage("");
    setError("");

    try {
      await createTeamMember(selectedTeam.id, normalizeMemberPayload(memberForm));
      setMemberForm({
        ...initialMemberForm,
        cityIbgeCode: selectedTeam.city_ibge_code ?? "",
      });
      setMemberMessage("Membro adicionado com sucesso.");
      await Promise.all([loadTeams(selectedTeam.id), refreshMembers(selectedTeam.id)]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingMember(false);
    }
  }

  async function refreshMembers(teamId) {
    const data = await getTeamMembers(teamId);
    setMembers(data.items ?? []);
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
            <button type="button" onClick={handleNewTeam}>
              <span aria-hidden="true" />
              Nova equipe
            </button>
            <button
              type="button"
              onClick={() =>
                setMemberForm((current) => ({
                  ...current,
                  cityIbgeCode: selectedTeam?.city_ibge_code ?? current.cityIbgeCode,
                }))
              }
              disabled={!selectedTeam}
            >
              <span aria-hidden="true" />
              Novo membro
            </button>
          </div>

          <div className={styles.headerStatus}>
            <strong>{summaryCards[0].value}</strong>
            <small>Equipes mapeadas</small>
            <span>{selectedTeam ? `${selectedTeam.name} selecionada` : "Nenhuma equipe selecionada"}</span>
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
              placeholder="Equipe, coordenador, municipio ou codigo IBGE"
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
                              <small>{team.notes || "Sem observacoes adicionais"}</small>
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
                        <td>{formatNumber(team.members_count ?? 0)}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.inlineAction}
                            onClick={() => handleEditTeam(team)}
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

          <aside className={styles.formsColumn}>
            <section className={styles.formCard}>
              <div className={styles.panelHeading}>
                <div>
                  <small>{editingTeamId ? "Edicao" : "Cadastro"}</small>
                  <h2>{editingTeamId ? "Atualizar equipe" : "Nova equipe"}</h2>
                </div>
              </div>

              <form className={styles.formGrid} onSubmit={submitTeam}>
                <Field label="Nome da equipe">
                  <input
                    value={teamForm.name}
                    onChange={(event) => setTeamForm((current) => ({ ...current, name: event.target.value }))}
                    maxLength="140"
                    required
                  />
                </Field>

                <Field label="Municipio">
                  <input
                    value={teamForm.cityName}
                    onChange={(event) => setTeamForm((current) => ({ ...current, cityName: event.target.value }))}
                    maxLength="120"
                    required
                  />
                </Field>

                <Field label="Codigo IBGE">
                  <input
                    value={teamForm.cityIbgeCode}
                    onChange={(event) => setTeamForm((current) => ({ ...current, cityIbgeCode: event.target.value }))}
                    inputMode="numeric"
                    pattern="\d{7}"
                    maxLength="7"
                    required
                  />
                </Field>

                <Field label="UF">
                  <select
                    value={teamForm.state}
                    onChange={(event) => setTeamForm((current) => ({ ...current, state: event.target.value }))}
                  >
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Coordenador">
                  <input
                    value={teamForm.coordinatorName}
                    onChange={(event) =>
                      setTeamForm((current) => ({
                        ...current,
                        coordinatorName: event.target.value,
                      }))
                    }
                    maxLength="140"
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={teamForm.status}
                    onChange={(event) => setTeamForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    {memberStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Observacoes" wide>
                  <textarea
                    value={teamForm.notes}
                    onChange={(event) => setTeamForm((current) => ({ ...current, notes: event.target.value }))}
                    rows="4"
                    maxLength="2000"
                  />
                </Field>

                <div className={styles.formActions}>
                  <button type="button" className={styles.secondaryButton} onClick={handleNewTeam}>
                    Limpar
                  </button>
                  <button type="submit" disabled={savingTeam}>
                    {savingTeam ? "Salvando..." : editingTeamId ? "Atualizar equipe" : "Criar equipe"}
                  </button>
                </div>
              </form>
            </section>

            <section className={styles.formCard}>
              <div className={styles.panelHeading}>
                <div>
                  <small>Membros da equipe</small>
                  <h2>{selectedTeam ? selectedTeam.name : "Selecione uma equipe"}</h2>
                </div>
                <span>{formatNumber(members.length)} membro(s)</span>
              </div>

              {selectedTeam ? (
                <>
                  <form className={styles.formGrid} onSubmit={submitMember}>
                    <Field label="Nome">
                      <input
                        value={memberForm.name}
                        onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))}
                        maxLength="140"
                        required
                      />
                    </Field>

                    <Field label="Telefone">
                      <input
                        value={memberForm.phone}
                        onChange={(event) => setMemberForm((current) => ({ ...current, phone: event.target.value }))}
                        maxLength="20"
                      />
                    </Field>

                    <Field label="Funcao">
                      <input
                        value={memberForm.role}
                        onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}
                        maxLength="80"
                        required
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        value={memberForm.status}
                        onChange={(event) => setMemberForm((current) => ({ ...current, status: event.target.value }))}
                      >
                        {memberStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Codigo IBGE" wide>
                      <input
                        value={memberForm.cityIbgeCode}
                        onChange={(event) =>
                          setMemberForm((current) => ({
                            ...current,
                            cityIbgeCode: event.target.value,
                          }))
                        }
                        placeholder={selectedTeam.city_ibge_code}
                        maxLength="7"
                      />
                    </Field>

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          setMemberForm({
                            ...initialMemberForm,
                            cityIbgeCode: selectedTeam.city_ibge_code ?? "",
                          })
                        }
                      >
                        Limpar
                      </button>
                      <button type="submit" disabled={savingMember}>
                        {savingMember ? "Salvando..." : "Adicionar membro"}
                      </button>
                    </div>
                  </form>

                  <div className={styles.membersList}>
                    {members.length ? (
                      members.map((member) => (
                        <article className={styles.memberCard} key={member.id}>
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.role}</span>
                          </div>
                          <small>{member.phone || "Sem telefone informado"}</small>
                        </article>
                      ))
                    ) : (
                      <p className={styles.emptyMembers}>
                        Ainda nao existem membros cadastrados para esta equipe.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className={styles.emptyMembers}>
                  Selecione uma equipe na lista para cadastrar e visualizar membros.
                </p>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Field({ label, wide = false, children }) {
  return (
    <label className={wide ? styles.wideField : styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function normalizeTeamPayload(form) {
  return {
    name: form.name,
    cityName: form.cityName,
    cityIbgeCode: form.cityIbgeCode,
    state: form.state,
    coordinatorName: form.coordinatorName,
    status: form.status,
    notes: form.notes,
  };
}

function normalizeMemberPayload(form) {
  return {
    name: form.name,
    phone: form.phone,
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

export default Equipes;
