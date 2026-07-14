export function mapDepartmentToApi(value) {
  const map = {
    ti: "TECHNOLOGY",
    financeiro: "FINANCIAL",
    comercial: "COMMERCIAL",
    juridico: "LEGAL",
  };

  return map[value] ?? value;
}

export function mapPriorityToApi(value) {
  const map = {
    baixa: "LOW",
    media: "MEDIUM",
    alta: "HIGH",
  };

  return map[value] ?? value;
}

export function mapDepartmentFromApi(value) {
  const map = {
    TECHNOLOGY: "ti",
    FINANCIAL: "financeiro",
    COMMERCIAL: "comercial",
    LEGAL: "juridico",
  };

  return map[value] ?? value;
}

export function mapDepartmentLabel(value) {
  const labelMap = {
    TECHNOLOGY: "TI",
    FINANCIAL: "Financeiro",
    COMMERCIAL: "Comercial",
    LEGAL: "Juridico",
  };

  return labelMap[value] ?? value;
}

export function mapStatusTone(status) {
  const toneMap = {
    OPEN: "analysis",
    IN_ANALYSIS: "analysis",
    WAITING_CUSTOMER: "waiting",
    WAITING_INTERNAL: "support",
    RESOLVED: "answered",
    CLOSED: "answered",
  };

  return toneMap[status] ?? "analysis";
}

export function mapStatusLabel(status) {
  const labelMap = {
    OPEN: "Aberto",
    IN_ANALYSIS: "Em analise",
    WAITING_CUSTOMER: "Aguardando cliente",
    WAITING_INTERNAL: "Aguardando interno",
    RESOLVED: "Resolvido",
    CLOSED: "Concluido",
  };

  return labelMap[status] ?? status;
}

export function mapPriorityLabel(priority) {
  const labelMap = {
    LOW: "Baixa",
    MEDIUM: "Media",
    HIGH: "Alta",
  };

  return labelMap[priority] ?? priority;
}

export function formatTicketDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
