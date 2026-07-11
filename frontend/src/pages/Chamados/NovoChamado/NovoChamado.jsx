import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoNav from "../../../assets/images/home/logo nav.png";
import { createTicket } from "../../../services/tickets";
import {
  mapDepartmentToApi,
  mapPriorityToApi,
} from "../helpers";
import {
  CLASSIFICATION_OPTIONS_BY_DEPARTMENT,
  DEPARTMENT_OPTIONS,
  getClassificationFieldLabel,
} from "../ticketOptions";
import styles from "./NovoChamado.module.css";

function NovoChamado({ session, onLogout }) {
  const navigate = useNavigate();
  const [department, setDepartment] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("media");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const classificationOptions = useMemo(
    () => CLASSIFICATION_OPTIONS_BY_DEPARTMENT[department] ?? [],
    [department],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const createdTicket = await createTicket({
        subject: subject.trim(),
        department: mapDepartmentToApi(department),
        subcategory: subcategory || undefined,
        priority: mapPriorityToApi(priority),
        message: message.trim(),
      });

      navigate(`/chamados/${createdTicket.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header user={session?.user} onLogout={onLogout} />

        <section className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1>Abrir chamado</h1>
            <Link className={styles.cancelButton} to="/chamados">
              Cancelar
            </Link>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Departamento</span>
                <select
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    setSubcategory("");
                  }}
                  required
                >
                  <option value="" disabled>
                    Selecionar departamento
                  </option>
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>{getClassificationFieldLabel(department)}</span>
                <select
                  value={subcategory}
                  onChange={(event) => setSubcategory(event.target.value)}
                  disabled={!classificationOptions.length}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {classificationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span>Prioridade</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Assunto</span>
              <input
                type="text"
                placeholder="Assunto do Chamado"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={255}
                required
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Mensagem</span>
              <textarea
                rows="10"
                placeholder="Descreva aqui seu chamado"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={5000}
                required
              />
            </label>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <div className={styles.actions}>
              <div className={styles.uploadGroup}>
                <button className={styles.uploadButton} type="button">
                  Subir arquivo
                </button>
                <button
                  className={styles.uploadIcon}
                  type="button"
                  aria-label="Adicionar arquivo"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Criando..." : "Criar chamado"}
              </button>
            </div>
          </form>
        </section>

        <BrandSignature />
      </div>
      <Footer />
    </main>
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
              className={`${styles.resourceCaret} ${isResourcesOpen ? styles.resourceCaretOpen : ""}`}
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

export default NovoChamado;
