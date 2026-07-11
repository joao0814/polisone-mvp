import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logoNav from "../../../assets/images/home/logo nav.png";
import {
  addTicketMessage,
  closeTicket,
  getTicketById,
  reopenTicket,
  updateTicketStatus,
} from "../../../services/tickets";
import {
  formatTicketDate,
  mapDepartmentFromApi,
  mapDepartmentLabel,
  mapPriorityLabel,
  mapStatusLabel,
  mapStatusTone,
} from "../helpers";
import { getClassificationLabel } from "../ticketOptions";
import styles from "./DetalheChamado.module.css";
import PortalNavbar from "../../../components/Common/PortalNavbar/PortalNavbar";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Aberto" },
  { value: "IN_ANALYSIS", label: "Em analise" },
  { value: "WAITING_CUSTOMER", label: "Aguardando cliente" },
  { value: "WAITING_INTERNAL", label: "Aguardando interno" },
  { value: "RESOLVED", label: "Resolvido" },
];

function DetalheChamado({ session, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusDraft, setStatusDraft] = useState("OPEN");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadTicket() {
      setLoading(true);
      setError("");

      try {
        const response = await getTicketById(id);

        if (!isActive) {
          return;
        }

        setTicket(response);
        setStatusDraft(response.status);
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

    loadTicket();

    return () => {
      isActive = false;
    };
  }, [id]);

  const classificationLabel = useMemo(() => {
    if (!ticket?.subcategory) {
      return "-";
    }

    return getClassificationLabel(
      mapDepartmentFromApi(ticket.department),
      ticket.subcategory,
    );
  }, [ticket]);

  async function refreshTicket() {
    const response = await getTicketById(id);
    setTicket(response);
    setStatusDraft(response.status);
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setSendingMessage(true);
    setError("");

    try {
      await addTicketMessage(id, message.trim());
      setMessage("");
      await refreshTicket();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleStatusUpdate() {
    setUpdatingStatus(true);
    setError("");

    try {
      await updateTicketStatus(id, statusDraft);
      await refreshTicket();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleCloseTicket() {
    setUpdatingStatus(true);
    setError("");

    try {
      await closeTicket(id, "Chamado finalizado pelo usuario.");
      await refreshTicket();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleReopenTicket() {
    setUpdatingStatus(true);
    setError("");

    try {
      await reopenTicket(id, "Chamado reaberto pelo usuario.");
      await refreshTicket();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header user={session?.user} onLogout={onLogout} />

        <section className={styles.shell}>
          <div className={styles.topbar}>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => navigate("/chamados")}
            >
              Voltar
            </button>
            <Link className={styles.newButton} to="/chamados/novo">
              Novo chamado
            </Link>
          </div>

          {loading ? (
            <div className={styles.loadingCard}>Carregando chamado...</div>
          ) : ticket ? (
            <>
              <section className={styles.hero}>
                <div>
                  <p className={styles.eyebrow}>Protocolo {ticket.protocol}</p>
                  <h1>{ticket.subject}</h1>
                </div>
                <span
                  className={`${styles.statusBadge} ${styles[mapStatusTone(ticket.status)]}`}
                >
                  {mapStatusLabel(ticket.status)}
                </span>
              </section>

              <section className={styles.metaGrid}>
                <article className={styles.metaCard}>
                  <span>Departamento</span>
                  <strong>{mapDepartmentLabel(ticket.department)}</strong>
                </article>
                <article className={styles.metaCard}>
                  <span>Classificacao</span>
                  <strong>{classificationLabel}</strong>
                </article>
                <article className={styles.metaCard}>
                  <span>Prioridade</span>
                  <strong>{mapPriorityLabel(ticket.priority)}</strong>
                </article>
                <article className={styles.metaCard}>
                  <span>Criado em</span>
                  <strong>{formatTicketDate(ticket.created_at)}</strong>
                </article>
              </section>

              <section className={styles.actionsPanel}>
                <label className={styles.statusField}>
                  <span>Status</span>
                  <select
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    disabled={ticket.status === "CLOSED" || updatingStatus}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={
                      updatingStatus ||
                      ticket.status === "CLOSED" ||
                      statusDraft === ticket.status
                    }
                  >
                    Atualizar status
                  </button>

                  {ticket.status === "CLOSED" ? (
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={handleReopenTicket}
                      disabled={updatingStatus}
                    >
                      Reabrir
                    </button>
                  ) : (
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={handleCloseTicket}
                      disabled={updatingStatus}
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </section>

              {error ? <p className={styles.errorText}>{error}</p> : null}

              <section className={styles.timelineSection}>
                <div className={styles.sectionHeader}>
                  <h2>Historico do chamado</h2>
                  <span>{ticket.messages.length} interacoes</span>
                </div>

                <div className={styles.timeline}>
                  {ticket.messages.map((entry) => (
                    <article className={styles.messageCard} key={entry.id}>
                      <div className={styles.messageHeader}>
                        <strong>
                          {entry.sender_id === session?.user?.id
                            ? "Voce"
                            : "Atendimento"}
                        </strong>
                        <span>{formatTicketDate(entry.created_at)}</span>
                      </div>
                      <p>{entry.message}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.replySection}>
                <h2>Nova mensagem</h2>
                <form className={styles.replyForm} onSubmit={handleSendMessage}>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Escreva aqui a sua resposta"
                    rows="6"
                    maxLength={5000}
                    required
                  />
                  <div className={styles.replyActions}>
                    <span>As mensagens sao enviadas diretamente para o historico do chamado.</span>
                    <button
                      className={styles.primaryButton}
                      type="submit"
                      disabled={sendingMessage || ticket.status === "CLOSED"}
                    >
                      {sendingMessage ? "Enviando..." : "Enviar mensagem"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          ) : (
            <div className={styles.loadingCard}>Chamado nao encontrado.</div>
          )}
        </section>
      </div>
    </main>
  );
}

function Header({ user, onLogout }) {
  return <PortalNavbar user={user} onLogout={onLogout} activeResource="chamados" />;
}

export function LegacyHeader({ user, onLogout }) {
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

export default DetalheChamado;
