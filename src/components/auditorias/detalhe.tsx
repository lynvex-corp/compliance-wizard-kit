import { useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mockAuditorias } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ============================================================
// Classificações (segmented control colors)
// ============================================================
type Classif = "NA" | "C" | "OPM" | "NCS" | "NCM" | "NCC" | null;

const classifMeta: Record<
  Exclude<Classif, null>,
  { label: string; long: string; badge: string; dot: string; ring: string }
> = {
  NA: {
    label: "N.A.",
    long: "Não aplicável",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
    ring: "data-[state=on]:bg-muted data-[state=on]:text-foreground",
  },
  C: {
    label: "C",
    long: "Conforme",
    badge: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/40",
    dot: "bg-[color:var(--success)]",
    ring: "data-[state=on]:bg-[color:var(--success)] data-[state=on]:text-white",
  },
  OPM: {
    label: "OPM",
    long: "Oportunidade de melhoria",
    badge: "bg-brand-soft text-brand border-brand/30",
    dot: "bg-brand",
    ring: "data-[state=on]:bg-brand data-[state=on]:text-white",
  },
  NCS: {
    label: "NCS",
    long: "NC Simples",
    badge: "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
    dot: "bg-[color:var(--warning)]",
    ring: "data-[state=on]:bg-[color:var(--warning)] data-[state=on]:text-white",
  },
  NCM: {
    label: "NCM",
    long: "NC Moderada",
    badge: "bg-[color:var(--severity-high)]/15 text-[color:var(--severity-high)] border-[color:var(--severity-high)]/40",
    dot: "bg-[color:var(--severity-high)]",
    ring: "data-[state=on]:bg-[color:var(--severity-high)] data-[state=on]:text-white",
  },
  NCC: {
    label: "NCC",
    long: "NC Crítica",
    badge: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/40",
    dot: "bg-[color:var(--severity-critical)]",
    ring: "data-[state=on]:bg-[color:var(--severity-critical)] data-[state=on]:text-white",
  },
};

// ============================================================
// Checklist mock
// ============================================================
interface CheckItem {
  id: string;
  numero: string;
  titulo: string;
  perguntas: { id: string; texto: string; hint: string; classif: Classif; nota: string }[];
}
interface CheckSection {
  numero: string;
  titulo: string;
  itens: CheckItem[];
}

