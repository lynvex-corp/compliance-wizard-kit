import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Link2, ShieldAlert, Sparkles, RefreshCw, AlertTriangle, History, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tipo = "Risco" | "Oportunidade";
type StatusR = "Identificado" | "Em tratamento" | "Monitorado" | "Encerrado";

interface Reavaliacao {
  data: string;
  probabilidade: number;
  impacto: number;
  observacao: string;
}

interface Registro {
  id: number;
  codigo: string;
  descricao: string;
  tipo: Tipo;
  processo: string;
  origem: string;
  probabilidade: number;
  impacto: number;
  acoes: string[];
  planoConcluido?: boolean;
  status: StatusR;
  criadoEm: string;
  semAcaoDesdeDias?: number;
  historico: Reavaliacao[];
  anterior?: { probabilidade: number; impacto: number };
}

const PROCESSOS = [
  "Suprimentos", "Produção", "Manutenção", "Comercial", "Qualidade",
  "RH", "Engenharia", "TI", "Regulatório", "Utilidades", "Logística",
];

const seed: Registro[] = [
  { id: 1, codigo: "R-001", descricao: "Falha no fornecimento de matéria-prima crítica MP-2231", tipo: "Risco", processo: "Suprimentos", origem: "Contexto", probabilidade: 4, impacto: 5, acoes: ["PA-2026-0007"], planoConcluido: true, status: "Em tratamento", criadoEm: "2026-01-14", historico: [] },
  { id: 2, codigo: "R-002", descricao: "Vazamento em tubulação de vapor da utilidade", tipo: "Risco", processo: "Manutenção", origem: "Processo", probabilidade: 3, impacto: 5, acoes: ["PA-2026-0008"], status: "Em tratamento", criadoEm: "2026-02-02", historico: [] },
  { id: 3, codigo: "O-003", descricao: "Expansão para mercado sul via licitação estadual", tipo: "Oportunidade", processo: "Comercial", origem: "Contexto", probabilidade: 4, impacto: 4, acoes: [], status: "Identificado", criadoEm: "2026-03-05", historico: [] },
  { id: 4, codigo: "R-004", descricao: "Aumento de rotatividade em operação (>25%)", tipo: "Risco", processo: "RH", origem: "Parte interessada", probabilidade: 5, impacto: 3, acoes: ["PA-2026-0004"], planoConcluido: true, status: "Em tratamento", criadoEm: "2026-01-22", historico: [] },
  { id: 5, codigo: "R-005", descricao: "Falha em auditoria de recertificação ISO 9001", tipo: "Risco", processo: "Qualidade", origem: "Auditoria", probabilidade: 2, impacto: 5, acoes: ["PA-2026-0009"], status: "Monitorado", criadoEm: "2026-02-18", historico: [] },
  { id: 6, codigo: "O-006", descricao: "Convênio de P&D com universidade — inovação em processos", tipo: "Oportunidade", processo: "Engenharia", origem: "Contexto", probabilidade: 3, impacto: 4, acoes: [], status: "Identificado", criadoEm: "2026-03-12", historico: [] },
  { id: 7, codigo: "R-007", descricao: "Reclamação recorrente de cliente-chave (>3 no trimestre)", tipo: "Risco", processo: "Qualidade", origem: "Parte interessada", probabilidade: 3, impacto: 4, acoes: ["PA-2026-0010"], status: "Em tratamento", criadoEm: "2026-02-27", historico: [] },
  { id: 8, codigo: "R-008", descricao: "Novo requisito ANVISA de rastreabilidade até 2027", tipo: "Risco", processo: "Regulatório", origem: "Contexto", probabilidade: 5, impacto: 4, acoes: [], status: "Identificado", criadoEm: "2026-01-08", semAcaoDesdeDias: 188, historico: [] },
  { id: 9, codigo: "R-009", descricao: "Falha em backup de sistema documental", tipo: "Risco", processo: "TI", origem: "Processo", probabilidade: 2, impacto: 3, acoes: [], status: "Monitorado", criadoEm: "2026-03-30", historico: [] },
  { id: 10, codigo: "O-010", descricao: "Redução de consumo energético via retrofit de compressores", tipo: "Oportunidade", processo: "Utilidades", origem: "Processo", probabilidade: 4, impacto: 3, acoes: [], status: "Identificado", criadoEm: "2026-04-02", historico: [] },
  { id: 11, codigo: "R-011", descricao: "Ruptura de estoque de embalagem primária em pico sazonal", tipo: "Risco", processo: "Logística", origem: "Processo", probabilidade: 4, impacto: 4, acoes: [], status: "Identificado", criadoEm: "2026-02-05", semAcaoDesdeDias: 160, historico: [] },
  { id: 12, codigo: "R-012", descricao: "Parada não programada da linha 2 por desgaste de motor", tipo: "Risco", processo: "Produção", origem: "Processo", probabilidade: 3, impacto: 5, acoes: [], status: "Identificado", criadoEm: "2026-01-30", semAcaoDesdeDias: 166, historico: [] },
];

