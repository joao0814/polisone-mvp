export const DEPARTMENT_OPTIONS = [
  { value: "ti", label: "TI" },
  { value: "financeiro", label: "Financeiro" },
  { value: "comercial", label: "Comercial" },
  { value: "juridico", label: "Jurídico" },
];

export const MODULE_OPTIONS = [
  { value: "chamados", label: "Chamados" },
  { value: "meus-dados", label: "Meus Dados" },
  { value: "portal-ixer", label: "Portal IXER" },
  { value: "acervo", label: "Acervo" },
  { value: "crm", label: "CRM" },
  { value: "comissoes", label: "Comissões" },
  { value: "fornecedores", label: "Fornecedores" },
  { value: "apolices", label: "Apólices" },
  { value: "planos", label: "Planos" },
  { value: "beneficios", label: "Benefícios" },
  { value: "termos-de-uso", label: "Termos de Uso" },
  { value: "portal-do-cliente", label: "Portal do Cliente" },
  { value: "blog", label: "Blog" },
  { value: "franquias", label: "Franquias" },
  { value: "colaboradores", label: "Colaboradores" },
  { value: "empresas", label: "Empresas" },
  { value: "importacao", label: "Importação" },
  { value: "clinica-online", label: "Clínica Online" },
  { value: "saude-na-sua-tela", label: "Saúde na Sua Tela" },
  {
    value: "cic-central-integrada-de-consoles",
    label: "CIC - Central Integrada de Consoles",
  },
  { value: "relatorios", label: "Relatórios" },
];

export const FINANCIAL_SUBCATEGORY_OPTIONS = [
  { value: "segunda-via-de-boleto", label: "Segunda via de boleto" },
  { value: "duvidas-sobre-cobranca", label: "Dúvidas sobre cobrança" },
  { value: "baixa-de-pagamento", label: "Baixa de pagamento" },
  { value: "comprovante-de-pagamento", label: "Comprovante de pagamento" },
  { value: "nota-fiscal", label: "Nota fiscal" },
  { value: "reembolso", label: "Reembolso" },
  { value: "alteracao-de-vencimento", label: "Alteração de vencimento" },
  { value: "negociacao-de-debitos", label: "Negociação de débitos" },
];

export const COMMERCIAL_SUBCATEGORY_OPTIONS = [
  { value: "nova-proposta", label: "Nova proposta" },
  {
    value: "duvidas-sobre-planos-e-beneficios",
    label: "Dúvidas sobre planos e benefícios",
  },
  { value: "alteracao-de-plano", label: "Alteração de plano" },
  { value: "renovacao-contratual", label: "Renovação contratual" },
  { value: "cancelamento", label: "Cancelamento" },
  { value: "acompanhamento-de-venda", label: "Acompanhamento de venda" },
  { value: "comissoes-comerciais", label: "Comissões comerciais" },
  { value: "parcerias", label: "Parcerias" },
];

export const LEGAL_SUBCATEGORY_OPTIONS = [
  { value: "analise-de-contrato", label: "Análise de contrato" },
  { value: "revisao-contratual", label: "Revisão contratual" },
  { value: "termos-de-uso", label: "Termos de Uso" },
  { value: "lgpd-e-privacidade", label: "LGPD e Privacidade" },
  { value: "notificacao-extrajudicial", label: "Notificação extrajudicial" },
  { value: "documentacao-societaria", label: "Documentação societária" },
  { value: "duvidas-juridicas", label: "Dúvidas jurídicas" },
  { value: "procuracao-e-documentos", label: "Procuração e documentos" },
];

export const CLASSIFICATION_OPTIONS_BY_DEPARTMENT = {
  ti: MODULE_OPTIONS,
  financeiro: FINANCIAL_SUBCATEGORY_OPTIONS,
  comercial: COMMERCIAL_SUBCATEGORY_OPTIONS,
  juridico: LEGAL_SUBCATEGORY_OPTIONS,
};

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || "-";
}

export function getDepartmentLabel(value) {
  return getOptionLabel(DEPARTMENT_OPTIONS, value);
}

export function getClassificationFieldLabel(department) {
  return department === "ti" ? "Módulo" : "Subcategoria";
}

export function getClassificationLabel(department, value) {
  return getOptionLabel(CLASSIFICATION_OPTIONS_BY_DEPARTMENT[department] || [], value);
}
