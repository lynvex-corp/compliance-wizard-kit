import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Paperclip,
  Sparkles,
  FileText,
  ListChecks,
  ClipboardList,
  FileCheck2,
  Star,
  Download,
  Save,
  Send,
  Link2,
  Info,
  Timer,
  Check,
  X,
  SkipForward,
  Lock,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { JawdaLogo } from "@/components/brand/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useJawda } from "@/lib/jawda-store";
import { cn } from "@/lib/utils";

// ============================================================
// Tipos e metadados
// ============================================================
type Classif = "NA" | "C" | "OPM" | "NCS" | "NCM" | "NCC" | null;

const classifMeta: Record<
  Exclude<Classif, null>,
  { label: string; long: string; badge: string; dot: string }
> = {
  NA: { label: "N.A.", long: "Não aplicável", badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" },
  C: { label: "C", long: "Conforme", badge: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/40", dot: "bg-[color:var(--success)]" },
  OPM: { label: "OPM", long: "Oportunidade de melhoria", badge: "bg-brand-soft text-brand border-brand/30", dot: "bg-brand" },
  NCS: { label: "NCS", long: "NC Simples", badge: "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)] border-[color:var(--warning)]/40", dot: "bg-[color:var(--warning)]" },
  NCM: { label: "NCM", long: "NC Moderada", badge: "bg-[color:var(--severity-high)]/15 text-[color:var(--severity-high)] border-[color:var(--severity-high)]/40", dot: "bg-[color:var(--severity-high)]" },
  NCC: { label: "NCC", long: "NC Crítica", badge: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/40", dot: "bg-[color:var(--severity-critical)]" },
};

interface CheckPergunta {
  id: string;
  texto: string;
  hint: string;
  classif: Classif;
  nota: string;
}
interface CheckItem {
  id: string;
  numero: string;
  titulo: string;
  perguntas: CheckPergunta[];
}
interface CheckSection {
  numero: string;
  titulo: string;
  itens: CheckItem[];
}

const initialChecklist: CheckSection[] = [
  {
    numero: "4",
    titulo: "Contexto da Organização",
    itens: [
      { id: "4.1", numero: "4.1", titulo: "Compreendendo a organização e seu contexto",
        perguntas: [{ id: "4.1.1", texto: "A organização determinou questões externas e internas pertinentes ao propósito?", hint: "registre evidências", classif: "C", nota: "Análise SWOT revisada em Jan/2026, revisão pela direção 12/01/2026." }] },
      { id: "4.3", numero: "4.3", titulo: "Determinando o escopo do SGI",
        perguntas: [
          { id: "4.3.1", texto: "O escopo do SGI está documentado, disponível e considera produtos/serviços?", hint: "exige documento/registro", classif: "OPM", nota: "Escopo publicado no portal, mas não menciona serviços de pós-venda incluídos após 2025." },
          { id: "4.3.2", texto: "As unidades/filiais abrangidas pelo escopo estão claramente definidas?", hint: "exige documento/registro", classif: null, nota: "" },
        ] },
      { id: "4.4", numero: "4.4", titulo: "SGI e seus processos",
        perguntas: [{ id: "4.4.1", texto: "Os processos necessários ao SGI estão determinados e interagem entre si?", hint: "exige documento/registro", classif: "NCS", nota: "Mapa de processos desatualizado — não reflete a nova área de Sustentabilidade." }] },
    ],
  },
  {
    numero: "5",
    titulo: "Liderança",
    itens: [
      { id: "5.1", numero: "5.1", titulo: "Liderança e comprometimento",
        perguntas: [{ id: "5.1.1", texto: "A alta direção demonstra liderança e comprometimento com o SGI?", hint: "registre evidências", classif: "C", nota: "Ata da RD 12/01/2026 com participação integral da diretoria." }] },
      { id: "5.2", numero: "5.2", titulo: "Política",
        perguntas: [{ id: "5.2.1", texto: "A política é apropriada e comunicada?", hint: "exige documento/registro", classif: "C", nota: "Política v3 publicada 2026-01-15." }] },
    ],
  },
  {
    numero: "6",
    titulo: "Planejamento",
    itens: [
      { id: "6.1", numero: "6.1", titulo: "Ações para abordar riscos e oportunidades",
        perguntas: [{ id: "6.1.1", texto: "Riscos e oportunidades foram determinados e tratados?", hint: "exige documento/registro", classif: "NCM", nota: "Matriz de riscos sem revisão desde 2024 em 3 processos." }] },
      { id: "6.2", numero: "6.2", titulo: "Objetivos e planejamento",
        perguntas: [{ id: "6.2.1", texto: "Objetivos são coerentes com a política e mensuráveis?", hint: "registre evidências", classif: null, nota: "" }] },
    ],
  },
  {
    numero: "7",
    titulo: "Apoio",
    itens: [
      { id: "7.1.3", numero: "7.1.3", titulo: "Infraestrutura",
        perguntas: [{ id: "7.1.3.1", texto: "A infraestrutura necessária é determinada, provida e mantida?", hint: "exige documento/registro", classif: "C", nota: "Plano de manutenção preventiva em dia." }] },
      { id: "7.2", numero: "7.2", titulo: "Competência",
        perguntas: [{ id: "7.2.1", texto: "Competências são determinadas e há registros de treinamento?", hint: "exige documento/registro", classif: "OPM", nota: "Falta matriz de competência para novos cargos criados em 2026." }] },
      { id: "7.5", numero: "7.5", titulo: "Informação documentada",
        perguntas: [{ id: "7.5.1", texto: "Existe controle de emissão, análise e distribuição de documentos?", hint: "exige documento/registro", classif: null, nota: "" }] },
    ],
  },
  {
    numero: "8",
    titulo: "Operação",
    itens: [
      { id: "8.1", numero: "8.1", titulo: "Planejamento e controle operacionais",
        perguntas: [{ id: "8.1.1", texto: "As operações estão planejadas, implementadas e controladas?", hint: "registre evidências", classif: null, nota: "" }] },
      { id: "8.4", numero: "8.4", titulo: "Controle de processos providos externamente",
        perguntas: [{ id: "8.4.1", texto: "Fornecedores externos são avaliados e monitorados?", hint: "exige documento/registro", classif: null, nota: "" }] },
    ],
  },
  {
    numero: "9",
    titulo: "Avaliação de Desempenho",
    itens: [
      { id: "9.1", numero: "9.1", titulo: "Monitoramento, medição, análise e avaliação",
        perguntas: [{ id: "9.1.1", texto: "O que precisa ser monitorado/medido está definido?", hint: "registre evidências", classif: null, nota: "" }] },
      { id: "9.2", numero: "9.2", titulo: "Auditoria interna",
        perguntas: [{ id: "9.2.1", texto: "Auditorias internas são realizadas em intervalos planejados?", hint: "exige documento/registro", classif: "NA", nota: "Item auditado por outra equipe." }] },
      { id: "9.3", numero: "9.3", titulo: "Análise crítica pela direção",
        perguntas: [{ id: "9.3.1", texto: "A alta direção realiza análise crítica em intervalos planejados?", hint: "exige documento/registro", classif: null, nota: "" }] },
    ],
  },
  {
    numero: "10",
    titulo: "Melhoria",
    itens: [
      { id: "10.2", numero: "10.2", titulo: "Não conformidade e ação corretiva",
        perguntas: [{ id: "10.2.1", texto: "NCs são tratadas com análise de causa e ação corretiva?", hint: "exige documento/registro", classif: null, nota: "" }] },
      { id: "10.3", numero: "10.3", titulo: "Melhoria contínua",
        perguntas: [{ id: "10.3.1", texto: "A melhoria contínua é promovida a partir dos resultados?", hint: "registre evidências", classif: null, nota: "" }] },
    ],
  },
];

// ============================================================
// Apontamento local (com histórico)
// ============================================================
type ApontStatus =
  | "Aguardando tratativa"
  | "Em tratativa"
  | "Aguardando verificação"
  | "Encerrado eficaz"
  | "Encerrado não eficaz";

interface HistoricoEvent {
  at: string;
  who: string;
  desc: string;
}

interface Apontamento {
  numero: string;
  tipo: "OPM" | "NCS" | "NCM" | "NCC";
  norma: string;
  item: string;
  status: ApontStatus;
  descricao: string;
  criterio: string;
  local: string;
  correcao: string;
  causa: string;
  corretiva: string;
  evidencias: string;
  eficaz: "Sim" | "Não" | "—";
  fechamento?: string;
  ncVinculada?: string;
  paVinculado?: string;
  ncVinculadaId?: string;
  paVinculadoId?: string;
  criadoEm: string;
  historico: HistoricoEvent[];
  auto?: boolean;
  perguntaId?: string;
}

const seedApontamentos: Apontamento[] = [
  {
    numero: "01", tipo: "NCS", norma: "ISO 9001", item: "4.4", status: "Encerrado eficaz",
    descricao: "Mapa de processos desatualizado — não reflete a área de Sustentabilidade criada em 2026.",
    criterio: "Requisito 4.4.1 — os processos do SGI devem ser determinados.",
    local: "Sede — Diretoria de Qualidade",
    correcao: "Republicação imediata do mapa incluindo a nova área.",
    causa: "Falta de gatilho no procedimento de gestão da mudança.",
    corretiva: "Revisar PGQ-014 para exigir atualização do mapa em toda criação de área.",
    evidencias: "Mapa v4 publicado 2026-07-05 e ata de aprovação anexa.",
    eficaz: "Sim", fechamento: "2026-07-08",
    ncVinculada: "NC-2026-014", paVinculado: "PA-2026-031",
    criadoEm: "2026-06-20T10:00:00Z",
    historico: [
      { at: "2026-06-20T10:00:00Z", who: "Marcos Vinícius", desc: "Apontamento criado" },
      { at: "2026-06-22T09:00:00Z", who: "Ana Ribeiro", desc: "Tratativa iniciada" },
      { at: "2026-07-05T14:00:00Z", who: "Ana Ribeiro", desc: "Enviado para verificação" },
      { at: "2026-07-08T11:00:00Z", who: "Marcos Vinícius", desc: "Verificação: eficaz" },
    ],
  },
  { numero: "02", tipo: "OPM", norma: "ISO 9001", item: "4.3", status: "Aguardando tratativa",
    descricao: "Escopo do SGI não menciona serviços de pós-venda incluídos após 2025.",
    criterio: "Requisito 4.3 — escopo deve considerar produtos e serviços.",
    local: "Sede/Escritório", correcao: "", causa: "", corretiva: "", evidencias: "", eficaz: "—",
    criadoEm: "2026-07-10T09:00:00Z",
    historico: [{ at: "2026-07-10T09:00:00Z", who: "Marcos Vinícius", desc: "Apontamento criado" }],
  },
  { numero: "03", tipo: "OPM", norma: "ISO 9001", item: "7.2", status: "Em tratativa",
    descricao: "Ausência de matriz de competência para os novos cargos criados em 2026.",
    criterio: "Requisito 7.2 — determinar competências necessárias.",
    local: "RH — Sede",
    correcao: "Elaborar matriz para cargos criados.",
    causa: "Processo de criação de cargo não aciona RH.",
    corretiva: "", evidencias: "", eficaz: "—",
    criadoEm: "2026-07-11T09:00:00Z",
    historico: [
      { at: "2026-07-11T09:00:00Z", who: "Marcos Vinícius", desc: "Apontamento criado" },
      { at: "2026-07-12T15:00:00Z", who: "Juliana Peixoto", desc: "Tratativa iniciada" },
    ],
  },
  { numero: "04", tipo: "NCM", norma: "ISO 9001", item: "6.1", status: "Em tratativa",
    descricao: "Matriz de riscos sem revisão desde 2024 em 3 processos críticos.",
    criterio: "Requisito 6.1 — riscos e oportunidades devem ser determinados.",
    local: "Engenharia, Comercial e Suprimentos",
    correcao: "Revisar matriz de riscos dos processos apontados.",
    causa: "Sem periodicidade definida no procedimento.",
    corretiva: "Definir revisão semestral obrigatória.",
    evidencias: "", eficaz: "—",
    criadoEm: "2026-07-11T10:00:00Z",
    historico: [
      { at: "2026-07-11T10:00:00Z", who: "Marcos Vinícius", desc: "Apontamento criado" },
      { at: "2026-07-13T09:00:00Z", who: "Carlos Mendes", desc: "Tratativa iniciada" },
    ],
  },
];

function nowIso() {
  return new Date().toISOString();
}
function fmtSaved(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ============================================================
// Página principal (com estado compartilhado)
// ============================================================
export function AuditoriaDetailPage() {
  const params = useParams({ from: "/auditorias/$id" });
  const { auditorias } = useJawda();
  const auditoria = auditorias.find((a) => a.id === params.id) ?? auditorias[0]!;

  const [checklist, setChecklist] = useState<CheckSection[]>(initialChecklist);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>(seedApontamentos);
  const [tab, setTab] = useState("checklist");

  const allPerguntas = useMemo(
    () => checklist.flatMap((s) => s.itens.flatMap((it) => it.perguntas)),
    [checklist],
  );
  const preenchidas = allPerguntas.filter((p) => p.classif).length;
  const progresso = Math.round((preenchidas / allPerguntas.length) * 100);
  const checklistCompleto = progresso === 100;

  function updatePergunta(perguntaId: string, patch: Partial<CheckPergunta>) {
    setChecklist((prev) =>
      prev.map((s) => ({
        ...s,
        itens: s.itens.map((it) => ({
          ...it,
          perguntas: it.perguntas.map((p) => (p.id === perguntaId ? { ...p, ...patch } : p)),
        })),
      })),
    );
  }

  // Classificar → cria apontamento automático se OPM/NCS/NCM/NCC
  function handleClassif(pergunta: CheckPergunta, itemNumero: string, novaClassif: Exclude<Classif, null>) {
    updatePergunta(pergunta.id, { classif: novaClassif });
    const isApont = novaClassif === "OPM" || novaClassif === "NCS" || novaClassif === "NCM" || novaClassif === "NCC";
    if (!isApont) {
      // Se antes era apontamento e agora não é mais, remove o auto
      setApontamentos((prev) => prev.filter((a) => !(a.perguntaId === pergunta.id && a.auto)));
      return;
    }
    setApontamentos((prev) => {
      const existing = prev.find((a) => a.perguntaId === pergunta.id && a.auto);
      if (existing) {
        return prev.map((a) =>
          a === existing ? { ...a, tipo: novaClassif, descricao: pergunta.nota || pergunta.texto } : a,
        );
      }
      const nextNum = String(prev.length + 1).padStart(2, "0");
      const novo: Apontamento = {
        numero: nextNum,
        tipo: novaClassif,
        norma: "ISO 9001",
        item: itemNumero,
        status: "Aguardando tratativa",
        descricao: pergunta.nota || pergunta.texto,
        criterio: `Requisito ${itemNumero} — ${pergunta.texto}`,
        local: "A definir",
        correcao: "", causa: "", corretiva: "", evidencias: "", eficaz: "—",
        criadoEm: nowIso(),
        historico: [{ at: nowIso(), who: "Ana Ribeiro", desc: "Apontamento criado a partir do checklist" }],
        auto: true,
        perguntaId: pergunta.id,
      };
      setTimeout(() => toast.success(`Apontamento Nº ${nextNum} criado`), 0);
      return [...prev, novo];
    });
  }

  function updateApontamento(numero: string, patch: Partial<Apontamento>) {
    setApontamentos((prev) => prev.map((a) => (a.numero === numero ? { ...a, ...patch } : a)));
  }
  function pushHistorico(numero: string, ev: HistoricoEvent) {
    setApontamentos((prev) =>
      prev.map((a) => (a.numero === numero ? { ...a, historico: [...a.historico, ev] } : a)),
    );
  }

  const shared = {
    checklist, allPerguntas, preenchidas, progresso, checklistCompleto,
    updatePergunta, handleClassif, apontamentos, updateApontamento, pushHistorico,
    setApontamentos, auditoria,
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="mx-auto max-w-[1400px] space-y-5">
          <Header auditoria={auditoria} progresso={progresso} onGoTab={setTab} />

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="checklist">
                <ListChecks className="mr-1.5 h-4 w-4" /> Checklist
              </TabsTrigger>
              <TabsTrigger value="apontamentos">
                <ClipboardList className="mr-1.5 h-4 w-4" /> Apontamentos
                <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                  {apontamentos.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="relatorio">
                <FileCheck2 className="mr-1.5 h-4 w-4" /> Relatório
              </TabsTrigger>
            </TabsList>
            <TabsContent value="checklist" className="mt-4">
              <ChecklistTab {...shared} onGoTab={setTab} />
            </TabsContent>
            <TabsContent value="apontamentos" className="mt-4">
              <ApontamentosTab {...shared} />
            </TabsContent>
            <TabsContent value="relatorio" className="mt-4">
              <RelatorioTab {...shared} />
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}

function Header({
  auditoria, progresso, onGoTab,
}: {
  auditoria: ReturnType<typeof useJawda>["auditorias"][number];
  progresso: number;
  onGoTab: (t: string) => void;
}) {
  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-2 h-8 gap-1 px-2 text-muted-foreground">
        <Link to="/auditorias">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{auditoria.codigo}</span>
            <span>·</span>
            <span>{auditoria.tipo}{auditoria.certificadora ? ` — ${auditoria.certificadora}` : ""}</span>
            <span>·</span>
            <span>Líder: {auditoria.auditorLider.nome}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{auditoria.evento}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{auditoria.escopo}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {auditoria.normas.map((n) => (
              <span key={n} className="inline-flex items-center rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="outline" className="border-brand/40 bg-brand-soft text-brand">
            {auditoria.status}
          </Badge>
          <button
            onClick={() => onGoTab("checklist")}
            className="text-[11px] text-muted-foreground hover:text-brand"
            title="Ir para checklist"
          >
            Checklist {progresso}% concluído
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 1 — CHECKLIST (F3)
// ============================================================
interface FileMeta { id: string; name: string; size: number }

function ChecklistTab({
  checklist, allPerguntas, preenchidas, progresso, handleClassif, updatePergunta, onGoTab,
}: {
  checklist: CheckSection[];
  allPerguntas: CheckPergunta[];
  preenchidas: number;
  progresso: number;
  handleClassif: (p: CheckPergunta, itemNumero: string, c: Exclude<Classif, null>) => void;
  updatePergunta: (id: string, patch: Partial<CheckPergunta>) => void;
  onGoTab: (t: string) => void;
}) {
  const flatItems = useMemo(() => checklist.flatMap((s) => s.itens), [checklist]);
  const [selectedItem, setSelectedItem] = useState<string>("4.3");
  const currentIdx = flatItems.findIndex((it) => it.id === selectedItem);
  const selecionado = flatItems[currentIdx] ?? flatItems[0]!;

  function itemDot(it: CheckItem) {
    const classifs = it.perguntas.map((p) => p.classif);
    if (classifs.every((c) => !c)) return { cls: "border border-border bg-transparent", tip: "Não auditado" };
    if (classifs.includes("NCC")) return { cls: classifMeta.NCC.dot, tip: "NC Crítica" };
    if (classifs.includes("NCM")) return { cls: classifMeta.NCM.dot, tip: "NC Moderada" };
    if (classifs.includes("NCS")) return { cls: classifMeta.NCS.dot, tip: "NC Simples" };
    if (classifs.includes("OPM")) return { cls: classifMeta.OPM.dot, tip: "OPM" };
    if (classifs.every((c) => c === "NA")) return { cls: classifMeta.NA.dot, tip: "N.A." };
    return { cls: classifMeta.C.dot, tip: "Conforme" };
  }

  function goPrev() {
    if (currentIdx > 0) setSelectedItem(flatItems[currentIdx - 1]!.id);
  }
  function goNext() {
    if (currentIdx < flatItems.length - 1) setSelectedItem(flatItems[currentIdx + 1]!.id);
  }
  function goNextUnaudited() {
    const next = flatItems.find(
      (it, idx) => idx > currentIdx && it.perguntas.some((p) => !p.classif),
    ) ?? flatItems.find((it) => it.perguntas.some((p) => !p.classif));
    if (next) setSelectedItem(next.id);
    else toast.info("Todos os requisitos já foram auditados");
  }

  return (
    <div className="space-y-4">
      {/* Progresso */}
      <Card className="rounded-xl">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Execução do checklist</div>
            <div className="mt-0.5 text-sm font-medium text-foreground">
              {preenchidas} de {allPerguntas.length} perguntas classificadas — {progresso}% concluído
            </div>
          </div>
          <div className="flex min-w-[240px] items-center gap-3">
            <Progress value={progresso} className="h-2 bg-muted [&>div]:bg-brand" />
            <span className="text-sm font-semibold text-brand">{progresso}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* Árvore */}
        <Card className="rounded-xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Requisitos da norma</CardTitle></CardHeader>
          <CardContent className="p-2">
            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {checklist.map((s) => (
                <div key={s.numero}>
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.numero} · {s.titulo}
                  </div>
                  <ul className="space-y-0.5">
                    {s.itens.map((it) => {
                      const dot = itemDot(it);
                      const active = selectedItem === it.id;
                      return (
                        <li key={it.id}>
                          <button
                            onClick={() => setSelectedItem(it.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                              active ? "bg-brand-soft text-brand" : "text-foreground hover:bg-muted/60",
                            )}
                          >
                            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot.cls)} title={dot.tip} />
                            <span className="font-mono text-[11px]">{it.numero}</span>
                            <span className="truncate">{it.titulo}</span>
                            {active && <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execução */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{selecionado.numero}</span>
            <h2 className="text-lg font-semibold text-foreground">{selecionado.titulo}</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={goPrev} disabled={currentIdx === 0}>
                <ChevronLeft className="h-3.5 w-3.5" /> Anterior
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1" onClick={goNext} disabled={currentIdx >= flatItems.length - 1}>
                Próximo <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-brand hover:bg-brand-soft" onClick={goNextUnaudited}>
                <SkipForward className="h-3.5 w-3.5" /> Próximo não auditado
              </Button>
            </div>
          </div>

          {selecionado.perguntas.map((p) => (
            <PerguntaCard
              key={p.id}
              pergunta={p}
              itemNumero={selecionado.numero}
              onClassif={handleClassif}
              onUpdate={updatePergunta}
              onGoApontamentos={() => onGoTab("apontamentos")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PerguntaCard({
  pergunta, itemNumero, onClassif, onUpdate, onGoApontamentos,
}: {
  pergunta: CheckPergunta;
  itemNumero: string;
  onClassif: (p: CheckPergunta, itemNumero: string, c: Exclude<Classif, null>) => void;
  onUpdate: (id: string, patch: Partial<CheckPergunta>) => void;
  onGoApontamentos: () => void;
}) {
  const [localNota, setLocalNota] = useState(pergunta.nota);
  const [savedAt, setSavedAt] = useState<string | null>(pergunta.nota ? nowIso() : null);
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [iaLoading, setIaLoading] = useState(false);
  const classif = pergunta.classif;
  const isNC = classif === "NCS" || classif === "NCM" || classif === "NCC";
  const exigeDoc = pergunta.hint === "exige documento/registro";
  const alerta = classif === "C" && exigeDoc && !localNota.trim() && files.length === 0;

  useEffect(() => { setLocalNota(pergunta.nota); }, [pergunta.id, pergunta.nota]);

  function commitNota() {
    if (localNota !== pergunta.nota) {
      onUpdate(pergunta.id, { nota: localNota });
      setSavedAt(nowIso());
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files ?? []);
    if (!fs.length) return;
    const metas: FileMeta[] = fs.map((f) => ({
      id: `${Date.now()}-${f.name}`, name: f.name, size: f.size,
    }));
    setFiles((prev) => [...prev, ...metas]);
    toast.success(`${metas.length} evidência(s) anexada(s)`);
    e.target.value = "";
  }

  function sugerirIA() {
    setIaLoading(true);
    setTimeout(() => {
      const rascunho = localNota.trim() || "conforme observado";
      const texto = `Evidenciado o Manual de Gestão Integrada ver. 01 de 01/09/2025, item ${itemNumero}. ${rascunho.charAt(0).toUpperCase()}${rascunho.slice(1)}. Registro consultado em ${new Date().toLocaleDateString("pt-BR")}, com amostragem representativa dos processos abrangidos.`;
      setLocalNota(texto);
      onUpdate(pergunta.id, { nota: texto });
      setSavedAt(nowIso());
      setIaLoading(false);
      toast.success("Sugestão de evidência aplicada");
    }, 1200);
  }

  return (
    <Card className="rounded-xl">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-2">
          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium leading-relaxed text-foreground">{pergunta.texto}</p>
        </div>

        {/* Classificação */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(classifMeta) as Array<Exclude<Classif, null>>).map((k) => {
            const m = classifMeta[k];
            const active = classif === k;
            return (
              <button
                key={k}
                onClick={() => onClassif(pergunta, itemNumero, k)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                  active
                    ? { NA: "border-muted-foreground/40 bg-muted text-foreground",
                        C: "border-transparent bg-[color:var(--success)] text-white",
                        OPM: "border-transparent bg-brand text-white",
                        NCS: "border-transparent bg-[color:var(--warning)] text-white",
                        NCM: "border-transparent bg-[color:var(--severity-high)] text-white",
                        NCC: "border-transparent bg-[color:var(--severity-critical)] text-white" }[k]
                    : cn("bg-transparent hover:bg-muted/60",
                        { NA: "border-border text-muted-foreground",
                          C: "border-[color:var(--success)]/40 text-[color:var(--success)]",
                          OPM: "border-brand/40 text-brand",
                          NCS: "border-[color:var(--warning)]/40 text-[color:var(--severity-high)]",
                          NCM: "border-[color:var(--severity-high)]/40 text-[color:var(--severity-high)]",
                          NCC: "border-[color:var(--severity-critical)]/40 text-[color:var(--severity-critical)]" }[k]),
                )}
                title={m.long}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Auditor IA alert */}
        {alerta && (
          <div className="flex items-start gap-2 rounded-lg border border-[color:var(--warning)]/50 bg-[color:var(--warning)]/10 p-3 text-xs">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--severity-high)]" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground">Auditor IA</div>
              <p className="mt-0.5 text-muted-foreground">
                Atenção: você marcou <strong>Conforme</strong>, mas não registrou evidência documental e este requisito exige informação documentada. Recomendo registrar amostra ou reclassificar.
              </p>
            </div>
          </div>
        )}

        {/* Anotações */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Anotações e evidências</label>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--success)]">
                  <Check className="h-3 w-3" /> salvo às {fmtSaved(savedAt)}
                </span>
              )}
              <span className={cn("text-[11px] font-medium", exigeDoc ? "text-[color:var(--severity-critical)]" : "text-muted-foreground")}>
                {pergunta.hint}
              </span>
            </div>
          </div>
          <Textarea
            value={localNota}
            onChange={(e) => setLocalNota(e.target.value)}
            onBlur={commitNota}
            placeholder="Registre a evidência observada, documento verificado, entrevistado…"
            className="min-h-[76px] resize-none"
          />

          {/* Evidências */}
          {files.length > 0 && (
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-soft text-brand">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{f.name}</div>
                    <div className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer">
              <input type="file" multiple className="hidden" onChange={handleFile} />
              <span className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted/60">
                <Paperclip className="h-3.5 w-3.5" /> Anexar evidência
              </span>
            </label>
            <Button
              variant="ghost" size="sm"
              className="h-8 gap-1 text-brand hover:bg-brand-soft"
              onClick={sugerirIA}
              disabled={iaLoading}
            >
              {iaLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {iaLoading ? "IA analisando..." : "Sugerir texto de evidência com IA"}
            </Button>
          </div>
        </div>

        {isNC && (
          <div className="flex items-start gap-2 rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3 text-xs text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--severity-high)]" />
            <div className="min-w-0">
              <div className="font-medium">
                Apontamento gerado automaticamente — abra a aba{" "}
                <button className="underline underline-offset-2" onClick={onGoApontamentos}>Apontamentos</button>.
              </div>
              <div className="text-muted-foreground">
                Tipo: <span className="font-semibold">{classifMeta[classif!].long}</span> · Item {itemNumero}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// TAB 2 — APONTAMENTOS (F4)
// ============================================================
function ApontamentosTab({
  apontamentos, updateApontamento, pushHistorico, auditoria,
}: {
  apontamentos: Apontamento[];
  updateApontamento: (numero: string, patch: Partial<Apontamento>) => void;
  pushHistorico: (numero: string, ev: HistoricoEvent) => void;
  auditoria: ReturnType<typeof useJawda>["auditorias"][number];
}) {
  const counts = useMemo(() => {
    const c = { OPM: 0, NCS: 0, NCM: 0, NCC: 0 };
    for (const a of apontamentos) c[a.tipo] += 1;
    return c;
  }, [apontamentos]);

  // Contador global de prazo (10 dias) baseado no apontamento mais recente
  const primeiro = apontamentos[0];
  const dias10 = primeiro ? Math.max(0, Math.ceil((Date.parse(primeiro.criadoEm) + 10 * 86400000 - Date.now()) / 86400000)) : 10;
  const pct10 = Math.max(0, Math.min(100, (dias10 / 10) * 100));
  const dias45 = primeiro ? Math.max(0, Math.ceil((Date.parse(primeiro.criadoEm) + 45 * 86400000 - Date.now()) / 86400000)) : 45;
  const cor10 = dias10 <= 2 ? "bg-[color:var(--severity-critical)]" : dias10 <= 5 ? "bg-[color:var(--warning)]" : "bg-brand";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="rounded-xl">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Apontamentos desta auditoria</div>
            <div className="flex flex-wrap gap-2">
              {(["OPM", "NCS", "NCM", "NCC"] as const).map((k) => (
                <span key={k} className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold", classifMeta[k].badge)}>
                  {classifMeta[k].label}
                  <span className="rounded bg-background/60 px-1 text-[11px]">{counts[k]}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className={cn("rounded-xl", dias10 <= 5 ? "border-[color:var(--warning)]/50 bg-[color:var(--warning)]/10" : "border-brand/30 bg-brand-soft/50")}>
          <CardContent className="flex items-center gap-3 p-4">
            <Timer className={cn("h-5 w-5 shrink-0", dias10 <= 2 ? "text-[color:var(--severity-critical)]" : "text-[color:var(--severity-high)]")} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                Plano em até 10 dias · Evidências em até 45 dias
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={pct10} className={cn("h-1.5 bg-muted", "[&>div]:" + cor10)} />
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  {dias10} de 10 dias · {dias45} de 45 dias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {apontamentos.map((a) => (
          <ApontamentoCard
            key={a.numero}
            a={a}
            onUpdate={updateApontamento}
            onHist={pushHistorico}
            auditoriaCodigo={auditoria.codigo}
          />
        ))}
      </div>
    </div>
  );
}

const STATUS_ORDER: ApontStatus[] = [
  "Aguardando tratativa", "Em tratativa", "Aguardando verificação", "Encerrado eficaz",
];

function ApontamentoCard({
  a, onUpdate, onHist, auditoriaCodigo,
}: {
  a: Apontamento;
  onUpdate: (numero: string, patch: Partial<Apontamento>) => void;
  onHist: (numero: string, ev: HistoricoEvent) => void;
  auditoriaCodigo: string;
}) {
  const [open, setOpen] = useState(a.status !== "Encerrado eficaz");
  const [correcao, setCorrecao] = useState(a.correcao);
  const [causa, setCausa] = useState(a.causa);
  const [corretiva, setCorretiva] = useState(a.corretiva);
  const [evidencias, setEvidencias] = useState(a.evidencias);
  const [porqueOpen, setPorqueOpen] = useState(false);
  const [verifOpen, setVerifOpen] = useState(false);
  const { addNC, addPlano } = useJawda();

  useEffect(() => {
    setCorrecao(a.correcao); setCausa(a.causa);
    setCorretiva(a.corretiva); setEvidencias(a.evidencias);
  }, [a.numero, a.correcao, a.causa, a.corretiva, a.evidencias]);

  const camposCompletos = correcao.trim() && causa.trim() && corretiva.trim() && evidencias.trim();
  const isEncerrado = a.status === "Encerrado eficaz" || a.status === "Encerrado não eficaz";

  const statusCls: Record<ApontStatus, string> = {
    "Aguardando tratativa": "border-border bg-muted text-muted-foreground",
    "Em tratativa": "border-brand/30 bg-brand-soft text-brand",
    "Aguardando verificação": "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]",
    "Encerrado eficaz": "border-[color:var(--success)]/40 bg-[color:var(--success)]/15 text-[color:var(--success)]",
    "Encerrado não eficaz": "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]",
  };

  function saveField(campo: "correcao" | "causa" | "corretiva" | "evidencias", val: string) {
    if (a[campo] === val) return;
    onUpdate(a.numero, { [campo]: val });
    // Move para "Em tratativa" no primeiro preenchimento
    if (a.status === "Aguardando tratativa" && val.trim()) {
      onUpdate(a.numero, { status: "Em tratativa" });
      onHist(a.numero, { at: nowIso(), who: "Ana Ribeiro", desc: "Tratativa iniciada" });
    }
  }

  function enviarVerificacao() {
    onUpdate(a.numero, {
      status: "Aguardando verificação",
      correcao, causa, corretiva, evidencias,
    });
    onHist(a.numero, { at: nowIso(), who: "Ana Ribeiro", desc: "Enviado para verificação" });
    toast.success(`Apontamento Nº ${a.numero} enviado para verificação`);
  }

  function verificar(eficaz: boolean, justificativa: string) {
    if (eficaz) {
      onUpdate(a.numero, {
        status: "Encerrado eficaz", eficaz: "Sim",
        fechamento: new Date().toISOString().slice(0, 10),
      });
      onHist(a.numero, { at: nowIso(), who: "Marcos Vinícius", desc: "Verificação: tratativa eficaz" });
      toast.success(`Apontamento Nº ${a.numero} encerrado como eficaz`);
    } else {
      onUpdate(a.numero, { status: "Em tratativa", eficaz: "Não" });
      onHist(a.numero, {
        at: nowIso(), who: "Marcos Vinícius",
        desc: `Verificação reprovada: ${justificativa || "sem justificativa"}`,
      });
      toast.error(`Apontamento Nº ${a.numero} reaberto — tratativa não eficaz`);
    }
    setVerifOpen(false);
  }

  function gerarNC() {
    const nc = addNC({
      descricao: a.descricao,
      origem: "Auditoria Interna",
      gravidade: a.tipo === "NCC" ? "Crítica" : a.tipo === "NCM" ? "Alta" : a.tipo === "NCS" ? "Média" : "Baixa",
      local: a.local,
    });
    onUpdate(a.numero, { ncVinculada: nc.codigo, ncVinculadaId: nc.id });
    onHist(a.numero, { at: nowIso(), who: "Ana Ribeiro", desc: `NC ${nc.codigo} gerada (origem ${auditoriaCodigo})` });
  }
  function gerarPA() {
    const p = addPlano({
      descricao: `Tratativa do apontamento Nº ${a.numero} — ${a.descricao}`,
      origemTipo: "Auditoria Interna",
      vinculadoCodigo: auditoriaCodigo,
      vinculadoLink: `/auditorias/${auditoriaCodigo}`,
    });
    onUpdate(a.numero, { paVinculado: p.codigo, paVinculadoId: p.id });
    onHist(a.numero, { at: nowIso(), who: "Ana Ribeiro", desc: `Plano ${p.codigo} criado (origem ${auditoriaCodigo})` });
  }

  return (
    <Card className="rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-muted/40"
      >
        <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">Nº {a.numero}</span>
        <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold", classifMeta[a.tipo].badge)}>
          {classifMeta[a.tipo].long}
        </span>
        <span className="text-xs text-muted-foreground">
          {a.norma} · Item <span className="font-mono">{a.item}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{a.descricao}</span>
        <Badge variant="outline" className={cn("border text-[11px]", statusCls[a.status])}>{a.status}</Badge>
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <>
          <Separator />
          <CardContent className="space-y-4 p-4">
            {/* Status pipeline */}
            <StatusPipeline status={a.status} />

            {/* Campos editáveis */}
            <div className="grid gap-3 md:grid-cols-2">
              <EditableField
                label="Ação de correção" who="Auditado" value={correcao}
                onChange={setCorrecao} onBlur={() => saveField("correcao", correcao)}
                disabled={isEncerrado || a.status === "Aguardando verificação"}
              />
              <EditableField
                label="Análise de causa" who="Auditado" value={causa}
                onChange={setCausa} onBlur={() => saveField("causa", causa)}
                disabled={isEncerrado || a.status === "Aguardando verificação"}
                extra={
                  <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[11px] text-brand hover:bg-brand-soft" onClick={() => setPorqueOpen(true)}>
                    <Sparkles className="h-3 w-3" /> Analisar causa com IA
                  </Button>
                }
              />
              <EditableField
                label="Ação corretiva" who="Auditado" value={corretiva}
                onChange={setCorretiva} onBlur={() => saveField("corretiva", corretiva)}
                disabled={isEncerrado || a.status === "Aguardando verificação"}
              />
              <EditableField
                label="Evidências implementadas" who="Auditado" value={evidencias}
                onChange={setEvidencias} onBlur={() => saveField("evidencias", evidencias)}
                disabled={isEncerrado || a.status === "Aguardando verificação"}
              />
            </div>

            {/* Ações auditado / auditor */}
            <div className="flex flex-wrap items-center gap-2">
              {a.status === "Em tratativa" && (
                <Button
                  size="sm" className="bg-brand hover:bg-brand/90"
                  disabled={!camposCompletos}
                  onClick={enviarVerificacao}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Enviar para verificação
                </Button>
              )}
              {a.status === "Aguardando verificação" && (
                <Button size="sm" variant="outline" onClick={() => setVerifOpen(true)}>
                  <FileCheck2 className="mr-1.5 h-3.5 w-3.5" /> Verificar tratativa
                </Button>
              )}
              {!camposCompletos && a.status === "Em tratativa" && (
                <span className="text-[11px] text-muted-foreground">
                  Preencha todos os campos para habilitar o envio.
                </span>
              )}
            </div>

            {/* Histórico */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Histórico
              </div>
              <ol className="space-y-1.5">
                {a.historico.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="text-muted-foreground">
                      {new Date(h.at).toLocaleString("pt-BR")}
                    </span>
                    <span className="font-medium">{h.who}</span>
                    <span>—</span>
                    <span className={cn(h.desc.startsWith("Verificação reprovada") && "text-[color:var(--severity-critical)] font-medium")}>
                      {h.desc}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Vínculos */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {a.ncVinculada ? (
                a.ncVinculadaId ? (
                  <Link to="/nao-conformidades/$id" params={{ id: a.ncVinculadaId }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10">
                    <Link2 className="h-3.5 w-3.5" /> {a.ncVinculada}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                    <Link2 className="h-3.5 w-3.5" /> {a.ncVinculada}
                  </span>
                )
              ) : (
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={gerarNC}>
                  <FileText className="h-3.5 w-3.5" /> Gerar Não Conformidade
                </Button>
              )}
              {a.paVinculado ? (
                a.paVinculadoId ? (
                  <Link to="/planos-de-acao/$id" params={{ id: a.paVinculadoId }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10">
                    <Link2 className="h-3.5 w-3.5" /> {a.paVinculado}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                    <Link2 className="h-3.5 w-3.5" /> {a.paVinculado}
                  </span>
                )
              ) : (
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={gerarPA}>
                  <ClipboardList className="h-3.5 w-3.5" /> Gerar Plano de Ação
                </Button>
              )}
              {a.fechamento && (
                <span className="ml-auto text-[11px] text-muted-foreground">
                  Fechado em {new Date(a.fechamento).toLocaleDateString("pt-BR")} · Eficaz:{" "}
                  <span className="font-semibold text-foreground">{a.eficaz}</span>
                </span>
              )}
            </div>
          </CardContent>
        </>
      )}

      <VerificacaoDialog
        open={verifOpen}
        onOpenChange={setVerifOpen}
        onVerificar={verificar}
        numero={a.numero}
      />
      <CincoPorquesDialog
        open={porqueOpen}
        onOpenChange={setPorqueOpen}
        problema={a.descricao}
        onAplicar={(causaConsolidada) => {
          setCausa(causaConsolidada);
          saveField("causa", causaConsolidada);
          setPorqueOpen(false);
          toast.success("Causa raiz aplicada");
        }}
        onGerarPlano={() => {
          setPorqueOpen(false);
          gerarPA();
        }}
      />
    </Card>
  );
}

function StatusPipeline({ status }: { status: ApontStatus }) {
  const currentIdx = status === "Encerrado não eficaz"
    ? STATUS_ORDER.indexOf("Em tratativa")
    : STATUS_ORDER.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {STATUS_ORDER.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                done && "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
                active && "border-brand bg-brand text-white",
                !done && !active && "border-border bg-muted text-muted-foreground",
              )}
            >
              {done && <Check className="h-2.5 w-2.5" />}
              {s}
            </span>
            {i < STATUS_ORDER.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </li>
        );
      })}
    </ol>
  );
}

function EditableField({
  label, who, value, onChange, onBlur, disabled, extra,
}: {
  label: string; who: string; value: string;
  onChange: (v: string) => void; onBlur: () => void;
  disabled?: boolean; extra?: React.ReactNode;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(value ? nowIso() : null);
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">{label}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{who}</span>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && !disabled && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--success)]">
              <Check className="h-3 w-3" /> salvo às {fmtSaved(savedAt)}
            </span>
          )}
          {extra}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { onBlur(); if (value) setSavedAt(nowIso()); }}
        disabled={disabled}
        placeholder="—"
        className="min-h-[64px] resize-none text-sm"
      />
    </div>
  );
}

function VerificacaoDialog({
  open, onOpenChange, onVerificar, numero,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onVerificar: (eficaz: boolean, just: string) => void;
  numero: string;
}) {
  const [eficaz, setEficaz] = useState<"Sim" | "Não" | null>(null);
  const [just, setJust] = useState("");
  useEffect(() => { if (!open) { setEficaz(null); setJust(""); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar tratativa — Nº {numero}</DialogTitle>
          <DialogDescription>Registre o resultado da verificação da eficácia.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEficaz("Sim")}
              className={cn("rounded-lg border p-3 text-left", eficaz === "Sim" ? "border-[color:var(--success)] bg-[color:var(--success)]/10" : "border-border hover:border-[color:var(--success)]/50")}
            >
              <div className="flex items-center gap-2 text-[color:var(--success)]">
                <Check className="h-4 w-4" /><span className="font-semibold text-sm">Eficaz</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Encerra o apontamento.</p>
            </button>
            <button
              onClick={() => setEficaz("Não")}
              className={cn("rounded-lg border p-3 text-left", eficaz === "Não" ? "border-[color:var(--severity-critical)] bg-[color:var(--severity-critical)]/10" : "border-border hover:border-[color:var(--severity-critical)]/50")}
            >
              <div className="flex items-center gap-2 text-[color:var(--severity-critical)]">
                <X className="h-4 w-4" /><span className="font-semibold text-sm">Não eficaz</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Reabre para nova tratativa.</p>
            </button>
          </div>
          {eficaz === "Não" && (
            <Textarea
              value={just} onChange={(e) => setJust(e.target.value)}
              placeholder="Justifique por que a tratativa não foi considerada eficaz…"
              className="min-h-[80px]"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            disabled={!eficaz || (eficaz === "Não" && !just.trim())}
            className="bg-brand hover:bg-brand/90"
            onClick={() => onVerificar(eficaz === "Sim", just)}
          >
            Confirmar verificação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 5 Porquês IA (F4)
// ============================================================
const CATEGORIAS_ISHIKAWA = ["Método", "Máquina", "Mão de obra", "Material", "Medição", "Meio ambiente"] as const;

function CincoPorquesDialog({
  open, onOpenChange, problema, onAplicar, onGerarPlano,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  problema: string;
  onAplicar: (causa: string) => void;
  onGerarPlano: () => void;
}) {
  const [respostas, setRespostas] = useState<string[]>(["", "", "", "", ""]);
  const [step, setStep] = useState(0);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [gerando, setGerando] = useState(false);
  const [causaFinal, setCausaFinal] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS_ISHIKAWA)[number] | null>(null);

  useEffect(() => {
    if (!open) {
      setRespostas(["", "", "", "", ""]); setStep(0);
      setSugestoes([]); setCausaFinal(null); setCategoria(null);
    } else {
      // Simula sugestões iniciais
      setSugestoes([
        "Falta de procedimento formal cobrindo essa etapa.",
        "Treinamento da equipe não abordou o cenário observado.",
        "Gatilho de verificação não estava programado.",
        "Documento de referência estava desatualizado.",
        "Ausência de responsável designado para monitorar.",
      ]);
    }
  }, [open]);

  const perguntas = useMemo(() => {
    const base = problema.length > 80 ? problema.slice(0, 80) + "…" : problema;
    return [
      `Por que ocorreu: "${base}"?`,
      "Por que isso aconteceu?",
      "Por que essa causa existiu?",
      "Por que essa condição estava presente?",
      "Por que esse fator não foi tratado antes?",
    ];
  }, [problema]);

  function proximo(resp?: string) {
    const val = (resp ?? respostas[step]!).trim();
    if (!val) return;
    const novas = [...respostas];
    novas[step] = val;
    setRespostas(novas);
    if (step < 4) setStep(step + 1);
  }

  function consolidar() {
    setGerando(true);
    setTimeout(() => {
      const ultimo = respostas[4] || respostas[3] || respostas[2] || respostas[1] || respostas[0] || "";
      const causa = `Causa raiz consolidada: ${ultimo}`;
      setCausaFinal(causa);
      // Categoriza baseado em palavras-chave
      const s = ultimo.toLowerCase();
      let cat: typeof categoria = "Método";
      if (s.includes("máquin") || s.includes("equipa")) cat = "Máquina";
      else if (s.includes("treinam") || s.includes("pessoa") || s.includes("operador")) cat = "Mão de obra";
      else if (s.includes("material") || s.includes("insumo")) cat = "Material";
      else if (s.includes("mediç") || s.includes("indicador") || s.includes("kpi")) cat = "Medição";
      else if (s.includes("ambient") || s.includes("temperatura") || s.includes("clima")) cat = "Meio ambiente";
      setCategoria(cat);
      setGerando(false);
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" /> Analisar causa raiz com IA — 5 Porquês
          </DialogTitle>
          <DialogDescription>
            Responda ou aceite a sugestão da IA. Ela encadeará o próximo porquê.
          </DialogDescription>
        </DialogHeader>

        {!causaFinal ? (
          <div className="space-y-4">
            {/* Timeline */}
            <ol className="space-y-2">
              {perguntas.map((q, i) => {
                const done = respostas[i] && i < step;
                const active = i === step;
                if (!done && !active) return null;
                return (
                  <li key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                        done ? "bg-[color:var(--success)] text-white" : "bg-brand text-white")}>
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Porquê {i + 1}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{q}</p>
                    {done ? (
                      <p className="mt-2 rounded bg-muted/40 p-2 text-sm text-foreground">{respostas[i]}</p>
                    ) : (
                      <>
                        <Textarea
                          value={respostas[i] ?? ""}
                          onChange={(e) => {
                            const n = [...respostas]; n[i] = e.target.value; setRespostas(n);
                          }}
                          placeholder="Responda ou escolha uma sugestão da IA…"
                          className="mt-2 min-h-[60px] text-sm"
                        />
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {sugestoes.slice(i, i + 2).map((s, si) => (
                            <button
                              key={si}
                              onClick={() => proximo(s)}
                              className="rounded-full border border-brand/30 bg-brand-soft px-2 py-1 text-[11px] text-brand hover:bg-brand/10"
                            >
                              <Sparkles className="mr-1 inline h-3 w-3" /> {s}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Etapa {step + 1} de 5</span>
              <div className="flex gap-2">
                {step < 4 ? (
                  <Button size="sm" className="bg-brand hover:bg-brand/90" onClick={() => proximo()} disabled={!respostas[step]?.trim()}>
                    Próximo porquê <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" className="bg-brand hover:bg-brand/90" onClick={() => { proximo(); consolidar(); }} disabled={!respostas[step]?.trim() || gerando}>
                    {gerando ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
                    Consolidar causa raiz
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-brand/40 bg-brand-soft p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">Causa raiz consolidada</div>
              <p className="mt-1 text-sm text-foreground">{causaFinal}</p>
            </div>
            {categoria && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Categoria Ishikawa:</span>
                <Badge variant="outline" className="border-brand/40 bg-brand-soft text-brand">{categoria}</Badge>
              </div>
            )}
            <DialogFooter className="!justify-between !pt-0">
              <Button variant="outline" onClick={onGerarPlano}>
                <ClipboardList className="mr-1.5 h-4 w-4" /> Gerar plano a partir desta causa
              </Button>
              <Button className="bg-brand hover:bg-brand/90" onClick={() => onAplicar(causaFinal)}>
                <Check className="mr-1.5 h-4 w-4" /> Aplicar causa raiz
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// TAB 3 — RELATÓRIO (F5)
// ============================================================
const perguntasFechamento = [
  "O Plano da Auditoria foi cumprido satisfatoriamente?",
  "Todos os locais programados foram auditados?",
  "A equipe auditora teve acesso a todos os registros solicitados?",
  "O SGQ tem se mostrado eficaz no tratamento de reclamações de clientes?",
  "As ações corretivas de auditorias anteriores foram verificadas e eficazes?",
];

const pontosFortesSeed = [
  { titulo: "Comprometimento da alta direção", texto: "Participação integral da diretoria nas reuniões e análises críticas." },
  { titulo: "Cultura de melhoria contínua", texto: "Colaboradores da produção sugerem ações e utilizam o portal Jáwda no dia a dia." },
  { titulo: "Rastreabilidade documental", texto: "Versionamento consistente em 100% dos procedimentos amostrados." },
];

const recomendacoesRotulos = ["Certificação", "Recertificação", "Manutenção", "Extensão de escopo", "Redução de escopo"];

function RelatorioTab({
  apontamentos, checklist, checklistCompleto, auditoria,
}: {
  apontamentos: Apontamento[];
  checklist: CheckSection[];
  checklistCompleto: boolean;
  auditoria: ReturnType<typeof useJawda>["auditorias"][number];
}) {
  const navigate = useNavigate();
  const { updateAuditoriaStatus, addNotification, logActivity } = useJawda();

  const [respostas, setRespostas] = useState<Record<number, "Sim" | "Nao" | "NA">>({ 0: "Sim", 1: "Sim", 2: "Sim", 3: "Nao", 4: "Sim" });
  const [justificativas, setJustificativas] = useState<Record<number, string>>({ 3: "Reclamações do último trimestre ainda estão em análise sem resposta formal ao cliente." });
  const [conclusaoTexto, setConclusaoTexto] = useState("O sistema de gestão demonstra maturidade crescente e engajamento das lideranças. As não conformidades identificadas são pontuais e não comprometem a integridade do SGI.");
  const [iaLoading, setIaLoading] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [concluido, setConcluido] = useState(auditoria.status === "Concluída");

  // Resultados por norma
  const resultadosPorNorma = useMemo(() => {
    const normas = auditoria.normas.length ? auditoria.normas : ["ISO 9001"];
    return normas.map((n) => {
      const list = apontamentos.filter((a) => a.norma === n);
      return {
        norma: n,
        opm: list.filter((a) => a.tipo === "OPM").length,
        ncs: list.filter((a) => a.tipo === "NCS").length,
        ncm: list.filter((a) => a.tipo === "NCM").length,
        ncc: list.filter((a) => a.tipo === "NCC").length,
      };
    });
  }, [apontamentos, auditoria.normas]);

  const totalNCC = apontamentos.filter((a) => a.tipo === "NCC").length;
  const totalNCM = apontamentos.filter((a) => a.tipo === "NCM").length;
  const bloqueiaManutencao = totalNCC > 0;

  const totalPerguntas = checklist.flatMap((s) => s.itens.flatMap((it) => it.perguntas)).length;
  const conformes = checklist.flatMap((s) => s.itens.flatMap((it) => it.perguntas)).filter((p) => p.classif === "C").length;
  const pctConformidade = totalPerguntas ? Math.round((conformes / totalPerguntas) * 100) : 0;

  const naosSemJust = Object.entries(respostas).filter(
    ([i, v]) => v === "Nao" && !(justificativas[Number(i)]?.trim()),
  );
  const podeConcluir = checklistCompleto && naosSemJust.length === 0;

  function redigirIA(estilo: "padrao" | "conciso" | "detalhado" = "padrao") {
    setIaLoading(true);
    setTimeout(() => {
      const base = `O ciclo de auditoria ${auditoria.codigo} alcançou ${pctConformidade}% de conformidade sobre ${totalPerguntas} requisitos avaliados. Foram identificadas ${apontamentos.length} não conformidades/oportunidades, sendo ${totalNCC} críticas e ${totalNCM} moderadas.`;
      const pontos = pontosFortesSeed.map((p) => `• ${p.titulo}: ${p.texto}`).join(" ");
      let texto = "";
      if (estilo === "conciso") {
        texto = `${base} Destacam-se como pontos fortes o comprometimento da alta direção, a cultura de melhoria contínua e a rastreabilidade documental. Conclui-se que o SGI está adequado ao escopo declarado, com ações de tratativa em curso.`;
      } else if (estilo === "detalhado") {
        texto = `${base}\n\nPontos positivos identificados durante a auditoria: ${pontos}.\n\nA análise da equipe auditora indica que o Sistema de Gestão da Qualidade encontra-se implementado de forma coerente com os requisitos aplicáveis, com evidências consistentes de melhoria contínua. As não conformidades identificadas são pontuais, não comprometem a integridade do SGI e possuem tratativas planejadas dentro dos prazos regulamentares. Recomenda-se acompanhamento das ações corretivas na próxima auditoria interna.`;
      } else {
        texto = `${base}\n\nDestaques positivos: ${pontos}.\n\nConclui-se que o Sistema de Gestão da Qualidade demonstra maturidade crescente, engajamento das lideranças e capacidade de tratativa eficaz das não conformidades identificadas.`;
      }
      setConclusaoTexto(texto);
      setIaLoading(false);
      toast.success("Conclusão redigida pela IA");
    }, 1400);
  }

  function handleConcluir() {
    if (!podeConcluir) {
      if (!checklistCompleto) toast.error("Conclua o checklist antes de finalizar.");
      else toast.error("Justifique todas as perguntas respondidas com 'Não'.");
      return;
    }
    updateAuditoriaStatus(auditoria.id, "Concluída");
    addNotification({
      title: `Relatório de ${auditoria.codigo} enviado`,
      description: `${apontamentos.length} apontamentos · ${pctConformidade}% conformidade`,
      tone: "success",
      link: `/auditorias/${auditoria.id}`,
    });
    logActivity({ verb: "concluiu auditoria", target: auditoria.codigo, targetType: "Auditoria", refId: auditoria.id });
    setConcluido(true);
  }

  if (concluido) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Relatório enviado com sucesso</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {auditoria.codigo} concluída em {new Date().toLocaleDateString("pt-BR")} · notificações enviadas aos responsáveis
            </p>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-left">
              <div className="text-[11px] uppercase text-muted-foreground">Conformidade</div>
              <div className="text-2xl font-bold text-brand">{pctConformidade}%</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-left">
              <div className="text-[11px] uppercase text-muted-foreground">Apontamentos</div>
              <div className="text-2xl font-bold text-foreground">{apontamentos.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-left">
              <div className="text-[11px] uppercase text-muted-foreground">NCs Críticas</div>
              <div className="text-2xl font-bold text-[color:var(--severity-critical)]">{totalNCC}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/auditorias" })}>Voltar ao programa</Button>
            <Button className="bg-brand hover:bg-brand/90" onClick={() => setPdfOpen(true)}>
              <Download className="mr-1.5 h-4 w-4" /> Ver PDF
            </Button>
          </div>
        </CardContent>
        <PdfPreviewDialog
          open={pdfOpen} onOpenChange={setPdfOpen}
          auditoria={auditoria}
          conclusao={conclusaoTexto}
          resultadosPorNorma={resultadosPorNorma}
          pctConformidade={pctConformidade}
        />
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-8 py-6">
          <JawdaLogo size={32} />
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Relatório de Auditoria</div>
            <div className="text-sm font-semibold text-foreground">{auditoria.codigo} · Ciclo 2026</div>
          </div>
        </div>

        <div className="space-y-10 px-8 py-8 md:px-12">
          <Section titulo="1. Perguntas de fechamento">
            <div className="space-y-4">
              {perguntasFechamento.map((q, i) => (
                <PerguntaFechamento
                  key={i} pergunta={q} idx={i}
                  valor={respostas[i]!}
                  justificativa={justificativas[i] ?? ""}
                  onValor={(v) => setRespostas((prev) => ({ ...prev, [i]: v }))}
                  onJust={(j) => setJustificativas((prev) => ({ ...prev, [i]: j }))}
                />
              ))}
            </div>
          </Section>

          <Section titulo="2. Pontos positivos e conclusão">
            <div className="grid gap-3 md:grid-cols-3">
              {pontosFortesSeed.map((p) => (
                <div key={p.titulo} className="rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-3">
                  <div className="flex items-center gap-1.5 text-[color:var(--success)]">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Ponto forte</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{p.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.texto}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-medium text-foreground">Conclusão</label>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-brand hover:bg-brand-soft" disabled={iaLoading} onClick={() => redigirIA("padrao")}>
                  {iaLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Redigir com IA
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={iaLoading} onClick={() => redigirIA("conciso")}>Mais conciso</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" disabled={iaLoading} onClick={() => redigirIA("detalhado")}>Mais detalhado</Button>
              </div>
            </div>
            <Textarea
              className="mt-2 min-h-[140px]"
              value={conclusaoTexto}
              onChange={(e) => setConclusaoTexto(e.target.value)}
            />
          </Section>

          <Section titulo="3. Resultados da auditoria">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Norma</th>
                    <th className="px-3 py-2 text-center">OPM</th>
                    <th className="px-3 py-2 text-center">NC Simples</th>
                    <th className="px-3 py-2 text-center">NC Moderada</th>
                    <th className="px-3 py-2 text-center">NC Crítica</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosPorNorma.map((r) => (
                    <tr key={r.norma} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">{r.norma}</td>
                      <td className="px-3 py-2 text-center"><ChipNum n={r.opm} cls={classifMeta.OPM.badge} /></td>
                      <td className="px-3 py-2 text-center"><ChipNum n={r.ncs} cls={classifMeta.NCS.badge} /></td>
                      <td className="px-3 py-2 text-center"><ChipNum n={r.ncm} cls={classifMeta.NCM.badge} /></td>
                      <td className="px-3 py-2 text-center"><ChipNum n={r.ncc} cls={classifMeta.NCC.badge} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Valores contados automaticamente a partir dos {apontamentos.length} apontamentos registrados.
            </p>
          </Section>

          <Section titulo="4. Recomendação da equipe auditora">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Recomendação</th>
                    {(auditoria.normas.length ? auditoria.normas : ["ISO 9001"]).map((n) => (
                      <th key={n} className="px-3 py-2 text-center">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recomendacoesRotulos.map((r) => {
                    const bloqueada = r === "Manutenção" && bloqueiaManutencao;
                    return (
                      <tr key={r} className="border-t border-border">
                        <td className="px-3 py-2 font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            {r}
                            {bloqueada && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="h-3.5 w-3.5 text-[color:var(--severity-critical)]" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[240px] text-xs">
                                  Recomendação bloqueada: há {totalNCC} NC(s) crítica(s). É exigida reauditoria antes de indicar manutenção.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        {(auditoria.normas.length ? auditoria.normas : ["ISO 9001"]).map((n) => (
                          <td key={n} className="px-3 py-2 text-center">
                            <Checkbox disabled={bloqueada} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section titulo="5. Assinaturas">
            <div className="grid gap-4 md:grid-cols-2">
              <AssinaturaBloco titulo="Representante da Organização" nome="Fernanda Lima" cargo="Diretora de Qualidade" />
              <AssinaturaBloco titulo="Auditor Líder" nome={auditoria.auditorLider.nome} cargo="Auditor Líder" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Data de emissão: <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="h-8 w-[160px]" />
            </div>
          </Section>
        </div>
      </div>

      {/* Barra flutuante */}
      <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
        {!podeConcluir && (
          <span className="mr-auto text-[11px] text-[color:var(--severity-critical)]">
            {!checklistCompleto
              ? "Checklist ainda não está 100% preenchido."
              : `${naosSemJust.length} pergunta(s) com 'Não' sem justificativa.`}
          </span>
        )}
        <Button variant="outline" size="sm" onClick={() => toast.success("Rascunho salvo")}>
          <Save className="mr-1.5 h-4 w-4" /> Salvar rascunho
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPdfOpen(true)}>
          <Download className="mr-1.5 h-4 w-4" /> Exportar PDF
        </Button>
        <Button size="sm" className="bg-brand hover:bg-brand/90" onClick={handleConcluir} disabled={!podeConcluir}>
          <Send className="mr-1.5 h-4 w-4" /> Concluir e enviar
        </Button>
      </div>

      <PdfPreviewDialog
        open={pdfOpen} onOpenChange={setPdfOpen}
        auditoria={auditoria} conclusao={conclusaoTexto}
        resultadosPorNorma={resultadosPorNorma}
        pctConformidade={pctConformidade}
      />
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">{titulo}</h2>
      {children}
    </section>
  );
}

function ChipNum({ n, cls }: { n: number; cls: string }) {
  return (
    <span className={cn("inline-flex min-w-[28px] items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold",
      n === 0 ? "border-border bg-transparent text-muted-foreground" : cls)}>
      {n}
    </span>
  );
}

function PerguntaFechamento({
  pergunta, idx, valor, justificativa, onValor, onJust,
}: {
  pergunta: string; idx: number;
  valor: "Sim" | "Nao" | "NA";
  justificativa: string;
  onValor: (v: "Sim" | "Nao" | "NA") => void;
  onJust: (j: string) => void;
}) {
  const invalida = valor === "Nao" && !justificativa.trim();
  return (
    <div className={cn("rounded-lg border p-3", invalida ? "border-[color:var(--severity-critical)]/50 bg-[color:var(--severity-critical)]/5" : "border-border")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm text-foreground">{idx + 1}. {pergunta}</p>
        <RadioGroup value={valor} onValueChange={(v) => onValor(v as "Sim" | "Nao" | "NA")} className="flex gap-3">
          {["Sim", "Nao", "NA"].map((v) => (
            <Label key={v} className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground">
              <RadioGroupItem value={v} />
              {v === "Nao" ? "Não" : v === "NA" ? "N.A." : v}
            </Label>
          ))}
        </RadioGroup>
      </div>
      {valor === "Nao" && (
        <>
          <Textarea
            className="mt-2 min-h-[64px]"
            placeholder="Justifique a resposta 'Não'…"
            value={justificativa}
            onChange={(e) => onJust(e.target.value)}
          />
          {invalida && (
            <p className="mt-1 text-[11px] text-[color:var(--severity-critical)]">
              Justificativa obrigatória para concluir o relatório.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function AssinaturaBloco({ titulo, nome, cargo }: { titulo: string; nome: string; cargo: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="mt-4 border-b border-dashed border-border pb-1 text-center font-serif italic text-brand">{nome}</div>
      <div className="mt-1 text-center text-xs text-foreground">{nome}</div>
      <div className="text-center text-[11px] text-muted-foreground">{cargo}</div>
    </div>
  );
}

function PdfPreviewDialog({
  open, onOpenChange, auditoria, conclusao, resultadosPorNorma, pctConformidade,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  auditoria: ReturnType<typeof useJawda>["auditorias"][number];
  conclusao: string;
  resultadosPorNorma: { norma: string; opm: number; ncs: number; ncm: number; ncc: number }[];
  pctConformidade: number;
}) {
  const paginaRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview do PDF — {auditoria.codigo}</DialogTitle>
          <DialogDescription>Pré-visualização paginada do relatório final.</DialogDescription>
        </DialogHeader>
        <div ref={paginaRef} className="max-h-[70vh] space-y-4 overflow-y-auto rounded-lg border border-border bg-white p-8 text-black">
          <div className="flex items-center justify-between border-b pb-3">
            <JawdaLogo size={28} />
            <div className="text-right text-[11px] text-gray-500">
              <div>Relatório de Auditoria</div>
              <div className="font-mono">{auditoria.codigo} — Página 1</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{auditoria.evento}</h3>
            <p className="text-sm text-gray-600">{auditoria.escopo}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border p-2"><b>Líder:</b> {auditoria.auditorLider.nome}</div>
            <div className="rounded border p-2"><b>Tipo:</b> {auditoria.tipo}</div>
            <div className="rounded border p-2"><b>Conformidade:</b> {pctConformidade}%</div>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Resultados por norma</h4>
            <table className="w-full border text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1 text-left">Norma</th>
                  <th className="border p-1">OPM</th>
                  <th className="border p-1">NCS</th>
                  <th className="border p-1">NCM</th>
                  <th className="border p-1">NCC</th>
                </tr>
              </thead>
              <tbody>
                {resultadosPorNorma.map((r) => (
                  <tr key={r.norma}>
                    <td className="border p-1">{r.norma}</td>
                    <td className="border p-1 text-center">{r.opm}</td>
                    <td className="border p-1 text-center">{r.ncs}</td>
                    <td className="border p-1 text-center">{r.ncm}</td>
                    <td className="border p-1 text-center">{r.ncc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Conclusão</h4>
            <p className="whitespace-pre-line text-xs text-gray-700">{conclusao}</p>
          </div>
          <div className="border-t pt-3 text-[10px] text-gray-500">
            Gerado por Jáwda · {new Date().toLocaleString("pt-BR")}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button className="bg-brand hover:bg-brand/90" onClick={() => { toast.success("PDF exportado"); onOpenChange(false); }}>
            <Download className="mr-1.5 h-4 w-4" /> Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}