import styles from "./Home.module.css";

function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <section className={styles.footerBlock}>
        <h2>POLIS I.A - Plataforma de gestão de campanha e mandato</h2>
        <p className={styles.footerText}>
          CNPJ: 39.453.451/0001-22
          <br />
          Rua Tabapuã, 594, Edifício Itaim, 3º andar,
          <br />
          Itaim Bibi - São Paulo/SP.
        </p>
      </section>

      <section className={styles.footerBlock}>
        <h2>Atendimento</h2>
        <div className={styles.contactList}>
          <div className={styles.contactItem}>
            <PhoneIcon />
            <p>+55 (11) 91628-5698</p>
          </div>
          <div className={styles.contactItem}>
            <ClockIcon />
            <p>
              Segunda a Sexta
              <br />
              das 08:00 às 18:00
            </p>
          </div>
        </div>
      </section>

      <section className={styles.footerBlock}>
        <h2>Baixe agora o nosso App:</h2>
        <div className={styles.storeButtons}>
          <a className={styles.storeBadge} href="#" aria-label="Disponível no Google Play">
            <GooglePlayBadgeIcon />
            <span className={styles.storeBadgeText}>
              <small>DISPONÍVEL NO</small>
              <strong>Google Play</strong>
            </span>
          </a>

          <a className={styles.storeBadge} href="#" aria-label="Disponível na App Store">
            <AppStoreBadgeIcon />
            <span className={styles.storeBadgeText}>
              <small>Disponível na</small>
              <strong>App Store</strong>
            </span>
          </a>
        </div>

        <h2 className={styles.socialTitle}>Redes sociais</h2>
        <div className={styles.socials}>
          <a className={styles.socialIcon} href="#" aria-label="Facebook">
            <FacebookIcon />
          </a>
          <a className={styles.socialIcon} href="#" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a className={styles.socialIcon} href="#" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a className={styles.socialIcon} href="#" aria-label="Website">
            <GlobeIcon />
          </a>
        </div>
      </section>
    </footer>
  );
}

function GooglePlayBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#34a853" d="M3 2.5 14.7 12 3 21.5z" />
      <path fill="#4285f4" d="m14.7 12 3.2-2.6 3.8 2.1-3.8 2.1z" />
      <path fill="#fbbc04" d="M3 2.5 17.9 9.4 14.7 12z" />
      <path fill="#ea4335" d="M3 21.5 14.7 12l3.2 2.6z" />
    </svg>
  );
}

function AppStoreBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.57 12.54c.03 2.93 2.57 3.9 2.6 3.91-.02.07-.4 1.39-1.31 2.75-.79 1.18-1.6 2.35-2.89 2.38-1.27.03-1.68-.75-3.13-.75-1.45 0-1.9.73-3.1.77-1.24.05-2.19-1.25-2.99-2.42-1.63-2.36-2.88-6.67-1.2-9.59.83-1.45 2.32-2.37 3.95-2.39 1.23-.02 2.39.83 3.13.83.74 0 2.12-1.02 3.57-.87.61.03 2.31.25 3.41 1.86-.09.06-2.04 1.19-2.03 3.52Zm-2.2-6.05c.66-.8 1.11-1.91.99-3.02-.95.04-2.1.63-2.79 1.43-.61.71-1.15 1.84-1 2.92 1.06.08 2.14-.54 2.8-1.33Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.6 1.6-1.6H17V4.5c-.3 0-.9-.1-1.9-.1-3 0-4.8 1.8-4.8 5.1v1.4H7.5V14h2.8v8h3.2Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.7 1.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.2 8.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM4.7 9.8h3V19h-3V9.8Zm4.8 0h2.9v1.3h.1c.4-.8 1.4-1.6 2.9-1.6 3 0 3.6 2 3.6 4.6V19h-3v-4.2c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3V19h-3V9.8Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm6.9 9h-3.1a15.6 15.6 0 0 0-1.3-5A8.2 8.2 0 0 1 18.9 11ZM12 4.1c-.7 0-2 2.3-2.5 6h5c-.5-3.7-1.8-6-2.5-6Zm-2.7.9A15.6 15.6 0 0 0 8 11H5.1a8.2 8.2 0 0 1 4.2-6ZM4.1 13H8c.1 2.2.5 4.3 1.3 6A8.2 8.2 0 0 1 4.1 13Zm7.9 6.9c.7 0 2-2.3 2.5-6h-5c.5 3.7 1.8 6 2.5 6Zm2.5-.9c.8-1.7 1.2-3.8 1.3-6h3.1a8.2 8.2 0 0 1-4.4 6Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8c1.6 3.1 4.1 5.5 7.2 7.2l2.4-2.4c.3-.3.8-.4 1.2-.3 1 .3 2.1.4 3.2.4.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.3 22.2 1.8 13.7 1.8 3.4c0-.7.5-1.2 1.2-1.2H7c.7 0 1.2.5 1.2 1.2 0 1.1.1 2.2.4 3.2.1.4 0 .9-.3 1.2l-1.7 2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.2a9.8 9.8 0 1 1 0 19.6 9.8 9.8 0 0 1 0-19.6Zm0 2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm1 3.8v4.5l3.4 2.1-1 1.6-4.4-2.7V8h2Z" />
    </svg>
  );
}

export default HomeFooter;
