import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PortalNavbar from "../../components/Common/PortalNavbar/PortalNavbar";
import styles from "./BlogCreate.module.css";
import { useCommunications } from "../../hooks/useCommunications";

const INITIAL_FORM = { title: "", description: "", categoryId: "", author: "", content: "", tags: "" };

export default function BlogCreate({ session, onLogout }) {
  const navigate = useNavigate();
  const submitLock = useRef(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [cover, setCover] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mode, setMode] = useState("edit");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const api = useCommunications();
  const { categories: loadCategories } = api;
  const tags = useMemo(() => form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), [form.tags]);
  useEffect(() => { loadCategories().then(setCategories).catch(() => {}); }, [loadCategories]);

  function handleCoverChange(event) {
    const file = event.target.files?.[0] || null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCover(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function validate() {
    if (!form.title.trim() || !form.description.trim() || !form.categoryId || !form.content.trim()) {
      setError("Preencha título, resumo, categoria e conteúdo.");
      return false;
    }
    setError("");
    return true;
  }

  async function submit(status) {
    if (submitLock.current || !validate()) return;
    submitLock.current = true;
    setIsSubmitting(true);
    try {
      const created = await api.create({ title: form.title, description: form.description, content: form.content, categoryId: form.categoryId, tags });
      if (status === "published") await api.publish(created.id);
      setSavedMessage(status === "published" ? "Comunicado publicado com sucesso." : "Rascunho salvo com sucesso.");
      if (status === "published") navigate("/comunicados", { replace: true });
      else setForm(INITIAL_FORM);
    } catch { setError(api.error || "Não foi possível salvar o comunicado."); }
    finally { submitLock.current = false; setIsSubmitting(false); }
  }

  return <main className={styles.page}>
    <PortalNavbar user={session?.user} onLogout={onLogout} activeResource="comunicados" />
    <section className={styles.top}><div><Link to="/comunicados">← Voltar para comunicados</Link><span>Gestão de conteúdo</span><h1>Novo comunicado</h1><p>Crie a publicação, confira como ela ficará no portal e deixe tudo pronto para publicar.</p></div><div className={styles.mode}><button className={mode === "edit" ? styles.selected : ""} type="button" onClick={() => setMode("edit")}>Editar</button><button className={mode === "preview" ? styles.selected : ""} type="button" onClick={() => setMode("preview")}>Visualizar</button></div></section>

    {mode === "edit" ? <div className={styles.workspace}>
      <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.sectionHeading}><span>01</span><div><h2>Informações principais</h2><p>Dados que identificam o comunicado nas listagens.</p></div></div>
        <label className={styles.wide}><span>Título *</span><input value={form.title} onChange={update("title")} maxLength={120} placeholder="Digite um título claro e objetivo" /><small>{form.title.length}/120</small></label>
        <label className={styles.wide}><span>Resumo *</span><textarea value={form.description} onChange={update("description")} rows="3" maxLength={240} placeholder="Apresente em poucas linhas o assunto da publicação" /><small>{form.description.length}/240</small></label>
        <div className={styles.columns}><label><span>Categoria *</span><select value={form.categoryId} onChange={update("categoryId")}><option value="">Selecione</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label><span>Autor exibido</span><input value={form.author} onChange={update("author")} placeholder={session?.user?.name || "Equipe PolisOne"} /></label></div>
        <label className={styles.wide}><span>Tags</span><input value={form.tags} onChange={update("tags")} placeholder="campanha, equipe, aviso" /><small>Separe as tags por vírgulas.</small></label>
        <div className={styles.sectionHeading}><span>02</span><div><h2>Conteúdo</h2><p>Escreva a mensagem que será apresentada ao leitor.</p></div></div>
        <label className={styles.wide}><span>Texto do comunicado *</span><textarea className={styles.editor} value={form.content} onChange={update("content")} rows="13" placeholder="Escreva o conteúdo completo do comunicado..." /></label>
      </form>
      <aside className={styles.side}>
        <div className={styles.upload}><div className={styles.sideTitle}><span>03</span><div><h2>Imagem de capa</h2><p>JPG, PNG ou WEBP de até 5 MB.</p></div></div>{previewUrl ? <img src={previewUrl} alt="Prévia da capa" /> : <div className={styles.placeholder}><strong>+</strong><span>Adicione uma imagem</span></div>}<label><input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverChange} /><span>{cover ? "Trocar imagem" : "Selecionar imagem"}</span></label>{cover && <small>{cover.name}</small>}</div>
        <div className={styles.actions}><p>Você pode salvar para continuar depois ou conferir o resultado antes de publicar.</p>{error && <strong className={styles.error}>{error}</strong>}{savedMessage && <strong className={styles.success}>{savedMessage}</strong>}<button type="button" className={styles.draft} disabled={isSubmitting} onClick={() => submit("draft")}>{isSubmitting ? "Salvando..." : "Salvar rascunho"}</button><button type="button" className={styles.publish} disabled={isSubmitting} onClick={() => submit("published")}>{isSubmitting ? "Publicando..." : "Publicar →"}</button></div>
      </aside>
    </div> : <section className={styles.preview}><div className={styles.previewBar}><span>Pré-visualização do comunicado</span><button type="button" onClick={() => setMode("edit")}>Voltar à edição</button></div>{previewUrl ? <img src={previewUrl} alt="" /> : <div className={styles.previewCover}>POLIS ONE</div>}<article><span className={styles.category}>{form.category || "Categoria"}</span><h1>{form.title || "Título do comunicado"}</h1><p className={styles.lead}>{form.description || "O resumo do comunicado aparecerá neste espaço."}</p><footer><strong>{form.author || session?.user?.name || "Equipe PolisOne"}</strong><time>{new Intl.DateTimeFormat("pt-BR").format(new Date())}</time></footer><div className={styles.body}>{form.content || "O conteúdo completo do comunicado aparecerá aqui."}</div>{tags.length > 0 && <div className={styles.tags}>{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</article><div className={styles.previewActions}><button type="button" onClick={() => setMode("edit")}>Continuar editando</button><button type="button" onClick={() => submit("published")}>Confirmar publicação</button></div></section>}
  </main>;
}
