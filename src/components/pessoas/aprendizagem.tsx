import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock, AlertTriangle, Minus, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type S = "R" | "V" | "P" | "N"; // Realizado, Vencido, Programado, N.A.

const treinamentos = ["ISO 9001", "BPF", "NR-06", "NR-10", "Auditor Interno", "5S", "Análise causa raiz"];

const colabs: Array<{ nome: string; setor: string; status: S[] }> = [
  { nome: "Fernanda Lima", setor: "Qualidade", status: ["R", "R", "R", "N", "R", "R", "R"] },
  { nome: "Rafael Costa", setor: "Qualidade", status: ["R", "R", "N", "N", "R", "P", "R"] },
  { nome: "Diego Almeida", setor: "Produção", status: ["R", "R", "R", "V", "N", "R", "R"] },
  { nome: "Marcos Vinícius", setor: "Produção", status: ["N", "R", "R", "V", "N", "R", "P"] },
  { nome: "Beatriz Souza", setor: "RH", status: ["R", "N", "N", "N", "N", "R", "N"] },
  { nome: "Carla Menezes", setor: "Comercial", status: ["R", "N", "N", "N", "N", "R", "N"] },
  { nome: "Ana Ribeiro", setor: "Produção", status: ["P", "R", "R", "V", "N", "P", "N"] },
  { nome: "Juliana Peixoto", setor: "Qualidade", status: ["R", "R", "N", "N", "P", "R", "R"] },
];

const proximos = [
  { nome: "Auditor Interno ISO 9001", data: "10/09/2026", vagas: 12 },
  { nome: "NR-10 (reciclagem)", data: "15/08/2026", vagas: 8 },
  { nome: "Análise de causa raiz", data: "02/09/2026", vagas: 20 },
];

const cellStyle: Record<S, { c: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  R: { c: "bg-[color:var(--success)]/85 text-white", icon: CheckCircle2, label: "Realizado" },
  V: { c: "bg-[color:var(--severity-critical)]/85 text-white", icon: AlertTriangle, label: "Vencido" },
  P: { c: "bg-brand text-white", icon: Clock, label: "Programado" },
  N: { c: "bg-muted text-muted-foreground", icon: Minus, label: "N.A." },
};

export function AprendizagemPage() {
  const [setor, setSetor] = useState("Todos");
  const rows = setor === "Todos" ? colabs : colabs.filter((c) => c.setor === setor);
  const setores = ["Todos", ...Array.from(new Set(colabs.map((c) => c.setor)))];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestão de Aprendizagem</h1>
              <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
                Integração externa — RH
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Matriz de treinamentos por colaborador — requisito 7.2.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Setor</span>
            <Select value={setor} onValueChange={setSetor}>
              <SelectTrigger className="h-9 w-40 rounded-lg text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Colaborador</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Setor</th>
                      {treinamentos.map((t) => (
                        <th key={t} className="px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground">
                          <div className="mx-auto max-w-[70px] leading-tight">{t}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.nome} className="border-t border-border/60">
                        <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium text-foreground">{c.nome}</td>
                        <td className="px-3 py-2 text-muted-foreground">{c.setor}</td>
                        {c.status.map((s, i) => {
                          const st = cellStyle[s];
                          const Icon = st.icon;
                          return (
                            <td key={i} className="px-1 py-1 text-center">
                              <div className={cn("mx-auto flex h-7 w-full max-w-[60px] items-center justify-center gap-1 rounded-md text-[10px] font-semibold", st.c)} title={st.label}>
                                <Icon className="h-3 w-3" />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-border/60 px-4 py-3 text-[10px] text-muted-foreground">
                {(["R", "V", "P", "N"] as S[]).map((k) => {
                  const st = cellStyle[k];
                  return (
                    <span key={k} className="flex items-center gap-1.5">
                      <span className={cn("inline-block h-3 w-4 rounded", st.c)} /> {st.label}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card className="rounded-2xl border-brand/20 bg-brand-soft/40 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  <TrendingUp className="h-3 w-3" /> Taxa de eficácia média
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-brand">88%</span>
                  <span className="text-[11px] text-muted-foreground">últimos 12 meses</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-brand" style={{ width: "88%" }} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Próximos treinamentos
                </div>
                {proximos.map((p) => (
                  <div key={p.nome} className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
                    <div className="text-xs font-medium text-foreground">{p.nome}</div>
                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{p.data}</span>
                      <Badge variant="outline" className="rounded-md text-[10px]">{p.vagas} vagas</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}