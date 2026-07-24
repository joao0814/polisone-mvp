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

export const intelligenceFilters = {
  uf: ["SP"],
  region: ["Vale do Paraíba", "Campinas", "Metropolitana"],
  city: {
    SP: {
      "Vale do Paraíba": ["São Jose dos Campos", "Taubate", "Guaratingueta"],
      Campinas: ["Campinas", "Sumare"],
      Metropolitana: ["São Paulo", "Mauá"],
    },
  },
};

export const intelligenceScenarios = [
  {
    id: "sp-vale-sjc",
    uf: "SP",
    region: "Vale do Paraíba",
    city: "São Jose dos Campos",
    cityTitle: "São Jose dos Campos",
    salaryInsight: {
      highlight: "+20%",
      description:
        "Contexto Salarial: A media salarial na cidade tende a superar as medias nacionais, com estimativas que apontam valores cerca de 20% acima da media do pais.",
    },
    workforceText:
      "Municipio com alto potencial eleitoral, boas taxas de engajamento e historico consistente de crescimento do seu grupo politico.",
    cityStats: [
      { label: "Habitantes", value: "756.484" },
      { label: "Eleitores", value: "582.219" },
      { label: "Abstencao (2024)", value: "18,42%" },
      { label: "PIB per capita", value: "R$ 73.879,00" },
    ],
    ballotStats: [
      { label: "Brancos", value: "28.732", note: "4,93%" },
      { label: "Nulos", value: "34.619", note: "5,94%" },
      { label: "Comparecimento", value: "81,58%" },
      { label: "Densidade eleitoral", value: "770,34", note: "Eleitores por KM2" },
    ],
    businessStats: [
      { label: "Carteira Assinada", value: "213.367" },
      { label: "Empresas Ativas", value: "128.720" },
      { label: "(MEI)", value: "61.699" },
      { label: "(ME)", value: "46.972" },
      { label: "(EPP)", value: "7.401" },
    ],
    mostVoted: [
      { name: "Dr. Elton", party: "PSC", votes: "35.629", percent: "8,95%", score: 100 },
      { name: "Dulce Rita", party: "PSDB", votes: "28.156", percent: "7,07%", score: 79 },
      { name: "Leticia Aguiar", party: "Progressistas", votes: "27.272", percent: "6,85%", score: 76 },
      { name: "Carlos Abranches", party: "Cidadania", votes: "25.283", percent: "6,35%", score: 71 },
      { name: "Fernando Petiti", party: "MDB", votes: "21.666", percent: "5,44%", score: 61 },
      { name: "Mariana Costa", party: "PSD", votes: "19.431", percent: "4,88%", score: 54 },
      { name: "Bianca Leal", party: "UniÃ£o", votes: "18.904", percent: "4,74%", score: 53 },
    ],
    gender: { female: 70, male: 30 },
    ageRanges: [
      { label: "16-24", percent: "15,3%", value: 30 },
      { label: "25-34", percent: "22,8%", value: 39 },
      { label: "35-44", percent: "23,7%", value: 43 },
      { label: "45-54", percent: "25,6%", value: 47 },
      { label: "55+", percent: "12,6%", value: 25 },
    ],
    averageAge: { total: 32, female: 25, male: 35 },
  },
  {
    id: "sp-campinas-campinas",
    uf: "SP",
    region: "Campinas",
    city: "Campinas",
    cityTitle: "Campinas",
    salaryInsight: {
      highlight: "+14%",
      description:
        "Contexto Salarial: Campinas apresenta renda media acima da media estadual, com forte influência do setor de servicos, tecnologia e universidade.",
    },
    workforceText:
      "Municipio estrategico para consolidacao regional, com eleitorado urbano diversificado e alto volume de lideranças locais competitivas.",
    cityStats: [
      { label: "Habitantes", value: "1.139.047" },
      { label: "Eleitores", value: "843.780" },
      { label: "Abstencao (2024)", value: "19,05%" },
      { label: "PIB per capita", value: "R$ 66.112,00" },
    ],
    ballotStats: [
      { label: "Brancos", value: "31.402", note: "4,72%" },
      { label: "Nulos", value: "38.505", note: "5,79%" },
      { label: "Comparecimento", value: "80,95%" },
      { label: "Densidade eleitoral", value: "1.060,22", note: "Eleitores por KM2" },
    ],
    businessStats: [
      { label: "Carteira Assinada", value: "301.224" },
      { label: "Empresas Ativas", value: "172.406" },
      { label: "(MEI)", value: "82.117" },
      { label: "(ME)", value: "56.334" },
      { label: "(EPP)", value: "9.781" },
    ],
    mostVoted: [
      { name: "Jorge Paz", party: "PSD", votes: "41.203", percent: "9,11%", score: 100 },
      { name: "Dulce Rita", party: "PSDB", votes: "36.881", percent: "8,15%", score: 89 },
      { name: "Felipe Azevedo", party: "PL", votes: "29.740", percent: "6,58%", score: 72 },
      { name: "Helena Prado", party: "MDB", votes: "25.914", percent: "5,73%", score: 63 },
      { name: "Ricardo Gomes", party: "Republicanos", votes: "23.801", percent: "5,26%", score: 58 },
      { name: "Simone Batista", party: "PSB", votes: "20.533", percent: "4,54%", score: 50 },
      { name: "Marina Porto", party: "UniÃ£o", votes: "19.887", percent: "4,40%", score: 48 },
    ],
    gender: { female: 67, male: 33 },
    ageRanges: [
      { label: "16-24", percent: "16,1%", value: 31 },
      { label: "25-34", percent: "24,4%", value: 41 },
      { label: "35-44", percent: "22,6%", value: 39 },
      { label: "45-54", percent: "24,2%", value: 41 },
      { label: "55+", percent: "12,7%", value: 25 },
    ],
    averageAge: { total: 34, female: 31, male: 36 },
  },
  {
    id: "sp-metro-sp",
    uf: "SP",
    region: "Metropolitana",
    city: "São Paulo",
    cityTitle: "São Paulo",
    salaryInsight: {
      highlight: "+28%",
      description:
        "Contexto Salarial: capital com maior concentracao de renda e densidade economica, exigindo leitura segmentada por bairros e nucleos de influência.",
    },
    workforceText:
      "Ambiente altamente competitivo, com grande volume de eleitores, agendas fragmentadas e necessidade de leitura fina por zona e lideranças intermediarias.",
    cityStats: [
      { label: "Habitantes", value: "11.451.245" },
      { label: "Eleitores", value: "9.322.444" },
      { label: "Abstencao (2024)", value: "21,11%" },
      { label: "PIB per capita", value: "R$ 98.421,00" },
    ],
    ballotStats: [
      { label: "Brancos", value: "211.844", note: "5,01%" },
      { label: "Nulos", value: "259.760", note: "6,14%" },
      { label: "Comparecimento", value: "78,89%" },
      { label: "Densidade eleitoral", value: "6.103,44", note: "Eleitores por KM2" },
    ],
    businessStats: [
      { label: "Carteira Assinada", value: "2.481.553" },
      { label: "Empresas Ativas", value: "1.029.704" },
      { label: "(MEI)", value: "412.663" },
      { label: "(ME)", value: "288.113" },
      { label: "(EPP)", value: "44.728" },
    ],
    mostVoted: [
      { name: "Maria Lins", party: "PT", votes: "152.321", percent: "10,22%", score: 100 },
      { name: "Fernando Petiti", party: "MDB", votes: "138.114", percent: "9,27%", score: 91 },
      { name: "Joao Victor", party: "UniÃ£o", votes: "120.553", percent: "8,09%", score: 79 },
      { name: "Bianca Prado", party: "PSD", votes: "113.248", percent: "7,60%", score: 74 },
      { name: "Helena Castro", party: "PL", votes: "101.327", percent: "6,80%", score: 67 },
      { name: "Ricardo Gomes", party: "PSB", votes: "88.994", percent: "5,97%", score: 58 },
      { name: "Carlos Almeida", party: "Republicanos", votes: "74.250", percent: "4,98%", score: 49 },
    ],
    gender: { female: 64, male: 36 },
    ageRanges: [
      { label: "16-24", percent: "18,4%", value: 35 },
      { label: "25-34", percent: "26,1%", value: 44 },
      { label: "35-44", percent: "21,5%", value: 38 },
      { label: "45-54", percent: "20,8%", value: 36 },
      { label: "55+", percent: "13,2%", value: 26 },
    ],
    averageAge: { total: 35, female: 33, male: 37 },
  },
];
