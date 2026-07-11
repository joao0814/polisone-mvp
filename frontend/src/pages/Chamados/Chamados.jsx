import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoNav from "../../assets/images/home/logo nav.png";
import { listTickets } from "../../services/tickets";
import { formatTicketDate, mapStatusLabel, mapStatusTone } from "./helpers";
import styles from "./Chamados.module.css";

function Chamados({ session, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");
  const [openTickets, setOpenTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const [openResponse, closedResponse] = await Promise.all([
          listTickets({ status: "open" }),
          listTickets({ status: "closed" }),
        ]);

        if (!isActive) {
          return;
        }

        setOpenTickets(openResponse.items ?? []);
        setClosedTickets(closedResponse.items ?? []);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError(requestError.message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      isActive = false;
    };
  }, []);

  const visibleOpenTickets = useMemo(
    () => filterTickets(openTickets, search),
    [openTickets, search],
  );

  const visibleClosedTickets = useMemo(
    () => filterTickets(closedTickets, search),
    [closedTickets, search],
  );

  const stats = useMemo(() => {
    const allTickets = [...openTickets, ...closedTickets];

    return [
      {
        label: "Respondidos",
        value: allTickets.filter((ticket) => ticket.status === "RESOLVED")
          .length,
      },
      {
        label: "Aguardando",
        value: allTickets.filter((ticket) => ticket.status === "WAITING_CUSTOMER")
          .length,
      },
      {
        label: "Em analise",
        value: allTickets.filter((ticket) => ticket.status === "IN_ANALYSIS")
          .length,
      },
      {
        label: "Nvl2",
        value: allTickets.filter((ticket) => ticket.status === "WAITING_INTERNAL")
          .length,
      },
      {
        label: "Concluidos",
        value: allTickets.filter((ticket) => ticket.status === "CLOSED").length,
      },
    ];
  }, [openTickets, closedTickets]);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header user={session?.user} onLogout={onLogout} />

        <section className={styles.ticketHero}>
          <div>
            <h1>Meus chamados</h1>
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <article className={styles.statCard} key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <button
            className={styles.newTicketButton}
            type="button"
            onClick={() => navigate("/chamados/novo")}
          >
            Novo chamado
          </button>
        </section>

        <section className={styles.searchRow} aria-label="Busca de chamados">
          <input
            type="search"
            aria-label="Pesquisar chamado"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" aria-label="Pesquisar" />
        </section>

        <section className={styles.ticketSection}>
          <h2>Chamados</h2>
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Status dos chamados"
          >
            <button
              className={activeTab === "open" ? styles.tabActive : ""}
              type="button"
              onClick={() => setActiveTab("open")}
            >
              Abertos
            </button>
            <button
              className={activeTab === "closed" ? styles.tabActive : ""}
              type="button"
              onClick={() => setActiveTab("closed")}
            >
              Fechados
            </button>
          </div>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          {loading ? (
            <div className={styles.tableCard}>
              <p className={styles.emptyState}>Carregando chamados...</p>
            </div>
          ) : activeTab === "open" ? (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <span>Protocolo</span>
                <span>Assunto</span>
                <span>Solicitante</span>
                <span>Status</span>
                <span>Data</span>
              </div>
              {visibleOpenTickets.length ? (
                visibleOpenTickets.map((ticket) => (
                  <article
                    className={styles.tableRow}
                    key={ticket.id}
                    onClick={() => navigate(`/chamados/${ticket.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/chamados/${ticket.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <strong className={styles.protocolCell}>{ticket.protocol}</strong>
                    <span className={styles.subjectCell}>{ticket.subject}</span>
                    <span className={styles.requesterCell}>
                      {ticket.requester_id === session?.user?.id
                        ? "Voce"
                        : "Atendimento"}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${styles[mapStatusTone(ticket.status)]}`}
                    >
                      {mapStatusLabel(ticket.status)}
                    </span>
                    <time className={styles.dateCell}>
                      {formatTicketDate(ticket.created_at)}
                    </time>
                  </article>
                ))
              ) : (
                <p className={styles.emptyState}>
                  Nenhum chamado aberto encontrado.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div
                className={`${styles.tableHeader} ${styles.closedTableHeader}`}
              >
                <span>Protocolo</span>
                <span>Assunto</span>
                <span>Solicitante</span>
                <span>Data</span>
              </div>
              {visibleClosedTickets.length ? (
                visibleClosedTickets.map((ticket) => (
                  <article
                    className={`${styles.tableRow} ${styles.closedTableRow}`}
                    key={ticket.id}
                    onClick={() => navigate(`/chamados/${ticket.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/chamados/${ticket.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <strong className={styles.protocolCell}>{ticket.protocol}</strong>
                    <span className={styles.subjectCell}>{ticket.subject}</span>
                    <span className={styles.requesterCell}>
                      {ticket.requester_id === session?.user?.id
                        ? "Voce"
                        : "Atendimento"}
                    </span>
                    <time className={styles.dateCell}>
                      {formatTicketDate(ticket.updated_at)}
                    </time>
                  </article>
                ))
              ) : (
                <p className={styles.emptyState}>
                  Nenhum chamado concluido encontrado.
                </p>
              )}
            </div>
          )}
        </section>

        <BrandSignature />
      </div>
      <Footer />
    </main>
  );
}

function filterTickets(tickets, search) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return tickets;
  }

  return tickets.filter((ticket) =>
    [ticket.protocol, ticket.subject, mapStatusLabel(ticket.status)]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch)),
  );
}

function Header({ user, onLogout }) {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleResourceSelect(path) {
    setIsResourcesOpen(false);
    navigate(path);
  }

  return (
    <header className={styles.header}>
      <BrandLogo small />
      <nav className={styles.nav} aria-label="Menu principal">
        <Link to="/">Home</Link>
        <a href="#institucional">Institucional</a>
        <a href="#calendarios">Calendarios e comunicados</a>
        <div className={styles.navSelect}>
          <button
            style={{ color: "#ffca18" }}
            type="button"
            onClick={() => setIsResourcesOpen((isOpen) => !isOpen)}
            aria-expanded={isResourcesOpen}
            aria-haspopup="menu"
          >
            Recursos{" "}
            <span
              className={`${styles.resourceCaret} ${
                isResourcesOpen ? styles.resourceCaretOpen : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {isResourcesOpen && (
            <div className={styles.navMenu} role="menu">
              <button
                style={{ background: "rgba(255, 202, 24, 0.22)", fontWeight: 900 }}
                type="button"
                onClick={() => handleResourceSelect("/chamados")}
                role="menuitem"
              >
                Chamados
              </button>
              <button type="button" onClick={() => handleResourceSelect("/comunicados")} role="menuitem">
                Comunicados
              </button>
              <button type="button" role="menuitem">
                Gestao de banners
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.clock}>
          <span>Horario de Brasilia</span>
          <strong>09:52</strong>
          <small>01.03.2025</small>
        </div>
        <div className={styles.userMenuWrap}>
          <button
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            aria-label="Abrir opcoes do usuario"
            className={styles.userButton}
            type="button"
            onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
          >
            <span>{getInitials(user?.name)}</span>
          </button>
          {isUserMenuOpen ? (
            <div className={styles.userMenu} role="menu">
              <button type="button" role="menuitem">
                Alterar dados do perfil
              </button>
              <button type="button" onClick={onLogout} role="menuitem">
                Sair da conta
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function getInitials(name = "") {
  const [firstName = "", lastName = ""] = name.trim().split(" ");
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim();

  return initials.toUpperCase() || "U";
}

function BrandSignature() {
  return (
    <section className={styles.signature} aria-label="Polis One">
      <BrandLogo />
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <section>
        <h2>POLIS I.A - Plataforma de gestao de campanha e mandato</h2>
        <p>
          CNPJ: 39.453.451/0001-22
          <br />
          Rua Tabapua, 594, Edificio Itaim, 3o andar,
          <br />
          Itaim Bibi - Sao Paulo/SP.
        </p>
      </section>
      <section>
        <h2>Atendimento</h2>
        <p>+55 (11) 916285698</p>
        <p>Segunda - Sexta das 08:00 as 18:00</p>
      </section>
      <section>
        <h2>Baixe agora o nosso App:</h2>
        <div className={styles.storeButtons}>
          <span>Google Play</span>
          <span>App Store</span>
        </div>
        <h2>Redes sociais</h2>
        <div className={styles.socials}>
          <span>f</span>
          <span>ig</span>
          <span>in</span>
          <span>web</span>
        </div>
      </section>
    </footer>
  );
}

function BrandLogo({ small = false }) {
  if (small) {
    return (
      <div className={`${styles.logo} ${styles.logoSmall}`}>
        <img className={styles.logoImage} src={logoNav} alt="Polis One" />
      </div>
    );
  }

  return (
    <div className={styles.logo}>
      <span className={styles.logoIcon} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.logoText}>
        <strong>POLIS</strong>
        <small>ONE</small>
      </span>
    </div>
  );
}

export default Chamados;