const checklist: CheckSection[] = [
  {
    numero: "4",
    titulo: "Contexto da Organização",
    itens: [
      {
        id: "4.1",
        numero: "4.1",
        titulo: "Compreendendo a organização e seu contexto",
        perguntas: [
          {
            id: "4.1.1",
            texto: "A organização determinou questões externas e internas pertinentes ao propósito?",
            hint: "registre evidências",
            classif: "C",
            nota: "Análise SWOT revisada em Jan/2026, revisão pela direção 12/01/2026.",
          },
        ],
      },
      {
        id: "4.3",
        numero: "4.3",
        titulo: "Determinando o escopo do SGI",
        perguntas: [
          {
            id: "4.3.1",
            texto: "O escopo do SGI está documentado, disponível e considera produtos/serviços?",
            hint: "exige documento/registro",
            classif: "OPM",
            nota: "Escopo publicado no portal, mas não menciona serviços de pós-venda incluídos após 2025.",
          },
          {
            id: "4.3.2",
            texto: "As unidades/filiais abrangidas pelo escopo estão claramente definidas?",
            hint: "exige documento/registro",
            classif: null,
            nota: "",
          },
        ],
      },
      {
        id: "4.4",
        numero: "4.4",
        titulo: "SGI e seus processos",
        perguntas: [
          {
            id: "4.4.1",
            texto: "Os processos necessários ao SGI estão determinados e interagem entre si?",
            hint: "exige documento/registro",
            classif: "NCS",
            nota: "Mapa de processos desatualizado — não reflete a nova área de Sustentabilidade.",
          },
        ],
      },
    ],
  },
  {
    numero: "5",
    titulo: "Liderança",
    itens: [
      {
        id: "5.1",
        numero: "5.1",
        titulo: "Liderança e comprometimento",
        perguntas: [
          {
            id: "5.1.1",
            texto: "A alta direção demonstra liderança e comprometimento com o SGI?",
            hint: "registre evidências",
            classif: "C",
            nota: "Ata da RD 12/01/2026 com participação integral da diretoria.",
          },
        ],
      },
      {
        id: "5.2",
        numero: "5.2",
        titulo: "Política",
        perguntas: [
          { id: "5.2.1", texto: "A política é apropriada e comunicada?", hint: "exige documento/registro", classif: "C", nota: "Política v3 publicada 2026-01-15." },
        ],
      },
    ],
  },
  {
    numero: "6",
    titulo: "Planejamento",
    itens: [
      { id: "6.1", numero: "6.1", titulo: "Ações para abordar riscos e oportunidades", perguntas: [
        { id: "6.1.1", texto: "Riscos e oportunidades foram determinados e tratados?", hint: "exige documento/registro", classif: "NCM", nota: "Matriz de riscos sem revisão desde 2024 em 3 processos." },
      ]},
      { id: "6.2", numero: "6.2", titulo: "Objetivos e planejamento", perguntas: [
        { id: "6.2.1", texto: "Objetivos são coerentes com a política e mensuráveis?", hint: "registre evidências", classif: null, nota: "" },
      ]},
    ],
  },
  {
    numero: "7",
    titulo: "Apoio",
    itens: [
      { id: "7.1.3", numero: "7.1.3", titulo: "Infraestrutura", perguntas: [
        { id: "7.1.3.1", texto: "A infraestrutura necessária é determinada, provida e mantida?", hint: "exige documento/registro", classif: "C", nota: "Plano de manutenção preventiva em dia." },
      ]},
      { id: "7.2", numero: "7.2", titulo: "Competência", perguntas: [
        { id: "7.2.1", texto: "Competências são determinadas e há registros de treinamento?", hint: "exige documento/registro", classif: "OPM", nota: "Falta matriz de competência para novos cargos criados em 2026." },
      ]},
      { id: "7.5", numero: "7.5", titulo: "Informação documentada", perguntas: [
        { id: "7.5.1", texto: "Existe controle de emissão, análise e distribuição de documentos?", hint: "exige documento/registro", classif: null, nota: "" },
      ]},
    ],
  },
  {
    numero: "8",
    titulo: "Operação",
    itens: [
      { id: "8.1", numero: "8.1", titulo: "Planejamento e controle operacionais", perguntas: [
        { id: "8.1.1", texto: "As operações estão planejadas, implementadas e controladas?", hint: "registre evidências", classif: null, nota: "" },
      ]},
      { id: "8.4", numero: "8.4", titulo: "Controle de processos providos externamente", perguntas: [
        { id: "8.4.1", texto: "Fornecedores externos são avaliados e monitorados?", hint: "exige documento/registro", classif: null, nota: "" },
      ]},
    ],
  },
  {
    numero: "9",
    titulo: "Avaliação de Desempenho",
    itens: [
      { id: "9.1", numero: "9.1", titulo: "Monitoramento, medição, análise e avaliação", perguntas: [
        { id: "9.1.1", texto: "O que precisa ser monitorado/medido está definido?", hint: "registre evidências", classif: null, nota: "" },
      ]},
      { id: "9.2", numero: "9.2", titulo: "Auditoria interna", perguntas: [
        { id: "9.2.1", texto: "Auditorias internas são realizadas em intervalos planejados?", hint: "exige documento/registro", classif: "NA", nota: "Item auditado por outra equipe." },
      ]},
      { id: "9.3", numero: "9.3", titulo: "Análise crítica pela direção", perguntas: [
        { id: "9.3.1", texto: "A alta direção realiza análise crítica em intervalos planejados?", hint: "exige documento/registro", classif: null, nota: "" },
      ]},
    ],
  },
  {
    numero: "10",
    titulo: "Melhoria",
    itens: [
      { id: "10.2", numero: "10.2", titulo: "Não conformidade e ação corretiva", perguntas: [
        { id: "10.2.1", texto: "NCs são tratadas com análise de causa e ação corretiva?", hint: "exige documento/registro", classif: null, nota: "" },
      ]},
      { id: "10.3", numero: "10.3", titulo: "Melhoria contínua", perguntas: [
        { id: "10.3.1", texto: "A melhoria contínua é promovida a partir dos resultados?", hint: "registre evidências", classif: null, nota: "" },
      ]},
    ],
  },
];

