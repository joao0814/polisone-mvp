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
  { value: "38", label: "Dias para o início da campanha.", progress: 48, footer: "16/08" },
  {
    value: "72",
    label: "Dias para o dia da eleição.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const summaryCards = [
  { tone: "blue", title: "Total de liderança", value: "50", note: "100% do total" },
  { tone: "green", title: "Total de liderança Ativa", value: "40", note: "80% do total" },
  { tone: "cyan", title: "Total de representantes", value: "300", note: "100% do total" },
  { tone: "orange", title: "Representantes Ativos", value: "240", note: "80% do total" },
  { tone: "red", title: "Excluidos", value: "60", note: "20% do total" },
];

export const people = [
  {
    id: "dr-elton-1",
    name: "Dr. Elton",
    badge: "Alta influência",
    badgeTone: "yellow",
    initials: "DE",
    leader: true,
    representative: false,
    city: "Guaratingueta",
    role: "Ex-prefeito",
    relationship: 4,
  },
  {
    id: "dulce-rita",
    name: "Dulce Rita",
    badge: "Media influência",
    badgeTone: "blue",
    initials: "DR",
    leader: false,
    representative: true,
    city: "São Jose dos campos",
    role: "Deputada",
    relationship: 5,
  },
  {
    id: "leticia-aguiar",
    name: "Leticia Aguiar",
    badge: "Baixa influência",
    badgeTone: "red",
    initials: "LA",
    leader: true,
    representative: false,
    city: "São Paulo",
    role: "Ex-prefeito",
    relationship: 3,
  },
  {
    id: "jorge-paz",
    name: "Jorge Paz",
    badge: "Influente",
    badgeTone: "green",
    initials: "JP",
    leader: false,
    representative: true,
    city: "Guaratingueta",
    role: "Vereador",
    relationship: 4,
  },
  {
    id: "dr-elton-2",
    name: "Dr. Elton",
    badge: "Apoiador forte",
    badgeTone: "yellow",
    initials: "DE",
    leader: true,
    representative: false,
    city: "Guaratingueta",
    role: "Liderança Local",
    relationship: 4,
  },
];

export const leadershipDistribution = [
  { label: "Representantes", value: "70,3%", color: "#00b765" },
  { label: "Lideranças", value: "29,7%", color: "#1687df" },
];

export const loyaltyIndex = [
  { label: "Nucleo Duro", stars: 5, value: 38 },
  { label: "Aliado Interno", stars: 4, value: 38 },
  { label: "Base de Apoio", stars: 3, value: 38 },
  { label: "Relacao Sensivel", stars: 2, value: 38 },
  { label: "Em Desenvolvimento", stars: 1, value: 38 },
];

export const influenceIndex = [
  { position: "1o", label: "Alta influência", value: 94 },
  { position: "2o", label: "Media Influência", value: 76 },
  { position: "3o", label: "Influente", value: 62 },
  { position: "4o", label: "Baixa influência", value: 48 },
  { position: "5o", label: "Apoiador forte", value: 34 },
];

export const footerMetrics = [
  { title: "TOTAL DE LIDERANCAS", value: "50", note: "LIDERANCAS CADASTRADAS" },
  { title: "Representantes", value: "300", note: "Vinculados as lideranças" },
  { title: "Lideranças ativas", value: "40", note: "80% do total" },
  { title: "Municipios cobertos", value: "28", note: "Municipios com equipes" },
  { title: "Taxa de atividade", value: "89%", note: "Da base em operacao" },
];

export const leaderSpotlight = {
  name: "Alan Leal",
  role: "Lideres de",
  initials: "AL",
  leaders: "50",
  representatives: "300",
};

export const leaderCards = [
  { name: "Roberto Campos", initials: "RC", representatives: "35" },
  { name: "Roberto Alves", initials: "RA", representatives: "35" },
  { name: "Rodrigo", initials: "RO", representatives: "35" },
  { name: "Karla Freitas", initials: "KF", representatives: "35" },
  { name: "Walter Mercado", initials: "WM", representatives: "35" },
];

export const checkinRanking = [
  { name: "Kaleb", initials: "KA", value: 100 },
  { name: "Karla", initials: "KF", value: 28 },
  { name: "Mateus", initials: "MA", value: 36 },
  { name: "Walter", initials: "WA", value: 30 },
  { name: "Roberto", initials: "RO", value: 24 },
];

export const representativeRanking = [
  { name: "Kaleb", initials: "KA", value: 100 },
  { name: "Karla", initials: "KF", value: 28 },
  { name: "Mateus", initials: "MA", value: 36 },
  { name: "Walter", initials: "WA", value: 30 },
  { name: "Roberto", initials: "RO", value: 24 },
];
