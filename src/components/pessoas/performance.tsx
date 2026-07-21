import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

const ciclos = [
  { nome: "Ciclo 2026 — Matriz Ninebox", periodo: "Previsto para outubro/2026", status: "Planejado" },
  { nome: "Ciclo 2025.2 — Avaliação por competência", periodo: "Realizado em nov/2025", status: "Concluído" },
  { nome: "Ciclo 2025.1 — Feedback 360º", periodo: "Realizado em mai/2025", status: "Concluído" },
];

// Grid ninebox 3x3 — perf x potencial
interface P { nome: string; iniciais: string; }
const ninebox: P[][] = [
  // linha 3 (alto potencial)
  [
    [], [{ nome: "Ana Ribeiro", iniciais: "AR" }], [{ nome: "Carla Menezes", iniciais: "CM" }, { nome: "Fernanda Lima", iniciais: "FL" }],
  ] as any,
  // linha 2
  [
    [{ nome: "Juliana Peixoto", iniciais: "JP" }], [{ nome: "Rafael Costa", iniciais: "RC" }, { nome: "Diego Almeida", iniciais: "DA" }], [{ nome: "Beatriz Souza", iniciais: "BS" }],
  ] as any,
  // linha 1 (baixo potencial)
  [
    [{ nome: "Op. Turno 3", iniciais: "OT" }], [{ nome: "Marcos Vinícius", iniciais: "MV" }], [],
  ] as any,
];

const cellLabel = [
  ["Enigma", "Forte contribuidor", "Estrela"],
  ["Questionável", "Mantenedor", "Alto desempenho"],
  ["Insuficiente", "Eficaz", "Especialista"],
];

const cellColor = [
  ["bg-[color:var(--warning)]/20", "bg-brand-soft", "bg-[color:var(--success)]/25"],
  ["bg-[color:var(--severity-critical)]/10", "bg-muted/60", "bg-brand-soft"],
  ["bg-[color:var(--severity-critical)]/20", "bg-[color:var(--warning)]/15", "bg-muted/60"],
];

const resultados = [
  { nome: "Fernanda Lima", cargo: "Analista Qualidade Sr.", res: 92, meta: 80 },
  { nome: "Carla Menezes", cargo: "Gerente Comercial", res: 96, meta: 85 },
  { nome: "Rafael Costa", cargo: "Analista Qualidade", res: 85, meta: 80 },
  { nome: "Diego Almeida", cargo: "Coord. Produção", res: 82, meta: 80 },
  { nome: "Beatriz Souza", cargo: "Analista RH", res: 88, meta: 80 },
  { nome: "Marcos Vinícius", cargo: "Operador Sr.", res: 78, meta: 75 },
  { nome: "Juliana Peixoto", cargo: "Auditora interna", res: 90, meta: 80 },
  { nome: "Ana Ribeiro", cargo: "Analista Produção Jr.", res: 74, meta: 70 },
];

export function PerformancePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Avaliação de Performance</h1>
            <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
              Integração externa — RH
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Ciclos de avaliação e matriz Ninebox.</p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {ciclos.map((c) => (
            <Card key={c.nome} className={cn("rounded-2xl border-border/80 shadow-sm", c.status === "Planejado" && "border-brand/30 bg-brand-soft/30")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className={cn("rounded-md text-[10px]",
                    c.status === "Planejado" ? "border-brand/30 bg-white text-brand" : "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]")}>{c.status}</Badge>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">{c.nome}</div>
                <div className="text-[11px] text-muted-foreground">{c.periodo}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">Matriz Ninebox 3×3</h2>
              </div>
              <div className="flex">
                <div className="flex w-6 items-center justify-center">
                  <span className="-rotate-90 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Potencial →</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-2">
                    {ninebox.map((row, ri) =>
                      row.map((cell: P[], ci: number) => (
                        <div key={`${ri}-${ci}`} className={cn("rounded-xl border border-border/50 p-3 min-h-[130px]", cellColor[ri][ci])}>
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{cellLabel[ri][ci]}</div>
                          <div className="flex flex-wrap gap-1">
                            {cell.map((p) => (
                              <div key={p.nome} title={p.nome} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-brand shadow ring-1 ring-brand/20">
                                {p.iniciais}
                              </div>
                            ))}
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                  <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Desempenho →</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Resultados individuais</div>
              <div className="space-y-2">
                {resultados.map((r) => {
                  const ok = r.res >= r.meta;
                  return (
                    <div key={r.nome} className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-foreground">{r.nome}</div>
                          <div className="text-[10px] text-muted-foreground">{r.cargo}</div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-sm font-bold", ok ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>{r.res}%</div>
                          <div className="text-[9px] text-muted-foreground">meta {r.meta}%</div>
                        </div>
                      </div>
                      <Progress value={r.res} className="mt-1.5 h-1" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}