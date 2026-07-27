import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  AlertTriangle,
  Target,
  LayoutList,
  Rows3,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  auditoriasKPIs,
  auditoriaStatusClasses,
  normasDisponiveis,
  type Auditoria,
} from "@/lib/mock-data";
import { useJawda } from "@/lib/jawda-store";
import { cn } from "@/lib/utils";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function KPI({
  label,
  value,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  const toneCls = {
    brand: "bg-brand-soft text-brand",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)]",
    danger: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]",
  }[tone];
  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", toneCls)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold text-foreground">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function NormaChip({ n }: { n: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
      {n}
    </span>
  );
}

function ApontChip({ label, count, cls }: { label: string; count: number; cls: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
        cls,
      )}
      title={label}
    >
      <span className="uppercase tracking-wide">{label}</span>
      <span>{count}</span>
    </span>
  );
}

function AuditCard({ a }: { a: Auditoria }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {a.tipo === "Interna" ? "Interna" : `Externa · ${a.certificadora}`}
        </span>
        <Badge
          variant="outline"
          className={cn("border text-[10px]", auditoriaStatusClasses[a.status])}
        >
          {a.status}
        </Badge>
      </div>
      <div className="mb-1.5 flex flex-wrap gap-1">
        {a.normas.map((n) => (
          <NormaChip key={n} n={n} />
        ))}
      </div>
      <div className="text-sm font-medium text-foreground">{a.evento}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {new Date(a.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
        {a.auditorLider.nome}
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground">{a.locais.join(", ")}</div>
    </div>
  );
}

export function AuditoriasPage() {
  const navigate = useNavigate();
  const { auditorias, updateAuditoriaStatus } = useJawda();
  const [ano, setAno] = useState("2026");
  const [tipo, setTipo] = useState("all");
  const [norma, setNorma] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return auditorias.filter((a) => {
      if (tipo !== "all" && a.tipo !== tipo) return false;
      if (norma !== "all" && !a.normas.includes(norma)) return false;
      if (status !== "all" && a.status !== status) return false;
      return true;
    });
  }, [auditorias, tipo, norma, status]);

  const liveKpis = useMemo(() => {
    const total = auditorias.length;
    return {
      totalAno: total || auditoriasKPIs.totalAno,
      realizadas: auditorias.filter((a) => a.status === "Concluída").length || auditoriasKPIs.realizadas,
      programadas: auditorias.filter((a) => a.status === "Programada").length,
      emAndamento: auditorias.filter((a) => a.status === "Em andamento").length,
      apontamentosAbertos: auditoriasKPIs.apontamentosAbertos,
      taxaConformidade: auditoriasKPIs.taxaConformidade,
    };
  }, [auditorias]);

  const porMes = useMemo(() => {
    const map = new Map<number, Auditoria[]>();
    for (const a of filtered) {
      if (!map.has(a.mesInicio)) map.set(a.mesInicio, []);
      map.get(a.mesInicio)!.push(a);
    }
    return map;
  }, [filtered]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              Auditorias
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Programa anual, execução e apontamentos das auditorias internas e externas.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-brand hover:bg-brand/90">
            <Link to="/auditorias/nova">
              <Plus className="mr-1.5 h-4 w-4" />
              Programar Nova Auditoria
            </Link>
          </Button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <KPI label="Auditorias no ano" value={liveKpis.totalAno} icon={CalendarDays} />
          <KPI label="Realizadas" value={liveKpis.realizadas} icon={CheckCircle2} tone="success" />
          <KPI label="Programadas" value={liveKpis.programadas} icon={Clock} />
          <KPI label="Em andamento" value={liveKpis.emAndamento} icon={Play} tone="brand" />
          <KPI
            label="Apontamentos abertos"
            value={liveKpis.apontamentosAbertos}
            icon={AlertTriangle}
            tone="warning"
          />
          <KPI
            label="Taxa de conformidade"
            value={`${liveKpis.taxaConformidade}%`}
            icon={Target}
            tone="success"
          />
        </div>

        {/* Filtros */}
        <Card className="rounded-xl">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Interna">Interna</SelectItem>
                <SelectItem value="Externa">Externa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={norma} onValueChange={setNorma}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Norma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as normas</SelectItem>
                {normasDisponiveis.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Programa anual — timeline */}
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Programa Anual de Auditorias · {ano}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Distribuição das auditorias por mês. Cada card representa uma auditoria programada.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[1100px] grid-cols-12 gap-2">
                {MESES.map((m, i) => (
                  <div key={m} className="border-l border-dashed border-border pl-2">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {m}
                    </div>
                    <div className="flex min-h-[120px] flex-col gap-2">
                      {(porMes.get(i + 1) ?? []).map((a) => (
                        <AuditCard key={a.id} a={a} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Timeline / Table */}
        <Tabs defaultValue="tabela">
          <TabsList>
            <TabsTrigger value="tabela">
              <Rows3 className="mr-1.5 h-4 w-4" />
              Tabela
            </TabsTrigger>
            <TabsTrigger value="lista">
              <LayoutList className="mr-1.5 h-4 w-4" />
              Lista compacta
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tabela">
            <Card className="rounded-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Normas</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Auditor Líder</TableHead>
                      <TableHead>Apontamentos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow
                        key={a.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate({ to: "/auditorias/$id", params: { id: a.id } })}
                      >
                        <TableCell className="font-mono text-xs">{a.codigo}</TableCell>
                        <TableCell className="text-sm">
                          {a.tipo === "Interna" ? (
                            <span className="text-foreground">Interna</span>
                          ) : (
                            <span>
                              Externa
                              <span className="ml-1 text-xs text-muted-foreground">
                                · {a.certificadora}
                              </span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {a.normas.map((n) => (
                              <NormaChip key={n} n={n} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{a.evento}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(a.dataInicio).toLocaleDateString("pt-BR")} —{" "}
                          {new Date(a.dataFim).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-sm">{a.auditorLider.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <ApontChip
                              label="OPM"
                              count={a.apontamentos.opm}
                              cls="border-brand/30 bg-brand-soft text-brand"
                            />
                            <ApontChip
                              label="NC Simples"
                              count={a.apontamentos.ncSimples}
                              cls="border-[color:var(--warning)]/40 bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]"
                            />
                            <ApontChip
                              label="NC Moderada"
                              count={a.apontamentos.ncModerada}
                              cls="border-[color:var(--severity-high)]/40 bg-[color:var(--severity-high)]/15 text-[color:var(--severity-high)]"
                            />
                            <ApontChip
                              label="NC Crítica"
                              count={a.apontamentos.ncCritica}
                              cls="border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("border text-xs", auditoriaStatusClasses[a.status])}
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {a.status === "Programada" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                updateAuditoriaStatus(a.id, "Em andamento");
                                toast.success(`${a.codigo} iniciada.`);
                              }}
                            >
                              <Play className="mr-1 h-3 w-3" /> Iniciar
                            </Button>
                          )}
                          {a.status === "Em andamento" && (
                            <Button
                              size="sm"
                              className="h-7 bg-[color:var(--success)] text-white text-xs hover:bg-[color:var(--success)]/90"
                              onClick={() => {
                                updateAuditoriaStatus(a.id, "Concluída");
                                toast.success(`${a.codigo} concluída.`);
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Concluir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="lista">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AuditCard key={a.id} a={a} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
