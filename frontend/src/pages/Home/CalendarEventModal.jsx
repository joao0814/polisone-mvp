import { useEffect, useId, useRef, useState } from "react";
import styles from "./CalendarEventModal.module.css";

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "completed", label: "Concluído" },
  { value: "canceled", label: "Cancelado" },
];
const RECURRENCE_OPTIONS = [
  { value: "none", label: "Nao repetir" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
  { value: "yearly", label: "Anualmente" },
];
const WEEK_DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
];

function normalizeTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function createInitialForm(initialValues, selectedDate) {
  return {
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    event_date: initialValues?.event_date ?? selectedDate ?? "",
    all_day: initialValues?.all_day ?? true,
    start_time: normalizeTime(initialValues?.start_time) || "09:00",
    end_time: normalizeTime(initialValues?.end_time) || "10:00",
    category: initialValues?.category ?? "",
    status: initialValues?.status ?? "active",
    recurrence_type: initialValues?.recurrence_type ?? "none",
    recurrence_interval: initialValues?.recurrence_interval ?? 1,
    recurrence_until: initialValues?.recurrence_until ?? "",
    recurrence_days: Array.isArray(initialValues?.recurrence_days)
      ? initialValues.recurrence_days
      : [],
  };
}

export default function CalendarEventModal({
  isOpen,
  onClose,
  onSave,
  isSubmitting = false,
  selectedDate,
  initialValues,
}) {
  const titleId = useId();
  const titleInputRef = useRef(null);
  const isEdit = Boolean(initialValues?.id);
  const [form, setForm] = useState(() => createInitialForm(initialValues, selectedDate));

  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTimedInvalid =
    !form.all_day &&
    (!form.start_time || !form.end_time || form.end_time <= form.start_time);
  const isRecurrenceInvalid =
    form.recurrence_type !== "none" &&
    form.recurrence_until &&
    form.recurrence_until < form.event_date;

  const isSaveDisabled =
    isSubmitting ||
    !form.title.trim() ||
    !form.event_date ||
    isTimedInvalid ||
    isRecurrenceInvalid;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleRecurrenceDay(day) {
    setForm((current) => ({
      ...current,
      recurrence_days: current.recurrence_days.includes(day)
        ? current.recurrence_days.filter((item) => item !== day)
        : [...current.recurrence_days, day].sort((a, b) => a - b),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSaveDisabled) return;

    onSave({
      ...initialValues,
      title: form.title.trim(),
      description: form.description.trim(),
      event_date: form.event_date,
      all_day: form.all_day,
      start_time: form.all_day ? null : form.start_time,
      end_time: form.all_day ? null : form.end_time,
      category: form.category.trim(),
      status: form.status,
      recurrence_type: form.recurrence_type,
      recurrence_interval: Number(form.recurrence_interval) || 1,
      recurrence_until: form.recurrence_type === "none" ? null : form.recurrence_until || null,
      recurrence_days:
        form.recurrence_type === "weekly" ? form.recurrence_days : [],
    });
  }

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Calendario</span>
          <h2 className={styles.title} id={titleId}>
            {isEdit ? "Editar evento" : "Adicionar novo evento"}
          </h2>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Nome do evento</span>
              <input
                ref={titleInputRef}
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Ex: Reunião com equipe"
                maxLength={120}
              />
            </label>

            <label className={styles.field}>
              <span>Categoria</span>
              <input
                type="text"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="Ex: Campanha"
                maxLength={60}
              />
            </label>

            <label className={styles.field}>
              <span>Data</span>
              <input
                type="date"
                value={form.event_date}
                onChange={(event) => updateField("event_date", event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Recorrencia</span>
              <select
                value={form.recurrence_type}
                onChange={(event) => updateField("recurrence_type", event.target.value)}
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Intervalo</span>
              <input
                type="number"
                min="1"
                value={form.recurrence_interval}
                onChange={(event) => updateField("recurrence_interval", event.target.value)}
                disabled={form.recurrence_type === "none"}
              />
            </label>

            <label className={styles.field}>
              <span>Repetir ate</span>
              <input
                type="date"
                value={form.recurrence_until}
                onChange={(event) => updateField("recurrence_until", event.target.value)}
                disabled={form.recurrence_type === "none"}
              />
            </label>
          </div>

          {form.recurrence_type === "weekly" ? (
            <div className={styles.weekDaysGroup}>
              <span>Dias da semana</span>
              <div className={styles.weekDays}>
                {WEEK_DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`${styles.weekDayButton} ${
                      form.recurrence_days.includes(day.value) ? styles.weekDayActive : ""
                    }`}
                    onClick={() => toggleRecurrenceDay(day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className={styles.descriptionField}>
            <span>Descricao</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Adicione os detalhes importantes do evento"
              rows={4}
              maxLength={400}
            />
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.all_day}
              onChange={(event) => updateField("all_day", event.target.checked)}
            />
            <span>Evento de dia inteiro</span>
          </label>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Horario inicial</span>
              <input
                type="time"
                value={form.start_time}
                onChange={(event) => updateField("start_time", event.target.value)}
                disabled={form.all_day}
              />
            </label>

            <label className={styles.field}>
              <span>Horario final</span>
              <input
                type="time"
                value={form.end_time}
                onChange={(event) => updateField("end_time", event.target.value)}
                disabled={form.all_day}
              />
            </label>
          </div>

          {isTimedInvalid ? (
            <p className={styles.validationMessage}>
              O horario final precisa ser maior que o horario inicial.
            </p>
          ) : null}

          {isRecurrenceInvalid ? (
            <p className={styles.validationMessage}>
              A data final da recorrencia precisa ser igual ou maior que a data do evento.
            </p>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.secondaryButton} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.primaryButton} type="submit" disabled={isSaveDisabled}>
              {isSubmitting ? "Salvando..." : isEdit ? "Salvar alteracoes" : "Salvar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
