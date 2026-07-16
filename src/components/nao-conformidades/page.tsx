import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  FolderOpen,
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCcw,
  ListFilter,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import {
  mockNCs,
  severityClasses,
  statusClasses,
  type NC,
  type NCStatus,
  type Severity,
  type Origem,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const KANBAN_STATUSES: NCStatus[] = [
  "Rascunho",
  "Em Classificação",
  "Em Análise",
  "Plano em Execução",
  "Em Avaliação",
  "Encerrada",
];

const ORIGENS: Origem[] = [
  "Auditoria interna",
  "Auditoria externa",
  "Rotina do processo",
  "Comunicação",
  "Cliente",
  "Documental",
  "Outros",
];

const GRAVIDADES: Severity[] = ["Baixa", "Média", "Alta", "Crítica"];

const SETORES = ["Produção", "Administrativo", "Serviço", "Almoxarifado"];

const PERIODOS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "365", label: "Este ano" },
  { value: "all", label: "Todo o período" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function slaBadge(nc: NC) {
  if (nc.slaStatus === "vencido") {
    return (
      <div className="flex items-center gap-1.5 text-[color:var(--severity-critical)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--severity-critical)]" />
        <span className="text-xs font-medium">Vencido — {formatDate(nc.prazoSLA)}</span>
      </div>
    );
  }
  if (nc.slaStatus === "proximo") {
    return (
      <div className="flex items-center gap-1.5 text-[color:var(--severity-high)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--severity-high)]" />
        <span className="text-xs font-medium">Vence {formatDate(nc.prazoSLA)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
      <span className="text-xs">{formatDate(nc.prazoSLA)}</span>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof AlertTriangle;
  tone: "default" | "info" | "warning" | "success" | "danger";
}) {
  const toneMap = {
    default: "text-muted-foreground bg-muted",
    info: "text-brand bg-brand-soft",
    warning: "text-[color:var(--severity-high)] bg-[color:var(--severity-high)]/10",
    success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    danger: "text-[color:var(--severity-critical)] bg-[color:var(--severity-critical)]/10",
  } as const;
  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanCard({
  nc,
  onDragStart,
}: {
  nc: NC;
  onDragStart: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(nc.id)}
      className="group cursor-grab rounded-lg border border-border/80 bg-card p-3 shadow-sm transition-all hover:border-brand/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold text-brand">{nc.codigo}</span>
        {nc.reincidente && (
          <Tooltip>
            <TooltipTrigger asChild>
              <RefreshCcw className="h-3 w-3 text-[color:var(--severity-high)]" />
            </TooltipTrigger>
            <TooltipContent>Reincidente</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-foreground">{nc.descricao}</p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="outline" className={cn("rounded-md border text-[10px]", severityClasses(nc.gravidade))}>
          {nc.gravidade}
        </Badge>
        <div className="flex items-center gap-1.5">
          {slaBadge(nc)}
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-brand-soft text-brand text-[10px] font-semibold">
              {nc.responsavel.iniciais}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

export function NaoConformidadesPage() {
  const [items, setItems] = useState<NC[]>(mockNCs);
  const [busca, setBusca] = useState("");
  const [origem, setOrigem] = useState<string>("all");
  const [periodo, setPeriodo] = useState<string>("all");
  const [setor, setSetor] = useState<string>("all");
  const [gravidade, setGravidade] = useState<string>("all");
  const [reincidente, setReincidente] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<NCStatus | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    const maxAgeMs = periodo === "all" ? Infinity : Number(periodo) * 86_400_000;
    const q = busca.trim().toLowerCase();
    return items.filter((nc) => {
      if (origem !== "all" && nc.origem !== origem) return false;
      if (setor !== "all" && nc.local !== setor) return false;
      if (gravidade !== "all" && nc.gravidade !== gravidade) return false;
      if (reincidente && !nc.reincidente) return false;
      if (now - new Date(nc.criadoEm).getTime() > maxAgeMs) return false;
      if (q && !`${nc.codigo} ${nc.descricao}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, busca, origem, periodo, setor, gravidade, reincidente]);

  const kpis = useMemo(() => {
    const abertas = filtered.filter((nc) => nc.status !== "Encerrada" && nc.status !== "Cancelada").length;
    const andamento = filtered.filter((nc) =>
      ["Em Classificação", "Em Análise", "Plano em Execução", "Em Avaliação"].includes(nc.status),
    ).length;
    const encerradas = filtered.filter((nc) => nc.status === "Encerrada").length;
    const vencidas = filtered.filter((nc) => nc.slaStatus === "vencido").length;
    return { total: filtered.length, abertas, andamento, encerradas, vencidas };
  }, [filtered]);

  function handleDrop(status: NCStatus) {
    if (!draggingId) return;
    setItems((prev) => prev.map((nc) => (nc.id === draggingId ? { ...nc, status } : nc)));
    setDraggingId(null);
    setDragOver(null);
  }

  const activeFiltersCount =
    (origem !== "all" ? 1 : 0) +
    (periodo !== "all" ? 1 : 0) +
    (setor !== "all" ? 1 : 0) +
    (gravidade !== "all" ? 1 : 0) +
    (reincidente ? 1 : 0) +
    (busca ? 1 : 0);

  return (
    <AppShell>
      <TooltipProvider delayDuration={200}>
        <div className="mx-auto max-w-[1400px] space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Não Conformidades
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Acompanhe registros, tratativas e prazos SLA ao longo de todo o ciclo de vida da NC.
              </p>
            </div>
            <Button asChild className="rounded-lg bg-brand text-brand-foreground hover:bg-brand/90">
  <Link to="/nao-conformidades/nova">
    <Plus className="mr-1 h-4 w-4" /> Nova Não Conformidade
  </Link>
</Button>
          </div>

          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Total no período" value={kpis.total} icon={FolderOpen} tone="default" />
            <KpiCard label="Abertas" value={kpis.abertas} icon={AlertTriangle} tone="info" />
            <KpiCard label="Em andamento" value={kpis.andamento} icon={Activity} tone="warning" />
            <KpiCard label="Encerradas" value={kpis.encerradas} icon={CheckCircle2} tone="success" />
            <KpiCard label="Vencidas (SLA)" value={kpis.vencidas} icon={Clock} tone="danger" />
          </div>

          {/* Filtros */}
          <Card className="rounded-xl border-border/80 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <ListFilter className="h-3.5 w-3.5" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="outline" className="ml-1 rounded-md border-brand/30 bg-brand-soft text-brand">
                    {activeFiltersCount} ativo{activeFiltersCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="relative lg:col-span-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por código ou descrição…"
                    className="h-9 rounded-lg pl-9"
                  />
                </div>
                <Select value={origem} onValueChange={setOrigem}>
                  <SelectTrigger className="h-9 rounded-lg lg:col-span-2">
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as origens</SelectItem>
                    {ORIGENS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="h-9 rounded-lg lg:col-span-2">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODOS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={setor} onValueChange={setSetor}>
                  <SelectTrigger className="h-9 rounded-lg lg:col-span-2">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {SETORES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={gravidade} onValueChange={setGravidade}>
                  <SelectTrigger className="h-9 rounded-lg lg:col-span-2">
                    <SelectValue placeholder="Gravidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {GRAVIDADES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 lg:col-span-12">
                  <Switch id="reincidente" checked={reincidente} onCheckedChange={setReincidente} />
                  <Label htmlFor="reincidente" className="cursor-pointer text-sm">
                    Somente reincidentes
                  </Label>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Mostrando {filtered.length} de {items.length} registros
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="tabela" className="space-y-4">
            <TabsList className="rounded-lg bg-muted p-1">
              <TabsTrigger value="tabela" className="gap-1.5 rounded-md">
                <TableIcon className="h-4 w-4" /> Tabela
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5 rounded-md">
                <LayoutGrid className="h-4 w-4" /> Kanban
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tabela" className="mt-0">
              <Card className="rounded-xl border-border/80 shadow-sm">
                <CardContent className="px-0 py-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="pl-6">Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Gravidade</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prazo SLA</TableHead>
                        <TableHead className="pr-6 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((nc) => (
                        <TableRow key={nc.id} className="border-border/60 transition-colors hover:bg-brand-soft/30">
                          <TableCell className="pl-6 font-mono text-xs font-semibold text-brand">
                            <div className="flex items-center gap-1.5">
                              {nc.codigo}
                              {nc.reincidente && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <RefreshCcw className="h-3 w-3 text-[color:var(--severity-high)]" />
                                  </TooltipTrigger>
                                  <TooltipContent>Reincidente</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[340px] truncate text-sm">{nc.descricao}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{nc.origem}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md border", severityClasses(nc.gravidade))}>
                              {nc.gravidade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-brand-soft text-brand text-[10px] font-semibold">
                                  {nc.responsavel.iniciais}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{nc.responsavel.nome}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md border font-normal", statusClasses(nc.status))}>
                              {nc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{slaBadge(nc)}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-brand hover:bg-brand-soft">
                              <Link to="/nao-conformidades/$id" params={{ id: nc.id }}>
                                <Eye className="h-4 w-4" /> Ver
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                            Nenhuma não conformidade encontrada com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {KANBAN_STATUSES.map((status) => {
                  const columnItems = filtered.filter((nc) => nc.status === status);
                  const isOver = dragOver === status;
                  return (
                    <div
                      key={status}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(status);
                      }}
                      onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                      onDrop={() => handleDrop(status)}
                      className={cn(
                        "flex min-h-[420px] flex-col rounded-xl border bg-muted/40 p-2 transition-colors",
                        isOver ? "border-brand/60 bg-brand-soft/40" : "border-border/70",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between px-2 py-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                          {status}
                        </span>
                        <Badge variant="outline" className="rounded-md border-border/60 bg-card text-[10px] text-muted-foreground">
                          {columnItems.length}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        {columnItems.map((nc) => (
                          <KanbanCard key={nc.id} nc={nc} onDragStart={setDraggingId} />
                        ))}
                        {columnItems.length === 0 && (
                          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground">
                            Sem registros
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}