// ============================================================
// Apontamentos mock
// ============================================================
type ApontStatus =
  | "Aguardando tratativa"
  | "Em tratativa"
  | "Aguardando verificação"
  | "Encerrado eficaz"
  | "Encerrado não eficaz";

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
}

const apontamentosMock: Apontamento[] = [
  {
    numero: "01",
    tipo: "NCS",
    norma: "ISO 9001",
    item: "4.4",
    status: "Encerrado eficaz",
    descricao: "Mapa de processos desatualizado — não reflete a área de Sustentabilidade criada em 2026.",
    criterio: "Requisito 4.4.1 — os processos do SGI devem ser determinados.",
    local: "Sede — Diretoria de Qualidade",
    correcao: "Republicação imediata do mapa incluindo a nova área.",
    causa: "Falta de gatilho no procedimento de gestão da mudança.",
    corretiva: "Revisar PGQ-014 para exigir atualização do mapa em toda criação de área.",
    evidencias: "Mapa v4 publicado 2026-07-05 e ata de aprovação anexa.",
    eficaz: "Sim",
    fechamento: "2026-07-08",
    ncVinculada: "NC-2026-014",
    paVinculado: "PA-2026-031",
  },
  {
    numero: "02",
    tipo: "OPM",
    norma: "ISO 9001",
    item: "4.3",
    status: "Aguardando tratativa",
    descricao: "Escopo do SGI não menciona serviços de pós-venda incluídos após 2025.",
    criterio: "Requisito 4.3 — escopo deve considerar produtos e serviços.",
    local: "Sede/Escritório",
    correcao: "",
    causa: "",
    corretiva: "",
    evidencias: "",
    eficaz: "—",
  },
  {
    numero: "03",
    tipo: "OPM",
    norma: "ISO 9001",
    item: "7.2",
    status: "Em tratativa",
    descricao: "Ausência de matriz de competência para os novos cargos criados em 2026.",
    criterio: "Requisito 7.2 — determinar competências necessárias.",
    local: "RH — Sede",
    correcao: "Elaborar matriz para cargos criados.",
    causa: "Processo de criação de cargo não aciona RH.",
    corretiva: "",
    evidencias: "",
    eficaz: "—",
  },
  {
    numero: "04",
    tipo: "NCM",
    norma: "ISO 9001",
    item: "6.1",
    status: "Em tratativa",
    descricao: "Matriz de riscos sem revisão desde 2024 em 3 processos críticos.",
    criterio: "Requisito 6.1 — riscos e oportunidades devem ser determinados.",
    local: "Engenharia, Comercial e Suprimentos",
    correcao: "Revisar matriz de riscos dos processos apontados.",
    causa: "Sem periodicidade definida no procedimento.",
    corretiva: "Definir revisão semestral obrigatória.",
    evidencias: "",
    eficaz: "—",
  },
];

