export type Polaridade = "maior_melhor" | "menor_melhor" | "faixa_ideal";
export type FonteDados = "manual" | "derivado" | "importado";
export type SemaforoKpi = "verde" | "amarelo" | "vermelho" | "novo";

export const origemSigla: Record<FonteDados, string> = {
  manual: "MAN",
  derivado: "DER",
  importado: "IMP",
};

export const fonteLabel: Record<FonteDados, string> = {
  manual: "Manual",
  derivado: "Derivado do sistema",
  importado: "Importado (planilha)",
};

export function kpiCodigo(fonte: FonteDados, seq: number, ano = 2026) {
  return `IND_${origemSigla[fonte]}_${String(seq).padStart(3, "0")}_${ano}`;
}

export interface Medicao {
  id: string;
  periodo: string;
  valor: number;
  responsavel: string;
  lancadoEm: string;
  observacao?: string;
  evidencia?: string;
  analise?: string;
  ncVinculada?: string;
  planoVinculado?: string;
}

export interface TrilhaEvento {
  id: string;
  data: string;
  autor: string;
  acao: string;
  detalhe?: string;
}

export interface Kpi {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  objetivoId: string;
  processo: string;
  unidadeOrg: string;
  responsavelMedicao: string;
  responsavelAnalise: string;
  formula: string;
  unidade: string;
  fonte: FonteDados;
  frequencia: string;
  meta: number;
  faixaMin?: number;
  faixaMax?: number;
  polaridade: Polaridade;
  toleranciaPct: number;
  sugerirNc: boolean;
  ciclosParaDisparo: number;
  arquivado?: boolean;
  medicoes: Medicao[];
  trilha: TrilhaEvento[];
}

export interface ObjetivoQualidade {
  id: string;
  nome: string;
  descricao: string;
  justificativa: string;
  prazo: string;
  responsavel: string;
}

export const periodos6 = ["Fev/26", "Mar/26", "Abr/26", "Mai/26", "Jun/26", "Jul/26"];
export const periodos12 = [
  "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26",
  ...periodos6,
];

export const objetivosQualidade: ObjetivoQualidade[] = [
  {
    id: "obj-1",
    nome: "Ampliar a satisfação do cliente",
    descricao: "Elevar a percepção de valor dos clientes e reduzir reclamações recorrentes.",
    justificativa: "Coerente com o compromisso da Política da Qualidade de encantar o cliente.",
    prazo: "31/12/2026",
    responsavel: "Beatriz Souza",
  },
  {
    id: "obj-2",
    nome: "Reduzir perdas e retrabalho",
    descricao: "Diminuir custos da não qualidade nos processos produtivos.",
    justificativa: "Atende ao princípio de melhoria contínua e eficiência operacional.",
    prazo: "31/12/2026",
    responsavel: "Carlos Menezes",
  },
  {
    id: "obj-3",
    nome: "Qualificar a cadeia de fornecimento",
    descricao: "Garantir fornecedores aderentes aos requisitos de prazo e qualidade.",
    justificativa: "Suporta o requisito de controle de processos providos externamente.",
    prazo: "30/09/2026",
    responsavel: "Renata Lopes",
  },
  {
    id: "obj-4",
    nome: "Fortalecer a competência das pessoas",
    descricao: "Desenvolver o time e reduzir a rotatividade e o absenteísmo.",
    justificativa: "Coerente com o compromisso de desenvolvimento das pessoas na Política.",
    prazo: "31/12/2026",
    responsavel: "Paula Andrade",
  },
  {
    id: "obj-5",
    nome: "Maturar o SGQ e a melhoria contínua",
    descricao: "Tratar não conformidades com eficácia e no prazo definido.",
    justificativa: "Atende diretamente aos requisitos 10.2 e 9.1 da ISO 9001.",
    prazo: "31/12/2026",
    responsavel: "Ana Ribeiro",
  },
];

function mkMedicoes(valores: number[], responsavel: string, analises: Record<number, string> = {}) {
  const base = periodos6.slice(-valores.length);
  return valores.map((v, i) => ({
    id: `med-${i}-${v}-${base[i]}`,
    periodo: base[i],
    valor: v,
    responsavel,
    lancadoEm: `0${(i % 8) + 1}/0${(i % 6) + 2}/2026`,
    observacao: i === valores.length - 1 ? "Dado consolidado pelo sistema." : undefined,
    analise: analises[i],
  }));
}

