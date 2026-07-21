import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { GraduationCap, IdCard, CheckCircle2, Award, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Colab { nome: string; iniciais: string; formacao: string; experiencia: string;
  treinamentos: Array<{ nome: string; data: string; eficacia: boolean }>;
  performance: { resultado: number; meta: number };
  aso: { validade: string; ok: boolean };
}
interface Cargo { titulo: string; resumo: string; educacao: string; treinamento: string[]; experiencia: string; doc: string; colabs: Colab[]; }

const cargos: Cargo[] = [
  { titulo: "Analista da Qualidade", resumo: "Responsável por auditorias, tratativa de NCs e análise de indicadores da qualidade.",
    educacao: "Superior em Engenharia ou áreas afins",
    treinamento: ["ISO 9001:2015", "Auditor Interno", "Análise de causa raiz"],
    experiencia: "Mín. 2 anos em sistemas de gestão",
    doc: "FL.GRH.003 rev. 01",
    colabs: [
      { nome: "Fernanda Lima", iniciais: "FL", formacao: "Eng. Química — UFRJ", experiencia: "5 anos",
        treinamentos: [{ nome: "ISO 9001:2015", data: "03/2025", eficacia: true }, { nome: "Auditor Interno", data: "06/2025", eficacia: true }, { nome: "Análise de causa raiz", data: "11/2025", eficacia: true }],
        performance: { resultado: 92, meta: 80 }, aso: { validade: "10/2026", ok: true } },
      { nome: "Rafael Costa", iniciais: "RC", formacao: "Eng. Produção — USP", experiencia: "3 anos",
        treinamentos: [{ nome: "ISO 9001:2015", data: "04/2025", eficacia: true }, { nome: "Auditor Interno", data: "09/2025", eficacia: true }],
        performance: { resultado: 85, meta: 80 }, aso: { validade: "02/2026", ok: false } },
    ] },
  { titulo: "Operador de Produção", resumo: "Executa operações de envase, embalagem e registros de processo conforme instrução de trabalho.",
    educacao: "Ensino médio completo",
    treinamento: ["BPF", "NR-06", "NR-10 básico", "IT.PRO.022"],
    experiencia: "Desejável 6 meses em indústria",
    doc: "FL.GRH.003 rev. 01",
    colabs: [
      { nome: "Marcos Vinícius", iniciais: "MV", formacao: "Ensino Médio", experiencia: "4 anos",
        treinamentos: [{ nome: "BPF", data: "01/2025", eficacia: true }, { nome: "NR-06", data: "01/2025", eficacia: true }, { nome: "NR-10", data: "05/2024", eficacia: false }],
        performance: { resultado: 78, meta: 75 }, aso: { validade: "08/2026", ok: true } },
    ] },
  { titulo: "Gerente Comercial", resumo: "Lidera equipe de vendas e análise crítica de contratos.",
    educacao: "Superior em Administração ou Marketing",
    treinamento: ["ISO 9001:2015 (visão geral)", "Análise crítica de contratos"],
    experiencia: "Mín. 5 anos em liderança comercial",
    doc: "FL.GRH.003 rev. 01",
    colabs: [
      { nome: "Carla Menezes", iniciais: "CM", formacao: "Administração — FGV", experiencia: "9 anos",
        treinamentos: [{ nome: "ISO 9001 visão geral", data: "07/2025", eficacia: true }],
        performance: { resultado: 96, meta: 85 }, aso: { validade: "05/2027", ok: true } },
    ] },
  { titulo: "Analista de RH", resumo: "Gestão de pessoas, treinamentos e avaliação de desempenho.",
    educacao: "Superior em Psicologia ou Administração",
    treinamento: ["ISO 9001 requisito 7.2", "LGPD"],
    experiencia: "Mín. 2 anos",
    doc: "FL.GRH.003 rev. 01",
    colabs: [
      { nome: "Beatriz Souza", iniciais: "BS", formacao: "Psicologia — PUC", experiencia: "6 anos",
        treinamentos: [{ nome: "LGPD", data: "10/2025", eficacia: true }],
        performance: { resultado: 88, meta: 80 }, aso: { validade: "12/2026", ok: true } },
    ] },
];

export function CargosPage() {
  const [colab, setColab] = useState<Colab | null>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cargos e Perfis</h1>
            <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
              Integração externa — sistema de RH
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Descrições de cargo, competências e colaboradores associados.</p>
        </header>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableHead>Cargo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Competências requeridas</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Colaboradores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargos.map((c) => (
                  <TableRow key={c.titulo} className="text-xs">
                    <TableCell className="font-semibold text-foreground">{c.titulo}</TableCell>
                    <TableCell className="max-w-[280px] text-foreground/80">{c.resumo}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">Educ.: {c.educacao}</Badge>
                        {c.treinamento.map((t) => (
                          <Badge key={t} variant="outline" className="rounded-md text-[10px]">Trein.: {t}</Badge>
                        ))}
                        <Badge variant="outline" className="rounded-md text-[10px]">Exp.: {c.experiencia}</Badge>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="rounded-md font-mono text-[10px]">{c.doc}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {c.colabs.map((cl) => (
                          <button
                            key={cl.nome}
                            onClick={() => setColab(cl)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand ring-2 ring-white transition hover:scale-110"
                            title={cl.nome}
                          >
                            {cl.iniciais}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!colab} onOpenChange={(v) => !v && setColab(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">{colab?.iniciais}</div>
                <div>
                  <div>{colab?.nome}</div>
                  <div className="text-[11px] font-normal text-muted-foreground">Perfil de competências</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            {colab && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><GraduationCap className="h-3 w-3" /> Formação</div>
                    <div className="mt-1 text-xs text-foreground/85">{colab.formacao}</div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><IdCard className="h-3 w-3" /> Experiência</div>
                    <div className="mt-1 text-xs text-foreground/85">{colab.experiencia}</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Treinamentos realizados</div>
                  <div className="space-y-1">
                    {colab.treinamentos.map((t) => (
                      <div key={t.nome} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-xs">
                        <span className="text-foreground/85">{t.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{t.data}</span>
                          <CheckCircle2 className={cn("h-4 w-4", t.eficacia ? "text-[color:var(--success)]" : "text-muted-foreground/40")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground"><Award className="h-3 w-3" /> Avaliação de desempenho</div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-brand">{colab.performance.resultado}%</span>
                    <span className="text-[10px] text-muted-foreground">Meta mínima {colab.performance.meta}%</span>
                  </div>
                  <Progress value={colab.performance.resultado} className="mt-2 h-1.5" />
                </div>
                <div className={cn("flex items-center justify-between rounded-lg border p-3 text-xs",
                  colab.aso.ok ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10" : "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10")}>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> ASO ocupacional</span>
                  <span className="font-mono">{colab.aso.ok ? "Válido até" : "VENCIDO —"} {colab.aso.validade}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}