// ============================================================
// Página principal
// ============================================================
export function AuditoriaDetailPage() {
  const params = useParams({ from: "/auditorias/$id" });
  const auditoria =
    mockAuditorias.find((a) => a.id === params.id) ?? mockAuditorias[0]!;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <Header auditoria={auditoria} />

        <Tabs defaultValue="checklist">
          <TabsList>
            <TabsTrigger value="checklist">
              <ListChecks className="mr-1.5 h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="apontamentos">
              <ClipboardList className="mr-1.5 h-4 w-4" />
              Apontamentos
            </TabsTrigger>
            <TabsTrigger value="relatorio">
              <FileCheck2 className="mr-1.5 h-4 w-4" />
              Relatório
            </TabsTrigger>
          </TabsList>
          <TabsContent value="checklist" className="mt-4">
            <ChecklistTab />
          </TabsContent>
          <TabsContent value="apontamentos" className="mt-4">
            <ApontamentosTab />
          </TabsContent>
          <TabsContent value="relatorio" className="mt-4">
            <RelatorioTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Header({ auditoria }: { auditoria: (typeof mockAuditorias)[number] }) {
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
            <span>
              {auditoria.tipo}
              {auditoria.certificadora ? ` — ${auditoria.certificadora}` : ""}
            </span>
            <span>·</span>
            <span>Líder: {auditoria.auditorLider.nome}</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {auditoria.evento}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{auditoria.escopo}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {auditoria.normas.map((n) => (
              <span
                key={n}
                className="inline-flex items-center rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-brand/40 bg-brand-soft text-brand"
        >
          {auditoria.status}
        </Badge>
      </div>
    </div>
  );
}

// ============================================================
// TAB 1 — CHECKLIST
// ============================================================
function ChecklistTab() {
  const [selectedItem, setSelectedItem] = useState<string>("4.3");
  const [state, setState] = useState(() => {
    const map: Record<string, { classif: Classif; nota: string }> = {};
    for (const s of checklist) for (const it of s.itens) for (const p of it.perguntas)
      map[p.id] = { classif: p.classif, nota: p.nota };
    return map;
  });

  const allPerguntas = useMemo(
    () => checklist.flatMap((s) => s.itens.flatMap((it) => it.perguntas)),
    [],
  );
  const preenchidas = allPerguntas.filter((p) => state[p.id]?.classif).length;
  const progresso = Math.round((preenchidas / allPerguntas.length) * 100);

  // Compute item status color for tree
  function itemDot(it: CheckItem) {
    const classifs = it.perguntas.map((p) => state[p.id]?.classif);
    if (classifs.every((c) => !c)) return { cls: "border border-border bg-transparent", tip: "Não auditado" };
    // Priority: NCC > NCM > NCS > OPM > NA > C
    if (classifs.includes("NCC")) return { cls: classifMeta.NCC.dot, tip: "NC Crítica" };
    if (classifs.includes("NCM")) return { cls: classifMeta.NCM.dot, tip: "NC Moderada" };
    if (classifs.includes("NCS")) return { cls: classifMeta.NCS.dot, tip: "NC Simples" };
    if (classifs.includes("OPM")) return { cls: classifMeta.OPM.dot, tip: "OPM" };
    if (classifs.every((c) => c === "NA")) return { cls: classifMeta.NA.dot, tip: "N.A." };
    return { cls: classifMeta.C.dot, tip: "Conforme" };
  }

  const selecionado = useMemo(
    () =>
      checklist.flatMap((s) => s.itens).find((it) => it.id === selectedItem) ??
      checklist[0]!.itens[0]!,
    [selectedItem],
  );

  return (
    <div className="space-y-4">
      {/* Progresso */}
      <Card className="rounded-xl">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Execução do checklist
            </div>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Requisitos da norma</CardTitle>
          </CardHeader>
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
                              active
                                ? "bg-brand-soft text-brand"
                                : "text-foreground hover:bg-muted/60",
                            )}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full",
                                dot.cls,
                              )}
                              title={dot.tip}
                            />
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
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{selecionado.numero}</span>
            <h2 className="text-lg font-semibold text-foreground">{selecionado.titulo}</h2>
          </div>
          {selecionado.perguntas.map((p) => {
            const cur = state[p.id];
            const classif = cur?.classif;
            const isNC = classif === "NCS" || classif === "NCM" || classif === "NCC";
            return (
              <Card key={p.id} className="rounded-xl">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-2">
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium leading-relaxed text-foreground">{p.texto}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(classifMeta) as Array<Exclude<Classif, null>>).map((k) => {
                      const m = classifMeta[k];
                      const active = classif === k;
                      return (
                        <button
                          key={k}
                          onClick={() =>
                            setState((s) => ({ ...s, [p.id]: { ...s[p.id]!, classif: k } }))
                          }
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                            active
                              ? {
                                  NA: "border-muted-foreground/40 bg-muted text-foreground",
                                  C: "border-transparent bg-[color:var(--success)] text-white",
                                  OPM: "border-transparent bg-brand text-white",
                                  NCS: "border-transparent bg-[color:var(--warning)] text-white",
                                  NCM: "border-transparent bg-[color:var(--severity-high)] text-white",
                                  NCC: "border-transparent bg-[color:var(--severity-critical)] text-white",
                                }[k]
                              : cn(
                                  "bg-transparent hover:bg-muted/60",
                                  {
                                    NA: "border-border text-muted-foreground",
                                    C: "border-[color:var(--success)]/40 text-[color:var(--success)]",
                                    OPM: "border-brand/40 text-brand",
                                    NCS: "border-[color:var(--warning)]/40 text-[color:var(--severity-high)]",
                                    NCM: "border-[color:var(--severity-high)]/40 text-[color:var(--severity-high)]",
                                    NCC: "border-[color:var(--severity-critical)]/40 text-[color:var(--severity-critical)]",
                                  }[k],
                                ),
                          )}
                          title={m.long}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">
                        Anotações e evidências
                      </label>
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          p.hint === "exige documento/registro"
                            ? "text-[color:var(--severity-critical)]"
                            : "text-muted-foreground",
                        )}
                      >
                        {p.hint}
                      </span>
                    </div>
                    <Textarea
                      value={cur?.nota ?? ""}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          [p.id]: { ...s[p.id]!, nota: e.target.value },
                        }))
                      }
                      placeholder="Registre a evidência observada, documento verificado, entrevistado…"
                      className="min-h-[76px] resize-none"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Paperclip className="h-3.5 w-3.5" /> Anexar evidência
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-brand hover:bg-brand-soft"
                        onClick={() => toast.success("Sugestão gerada com IA")}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Sugerir texto de evidência com IA
                      </Button>
                    </div>
                  </div>

                  {isNC && (
                    <div className="flex items-start gap-2 rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3 text-xs text-foreground">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--severity-high)]" />
                      <div className="min-w-0">
                        <div className="font-medium">
                          Apontamento gerado automaticamente — será detalhado na aba{" "}
                          <button
                            className="underline underline-offset-2"
                            onClick={() => toast.info("Abra a aba Apontamentos acima")}
                          >
                            Apontamentos
                          </button>
                          .
                        </div>
                        <div className="text-muted-foreground">
                          Tipo: <span className="font-semibold">{classifMeta[classif!].long}</span> ·
                          Item {selecionado.numero}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 2 — APONTAMENTOS
