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
  {
    value: "38",
    label: "Dias para o inicio da campanha.",
    progress: 48,
    footer: "16/08",
  },
  {
    value: "72",
    label: "Dias para o dia da eleicao.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const cityStats = [
  { label: "Habitantes", value: "756.484" },
  { label: "Eleitores", value: "582.219" },
  { label: "Abstencao (2024)", value: "18,42%" },
  { label: "PIB per capita", value: "R$ 73.879,00" },
];

export const ballotStats = [
  { label: "Brancos", value: "28.732", note: "4,93%" },
  { label: "Nulos", value: "34.619", note: "5,94%" },
  { label: "Comparecimento", value: "81,58%" },
  { label: "Densidade eleitoral", value: "770,34", note: "Eleitores por KM2" },
];

export const businessStats = [
  { label: "Carteira Assinada", value: "213.367" },
  { label: "Empresas Ativas", value: "128.720" },
  { label: "(MEI)", value: "61.699" },
  { label: "(ME)", value: "46.972" },
  { label: "(EPP)", value: "7.401" },
];

export const mostVoted = [
  { name: "Dr. Elton", party: "PSC", votes: "35.629", percent: "8,95%", score: 100 },
  { name: "Dulce Rita", party: "PSDB", votes: "28.156", percent: "7,07%", score: 79 },
  {
    name: "Leticia Aguiar",
    party: "Progressistas",
    votes: "27.272",
    percent: "6,85%",
    score: 76,
  },
  {
    name: "Carlos Abranches",
    party: "Cidadania",
    votes: "25.283",
    percent: "6,35%",
    score: 71,
  },
  { name: "Fernando Petiti", party: "MDB", votes: "21.666", percent: "5,44%", score: 61 },
];

export const ageRanges = [
  { label: "16-24", percent: "15,3%", value: 30 },
  { label: "25-34", percent: "22,8%", value: 39 },
  { label: "35-44", percent: "23,7%", value: 43 },
  { label: "45-54", percent: "25,6%", value: 47 },
  { label: "55+", percent: "12,6%", value: 25 },
];
