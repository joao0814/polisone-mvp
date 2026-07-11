import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import { useCommunications } from "../../hooks/useCommunications";
import styles from "./BlogPostDetail.module.css";
export default function BlogPostDetail({ session, onLogout }) {
  const { slug } = useParams(); const api = useCommunications(); const { get } = api; const [post, setPost] = useState(null);
  useEffect(() => { get(slug).then(setPost).catch(() => {}); }, [get, slug]);
  return <main className={styles.page}><PortalNavbar user={session?.user} onLogout={onLogout} activeResource="comunicados" />{api.loading ? <article className={styles.article}>Carregando...</article> : api.error ? <article className={styles.article}><Link className={styles.back} to="/comunicados">← Voltar</Link><h1>Comunicado indisponível</h1><p>{api.error}</p></article> : post && <article className={styles.article}><Link className={styles.back} to="/comunicados">← Voltar para comunicados</Link><div className={styles.intro}><span>{post.category?.name}</span><h1>{post.title}</h1><p>{post.description}</p><footer><time>{post.publishedAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle:"long" }).format(new Date(post.publishedAt)) : ""}</time><small>{post.views} leituras</small></footer></div><div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} /></article>}</main>;
}
