import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./AddLinkModal.module.css";

const EMPTY_FORM = { name: "", url: "" };

export default function AddLinkModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [cover, setCover] = useState(null);
  const coverPreview = useMemo(
    () => (cover ? URL.createObjectURL(cover) : ""),
    [cover],
  );
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    nameInputRef.current?.focus();
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  if (!isOpen) return null;

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  function handleClose() {
    setForm(EMPTY_FORM);
    setCover(null);
    onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    onSave({ name: form.name.trim(), url: form.url.trim(), cover });
    handleClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={handleClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 id={titleId}>Adicionar novo link</h2>
          <label className={styles.field}>
            <span>Nome</span>
            <input
              ref={nameInputRef}
              value={form.name}
              onChange={updateField("name")}
              maxLength={60}
              required
            />
          </label>
          <label className={styles.field}>
            <span>URL</span>
            <input
              type="url"
              value={form.url}
              onChange={updateField("url")}
              placeholder="https://"
              maxLength={2048}
              required
            />
          </label>
          <div className={styles.coverField}>
            <span>Capa do link</span>
            <button
              className={styles.upload}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Prévia da capa selecionada" />
              ) : (
                <>
                  <svg viewBox="0 0 32 36" aria-hidden="true">
                    <path d="M4 1h16l8 8v26H4z" fill="currentColor" />
                    <path d="M20 1v9h8" fill="#aaa" />
                    <path d="M10 22l6-6 6 6h-4v7h-4v-7z" fill="#ddd" />
                  </svg>
                  <span>
                    Clique aqui para
                    <br />
                    fazer upload de uma capa
                    <br />
                    <small>150x150</small>
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setCover(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className={styles.actions}>
            <button className={styles.saveButton} type="submit">
              Salvar
            </button>
            <button
              className={styles.editButton}
              type="button"
              onClick={handleClose}
            >
              Editar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
