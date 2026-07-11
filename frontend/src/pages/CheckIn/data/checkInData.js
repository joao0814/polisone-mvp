import bannerPhoto from "../../../assets/images/home/banner.png";
import activityPhoto from "../../../assets/images/home/comunicados/comunidade3.png";
import checkoutPhoto from "../../../assets/images/home/comunicados/comunicado1.png";

export const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visao Geral", path: "/gestao-campanha" },
  { label: "Inteligencia Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municipios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Territorio" },
  { label: "Mapa eleitoral" },
  { label: "Metricas" },
];

export const countdowns = [
  { value: "38", label: "Dias para o inicio da campanha.", progress: 48, footer: "16/08" },
  {
    value: "72",
    label: "Dias para o dia da eleicao.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const summaryCards = [
  { tone: "blue", title: "Liderancas ativas hoje", value: "50", note: "100% do total" },
  { tone: "green", title: "Representantes ativos hoje", value: "40", note: "80% do total" },
  { tone: "cyan", title: "Atividades realizadas", value: "300", note: "100% do total" },
  { tone: "orange", title: "Check-in", value: "240", note: "80% do total" },
  { tone: "red", title: "Novos cadastros hoje", value: "60", note: "20% do total" },
];

export const activeTeams = [
  {
    id: "dr-elton",
    name: "Dr. Elton",
    city: "Guaratingueta",
    badge: "Panfletagem",
    badgeTone: "yellow",
    initials: "DE",
    status: "Em atividade",
    checkin: "08:30 am",
    checkout: "12:30 pm",
  },
  {
    id: "dulce-rita",
    name: "Dulce Rita",
    city: "Sao Jose dos Campos",
    badge: "Media influencia",
    badgeTone: "blue",
    initials: "DR",
    status: "Em atividade",
    checkin: "08:30 am",
    checkout: "12:30 pm",
  },
  {
    id: "leticia-aguiar",
    name: "Leticia Aguiar",
    city: "Sao Paulo",
    badge: "Baixa influencia",
    badgeTone: "red",
    initials: "LA",
    status: "Em atividade",
    checkin: "08:30 am",
    checkout: "12:30 pm",
  },
  {
    id: "jorge-paz",
    name: "Jorge Paz",
    city: "Guaratingueta",
    badge: "Influente",
    badgeTone: "green",
    initials: "JP",
    status: "Em atividade",
    checkin: "08:30 am",
    checkout: "12:30 pm",
  },
  {
    id: "dr-elton-2",
    name: "Dr. Elton",
    city: "Guaratingueta",
    badge: "Apoiador forte",
    badgeTone: "yellow",
    initials: "DE",
    status: "Em atividade",
    checkin: "08:30 am",
    checkout: "12:30 pm",
  },
];

export const activityTypes = [
  { label: "Panfletagem", value: "70,3%", color: "#00b765" },
  { label: "Adesivagem", value: "19,3%", color: "#1687df" },
  { label: "Pesquisa de campo", value: "8%", color: "#ff9518" },
  { label: "Outro", value: "2%", color: "#ff3030" },
];

export const checkPerformance = [
  { label: "Check-in", value: "70,3%", color: "#00b765" },
  { label: "Atividades", value: "19,3%", color: "#1687df" },
  { label: "Check-Out", value: "8%", color: "#ff9518" },
  { label: "Não realizado", value: "2%", color: "#ff3030" },
];

export const photoCards = [
  {
    title: "Foto de Check-in",
    time: "08:30",
    date: "06/07",
    person: "Manoel Ribas",
    location: "Sao Jose dos Campos - SP",
    role: "Representante",
    leader: "Jose Roberto",
    action: "Inicio",
    tone: "greenButton",
    photo: bannerPhoto,
  },
  {
    title: "Fotos das atividades",
    time: "13:30",
    date: "06/07",
    person: "Manoel Ribas",
    location: "Sao Jose dos Campos - SP",
    role: "Representante",
    leader: "Jose Roberto",
    action: "Panfletagem",
    tone: "blueButton",
    photo: activityPhoto,
  },
  {
    title: "Foto de Check-out",
    time: "17:30",
    date: "06/07",
    person: "Manoel Ribas",
    location: "Sao Jose dos Campos - SP",
    role: "Representante",
    leader: "Jose Roberto",
    action: "Check-out",
    tone: "redButton",
    photo: checkoutPhoto,
  },
];
