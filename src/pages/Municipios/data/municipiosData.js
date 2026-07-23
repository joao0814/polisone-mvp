export const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visão Geral", path: "/gestao-campanha" },
  { label: "Inteligência Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municípios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes", path: "/equipes" },
  { label: "Check-in", path: "/check-in" },
  { label: "Pesquisa de campo", path: "/pesquisa-campo" },
  { label: "Território" },
  { label: "Mapa eleitoral" },
  { label: "Métricas" },
];

export const countdowns = [
  {
    value: "38",
    label: "Dias para o início da campanha.",
    progress: 48,
    footer: "16/08",
  },
  {
    value: "72",
    label: "Dias para o dia da eleição.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const summaryCards = [
  { label: "Municípios Ativos", value: "235", note: "No estado de São Paulo", icon: "active" },
  { label: "Municípios Prioritários", value: "32", note: "No estado de São Paulo", icon: "priority" },
  { label: "Municípios com votos", value: "212", note: "No estado de São Paulo", icon: "votes" },
  { label: "Municípios com recursos", value: "62", note: "No estado de São Paulo", icon: "resources" },
];

export const municipalities = [
  {
    id: "sao-jose-rio-preto",
    name: "São José do Rio Preto",
    region: "Noroeste",
    representatives: 18,
    population: "469.173",
    voters: "408.561",
    amendmentsValue: "R$ 2.238.321,00",
    amendmentsCount: 12,
  },
  {
    id: "sao-jose-campos",
    name: "São José dos Campos",
    region: "Leste",
    representatives: 32,
    population: "735.000",
    voters: "560.000",
    amendmentsValue: "R$ 5.238.321,00",
    amendmentsCount: 22,
  },
  {
    id: "guaratingueta",
    name: "Guaratinguetá",
    region: "Leste",
    representatives: 35,
    population: "130.000",
    voters: "75.000",
    amendmentsValue: "R$ 500.000,00",
    amendmentsCount: 4,
  },
  {
    id: "sumare",
    name: "Sumaré",
    region: "Noroeste",
    representatives: 60,
    population: "280.000",
    voters: "200.000",
    amendmentsValue: "R$ 150.000,00",
    amendmentsCount: 2,
  },
  {
    id: "rio-preto-reprise",
    name: "São José do Rio Preto",
    region: "Noroeste",
    representatives: 18,
    population: "469.173",
    voters: "408.561",
    amendmentsValue: "R$ 2.238.321,00",
    amendmentsCount: 12,
  },
];
