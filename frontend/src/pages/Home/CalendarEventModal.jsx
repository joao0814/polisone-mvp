/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import Modal from "../../components/Common/Modal/Modal";
import LabeledInput from "../../components/Common/LabeledInput/LabeledInput";
import ButtonOrange from "../../components/Common/ButtonOrange/ButtonOrange";
import styles from "./CalendarEventModal.module.css";

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Não repetir" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensalmente" },
  { value: "yearly", label: "Anualmente" },
];

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
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

export default function CalendarEventModal({
  isOpen,
  onClose,
  onSave,
  isSubmitting,
  selectedDate,
  initialValues,
}) {
  const isEdit = Boolean(initialValues?.id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(selectedDate || "");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("ativo");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceUntil, setRecurrenceUntil] = useState("");
  const [recurrenceDays, setRecurrenceDays] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setEventDate(initialValues?.event_date ?? selectedDate ?? "");
    setAllDay(initialValues?.all_day ?? true);
    setStartTime(normalizeTime(initialValues?.start_time) || "09:00");
    setEndTime(normalizeTime(initialValues?.end_time) || "10:00");
    setCategory(initialValues?.category ?? "");
    setStatus(initialValues?.status ?? "ativo");
    setRecurrenceType(initialValues?.recurrence_type ?? "none");
    setRecurrenceInterval(initialValues?.recurrence_interval ?? 1);
    setRecurrenceUntil(initialValues?.recurrence_until ?? "");
    setRecurrenceDays(
      Array.isArray(initialValues?.recurrence_days)
        ? initialValues.recurrence_days
        : [],
    );
  }, [isOpen, initialValues, selectedDate]);

  const isTimedInvalid = useMemo(() => {
    if (allDay) return false;
    if (!startTime || !endTime) return true;
    return endTime <= startTime;
  }, [allDay, startTime, endTime]);

  const isRecurrenceInvalid =
    recurrenceType !== "none" && !recurrenceUntil;

  const isSaveDisabled =
    isSubmitting ||
    !title.trim() ||
    !eventDate ||
    isTimedInvalid ||
    isRecurrenceInvalid;

  function toggleRecurrenceDay(day) {
    setRecurrenceDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b),
    );
  }

  function handleSubmit() {
    if (isSaveDisabled) return;

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      all_day: allDay,
      start_time: allDay ? null : startTime,
      end_time: allDay ? null : endTime,
      category: category.trim() || null,
      status,
      recurrence_type: recurrenceType,
      recurrence_interval: Number(recurrenceInterval) || 1,
      recurrence_until:
        recurrenceType === "none" ? null : recurrenceUntil || null,
      recurrence_days:
        recurrenceType === "weekly" && recurrenceDays.length
          ? recurrenceDays
          : null,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Calendário</span>
          <h2 className={styles.title}>
            {isEdit ? "Editar evento" : "Adicionar evento"}
          </h2>
        </div>

        <div className={styles.body}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <FaCalendarAlt className={styles.panelIcon} />
              <span className={styles.panelTitle}>Dados principais</span>
            </div>

            <div className={styles.fieldsGrid}>
              <LabeledInput
                id="calendar-title"
                label="Título"
                placeholder="Ex: Treinamento comercial"
                value={title}
                onChange={setTitle}
                maxLength={255}
              />
              <LabeledInput
                id="calendar-category"
                label="Categoria"
                placeholder="Ex: treinamento"
                value={category}
                onChange={setCategory}
                maxLength={80}
              />
              <LabeledInput
                id="calendar-date"
                label="Data"
                type="date"
                value={eventDate}
                onChange={setEventDate}
              />

              <label className={styles.fieldGroup} htmlFor="calendar-status">
                <span>Status</span>
                <select
                  id="calendar-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className={styles.select}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.textareaGroup} htmlFor="calendar-description">
              <span>Descrição</span>
              <textarea
                id="calendar-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Detalhes do evento"
                maxLength={2000}
                rows={4}
              />
            </label>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <FaClock className={styles.panelIcon} />
              <span className={styles.panelTitle}>Horário e repetição</span>
            </div>

            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(event) => setAllDay(event.target.checked)}
              />
              <span>Evento de dia inteiro</span>
            </label>

            <div className={styles.fieldsGrid}>
              <LabeledInput
                id="calendar-start-time"
                label="Início"
                type="time"
                value={startTime}
                onChange={setStartTime}
                disabled={allDay}
              />
              <LabeledInput
                id="calendar-end-time"
                label="Fim"
                type="time"
                value={endTime}
                onChange={setEndTime}
                disabled={allDay}
              />
              <label className={styles.fieldGroup} htmlFor="calendar-recurrence">
                <span>Repetição</span>
                <select
                  id="calendar-recurrence"
                  value={recurrenceType}
                  onChange={(event) => setRecurrenceType(event.target.value)}
                  className={styles.select}
                >
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <LabeledInput
                id="calendar-recurrence-interval"
                label="Intervalo"
                type="number"
                min={1}
                value={recurrenceInterval}
                onChange={setRecurrenceInterval}
                disabled={recurrenceType === "none"}
              />
              <LabeledInput
                id="calendar-recurrence-until"
                label="Repetir até"
                type="date"
                value={recurrenceUntil}
                onChange={setRecurrenceUntil}
                disabled={recurrenceType === "none"}
              />
            </div>

            {recurrenceType === "weekly" && (
              <div className={styles.weekDaysGroup}>
                <span>Dias da semana</span>
                <div className={styles.weekDays}>
                  {WEEK_DAYS.map((day) => (
                    <button
                      type="button"
                      key={day.value}
                      className={`${styles.weekDayButton} ${
                        recurrenceDays.includes(day.value) ? styles.active : ""
                      }`}
                      onClick={() => toggleRecurrenceDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTimedInvalid && (
              <p className={styles.validationMessage}>
                O horário final precisa ser maior que o horário inicial.
              </p>
            )}
            {isRecurrenceInvalid && (
              <p className={styles.validationMessage}>
                Informe a data limite para eventos recorrentes.
              </p>
            )}
          </section>
        </div>

        <div className={styles.actions}>
          <span className={styles.actionsHint}>
            O evento será exibido no calendário do Portal IXER.
          </span>
          <ButtonOrange
            label={
              isSubmitting
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Salvar evento"
            }
            onClick={handleSubmit}
            disabled={isSaveDisabled}
          />
        </div>
      </div>
    </Modal>
  );
}