function trilhaBase(nome: string, autor: string): TrilhaEvento[] {
  return [
    { id: "t1", data: "12/01/2026 09:14", autor, acao: "Indicador criado", detalhe: nome },
    { id: "t2", data: "03/03/2026 15:40", autor, acao: "Meta revisada", detalhe: "Meta anterior preservada no histórico" },
    { id: "t3", data: "05/07/2026 11:02", autor, acao: "Medição lançada", detalhe: "Período Jul/26" },
  ];
}

type Seed = Partial<Kpi> & { nome: string; valores: number[]; analises?: Record<number, string> };

const seeds: Seed[] = [
  { nome: "Satisfação do Cliente", objetivoId: "obj-1", processo: "Comercial", meta: 8.5, unidade: "nota", polaridade: "maior_melhor", formula: "Média das notas da pesquisa de satisfação", valores: [7.9, 8.1, 8.3, 8.6, 8.8, 9.0], responsavelMedicao: "Beatriz Souza", fonte: "manual" },
  { nome: "Eficácia dos Planos de Ação", objetivoId: "obj-5", processo: "Qualidade", meta: 85, unidade: "%", polaridade: "maior_melhor", formula: "(Planos eficazes ÷ planos verificados) × 100", valores: [74, 78, 83, 88, 90, 92], responsavelMedicao: "Ana Ribeiro", fonte: "derivado" },
  { nome: "Cumprimento de Prazo do Fornecedor", objetivoId: "obj-3", processo: "Suprimentos", meta: 90, unidade: "%", polaridade: "maior_melhor", formula: "(Entregas no prazo ÷ total de entregas) × 100", valores: [88, 89, 91, 93, 94, 95], responsavelMedicao: "Renata Lopes", fonte: "manual" },

  { nome: "Taxa de Reclamações", objetivoId: "obj-1", processo: "Atendimento", meta: 2, unidade: "%", polaridade: "menor_melhor", formula: "(Reclamações ÷ pedidos atendidos) × 100", valores: [1.6, 1.8, 1.9, 2.0, 2.1, 2.1], responsavelMedicao: "Marina Duarte", fonte: "manual" },
  { nome: "Horas de Treinamento por Colaborador", objetivoId: "obj-4", processo: "RH & SST", meta: 12, unidade: "h", polaridade: "maior_melhor", formula: "Horas totais ÷ nº de colaboradores", valores: [13, 12.5, 12.2, 11.6, 11.3, 11.1], responsavelMedicao: "Paula Andrade", fonte: "manual" },
  { nome: "Tempo Médio de Tratativa de NC", objetivoId: "obj-5", processo: "Qualidade", meta: 20, unidade: "dias", polaridade: "menor_melhor", formula: "Média de dias entre abertura e encerramento", valores: [17, 18, 19, 20, 21, 21], responsavelMedicao: "Ana Ribeiro", fonte: "derivado" },

  { nome: "Índice de Retrabalho", objetivoId: "obj-2", processo: "Produção", meta: 3, unidade: "%", polaridade: "menor_melhor", formula: "(Peças retrabalhadas ÷ produzidas) × 100", valores: [4.1, 4.5, 5.0, 5.4, 5.9, 6.2], responsavelMedicao: "Carlos Menezes", fonte: "manual", analises: { 5: "Aumento concentrado na linha 2 após troca de matriz; causa raiz em análise via NC_AI_014_2026." } },
  { nome: "NCs Abertas no Mês", objetivoId: "obj-5", processo: "Qualidade", meta: 6, unidade: "un", polaridade: "menor_melhor", formula: "Contagem de NCs abertas no período", valores: [7, 8, 9, 10, 11, 12], responsavelMedicao: "Ana Ribeiro", fonte: "derivado" },
  { nome: "Absenteísmo", objetivoId: "obj-4", processo: "RH & SST", meta: 2.5, unidade: "%", polaridade: "menor_melhor", formula: "(Horas de ausência ÷ horas previstas) × 100", valores: [3.0, 3.2, 3.5, 3.8, 4.0, 4.3], responsavelMedicao: "Paula Andrade", fonte: "manual" },

  { nome: "Produtos Conformes na 1ª Inspeção", objetivoId: "obj-2", processo: "Qualidade", meta: 97, unidade: "%", polaridade: "maior_melhor", formula: "(Aprovados na 1ª inspeção ÷ inspecionados) × 100", valores: [], responsavelMedicao: "Carlos Menezes", fonte: "manual" },
  { nome: "NPS", objetivoId: "obj-1", processo: "Comercial", meta: 60, unidade: "pts", polaridade: "maior_melhor", formula: "% promotores − % detratores", valores: [], responsavelMedicao: "Beatriz Souza", fonte: "importado" },
  { nome: "Economia em Negociação com Fornecedores", objetivoId: "obj-3", processo: "Suprimentos", meta: 50000, unidade: "R$", polaridade: "maior_melhor", formula: "Soma do valor negociado abaixo do orçado", valores: [], responsavelMedicao: "Renata Lopes", fonte: "importado" },
];

