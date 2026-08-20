import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BookOpen, Megaphone, CheckCircle2, AlertTriangle, CalendarClock, Check, Upload,
  Users, Plus, Clock, FileText, Send, Percent, GraduationCap, X, History, HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CARGOS_SEED, NOMES_POR_CARGO_NOME, TODAS_AS_PESSOAS } from "@/lib/pessoas-data";

/* ---------------------------------- tipos --------------------------------- */

type StatusGov = "Rascunho" | "Aguardando aprovação" | "Aprovado";
type Modalidade = "EAD" | "Externo" | "Interno" | "Misto";
type TipoAcao = "Informe" | "Perguntas e Respostas" | "Pílula de conhecimento" | "Vídeo" | "Outro";
type PerfilGov = "Diretoria" | "Gestor da Qualidade";

const MODALIDADES: Modalidade[] = ["EAD", "Externo", "Interno", "Misto"];
const TIPOS_ACAO: TipoAcao[] = ["Informe", "Outro", "Perguntas e Respostas", "Pílula de conhecimento", "Vídeo"];

interface Participante { nome: string; presente: boolean; eficacia: "Aprovado" | "Reprovado" | null }

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
  justificativa: string;
}

interface Quiz { pergunta: string; opcoes: string[]; correta: number }

interface AcaoConscientizacao {
  id: string;
  titulo: string;
  tipo: TipoAcao;
  conteudo: string;
  publico: string;
  anexo: string | null;
  dataPublicacao: string | null;
  programadaPara: string;
  publicada: boolean;
  quiz: Quiz | null;
  cientes: Array<{ nome: string; em: string | null }>;
}

/* --------------------------------- dados ---------------------------------- */

const CARGOS = CARGOS_SEED.map((c) => c.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));

const TREINAMENTOS_INICIAIS = Array.from(
  new Set(CARGOS_SEED.flatMap((c) => c.treinamentos)),
).sort((a, b) => a.localeCompare(b, "pt-BR"));

const MATRIZ_INICIAL: Record<string, boolean> = {};
for (const c of CARGOS_SEED) for (const t of c.treinamentos) MATRIZ_INICIAL[`${c.nome}|${t}`] = true;

const PESSOAS_POR_CARGO = NOMES_POR_CARGO_NOME;
const TODOS_OS_NOMES = TODAS_AS_PESSOAS.map((p) => p.nome);

const key = (cargo: string, t: string) => `${cargo}|${t}`;

const participantesDoCargo = (cargo: string, presentes = false): Participante[] =>
  (PESSOAS_POR_CARGO[cargo] ?? []).map((n) => ({ nome: n, presente: presentes, eficacia: presentes ? "Aprovado" : null }));

function seedPlanejamentos(): Record<string, Planejamento> {
  const base: Array<Partial<Planejamento> & { cargo: string; treinamento: string }> = [
    { cargo: "Analista da Qualidade", treinamento: "Auditor Interno ISO 9001", dataPlanejada: "2026-03-10", dataRealizacao: "2026-03-10", modalidade: "Externo", instrutor: "Bureau Veritas", cargaHoraria: "16" },
    { cargo: "Analista da Qualidade", treinamento: "Análise de causa raiz", dataPlanejada: "2026-05-06", dataRealizacao: "2026-05-06", modalidade: "Interno", instrutor: "Fernanda Lima", cargaHoraria: "8" },
    { cargo: "Operador de Produção", treinamento: "BPF — Boas Práticas", dataPlanejada: "2026-04-18", dataRealizacao: "2026-04-18", modalidade: "Interno", instrutor: "Juliana Peixoto", cargaHoraria: "4" },
    { cargo: "Operador de Produção", treinamento: "NR-06 — EPI", dataPlanejada: "2026-06-22", dataRealizacao: null, modalidade: "Interno", instrutor: "SESMT", cargaHoraria: "4" },
    { cargo: "Técnico de Manutenção", treinamento: "NR-10 — Segurança elétrica", dataPlanejada: "2026-07-30", dataRealizacao: null, modalidade: "Externo", instrutor: "Senai", cargaHoraria: "40" },
    { cargo: "Coordenador de Produção", treinamento: "ISO 9001:2015 — Interpretação", dataPlanejada: "2026-09-14", dataRealizacao: null, modalidade: "EAD", instrutor: "Jáwda Academy", cargaHoraria: "12" },
  ];
  const out: Record<string, Planejamento> = {};
  for (const b of base) {
    const k = key(b.cargo, b.treinamento);
    out[k] = {
      id: k, treinamento: b.treinamento, cargo: b.cargo,
      dataPlanejada: b.dataPlanejada ?? "", cargaHoraria: b.cargaHoraria ?? "",
      instrutor: b.instrutor ?? "", modalidade: (b.modalidade as Modalidade) ?? "Interno",
      dataRealizacao: b.dataRealizacao ?? null,
      participantes: participantesDoCargo(b.cargo, !!b.dataRealizacao),
      anexos: b.dataRealizacao ? ["lista-presenca.pdf"] : [],
      metodoAvaliacao: b.dataRealizacao ? "Observação em campo + reinspeção" : "",
      avaliador: b.dataRealizacao ? "Fernanda Lima" : "",
      justificativa: "",
    };
  }
  return out;
}

