import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Users, Building2, Landmark, Truck, HardHat, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Tipo = "Cliente" | "Colaborador" | "Fornecedor" | "Órgão regulador" | "Comunidade" | "Acionista";
type Crit = "Alta" | "Média" | "Baixa";
interface Parte {
  id: string; nome: string; tipo: Tipo;
  necessidades: string; requisitos: string; monitoramento: string;
  criticidade: Crit; influencia: number; interesse: number;
}

const tipoIcon: Record<Tipo, React.ComponentType<{ className?: string }>> = {
  Cliente: Users, Colaborador: HardHat, Fornecedor: Truck,
  "Órgão regulador": Landmark, Comunidade: Building2, Acionista: TrendingUp,
};
const tipoColor: Record<Tipo, string> = {
  Cliente: "bg-brand-soft text-brand border-brand/20",
  Colaborador: "bg-[color:var(--chart-2)]/15 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/30",
  Fornecedor: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  "Órgão regulador": "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
  Comunidade: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Acionista: "bg-muted text-foreground border-border",
};
const critColor: Record<Crit, string> = {
  Alta: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
  Média: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Baixa: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
};

const initial: Parte[] = [
  { id: "p1", nome: "Clientes Corporativos (Top 20)", tipo: "Cliente", necessidades: "Prazo, qualidade constante e rastreabilidade", requisitos: "Certificação ISO 9001, SLA de entrega ≤ 5 dias", monitoramento: "NPS trimestral + Reuniões de status", criticidade: "Alta", influencia: 90, interesse: 85 },
  { id: "p2", nome: "Colaboradores diretos", tipo: "Colaborador", necessidades: "Ambiente seguro e desenvolvimento", requisitos: "NR-05, NR-35, plano de carreira", monitoramento: "Pesquisa de clima anual + eNPS", criticidade: "Alta", influencia: 70, interesse: 90 },
  { id: "p3", nome: "Fornecedores críticos (Classe A)", tipo: "Fornecedor", necessidades: "Previsibilidade de compra e pagamento em dia", requisitos: "Homologação + auditoria anual", monitoramento: "IQF mensal + auditoria in loco", criticidade: "Alta", influencia: 75, interesse: 60 },
  { id: "p4", nome: "ANVISA", tipo: "Órgão regulador", necessidades: "Conformidade sanitária plena", requisitos: "RDC 658/2022 — BPF", monitoramento: "Inspeções + relatórios anuais", criticidade: "Alta", influencia: 95, interesse: 55 },
  { id: "p5", nome: "Comunidade do entorno", tipo: "Comunidade", necessidades: "Baixo impacto ambiental e ruído", requisitos: "Licenciamento ambiental IBAMA", monitoramento: "Canal de ouvidoria + audiências públicas", criticidade: "Média", influencia: 40, interesse: 65 },
  { id: "p6", nome: "Acionistas / Board", tipo: "Acionista", necessidades: "Retorno financeiro e crescimento sustentável", requisitos: "Relatórios trimestrais + compliance", monitoramento: "Assembleias + dashboards executivos", criticidade: "Alta", influencia: 92, interesse: 78 },
  { id: "p7", nome: "Fornecedores de utilidades", tipo: "Fornecedor", necessidades: "Consumo previsível", requisitos: "Contratos de longo prazo", monitoramento: "Controle mensal", criticidade: "Baixa", influencia: 30, interesse: 25 },
  { id: "p8", nome: "Sindicato da categoria", tipo: "Colaborador", necessidades: "Diálogo formal com a empresa", requisitos: "Acordo coletivo vigente", monitoramento: "Reuniões mensais", criticidade: "Média", influencia: 55, interesse: 70 },
];

export function PartesInteressadasPage() {
  const [rows] = useState<Parte[]>(initial);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Partes Interessadas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mapeamento de stakeholders, necessidades, expectativas e monitoramento — requisito 4.2 da ISO 9001.
            </p>
          </div>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
            <Plus className="mr-1.5 h-4 w-4" /> Nova parte interessada
          </Button>
        </header>

        {/* Bubble map */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Mapa de Influência × Interesse</h2>
                <p className="text-[11px] text-muted-foreground">Posicione visualmente cada parte para priorizar o engajamento.</p>
              </div>
              <div className="hidden gap-3 md:flex">
                {(["Alta","Média","Baixa"] as Crit[]).map((c) => (
                  <span key={c} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", c==="Alta"&&"bg-[color:var(--severity-critical)]", c==="Média"&&"bg-[color:var(--warning)]", c==="Baixa"&&"bg-[color:var(--success)]")} />
                    {c} criticidade
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-[340px] rounded-xl border border-border/70 bg-gradient-to-br from-brand-soft/40 via-background to-background">
              {/* grid lines */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
                <div className="absolute top-1/2 left-0 h-px w-full bg-border/60" />
              </div>
              {/* quadrant labels */}
              <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Monitorar</span>
              <span className="absolute right-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-brand">Gerenciar de perto</span>
              <span className="absolute left-3 bottom-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Esforço mínimo</span>
              <span className="absolute right-3 bottom-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Manter satisfeito</span>
              {/* axis */}
              <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-wide text-muted-foreground">Influência →</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wide text-muted-foreground">Interesse →</span>

              {rows.map((p, idx) => {
                const size = p.criticidade === "Alta" ? 56 : p.criticidade === "Média" ? 44 : 34;
                const color = p.criticidade === "Alta" ? "bg-[color:var(--severity-critical)]/80" : p.criticidade === "Média" ? "bg-[color:var(--warning)]/80" : "bg-[color:var(--success)]/80";
                return (
                  <div
                    key={p.id}
                    title={p.nome}
                    className={cn("group absolute flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ring-2 ring-white transition hover:scale-110", color)}
                    style={{
                      width: size, height: size,
                      left: `calc(${p.interesse}% - ${size/2}px)`,
                      bottom: `calc(${p.influencia}% - ${size/2}px)`,
                    }}
                  >
                    {idx + 1}
                    <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">
                      {p.nome}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Cadastro completo</h2>
              <Input placeholder="Buscar parte interessada…" className="h-8 max-w-xs rounded-lg text-xs" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Parte interessada</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Necessidades e expectativas</TableHead>
                    <TableHead>Requisitos</TableHead>
                    <TableHead>Monitoramento</TableHead>
                    <TableHead>Criticidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p, idx) => {
                    const Icon = tipoIcon[p.tipo];
                    return (
                      <TableRow key={p.id} className="text-xs">
                        <TableCell className="font-mono text-[10px] text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{p.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-md border text-[10px]", tipoColor[p.tipo])}>
                            <Icon className="mr-1 h-3 w-3" /> {p.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[260px] text-[11px] text-foreground/80">{p.necessidades}</TableCell>
                        <TableCell className="max-w-[220px] text-[11px] text-foreground/80">{p.requisitos}</TableCell>
                        <TableCell className="max-w-[220px] text-[11px] text-foreground/80">{p.monitoramento}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("rounded-md border text-[10px]", critColor[p.criticidade])}>
                            {p.criticidade}
                          </Badge>
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
    </AppShell>
  );
}