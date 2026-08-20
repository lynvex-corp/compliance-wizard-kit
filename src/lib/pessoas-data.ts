/* Dados compartilhados entre Cargos e Perfis e Gestão de Aprendizagem (protótipo) */

export type SituacaoCompetencia = "Atende" | "Atende parcialmente" | "Não atende";

export type PerfilAcesso =
  | "Diretoria"
  | "Gestor da Qualidade"
  | "Auditor"
  | "Gestor de Área"
  | "Usuário comum";

export const PERFIS_ACESSO: PerfilAcesso[] = [
  "Auditor",
  "Diretoria",
  "Gestor da Qualidade",
  "Gestor de Área",
  "Usuário comum",
];

/** Só estes perfis enxergam o submódulo completo. */
export const PERFIS_AUTORIZADOS: PerfilAcesso[] = ["Diretoria", "Gestor da Qualidade"];

export const SETORES = [
  "Administrativo",
  "Comercial",
  "Manutenção",
  "Produção",
  "Qualidade",
].sort();

export interface CargoPerfil {
  id: string;
  nome: string;
  requisitosTecnicos: string[];
  requisitosDesejaveis: string[];
  treinamentos: string[];
  responsabilidades: string;
  criadoEm: string;
}

export type OrigemAnexo = "Dossiê" | "Ação de competência";
export type TipoItem = "Requisito técnico" | "Treinamento" | "Documento geral";

export interface AnexoPessoa {
  id: string;
  nome: string;
  tipoItem: TipoItem;
  item: string;
  origem: OrigemAnexo;
  data: string;
  autor: string;
}

export interface AcaoCompetencia {
  id: string;
  metodologia: string;
  responsavel: string;
  prazoPrevisto: string;
  dataRealizacao: string | null;
  evidencia: string | null;
  motivo: SituacaoCompetencia;
  abertaEm: string;
}

export interface Pessoa {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  admissao: string;
  cargoId: string;
  setor: string;
  situacao: SituacaoCompetencia;
  anexos: AnexoPessoa[];
  acoes: AcaoCompetencia[];
  atualizadoEm: string;
  cienciaAssinadaEm: string | null;
}

export const CARGOS_SEED: CargoPerfil[] = [
  {
    id: "c-analista-qualidade",
    nome: "Analista da Qualidade",
    requisitosTecnicos: [
      "Ensino superior em Engenharia ou áreas correlatas",
      "Interpretação da ISO 9001:2015",
      "Leitura e análise de indicadores",
    ],
    requisitosDesejaveis: ["Pós-graduação em Gestão da Qualidade", "Inglês intermediário"],
    treinamentos: [
      "Análise de causa raiz",
      "Auditor Interno ISO 9001",
      "ISO 9001:2015 — Interpretação",
    ],
    responsabilidades:
      "Conduzir auditorias internas, tratar não conformidades e reportar indicadores à Diretoria.",
    criadoEm: "12/02/2026",
  },
  {
    id: "c-operador-producao",
    nome: "Operador de Produção",
    requisitosTecnicos: ["Ensino médio completo", "Leitura de instrução de trabalho"],
    requisitosDesejaveis: ["Curso técnico em processos industriais"],
    treinamentos: ["BPF — Boas Práticas", "NR-06 — EPI"],
    responsabilidades:
      "Executar as operações conforme instrução de trabalho e registrar ocorrências no sistema.",
    criadoEm: "12/02/2026",
  },
  {
    id: "c-tecnico-manutencao",
    nome: "Técnico de Manutenção",
    requisitosTecnicos: ["Curso técnico em Eletromecânica", "NR-10 válida"],
    requisitosDesejaveis: ["Experiência com manutenção preditiva"],
    treinamentos: ["BPF — Boas Práticas", "NR-06 — EPI", "NR-10 — Segurança elétrica"],
    responsabilidades: "Executar manutenções planejadas e registrar evidências de intervenção.",
    criadoEm: "20/02/2026",
  },
  {
    id: "c-coordenador-producao",
    nome: "Coordenador de Produção",
    requisitosTecnicos: ["Ensino superior completo", "Gestão de equipes", "Análise de indicadores"],
    requisitosDesejaveis: ["Green Belt"],
    treinamentos: ["Análise de causa raiz", "BPF — Boas Práticas", "ISO 9001:2015 — Interpretação"],
    responsabilidades: "Garantir o cumprimento do plano de produção e das metas da qualidade.",
    criadoEm: "20/02/2026",
  },
  {
    id: "c-auxiliar-administrativo",
    nome: "Auxiliar Administrativo",
    requisitosTecnicos: ["Ensino médio completo", "Pacote Office"],
    requisitosDesejaveis: ["Curso técnico em Administração"],
    treinamentos: ["ISO 9001:2015 — Interpretação"],
    responsabilidades: "Apoiar a rotina administrativa e manter registros organizados.",
    criadoEm: "01/03/2026",
  },
];

