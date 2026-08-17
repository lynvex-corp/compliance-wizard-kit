import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BookOpen, Megaphone, CheckCircle2, AlertTriangle, CalendarClock, Check, Upload,
  Users, Plus, Clock, FileText, Send, Percent, GraduationCap, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ---------------------------------- tipos --------------------------------- */

type StatusGov = "Rascunho" | "Aguardando aprovação" | "Aprovado";
type Modalidade = "EAD" | "Externo" | "Interno" | "Misto";
type TipoAcao = "Informe" | "Jogo" | "Pílula de conhecimento" | "Vídeo" | "Outro";

const MODALIDADES: Modalidade[] = ["EAD", "Externo", "Interno", "Misto"];
const TIPOS_ACAO: TipoAcao[] = ["Informe", "Jogo", "Pílula de conhecimento", "Vídeo", "Outro"];

interface Participante { nome: string; presente: boolean }

interface Planejamento {
  id: string;
  treinamento: string;
  cargo: string;
  dataPlanejada: string;
  cargaHoraria: string;
  instrutor: string;
  modalidade: Modalidade;
  dataRealizacao: string | null;
  participantes: Participante[];
  anexos: string[];
  metodoAvaliacao: string;
  avaliador: string;
  eficaciaAprovada: boolean | null;
  justificativa: string;
}

interface AcaoConscientizacao {
  id: string;
  titulo: string;
  tipo: TipoAcao;
  conteudo: string;
  publico: string;
  dataPublicacao: string;
  publicada: boolean;
  cientes: Array<{ nome: string; em: string | null }>;
}

/* --------------------------------- dados ---------------------------------- */

const CARGOS = [
  "Analista da Qualidade",
  "Auxiliar Administrativo",
  "Coordenador de Produção",
  "Gestor da Qualidade",
  "Operador de Produção",
  "Técnico de Manutenção",
];

const TREINAMENTOS = [
  "Análise de causa raiz",
  "Auditor Interno ISO 9001",
  "BPF — Boas Práticas",
  "ISO 9001:2015 — Interpretação",
  "NR-06 — EPI",
  "NR-10 — Segurança elétrica",
];

// matriz[cargo][treinamento] = exigido
const MATRIZ: Record<string, string[]> = {
  "Analista da Qualidade": ["Análise de causa raiz", "Auditor Interno ISO 9001", "ISO 9001:2015 — Interpretação", "BPF — Boas Práticas"],
  "Auxiliar Administrativo": ["ISO 9001:2015 — Interpretação"],
  "Coordenador de Produção": ["Análise de causa raiz", "BPF — Boas Práticas", "ISO 9001:2015 — Interpretação", "NR-06 — EPI"],
  "Gestor da Qualidade": ["Análise de causa raiz", "Auditor Interno ISO 9001", "ISO 9001:2015 — Interpretação"],
  "Operador de Produção": ["BPF — Boas Práticas", "NR-06 — EPI"],
  "Técnico de Manutenção": ["NR-06 — EPI", "NR-10 — Segurança elétrica", "BPF — Boas Práticas"],
};

const PESSOAS: Record<string, string[]> = {
  "Analista da Qualidade": ["Fernanda Lima", "Rafael Costa", "Juliana Peixoto"],
  "Auxiliar Administrativo": ["Beatriz Souza"],
  "Coordenador de Produção": ["Ana Ribeiro"],
  "Gestor da Qualidade": ["Fernanda Lima"],
  "Operador de Produção": ["Marcos Vinícius", "Diego Almeida", "Carla Menezes"],
  "Técnico de Manutenção": ["Diego Almeida"],
};

const key = (cargo: string, t: string) => `${cargo}|${t}`;

