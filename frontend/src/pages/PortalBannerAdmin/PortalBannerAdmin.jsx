import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProtectedStorageImage from "../../components/Common/ProtectedStorageImage/ProtectedStorageImage";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import { usePortalBanners } from "../../hooks/usePortalBanners";
import styles from "./PortalBannerAdmin.module.css";

const EMPTY = { id: null, title: "", linkUrl: "", imageFile: null, previewUrl: "", imagePath: "" };

export default function PortalBannerAdmin({ session, onLogout }) {
  const api = usePortalBanners();
  const [form, setForm] = useState(EMPTY);
  const [banners, setBanners] = useState([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const result = await api.list();
    setBanners(Array.isArray(result) ? result : []);
  }, [api]);

  useEffect(() => {
    let ignore = false;

    api.list()
      .then((result) => {
        if (ignore) return;
        setBanners(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (ignore) return;
        setBanners([]);
      });

    return () => {
      ignore = true;
    };
  }, [api]);

  useEffect(() => {
    return () => {
      if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    };
  }, [form.previewUrl]);

  function change(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function imageChange(event) {
    const file = event.target.files?.[0] || null;
    setForm((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return {
        ...current,
        imageFile: file,
        previewUrl: file ? URL.createObjectURL(file) : "",
      };
    });
  }

  function reset() {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setForm(EMPTY);
    setMessage("");
  }

  async function submit(event) {
    event.preventDefault();

    if (!form.title.trim() || (!form.imageFile && !form.id)) {
      setMessage("Informe o título e selecione uma imagem para o banner.");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("linkUrl", form.linkUrl);
    if (form.imageFile) payload.append("image", form.imageFile);

    if (form.id) {
      await api.update(form.id, payload);
      setMessage("Banner atualizado com sucesso.");
    } else {
      await api.create(payload);
      setMessage("Banner salvo com sucesso.");
    }

    reset();
    await load();
  }

  function edit(banner) {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setForm({
      id: banner.id,
      title: banner.title,
      linkUrl: banner.linkUrl || "",
      imageFile: null,
      previewUrl: "",
      imagePath: banner.imagePath,
    });
    setMessage("");
  }

  async function toggle(banner) {
    await api.setStatus(banner.id, !banner.isActive);
    await load();
  }

  async function remove(id) {
    if (!window.confirm("Remover este banner?")) return;
    await api.remove(id);
    if (form.id === id) reset();
    await load();
  }

  return (
    <main className={styles.shell}>
      <PortalNavbar user={session?.user} onLogout={onLogout} activeResource="banners" />

      <section className={styles.heading}>
        <div>
          <span>Administração do portal</span>
          <h1>Banner da Home</h1>
          <p>Cadastre, troque e escolha quais banners ficam ativos no carrossel da Home.</p>
        </div>
        <Link to="/">← Voltar para a Home</Link>
      </section>

      <section className={styles.layout}>
        <form className={styles.editor} onSubmit={submit}>
          <div>
            <small>Editor</small>
            <h2>{form.id ? "Editar banner" : "Novo banner"}</h2>
          </div>

          <label>
            Título *
            <input value={form.title} onChange={change("title")} placeholder="Título interno do banner" />
          </label>

          <label>
            Link de destino
            <input type="url" value={form.linkUrl} onChange={change("linkUrl")} placeholder="https://..." />
          </label>

          <label className={styles.upload}>
            Imagem do banner {!form.id ? "*" : ""}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={imageChange} />
            <span>{form.imageFile?.name || "Selecionar JPG, PNG ou WEBP"}</span>
            <small>Recomendação: 1600 × 500 px. A imagem será enviada ao storage.</small>
          </label>

          <div className={styles.preview}>
            {form.previewUrl ? (
              <img src={form.previewUrl} alt={form.title || "Preview do banner"} />
            ) : form.imagePath ? (
              <ProtectedStorageImage storagePath={form.imagePath} alt={form.title || "Preview do banner"} />
            ) : (
              <div>
                <strong>POLIS ONE</strong>
                <span>Preview do banner</span>
              </div>
            )}
          </div>

          {message ? <p className={styles.message}>{message}</p> : null}
          {api.error ? <p className={styles.message}>{api.error}</p> : null}

          <footer>
            <button type="button" onClick={reset}>
              Limpar
            </button>
            <button className={styles.primary} type="submit">
              {form.id ? "Atualizar banner" : "Adicionar banner"}
            </button>
          </footer>
        </form>

        <section className={styles.list}>
          <div>
            <small>Banners cadastrados</small>
            <h2>Banner da Home</h2>
          </div>

          {!banners.length ? (
            <div className={styles.empty}>
              <strong>Nenhum banner cadastrado</strong>
              <p>Selecione uma imagem para configurar o banner da Home.</p>
            </div>
          ) : (
            banners.map((banner) => (
              <article className={styles.card} key={banner.id}>
                <ProtectedStorageImage storagePath={banner.imagePath} alt={banner.title} />
                <div>
                  <span className={banner.isActive ? styles.active : styles.inactive}>
                    {banner.isActive ? "Ativo na Home" : "Inativo"}
                  </span>
                  <h3>{banner.title}</h3>
                  <p>{banner.linkUrl || "Sem link configurado"}</p>
                  <footer>
                    <button type="button" onClick={() => edit(banner)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => toggle(banner)}>
                      {banner.isActive ? "Desativar" : "Ativar"}
                    </button>
                    <button className={styles.danger} type="button" onClick={() => remove(banner.id)}>
                      Excluir
                    </button>
                  </footer>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
