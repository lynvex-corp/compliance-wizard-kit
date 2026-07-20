import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Circle, Plus, Shuffle, Users, Package, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "Avaliada" | "Implementada" | "Em análise";
interface Mudanca {
  id: string; data: string; titulo: string; proposito: string; consequencias: string;
  status: Status; checklist: { integridade: boolean; recursos: boolean; responsabilidades: boolean; comunicacao: boolean };
  responsavel: string;
}

const items: Mudanca[] = [
  {
    id: "m1", data: "18/jul/2026",
    titulo: "Assessoria da qualidade passa a responder diretamente à obra",
    proposito: "Aproximar a área da qualidade da rotina operacional e reduzir tempo de resposta a não conformidades em campo.",
    consequencias: "Ganho de agilidade em tratativas; risco de perda de independência da função qualidade — mitigado via reporte funcional ao Diretor.",
    status: "Em análise", responsavel: "Beatriz Souza",
    checklist: { integridade: true, recursos: true, responsabilidades: true, comunicacao: false },
  },
  {
    id: "m2", data: "02/jun/2026",
    titulo: "Nova estrutura de comitês do SGI (mensal → quinzenal)",
    proposito: "Aumentar frequência de análise crítica dos indicadores estratégicos.",
    consequencias: "Melhor governança e tomada de decisão; requer disponibilidade adicional da diretoria (~4h/mês).",
    status: "Implementada", responsavel: "Rafael Costa",
    checklist: { integridade: true, recursos: true, responsabilidades: true, comunicacao: true },
  },
  {
    id: "m3", data: "15/mai/2026",
    titulo: "Terceirização parcial do laboratório físico-químico",
    proposito: "Reduzir custos operacionais e ampliar catálogo de ensaios disponíveis.",
    consequencias: "Dependência de terceiro homologado; SLA contratual de 48h para resultados críticos.",
    status: "Avaliada", responsavel: "Fernanda Lima",
    checklist: { integridade: true, recursos: true, responsabilidades: false, comunicacao: true },
  },
  {
    id: "m4", data: "20/mar/2026",
    titulo: "Migração do sistema documental para nova plataforma",
    proposito: "Adotar plataforma com controle de versão automático e workflow de aprovação eletrônica.",
    consequencias: "Necessidade de treinamento de 220 usuários; risco de perda de dados mitigado via migração assistida.",
    status: "Implementada", responsavel: "Ana Ribeiro",
    checklist: { integridade: true, recursos: true, responsabilidades: true, comunicacao: true },
  },
];

const statusColor: Record<Status, string> = {
  Avaliada: "bg-brand-soft text-brand border-brand/20",
  Implementada: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em análise": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
};

const checks: { key: keyof Mudanca["checklist"]; label: string; icon: React.ComponentType<{className?:string}> }[] = [
  { key: "integridade", label: "Impacto na integridade do SG", icon: Shuffle },
  { key: "recursos", label: "Recursos alocados", icon: Package },
  { key: "responsabilidades", label: "Realocação de responsabilidades", icon: Users },
  { key: "comunicacao", label: "Comunicação executada", icon: Scale },
];

export function MudancasSGPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mudanças no Sistema de Gestão</h1>
            <p className="mt-1 text-sm text-muted-foreground">Requisito 6.3 da ISO 9001 — controle de mudanças planejadas.</p>
          </div>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
            <Plus className="mr-1.5 h-4 w-4" /> Nova mudança
          </Button>
        </header>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-6" />
          <ol className="space-y-5">
            {items.map((m) => (
              <li key={m.id} className="relative pl-12 md:pl-16">
                <span className={cn(
                  "absolute left-0 top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand bg-card text-brand shadow-sm md:left-2",
                  m.status === "Implementada" && "border-[color:var(--success)] text-[color:var(--success)]",
                  m.status === "Em análise" && "border-[color:var(--warning)] text-[color:var(--severity-high)]",
                )}>
                  <Shuffle className="h-3.5 w-3.5" />
                </span>
                <Card className="rounded-2xl border-border/80 shadow-sm">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m.data} · {m.responsavel}</div>
                        <h3 className="mt-0.5 text-base font-semibold text-foreground">{m.titulo}</h3>
                      </div>
                      <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[m.status])}>{m.status}</Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-brand">Propósito</div>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/85">{m.proposito}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--severity-high)]">Consequências potenciais</div>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/85">{m.consequencias}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/60 p-3">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Checklist de avaliação (6.3.a-d)</div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {checks.map((c) => {
                          const done = m.checklist[c.key];
                          const Icon = c.icon;
                          return (
                            <div key={c.key} className={cn(
                              "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px]",
                              done ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5 text-foreground"
                                   : "border-border bg-background text-muted-foreground",
                            )}>
                              <span className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full",
                                done ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground",
                              )}>
                                {done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                              </span>
                              <Icon className="h-3.5 w-3.5 opacity-70" />
                              <span className="flex-1">{c.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}