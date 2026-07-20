import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FileText, ShieldCheck, AlertTriangle, Download, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const normas = [
  { codigo: "ISO 9001:2015", titulo: "Sistemas de Gestão da Qualidade" },
  { codigo: "ISO 14001:2015", titulo: "Sistemas de Gestão Ambiental" },
  { codigo: "ISO 45001:2018", titulo: "Sistemas de Gestão de SST" },
];

type StatusJust = "Aceita" | "Em revisão" | "Sem justificativa";
const exclusoes: { req: string; descricao: string; justificativa: string; status: StatusJust }[] = [
  { req: "ISO 9001 · 8.3", descricao: "Projeto e desenvolvimento de produtos", justificativa: "A organização atua exclusivamente na fabricação sob especificação do cliente, não realizando projeto próprio.", status: "Aceita" },
  { req: "ISO 9001 · 7.1.5.2", descricao: "Rastreabilidade de medição", justificativa: "Aplicável apenas a instrumentos críticos — em revisão pela equipe de metrologia.", status: "Em revisão" },
  { req: "ISO 14001 · 8.2", descricao: "Preparação e resposta a emergências ambientais específicas", justificativa: "", status: "Sem justificativa" },
];

const statusColor: Record<StatusJust, string> = {
  Aceita: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em revisão": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  "Sem justificativa": "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
};

export function EscopoSistemaPage() {
  const semJust = exclusoes.filter((e) => e.status === "Sem justificativa").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Escopo do Sistema de Gestão</h1>
            <p className="mt-1 text-sm text-muted-foreground">Requisito 4.3 da ISO 9001:2015 — definição e limites do SGI.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg"><Download className="mr-1.5 h-4 w-4" /> Exportar PDF</Button>
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"><Pencil className="mr-1.5 h-4 w-4" /> Editar escopo</Button>
          </div>
        </header>

        {semJust > 0 && (
          <Alert variant="destructive" className="rounded-xl border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{semJust} exclusão sem justificativa registrada</AlertTitle>
            <AlertDescription className="text-xs">
              O sistema exige justificativa formal para toda exclusão de requisito. Complete o campo abaixo para manter a conformidade.
            </AlertDescription>
          </Alert>
        )}

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><FileText className="h-5 w-5" /></div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-brand">Declaração de escopo · DOC-SG-001</div>
                <div className="text-lg font-semibold text-foreground">Sistema de Gestão Integrada — Indústria Nova Aurora</div>
              </div>
              <Badge variant="outline" className="ml-auto rounded-md text-[10px]">Rev. 07 · 12/mar/2026</Badge>
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-foreground/85">
              O Sistema de Gestão Integrada da <strong>Indústria Nova Aurora Ltda.</strong> abrange as atividades de
              <em> recebimento, fabricação, envase, controle de qualidade, armazenagem e expedição de produtos alimentícios e farmacêuticos </em>
              nas unidades da <strong>Matriz (Betim/MG)</strong> e <strong>Filial SP (Guarulhos/SP)</strong>, contemplando
              todos os processos de suporte relacionados — suprimentos, engenharia, manutenção, recursos humanos, segurança do trabalho e meio ambiente.
            </p>
            <p className="text-sm leading-relaxed text-foreground/85">
              A Filial RS (Porto Alegre) opera exclusivamente como <em>centro de distribuição</em> e está incluída no escopo do sistema de gestão da qualidade,
              porém <strong>não é auditada quanto aos requisitos de fabricação</strong>.
            </p>

            <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-brand" /> Normas aplicáveis
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {normas.map((n) => (
                  <div key={n.codigo} className="rounded-lg border border-border/60 bg-card p-3">
                    <div className="font-mono text-[11px] font-semibold text-brand">{n.codigo}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{n.titulo}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Exclusões e justificativas</h2>
                <p className="text-[11px] text-muted-foreground">Requisitos não aplicáveis ao escopo definido acima.</p>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg">+ Nova exclusão</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TableHead className="w-[160px]">Item da norma</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exclusoes.map((e, i) => (
                  <TableRow key={i} className="align-top text-xs">
                    <TableCell className="font-mono text-[11px] font-semibold text-brand">{e.req}</TableCell>
                    <TableCell className="text-foreground/85">{e.descricao}</TableCell>
                    <TableCell className="text-foreground/70">
                      {e.justificativa || (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[color:var(--severity-critical)]/10 px-2 py-0.5 text-[11px] text-[color:var(--severity-critical)]">
                          <AlertTriangle className="h-3 w-3" /> Preencher justificativa
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[e.status])}>
                        {e.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}