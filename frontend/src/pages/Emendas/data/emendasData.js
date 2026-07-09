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
  { value: "38", label: "Dias para o inicio da campanha.", progress: 48, footer: "16/08" },
  {
    value: "72",
    label: "Dias para o dia da eleicao.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const filterOptions = {
  type: ["Todos", "Individual", "Bancada"],
  year: ["2023 - 2026", "2024", "2025"],
  status: ["TODAS", "Pago/Concluido", "Em execucao", "Em liberacao"],
  city: ["TODOS", "Sao Jose dos Campos", "Taubate", "Sumare"],
  entity: ["TODOS", "Prefeituras", "Hospitais", "Associacoes"],
};

export const financialCards = [
  {
    tone: "blue",
    title: "Total Destinado",
    value: "R$ 24.680.000,00",
    note: "100% do total",
  },
  {
    tone: "green",
    title: "PAGO/CONCLUIDO",
    value: "R$ 17.350.000,00",
    note: "70,3% do total",
  },
  {
    tone: "cyan",
    title: "Em execucao",
    value: "R$ 4.650.000,00",
    note: "18,8% do total",
  },
  {
    tone: "orange",
    title: "Em fase de liberacao",
    value: "R$ 1.980.000,00",
    note: "8,0% do total",
  },
  {
    tone: "red",
    title: "Cancelado/devolvido",
    value: "R$ 500.000,00",
    note: "2,0% do total",
  },
];

export const amendments = [
  {
    id: "2024.123.52362-1",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de Sao Jose dos Campos / SP",
    object: "Construcao de Unidade basica de saude",
    value: "R$ 800.000,00",
    status: "Pago/Concluido",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-2",
    number: "2024.123.52362",
    type: "Bancada",
    destination: "Prefeitura de Sao Jose dos Campos / SP",
    object: "Construcao de Unidade basica de saude",
    value: "R$ 800.000,00",
    status: "Em execucao",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-3",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de Sao Jose dos Campos / SP",
    object: "Construcao de Unidade basica de saude",
    value: "R$ 800.000,00",
    status: "Pago/Concluido",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-4",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de Sao Jose dos Campos / SP",
    object: "Construcao de Unidade basica de saude",
    value: "R$ 800.000,00",
    status: "Em liberacao",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-5",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de Sao Jose dos Campos / SP",
    object: "Construcao de Unidade basica de saude",
    value: "R$ 800.000,00",
    status: "Pago/Concluido",
    date: "15/03/2024",
  },
];

export const statusDistribution = [
  { label: "Pago/Concluido", value: "70,3%", color: "#00b765" },
  { label: "Em Execucao", value: "19,3%", color: "#1687df" },
  { label: "Em Liberacao", value: "8%", color: "#ff9518" },
  { label: "Cancelado", value: "2%", color: "#ff3030" },
];

export const destinationTypes = [
  { label: "Educacao", value: 38 },
  { label: "Saude", value: 24 },
  { label: "Infraestrutura", value: 18 },
  { label: "Assistencia Social", value: 10 },
  { label: "Esporte e lazer", value: 6 },
  { label: "Outros", value: 4 },
];

export const cityRanking = [
  { position: "1o", city: "Sao Jose dos Campos", value: 94 },
  { position: "2o", city: "Taubate", value: 75 },
  { position: "3o", city: "Sumare", value: 62 },
  { position: "4o", city: "Guaratingueta", value: 48 },
  { position: "5o", city: "Cacapava", value: 34 },
];

export const footerMetrics = [
  { title: "TOTAL DE EMENDAS", value: "48", note: "EMENDAS CADASTRADAS" },
  { title: "Media por ano", value: "R$ 8,23 mi", note: "ULTIMOS 4 ANOS" },
  { title: "Entidades beneficiadas", value: "36", note: "Entidades diferentes" },
  { title: "Municipios Beneficiados", value: "28", note: "Municipios atendidos" },
  { title: "Taxa de execucao", value: "89%", note: "Das emendas ja executadas" },
];
