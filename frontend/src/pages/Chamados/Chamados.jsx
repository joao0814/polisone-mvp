import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoNav from '../../assets/images/home/logo nav.png'
import styles from './ChamadosPolis.module.css'

const stats = [
  { label: 'Respondidos', value: 12 },
  { label: 'Aguardando', value: 12 },
  { label: 'Em análise', value: 12 },
  { label: 'Nvl2', value: 12 },
  { label: 'Concluídos', value: 12 },
]

const tickets = [
  {
    protocol: '#1821',
    subject: 'Solicitação para desativar CellCash',
    requester: 'Interno',
    status: 'Respondido pelo cliente',
    tone: 'answered',
    date: '12/11/2025 09:39',
  },
  {
    protocol: '#1821',
    subject: 'Solicitação para desativar CellCash',
    requester: 'Interno',
    status: 'Aguardando interação do cliente',
    tone: 'waiting',
    date: '12/11/2025 09:39',
  },
  {
    protocol: '#1821',
    subject: 'Solicitação para desativar CellCash',
    requester: 'Interno',
    status: 'Em análise',
    tone: 'analysis',
    date: '12/11/2025 09:39',
  },
  {
    protocol: '#1821',
    subject: 'Solicitação para desativar CellCash',
    requester: 'Interno',
    status: 'Aguardando suporte Nvl.2',
    tone: 'support',
    date: '12/11/2025 09:39',
  },
]

function Chamados({ session, onLogout }) {
  const navigate = useNavigate()

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
            onClick={() => navigate('/chamados/novo')}
          >
            Novo chamado
          </button>
        </section>

        <section className={styles.searchRow} aria-label="Busca de chamados">
          <input type="search" aria-label="Pesquisar chamado" />
          <button type="button" aria-label="Pesquisar" />
        </section>

        <section className={styles.ticketSection}>
          <h2>Chamados</h2>
          <div className={styles.tabs} role="tablist" aria-label="Status dos chamados">
            <button className={styles.tabActive} type="button">
              Abertos
            </button>
            <button type="button">Fechados</button>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span>Protocolo</span>
              <span>Assunto</span>
              <span>Solicitante</span>
              <span>Status</span>
              <span>Data</span>
            </div>
            {tickets.map((ticket, index) => (
              <article className={styles.tableRow} key={`${ticket.protocol}-${ticket.status}-${index}`}>
                <strong>{ticket.protocol}</strong>
                <span>{ticket.subject}</span>
                <span>{ticket.requester}</span>
                <span className={`${styles.statusBadge} ${styles[ticket.tone]}`}>{ticket.status}</span>
                <time>{ticket.date}</time>
              </article>
            ))}
          </div>
        </section>

        <BrandSignature />
      </div>
      <Footer />
    </main>
  )
}

function Header({ user, onLogout }) {
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const navigate = useNavigate()

  function handleResourceSelect(path) {
    setIsResourcesOpen(false)
    navigate(path)
  }

  return (
    <header className={styles.header}>
      <BrandLogo small />
      <nav className={styles.nav} aria-label="Menu principal">
        <Link to="/">Home</Link>
        <a href="#institucional">Institucional</a>
        <a href="#calendarios">Calendários e comunicados</a>
        <div className={styles.navSelect}>
          <button
            type="button"
            onClick={() => setIsResourcesOpen((isOpen) => !isOpen)}
            aria-expanded={isResourcesOpen}
            aria-haspopup="menu"
          >
            Recursos <span className={`${styles.resourceCaret} ${isResourcesOpen ? styles.resourceCaretOpen : ''}`} aria-hidden="true" />
          </button>
          {isResourcesOpen && (
            <div className={styles.navMenu} role="menu">
              <button type="button" onClick={() => handleResourceSelect('/chamados')} role="menuitem">
                Chamados
              </button>
              <button type="button" role="menuitem">
                Acervo
              </button>
              <button type="button" role="menuitem">
                Comunicados
              </button>
              <button type="button" role="menuitem">
                Gestão de banners
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.clock}>
          <span>Horário de Brasília</span>
          <strong>09:52</strong>
          <small>01.03.2025</small>
        </div>
        <button className={styles.userButton} type="button" onClick={onLogout} aria-label="Sair">
          <span>{getInitials(user?.name)}</span>
        </button>
      </div>
    </header>
  )
}

function getInitials(name = '') {
  const [firstName = '', lastName = ''] = name.trim().split(' ')
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim()

  return initials.toUpperCase() || 'U'
}

function BrandSignature() {
  return (
    <section className={styles.signature} aria-label="Polis One">
      <BrandLogo />
    </section>
  )
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <section>
        <h2>POLIS I.A - Plataforma de gestão de campanha e mandato</h2>
        <p>
          CNPJ: 39.453.451/0001-22
          <br />
          Rua Tabapuã, 594, Edifício Itaim, 3º andar,
          <br />
          Itaim Bibi - São Paulo/SP.
        </p>
      </section>
      <section>
        <h2>Atendimento</h2>
        <p>+55 (11) 916285698</p>
        <p>Segunda - Sexta das 08:00 às 18:00</p>
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
  )
}

function BrandLogo({ small = false }) {
  if (small) {
    return (
      <div className={`${styles.logo} ${styles.logoSmall}`}>
        <img className={styles.logoImage} src={logoNav} alt="Polis One" />
      </div>
    )
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
  )
}

export default Chamados