function novoPlanejamento(cargo: string, treinamento: string): Planejamento {
  return {
    id: key(cargo, treinamento), treinamento, cargo, dataPlanejada: "", cargaHoraria: "",
    instrutor: "", modalidade: "Interno", dataRealizacao: null,
    participantes: participantesDoCargo(cargo), anexos: [], metodoAvaliacao: "",
    avaliador: "", justificativa: "",
  };
}

const REVISOES_MATRIZ = [
  { versao: "03", data: "12/07/2026", autor: "Fernanda Lima", aprovador: "Diretoria", nota: "Inclusão do treinamento NR-10 para Técnico de Manutenção." },
  { versao: "02", data: "18/03/2026", autor: "Fernanda Lima", aprovador: "Diretoria", nota: "Revisão da aplicabilidade por cargo após reestruturação da produção." },
  { versao: "01", data: "05/01/2026", autor: "Fernanda Lima", aprovador: "Diretoria", nota: "Emissão inicial da matriz anual." },
];

const ACOES_INICIAIS: AcaoConscientizacao[] = [
  {
    id: "c1", titulo: "Política da Qualidade — o que ela significa no seu dia a dia", tipo: "Pílula de conhecimento",
    conteudo: "Revisão da Política da Qualidade, dos objetivos 2026 e de como cada área contribui para os resultados.",
    publico: "Todos", anexo: "politica-qualidade-2026.pdf", dataPublicacao: "2026-06-02", programadaPara: "",
    publicada: true, quiz: null,
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
    id: "c2", titulo: "Implicações de não atender aos requisitos do sistema de gestão", tipo: "Vídeo",
    conteudo: "Vídeo de 6 minutos com casos reais de não conformidade e seus impactos em cliente, custo e certificação.",
    publico: "Produção", anexo: null, dataPublicacao: "2026-07-15", programadaPara: "", publicada: true, quiz: null,
    cientes: [
      { nome: "Marcos Vinícius", em: "15/07/2026 07:55" },
      { nome: "Diego Almeida", em: "15/07/2026 08:10" },
      { nome: "Carla Menezes", em: null },
      { nome: "Ana Ribeiro", em: "16/07/2026 09:00" },
    ],
  },
  {
    id: "c3", titulo: "Objetivos da qualidade 2026", tipo: "Perguntas e Respostas",
    conteudo: "Quiz rápido para fixar as metas da qualidade e a contribuição de cada um.",
    publico: "Todos", anexo: null, dataPublicacao: null, programadaPara: "", publicada: false,
    quiz: {
      pergunta: "Qual é o principal objetivo da qualidade para 2026?",
      opcoes: ["Reduzir o retrabalho em 20%", "Aumentar o número de reuniões", "Contratar mais auditores"],
      correta: 0,
    },
    cientes: [],
  },
];

/* -------------------------------- auxiliares ------------------------------- */

const fmt = (iso: string | null) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR") : "—");
const HOJE = new Date("2026-08-20T12:00:00");

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

