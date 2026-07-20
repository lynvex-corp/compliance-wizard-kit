import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Plus, Gauge as GaugeIcon } from "lucide-react";
import { mockIndicadores, type Indicador } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const meses = ["Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

function sparkFor(ind: Indicador) {
  // deterministic seeded series ending at atual
  const seed = ind.id.length + ind.atual;
  const base = ind.polaridade === "maior_melhor" ? ind.atual * 0.8 : ind.atual * 1.15;
  const arr = meses.map((m, i) => {
    const w = ((seed * (i + 1)) % 7) - 3;
    const step = (ind.atual - base) * (i / 5);
    return { mes: m, v: Math.max(0, +(base + step + w * (ind.atual * 0.02)).toFixed(2)) };
  });
  arr[arr.length - 1].v = ind.atual;
  return arr;
}

const categoriaClasses: Record<Indicador["categoria"], string> = {
  Qualidade: "bg-brand-soft text-brand border-brand/20",
  Produção: "bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30",
  Segurança: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
  Ambiental: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Cliente: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
};

export function IndicadoresDashboard() {
  const [processo, setProcesso] = useState("all");
  const [unidade, setUnidade] = useState("all");
  const [periodo, setPeriodo] = useState("6m");

  const conformidadeGeral = useMemo(() => {
    const atingiram = mockIndicadores.filter((i) =>
      i.polaridade === "maior_melhor" ? i.atual >= i.meta : i.atual <= i.meta,
    ).length;
    return Math.round((atingiram / mockIndicadores.length) * 100);
  }, []);

  const gaugeData = [{ name: "Conformidade", value: conformidadeGeral, fill: "var(--brand)" }];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Indicadores e KPIs</h1>
            <p className="mt-1 text-sm text-muted-foreground">Painel executivo dos indicadores estratégicos do SGI.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={processo} onValueChange={setProcesso}>
              <SelectTrigger className="h-9 w-[160px] rounded-lg text-xs"><SelectValue placeholder="Processo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os processos</SelectItem>
                <SelectItem value="qualidade">Qualidade</SelectItem>
                <SelectItem value="producao">Produção</SelectItem>
                <SelectItem value="rh">RH & SST</SelectItem>
              </SelectContent>
            </Select>
            <Select value={unidade} onValueChange={setUnidade}>
              <SelectTrigger className="h-9 w-[140px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Matriz + Filiais</SelectItem>
                <SelectItem value="matriz">Apenas Matriz</SelectItem>
                <SelectItem value="sp">Filial SP</SelectItem>
                <SelectItem value="rs">Filial RS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-9 w-[120px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/indicadores/novo">
              <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <Plus className="mr-1.5 h-4 w-4" /> Elaborar indicador
              </Button>
            </Link>
          </div>
        </header>

        {/* Gauge highlight */}
        <Card className="rounded-2xl border-brand/30 bg-gradient-to-br from-brand-soft/60 via-background to-background shadow-sm">
          <CardContent className="flex flex-wrap items-center gap-6 p-6">
            <div className="relative h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={gaugeData} startAngle={220} endAngle={-40}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-brand">{conformidadeGeral}%</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Conformidade</span>
              </div>
            </div>
            <div className="flex-1 min-w-[220px] space-y-2">
              <div className="flex items-center gap-2">
                <GaugeIcon className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold text-foreground">Nível de conformidade do sistema</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Percentual de indicadores estratégicos que atingiram a meta no período. Combina qualidade, produção, segurança, cliente e ambiental.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <Badge variant="outline" className="rounded-md border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]">
                  {mockIndicadores.filter(i => (i.polaridade==="maior_melhor"?i.atual>=i.meta:i.atual<=i.meta)).length} atingiram
                </Badge>
                <Badge variant="outline" className="rounded-md border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]">
                  {mockIndicadores.filter(i => !(i.polaridade==="maior_melhor"?i.atual>=i.meta:i.atual<=i.meta)).length} abaixo da meta
                </Badge>
                <Badge variant="outline" className="rounded-md">Amostra: últimos {periodo === "3m" ? "3" : periodo === "12m" ? "12" : "6"} meses</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockIndicadores.map((ind) => {
            const atingido = ind.polaridade === "maior_melhor" ? ind.atual >= ind.meta : ind.atual <= ind.meta;
            const data = sparkFor(ind);
            const TrendIcon = ind.tendencia === "up" ? TrendingUp : ind.tendencia === "down" ? TrendingDown : Minus;
            const strokeColor = atingido ? "var(--success)" : "var(--severity-critical)";
            return (
              <Card key={ind.id} className="rounded-2xl border-border/80 shadow-sm transition hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold text-brand">{ind.codigo}</span>
                        <Badge variant="outline" className={cn("rounded-md text-[10px]", categoriaClasses[ind.categoria])}>{ind.categoria}</Badge>
                      </div>
                      <h3 className="truncate text-sm font-semibold text-foreground">{ind.nome}</h3>
                    </div>
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full",
                      atingido ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]",
                    )}>
                      <TrendIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-bold tracking-tight", atingido ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                      {ind.atual}
                    </span>
                    <span className="text-xs text-muted-foreground">{ind.unidade}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">Meta {ind.meta}{ind.unidade}</span>
                  </div>

                  <div className="h-[70px]">
                    <ResponsiveContainer>
                      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <XAxis dataKey="mes" hide />
                        <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid var(--border)" }} />
                        <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
                    <span>Amostra: {meses[0]}–{meses[meses.length-1]}/26</span>
                    <span>Resp.: <span className="font-medium text-foreground">{ind.responsavel}</span></span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}