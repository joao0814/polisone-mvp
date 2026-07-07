import styles from './Home.module.css'

const links = [
  { label: 'Chamados', icon: 'support', tone: 'yellow' },
  { label: 'Materiais de Campanha', icon: 'briefcase', tone: 'black' },
  { label: 'Check-in', icon: 'check', tone: 'black' },
  { label: 'Outlook', icon: 'mail', tone: 'blue' },
  { label: 'YouTube', icon: 'play', tone: 'red' },
  { label: 'Canva', icon: 'canva', tone: 'cyan' },
]

const systems = ['Gestao de Campanha', 'Gestao de Mandato', 'BI', 'IA']

const comunicados = [
  'Sentem o que voce nao sente. Torca com consciencia!!!',
  'Urgente!!!',
  'Dia do case em nova odessa',
]

const days = Array.from({ length: 31 }, (_, index) => index + 1)
const eventDays = [12, 16, 18, 26]
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Header />
        <SearchLinks />
        <HeroSection />
        <Comunicados />
        <Calendar />
        <BrandSignature />
      </div>
      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className={styles.header}>
      <BrandLogo small />
      <nav className={styles.nav} aria-label="Menu principal">
        <a href="#home">Home</a>
        <a href="#institucional">Institucional</a>
        <a href="#calendarios">Calendários e comunicados</a>
        <a href="#recursos">Recursos</a>
      </nav>
      <div className={styles.headerRight}>
        <div className={styles.clock}>
          <span>Horário de Brasília</span>
          <strong>09:52</strong>
          <small>31.01.2026</small>
        </div>
        <button className={styles.userButton} type="button" aria-label="Perfil" />
      </div>
    </header>
  )
}

function SearchLinks() {
  return (
    <section className={styles.searchLinks} aria-label="Busca e links rápidos">
      <form className={styles.search}>
        <input type="search" placeholder="Pesquise o que quiser..." />
        <button type="submit" aria-label="Pesquisar" />
      </form>

      <section className={styles.links}>
        <h2>Links</h2>
        <div className={styles.linkList}>
          {links.map((link) => (
            <button className={`${styles.linkCard} ${styles[link.tone]}`} type="button" key={link.label}>
              <span className={`${styles.linkIcon} ${styles[link.icon]}`} />
              <small>{link.label}</small>
            </button>
          ))}
          <button className={styles.addLink} type="button">
            <span>+</span>
            <small>Adicionar novo link</small>
          </button>
        </div>
      </section>
    </section>
  )
}

function HeroSection() {
  return (
    <section className={styles.heroSection}>
      <aside className={styles.systems}>
        <div className={styles.systemCards}>
          {systems.map((system, index) => (
            <button className={styles.systemCard} type="button" key={system}>
              <span>{system}</span>
              {index === 0 && <strong>Campanha</strong>}
            </button>
          ))}
        </div>
        <h2>Sistemas</h2>
      </aside>

      <section className={styles.banner}>
        <div className={styles.bannerCopy}>
          <BrandLogo small />
          <p>Seja Bem-vindo ao</p>
          <h1>Portal do Candidato</h1>
          <span>Alan Leal</span>
        </div>
        <div className={styles.personPlaceholder} aria-hidden="true" />
      </section>

      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span className={styles.dotActive} />
      </div>
    </section>
  )
}

function Comunicados() {
  return (
    <section className={styles.comunicados}>
      <h2>Comunicados</h2>
      <div className={styles.comunicadoGrid}>
        {comunicados.map((title, index) => (
          <article className={styles.comunicadoCard} key={title}>
            <div className={`${styles.comunicadoImage} ${styles[`comunicado${index + 1}`]}`}>
              <strong>{title}</strong>
            </div>
            <div className={styles.comunicadoBody}>
              <h3>Título do comunicado</h3>
              <span>Autor</span>
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
              </p>
              <footer>
                <span>◉ 0</span>
                <span>♥ 0</span>
                <span>● 0</span>
                <span>★</span>
                <span>↗</span>
                <time>27/01/2025</time>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Calendar() {
  return (
    <section className={styles.calendar}>
      <aside className={styles.today}>
        <strong>01</strong>
        <span>Quarta-feira</span>
        <h2>Eventos hoje</h2>
        <EventCard />
        <EventCard />
        <button className={styles.addEvent} type="button">
          <span>+</span>
          Adicionar novo evento
        </button>
      </aside>

      <section className={styles.month}>
        <h2>2025</h2>
        <p>JAN - FEV - MAR - ABR - MAI - JUN - JUL - AGO - SET - OUT - NOV - DEZ</p>
        <div className={styles.monthGrid}>
          {weekDays.map((day) => (
            <strong key={day}>{day}</strong>
          ))}
          {days.map((day) => (
            <span
              className={`${eventDays.includes(day) ? styles.eventDay : ''} ${
                day === 18 ? styles.activeDay : ''
              }`}
              key={day}
            >
              {String(day).padStart(2, '0')}
            </span>
          ))}
        </div>
      </section>
    </section>
  )
}

function EventCard() {
  return (
    <article className={styles.eventCard}>
      <strong>Nome do evento</strong>
      <span>Descrição:</span>
    </article>
  )
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
  return (
    <div className={`${styles.logo} ${small ? styles.logoSmall : ''}`}>
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

export default Home
