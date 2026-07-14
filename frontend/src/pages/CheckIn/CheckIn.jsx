import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Common/Sidebar/Sidebar";
import logoNav from "../../assets/images/home/logo nav.png";
import {
  countdowns,
  menuItems,
  photoCards,
} from "./data/checkInData";
import {
  getCampaignActivities,
  getCampaignCheckIns,
  getCampaignLeaders,
} from "../../services/campaignOperations";
import { getTeams } from "../../services/teams";
import styles from "./CheckIn.module.css";

function CheckIn({ session, onLogout }) {
  const userName = session?.user?.name || "Deputado Alan Leal";
  const [search, setSearch] = useState("");
  const [checkIns, setCheckIns] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [teamsResponse, setTeamsResponse] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      getCampaignCheckIns(),
      getCampaignLeaders(),
      getCampaignActivities(),
      getTeams(),
    ]).then(([checkInsResult, leadersResult, activitiesResult, teamsResult]) => {
      if (!active) return;

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
      setTeamsResponse(
        teamsResult.status === "fulfilled" ? teamsResult.value : null,
      );
    });

    return () => {
      active = false;
    };
  }, []);

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
  const searchTerm = normalizeText(search);
  const activeTeamRows = useMemo(() => {
    return todayCheckIns
      .filter((item) => item.status === "CHECKED_IN")
      .filter((item) => {
        if (!searchTerm) return true;

        return normalizeText(
          `${item.person_name} ${item.city_name} ${item.activity_type}`,
        ).includes(searchTerm);
      })
      .map((item) => ({
        id: item.id,
        name: item.person_name,
        city: item.city_name,
        badge: formatActivityType(item.activity_type),
        badgeTone: resolveBadgeTone(item.activity_type),
        initials: getInitials(item.person_name),
        status: "Em atividade",
        checkin: formatTime(item.checked_in_at),
        checkout: item.checked_out_at ? formatTime(item.checked_out_at) : "--",
      }));
  }, [searchTerm, todayCheckIns]);

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

          <div className={styles.headerActions}>
            <button type="button">
              <span aria-hidden="true" />
              Cadastrar nova lideranca
            </button>
            <button type="button">
              <span aria-hidden="true" />
              Cadastrar representante
            </button>
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

        <form className={styles.mainSearch} aria-label="Buscar lideranca ou representante">
          <input
            placeholder="Buscar por lideranca/representante"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button">
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
                <input aria-label="Busca em equipes em atividade" placeholder="Busca" type="search" />
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
                    <th>Status</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTeamRows.map((team) => (
                    <tr key={team.id}>
                      <td>
                        <div className={styles.personCell}>
                          <span className={styles.avatar}>{team.initials}</span>
                          <div>
                            <strong>{team.name}</strong>
                            <small>{team.city}</small>
                          </div>
                          <em className={styles[team.badgeTone]}>{team.badge}</em>
                        </div>
                      </td>
                      <td>
                        <span className={styles.statusBadge}>{team.status}</span>
                      </td>
                      <td>{team.checkin}</td>
                      <td>{team.checkout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className={styles.pagination}>
              <span>Mostrando 1 a {activeTeamRows.length} de {activeTeamRows.length}</span>
              <nav aria-label="Paginacao de check-in">
                {Array.from({ length: 10 }).map((_, index) => (
                  <button
                    className={index === 0 ? styles.pageActive : ""}
                    key={`page-${index + 1}`}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
              <button type="button">10 por pagina</button>
            </footer>
          </article>

          <aside className={styles.sidePanels}>
            <DonutPanel items={activityTypes} title="Atividades por tipo" />
            <DonutPanel
              center={formatInteger(todayCheckIns.length)}
              items={checkPerformance}
              title="Desempenho de Check"
            />
          </aside>
        </section>

        <section className={styles.photosPanel} aria-label="Fotos de check-in e atividades">
          {photoCards.map((card) => (
            <PhotoCard card={card} key={card.title} />
          ))}
        </section>
      </section>
    </main>
  );
}

function DonutPanel({ center, items, title }) {
  return (
    <article className={styles.donutPanel}>
      <h2>{title}</h2>
      <div className={styles.donutWrap}>
        <div className={styles.donut} aria-hidden="true">
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
              <span>{item.label}</span>
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
      color: item.color ?? palette[index % palette.length],
    }));
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

export default CheckIn;
