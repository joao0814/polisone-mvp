export const menuItems = [
  { label: "Portal do Candidato", path: "/" },
  { label: "Visao Geral", path: "/gestao-campanha" },
  { label: "Inteligencia Eleitoral", path: "/inteligencia-eleitoral" },
  { label: "Municipios", path: "/municipios" },
  { label: "Emendas", path: "/emendas" },
  { label: "Equipes" },
  { label: "Check-in" },
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

export const summaryCards = [
  { label: "Municipios Ativos", value: "235", note: "No estado de Sao Paulo" },
  { label: "Municipios Prioritarios", value: "32", note: "No estado de Sao Paulo" },
  { label: "Municipios com votos", value: "212", note: "No estado de Sao Paulo" },
  { label: "Municipios com recursos", value: "62", note: "No estado de Sao Paulo" },
];

export const municipalities = [
  {
    id: "sao-jose-rio-preto",
    name: "Sao Jose do Rio Preto",
    region: "Noroeste",
    representatives: 18,
    population: "469.173",
    voters: "408.561",
    amendmentsValue: "R$ 2.238.321,00",
    amendmentsCount: 12,
  },
  {
    id: "sao-jose-campos",
    name: "Sao Jose dos Campos",
    region: "Leste",
    representatives: 32,
    population: "735.000",
    voters: "560.000",
    amendmentsValue: "R$ 5.238.321,00",
    amendmentsCount: 22,
  },
  {
    id: "guaratingueta",
    name: "Guaratingueta",
    region: "Leste",
    representatives: 35,
    population: "130.000",
    voters: "75.000",
    amendmentsValue: "R$ 500.000,00",
    amendmentsCount: 4,
  },
  {
    id: "sumare",
    name: "Sumare",
    region: "Noroeste",
    representatives: 60,
    population: "280.000",
    voters: "200.000",
    amendmentsValue: "R$ 150.000,00",
    amendmentsCount: 2,
  },
  {
    id: "rio-preto-reprise",
    name: "Sao Jose do Rio Preto",
    region: "Noroeste",
    representatives: 18,
    population: "469.173",
    voters: "408.561",
    amendmentsValue: "R$ 2.238.321,00",
    amendmentsCount: 12,
  },
];
