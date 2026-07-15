export type Severity = "Baixa" | "Média" | "Alta" | "Crítica";
export type NCStatus =
  | "Rascunho"
  | "Em Classificação"
  | "Em Análise"
  | "Plano em Execução"
  | "Em Avaliação"
  | "Encerrada"
  | "Cancelada";

export type Origem =
  | "Auditoria interna"
  | "Auditoria externa"
  | "Rotina do processo"
  | "Comunicação"
  | "Cliente"
  | "Documental"
  | "Outros";

export interface NC {
  id: string;
  codigo: string;
  descricao: string;
  origem: Origem;
  gravidade: Severity;
  responsavel: { nome: string; iniciais: string };
  status: NCStatus;
  prazoSLA: string; // ISO
  slaStatus: "ok" | "proximo" | "vencido";
  reincidente: boolean;
  criadoEm: string;
  local: string;
}

const nomes = [
  ["Ana Ribeiro", "AR"],
  ["Carlos Mendes", "CM"],
  ["Beatriz Souza", "BS"],
  ["Diego Almeida", "DA"],
  ["Fernanda Lima", "FL"],
  ["Rafael Costa", "RC"],
  ["Juliana Peixoto", "JP"],
  ["Marcos Vinícius", "MV"],
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const descricoes = [
  "Divergência de peso em lote 4821 identificada na inspeção de saída",
  "Falha no registro de temperatura da câmara fria — turno noturno",
  "Etiqueta de rastreabilidade ausente em pallet expedido",
  "Reclamação de cliente: embalagem danificada no recebimento",
  "Documento de calibração vencido — balança BAL-07",
  "Desvio de procedimento na linha de envase 03",
  "Produto não conforme identificado em auditoria interna trimestral",
  "Não conformidade regulatória apontada pela ANVISA em inspeção",
  "Falta de EPI observada no setor de mistura",
  "Erro de dosagem em fórmula do lote 9921",
  "Reincidência de falha em selagem — máquina SEL-02",
  "Divergência de estoque físico x sistêmico no almoxarifado",
  "Amostra reprovada em ensaio microbiológico",
  "Ordem de produção sem assinatura do supervisor",
  "Vazamento identificado em tubulação da utilidade — vapor",
  "Rótulo com informação nutricional divergente do especificado",
  "Fornecedor entregou matéria-prima fora da especificação técnica",
  "Higienização de equipamento não registrada no checklist do turno",
  "Treinamento obrigatório NR-35 vencido para 4 colaboradores",
];

const origens: Origem[] = [
  "Auditoria interna",
  "Cliente",
  "Rotina do processo",
  "Auditoria externa",
  "Documental",
  "Comunicação",
];
const gravidades: Severity[] = ["Baixa", "Média", "Alta", "Crítica"];
const statuses: NCStatus[] = [
  "Rascunho",
  "Em Classificação",
  "Em Análise",
  "Plano em Execução",
  "Em Avaliação",
  "Encerrada",
];
const locais = ["Produção", "Administrativo", "Serviço", "Almoxarifado"];

export const mockNCs: NC[] = descricoes.map((desc, i) => {
  const [nome, iniciais] = pick(nomes, i);
  const daysOffset = (i % 14) - 5;
  const prazo = new Date();
  prazo.setDate(prazo.getDate() + daysOffset);
  const slaStatus: NC["slaStatus"] =
    daysOffset < 0 ? "vencido" : daysOffset <= 2 ? "proximo" : "ok";
  return {
    id: `nc-${i + 1}`,
    codigo: `NC-2026-${String(i + 1).padStart(6, "0")}`,
    descricao: desc,
    origem: pick(origens, i),
    gravidade: pick(gravidades, i * 3),
    responsavel: { nome: nome as string, iniciais: iniciais as string },
    status: pick(statuses, i * 2),
    prazoSLA: prazo.toISOString(),
    slaStatus,
    reincidente: i % 5 === 0,
    criadoEm: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    local: pick(locais, i),
  };
});

export const kpis = {
  conformidade: 87,
  ncsAbertas: 24,
  ncsVencidas: 5,
  proximasAuditorias: 3,
};

export const ncsPorMes = [
  { mes: "Jan", abertas: 12, fechadas: 9 },
  { mes: "Fev", abertas: 15, fechadas: 11 },
  { mes: "Mar", abertas: 9, fechadas: 13 },
  { mes: "Abr", abertas: 18, fechadas: 14 },
  { mes: "Mai", abertas: 14, fechadas: 16 },
  { mes: "Jun", abertas: 21, fechadas: 17 },
];

export const ncsPorGravidade = [
  { gravidade: "Baixa", total: 8, fill: "var(--severity-low)" },
  { gravidade: "Média", total: 11, fill: "var(--severity-medium)" },
  { gravidade: "Alta", total: 6, fill: "var(--severity-high)" },
  { gravidade: "Crítica", total: 3, fill: "var(--severity-critical)" },
];

export const empresas = [
  { id: "1", nome: "Indústria Nova Aurora — Matriz" },
  { id: "2", nome: "Nova Aurora — Filial SP" },
  { id: "3", nome: "Nova Aurora — Filial RS" },
];

export const menuItems = [
  { label: "Dashboard Executivo", to: "/", icon: "LayoutDashboard" as const },
  { label: "Não Conformidades", to: "/nao-conformidades", icon: "AlertTriangle" as const },
  { label: "Planos de Ação", to: "/planos-de-acao", icon: "ListChecks" as const },
  { label: "Auditorias", to: "/auditorias", icon: "ClipboardCheck" as const },
  { label: "Documentos", to: "/documentos", icon: "FileText" as const },
  { label: "Indicadores e KPIs", to: "/indicadores", icon: "BarChart3" as const },
  { label: "Riscos e Oportunidades", to: "/riscos", icon: "ShieldAlert" as const },
  { label: "Treinamentos", to: "/treinamentos", icon: "GraduationCap" as const },
  { label: "Usuários e Permissões", to: "/usuarios", icon: "Users" as const },
  { label: "Configurações", to: "/configuracoes", icon: "Settings" as const },
];

export function severityClasses(sev: Severity) {
  switch (sev) {
    case "Baixa":
      return "bg-muted text-muted-foreground border-border";
    case "Média":
      return "bg-[color:var(--severity-medium)]/15 text-[color:var(--severity-medium)] border-[color:var(--severity-medium)]/30";
    case "Alta":
      return "bg-[color:var(--severity-high)]/15 text-[color:var(--severity-high)] border-[color:var(--severity-high)]/30";
    case "Crítica":
      return "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30";
  }
}

export function statusClasses(status: NCStatus) {
  switch (status) {
    case "Rascunho":
      return "bg-muted text-muted-foreground border-border";
    case "Em Classificação":
    case "Em Análise":
      return "bg-brand-soft text-brand border-brand/20";
    case "Plano em Execução":
      return "bg-[color:var(--severity-high)]/15 text-[color:var(--severity-high)] border-[color:var(--severity-high)]/30";
    case "Em Avaliação":
      return "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40";
    case "Encerrada":
      return "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30";
    case "Cancelada":
      return "bg-muted text-muted-foreground border-border line-through";
  }
}