function seedPlanejamentos(): Record<string, Planejamento> {
  const base: Array<Partial<Planejamento> & { cargo: string; treinamento: string }> = [
    { cargo: "Analista da Qualidade", treinamento: "Auditor Interno ISO 9001", dataPlanejada: "2026-03-10", dataRealizacao: "2026-03-10", eficaciaAprovada: true, modalidade: "Externo", instrutor: "Bureau Veritas", cargaHoraria: "16" },
    { cargo: "Analista da Qualidade", treinamento: "Análise de causa raiz", dataPlanejada: "2026-05-06", dataRealizacao: "2026-05-06", eficaciaAprovada: false, modalidade: "Interno", instrutor: "Fernanda Lima", cargaHoraria: "8", justificativa: "Reprovado — participantes não aplicaram a ferramenta nos registros de NC auditados após 60 dias." },
    { cargo: "Operador de Produção", treinamento: "BPF — Boas Práticas", dataPlanejada: "2026-04-18", dataRealizacao: "2026-04-18", eficaciaAprovada: true, modalidade: "Interno", instrutor: "Juliana Peixoto", cargaHoraria: "4" },
    { cargo: "Operador de Produção", treinamento: "NR-06 — EPI", dataPlanejada: "2026-06-22", dataRealizacao: null, modalidade: "Interno", instrutor: "SESMT", cargaHoraria: "4" },
    { cargo: "Técnico de Manutenção", treinamento: "NR-10 — Segurança elétrica", dataPlanejada: "2026-07-30", dataRealizacao: null, modalidade: "Externo", instrutor: "Senai", cargaHoraria: "40" },
    { cargo: "Coordenador de Produção", treinamento: "ISO 9001:2015 — Interpretação", dataPlanejada: "2026-09-14", dataRealizacao: null, modalidade: "EAD", instrutor: "Jáwda Academy", cargaHoraria: "12" },
  ];
  const out: Record<string, Planejamento> = {};
  for (const b of base) {
    const k = key(b.cargo, b.treinamento);
    out[k] = {
      id: k,
      treinamento: b.treinamento,
      cargo: b.cargo,
      dataPlanejada: b.dataPlanejada ?? "",
      cargaHoraria: b.cargaHoraria ?? "",
      instrutor: b.instrutor ?? "",
      modalidade: (b.modalidade as Modalidade) ?? "Interno",
      dataRealizacao: b.dataRealizacao ?? null,
      participantes: (PESSOAS[b.cargo] ?? []).map((n) => ({ nome: n, presente: !!b.dataRealizacao })),
      anexos: b.dataRealizacao ? ["lista-presenca.pdf"] : [],
      metodoAvaliacao: b.dataRealizacao ? "Observação em campo + reinspeção" : "",
      avaliador: b.dataRealizacao ? "Fernanda Lima" : "",
      eficaciaAprovada: b.eficaciaAprovada ?? null,
      justificativa: b.justificativa ?? "",
    };
  }
  return out;
}

function novoPlanejamento(cargo: string, treinamento: string): Planejamento {
  return {
    id: key(cargo, treinamento), treinamento, cargo, dataPlanejada: "", cargaHoraria: "",
    instrutor: "", modalidade: "Interno", dataRealizacao: null,
    participantes: (PESSOAS[cargo] ?? []).map((n) => ({ nome: n, presente: false })),
    anexos: [], metodoAvaliacao: "", avaliador: "", eficaciaAprovada: null, justificativa: "",
  };
}

const ACOES_INICIAIS: AcaoConscientizacao[] = [
  {
    id: "c1", titulo: "Política da Qualidade — o que ela significa no seu dia a dia", tipo: "Pílula de conhecimento",
    conteudo: "Revisão da Política da Qualidade, dos objetivos 2026 e de como cada área contribui para os resultados do SGQ.",
    publico: "Todos", dataPublicacao: "2026-06-02", publicada: true,
    cientes: [
      { nome: "Fernanda Lima", em: "02/06/2026 09:12" },
      { nome: "Rafael Costa", em: "02/06/2026 10:41" },
      { nome: "Ana Ribeiro", em: "03/06/2026 08:05" },
      { nome: "Diego Almeida", em: null },
      { nome: "Marcos Vinícius", em: null },
      { nome: "Beatriz Souza", em: "04/06/2026 14:20" },
      { nome: "Carla Menezes", em: null },
      { nome: "Juliana Peixoto", em: "02/06/2026 16:33" },
    ],
  },
  {
    id: "c2", titulo: "Implicações de não atender aos requisitos do SGQ", tipo: "Vídeo",
    conteudo: "Vídeo de 6 minutos com casos reais de não conformidade e seus impactos em cliente, custo e certificação.",
    publico: "Produção", dataPublicacao: "2026-07-15", publicada: true,
    cientes: [
      { nome: "Marcos Vinícius", em: "15/07/2026 07:55" },
      { nome: "Diego Almeida", em: "15/07/2026 08:10" },
      { nome: "Carla Menezes", em: null },
      { nome: "Ana Ribeiro", em: "16/07/2026 09:00" },
    ],
  },
  {
    id: "c3", titulo: "Quiz: objetivos da qualidade 2026", tipo: "Jogo",
    conteudo: "Jogo de 10 perguntas sobre metas de qualidade, indicadores e contribuição individual.",
    publico: "Todos", dataPublicacao: "2026-08-20", publicada: false, cientes: [],
  },
];

