import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Target, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockIndicadores, mockPlanos, planoStatusClasses, type Indicador } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function statusMeta(i: Indicador) {
  const atingido =
    i.polaridade === "maior_melhor" ? i.atual >= i.meta : i.atual <= i.meta;
  const gap = Math.abs(((i.atual - i.meta) / (i.meta || 1)) * 100);
  return { atingido, gap };
}

const categoriaClasses: Record<Indicador["categoria"], string> = {
  Qualidade: "bg-brand-soft text-brand border-brand/20",
  Produção: "bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30",
  Segurança: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
  Ambiental: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Cliente: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
};

export function IndicadoresPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Indicadores e KPIs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas de desempenho da qualidade e planos de ação que atuam sobre cada indicador.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {mockIndicadores.map((ind) => {
            const { atingido, gap } = statusMeta(ind);
            const pctMeta = Math.min(
              100,
              Math.round(ind.polaridade === "maior_melhor" ? (ind.atual / ind.meta) * 100 : (ind.meta / Math.max(ind.atual, 0.01)) * 100),
            );
            const planos = mockPlanos.filter((p) => ind.planosVinculados.includes(p.id));
            const TrendIcon = ind.tendencia === "up" ? TrendingUp : ind.tendencia === "down" ? TrendingDown : Minus;
            return (
              <Card key={ind.id} className="rounded-xl border-border/80 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-brand">{ind.codigo}</span>
                        <Badge variant="outline" className={cn("rounded-md border text-[10px]", categoriaClasses[ind.categoria])}>
                          {ind.categoria}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{ind.nome}</h3>
                      <p className="text-[11px] text-muted-foreground">Responsável: {ind.responsavel}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className={cn("text-2xl font-semibold tracking-tight", atingido ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                          {ind.atual}
                        </span>
                        <span className="text-xs text-muted-foreground">{ind.unidade}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                        <Target className="h-3 w-3" /> Meta {ind.meta}{ind.unidade}
                        <TrendIcon className={cn("ml-1 h-3 w-3", ind.tendencia === "up" && "text-[color:var(--success)]", ind.tendencia === "down" && "text-[color:var(--severity-critical)]")} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{atingido ? "Meta atingida" : `Gap de ${gap.toFixed(1)}%`}</span>
                      <span className="font-medium text-foreground">{pctMeta}%</span>
                    </div>
                    <Progress
                      value={pctMeta}
                      className={cn("h-1.5 bg-muted", atingido ? "[&>div]:bg-[color:var(--success)]" : "[&>div]:bg-[color:var(--severity-critical)]")}
                    />
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <BarChart3 className="h-3.5 w-3.5 text-brand" />
                        Planos de Ação vinculados
                      </div>
                      <span className="text-[10px] text-muted-foreground">{planos.length} iniciativa(s)</span>
                    </div>
                    {planos.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">Nenhum plano vinculado.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {planos.map((p) => (
                          <Link
                            key={p.id}
                            to="/planos-de-acao/$id"
                            params={{ id: p.id }}
                            className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="font-mono text-[10px] font-semibold text-brand">{p.codigo}</span>
                              <span className="truncate text-[11px] text-foreground/80">{p.descricao}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("rounded-md border text-[9px]", planoStatusClasses[p.status].badge)}>
                                {p.status}
                              </Badge>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
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