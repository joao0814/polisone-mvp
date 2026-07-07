/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { FaLink, FaCamera } from "react-icons/fa";
import Modal from "../../components/Common/Modal/Modal";
import LabeledInput from "../../components/Common/LabeledInput/LabeledInput";
import ButtonOrange from "../../components/Common/ButtonOrange/ButtonOrange";
import styles from "./AddLinkModal.module.css";

export default function AddLinkModal({ isOpen, onClose, onSave, isSubmitting, initialValues }) {
  const isEdit = Boolean(initialValues);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const isSaveDisabled = isSubmitting || !name.trim() || !url.trim();

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name ?? "");
      setUrl(initialValues?.url ?? "");
      setImage(null);
      setImagePreview(initialValues?.image ?? null);
    } else {
      setName("");
      setUrl("");
      setImage(null);
      setImagePreview(null);
    }
  }, [isOpen, initialValues]);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return undefined;
    }
    const preview = URL.createObjectURL(image);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleSubmit = () => {
    if (isSaveDisabled) return;
    onSave({ name: name.trim(), url: url.trim(), image });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Links rápidos</span>
          <h2 className={styles.title}>{isEdit ? "Editar link" : "Adicionar link"}</h2>
          <p className={styles.description}>
            {isEdit
              ? "Altere o nome, a URL ou a imagem do atalho."
              : "Crie um atalho visual para destacar páginas e sistemas importantes dentro da Home."}
          </p>
        </div>

        <div className={styles.body}>
          <section className={styles.previewPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Capa do atalho</span>
              <span className={styles.panelHint}>Opcional</span>
            </div>

            <div className={styles.previewCol}>
              <button
                type="button"
                className={styles.previewCard}
                onClick={() => fileInputRef.current?.click()}
                title="Clique para escolher uma imagem"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className={styles.previewImg} />
                    <div className={styles.previewOverlay}>
                      <FaCamera className={styles.overlayIcon} />
                      <span>Trocar imagem</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyPreview}>
                    <div className={styles.emptyIconShell}>
                      <FaLink className={styles.previewIcon} />
                    </div>
                    <span className={styles.previewLabel}>{name || "Prévia do card"}</span>
                    <span className={styles.emptyCta}>Clique para enviar uma imagem</span>
                  </div>
                )}
              </button>

              <div className={styles.previewMeta}>
                <span className={styles.previewFileName}>
                  {image?.name || "Sem imagem selecionada"}
                </span>
                <span className={styles.previewHint}>Formatos aceitos: JPG, PNG e WEBP</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </section>

          <section className={styles.fieldsPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Dados do link</span>
              <span className={styles.panelHint}>Obrigatório</span>
            </div>

            <div className={styles.fieldsCol}>
              <LabeledInput
                label="Nome do link"
                placeholder="Ex: Portal RH"
                value={name}
                onChange={setName}
                maxLength={255}
              />
              <LabeledInput
                label="URL"
                placeholder="https://..."
                value={url}
                onChange={setUrl}
                maxLength={2048}
              />
            </div>

            <div className={styles.tipBox}>
              Use um nome curto e uma URL completa para o atalho ficar limpo, claro e fácil de achar.
            </div>
          </section>
        </div>

        <div className={styles.actions}>
          <span className={styles.actionsHint}>
            O link aparecerá na Home ao lado dos outros atalhos do portal.
          </span>
          <ButtonOrange
            label={isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar link"}
            onClick={handleSubmit}
            disabled={isSaveDisabled}
          />
        </div>
      </div>
    </Modal>
  );
}
