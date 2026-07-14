import { useMemo } from "react";
import styles from "./CalendarAuditModal.module.css";

const ACTION_LABELS = {
  created: "Criado",
  updated: "Atualizado",
  deleted: "Excluido",
};

export default function CalendarAuditModal({
  isOpen,
  onClose,
  eventTitle,
  entries,
  loading = false,
  error = "",
}) {
  const sortedEntries = useMemo(
    () =>
      Array.isArray(entries)
        ? [...entries].sort(
            (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
          )
        : [],
    [entries],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-audit-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Historico</span>
            <h2 className={styles.title} id="calendar-audit-title">
              {eventTitle || "Auditoria do evento"}
            </h2>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Fechar historico"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {loading ? <p className={styles.statusMessage}>Carregando historico...</p> : null}
          {!loading && error ? <p className={styles.statusMessage}>{error}</p> : null}
          {!loading && !error && !sortedEntries.length ? (
            <p className={styles.statusMessage}>Nenhuma alteracao registrada para este evento.</p>
          ) : null}

          {!loading && !error && sortedEntries.length ? (
            <div className={styles.timeline}>
              {sortedEntries.map((entry) => (
                <article key={entry.id} className={styles.item}>
                  <header className={styles.itemHeader}>
                    <strong>{ACTION_LABELS[entry.action] || entry.action}</strong>
                    <time>
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(entry.createdAt))}
                    </time>
                  </header>
                  <small>Responsavel: {entry.actorId}</small>
                  {entry.changes ? (
                    <pre className={styles.changes}>
                      {JSON.stringify(entry.changes, null, 2)}
                    </pre>
                  ) : (
                    <p className={styles.deletedMessage}>Sem payload detalhado nesta acao.</p>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
