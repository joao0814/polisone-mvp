import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import { useCommunications } from "../../hooks/useCommunications";
import styles from "./Home.module.css";

function HomeCommunicationsSection() {
  const { list, loading, error } = useCommunications();
  const [comunicados, setComunicados] = useState([]);

  useEffect(() => {
    list({ limit: 3 }).then((result) => setComunicados(result.data)).catch(() => setComunicados([]));
  }, [list]);

  return (
    <section className={styles.comunicados} id="calendarios">
      <div className={styles.comunicadosHeading}>
        <h2>Comunicados</h2>
        <Link to="/comunicados">Ver todos →</Link>
      </div>

      <div className={styles.comunicadoGrid}>
        {loading && !comunicados.length ? <p>Carregando comunicados...</p> : null}
        {!loading && error ? <p>Não foi possível carregar os comunicados.</p> : null}
        {!loading && !error && !comunicados.length ? <p>Nenhum comunicado publicado.</p> : null}
        {comunicados.map((comunicado) => (
          <Link to={`/comunicados/${comunicado.slug}`} className={styles.comunicadoCard} key={comunicado.id}>
            <div className={styles.comunicadoImage}>
              <ProtectedStorageImage
                storagePath={comunicado.coverImagePath}
                alt={comunicado.title}
                fallback={<span>POLIS ONE</span>}
              />
            </div>
            <div className={styles.comunicadoBody}>
              <h3>{comunicado.title}</h3>
              <span>{comunicado.category?.name || "Comunicado"}</span>
              <p>{comunicado.description}</p>
              <footer>
                <span>{comunicado.views} leituras</span>
                <time>
                  {comunicado.publishedAt
                    ? new Intl.DateTimeFormat("pt-BR").format(new Date(comunicado.publishedAt))
                    : ""}
                </time>
              </footer>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomeCommunicationsSection;