export const mockKpis: Kpi[] = seeds.map((s, i) => {
  const fonte = (s.fonte ?? "manual") as FonteDados;
  const analises = s.analises ?? {};
  return {
    id: `kpi-${i + 1}`,
    codigo: kpiCodigo(fonte, i + 1),
    nome: s.nome,
    descricao: s.descricao ?? `Mede ${s.nome.toLowerCase()} no período de apuração definido.`,
    objetivoId: s.objetivoId!,
    processo: s.processo!,
    unidadeOrg: i % 3 === 0 ? "Matriz" : i % 3 === 1 ? "Filial SP" : "Filial RS",
    responsavelMedicao: s.responsavelMedicao!,
    responsavelAnalise: s.responsavelAnalise ?? "Ana Ribeiro",
    formula: s.formula!,
    unidade: s.unidade!,
    fonte,
    frequencia: "Mensal",
    meta: s.meta!,
    polaridade: s.polaridade!,
    toleranciaPct: 10,
    sugerirNc: true,
    ciclosParaDisparo: 2,
    medicoes: mkMedicoes(s.valores, s.responsavelMedicao!, analises),
    trilha: trilhaBase(s.nome, s.responsavelMedicao!),
  };
});

export function ultimoValor(k: Kpi) {
  return k.medicoes.length ? k.medicoes[k.medicoes.length - 1].valor : null;
}

export function semaforo(k: Kpi): SemaforoKpi {
  const v = ultimoValor(k);
  if (v === null) return "novo";
  const tol = (k.meta * k.toleranciaPct) / 100;
  if (k.polaridade === "menor_melhor") {
    if (v <= k.meta) return "verde";
    return v <= k.meta + tol ? "amarelo" : "vermelho";
  }
  if (k.polaridade === "faixa_ideal") {
    const min = k.faixaMin ?? k.meta;
    const max = k.faixaMax ?? k.meta;
    return v >= min && v <= max ? "verde" : "vermelho";
  }
  if (v >= k.meta) return "verde";
  return v >= k.meta - tol ? "amarelo" : "vermelho";
}

export function tendencia(k: Kpi): "up" | "down" | "flat" {
  if (k.medicoes.length < 2) return "flat";
  const a = k.medicoes[k.medicoes.length - 2].valor;
  const b = k.medicoes[k.medicoes.length - 1].valor;
  if (Math.abs(b - a) < 0.001) return "flat";
  return b > a ? "up" : "down";
}

export function tendenciaBoa(k: Kpi) {
  const t = tendencia(k);
  if (t === "flat") return null;
  return k.polaridade === "menor_melhor" ? t === "down" : t === "up";
}

export function ciclosFora(k: Kpi) {
  let n = 0;
  for (let i = k.medicoes.length - 1; i >= 0; i--) {
    const v = k.medicoes[i].valor;
    const fora = k.polaridade === "menor_melhor" ? v > k.meta : v < k.meta;
    if (!fora) break;
    n++;
  }
  return n;
}

export function foraDaMeta(k: Kpi, valor: number) {
  if (k.polaridade === "menor_melhor") return valor > k.meta;
  if (k.polaridade === "faixa_ideal") {
    return valor < (k.faixaMin ?? k.meta) || valor > (k.faixaMax ?? k.meta);
  }
  return valor < k.meta;
}

