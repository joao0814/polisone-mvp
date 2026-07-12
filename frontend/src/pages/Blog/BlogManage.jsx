import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import { useCommunications } from "../../hooks/useCommunications";
import styles from "./BlogManage.module.css";

const STATUS = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };

export default function BlogManage({ session, onLogout }) {
  const api = useCommunications();
  const { listAdmin } = api;
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const load = useCallback(
    () =>
      listAdmin({ search, status, limit: 100 })
        .then((result) => setPosts(result.data))
        .catch(() => setPosts([])),
    [listAdmin, search, status],
  );

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    return () => {
      if (form?.previewUrl) URL.revokeObjectURL(form.previewUrl);
    };
  }, [form]);

  function edit(post) {
    if (form?.previewUrl) URL.revokeObjectURL(form.previewUrl);

    setEditing(post.id);
    setForm({
      title: post.title,
      description: post.description,
      content: post.content,
      categoryId: post.category?.id ?? "",
      tags: post.tags?.map((tag) => tag.name).join(", ") || "",
      coverFile: null,
      previewUrl: "",
      coverImagePath: post.coverImagePath || "",
    });
  }

  function cancelEdit() {
    if (form?.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setEditing(null);
    setForm(null);
  }

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function changeCover(event) {
    const file = event.target.files?.[0] || null;

    setForm((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);

      return {
        ...current,
        coverFile: file,
        previewUrl: file ? URL.createObjectURL(file) : "",
      };
    });
  }

  async function save() {
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("content", form.content);
    if (form.categoryId) payload.append("categoryId", form.categoryId);
    payload.append(
      "tags",
      JSON.stringify(form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)),
    );
    if (form.coverFile) payload.append("cover_image", form.coverFile);

    await api.update(editing, payload);
    cancelEdit();
    await load();
  }

  async function action(callback, id) {
    await callback(id);
    await load();
  }

  async function remove(post) {
    if (!window.confirm(`Excluir o comunicado “${post.title}”?`)) return;
    await action(api.remove, post.id);
  }

  return (
    <main className={styles.page}>
      <PortalNavbar user={session?.user} onLogout={onLogout} activeResource="comunicados" />

      <section className={styles.heading}>
        <div>
          <span>Administração</span>
          <h1>Gerenciar comunicados</h1>
          <p>Edite conteúdos, altere o status de publicação ou remova comunicados.</p>
        </div>
        <Link to="/comunicados/novo">+ Novo comunicado</Link>
      </section>

      <section className={styles.filters}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar comunicado..."
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos os status</option>
          <option value="draft">Rascunhos</option>
          <option value="published">Publicados</option>
          <option value="archived">Arquivados</option>
        </select>
      </section>

      {api.error ? <p className={styles.error}>{api.error}</p> : null}

      <section className={styles.list}>
        {api.loading && !posts.length ? <p>Carregando...</p> : null}

        {posts.map((post) => (
          <article className={styles.card} key={post.id}>
            {editing === post.id ? (
              <div className={styles.editForm}>
                <label>
                  Título
                  <input value={form.title} onChange={update("title")} />
                </label>

                <label>
                  Resumo
                  <textarea rows="3" value={form.description} onChange={update("description")} />
                </label>

                <label>
                  Conteúdo
                  <textarea rows="8" value={form.content} onChange={update("content")} />
                </label>

                <label>
                  Tags
                  <input value={form.tags} onChange={update("tags")} />
                </label>

                <div className={styles.imageEditor}>
                  <strong>Imagem de capa</strong>

                  <div className={styles.imagePreview}>
                    {form.previewUrl ? (
                      <img src={form.previewUrl} alt="Prévia da nova capa" />
                    ) : form.coverImagePath ? (
                      <ProtectedStorageImage
                        storagePath={form.coverImagePath}
                        alt="Capa atual do comunicado"
                        className={styles.coverImage}
                      />
                    ) : (
                      <div className={styles.imageFallback}>Sem imagem</div>
                    )}
                  </div>

                  <label className={styles.uploadField}>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={changeCover} />
                    <span>{form.coverFile ? "Trocar imagem selecionada" : "Selecionar nova imagem"}</span>
                  </label>
                </div>

                <div className={styles.actions}>
                  <button type="button" onClick={cancelEdit}>
                    Cancelar
                  </button>
                  <button type="button" className={styles.primary} disabled={api.loading} onClick={save}>
                    Salvar alterações
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.cardTop}>
                  <span className={`${styles.status} ${styles[post.status]}`}>{STATUS[post.status]}</span>
                  <small>{post.category?.name}</small>
                </div>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <footer>
                  <button type="button" onClick={() => edit(post)}>
                    Editar
                  </button>
                  {post.status === "draft" ? (
                    <button type="button" onClick={() => action(api.publish, post.id)}>
                      Publicar
                    </button>
                  ) : null}
                  {post.status === "published" ? (
                    <button type="button" onClick={() => action(api.archive, post.id)}>
                      Arquivar
                    </button>
                  ) : null}
                  {post.status === "archived" ? (
                    <button type="button" onClick={() => action(api.restore, post.id)}>
                      Reativar como rascunho
                    </button>
                  ) : null}
                  <button type="button" className={styles.danger} onClick={() => remove(post)}>
                    Excluir
                  </button>
                </footer>
              </>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