function nivel(p: number, i: number) {
  const v = p * i;
  if (v >= 15) return { label: "Crítico", color: "bg-[color:var(--severity-critical)]", text: "text-white" };
  if (v >= 10) return { label: "Alto", color: "bg-[color:var(--severity-high)]", text: "text-white" };
  if (v >= 5) return { label: "Médio", color: "bg-[color:var(--warning)]", text: "text-foreground" };
  return { label: "Baixo", color: "bg-[color:var(--success)]", text: "text-white" };
}

function cellColor(p: number, i: number) {
  const v = p * i;
  if (v >= 15) return "bg-[color:var(--severity-critical)]/85";
  if (v >= 10) return "bg-[color:var(--severity-high)]/75";
  if (v >= 8) return "bg-[color:var(--warning)]/80";
  if (v >= 5) return "bg-[color:var(--warning)]/55";
  if (v >= 3) return "bg-[color:var(--success)]/60";
  return "bg-[color:var(--success)]/80";
}

const statusColor: Record<StatusR, string> = {
  Identificado: "bg-muted text-foreground border-border",
  "Em tratamento": "bg-brand-soft text-brand border-brand/20",
  Monitorado: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Encerrado: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
};

const SUGESTOES_IA: Record<string, { descricao: string; tipo: Tipo; probabilidade: number; impacto: number }[]> = {
  Suprimentos: [
    { descricao: "Dependência de fornecedor único para insumo crítico", tipo: "Risco", probabilidade: 4, impacto: 5 },
    { descricao: "Variação cambial elevando custo de insumos importados", tipo: "Risco", probabilidade: 4, impacto: 3 },
    { descricao: "Negociação de contrato de longo prazo com desconto por volume", tipo: "Oportunidade", probabilidade: 3, impacto: 4 },
  ],
  Produção: [
    { descricao: "Parada não programada por falha de equipamento crítico", tipo: "Risco", probabilidade: 4, impacto: 4 },
    { descricao: "Perda de rendimento por desvio de setup entre turnos", tipo: "Risco", probabilidade: 3, impacto: 3 },
    { descricao: "Ganho de OEE com padronização de troca rápida (SMED)", tipo: "Oportunidade", probabilidade: 4, impacto: 4 },
  ],
  Qualidade: [
    { descricao: "Reincidência de não conformidade por causa raiz não tratada", tipo: "Risco", probabilidade: 3, impacto: 4 },
    { descricao: "Instrumento fora do prazo de calibração em uso na inspeção", tipo: "Risco", probabilidade: 3, impacto: 5 },
    { descricao: "Redução de retrabalho com inspeção por amostragem inteligente", tipo: "Oportunidade", probabilidade: 3, impacto: 4 },
  ],
  RH: [
    { descricao: "Perda de conhecimento crítico por saída de especialistas", tipo: "Risco", probabilidade: 3, impacto: 4 },
    { descricao: "Baixa adesão aos treinamentos obrigatórios do SGQ", tipo: "Risco", probabilidade: 4, impacto: 3 },
    { descricao: "Programa de multifuncionalidade ampliando cobertura de turnos", tipo: "Oportunidade", probabilidade: 4, impacto: 3 },
  ],
  TI: [
    { descricao: "Indisponibilidade do sistema documental por falha de backup", tipo: "Risco", probabilidade: 2, impacto: 5 },
    { descricao: "Acesso indevido a registros controlados por perfil mal configurado", tipo: "Risco", probabilidade: 3, impacto: 4 },
    { descricao: "Automação de coleta de indicadores reduzindo digitação manual", tipo: "Oportunidade", probabilidade: 4, impacto: 4 },
  ],
};

