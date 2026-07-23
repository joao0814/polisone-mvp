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
  { value: "38", label: "Dias para o início da campanha.", progress: 48, footer: "16/08" },
  {
    value: "72",
    label: "Dias para o dia da eleição.",
    progress: 18,
    footer: "04/10 (primeiro turno)",
  },
];

export const filterOptions = {
  type: ["Todos", "Individual", "Bancada"],
  year: ["2023 - 2026", "2024", "2025"],
  status: ["TODAS", "Pago/Concluído", "Em execução", "Em liberação"],
  city: ["TODOS", "São José dos Campos", "Taubaté", "Sumaré"],
  entity: ["TODOS", "Prefeituras", "Hospitais", "Associações"],
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
    title: "PAGO/CONCLUÍDO",
    value: "R$ 17.350.000,00",
    note: "70,3% do total",
  },
  {
    tone: "cyan",
    title: "Em execução",
    value: "R$ 4.650.000,00",
    note: "18,8% do total",
  },
  {
    tone: "orange",
    title: "Em fase de liberação",
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
    destination: "Prefeitura de São José dos Campos / SP",
    object: "Construção de Unidade básica de saúde",
    value: "R$ 800.000,00",
    status: "Pago/Concluído",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-2",
    number: "2024.123.52362",
    type: "Bancada",
    destination: "Prefeitura de São José dos Campos / SP",
    object: "Construção de Unidade básica de saúde",
    value: "R$ 800.000,00",
    status: "Em execução",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-3",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de São José dos Campos / SP",
    object: "Construção de Unidade básica de saúde",
    value: "R$ 800.000,00",
    status: "Pago/Concluído",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-4",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de São José dos Campos / SP",
    object: "Construção de Unidade básica de saúde",
    value: "R$ 800.000,00",
    status: "Em liberação",
    date: "15/03/2024",
  },
  {
    id: "2024.123.52362-5",
    number: "2024.123.52362",
    type: "Individual",
    destination: "Prefeitura de São José dos Campos / SP",
    object: "Construção de Unidade básica de saúde",
    value: "R$ 800.000,00",
    status: "Pago/Concluído",
    date: "15/03/2024",
  },
];

export const statusDistribution = [
  { label: "Pago/Concluído", value: "70,3%", color: "#00b765" },
  { label: "Em Execução", value: "19,3%", color: "#1687df" },
  { label: "Em Liberação", value: "8%", color: "#ff9518" },
  { label: "Cancelado", value: "2%", color: "#ff3030" },
];

export const destinationTypes = [
  { label: "Educação", value: 38 },
  { label: "Saúde", value: 24 },
  { label: "Infraestrutura", value: 18 },
  { label: "Assistência Social", value: 10 },
  { label: "Esporte e lazer", value: 6 },
  { label: "Outros", value: 4 },
];

export const cityRanking = [
  { position: "1o", city: "São José dos Campos", value: 94 },
  { position: "2o", city: "Taubaté", value: 75 },
  { position: "3o", city: "Sumaré", value: 62 },
  { position: "4o", city: "Guaratinguetá", value: 48 },
  { position: "5o", city: "Caçapava", value: 34 },
];

export const footerMetrics = [
  { title: "TOTAL DE EMENDAS", value: "48", note: "EMENDAS CADASTRADAS" },
  { title: "Média por ano", value: "R$ 8,23 mi", note: "ÚLTIMOS 4 ANOS" },
  { title: "Entidades beneficiadas", value: "36", note: "Entidades diferentes" },
  { title: "Municípios Beneficiados", value: "28", note: "Municípios atendidos" },
  { title: "Taxa de execução", value: "89%", note: "Das emendas já executadas" },
];
