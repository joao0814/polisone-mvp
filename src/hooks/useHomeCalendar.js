import { useCallback, useEffect, useMemo, useState } from "react";
import { useCalendarEvents } from "./useCalendarEvents";
import { canManageCalendar } from "../utils/calendarPermissions";
import { formatDateKey, formatDateKeyFromParts, getDaysInMonth } from "../pages/Home/home.utils";

export function useHomeCalendar(user) {
  const today = useMemo(() => new Date(), []);
  const calendarReader = useCalendarEvents();
  const calendarWriter = useCalendarEvents();
  const calendarAudit = useCalendarEvents();
  const {
    list: listCalendarEvents,
    listMonthMarkers,
    loading: isCalendarLoading,
    error: calendarLoadError,
  } = calendarReader;
  const {
    create: createCalendarEvent,
    update: updateCalendarEvent,
    remove: removeCalendarEvent,
    loading: isCalendarSubmitting,
    error: calendarWriteError,
  } = calendarWriter;
  const {
    audit: getCalendarEventAudit,
    loading: isAuditLoading,
    error: calendarAuditError,
  } = calendarAudit;
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [monthMarkers, setMonthMarkers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingCalendarEvent, setEditingCalendarEvent] = useState(null);
  const [calendarSearch, setCalendarSearch] = useState("");
  const [calendarStatusFilter, setCalendarStatusFilter] = useState("");
  const [calendarRecurrenceFilter, setCalendarRecurrenceFilter] = useState("");
  const [auditEntries, setAuditEntries] = useState([]);
  const [auditEventTitle, setAuditEventTitle] = useState("");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const canManage = canManageCalendar(user);

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateEvents = useMemo(
    () => calendarEvents.filter((event) => event.eventDate === selectedDateKey),
    [calendarEvents, selectedDateKey],
  );
  const calendarMarkerMap = useMemo(() => new Set(monthMarkers), [monthMarkers]);

  const fetchCalendarMonthData = useCallback(async (targetYear, targetMonth) => {
    const from = formatDateKeyFromParts(targetYear, targetMonth, 1);
    const to = formatDateKeyFromParts(
      targetYear,
      targetMonth,
      getDaysInMonth(targetMonth, targetYear),
    );
    return Promise.all([
      listCalendarEvents({
        from,
        to,
        limit: 100,
        search: calendarSearch || undefined,
        status: calendarStatusFilter || undefined,
        recurrenceType: calendarRecurrenceFilter || undefined,
      }),
      listMonthMarkers({
        year: targetYear,
        month: targetMonth + 1,
      }),
    ]);
  }, [
    calendarRecurrenceFilter,
    calendarSearch,
    calendarStatusFilter,
    listCalendarEvents,
    listMonthMarkers,
  ]);

  const refreshCalendarMonth = useCallback(async (targetYear = calendarYear, targetMonth = calendarMonth) => {
    const [eventsResponse, markersResponse] = await fetchCalendarMonthData(targetYear, targetMonth);
    setCalendarEvents(eventsResponse?.data ?? []);
    setMonthMarkers(markersResponse?.days ?? []);
  }, [calendarMonth, calendarYear, fetchCalendarMonthData]);

  useEffect(() => {
    let ignore = false;

    fetchCalendarMonthData(calendarYear, calendarMonth)
      .then(([eventsResponse, markersResponse]) => {
        if (ignore) return;
        setCalendarEvents(eventsResponse?.data ?? []);
        setMonthMarkers(markersResponse?.days ?? []);
      })
      .catch(() => {
        if (ignore) return;
        setCalendarEvents([]);
        setMonthMarkers([]);
      });

    return () => {
      ignore = true;
    };
  }, [calendarMonth, calendarYear, fetchCalendarMonthData]);

  function handleSelectDay(day) {
    setSelectedDate(new Date(calendarYear, calendarMonth, day));
  }

  function handleChangeYear(direction) {
    setCalendarYear((currentYear) => {
      const nextYear = currentYear + direction;
      const daysInNextMonth = getDaysInMonth(calendarMonth, nextYear);
      const nextDay = Math.min(selectedDate.getDate(), daysInNextMonth);

      setSelectedDate(new Date(nextYear, calendarMonth, nextDay));
      return nextYear;
    });
  }

  function handleChangeMonth(monthIndex) {
    setCalendarMonth(monthIndex);
    const daysInNextMonth = getDaysInMonth(monthIndex, calendarYear);
    const nextDay = Math.min(selectedDate.getDate(), daysInNextMonth);
    setSelectedDate(new Date(calendarYear, monthIndex, nextDay));
  }

  function handleOpenCalendarModal(event = null) {
    setEditingCalendarEvent(
      event
        ? {
            id: event.id,
            title: event.title,
            description: event.description ?? "",
            event_date: event.eventDate,
            all_day: event.allDay,
            start_time: event.startTime,
            end_time: event.endTime,
            category: event.category ?? "",
            status: event.status,
            recurrence_type: event.recurrenceType ?? "none",
            recurrence_interval: event.recurrenceInterval ?? 1,
            recurrence_until: event.recurrenceUntil ?? "",
            recurrence_days: event.recurrenceDays ?? [],
          }
        : null,
    );
    setIsCalendarModalOpen(true);
  }

  function handleCloseCalendarModal() {
    setEditingCalendarEvent(null);
    setIsCalendarModalOpen(false);
  }

  async function handleSaveCalendarEvent(eventData) {
    const payload = {
      title: eventData.title,
      description: eventData.description || null,
      eventDate: eventData.event_date,
      allDay: eventData.all_day,
      startTime: eventData.all_day ? null : eventData.start_time,
      endTime: eventData.all_day ? null : eventData.end_time,
      category: eventData.category || null,
      status: eventData.status,
      recurrenceType: eventData.recurrence_type,
      recurrenceInterval: Number(eventData.recurrence_interval) || 1,
      recurrenceUntil:
        eventData.recurrence_type === "none" ? null : eventData.recurrence_until || null,
      recurrenceDays:
        eventData.recurrence_type === "weekly" ? eventData.recurrence_days : [],
    };

    if (eventData.id) {
      await updateCalendarEvent(eventData.id, payload);
    } else {
      await createCalendarEvent(payload);
    }

    if (eventData.event_date) {
      const [year, month, day] = eventData.event_date.split("-").map(Number);
      const nextDate = new Date(year, month - 1, day);
      setSelectedDate(nextDate);
      setCalendarMonth(nextDate.getMonth());
      setCalendarYear(nextDate.getFullYear());
      await refreshCalendarMonth(nextDate.getFullYear(), nextDate.getMonth());
    } else {
      await refreshCalendarMonth();
    }

    handleCloseCalendarModal();
  }

  async function handleQuickStatus(event, status) {
    await updateCalendarEvent(event.id, { status });
    await refreshCalendarMonth();
  }

  async function handleDeleteEvent(event) {
    if (!window.confirm(`Excluir o evento "${event.title}"?`)) return;
    await removeCalendarEvent(event.id);
    await refreshCalendarMonth();
  }

  async function handleOpenAudit(event) {
    setAuditEventTitle(event.title);
    setIsAuditModalOpen(true);
    try {
      const response = await getCalendarEventAudit(event.id);
      setAuditEntries(Array.isArray(response) ? response : []);
    } catch {
      setAuditEntries([]);
    }
  }

  function handleCloseAudit() {
    setIsAuditModalOpen(false);
    setAuditEntries([]);
    setAuditEventTitle("");
  }

  return {
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
  };
}