const SUGESTAO_PADRAO = [
  { descricao: "Falta de padronização documentada nas atividades do processo", tipo: "Risco" as Tipo, probabilidade: 3, impacto: 3 },
  { descricao: "Indicadores do processo sem meta definida ou sem análise crítica", tipo: "Risco" as Tipo, probabilidade: 3, impacto: 4 },
  { descricao: "Digitalização de registros ampliando rastreabilidade do processo", tipo: "Oportunidade" as Tipo, probabilidade: 4, impacto: 3 },
];

export function RiscosPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Registro[]>(seed);
  const [open, setOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [filtroAlerta, setFiltroAlerta] = useState(false);
  const [iaOpen, setIaOpen] = useState(false);
  const [iaProcesso, setIaProcesso] = useState("Produção");
  const [iaSelecionadas, setIaSelecionadas] = useState<number[]>([]);
  const [reavaliando, setReavaliando] = useState<Registro | null>(null);
  const [reav, setReav] = useState({ probabilidade: 3, impacto: 3, observacao: "" });
  const [novo, setNovo] = useState({
    descricao: "", tipo: "Risco" as Tipo, processo: "Produção", origem: "Contexto",
    probabilidade: 3, impacto: 3,
  });

  const alertas = useMemo(
    () => rows.filter((r) => r.tipo === "Risco" && r.acoes.length === 0 && (r.semAcaoDesdeDias ?? 0) > 60),
    [rows],
  );

  const visiveis = filtroAlerta ? alertas : rows;

  const cellMap = useMemo(() => {
    const map = new Map<string, Registro[]>();
    visiveis.forEach((r) => {
      const key = `${r.probabilidade}-${r.impacto}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [visiveis]);

  const ghostMap = useMemo(() => {
    const map = new Map<string, Registro[]>();
    visiveis.filter((r) => r.anterior).forEach((r) => {
      const key = `${r.anterior!.probabilidade}-${r.anterior!.impacto}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [visiveis]);

  const detalhe = rows.find((r) => r.id === selecionado) ?? null;

  const salvar = () => {
    const id = Math.max(...rows.map((r) => r.id)) + 1;
    const codigo = `${novo.tipo === "Risco" ? "R" : "O"}-${String(id).padStart(3, "0")}`;
    setRows([
      ...rows,
      {
        id, codigo,
        descricao: novo.descricao || "Novo registro sem descrição",
        tipo: novo.tipo, processo: novo.processo, origem: novo.origem,
        probabilidade: novo.probabilidade, impacto: novo.impacto,
        acoes: [], status: "Identificado",
        criadoEm: new Date().toISOString().slice(0, 10),
        historico: [],
      },
    ]);
    setOpen(false);
    setNovo({ descricao: "", tipo: "Risco", processo: "Produção", origem: "Contexto", probabilidade: 3, impacto: 3 });
    toast.success(`${codigo} registrado`, { description: "Ponto posicionado na matriz conforme avaliação." });
  };

  const gerarPlano = (r: Registro) => {
    navigate({
      to: "/planos-de-acao/novo",
      search: {
        origem: r.tipo === "Risco" ? "Risco" : "Oportunidade",
        vinculado: r.codigo,
        problema: r.descricao,
      },
    });
  };

  const confirmarReavaliacao = () => {
    if (!reavaliando) return;
    const alvo = reavaliando;
    setRows((prev) =>
      prev.map((r) =>
        r.id === alvo.id
          ? {
              ...r,
              anterior: { probabilidade: r.probabilidade, impacto: r.impacto },
              probabilidade: reav.probabilidade,
              impacto: reav.impacto,
              status: reav.probabilidade * reav.impacto < 10 ? "Monitorado" : r.status,
              historico: [
                {
                  data: new Date().toISOString().slice(0, 10),
                  probabilidade: reav.probabilidade,
                  impacto: reav.impacto,
                  observacao: reav.observacao || "Reavaliação após conclusão do plano vinculado.",
                },
                ...r.historico,
              ],
            }
          : r,
      ),
    );
    toast.success(`${alvo.codigo} reavaliado`, {
      description: "A avaliação anterior permanece na matriz como ponto fantasma.",
    });
    setReavaliando(null);
  };

  const sugestoes = SUGESTOES_IA[iaProcesso] ?? SUGESTAO_PADRAO;

  const adicionarSugestoes = () => {
    const escolhidas = sugestoes.filter((_, i) => iaSelecionadas.includes(i));
    if (!escolhidas.length) return;
    let nextId = Math.max(...rows.map((r) => r.id));
    const novos = escolhidas.map((s) => {
      nextId += 1;
      return {
        id: nextId,
        codigo: `${s.tipo === "Risco" ? "R" : "O"}-${String(nextId).padStart(3, "0")}`,
        descricao: s.descricao,
        tipo: s.tipo,
        processo: iaProcesso,
        origem: "Processo",
        probabilidade: s.probabilidade,
        impacto: s.impacto,
        acoes: [] as string[],
        status: "Identificado" as StatusR,
        criadoEm: new Date().toISOString().slice(0, 10),
        historico: [] as Reavaliacao[],
      };
    });
    setRows([...rows, ...novos]);
    setIaOpen(false);
    setIaSelecionadas([]);
    toast.success(`${novos.length} registro(s) adicionado(s)`, { description: "Revise as estimativas antes de aprovar." });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Riscos e Oportunidades</h1>
            <p className="mt-1 text-sm text-muted-foreground">Matriz 5×5 e registro completo — requisito 6.1 da ISO 9001.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="rounded-lg text-brand" onClick={() => setIaOpen(true)}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Identificar riscos com IA
            </Button>
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Novo registro
            </Button>
          </div>
        </header>

        {alertas.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--severity-high)]/40 bg-[color:var(--severity-high)]/10 px-4 py-3">
            <div className="flex items-center gap-2.5 text-sm">
              <AlertTriangle className="h-4 w-4 text-[color:var(--severity-high)]" />
              <span className="font-medium text-foreground">
                {alertas.length} riscos altos não têm ação vinculada há mais de 60 dias
              </span>
            </div>
            <Button
              size="sm"
              variant={filtroAlerta ? "default" : "outline"}
              className={cn("h-7 rounded-md text-[11px]", filtroAlerta && "bg-brand text-white hover:bg-brand/90")}
              onClick={() => setFiltroAlerta((v) => !v)}
            >
              {filtroAlerta ? <><X className="mr-1 h-3 w-3" /> Limpar filtro</> : "Filtrar lista"}
            </Button>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
          {/* Matriz */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Matriz 5×5</h2>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><ShieldAlert className="h-3 w-3" /> Probabilidade × Impacto</span>
              </div>
              <div className="flex">
                <div className="flex w-6 items-center justify-center">
                  <span className="-rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Probabilidade →</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-6 gap-1">
                    <div />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={`h-${i}`} className="text-center font-mono text-[10px] text-muted-foreground">{i}</div>
                    ))}
                    {[5, 4, 3, 2, 1].map((p) => (
                      <div key={`row-${p}`} className="contents">
                        <div className="pr-1 text-right font-mono text-[10px] text-muted-foreground">{p}</div>
                        {[1, 2, 3, 4, 5].map((i) => {
                          const list = cellMap.get(`${p}-${i}`) ?? [];
                          const ghosts = ghostMap.get(`${p}-${i}`) ?? [];
                          return (
                            <div key={`${p}-${i}`} className={cn("relative aspect-square rounded-md", cellColor(p, i))}>
                              <div className="flex h-full flex-wrap items-center justify-center gap-0.5 p-0.5">
                                {ghosts.map((r) => (
                                  <span
                                    key={`g-${r.id}`}
                                    title={`${r.codigo} · avaliação anterior`}
                                    className="rounded-full border border-dashed border-white/80 bg-white/35 px-1.5 py-0.5 text-[9px] font-bold text-foreground/70"
                                  >
                                    {r.id}
                                  </span>
                                ))}
                                {list.slice(0, 4).map((r) => (
                                  <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setSelecionado(r.id)}
                                    title={`${r.codigo} · ${r.descricao}`}
                                    className={cn(
                                      "rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow transition hover:scale-110",
                                      r.tipo === "Oportunidade" && "ring-1 ring-[color:var(--success)]",
                                    )}
                                  >
                                    {r.id}
                                  </button>
                                ))}
                                {list.length > 4 && <span className="text-[9px] font-bold text-white">+{list.length - 4}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Impacto →</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px]">
                {(["Baixo", "Médio", "Alto", "Crítico"] as const).map((l) => {
                  const c = l === "Crítico" ? "bg-[color:var(--severity-critical)]" : l === "Alto" ? "bg-[color:var(--severity-high)]" : l === "Médio" ? "bg-[color:var(--warning)]" : "bg-[color:var(--success)]";
                  return (
                    <span key={l} className="flex items-center gap-1 text-muted-foreground">
                      <span className={cn("inline-block h-2.5 w-2.5 rounded", c)} /> {l}
                    </span>
                  );
                })}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground bg-muted/50" /> Avaliação anterior
                </span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Clique em um ponto para abrir o detalhe lateral.</p>
            </CardContent>
          </Card>

          {/* Lista */}
          <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Registros ({visiveis.length}){filtroAlerta && <span className="ml-2 text-[11px] font-normal text-[color:var(--severity-high)]">filtrados por alerta</span>}
                </h2>
              </div>
              <div className="max-h-[560px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Ações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiveis.map((r) => {
                      const n = nivel(r.probabilidade, r.impacto);
                      return (
                        <TableRow key={r.id} className="cursor-pointer text-xs" onClick={() => setSelecionado(r.id)}>
                          <TableCell className="font-mono text-[11px] font-semibold text-brand">{r.codigo}</TableCell>
                          <TableCell className="max-w-[260px] text-foreground/85">{r.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md text-[10px]", r.tipo === "Risco" ? "border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]" : "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]")}>{r.tipo}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.processo}</TableCell>
                          <TableCell>
                            <Badge className={cn("rounded-md text-white", n.color)}>{n.label} · {r.probabilidade}×{r.impacto}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {r.acoes.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                              {r.acoes.map((a) => (
                                <Badge key={a} variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                                  <Link2 className="mr-0.5 h-3 w-3" /> {a}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[r.status])}>{r.status}</Badge>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {r.planoConcluido ? (
                              <Button
                                size="sm" variant="outline"
                                className="h-7 rounded-md text-[10px]"
                                onClick={() => { setReavaliando(r); setReav({ probabilidade: r.probabilidade, impacto: r.impacto, observacao: "" }); }}
                              >
                                <RefreshCw className="mr-1 h-3 w-3" /> Reavaliar
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 rounded-md text-[10px] text-brand" onClick={() => gerarPlano(r)}>
                                <Plus className="mr-1 h-3 w-3" /> Plano
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cadastro com preview em tempo real */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Novo Risco / Oportunidade</DialogTitle>
            <DialogDescription>Mova os controles e acompanhe o ponto se deslocar na matriz em tempo real.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Descrição</label>
                <Textarea value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} rows={2} className="rounded-lg text-xs" placeholder="Ex.: Falha de fornecimento de matéria-prima crítica…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Tipo</label>
                  <Select value={novo.tipo} onValueChange={(v) => setNovo({ ...novo, tipo: v as Tipo })}>
                    <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Risco">Risco</SelectItem>
                      <SelectItem value="Oportunidade">Oportunidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Processo relacionado</label>
                  <Select value={novo.processo} onValueChange={(v) => setNovo({ ...novo, processo: v })}>
                    <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROCESSOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">Probabilidade</span>
                  <span className="font-mono font-semibold text-foreground">{novo.probabilidade}/5</span>
                </div>
                <Slider min={1} max={5} step={1} value={[novo.probabilidade]} onValueChange={(v) => setNovo({ ...novo, probabilidade: v[0] })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">Impacto</span>
                  <span className="font-mono font-semibold text-foreground">{novo.impacto}/5</span>
                </div>
                <Slider min={1} max={5} step={1} value={[novo.impacto]} onValueChange={(v) => setNovo({ ...novo, impacto: v[0] })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                <span className="text-[11px] text-muted-foreground">Nível calculado</span>
                <Badge className={cn("rounded-md text-white", nivel(novo.probabilidade, novo.impacto).color)}>
                  {nivel(novo.probabilidade, novo.impacto).label}
                </Badge>
              </div>
            </div>
            <MiniMatriz p={novo.probabilidade} i={novo.impacto} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-lg">Cancelar</Button>
            <Button onClick={salvar} className="rounded-lg bg-brand text-white hover:bg-brand/90">Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reavaliação */}
      <Dialog open={!!reavaliando} onOpenChange={(v) => !v && setReavaliando(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reavaliar {reavaliando?.codigo}</DialogTitle>
            <DialogDescription>Plano vinculado concluído. Ajuste a avaliação — o ponto anterior fica como fantasma na matriz.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-2 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-foreground/85">{reavaliando?.descricao}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                Antes:
                <Badge className={cn("rounded-md text-white", nivel(reavaliando?.probabilidade ?? 1, reavaliando?.impacto ?? 1).color)}>
                  {reavaliando?.probabilidade}×{reavaliando?.impacto}
                </Badge>
                →
                <Badge className={cn("rounded-md text-white", nivel(reav.probabilidade, reav.impacto).color)}>
                  {reav.probabilidade}×{reav.impacto}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">Probabilidade</span>
                  <span className="font-mono font-semibold text-foreground">{reav.probabilidade}/5</span>
                </div>
                <Slider min={1} max={5} step={1} value={[reav.probabilidade]} onValueChange={(v) => setReav({ ...reav, probabilidade: v[0] })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">Impacto</span>
                  <span className="font-mono font-semibold text-foreground">{reav.impacto}/5</span>
                </div>
                <Slider min={1} max={5} step={1} value={[reav.impacto]} onValueChange={(v) => setReav({ ...reav, impacto: v[0] })} />
              </div>
              <Textarea
                rows={2}
                className="rounded-lg text-xs"
                placeholder="Observação da reavaliação (evidência da eficácia da ação)…"
                value={reav.observacao}
                onChange={(e) => setReav({ ...reav, observacao: e.target.value })}
              />
            </div>
            <MiniMatriz
              p={reav.probabilidade}
              i={reav.impacto}
              ghost={reavaliando ? { p: reavaliando.probabilidade, i: reavaliando.impacto } : undefined}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReavaliando(null)} className="rounded-lg">Cancelar</Button>
            <Button onClick={confirmarReavaliacao} className="rounded-lg bg-brand text-white hover:bg-brand/90">Salvar reavaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IA */}
      <Dialog open={iaOpen} onOpenChange={setIaOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand" /> Identificar riscos com IA</DialogTitle>
            <DialogDescription>Sugestão simulada de IA — revise antes de incorporar ao inventário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Processo</label>
              <Select value={iaProcesso} onValueChange={(v) => { setIaProcesso(v); setIaSelecionadas([]); }}>
                <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROCESSOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {sugestoes.map((s, idx) => (
                <label key={s.descricao} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-brand/20 bg-brand-soft/40 p-3">
                  <Checkbox
                    checked={iaSelecionadas.includes(idx)}
                    onCheckedChange={(c) =>
                      setIaSelecionadas((prev) => (c ? [...prev, idx] : prev.filter((x) => x !== idx)))
                    }
                    className="mt-0.5"
                  />
                  <span className="flex-1 space-y-1">
                    <span className="block text-xs font-medium text-foreground">{s.descricao}</span>
                    <span className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("rounded-md text-[10px]", s.tipo === "Risco" ? "border-[color:var(--severity-critical)]/30 text-[color:var(--severity-critical)]" : "border-[color:var(--success)]/30 text-[color:var(--success)]")}>{s.tipo}</Badge>
                      <Badge className={cn("rounded-md text-white", nivel(s.probabilidade, s.impacto).color)}>
                        P{s.probabilidade} × I{s.impacto}
                      </Badge>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIaOpen(false)} className="rounded-lg">Fechar</Button>
            <Button onClick={adicionarSugestoes} disabled={!iaSelecionadas.length} className="rounded-lg bg-brand text-white hover:bg-brand/90">
              Adicionar selecionadas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhe lateral */}
      <Sheet open={!!detalhe} onOpenChange={(v) => !v && setSelecionado(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {detalhe && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <span className="font-mono text-brand">{detalhe.codigo}</span>
                  <Badge variant="outline" className={cn("rounded-md text-[10px]", detalhe.tipo === "Risco" ? "border-[color:var(--severity-critical)]/30 text-[color:var(--severity-critical)]" : "border-[color:var(--success)]/30 text-[color:var(--success)]")}>{detalhe.tipo}</Badge>
                </SheetTitle>
                <SheetDescription className="text-left">{detalhe.processo} · origem {detalhe.origem} · criado em {new Date(detalhe.criadoEm).toLocaleDateString("pt-BR")}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/90">{detalhe.descricao}</p>

                <div className="rounded-lg border border-border/60 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Avaliação atual</div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("rounded-md text-white", nivel(detalhe.probabilidade, detalhe.impacto).color)}>
                      {nivel(detalhe.probabilidade, detalhe.impacto).label}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      P{detalhe.probabilidade} × I{detalhe.impacto} = {detalhe.probabilidade * detalhe.impacto}
                    </span>
                  </div>
                  {detalhe.anterior && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Anterior: P{detalhe.anterior.probabilidade} × I{detalhe.anterior.impacto} — exibido como ponto fantasma na matriz.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <History className="h-3 w-3" /> Histórico de reavaliação
                  </div>
                  {detalhe.historico.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Nenhuma reavaliação registrada até o momento.</p>
                  ) : (
                    <ol className="space-y-2">
                      {detalhe.historico.map((h, i) => (
                        <li key={i} className="rounded-md border border-border/50 bg-muted/20 p-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{new Date(h.data).toLocaleDateString("pt-BR")}</span>
                            <span className="font-mono">P{h.probabilidade} × I{h.impacto}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-foreground/85">{h.observacao}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Planos vinculados</div>
                  {detalhe.acoes.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Nenhum plano vinculado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {detalhe.acoes.map((a) => (
                        <Badge key={a} variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                          <Link2 className="mr-0.5 h-3 w-3" /> {a}{detalhe.planoConcluido && " · concluído"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => gerarPlano(detalhe)}>
                    <Plus className="mr-1.5 h-4 w-4" /> Gerar Plano de Ação
                  </Button>
                  {detalhe.planoConcluido && (
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => { setReavaliando(detalhe); setReav({ probabilidade: detalhe.probabilidade, impacto: detalhe.impacto, observacao: "" }); setSelecionado(null); }}
                    >
                      <RefreshCw className="mr-1.5 h-4 w-4" /> Reavaliar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function MiniMatriz({ p, i, ghost }: { p: number; i: number; ghost?: { p: number; i: number } }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Preview na matriz</div>
      <div className="grid grid-cols-5 gap-0.5">
        {[5, 4, 3, 2, 1].map((row) =>
          [1, 2, 3, 4, 5].map((col) => {
            const ativo = row === p && col === i;
            const isGhost = ghost && ghost.p === row && ghost.i === col;
            return (
              <div key={`${row}-${col}`} className={cn("relative aspect-square rounded-sm", cellColor(row, col))}>
                {isGhost && !ativo && (
                  <span className="absolute inset-1 rounded-full border border-dashed border-white/90 bg-white/35" />
                )}
                {ativo && (
                  <span className="absolute inset-0.5 flex items-center justify-center rounded-full bg-white text-[8px] font-bold text-foreground shadow ring-2 ring-brand">
                    ●
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>
      <div className="mt-2 text-center text-[10px] text-muted-foreground">Impacto → · Probabilidade ↑</div>
    </div>
  );
}
