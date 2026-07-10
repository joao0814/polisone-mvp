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

export const filterOptions = {
  type: ["Todos", "Quantitativa", "Espontanea"],
  year: ["2023 - 2026", "2024", "2025"],
  status: ["TODAS", "Em campo", "Concluida"],
  city: ["TODOS", "Sumare", "Guaratingueta", "Sao Paulo"],
  entity: ["TODOS", "Equipe Centro", "Equipe Leste", "Equipe Norte"],
};

export const summaryCards = [
  { tone: "blue", title: "Pesquisas Realizadas", value: "248", note: "100% do total" },
  { tone: "green", title: "Respostas Coletadas", value: "2.842", note: "70,3% do total" },
  { tone: "cyan", title: "Cidades visitadas", value: "32", note: "de 45 (total)" },
  { tone: "orange", title: "Equipes em campo", value: "18", note: "de 24 equipes (total)" },
  { tone: "red", title: "Taxa de resposta", value: "78%", note: "" },
];

export const cityDistribution = [
  { label: "Sumare", value: "70,3%", color: "#00b765" },
  { label: "Guaratingueta", value: "19,3%", color: "#1687df" },
  { label: "Sao Paulo", value: "8%", color: "#ff9518" },
  { label: "Sao Jose dos Campos", value: "2%", color: "#ff3030" },
];

export const voteInfluence = [
  { label: "Propostas", value: "70,3%", color: "#00b765" },
  { label: "Honestidade", value: "19,3%", color: "#1687df" },
  { label: "Partido", value: "8%", color: "#ff9518" },
  { label: "Experiencia", value: "2%", color: "#ff3030" },
];

export const cityProblems = [
  { label: "Educacao", value: 38 },
  { label: "Saude", value: 24 },
  { label: "Infraestrutura", value: 18 },
  { label: "Assistencia Social", value: 10 },
  { label: "Esporte e lazer", value: 6 },
  { label: "Outros", value: 4 },
];

export const priorityRanking = [
  { position: "1o", label: "Saude", value: 92, votes: "4520 votos" },
  { position: "2o", label: "Seguranca", value: 74, votes: "1100 votos" },
  { position: "3o", label: "Educacao", value: 62, votes: "927 votos" },
  { position: "4o", label: "Emprego/renda", value: 48, votes: "754 votos" },
  { position: "5o", label: "Outros...", value: 34, votes: "698 votos" },
];

export const electorateProfile = {
  gender: {
    female: 70,
    male: 30,
  },
  ageRanges: [
    { label: "16-24", value: 15.3, percent: "15,3%" },
    { label: "25-34", value: 22.8, percent: "22,8%" },
    { label: "35-44", value: 23.7, percent: "23,7%" },
    { label: "45-54", value: 25.6, percent: "25,6%" },
    { label: "55+", value: 12.6, percent: "12,6%" },
  ],
  averageAge: {
    total: 32,
    female: 25,
    male: 35,
  },
};

export const spontaneousVotes = [
  {
    name: "Dr. Elton",
    party: "PSC",
    votes: "35.629",
    percent: "8,95%",
    score: 100,
    avatar: "DE",
  },
  {
    name: "Dulce Rita",
    party: "PSDB",
    votes: "28.156",
    percent: "7,07%",
    score: 78,
    avatar: "DR",
  },
  {
    name: "Leticia Aguiar",
    party: "Progressistas",
    votes: "27.272",
    percent: "6,85%",
    score: 76,
    avatar: "LA",
  },
];

export const growingCandidates = [
  { position: "1o", name: "Carlos Eduardo", votes: "3.200 votos", growth: "32%", avatar: "CE" },
  { position: "2o", name: "Janaina Salmeirao", votes: "2.700 votos", growth: "28%", avatar: "JS" },
  { position: "3o", name: "Jorge Paz", votes: "1.500 votos", growth: "22%", avatar: "JP" },
  { position: "4o", name: "Roberto Silva", votes: "1.200 votos", growth: "16%", avatar: "RS" },
  { position: "5o", name: "Maria Eduarda", votes: "750 votos", growth: "9%", avatar: "ME" },
];

export const footerMetrics = [
  { title: "Meta da semana", value: "2.000", note: "TOTAL" },
  { title: "Realizadas na semana", value: "1.000", note: "50% DO TOTAL" },
  { title: "Crescimento de Pesquisas", value: "36%", note: "Em relacao a semana anterior", trend: true },
  { title: "Crescimento de Municipios pesquisados", value: "28%", note: "Em relacao a semana anterior", trend: true },
  { title: "Ranking do candidato", value: "3o", note: "Subiu duas posicoes em relacao a semana anterior" },
];

export const perceptionPanels = [
  {
    title: "Voce conhece o candidato?",
    items: [
      { label: "Sim", value: 38 },
      { label: "Ja ouvi falar", value: 34 },
      { label: "Conheco de vista", value: 20 },
      { label: "Nao conheco", value: 18 },
    ],
  },
  {
    title: "Hoje, qual a chance de votar nesse candidato?",
    items: [
      { label: "Com certeza", value: 38 },
      { label: "Provavel votar", value: 34 },
      { label: "Ainda estou indeciso", value: 20 },
      { label: "Nao votaria", value: 18 },
    ],
  },
  {
    title: "Hoje, qual a chance de votar nesse candidato?",
    items: [
      { label: "Com certeza", value: 38 },
      { label: "Provavel votar", value: 34 },
      { label: "Ainda estou indeciso", value: 20 },
      { label: "Nao votaria", value: 18 },
    ],
  },
];
