import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import { useCommunications } from "../../hooks/useCommunications";
import { canManageCommunications } from "../../utils/communicationPermissions";
import styles from "./BlogPostDetail.module.css";

export default function BlogPostDetail({ session, onLogout }) {
  const { slug } = useParams();
  const api = useCommunications();
  const { get } = api;
  const [post, setPost] = useState(null);
  const canManage = canManageCommunications(session?.user);

  useEffect(() => {
    get(slug).then(setPost).catch(() => {});
  }, [get, slug]);

  return (
    <main className={styles.page}>
      <PortalNavbar user={session?.user} onLogout={onLogout} activeResource="comunicados" />

      {api.loading ? (
        <article className={styles.article}>Carregando...</article>
      ) : api.error ? (
        <article className={styles.article}>
          <Link className={styles.back} to="/comunicados">
            ← Voltar
          </Link>
          <h1>Comunicado indisponível</h1>
          <p>{api.error}</p>
        </article>
      ) : post ? (
        <article className={styles.article}>
          <Link className={styles.back} to="/comunicados">
            ← Voltar para comunicados
          </Link>

          {canManage ? (
            <div className={styles.adminActions}>
              <span>Gestão do comunicado</span>
              <div>
                <Link to="/comunicados/admin">Gerenciar</Link>
              </div>
            </div>
          ) : null}

          {post.coverImagePath ? (
            <ProtectedStorageImage
              storagePath={post.coverImagePath}
              alt={post.title}
              className={styles.cover}
            />
          ) : null}

          <div className={styles.intro}>
            <span>{post.category?.name}</span>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <footer>
              <time>
                {post.publishedAt
                  ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(post.publishedAt))
                  : ""}
              </time>
              <small>{post.views} leituras</small>
            </footer>
          </div>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      ) : null}
    </main>
  );
}