/* -------------------------------- auxiliares ------------------------------- */

const fmt = (iso: string | null) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—";

const HOJE = new Date("2026-08-17T12:00:00");

function statusPlan(p: Planejamento) {
  if (p.dataRealizacao) return "Realizado" as const;
  if (p.dataPlanejada && new Date(`${p.dataPlanejada}T12:00:00`) < HOJE) return "Vencido" as const;
  if (p.dataPlanejada) return "Programado" as const;
  return "Não planejado" as const;
}

const toneStatus: Record<string, string> = {
  Realizado: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Vencido: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
  Programado: "bg-brand-soft text-brand border-brand/20",
  "Não planejado": "bg-muted text-muted-foreground border-border",
};

function Kpi({ icon: Icon, label, value, hint, tone }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string; tone: string;
}) {
  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone)}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold leading-tight text-foreground">{value}</div>
          <div className="truncate text-[11px] text-muted-foreground">{hint}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ governança bar ----------------------------- */

function GovernancaBar({ titulo, status, onAvancar }: {
  titulo: string; status: StatusGov; onAvancar: () => void;
}) {
  const etapas: StatusGov[] = ["Rascunho", "Aguardando aprovação", "Aprovado"];
  const idx = etapas.indexOf(status);
  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          {etapas.map((e, i) => (
            <div key={e} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                  i <= idx ? "bg-brand text-white" : "bg-muted text-muted-foreground",
                )}>
                  {i < idx ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn("text-xs font-medium", i <= idx ? "text-foreground" : "text-muted-foreground")}>{e}</span>
              </div>
              {i < etapas.length - 1 && <span className={cn("h-px w-8", i < idx ? "bg-brand" : "bg-border")} />}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] leading-tight text-muted-foreground">
            <div>Elaborado por <span className="text-foreground">Gestor da Qualidade</span></div>
            <div>Aprovado por <span className="text-foreground">Alta Direção</span></div>
          </div>
          {status !== "Aprovado" && (
            <Button size="sm" className="rounded-lg" onClick={onAvancar}>
              {status === "Rascunho" ? "Enviar para aprovação" : "Aprovar"}
            </Button>
          )}
          {status === "Aprovado" && (
            <Badge variant="outline" className="rounded-md border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]">
              {titulo} aprovado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ seção A: treinos --------------------------- */

function SecaoTreinamentos() {
  const [planos, setPlanos] = useState<Record<string, Planejamento>>(seedPlanejamentos);
  const [aberto, setAberto] = useState<Planejamento | null>(null);
  const [status, setStatus] = useState<StatusGov>("Aguardando aprovação");

  const exigidos = useMemo(
    () => Object.entries(MATRIZ).flatMap(([c, ts]) => ts.map((t) => planos[key(c, t)] ?? novoPlanejamento(c, t))),
    [planos],
  );

  const kpis = useMemo(() => {
    const planejados = exigidos.filter((p) => p.dataPlanejada).length;
    const realizados = exigidos.filter((p) => p.dataRealizacao).length;
    const avaliados = exigidos.filter((p) => p.eficaciaAprovada !== null);
    const aprovados = avaliados.filter((p) => p.eficaciaAprovada).length;
    const vencidos = exigidos.filter((p) => statusPlan(p) === "Vencido" || statusPlan(p) === "Não planejado").length;
    return {
      planejados, realizados, vencidos,
      taxa: avaliados.length ? Math.round((aprovados / avaliados.length) * 100) : 0,
    };
  }, [exigidos]);

  const serie = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses.map((m, i) => ({
      mes: m,
      planejados: exigidos.filter((p) => p.dataPlanejada && new Date(`${p.dataPlanejada}T12:00:00`).getMonth() === i).length,
      realizados: exigidos.filter((p) => p.dataRealizacao && new Date(`${p.dataRealizacao}T12:00:00`).getMonth() === i).length,
    }));
  }, [exigidos]);

  const chartConfig: ChartConfig = {
    planejados: { label: "Planejados", color: "var(--brand)" },
    realizados: { label: "Realizados", color: "var(--success)" },
  };

  const salvar = (p: Planejamento) => {
    setPlanos((s) => ({ ...s, [p.id]: p }));
    setAberto(null);
    toast.success("Treinamento atualizado", { description: `${p.treinamento} — ${p.cargo}` });
  };

  return (
    <div className="space-y-5">
      <GovernancaBar
        titulo="Plano de treinamento"
        status={status}
        onAvancar={() => {
          setStatus(status === "Rascunho" ? "Aguardando aprovação" : "Aprovado");
          toast.success(status === "Rascunho" ? "Enviado à Alta Direção" : "Plano de treinamento aprovado");
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarClock} label="Planejados no ano" value={String(kpis.planejados)} hint="Treinamentos com data definida" tone="bg-brand-soft text-brand" />
        <Kpi icon={CheckCircle2} label="Realizados" value={String(kpis.realizados)} hint="Com registro de execução" tone="bg-[color:var(--success)]/15 text-[color:var(--success)]" />
        <Kpi icon={Percent} label="Taxa de eficácia" value={`${kpis.taxa}%`} hint="Aprovados na 1ª avaliação" tone="bg-brand-soft text-brand" />
        <Kpi icon={AlertTriangle} label="Vencidos / não realizados" value={String(kpis.vencidos)} hint="Fora do prazo planejado" tone="bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]" />
      </div>

      <Card className="rounded-xl border-border/80 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Planejados x realizados no ano</h2>
            <p className="text-xs text-muted-foreground">Distribuição mensal do programa anual de treinamento</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart data={serie}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} width={24} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="planejados" fill="var(--color-planejados)" radius={4} />
              <Bar dataKey="realizados" fill="var(--color-realizados)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/80 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Matriz de treinamento anual</h2>
              <p className="text-xs text-muted-foreground">
                Linhas = cargos, colunas = treinamentos. Clique em uma célula marcada para abrir o planejamento.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              {(["Realizado", "Programado", "Vencido", "Não planejado"] as const).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2.5 w-2.5 rounded-full border", toneStatus[s])} />{s}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-auto rounded-lg border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Cargo
                  </th>
                  {TREINAMENTOS.map((t) => (
                    <th key={t} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground">
                      <div className="mx-auto max-w-[92px] leading-tight">{t}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CARGOS.map((cargo) => (
                  <tr key={cargo} className="border-t border-border/60">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium text-foreground">{cargo}</td>
                    {TREINAMENTOS.map((t) => {
                      const exigido = MATRIZ[cargo]?.includes(t);
                      if (!exigido) {
                        return <td key={t} className="px-2 py-2 text-center text-muted-foreground/50">—</td>;
                      }
                      const p = planos[key(cargo, t)] ?? novoPlanejamento(cargo, t);
                      const st = statusPlan(p);
                      return (
                        <td key={t} className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => setAberto(p)}
                            className={cn(
                              "mx-auto flex w-full max-w-[110px] flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition hover:brightness-95",
                              toneStatus[st],
                            )}
                          >
                            <span className="text-[10px] font-semibold">Exigido</span>
                            <span className="text-[9px] opacity-90">{st}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {aberto && <DialogPlanejamento plano={aberto} onClose={() => setAberto(null)} onSave={salvar} />}
    </div>
  );
}

function DialogPlanejamento({ plano, onClose, onSave }: {
  plano: Planejamento; onClose: () => void; onSave: (p: Planejamento) => void;
}) {
  const [p, setP] = useState<Planejamento>(plano);
  const set = <K extends keyof Planejamento>(k: K, v: Planejamento[K]) => setP((s) => ({ ...s, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{p.treinamento}</DialogTitle>
          <DialogDescription>Planejamento, execução e verificação de eficácia — cargo {p.cargo}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Planejamento</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome do treinamento</Label>
                <Input value={p.treinamento} onChange={(e) => set("treinamento", e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cargo(s) alvo</Label>
                <Input value={p.cargo} onChange={(e) => set("cargo", e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data planejada</Label>
                <Input type="date" value={p.dataPlanejada} onChange={(e) => set("dataPlanejada", e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Carga horária (h)</Label>
                <Input value={p.cargaHoraria} onChange={(e) => set("cargaHoraria", e.target.value)} className="h-9 rounded-lg text-sm" placeholder="8" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Instrutor / fornecedor</Label>
                <Input value={p.instrutor} onChange={(e) => set("instrutor", e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Modalidade</Label>
                <Select value={p.modalidade} onValueChange={(v) => set("modalidade", v as Modalidade)}>
                  <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODALIDADES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Execução</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Data de realização</Label>
                <Input type="date" value={p.dataRealizacao ?? ""} onChange={(e) => set("dataRealizacao", e.target.value || null)} className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Lista de presença / certificado</Label>
                <Button
                  type="button" variant="outline" size="sm"
                  className="h-9 w-full justify-start rounded-lg text-xs"
                  onClick={() => { set("anexos", [...p.anexos, `lista-presenca-${p.anexos.length + 1}.pdf`]); toast.success("Anexo adicionado"); }}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" /> Anexar arquivo
                </Button>
              </div>
            </div>
            {p.anexos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {p.anexos.map((a, i) => (
                  <Badge key={i} variant="outline" className="gap-1 rounded-md">
                    <FileText className="h-3 w-3" /> {a}
                    <button type="button" onClick={() => set("anexos", p.anexos.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participantes presentes</div>
              <div className="divide-y divide-border/60 rounded-lg border border-border/60">
                {p.participantes.map((part, i) => (
                  <label key={part.nome} className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm">
                    <span>{part.nome}</span>
                    <input
                      type="checkbox" checked={part.presente}
                      onChange={(e) => set("participantes", p.participantes.map((x, j) => j === i ? { ...x, presente: e.target.checked } : x))}
                      className="h-4 w-4 accent-[color:var(--brand)]"
                    />
                  </label>
                ))}
                {p.participantes.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum empregado neste cargo.</div>}
              </div>
            </div>
          </section>

          <Separator />

          {/* Mesmo modelo usado na verificação de eficácia dos planos de ação */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Verificação de Eficácia</h3>
              <p className="text-xs text-muted-foreground">Resultado da avaliação pós-implementação</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Método de avaliação</Label>
                <Input value={p.metodoAvaliacao} onChange={(e) => set("metodoAvaliacao", e.target.value)} placeholder="Observação em campo + reinspeção" className="h-9 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Avaliador</Label>
                <Input value={p.avaliador} onChange={(e) => set("avaliador", e.target.value)} placeholder="Fernanda Lima" className="h-9 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button" size="sm" variant={p.eficaciaAprovada === true ? "default" : "outline"}
                  className="rounded-lg" onClick={() => { set("eficaciaAprovada", true); set("justificativa", ""); }}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Aprovado
                </Button>
                <Button
                  type="button" size="sm" variant={p.eficaciaAprovada === false ? "destructive" : "outline"}
                  className="rounded-lg" onClick={() => set("eficaciaAprovada", false)}
                >
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Reprovado
                </Button>
                <Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => set("eficaciaAprovada", null)}>
                  Aguardando avaliação
                </Button>
              </div>
              {p.eficaciaAprovada === true && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--success)]">
                  <Check className="h-4 w-4" /> Aprovado — ação eficaz confirmada
                </div>
              )}
              {p.eficaciaAprovada === false && (
                <div className="mt-3 space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--severity-critical)]">
                    <AlertTriangle className="h-4 w-4" /> Reprovado — necessária nova iteração
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Justificativa da reprovação</Label>
                    <Textarea
                      value={p.justificativa} onChange={(e) => set("justificativa", e.target.value)}
                      rows={3} className="rounded-lg text-sm"
                      placeholder="Descreva por que o treinamento não foi considerado eficaz e o que será refeito."
                    />
                  </div>
                </div>
              )}
              {p.eficaciaAprovada === null && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/20 px-4 py-2.5 text-sm font-semibold text-[color:var(--severity-high)]">
                  <CalendarClock className="h-4 w-4" /> Aguardando avaliação
                </div>
              )}
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancelar</Button>
          <Button
            className="rounded-lg"
            onClick={() => {
              if (p.eficaciaAprovada === false && !p.justificativa.trim()) {
                toast.error("Informe a justificativa da reprovação.");
                return;
              }
              onSave(p);
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- seção B: conscientização ---------------------- */

const PUBLICOS = ["Todos", "Alta Direção", "Comercial", "Produção", "Qualidade", "RH"];
const EU = "Diego Almeida";

function SecaoConscientizacao() {
  const [acoes, setAcoes] = useState<AcaoConscientizacao[]>(ACOES_INICIAIS);
  const [status, setStatus] = useState<StatusGov>("Rascunho");
  const [nova, setNova] = useState(false);
  const [detalhe, setDetalhe] = useState<string | null>(null);

  const publicadas = acoes.filter((a) => a.publicada);
  const minhas = publicadas.filter((a) => a.cientes.some((c) => c.nome === EU));

  const darCiente = (id: string) => {
    const agora = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    setAcoes((s) => s.map((a) => a.id === id
      ? { ...a, cientes: a.cientes.map((c) => c.nome === EU ? { ...c, em: agora } : c) }
      : a));
    toast.success("Ciente registrado", { description: `Recebimento em ${agora}` });
  };

  const alcance = (a: AcaoConscientizacao) =>
    a.cientes.length ? Math.round((a.cientes.filter((c) => c.em).length / a.cientes.length) * 100) : 0;

  const aberta = acoes.find((a) => a.id === detalhe) ?? null;

  return (
    <div className="space-y-5">
      <GovernancaBar
        titulo="Programa de conscientização"
        status={status}
        onAvancar={() => {
          setStatus(status === "Rascunho" ? "Aguardando aprovação" : "Aprovado");
          toast.success(status === "Rascunho" ? "Enviado à Alta Direção" : "Programa de conscientização aprovado");
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi icon={Megaphone} label="Ações cadastradas" value={String(acoes.length)} hint="Política, objetivos e implicações" tone="bg-brand-soft text-brand" />
        <Kpi icon={Send} label="Publicadas" value={String(publicadas.length)} hint="Visíveis aos empregados" tone="bg-[color:var(--success)]/15 text-[color:var(--success)]" />
        <Kpi
          icon={Percent} label="Alcance médio"
          value={`${publicadas.length ? Math.round(publicadas.reduce((s, a) => s + alcance(a), 0) / publicadas.length) : 0}%`}
          hint="Empregados que deram ciente" tone="bg-brand-soft text-brand"
        />
      </div>

      <Card className="rounded-xl border-border/80 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Ações de conscientização</h2>
              <p className="text-xs text-muted-foreground">
                Política da qualidade, objetivos, contribuição de cada empregado e implicações da não conformidade.
              </p>
            </div>
            <Button size="sm" className="rounded-lg" onClick={() => setNova(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Nova ação
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {acoes.map((a) => (
              <div key={a.id} className="flex flex-col gap-2 rounded-xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="rounded-md text-[10px]">{a.tipo}</Badge>
                  <Badge variant="outline" className={cn("rounded-md text-[10px]",
                    a.publicada ? toneStatus.Realizado : toneStatus["Não planejado"])}>
                    {a.publicada ? "Publicada" : "Rascunho"}
                  </Badge>
                </div>
                <div className="text-sm font-semibold leading-snug text-foreground">{a.titulo}</div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.conteudo}</p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.publico}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {fmt(a.dataPublicacao)}</span>
                </div>
                {a.publicada && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Alcance</span>
                      <span className="font-semibold text-foreground">{alcance(a)}%</span>
                    </div>
                    <Progress value={alcance(a)} className="h-1.5" />
                  </div>
                )}
                <div className="mt-auto flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setDetalhe(a.id)}>
                    Acompanhamento
                  </Button>
                  {!a.publicada && (
                    <Button
                      size="sm" className="rounded-lg text-xs"
                      onClick={() => {
                        setAcoes((s) => s.map((x) => x.id === a.id ? {
                          ...x, publicada: true,
                          cientes: x.cientes.length ? x.cientes : ["Fernanda Lima", "Rafael Costa", "Ana Ribeiro", "Diego Almeida", "Marcos Vinícius", "Beatriz Souza"].map((n) => ({ nome: n, em: null })),
                        } : x));
                        toast.success("Ação publicada aos empregados");
                      }}
                    >
                      Publicar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/80 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Visualização do empregado</h2>
            <p className="text-xs text-muted-foreground">Como {EU} vê as ações publicadas para o seu perfil.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {minhas.map((a) => {
              const meu = a.cientes.find((c) => c.nome === EU);
              return (
                <div key={a.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-md text-[10px]">{a.tipo}</Badge>
                    <span className="text-[11px] text-muted-foreground">{fmt(a.dataPublicacao)}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-foreground">{a.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.conteudo}</p>
                  <div className="mt-3">
                    {meu?.em ? (
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--success)]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ciente registrado em {meu.em}
                      </div>
                    ) : (
                      <Button size="sm" className="rounded-lg" onClick={() => darCiente(a.id)}>
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Ciente
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {minhas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ação publicada para este perfil.</p>}
          </div>
        </CardContent>
      </Card>

      {nova && (
        <DialogNovaAcao
          onClose={() => setNova(false)}
          onSave={(a) => { setAcoes((s) => [a, ...s]); setNova(false); toast.success("Ação de conscientização criada"); }}
        />
      )}

      {aberta && (
        <Dialog open onOpenChange={(o) => !o && setDetalhe(null)}>
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{aberta.titulo}</DialogTitle>
              <DialogDescription>
                Acompanhamento de ciência — {aberta.cientes.filter((c) => c.em).length} de {aberta.cientes.length} empregados ({alcance(aberta)}%).
              </DialogDescription>
            </DialogHeader>
            <Progress value={alcance(aberta)} className="h-2" />
            <div className="divide-y divide-border/60 rounded-lg border border-border/60">
              {aberta.cientes.map((c) => (
                <div key={c.nome} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{c.nome}</span>
                  {c.em ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--success)]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {c.em}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Pendente
                    </span>
                  )}
                </div>
              ))}
              {aberta.cientes.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Ação ainda não publicada.</div>}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DialogNovaAcao({ onClose, onSave }: { onClose: () => void; onSave: (a: AcaoConscientizacao) => void }) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoAcao>("Informe");
  const [conteudo, setConteudo] = useState("");
  const [publico, setPublico] = useState("Todos");
  const [data, setData] = useState("");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova ação de conscientização</DialogTitle>
          <DialogDescription>Elaborada pelo Gestor da Qualidade e aprovada pela Alta Direção antes da publicação.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="h-9 rounded-lg text-sm" placeholder="Política da Qualidade — revisão 2026" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoAcao)}>
                <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS_ACAO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Público-alvo</Label>
              <Select value={publico} onValueChange={setPublico}>
                <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{PUBLICOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Conteúdo</Label>
            <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={4} className="rounded-lg text-sm" placeholder="Texto da comunicação, roteiro do vídeo ou descrição do material." />
            <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => toast.success("Anexo adicionado ao conteúdo")}>
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Anexar material
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data de publicação</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-9 rounded-lg text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancelar</Button>
          <Button
            className="rounded-lg"
            onClick={() => {
              if (!titulo.trim()) { toast.error("Informe o título da ação."); return; }
              onSave({
                id: `c${Date.now()}`, titulo, tipo, conteudo, publico,
                dataPublicacao: data || new Date().toISOString().slice(0, 10),
                publicada: false, cientes: [],
              });
            }}
          >
            Salvar como rascunho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- página ---------------------------------- */

export function AprendizagemPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-brand" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestão de Aprendizagem</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Treinamentos e conscientização — requisitos 7.2 (competência) e 7.3 (conscientização).
            </p>
          </div>
          <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
            Pessoas
          </Badge>
        </header>

        <Tabs defaultValue="treinamentos">
          <TabsList className="rounded-lg">
            <TabsTrigger value="treinamentos" className="gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Treinamentos
            </TabsTrigger>
            <TabsTrigger value="conscientizacao" className="gap-1.5 text-xs">
              <Megaphone className="h-3.5 w-3.5" /> Conscientização
            </TabsTrigger>
          </TabsList>
          <TabsContent value="treinamentos" className="mt-4">
            <SecaoTreinamentos />
          </TabsContent>
          <TabsContent value="conscientizacao" className="mt-4">
            <SecaoConscientizacao />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