export function progressoObjetivo(kpis: Kpi[]) {
  const comDados = kpis.filter((k) => ultimoValor(k) !== null);
  if (!comDados.length) return 0;
  const soma = comDados.reduce((acc, k) => {
    const v = ultimoValor(k)!;
    const pct = k.polaridade === "menor_melhor"
      ? (k.meta / Math.max(v, 0.001)) * 100
      : (v / Math.max(k.meta, 0.001)) * 100;
    return acc + Math.min(120, pct);
  }, 0);
  return Math.round(soma / comDados.length);
}

export const semaforoClasses: Record<SemaforoKpi, string> = {
  verde: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  amarelo: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  vermelho: "bg-[color:var(--danger-deep)]/10 text-[color:var(--danger-deep)] border-[color:var(--danger-deep)]/30",
  novo: "bg-muted text-muted-foreground border-border",
};

export const semaforoLabel: Record<SemaforoKpi, string> = {
  verde: "Atingindo a meta",
  amarelo: "Em atenção",
  vermelho: "Fora da meta",
  novo: "Sem histórico",
};

export const semaforoCor: Record<SemaforoKpi, string> = {
  verde: "var(--success)",
  amarelo: "var(--warning)",
  vermelho: "var(--danger-deep)",
  novo: "var(--muted-foreground)",
};

/* ---------------- Biblioteca de indicadores sugeridos ---------------- */

export interface BibliotecaItem {
  nome: string;
  descricao: string;
  formula: string;
  unidade: string;
  frequencia: string;
  polaridade: Polaridade;
}