function Kpi({ icon: Icon, label, value, hint, tone, detalhes }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string; tone: string;
  detalhes?: string[];
}) {
  const card = (
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
  if (!detalhes) return card;
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild><div className="cursor-help">{card}</div></HoverCardTrigger>
      <HoverCardContent className="w-80 text-xs">
        <div className="mb-1 font-semibold">{label}</div>
        {detalhes.length === 0 ? <p className="text-muted-foreground">Nenhum treinamento nesta condição.</p> : (
          <ul className="space-y-0.5 text-muted-foreground">
            {detalhes.map((d, i) => <li key={i}>• {d}</li>)}
          </ul>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

/* ------------------------------ governança bar ----------------------------- */

function GovernancaBar({ titulo, status, perfil, onAvancar }: {
  titulo: string; status: StatusGov; perfil: PerfilGov; onAvancar: () => void;
}) {
  const etapas: StatusGov[] = ["Rascunho", "Aguardando aprovação", "Aprovado"];
  const idx = etapas.indexOf(status);
  const podeAprovar = perfil === "Diretoria";
  const acaoBloqueada = status === "Aguardando aprovação" && !podeAprovar;

  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          {etapas.map((e, i) => (
            <div key={e} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                  i <= idx ? "bg-brand text-white" : "bg-muted text-muted-foreground")}>
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
            <div>Elaborado por <span className="text-foreground">Gestor da Qualidade ou Diretoria</span></div>
            <div>Aprovado por <span className="text-foreground">Diretoria</span></div>
          </div>
          {status !== "Aprovado" && (
            <Button size="sm" className="rounded-lg" disabled={acaoBloqueada} onClick={onAvancar}
              title={acaoBloqueada ? "Somente a Diretoria aprova o plano anual" : undefined}>
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

function SecaoTreinamentos({ perfil }: { perfil: PerfilGov }) {
  const [treinamentos, setTreinamentos] = useState<string[]>(TREINAMENTOS_INICIAIS);
  const [aplicavel, setAplicavel] = useState<Record<string, boolean>>(MATRIZ_INICIAL);
  const [planos, setPlanos] = useState<Record<string, Planejamento>>(seedPlanejamentos);
  const [aberto, setAberto] = useState<Planejamento | null>(null);
  const [status, setStatus] = useState<StatusGov>("Aguardando aprovação");
  const [novoTreino, setNovoTreino] = useState<string | null>(null);
  const [verHistorico, setVerHistorico] = useState(false);
  const [pessoasDoCargo, setPessoasDoCargo] = useState<string | null>(null);

  const aplicaveis = useMemo(
    () => CARGOS.flatMap((c) => treinamentos.filter((t) => aplicavel[key(c, t)]).map((t) => planos[key(c, t)] ?? novoPlanejamento(c, t))),
    [treinamentos, aplicavel, planos],
  );

  const rotulo = (p: Planejamento) => `${p.treinamento} — ${p.cargo}`;

  const kpis = useMemo(() => {
    const previstos = aplicaveis.filter((p) => p.dataPlanejada);
    const realizados = aplicaveis.filter((p) => p.dataRealizacao);
    const avaliados = aplicaveis.flatMap((p) => p.participantes.filter((x) => x.eficacia));
    const aprovados = avaliados.filter((x) => x.eficacia === "Aprovado").length;
    const pendentes = aplicaveis.filter((p) => statusPlan(p) === "Vencido" || statusPlan(p) === "Não planejado");
    return {
      previstos, realizados, pendentes,
      taxaRealizacao: previstos.length ? Math.round((realizados.length / previstos.length) * 100) : 0,
      taxaEficacia: avaliados.length ? Math.round((aprovados / avaliados.length) * 100) : 0,
      avaliados: avaliados.length,
    };
  }, [aplicaveis]);

  const serie = useMemo(() => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses.map((m, i) => ({
      mes: m,
      previstos: aplicaveis.filter((p) => p.dataPlanejada && new Date(`${p.dataPlanejada}T12:00:00`).getMonth() === i).length,
      realizados: aplicaveis.filter((p) => p.dataRealizacao && new Date(`${p.dataRealizacao}T12:00:00`).getMonth() === i).length,
    }));
  }, [aplicaveis]);

  const chartConfig: ChartConfig = {
    previstos: { label: "Previstos", color: "var(--brand)" },
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
        titulo="Plano anual de treinamento"
        status={status}
        perfil={perfil}
        onAvancar={() => {
          setStatus(status === "Rascunho" ? "Aguardando aprovação" : "Aprovado");
          toast.success(status === "Rascunho" ? "Enviado para aprovação da Diretoria" : "Plano anual aprovado pela Diretoria");
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CalendarClock} label="Previstos no ano" value={String(kpis.previstos.length)}
          hint="Com data planejada" tone="bg-brand-soft text-brand" detalhes={kpis.previstos.map(rotulo)} />
        <Kpi icon={CheckCircle2} label="Realizados" value={String(kpis.realizados.length)}
          hint="Com registro de execução" tone="bg-[color:var(--success)]/15 text-[color:var(--success)]"
          detalhes={kpis.realizados.map(rotulo)} />
        <Kpi icon={Percent} label="Taxa de realização" value={`${kpis.taxaRealizacao}%`}
          hint={`${kpis.realizados.length} realizados de ${kpis.previstos.length} previstos`} tone="bg-brand-soft text-brand"
          detalhes={kpis.previstos.map((p) => `${rotulo(p)} — ${p.dataRealizacao ? "realizado" : "pendente"}`)} />
        <Kpi icon={AlertTriangle} label="Vencidos / não planejados" value={String(kpis.pendentes.length)}
          hint="Fora do prazo ou sem data" tone="bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]"
          detalhes={kpis.pendentes.map(rotulo)} />
      </div>

      <Card className="rounded-xl border-border/80 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Previsto x realizado no ano</h2>
              <p className="text-xs text-muted-foreground">Distribuição mensal do plano anual de treinamento</p>
            </div>
            <Badge variant="outline" className="rounded-md text-[11px]">
              Taxa de realização: {kpis.taxaRealizacao}% · Eficácia: {kpis.taxaEficacia}% ({kpis.avaliados} avaliações)
            </Badge>
          </div>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart data={serie}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} width={24} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="previstos" fill="var(--color-previstos)" radius={4} />
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
                Marque a aplicabilidade de cada treinamento por cargo. Clique no status para abrir o planejamento.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setVerHistorico(true)}>
                <History className="mr-1.5 h-3.5 w-3.5" /> Histórico de revisões
              </Button>
              <Button size="sm" className="rounded-lg text-xs" onClick={() => setNovoTreino("")}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Incluir Treinamento
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {(["Realizado", "Programado", "Vencido", "Não planejado"] as const).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full border", toneStatus[s])} />{s}
              </span>
            ))}
          </div>
          <div className="overflow-auto rounded-lg border border-border/60">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Cargo
                  </th>
                  <th className="px-2 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground">Pessoas</th>
                  {treinamentos.map((t) => (
                    <th key={t} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground">
                      <div className="mx-auto max-w-[100px] leading-tight">{t}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CARGOS.map((cargo) => (
                  <tr key={cargo} className="border-t border-border/60">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium text-foreground">{cargo}</td>
                    <td className="px-2 py-2 text-center">
                      <button type="button" onClick={() => setPessoasDoCargo(cargo)}
                        title="Ver pessoas neste cargo"
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted">
                        <Users className="h-3.5 w-3.5 text-brand" />
                        {(PESSOAS_POR_CARGO[cargo] ?? []).length}
                      </button>
                    </td>
                    {treinamentos.map((t) => {
                      const k = key(cargo, t);
                      const aplica = !!aplicavel[k];
                      const p = planos[k] ?? novoPlanejamento(cargo, t);
                      const st = statusPlan(p);
                      return (
                        <td key={t} className="px-2 py-2">
                          <div className="flex flex-col items-center gap-1">
                            <Checkbox
                              checked={aplica}
                              onCheckedChange={(v) => setAplicavel((s) => ({ ...s, [k]: !!v }))}
                              aria-label={`Aplicável a ${cargo}`}
                            />
                            {aplica ? (
                              <button type="button" onClick={() => setAberto(p)}
                                className={cn("w-full max-w-[110px] rounded-lg border px-2 py-1 text-[9px] transition hover:brightness-95", toneStatus[st])}>
                                {st}
                              </button>
                            ) : (
                              <span className="text-[9px] text-muted-foreground/60">não aplicável</span>
                            )}
                          </div>
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

      {novoTreino !== null && (
        <Dialog open onOpenChange={(o) => !o && setNovoTreino(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Incluir treinamento na matriz</DialogTitle>
              <DialogDescription>O treinamento entra como coluna e você marca a aplicabilidade por cargo.</DialogDescription>
            </DialogHeader>
            <Input value={novoTreino} onChange={(e) => setNovoTreino(e.target.value)} placeholder="Ex.: NR-35 — Trabalho em altura" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoTreino(null)}>Cancelar</Button>
              <Button onClick={() => {
                const v = (novoTreino ?? "").trim();
                if (!v) { toast.error("Informe o nome do treinamento."); return; }
                if (treinamentos.includes(v)) { toast.error("Treinamento já existe na matriz."); return; }
                setTreinamentos((s) => [...s, v].sort((a, b) => a.localeCompare(b, "pt-BR")));
                setNovoTreino(null);
                toast.success("Treinamento incluído na matriz");
              }}>Incluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {verHistorico && (
        <Dialog open onOpenChange={(o) => !o && setVerHistorico(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Histórico de revisões e aprovações</DialogTitle>
              <DialogDescription>Matriz de treinamento anual</DialogDescription>
            </DialogHeader>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase text-muted-foreground">
                  <TableHead>Versão</TableHead><TableHead>Data</TableHead>
                  <TableHead>Elaborada por</TableHead><TableHead>Aprovada por</TableHead><TableHead>Alteração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REVISOES_MATRIZ.map((r) => (
                  <TableRow key={r.versao} className="text-xs">
                    <TableCell className="font-semibold">{r.versao}</TableCell>
                    <TableCell>{r.data}</TableCell>
                    <TableCell>{r.autor}</TableCell>
                    <TableCell>{r.aprovador}</TableCell>
                    <TableCell className="text-muted-foreground">{r.nota}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      )}

      {pessoasDoCargo && (
        <Dialog open onOpenChange={(o) => !o && setPessoasDoCargo(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Pessoas no cargo</DialogTitle>
              <DialogDescription>{pessoasDoCargo}</DialogDescription>
            </DialogHeader>
            <ul className="space-y-1 text-sm">
              {(PESSOAS_POR_CARGO[pessoasDoCargo] ?? []).map((n) => (
                <li key={n} className="rounded-md border border-border/60 px-3 py-1.5">{n}</li>
              ))}
              {(PESSOAS_POR_CARGO[pessoasDoCargo] ?? []).length === 0 && (
                <li className="text-muted-foreground">Nenhuma pessoa cadastrada neste cargo.</li>
              )}
            </ul>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DialogPlanejamento({ plano, onClose, onSave }: {
  plano: Planejamento; onClose: () => void; onSave: (p: Planejamento) => void;
}) {
  const [p, setP] = useState<Planejamento>(plano);
  const [novoParticipante, setNovoParticipante] = useState("");
  const set = <K extends keyof Planejamento>(k: K, v: Planejamento[K]) => setP((s) => ({ ...s, [k]: v }));

  const disponiveis = TODOS_OS_NOMES.filter((n) => !p.participantes.some((x) => x.nome === n));

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
                <Label className="text-xs">Cargo alvo</Label>
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
                  <SelectContent>{MODALIDADES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
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
                <Button type="button" variant="outline" size="sm" className="h-9 w-full justify-start rounded-lg text-xs"
                  onClick={() => { set("anexos", [...p.anexos, `lista-presenca-${p.anexos.length + 1}.pdf`]); toast.success("Anexo adicionado"); }}>
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

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Participantes</div>
              <div className="flex gap-2">
                <Select value={novoParticipante} onValueChange={setNovoParticipante}>
                  <SelectTrigger className="h-9 rounded-lg text-sm">
                    <SelectValue placeholder="Selecionar pessoa cadastrada em Cargos e Perfis" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponiveis.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    {disponiveis.length === 0 && <SelectItem value="__none" disabled>Todas já incluídas</SelectItem>}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" className="h-9 gap-1 whitespace-nowrap text-xs"
                  onClick={() => {
                    if (!novoParticipante || novoParticipante === "__none") { toast.error("Selecione uma pessoa."); return; }
                    set("participantes", [...p.participantes, { nome: novoParticipante, presente: true, eficacia: null }]);
                    setNovoParticipante("");
                  }}>
                  <Plus className="h-3.5 w-3.5" /> Incluir
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Participante</th>
                      <th className="px-3 py-2 text-center">Presença</th>
                      <th className="px-3 py-2 text-center">Eficácia individual</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {p.participantes.map((part, i) => (
                      <tr key={part.nome} className="border-t border-border/60">
                        <td className="px-3 py-2">{part.nome}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={part.presente}
                            onChange={(e) => set("participantes", p.participantes.map((x, j) => j === i ? { ...x, presente: e.target.checked } : x))}
                            className="h-4 w-4 accent-[color:var(--brand)]" />
                        </td>
                        <td className="px-3 py-2">
                          <Select value={part.eficacia ?? "pendente"}
                            onValueChange={(v) => set("participantes", p.participantes.map((x, j) => j === i
                              ? { ...x, eficacia: v === "pendente" ? null : (v as "Aprovado" | "Reprovado") } : x))}>
                            <SelectTrigger className="h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Aguardando avaliação</SelectItem>
                              <SelectItem value="Aprovado">Eficaz</SelectItem>
                              <SelectItem value="Reprovado">Não eficaz</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button type="button" className="text-muted-foreground hover:text-[color:var(--severity-critical)]"
                            onClick={() => set("participantes", p.participantes.filter((_, j) => j !== i))}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {p.participantes.length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-2 text-sm text-muted-foreground">Nenhum participante incluído.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Verificação de eficácia</h3>
              <p className="text-xs text-muted-foreground">Método e avaliador da verificação; o resultado é registrado por participante.</p>
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
            {p.participantes.some((x) => x.eficacia === "Reprovado") && (
              <div className="space-y-1.5">
                <Label className="text-xs">Justificativa e tratativa para os participantes não eficazes</Label>
                <Textarea value={p.justificativa} onChange={(e) => set("justificativa", e.target.value)} rows={3} className="rounded-lg text-sm"
                  placeholder="Descreva o que será refeito para os participantes avaliados como não eficazes." />
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancelar</Button>
          <Button className="rounded-lg" onClick={() => {
            if (p.participantes.some((x) => x.eficacia === "Reprovado") && !p.justificativa.trim()) {
              toast.error("Informe a justificativa para os participantes não eficazes."); return;
            }
            onSave(p);
          }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- seção B: conscientização ---------------------- */

const PUBLICOS = ["Administrativo", "Comercial", "Diretoria", "Manutenção", "Produção", "Qualidade", "Todos"];
const EU = "Diego Almeida";

function Confetes() {
  const cores = ["var(--brand)", "var(--success)", "var(--severity-medium)", "#f5c518"];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="jawda-confetti-piece"
          style={{
            left: `${(i * 4.1) % 100}%`,
            background: cores[i % cores.length],
            animationDelay: `${(i % 6) * 0.08}s`,
            ["--jawda-dx" as string]: `${((i % 7) - 3) * 18}px`,
          }} />
      ))}
    </div>
  );
}

function SecaoConscientizacao({ perfil }: { perfil: PerfilGov }) {
  const [acoes, setAcoes] = useState<AcaoConscientizacao[]>(ACOES_INICIAIS);
  const [nova, setNova] = useState(false);
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const [popupId, setPopupId] = useState<string | null>(null);

  const publicadas = acoes.filter((a) => a.publicada);
  const minhas = publicadas.filter((a) => a.cientes.some((c) => c.nome === EU));

  // Ação publicada e ainda sem ciência do empregado aparece como pop-up.
  useEffect(() => {
    const pendente = minhas.find((a) => !a.cientes.find((c) => c.nome === EU)?.em);
    if (pendente) setPopupId((cur) => cur ?? pendente.id);
  }, [minhas]);

  const darCiente = (id: string) => {
    const agora = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    setAcoes((s) => s.map((a) => a.id === id
      ? { ...a, cientes: a.cientes.map((c) => c.nome === EU ? { ...c, em: agora } : c) } : a));
    toast.success("Ciência registrada", { description: `Registrado em ${agora}` });
  };

  const alcance = (a: AcaoConscientizacao) =>
    a.cientes.length ? Math.round((a.cientes.filter((c) => c.em).length / a.cientes.length) * 100) : 0;

  const aberta = acoes.find((a) => a.id === detalhe) ?? null;
  const popup = acoes.find((a) => a.id === popupId) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 rounded-xl border border-brand/20 bg-brand-soft/40 p-3 text-xs text-foreground/80">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <span>
          Ações de conscientização <strong>não passam por aprovação</strong>: podem ser elaboradas e enviadas tanto pelo
          Gestor da Qualidade quanto pela Diretoria. Perfil atual: <strong>{perfil}</strong>.
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi icon={Megaphone} label="Ações cadastradas" value={String(acoes.length)} hint="Política, objetivos e implicações" tone="bg-brand-soft text-brand" />
        <Kpi icon={Send} label="Publicadas" value={String(publicadas.length)} hint="Visíveis aos empregados" tone="bg-[color:var(--success)]/15 text-[color:var(--success)]" />
        <Kpi icon={Percent} label="Alcance médio"
          value={`${publicadas.length ? Math.round(publicadas.reduce((s, a) => s + alcance(a), 0) / publicadas.length) : 0}%`}
          hint="Empregados que deram ciência" tone="bg-brand-soft text-brand" />
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
                  <Badge variant="outline" className={cn("rounded-md text-[10px]", a.publicada ? toneStatus.Realizado : toneStatus["Não planejado"])}>
                    {a.publicada ? "Publicada" : "Rascunho"}
                  </Badge>
                </div>
                <div className="text-sm font-semibold leading-snug text-foreground">{a.titulo}</div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{a.conteudo}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.publico}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {a.publicada ? `Publicada em ${fmt(a.dataPublicacao)}` : a.programadaPara ? `Programada para ${fmt(a.programadaPara)}` : "Sem publicação"}
                  </span>
                  {a.anexo && <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {a.anexo}</span>}
                </div>
                {a.publicada && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Empregados que deram ciência</span>
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
                    <Button size="sm" className="rounded-lg text-xs"
                      onClick={() => {
                        const hojeIso = new Date().toISOString().slice(0, 10);
                        setAcoes((s) => s.map((x) => x.id === a.id ? {
                          ...x, publicada: true, dataPublicacao: hojeIso,
                          cientes: x.cientes.length ? x.cientes : TODOS_OS_NOMES.map((n) => ({ nome: n, em: null })),
                        } : x));
                        toast.success("Ação publicada", { description: "Pop-up no sistema e e-mail enviados aos empregados." });
                      }}>
                      Publicar agora
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
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ciência registrada em {meu.em}
                      </div>
                    ) : (
                      <Button size="sm" className="rounded-lg" onClick={() => setPopupId(a.id)}>Abrir</Button>
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
          onSave={(a, publicar) => {
            setAcoes((s) => [publicar
              ? { ...a, publicada: true, dataPublicacao: new Date().toISOString().slice(0, 10), cientes: TODOS_OS_NOMES.map((n) => ({ nome: n, em: null })) }
              : a, ...s]);
            setNova(false);
            toast.success(publicar ? "Ação publicada aos empregados" : "Ação salva como rascunho");
          }}
        />
      )}

      {popup && <PopupAcao acao={popup} onClose={() => setPopupId(null)} onCiente={() => { darCiente(popup.id); setPopupId(null); }} />}

      {aberta && (
        <Dialog open onOpenChange={(o) => !o && setDetalhe(null)}>
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{aberta.titulo}</DialogTitle>
              <DialogDescription>
                Empregados que deram ciência — {aberta.cientes.filter((c) => c.em).length} de {aberta.cientes.length} ({alcance(aberta)}%).
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

/* ------------------------------- pop-up empregado -------------------------- */

function PopupAcao({ acao, onClose, onCiente }: {
  acao: AcaoConscientizacao; onClose: () => void; onCiente: () => void;
}) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const [resultado, setResultado] = useState<"acerto" | "erro" | null>(null);
  const quiz = acao.tipo === "Perguntas e Respostas" ? acao.quiz : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="relative max-w-md overflow-hidden">
        {resultado === "acerto" && <Confetes />}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {quiz ? <HelpCircle className="h-4 w-4 text-brand" /> : <Megaphone className="h-4 w-4 text-brand" />}
            {acao.titulo}
          </DialogTitle>
          <DialogDescription>{acao.tipo} · publicado em {fmt(acao.dataPublicacao)}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{acao.conteudo}</p>
        {acao.anexo && (
          <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs">
            <FileText className="h-3.5 w-3.5 text-brand" /> {acao.anexo}
          </div>
        )}

        {quiz && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">{quiz.pergunta}</div>
            {quiz.opcoes.map((o, i) => (
              <button key={i} type="button" onClick={() => { setEscolha(i); setResultado(i === quiz.correta ? "acerto" : "erro"); }}
                className={cn("w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  escolha === i
                    ? (i === quiz.correta
                      ? "border-[color:var(--success)]/50 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                      : "border-[color:var(--severity-critical)]/50 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]")
                    : "border-border hover:bg-muted")}>
                {o}
              </button>
            ))}
            {resultado === "acerto" && (
              <p className="text-sm font-semibold text-[color:var(--success)]">Resposta certa! Boa — você mandou bem. 🎉</p>
            )}
            {resultado === "erro" && (
              <p className="text-sm font-semibold text-[color:var(--severity-critical)]">
                Ainda não é essa. Releia o conteúdo e tente novamente.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Depois</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90"
            disabled={!!quiz && resultado !== "acerto"} onClick={onCiente}>
            <Check className="mr-1.5 h-3.5 w-3.5" /> Ciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- nova ação -------------------------------- */

function DialogNovaAcao({ onClose, onSave }: {
  onClose: () => void; onSave: (a: AcaoConscientizacao, publicar: boolean) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoAcao>("Informe");
  const [conteudo, setConteudo] = useState("");
  const [publico, setPublico] = useState("Todos");
  const [anexo, setAnexo] = useState<string | null>(null);
  const [programar, setProgramar] = useState(false);
  const [programadaPara, setProgramadaPara] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState<string[]>(["", "", ""]);
  const [correta, setCorreta] = useState(0);

  const montar = (): AcaoConscientizacao | null => {
    if (!titulo.trim()) { toast.error("Informe o título da ação."); return null; }
    let quiz: Quiz | null = null;
    if (tipo === "Perguntas e Respostas") {
      const validas = opcoes.map((o) => o.trim()).filter(Boolean);
      if (!pergunta.trim() || validas.length < 2) { toast.error("Informe a pergunta e ao menos 2 opções."); return null; }
      quiz = { pergunta: pergunta.trim(), opcoes: validas, correta: Math.min(correta, validas.length - 1) };
    }
    return {
      id: `c${Date.now()}`, titulo, tipo, conteudo, publico, anexo,
      dataPublicacao: null, programadaPara: programar ? programadaPara : "",
      publicada: false, quiz, cientes: [],
    };
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova ação de conscientização</DialogTitle>
          <DialogDescription>
            Pode ser criada e enviada pelo Gestor da Qualidade ou pela Diretoria — não exige aprovação.
          </DialogDescription>
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
              <p className="text-[10px] text-muted-foreground">
                Informe, Pílula, Vídeo e Outro são transmitidos da mesma forma: pop-up no sistema e e-mail, com anexo opcional.
              </p>
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
            <Textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={4} className="rounded-lg text-sm"
              placeholder="Texto da comunicação, roteiro do vídeo ou descrição do material." />
            <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs"
              onClick={() => { setAnexo("material-conscientizacao.pdf"); toast.success("Anexo adicionado"); }}>
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Anexar material
            </Button>
            {anexo && (
              <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-[11px]">
                <FileText className="h-3.5 w-3.5 text-brand" /> {anexo}
                <button className="ml-auto text-muted-foreground" onClick={() => setAnexo(null)}><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          {tipo === "Perguntas e Respostas" && (
            <div className="space-y-2 rounded-lg border border-brand/25 bg-brand-soft/30 p-3">
              <Label className="text-xs">Pergunta</Label>
              <Input value={pergunta} onChange={(e) => setPergunta(e.target.value)} className="h-9 rounded-lg text-sm"
                placeholder="Ex.: Qual é o principal objetivo da qualidade para 2026?" />
              <Label className="text-xs">Opções de resposta (marque a correta)</Label>
              {opcoes.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correta" checked={correta === i} onChange={() => setCorreta(i)}
                    className="h-4 w-4 accent-[color:var(--brand)]" />
                  <Input value={o} onChange={(e) => setOpcoes(opcoes.map((x, j) => j === i ? e.target.value : x))}
                    className="h-9 rounded-lg text-sm" placeholder={`Opção ${i + 1}`} />
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-xs">
            <Checkbox checked={programar} onCheckedChange={(v) => setProgramar(!!v)} />
            <span>Programar disparo automático para uma data futura</span>
          </label>
          {programar ? (
            <Input type="date" value={programadaPara} onChange={(e) => setProgramadaPara(e.target.value)} className="h-9 w-48 rounded-lg text-sm" />
          ) : (
            <p className="text-[11px] text-muted-foreground">A data de publicação é registrada automaticamente no momento de publicar.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={onClose}>Cancelar</Button>
          <Button variant="outline" className="rounded-lg" onClick={() => { const a = montar(); if (a) onSave(a, false); }}>
            Salvar rascunho
          </Button>
          <Button className="rounded-lg" onClick={() => { const a = montar(); if (a) onSave(a, true); }}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Publicar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- página ---------------------------------- */

export function AprendizagemPage() {
  const [perfil, setPerfil] = useState<PerfilGov>("Gestor da Qualidade");

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-brand" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestão de Aprendizagem</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Planeje os treinamentos de cada cargo, registre a execução e a eficácia por participante, e comunique
              ações de conscientização com controle nominal de ciência.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Visão de demonstração:</span>
            <Select value={perfil} onValueChange={(v) => setPerfil(v as PerfilGov)}>
              <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Diretoria" className="text-xs">Diretoria</SelectItem>
                <SelectItem value="Gestor da Qualidade" className="text-xs">Gestor da Qualidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <SecaoTreinamentos perfil={perfil} />
          </TabsContent>
          <TabsContent value="conscientizacao" className="mt-4">
            <SecaoConscientizacao perfil={perfil} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