const anexo = (
  id: string,
  nome: string,
  tipoItem: TipoItem,
  item: string,
  data: string,
  origem: OrigemAnexo = "Dossiê",
): AnexoPessoa => ({ id, nome, tipoItem, item, origem, data, autor: "Beatriz Souza" });

export const PESSOAS_SEED: Pessoa[] = [
  {
    id: "p1", nome: "Fernanda Lima", matricula: "0012", email: "fernanda.lima@empresa.com.br",
    admissao: "03/02/2020", cargoId: "c-analista-qualidade", setor: "Qualidade", situacao: "Atende",
    anexos: [
      anexo("a1", "diploma-eng-quimica.pdf", "Requisito técnico", "Ensino superior em Engenharia ou áreas correlatas", "12/03/2025"),
      anexo("a2", "prova-iso9001.pdf", "Requisito técnico", "Interpretação da ISO 9001:2015", "12/03/2025"),
      anexo("a3", "relatorio-indicadores.pdf", "Requisito técnico", "Leitura e análise de indicadores", "12/03/2025"),
      anexo("a4", "cert-causa-raiz.pdf", "Treinamento", "Análise de causa raiz", "05/05/2026"),
      anexo("a5", "cert-auditor-interno.pdf", "Treinamento", "Auditor Interno ISO 9001", "10/03/2026"),
      anexo("a6", "cert-iso9001.pdf", "Treinamento", "ISO 9001:2015 — Interpretação", "14/01/2026"),
      anexo("a7", "aso-2026.pdf", "Documento geral", "ASO (atestado de saúde ocupacional)", "10/02/2026"),
    ],
    acoes: [], atualizadoEm: "10/02/2026", cienciaAssinadaEm: "12/03/2026 09:14",
  },
  {
    id: "p2", nome: "Rafael Costa", matricula: "0031", email: "rafael.costa@empresa.com.br",
    admissao: "17/08/2022", cargoId: "c-analista-qualidade", setor: "Qualidade", situacao: "Atende parcialmente",
    anexos: [
      anexo("a8", "diploma-eng-producao.pdf", "Requisito técnico", "Ensino superior em Engenharia ou áreas correlatas", "20/08/2022"),
      anexo("a9", "cert-auditor-interno.pdf", "Treinamento", "Auditor Interno ISO 9001", "10/03/2026"),
    ],
    acoes: [
      {
        id: "ac1", metodologia: "Avaliação teórica sobre interpretação da norma + acompanhamento em auditoria assistida.",
        responsavel: "Fernanda Lima", prazoPrevisto: "30/09/2026", dataRealizacao: null,
        evidencia: null, motivo: "Atende parcialmente", abertaEm: "05/08/2026",
      },
    ],
    atualizadoEm: "05/08/2026", cienciaAssinadaEm: "12/03/2026 10:02",
  },
  {
    id: "p3", nome: "Marcos Vinícius", matricula: "0104", email: "marcos.vinicius@empresa.com.br",
    admissao: "05/01/2024", cargoId: "c-operador-producao", setor: "Produção", situacao: "Não atende",
    anexos: [
      anexo("a10", "certificado-ensino-medio.jpg", "Requisito técnico", "Ensino médio completo", "20/01/2025"),
    ],
    acoes: [
      {
        id: "ac2", metodologia: "Treinamento prático supervisionado no posto de envase com checklist de habilitação.",
        responsavel: "Ana Ribeiro", prazoPrevisto: "15/09/2026", dataRealizacao: null,
        evidencia: null, motivo: "Não atende", abertaEm: "02/08/2026",
      },
    ],
    atualizadoEm: "02/08/2026", cienciaAssinadaEm: null,
  },
  {
    id: "p4", nome: "Diego Almeida", matricula: "0088", email: "diego.almeida@empresa.com.br",
    admissao: "11/11/2021", cargoId: "c-tecnico-manutencao", setor: "Manutenção", situacao: "Atende",
    anexos: [
      anexo("a11", "diploma-tecnico-eletromecanica.pdf", "Requisito técnico", "Curso técnico em Eletromecânica", "11/11/2021"),
      anexo("a12", "nr10-2026.pdf", "Requisito técnico", "NR-10 válida", "03/02/2026"),
      anexo("a13", "cert-bpf.pdf", "Treinamento", "BPF — Boas Práticas", "18/04/2026"),
      anexo("a14", "cert-nr06.pdf", "Treinamento", "NR-06 — EPI", "22/06/2026"),
      anexo("a15", "cert-nr10.pdf", "Treinamento", "NR-10 — Segurança elétrica", "03/02/2026"),
    ],
    acoes: [], atualizadoEm: "22/06/2026", cienciaAssinadaEm: "13/03/2026 08:41",
  },
  {
    id: "p5", nome: "Ana Ribeiro", matricula: "0007", email: "ana.ribeiro@empresa.com.br",
    admissao: "02/05/2018", cargoId: "c-coordenador-producao", setor: "Produção", situacao: "Atende",
    anexos: [
      anexo("a16", "diploma-adm.pdf", "Requisito técnico", "Ensino superior completo", "02/05/2018"),
      anexo("a17", "cert-lideranca.pdf", "Requisito técnico", "Gestão de equipes", "09/09/2025"),
      anexo("a18", "cert-indicadores.pdf", "Requisito técnico", "Análise de indicadores", "09/09/2025"),
      anexo("a19", "cert-causa-raiz.pdf", "Treinamento", "Análise de causa raiz", "06/05/2026"),
      anexo("a20", "cert-bpf.pdf", "Treinamento", "BPF — Boas Práticas", "18/04/2026"),
    ],
    acoes: [], atualizadoEm: "06/05/2026", cienciaAssinadaEm: "12/03/2026 11:20",
  },
  {
    id: "p6", nome: "Beatriz Souza", matricula: "0056", email: "beatriz.souza@empresa.com.br",
    admissao: "14/07/2023", cargoId: "c-auxiliar-administrativo", setor: "Administrativo", situacao: "Atende",
    anexos: [
      anexo("a21", "certificado-ensino-medio.pdf", "Requisito técnico", "Ensino médio completo", "14/07/2023"),
      anexo("a22", "cert-office.pdf", "Requisito técnico", "Pacote Office", "14/07/2023"),
      anexo("a23", "cert-iso9001.pdf", "Treinamento", "ISO 9001:2015 — Interpretação", "14/01/2026"),
    ],
    acoes: [], atualizadoEm: "14/01/2026", cienciaAssinadaEm: "12/03/2026 15:55",
  },
  {
    id: "p7", nome: "Carla Menezes", matricula: "0121", email: "carla.menezes@empresa.com.br",
    admissao: "20/03/2025", cargoId: "c-operador-producao", setor: "Produção", situacao: "Atende",
    anexos: [
      anexo("a24", "certificado-ensino-medio.pdf", "Requisito técnico", "Ensino médio completo", "20/03/2025"),
      anexo("a25", "cert-bpf.pdf", "Treinamento", "BPF — Boas Práticas", "18/04/2026"),
    ],
    acoes: [], atualizadoEm: "18/04/2026", cienciaAssinadaEm: null,
  },
  {
    id: "p8", nome: "Juliana Peixoto", matricula: "0044", email: "juliana.peixoto@empresa.com.br",
    admissao: "09/09/2019", cargoId: "c-analista-qualidade", setor: "Qualidade", situacao: "Atende",
    anexos: [
      anexo("a26", "diploma-eng-alimentos.pdf", "Requisito técnico", "Ensino superior em Engenharia ou áreas correlatas", "09/09/2019"),
      anexo("a27", "prova-iso9001.pdf", "Requisito técnico", "Interpretação da ISO 9001:2015", "14/01/2026"),
      anexo("a28", "painel-indicadores.pdf", "Requisito técnico", "Leitura e análise de indicadores", "14/01/2026"),
      anexo("a29", "cert-causa-raiz.pdf", "Treinamento", "Análise de causa raiz", "06/05/2026"),
      anexo("a30", "cert-auditor-interno.pdf", "Treinamento", "Auditor Interno ISO 9001", "10/03/2026"),
      anexo("a31", "cert-iso9001.pdf", "Treinamento", "ISO 9001:2015 — Interpretação", "14/01/2026"),
    ],
    acoes: [], atualizadoEm: "06/05/2026", cienciaAssinadaEm: "12/03/2026 16:33",
  },
];