export const bibliotecaIndicadores: { categoria: string; itens: BibliotecaItem[] }[] = [
  {
    categoria: "Cliente",
    itens: [
      { nome: "Satisfação do cliente", descricao: "Pesquisa periódica junto à carteira ativa.", formula: "Média das notas da pesquisa", unidade: "nota", frequencia: "Trimestral", polaridade: "maior_melhor" },
      { nome: "Reclamações no período", descricao: "Volume de reclamações formais recebidas.", formula: "Contagem de reclamações", unidade: "un", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Tempo médio de resposta", descricao: "Agilidade no retorno ao cliente.", formula: "Soma dos tempos ÷ nº de atendimentos", unidade: "h", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Taxa de recompra", descricao: "Clientes que voltaram a comprar no período.", formula: "(Clientes recorrentes ÷ total) × 100", unidade: "%", frequencia: "Trimestral", polaridade: "maior_melhor" },
      { nome: "NPS", descricao: "Net Promoter Score da base de clientes.", formula: "% promotores − % detratores", unidade: "pts", frequencia: "Semestral", polaridade: "maior_melhor" },
    ],
  },
  {
    categoria: "Produto / Serviço",
    itens: [
      { nome: "Índice de retrabalho", descricao: "Peças ou serviços refeitos.", formula: "(Retrabalhos ÷ total produzido) × 100", unidade: "%", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Produtos conformes na 1ª inspeção", descricao: "Qualidade assegurada na origem.", formula: "(Aprovados 1ª inspeção ÷ inspecionados) × 100", unidade: "%", frequencia: "Mensal", polaridade: "maior_melhor" },
      { nome: "Devoluções", descricao: "Itens devolvidos por não conformidade.", formula: "(Itens devolvidos ÷ entregues) × 100", unidade: "%", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Tempo de ciclo de produção", descricao: "Duração média do ciclo produtivo.", formula: "Média do tempo por ordem de produção", unidade: "h", frequencia: "Mensal", polaridade: "menor_melhor" },
    ],
  },
  {
    categoria: "Fornecedores",
    itens: [
      { nome: "Cumprimento de prazo do fornecedor", descricao: "Pontualidade das entregas externas.", formula: "(Entregas no prazo ÷ total) × 100", unidade: "%", frequencia: "Mensal", polaridade: "maior_melhor" },
      { nome: "Nota média de avaliação", descricao: "Avaliação periódica de fornecedores críticos.", formula: "Média das notas de avaliação", unidade: "nota", frequencia: "Semestral", polaridade: "maior_melhor" },
      { nome: "Ocorrências por fornecedor", descricao: "Não conformidades atribuídas a terceiros.", formula: "Contagem de ocorrências", unidade: "un", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Economia em negociação", descricao: "Ganho obtido frente ao orçado.", formula: "Orçado − negociado", unidade: "R$", frequencia: "Trimestral", polaridade: "maior_melhor" },
    ],
  },
  {
    categoria: "Processos internos",
    itens: [
      { nome: "Eficiência de processos", descricao: "Saídas conformes sobre recursos aplicados.", formula: "(Saídas conformes ÷ entradas) × 100", unidade: "%", frequencia: "Mensal", polaridade: "maior_melhor" },
      { nome: "Produtividade por equipe", descricao: "Volume entregue por equipe no período.", formula: "Entregas ÷ nº de colaboradores", unidade: "un", frequencia: "Mensal", polaridade: "maior_melhor" },
      { nome: "Absenteísmo", descricao: "Ausências não programadas.", formula: "(Horas de ausência ÷ horas previstas) × 100", unidade: "%", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Turnover", descricao: "Rotatividade de pessoas.", formula: "(Desligamentos ÷ headcount médio) × 100", unidade: "%", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Horas de treinamento realizadas", descricao: "Capacitação efetivamente executada.", formula: "Soma das horas de treinamento", unidade: "h", frequencia: "Mensal", polaridade: "maior_melhor" },
    ],
  },
  {
    categoria: "Qualidade do SGQ",
    itens: [
      { nome: "NCs abertas no período", descricao: "Volume de não conformidades registradas.", formula: "Contagem de NCs abertas", unidade: "un", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Tempo médio de tratativa", descricao: "Da abertura ao encerramento da NC.", formula: "Média de dias por NC encerrada", unidade: "dias", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Taxa de eficácia na 1ª verificação", descricao: "Ações aprovadas já na primeira verificação.", formula: "(Aprovadas 1ª verificação ÷ verificadas) × 100", unidade: "%", frequencia: "Mensal", polaridade: "maior_melhor" },
      { nome: "Planos vencidos", descricao: "Planos de ação fora do prazo.", formula: "Contagem de planos vencidos", unidade: "un", frequencia: "Mensal", polaridade: "menor_melhor" },
      { nome: "Taxa de reincidência", descricao: "NCs que voltaram a ocorrer.", formula: "(NCs reincidentes ÷ total) × 100", unidade: "%", frequencia: "Trimestral", polaridade: "menor_melhor" },
    ],
  },
  {
    categoria: "Estratégicos",
    itens: [
      { nome: "Atingimento de objetivos estratégicos", descricao: "Grau de atendimento dos objetivos do SGQ.", formula: "(Objetivos atingidos ÷ total) × 100", unidade: "%", frequencia: "Semestral", polaridade: "maior_melhor" },
      { nome: "Margem de lucro por processo", descricao: "Rentabilidade por processo de negócio.", formula: "(Receita − custo) ÷ receita × 100", unidade: "%", frequencia: "Trimestral", polaridade: "maior_melhor" },
      { nome: "ROI de investimentos em qualidade", descricao: "Retorno dos investimentos no SGQ.", formula: "(Ganho − investimento) ÷ investimento × 100", unidade: "%", frequencia: "Anual", polaridade: "maior_melhor" },
    ],
  },
];

export const processosKpi = ["Comercial", "Atendimento", "Produção", "Qualidade", "Suprimentos", "RH & SST"];
export const unidadesKpi = ["Matriz", "Filial SP", "Filial RS"];
export const frequenciasKpi = ["Diária", "Semanal", "Mensal", "Bimestral", "Trimestral", "Semestral", "Anual"];
export const unidadesMedida = ["%", "R$", "dias", "h", "un", "nota", "pts"];
export const fontesDerivadas = [
  "NCs abertas",
  "Planos vencidos",
  "Satisfação do cliente",
  "Nota do fornecedor",
  "Taxa de eficácia",
  "Outros",
];
export const responsaveisKpi = [
  "Ana Ribeiro", "Beatriz Souza", "Carlos Menezes", "Renata Lopes", "Paula Andrade", "Marina Duarte",
];