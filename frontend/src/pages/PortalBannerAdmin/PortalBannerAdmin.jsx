import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaImage,
  FaInfoCircle,
  FaArchive,
  FaTrash,
} from "react-icons/fa";
import Loading from "../../components/Common/Loading/Loading";
import { usePortalBannerAdmin } from "../../hooks/usePortalBannerAdmin";
import styles from "./PortalBannerAdmin.module.css";

const EMPTY_FORM = {
  id: null,
  title: "",
  linkUrl: "",
  imageFile: null,
  imagePreviewUrl: "",
};

export default function PortalBannerAdmin() {
  const {
    banners,
    isLoadingBanners,
    isSavingBanner,
    busyBannerId,
    bannerError,
    saveBanner,
    setBannerActiveState,
    removeBanner,
  } = usePortalBannerAdmin();
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const localPreviewRef = useRef(null);

  const activeBanner = useMemo(
    () => banners.find((item) => item.is_active) || null,
    [banners],
  );

  const resetForm = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }

    setFormState(EMPTY_FORM);
  };

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const handleEditBanner = (banner) => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }

    setFormState({
      id: banner.id,
      title: banner.title || "",
      linkUrl: banner.link_url || "",
      imageFile: null,
      imagePreviewUrl: banner.image_url || "",
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }

    if (!file) {
      setFormState((current) => ({ ...current, imageFile: null }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    localPreviewRef.current = previewUrl;

    setFormState((current) => ({
      ...current,
      imageFile: file,
      imagePreviewUrl: previewUrl,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = formState.title.trim();
    const trimmedLink = formState.linkUrl.trim();

    if (!trimmedTitle) {
      return;
    }

    if (!formState.id && !formState.imageFile) {
      return;
    }

    const saved = await saveBanner({
      id: formState.id,
      title: trimmedTitle,
      linkUrl: trimmedLink,
      imageFile: formState.imageFile,
    });

    if (saved) {
      resetForm();
    }
  };

  const submitDisabled =
    isSavingBanner ||
    !formState.title.trim() ||
    (!formState.id && !formState.imageFile);

  return (
    <section>
      <Link to="/comunicados" className={styles.backLink}>
        <FaArrowLeft />
        <span>Voltar para Recursos</span>
      </Link>

      <section className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <div>
              <span className={styles.eyebrow}>Portal 360</span>
              <h1 className={styles.title}>Banner principal</h1>
              <p className={styles.subtitle}>
                Gerencie a imagem exibida na Home do portal.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.editorPanel} onSubmit={handleSubmit}>
            <div className={styles.panelHeader}>
              <h2>{formState.id ? "Editar banner" : "Cadastrar banner"}</h2>
              <p>Titulo e imagem sao obrigatorios. O link e opcional.</p>
            </div>

            <label className={styles.field}>
              <span>Titulo</span>
              <input
                type="text"
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Campanha Portal 360"
              />
            </label>

            <label className={styles.field}>
              <span>Link</span>
              <input
                type="url"
                value={formState.linkUrl}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    linkUrl: event.target.value,
                  }))
                }
                placeholder="https://exemplo.com.br"
              />
            </label>

            <label className={styles.field}>
              <span>Imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small className={styles.fieldHint}>
                <FaInfoCircle />
                <span>Tamanho ideal: 1600 x 500 px (proporcao 16:5).</span>
              </small>
            </label>

            <div className={styles.previewBlock}>
              <div className={styles.previewHeader}>
                <strong>Preview</strong>
                {activeBanner?.id === formState.id ? (
                  <span className={styles.activePill}>
                    <FaCheckCircle />
                    <span>Banner ativo</span>
                  </span>
                ) : null}
              </div>

              <div className={styles.previewFrame}>
                {formState.imagePreviewUrl ? (
                  <img
                    src={formState.imagePreviewUrl}
                    alt={formState.title || "Preview do banner"}
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <FaImage />
                    <span>Selecione uma imagem</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={resetForm}
                disabled={isSavingBanner}
              >
                Limpar
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={submitDisabled}
              >
                {isSavingBanner
                  ? "Salvando..."
                  : formState.id
                    ? "Salvar alteracoes"
                    : "Cadastrar banner"}
              </button>
            </div>
          </form>

          <section className={styles.listPanel}>
            <div className={styles.panelHeader}>
              <h2>Banners cadastrados</h2>
              <p>Banners ativos aparecem no carrossel da Home.</p>
            </div>

            {isLoadingBanners ? (
              <div className={styles.loadingArea}>
                <Loading />
              </div>
            ) : bannerError ? (
              <div className={styles.stateCard}>
                <h3>Erro ao carregar banners</h3>
                <p>{bannerError}</p>
              </div>
            ) : banners.length === 0 ? (
              <div className={styles.stateCard}>
                <h3>Nenhum banner cadastrado</h3>
                <p>Cadastre o primeiro banner para liberar a troca na Home.</p>
              </div>
            ) : (
              <div className={styles.bannerList}>
                {banners.map((banner) => (
                  <article key={banner.id} className={styles.bannerCard}>
                    <div className={styles.bannerThumb}>
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className={styles.bannerThumbImage}
                        />
                      ) : (
                        <div className={styles.bannerThumbPlaceholder}>
                          <FaImage />
                        </div>
                      )}
                    </div>

                    <div className={styles.bannerContent}>
                      <div className={styles.bannerTopline}>
                        <div className={styles.bannerHeading}>
                          <h3>{banner.title}</h3>
                          <span
                            className={`${styles.statusPill} ${
                              banner.is_active
                                ? styles.statusActive
                                : styles.statusInactive
                            }`}
                          >
                            {banner.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div className={styles.cardActions}>
                          <button
                            type="button"
                            className={styles.iconOnlyButton}
                            onClick={() => handleEditBanner(banner)}
                            aria-label={`Editar banner ${banner.title}`}
                            title="Editar"
                          >
                            <FaEdit />
                            <span className={styles.visuallyHidden}>
                              Editar
                            </span>
                          </button>

                          <button
                            type="button"
                            className={styles.iconOnlyButton}
                            onClick={() =>
                              setBannerActiveState(banner.id, !banner.is_active)
                            }
                            disabled={busyBannerId === banner.id}
                            aria-label={
                              busyBannerId === banner.id
                                ? "Processando banner"
                                : banner.is_active
                                  ? `Desativar banner ${banner.title}`
                                  : `Ativar banner ${banner.title}`
                            }
                            title={
                              busyBannerId === banner.id
                                ? "Processando"
                                : banner.is_active
                                  ? "Desativar"
                                  : "Ativar"
                            }
                          >
                            {banner.is_active ? (
                              <FaArchive />
                            ) : (
                              <FaCheckCircle className={styles.activateIcon} />
                            )}
                            <span className={styles.visuallyHidden}>
                              {busyBannerId === banner.id
                                ? "Processando"
                                : banner.is_active
                                  ? "Desativar"
                                  : "Ativar"}
                            </span>
                          </button>

                          <button
                            type="button"
                            className={`${styles.iconOnlyButton} ${styles.deleteIconButton}`}
                            onClick={() =>
                              setDeleteTarget({
                                id: banner.id,
                                title: banner.title,
                              })
                            }
                            disabled={busyBannerId === banner.id}
                            aria-label={`Excluir banner ${banner.title}`}
                            title="Excluir"
                          >
                            <FaTrash />
                            <span className={styles.visuallyHidden}>
                              Excluir
                            </span>
                          </button>
                        </div>
                      </div>

                      <p className={styles.bannerMeta}>
                        {banner.link_url || "Sem link configurado"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={() => setDeleteTarget(null)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconArea}>
              <FaExclamationTriangle className={styles.modalWarningIcon} />
            </div>

            <h2 id="delete-modal-title" className={styles.modalTitle}>
              Excluir banner?
            </h2>
            <p className={styles.modalBody}>
              O banner <strong>&ldquo;{deleteTarget.title}&rdquo;</strong> será
              removido permanentemente e não poderá ser recuperado.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={async () => {
                  await removeBanner(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                <FaTrash />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