/** Itens do cargo que exigem pelo menos um anexo no dossiê da pessoa. */
export function itensObrigatorios(cargo?: CargoPerfil) {
  if (!cargo) return [] as Array<{ tipoItem: TipoItem; item: string }>;
  return [
    ...cargo.requisitosTecnicos.map((item) => ({ tipoItem: "Requisito técnico" as TipoItem, item })),
    ...cargo.treinamentos.map((item) => ({ tipoItem: "Treinamento" as TipoItem, item })),
  ];
}

export interface Pendencia { tipo: "Informação" | "Documento"; texto: string }

export function pendenciasDaPessoa(p: Pessoa, cargo?: CargoPerfil): Pendencia[] {
  const out: Pendencia[] = [];
  if (!p.matricula.trim()) out.push({ tipo: "Informação", texto: "Matrícula não informada" });
  if (!p.email.trim()) out.push({ tipo: "Informação", texto: "E-mail não informado" });
  if (!p.setor.trim()) out.push({ tipo: "Informação", texto: "Setor não informado" });
  if (!cargo) out.push({ tipo: "Informação", texto: "Cargo não associado" });
  for (const o of itensObrigatorios(cargo)) {
    const temAnexo = p.anexos.some((a) => a.tipoItem === o.tipoItem && a.item === o.item);
    if (!temAnexo) out.push({ tipo: "Documento", texto: `Sem anexo: ${o.item}` });
  }
  return out;
}

export const nomesPorCargo = (pessoas: Pessoa[], cargoId: string) =>
  pessoas.filter((p) => p.cargoId === cargoId).map((p) => p.nome).sort();

/** Lista alfabética de todas as pessoas cadastradas (usada em Aprendizagem). */
export const TODAS_AS_PESSOAS = PESSOAS_SEED.map((p) => ({
  nome: p.nome,
  cargo: CARGOS_SEED.find((c) => c.id === p.cargoId)?.nome ?? "",
  setor: p.setor,
})).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

export const NOMES_POR_CARGO_NOME: Record<string, string[]> = CARGOS_SEED.reduce((acc, c) => {
  acc[c.nome] = PESSOAS_SEED.filter((p) => p.cargoId === c.id).map((p) => p.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
  return acc;
}, {} as Record<string, string[]>);
