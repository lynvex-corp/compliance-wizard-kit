// Fonte de dados mockada do submódulo Suprimentos · Fornecedores.

export type Categoria = "Material" | "Serviço";
export type StatusForn = "Qualificado" | "Em qualificação" | "Desqualificado";

// Lista fechada, em ordem alfabética (regra global do sistema)
export const CRITERIOS_QUALIFICACAO = [
  "Atendimento ao prazo acordado",
  "Atendimento às normas de Saúde e Segurança Ocupacional",
  "Capacidade Produtiva",
  "Certificações de produto ou serviço",
  "Licenças sanitárias e ambientais aplicáveis à atividade",
  "Permissão de acesso às instalações",
  "Regularidade fiscal, trabalhista e previdenciária",
  "Responsabilidade e qualificação técnica",
  "Sistema de gestão",
  "Situação cadastral ativa",
] as const;

// Ordem fixa exigida para a avaliação de fornecedor
export const CRITERIOS_AVALIACAO = [
  "Qualidade do produto ou serviço",
  "Prazo de entrega",
  "Atendimento",
  "Atendimento a requisitos legais",
] as const;

export const PERIODICIDADES = ["Anual", "Semestral", "Trimestral"] as const;
export type Periodicidade = (typeof PERIODICIDADES)[number];

export interface CriterioSel {
  nome: string;
  anexo?: string;
  observacao?: string;
}

export interface Avaliacao {
  ordem: number;
  data: string;
  notas: Record<string, number>;
  media: number;
  mensagem?: string;
}

export interface Fornecedor {
  id: string;
  nomeFantasia: string;
  ramo: string;
  cnpj: string;
  representante: string;
  contato: string;
  email: string;
  fornece: string;
  categoria: Categoria;
  status: StatusForn;
  criterios: CriterioSel[];
  notaMinima: number;
  periodicidade: Periodicidade;
  proximaAvaliacao: string;
  avaliacoes: Avaliacao[];
}

const av = (ordem: number, data: string, n: number[], mensagem?: string): Avaliacao => {
  const notas: Record<string, number> = {};
  CRITERIOS_AVALIACAO.forEach((c, i) => (notas[c] = n[i]));
  return { ordem, data, notas, media: n.reduce((a, b) => a + b, 0) / n.length, mensagem };
};

