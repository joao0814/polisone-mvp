import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoNav from "../../../assets/images/home/logo nav.png";
import styles from "./NovoChamado.module.css";

function NovoChamado({ session, onLogout }) {
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
            onSubmit={(event) => event.preventDefault()}
          >
            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Departamento</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Selecionar departamento
                  </option>
                  <option>Financeiro</option>
                  <option>Tecnologia</option>
                  <option>Operacoes</option>
                  <option>Comercial</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Propriedade</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Selecione
                  </option>
                  <option>Portal do candidato</option>
                  <option>Aplicativo</option>
                  <option>Site institucional</option>
                </select>
              </label>
            </div>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Assunto</span>
              <input type="text" placeholder="Assunto do Chamado" />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Mensagem</span>
              <textarea rows="10" placeholder="Descreva aqui seu chamado" />
            </label>

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

              <button className={styles.submitButton} type="button">
                Criar chamado
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
                type="button"
                onClick={() => handleResourceSelect("/chamados")}
                role="menuitem"
              >
                Chamados
              </button>
              <button type="button" role="menuitem">
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
        <button
          className={styles.userButton}
          type="button"
          onClick={onLogout}
          aria-label="Sair"
        >
          <span>{getInitials(user?.name)}</span>
        </button>
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
