import { useNavigate } from "react-router-dom";
import bannerImage from "../../assets/images/home/banner.png";
import { systems } from "./home.constants";
import styles from "./Home.module.css";

function HomeHeroSection() {
  const navigate = useNavigate();

  return (
    <section className={styles.heroSection}>
      <aside className={styles.systems}>
        <h2>Sistemas</h2>
        <div className={styles.systemCards}>
          {systems.map((system) => (
            <button
              className={styles.systemCard}
              type="button"
              key={system.label}
              aria-label={system.label}
              onClick={() => {
                if (system.path) navigate(system.path);
              }}
            >
              <img src={system.image} alt="" aria-hidden="true" />
            </button>
          ))}
        </div>
      </aside>

      <section
        className={styles.banner}
        aria-label="Seja bem-vindo ao Portal do Candidato Alan Leal"
      >
        <img src={bannerImage} alt="" aria-hidden="true" />
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
  );
}

export default HomeHeroSection;