export const FORNECEDORES_SEED: Fornecedor[] = [
  {
    id: "FOR-001", nomeFantasia: "BASF Brasil", ramo: "Indústria química", cnpj: "48.539.407/0001-18",
    representante: "Marcelo Tavares", contato: "(11) 4002-8922", email: "marcelo.tavares@basf.com.br",
    fornece: "Matéria-prima — resinas e aditivos", categoria: "Material", status: "Qualificado",
    criterios: [
      { nome: "Certificações de produto ou serviço", anexo: "ISO-9001-BASF.pdf" },
      { nome: "Regularidade fiscal, trabalhista e previdenciária", anexo: "CND-2026.pdf" },
      { nome: "Sistema de gestão", observacao: "Sistema certificado, auditoria de manutenção em 03/2026." },
      { nome: "Situação cadastral ativa", anexo: "cartao-cnpj.pdf" },
    ],
    notaMinima: 7, periodicidade: "Anual", proximaAvaliacao: "12/05/2027",
    avaliacoes: [av(1, "12/05/2026", [9, 8, 9, 10], "Agradecemos a parceria e o desempenho consistente.")],
  },
  {
    id: "FOR-002", nomeFantasia: "Química Delta", ramo: "Distribuição de insumos", cnpj: "12.884.510/0001-70",
    representante: "Sandra Queiroz", contato: "(19) 3232-1188", email: "comercial@quimicadelta.com.br",
    fornece: "Matéria-prima — solventes", categoria: "Material", status: "Qualificado",
    criterios: [
      { nome: "Atendimento ao prazo acordado", observacao: "Histórico de entregas dentro do prazo nos últimos 12 meses." },
      { nome: "Licenças sanitárias e ambientais aplicáveis à atividade", anexo: "licenca-ambiental.pdf" },
      { nome: "Situação cadastral ativa", anexo: "cartao-cnpj.pdf" },
    ],
    notaMinima: 7, periodicidade: "Semestral", proximaAvaliacao: "02/12/2026",
    avaliacoes: [
      av(1, "05/12/2025", [8, 7, 8, 8]),
      av(2, "02/06/2026", [7, 6, 8, 8], "Solicitamos atenção ao prazo de entrega no próximo ciclo."),
    ],
  },
  {
    id: "FOR-003", nomeFantasia: "Transportes Rota Sul", ramo: "Logística rodoviária", cnpj: "22.311.908/0001-44",
    representante: "Anderson Melo", contato: "(41) 3355-9080", email: "anderson@rotasul.com.br",
    fornece: "Serviço de transporte de carga", categoria: "Serviço", status: "Em qualificação",
    criterios: [
      { nome: "Permissão de acesso às instalações" },
      { nome: "Responsabilidade e qualificação técnica", anexo: "ANTT-registro.pdf" },
    ],
    notaMinima: 6, periodicidade: "Anual", proximaAvaliacao: "—",
    avaliacoes: [],
  },
  {
    id: "FOR-004", nomeFantasia: "Metalúrgica Alpha", ramo: "Metalurgia", cnpj: "07.442.115/0001-02",
    representante: "Cláudio Bastos", contato: "(11) 2871-4400", email: "claudio@metalalpha.com.br",
    fornece: "Componentes usinados", categoria: "Material", status: "Qualificado",
    criterios: [
      { nome: "Capacidade Produtiva", observacao: "Capacidade de 40 mil peças/mês, verificada em visita técnica." },
      { nome: "Certificações de produto ou serviço", anexo: "ISO-9001-Alpha.pdf" },
      { nome: "Sistema de gestão", anexo: "manual-sgq.pdf" },
      { nome: "Situação cadastral ativa", anexo: "cartao-cnpj.pdf" },
    ],
    notaMinima: 8, periodicidade: "Trimestral", proximaAvaliacao: "20/07/2026",
    avaliacoes: [
      av(1, "20/10/2025", [10, 9, 9, 10]),
      av(2, "20/01/2026", [9, 10, 9, 9]),
      av(3, "20/04/2026", [10, 9, 10, 9], "Fornecedor referência, obrigado pelo excelente desempenho."),
    ],
  },
  {
    id: "FOR-005", nomeFantasia: "EPI Total", ramo: "Equipamentos de proteção", cnpj: "31.209.774/0001-95",
    representante: "Patrícia Nunes", contato: "(85) 3245-7711", email: "patricia@epitotal.com.br",
    fornece: "Material de segurança — EPIs", categoria: "Material", status: "Qualificado",
    criterios: [
      { nome: "Atendimento às normas de Saúde e Segurança Ocupacional", anexo: "CA-vigentes.pdf" },
      { nome: "Situação cadastral ativa", observacao: "Consulta realizada em 02/2026, situação ativa." },
    ],
    notaMinima: 7, periodicidade: "Anual", proximaAvaliacao: "05/03/2026",
    avaliacoes: [av(1, "05/03/2025", [8, 8, 7, 8])],
  },
  {
    id: "FOR-006", nomeFantasia: "Serviços Beta", ramo: "Manutenção industrial", cnpj: "18.665.320/0001-31",
    representante: "Wagner Lopes", contato: "(11) 4114-2266", email: "wagner@servicosbeta.com.br",
    fornece: "Serviço de manutenção preventiva", categoria: "Serviço", status: "Desqualificado",
    criterios: [{ nome: "Regularidade fiscal, trabalhista e previdenciária", observacao: "Certidão trabalhista pendente de regularização." }],
    notaMinima: 7, periodicidade: "Semestral", proximaAvaliacao: "15/07/2026",
    avaliacoes: [
      av(1, "15/07/2025", [5, 6, 5, 4]),
      av(2, "15/01/2026", [4, 5, 5, 4], "Necessária tratativa formal: desempenho abaixo da nota mínima."),
    ],
  },
  {
    id: "FOR-007", nomeFantasia: "TecPack Embalagens", ramo: "Embalagens plásticas", cnpj: "45.117.002/0001-60",
    representante: "Rita Camargo", contato: "(47) 3033-9090", email: "rita@tecpack.com.br",
    fornece: "Material de embalagem primária", categoria: "Material", status: "Qualificado",
    criterios: [
      { nome: "Certificações de produto ou serviço", anexo: "laudo-migracao.pdf" },
      { nome: "Sistema de gestão" },
    ],
    notaMinima: 7, periodicidade: "Anual", proximaAvaliacao: "28/06/2027",
    avaliacoes: [av(1, "28/06/2026", [8, 9, 8, 7])],
  },
  {
    id: "FOR-008", nomeFantasia: "Consultoria Prisma", ramo: "Consultoria em gestão", cnpj: "09.880.443/0001-12",
    representante: "Eduardo Prado", contato: "(21) 2555-8080", email: "eduardo@prisma.com.br",
    fornece: "Serviço de consultoria em sistemas de gestão", categoria: "Serviço", status: "Qualificado",
    criterios: [
      { nome: "Responsabilidade e qualificação técnica", anexo: "curriculos-equipe.pdf" },
      { nome: "Situação cadastral ativa", anexo: "cartao-cnpj.pdf" },
    ],
    notaMinima: 7, periodicidade: "Anual", proximaAvaliacao: "10/02/2026",
    avaliacoes: [av(1, "10/02/2025", [9, 8, 9, 9])],
  },
];