// ============================================================
function ApontamentosTab() {
  const counts = useMemo(() => {
    const c = { OPM: 0, NCS: 0, NCM: 0, NCC: 0 };
    for (const a of apontamentosMock) c[a.tipo] += 1;
    return c;
  }, []);

  return (
    <div className="space-y-4">
      {/* Contadores + prazos */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="rounded-xl">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Apontamentos desta auditoria
            </div>
            <div className="flex flex-wrap gap-2">
              {(["OPM", "NCS", "NCM", "NCC"] as const).map((k) => (
                <span
                  key={k}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
                    classifMeta[k].badge,
                  )}
                >
                  {classifMeta[k].label}
                  <span className="rounded bg-white/60 px-1 text-[11px]">{counts[k]}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10">
          <CardContent className="flex items-center gap-3 p-4">
            <Timer className="h-5 w-5 shrink-0 text-[color:var(--severity-high)]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                Plano de ação em até 10 dias · Evidências em até 45 dias
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Progress
                  value={30}
                  className="h-1.5 bg-[color:var(--warning)]/20 [&>div]:bg-[color:var(--severity-high)]"
                />
                <span className="text-[11px] text-muted-foreground">7 de 10 dias restantes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {apontamentosMock.map((a) => (
          <ApontamentoCard key={a.numero} a={a} />
        ))}
      </div>
    </div>
  );
}

function ApontamentoCard({ a }: { a: Apontamento }) {
  const [open, setOpen] = useState(a.numero === "01" || a.numero === "04");
  const [ncVinc, setNcVinc] = useState(a.ncVinculada);
  const [paVinc, setPaVinc] = useState(a.paVinculado);

  const statusCls: Record<ApontStatus, string> = {
    "Aguardando tratativa": "border-border bg-muted text-muted-foreground",
    "Em tratativa": "border-brand/30 bg-brand-soft text-brand",
    "Aguardando verificação": "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]",
    "Encerrado eficaz": "border-[color:var(--success)]/40 bg-[color:var(--success)]/15 text-[color:var(--success)]",
    "Encerrado não eficaz": "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]",
  };

  return (
    <Card className="rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-muted/40"
      >
        <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">
          Nº {a.numero}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
            classifMeta[a.tipo].badge,
          )}
        >
          {classifMeta[a.tipo].long}
        </span>
        <span className="text-xs text-muted-foreground">
          {a.norma} · Item <span className="font-mono">{a.item}</span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
          {a.descricao}
        </span>
        <Badge variant="outline" className={cn("border text-[11px]", statusCls[a.status])}>
          {a.status}
        </Badge>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
      </button>
      {open && (
        <>
          <Separator />
          <CardContent className="space-y-4 p-4">
            <TimelineSteps a={a} />

            {/* Rodapé — geração cruzada */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {ncVinc ? (
                <Link
                  to="/nao-conformidades/$id"
                  params={{ id: "nc-1" }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10"
                >
                  <Link2 className="h-3.5 w-3.5" /> {ncVinc}
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1"
                  onClick={() => {
                    const code = `NC-2026-0${20 + Number(a.numero)}`;
                    setNcVinc(code);
                    toast.success(`Não conformidade ${code} gerada`);
                  }}
                >
                  <FileText className="h-3.5 w-3.5" /> Gerar Não Conformidade no módulo NC
                </Button>
              )}
              {paVinc ? (
                <Link
                  to="/planos-de-acao/$id"
                  params={{ id: "plan-1" }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10"
                >
                  <Link2 className="h-3.5 w-3.5" /> {paVinc}
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1"
                  onClick={() => {
                    const code = `PA-2026-0${30 + Number(a.numero)}`;
                    setPaVinc(code);
                    toast.success(`Plano de ação ${code} gerado`);
                  }}
                >
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
    </Card>
  );
}

function TimelineSteps({ a }: { a: Apontamento }) {
  const steps: { label: string; who: string; value: string; ia?: boolean }[] = [
    { label: "Descrição da não conformidade", who: "Auditor", value: a.descricao },
    { label: "Critério não atendido", who: "Auditor", value: a.criterio },
    { label: "Local / Processo", who: "Auditor", value: a.local },
    { label: "Ação de correção", who: "Auditado", value: a.correcao || "Pendente" },
    { label: "Análise de causa", who: "Auditado", value: a.causa || "Pendente", ia: true },
    { label: "Ação corretiva", who: "Auditado", value: a.corretiva || "Pendente" },
    { label: "Evidências das ações implementadas", who: "Auditado", value: a.evidencias || "Pendente" },
    { label: "Tratativa eficaz?", who: "Auditor", value: a.eficaz === "—" ? "Aguardando verificação" : `${a.eficaz} — ${a.fechamento ?? ""}` },
  ];

  return (
    <ol className="relative space-y-4 border-l-2 border-border pl-5">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-border bg-background">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{s.label}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {s.who}
            </span>
            {s.ia && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-1.5 text-[11px] text-brand hover:bg-brand-soft"
                onClick={() => toast.success("Análise de causa sugerida com IA")}
              >
                <Sparkles className="h-3 w-3" /> Analisar causa com IA
              </Button>
            )}
          </div>
          <p
            className={cn(
              "mt-1 text-sm",
              s.value === "Pendente" || s.value === "Aguardando verificação"
                ? "italic text-muted-foreground"
                : "text-foreground",
            )}
          >
            {s.value}
          </p>
          {(s.label.startsWith("Evidências") || s.label.startsWith("Ação corretiva")) && (
            <Button variant="outline" size="sm" className="mt-2 h-7 gap-1 text-xs">
              <Paperclip className="h-3 w-3" /> Anexar
            </Button>
          )}
        </li>
      ))}
    </ol>
  );
}

// ============================================================
// TAB 3 — RELATÓRIO
// ============================================================
const perguntasFechamento = [
  "O Plano da Auditoria foi cumprido satisfatoriamente?",
  "Todos os locais programados foram auditados?",
  "A equipe auditora teve acesso a todos os registros solicitados?",
  "O SGQ tem se mostrado eficaz no tratamento de reclamações de clientes?",
  "As ações corretivas de auditorias anteriores foram verificadas e eficazes?",
];

const pontosFortes = [
  {
    titulo: "Comprometimento da alta direção",
    texto: "Participação integral da diretoria nas reuniões de abertura e encerramento e nas análises críticas.",
  },
  {
    titulo: "Cultura de melhoria contínua",
    texto: "Colaboradores da produção sugerem ações e utilizam o portal Jáwda no dia a dia.",
  },
  {
    titulo: "Rastreabilidade documental",
    texto: "Versionamento consistente em 100% dos procedimentos amostrados.",
  },
];

const resultadosPorNorma = [
  { norma: "ISO 9001", opm: 2, ncs: 1, ncm: 1, ncc: 0 },
  { norma: "ISO 14001", opm: 1, ncs: 0, ncm: 0, ncc: 0 },
  { norma: "ISO 45001", opm: 0, ncs: 0, ncm: 0, ncc: 0 },
];

const recomendacoesRotulos = ["Certificação", "Recertificação", "Manutenção", "Extensão de escopo", "Redução de escopo"];

function RelatorioTab() {
  return (
    <div className="relative">
      {/* Documento */}
      <div className="rounded-2xl border border-border bg-white shadow-sm">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-8 py-6">
          <JawdaLogo size={32} />
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Relatório de Auditoria
            </div>
            <div className="text-sm font-semibold text-foreground">AUD-2026-006 · Ciclo 2026</div>
          </div>
        </div>

        <div className="space-y-10 px-8 py-8 md:px-12">
          {/* 1. Perguntas de fechamento */}
          <Section titulo="1. Perguntas de fechamento">
            <div className="space-y-4">
              {perguntasFechamento.map((q, i) => (
                <PerguntaFechamento key={i} pergunta={q} idx={i} />
              ))}
            </div>
          </Section>

          {/* 2. Pontos positivos */}
          <Section titulo="2. Pontos positivos e conclusão">
            <div className="grid gap-3 md:grid-cols-3">
              {pontosFortes.map((p) => (
                <div
                  key={p.titulo}
                  className="rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-3"
                >
                  <div className="flex items-center gap-1.5 text-[color:var(--success)]">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Ponto forte</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{p.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.texto}</p>
                </div>
              ))}
            </div>
            <Textarea
              className="mt-4 min-h-[110px]"
              defaultValue="O sistema de gestão demonstra maturidade crescente e engajamento das lideranças. As não conformidades identificadas são pontuais e não comprometem a integridade do SGI."
            />
          </Section>

          {/* 3. Resultados */}
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
                      <td className="px-3 py-2 text-center">
                        <ChipNum n={r.opm} cls={classifMeta.OPM.badge} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <ChipNum n={r.ncs} cls={classifMeta.NCS.badge} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <ChipNum n={r.ncm} cls={classifMeta.NCM.badge} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <ChipNum n={r.ncc} cls={classifMeta.NCC.badge} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 4. Ações pós-auditoria */}
          <Section titulo="4. Ações pós-auditoria">
            <div className="grid gap-3 md:grid-cols-2">
              <AcaoCard
                titulo="Reauditoria (follow-up)"
                descricao="Nova visita in loco em até 60 dias para verificação de eficácia das ações corretivas de NCs Moderadas e Críticas."
                defaultChecked={false}
              />
              <AcaoCard
                titulo="Plano de Ação"
                descricao="Envio de plano em até 10 dias, com evidências implementadas em até 45 dias."
                defaultChecked
              />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
              <Checkbox defaultChecked /> Verificação na próxima auditoria programada
            </label>
          </Section>

          {/* 5. Recomendação */}
          <Section titulo="5. Recomendação da equipe auditora">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Recomendação</th>
                    <th className="px-3 py-2 text-center">ISO 9001</th>
                    <th className="px-3 py-2 text-center">ISO 14001</th>
                    <th className="px-3 py-2 text-center">ISO 45001</th>
                  </tr>
                </thead>
                <tbody>
                  {recomendacoesRotulos.map((r, ri) => (
                    <tr key={r} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">{r}</td>
                      {[0, 1, 2].map((ci) => (
                        <td key={ci} className="px-3 py-2 text-center">
                          <Checkbox defaultChecked={ri === 2 && ci !== 2} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 6. Assinaturas */}
          <Section titulo="6. Assinaturas">
            <div className="grid gap-4 md:grid-cols-2">
              <AssinaturaBloco titulo="Representante da Organização" nome="Fernanda Lima" cargo="Diretora de Qualidade" />
              <AssinaturaBloco titulo="Auditor Líder" nome="Marcos Vinícius" cargo="Auditor Líder — ISO 9001" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Data de emissão: <Input type="date" defaultValue="2026-07-20" className="h-8 w-[160px]" />
            </div>
          </Section>
        </div>
      </div>

      {/* Barra flutuante */}
      <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
        <Button variant="outline" size="sm" onClick={() => toast.success("Rascunho salvo")}>
          <Save className="mr-1.5 h-4 w-4" /> Salvar rascunho
        </Button>
        <Button variant="outline" size="sm" onClick={() => toast.success("PDF exportado")}>
          <Download className="mr-1.5 h-4 w-4" /> Exportar PDF
        </Button>
        <Button
          size="sm"
          className="bg-brand hover:bg-brand/90"
          onClick={() => toast.success("Relatório enviado")}
        >
          <Send className="mr-1.5 h-4 w-4" /> Concluir e enviar
        </Button>
      </div>
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
    <span
      className={cn(
        "inline-flex min-w-[28px] items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        n === 0 ? "border-border bg-transparent text-muted-foreground" : cls,
      )}
    >
      {n}
    </span>
  );
}

function PerguntaFechamento({ pergunta, idx }: { pergunta: string; idx: number }) {
  const [val, setVal] = useState<string>(idx === 3 ? "Nao" : "Sim");
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm text-foreground">{pergunta}</p>
        <RadioGroup value={val} onValueChange={setVal} className="flex gap-3">
          {["Sim", "Nao", "NA"].map((v) => (
            <Label
              key={v}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
            >
              <RadioGroupItem value={v} />
              {v === "Nao" ? "Não" : v === "NA" ? "N.A." : v}
            </Label>
          ))}
        </RadioGroup>
      </div>
      {val === "Nao" && (
        <Textarea
          className="mt-2 min-h-[64px]"
          placeholder="Justifique a resposta 'Não'…"
          defaultValue="Reclamações do último trimestre ainda estão em análise sem resposta formal ao cliente."
        />
      )}
    </div>
  );
}

function AcaoCard({
  titulo,
  descricao,
  defaultChecked,
}: {
  titulo: string;
  descricao: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors",
        on ? "border-brand bg-brand-soft" : "border-border bg-card hover:border-brand/40",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full border",
            on ? "border-brand bg-brand text-white" : "border-border bg-background",
          )}
        >
          {on && <CheckCircle2 className="h-4 w-4" />}
        </span>
        <span className="text-sm font-semibold text-foreground">{titulo}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>
    </button>
  );
}

function AssinaturaBloco({ titulo, nome, cargo }: { titulo: string; nome: string; cargo: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </div>
      <div className="mt-4 border-b border-dashed border-border pb-1 text-center font-serif italic text-brand">
        {nome}
      </div>
      <div className="mt-1 text-center text-xs text-foreground">{nome}</div>
      <div className="text-center text-[11px] text-muted-foreground">{cargo}</div>
    </div>
  );
}

// Suppress unused warnings for reserved imports
void Accordion;
void AccordionContent;
void AccordionItem;
void AccordionTrigger;