export function formatDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatDateKeyFromParts(year, month, day) {
  return [year, String(month + 1).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}

export function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

export function formatDisplayDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(event) {
  if (event.allDay) return "Dia inteiro";
  if (!event.startTime) return "Horario a definir";
  if (!event.endTime) return event.startTime;
  return `${event.startTime} - ${event.endTime}`;
}

export function getStatusLabel(status) {
  if (status === "completed") return "Concluido";
  if (status === "canceled") return "Cancelado";
  return "Ativo";
}

export function getRecurrenceLabel(event) {
  if (event.recurrenceType === "daily") return "Diariamente";
  if (event.recurrenceType === "weekly") return "Semanalmente";
  if (event.recurrenceType === "monthly") return "Mensalmente";
  if (event.recurrenceType === "yearly") return "Anualmente";
  return "Recorrente";
}

export function getInitials(name = "") {
  const [firstName = "", lastName = ""] = name.trim().split(" ");
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.trim();

  return initials.toUpperCase() || "U";
}