export const ORDINAL = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª"];

export function ordinalAvaliacao(n: number) {
  return `${ORDINAL[n - 1] ?? `${n}ª`} avaliação`;
}

export interface Pendencia { tipo: string; detalhe: string }

export function pendenciasDe(f: Fornecedor): Pendencia[] {
  const p: Pendencia[] = [];
  if (!f.representante || !f.email || !f.contato || !f.cnpj || !f.fornece) {
    p.push({ tipo: "Cadastro incompleto", detalhe: "Há campos obrigatórios do cadastro sem preenchimento." });
  }
  if (f.criterios.length === 0) {
    p.push({ tipo: "Critérios não definidos", detalhe: "Nenhum critério de qualificação foi selecionado." });
  }
  f.criterios
    .filter((c) => !c.anexo && !(c.observacao && c.observacao.trim()))
    .forEach((c) => p.push({ tipo: "Evidência faltante", detalhe: `${c.nome}: sem anexo nem observação justificando a ausência.` }));
  if (f.avaliacoes.length === 0) {
    p.push({ tipo: "Avaliação não realizada", detalhe: "Fornecedor ainda sem a 1ª avaliação registrada." });
  } else if (f.proximaAvaliacao !== "—" && venceu(f.proximaAvaliacao)) {
    p.push({ tipo: "Avaliação em atraso", detalhe: `Reavaliação prevista para ${f.proximaAvaliacao} não realizada.` });
  }
  return p;
}

const HOJE = new Date(2026, 7, 20); // 20/08/2026 — data simulada do protótipo

function parseBr(d: string) {
  const [dia, mes, ano] = d.split("/").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function venceu(dataBr: string) {
  return parseBr(dataBr).getTime() < HOJE.getTime();
}

export function diasPara(dataBr: string) {
  return Math.round((parseBr(dataBr).getTime() - HOJE.getTime()) / 86400000);
}

export function duasAbaixo(f: Fornecedor) {
  const ult = f.avaliacoes.slice(-2);
  return ult.length === 2 && ult.every((a) => a.media < f.notaMinima);
}
