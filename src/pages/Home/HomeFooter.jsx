import styles from "./Home.module.css";

function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <section>
        <h2>POLIS I.A - Plataforma de gestão de campanha e mandato</h2>
        <p>
          CNPJ: 39.453.451/0001-22
          <br />
          Rua Tabapua, 594, Edificio Itaim, 3o andar,
          <br />
          Itaim Bibi - São Paulo/SP.
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

export default HomeFooter;
