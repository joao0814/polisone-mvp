import biImage from "../../assets/images/home/BI.png";
import gestaoCampanhaImage from "../../assets/images/home/gestao_campanha.png";
import gestaoMandatoImage from "../../assets/images/home/gestao_mandato.png";
import iaImage from "../../assets/images/home/IA.png";

export const links = [
  { label: "Chamados", icon: "support", tone: "yellow" },
  { label: "Materiais de Campanha", icon: "briefcase", tone: "black" },
  { label: "Check-in", icon: "check", tone: "black" },
  { label: "Outlook", icon: "mail", tone: "blue" },
  { label: "YouTube", icon: "play", tone: "red" },
  { label: "Canva", icon: "canva", tone: "cyan" },
];

export const systems = [
  { label: "Gestão de Campanha", image: gestaoCampanhaImage, path: "/gestao-campanha" },
  { label: "Gestão de Mandato", image: gestaoMandatoImage },
  { label: "BI", image: biImage },
  { label: "IA", image: iaImage },
];

export const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export const weekDaysFull = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

export const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export const monthNamesFull = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const CALENDAR_STATUS_FILTERS = [
  { value: "", label: "Todos os status" },
  { value: "active", label: "Ativos" },
  { value: "completed", label: "Concluidos" },
  { value: "canceled", label: "Cancelados" },
];

export const CALENDAR_RECURRENCE_FILTERS = [
  { value: "", label: "Toda recorrencia" },
  { value: "none", label: "Sem recorrencia" },
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];
