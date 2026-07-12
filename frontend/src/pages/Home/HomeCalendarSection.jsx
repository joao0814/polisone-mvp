import CalendarAuditModal from "./CalendarAuditModal";
import CalendarEventModal from "./CalendarEventModal";
import { useHomeCalendar } from "../../hooks/useHomeCalendar";
import {
  CALENDAR_RECURRENCE_FILTERS,
  CALENDAR_STATUS_FILTERS,
  monthNames,
  monthNamesFull,
  weekDays,
  weekDaysFull,
} from "./home.constants";
import {
  formatDateKeyFromParts,
  formatEventTime,
  getDaysInMonth,
  getFirstDayOfMonth,
  getRecurrenceLabel,
  getStatusLabel,
} from "./home.utils";
import styles from "./Home.module.css";

function HomeCalendarSection({ user }) {
  const today = new Date();
  const {
    canManage,
    selectedDate,
    selectedDateKey,
    selectedDateEvents,
    calendarMonth,
    calendarYear,
    calendarMarkerMap,
    isCalendarLoading,
    calendarLoadError,
    isCalendarSubmitting,
    calendarWriteError,
    isAuditLoading,
    calendarAuditError,
    isCalendarModalOpen,
    editingCalendarEvent,
    calendarSearch,
    calendarStatusFilter,
    calendarRecurrenceFilter,
    auditEntries,
    auditEventTitle,
    isAuditModalOpen,
    setCalendarSearch,
    setCalendarStatusFilter,
    setCalendarRecurrenceFilter,
    handleSelectDay,
    handleChangeYear,
    handleChangeMonth,
    handleOpenCalendarModal,
    handleCloseCalendarModal,
    handleSaveCalendarEvent,
    handleQuickStatus,
    handleDeleteEvent,
    handleOpenAudit,
    handleCloseAudit,
  } = useHomeCalendar(user);

  return (
    <>
      <section className={styles.calendar}>
        <aside className={styles.calendarLeft}>
          <div className={styles.calendarDayDisplay}>
            <span className={styles.calendarDayNumber}>
              {String(selectedDate.getDate()).padStart(2, "0")}
            </span>
            <span className={styles.calendarDayName}>{weekDaysFull[selectedDate.getDay()]}</span>
            <span className={styles.calendarMonthLabel}>
              {monthNamesFull[selectedDate.getMonth()]} de {selectedDate.getFullYear()}
            </span>
          </div>

          <div className={styles.calendarEvents}>
            <div className={styles.calendarEventsHeader}>
              <h2>Eventos hoje</h2>
            </div>

            {calendarLoadError ? (
              <article className={styles.calendarEventCard}>
                <strong>Falha ao carregar eventos</strong>
                <span>{calendarLoadError}</span>
              </article>
            ) : null}

            {calendarWriteError ? (
              <article className={styles.calendarEventCard}>
                <strong>Falha ao salvar evento</strong>
                <span>{calendarWriteError}</span>
              </article>
            ) : null}

            {isCalendarLoading && !selectedDateEvents.length ? (
              <article className={styles.calendarEventCard}>
                <strong>Carregando eventos</strong>
                <span>Buscando compromissos da data selecionada.</span>
              </article>
            ) : null}

            {!isCalendarLoading && !calendarLoadError && selectedDateEvents.length ? (
              selectedDateEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  canManage={canManage}
                  onEdit={() => handleOpenCalendarModal(event)}
                  onDelete={() => handleDeleteEvent(event)}
                  onAudit={() => handleOpenAudit(event)}
                  onQuickStatus={handleQuickStatus}
                />
              ))
            ) : !isCalendarLoading && !calendarLoadError ? (
              <article className={styles.calendarEventCard}>
                <strong>Nenhum evento cadastrado</strong>
                <span>Selecione outro dia ou adicione um novo evento.</span>
              </article>
            ) : null}
          </div>

          {canManage ? (
            <>
              <button
                className={styles.addEvent}
                type="button"
                onClick={() => handleOpenCalendarModal()}
              >
                <span>+</span>
                Adicionar novo evento
              </button>

              <details className={styles.calendarManageTools}>
                <summary className={styles.calendarManageSummary}>Filtros e gestão</summary>
                <div className={styles.calendarFilters}>
                  <input
                    type="search"
                    value={calendarSearch}
                    onChange={(event) => setCalendarSearch(event.target.value)}
                    placeholder="Buscar evento..."
                  />
                  <select
                    value={calendarStatusFilter}
                    onChange={(event) => setCalendarStatusFilter(event.target.value)}
                  >
                    {CALENDAR_STATUS_FILTERS.map((item) => (
                      <option key={item.value || "all"} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={calendarRecurrenceFilter}
                    onChange={(event) => setCalendarRecurrenceFilter(event.target.value)}
                  >
                    {CALENDAR_RECURRENCE_FILTERS.map((item) => (
                      <option key={item.value || "all"} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </details>
            </>
          ) : null}
        </aside>

        <section className={styles.calendarRight}>
          <div className={styles.calendarTopbar}>
            <div className={styles.calendarYearControls}>
              <button type="button" onClick={() => handleChangeYear(-1)} aria-label="Ano anterior">
                &#8249;
              </button>
              <div className={styles.calendarYearDisplay}>{calendarYear}</div>
              <button type="button" onClick={() => handleChangeYear(1)} aria-label="Proximo ano">
                &#8250;
              </button>
            </div>
          </div>

          <div className={styles.calendarMonthSelector}>
            {monthNames.map((month, index) => (
              <button
                type="button"
                key={month}
                className={index === calendarMonth ? styles.monthActive : ""}
                onClick={() => handleChangeMonth(index)}
              >
                {month}
              </button>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            <div className={styles.calendarWeekHeader}>
              {weekDays.map((day) => (
                <span key={day} className={styles.calendarWeekDay}>
                  {day}
                </span>
              ))}
            </div>

            <div className={styles.calendarDays}>
              {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, index) => (
                <span key={`empty-${index}`} className={styles.calendarDayEmpty} />
              ))}

              {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, index) => {
                const day = index + 1;
                const dateKey = formatDateKeyFromParts(calendarYear, calendarMonth, day);
                const isToday =
                  day === today.getDate() &&
                  calendarMonth === today.getMonth() &&
                  calendarYear === today.getFullYear();
                const isSelected = dateKey === selectedDateKey;
                const hasEvents = calendarMarkerMap.has(dateKey);

                return (
                  <button
                    type="button"
                    key={dateKey}
                    className={`${styles.calendarDay} ${isToday ? styles.today : ""} ${
                      isSelected ? styles.selected : ""
                    } ${hasEvents ? styles.hasEvent : ""}`}
                    onClick={() => handleSelectDay(day)}
                  >
                    {String(day).padStart(2, "0")}
                    {hasEvents ? <span className={styles.eventDot} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </section>

      <CalendarEventModal
        key={`${editingCalendarEvent?.id ?? "new"}-${selectedDateKey}-${isCalendarModalOpen ? "open" : "closed"}`}
        isOpen={isCalendarModalOpen}
        onClose={handleCloseCalendarModal}
        onSave={handleSaveCalendarEvent}
        isSubmitting={isCalendarSubmitting}
        selectedDate={selectedDateKey}
        initialValues={editingCalendarEvent}
      />
      <CalendarAuditModal
        isOpen={isAuditModalOpen}
        onClose={handleCloseAudit}
        eventTitle={auditEventTitle}
        entries={auditEntries}
        loading={isAuditLoading}
        error={calendarAuditError}
      />
    </>
  );
}

function EventCard({ event, canManage, onEdit, onDelete, onAudit, onQuickStatus }) {
  const statusTone =
    event.status === "canceled"
      ? styles.statusCanceled
      : event.status === "completed"
        ? styles.statusCompleted
        : styles.statusActive;

  return (
    <article className={styles.calendarEventCard}>
      <div className={styles.calendarEventHeader}>
        <strong>{event.title}</strong>
        <span className={`${styles.calendarEventStatus} ${statusTone}`}>
          {getStatusLabel(event.status)}
        </span>
      </div>
      {event.description ? <p>{event.description}</p> : null}
      <span className={styles.calendarEventTime}>{formatEventTime(event)}</span>
      {event.category ? <small>{event.category}</small> : null}
      {event.recurrenceType && event.recurrenceType !== "none" ? (
        <small className={styles.calendarEventMeta}>
          Recorrente: {getRecurrenceLabel(event)}
        </small>
      ) : null}
      {canManage ? (
        <div className={styles.calendarEventActions}>
          <button className={styles.calendarEventEdit} type="button" onClick={onEdit}>
            Editar
          </button>
          <button className={styles.calendarEventGhost} type="button" onClick={onAudit}>
            Historico
          </button>
          {event.status !== "completed" ? (
            <button
              className={styles.calendarEventGhost}
              type="button"
              onClick={() => onQuickStatus(event, "completed")}
            >
              Concluir
            </button>
          ) : null}
          {event.status !== "canceled" ? (
            <button
              className={styles.calendarEventGhost}
              type="button"
              onClick={() => onQuickStatus(event, "canceled")}
            >
              Cancelar
            </button>
          ) : null}
          {event.status !== "active" ? (
            <button
              className={styles.calendarEventGhost}
              type="button"
              onClick={() => onQuickStatus(event, "active")}
            >
              Reativar
            </button>
          ) : null}
          <button className={styles.calendarEventDanger} type="button" onClick={onDelete}>
            Excluir
          </button>
        </div>
      ) : null}
    </article>
  );
}

export default HomeCalendarSection;
