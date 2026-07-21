import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, AlertTriangle, FileText, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "Vigente" | "Em revisão" | "Obsoleto";
type Tipo = "Manual" | "Procedimento" | "Formulário" | "Registro" | "Externo";
interface Doc {
  codigo: string; titulo: string; tipo: Tipo; rev: string; data: string; status: Status; resp: string; origem?: string;
}

const internos: Doc[] = [
  { codigo: "MA.SGI.001", titulo: "Manual do Sistema de Gestão da Qualidade", tipo: "Manual", rev: "05", data: "10/02/2026", status: "Vigente", resp: "Fernanda Lima" },
  { codigo: "PO.SGI.001", titulo: "Procedimento de Controle de Documentos", tipo: "Procedimento", rev: "04", data: "22/03/2026", status: "Vigente", resp: "Fernanda Lima" },
  { codigo: "PO.SGI.002", titulo: "Procedimento de Auditoria Interna", tipo: "Procedimento", rev: "03", data: "18/01/2026", status: "Vigente", resp: "Rafael Costa" },
  { codigo: "PO.OPR.007", titulo: "Procedimento de Controle de Não Conformidades", tipo: "Procedimento", rev: "02", data: "05/06/2026", status: "Em revisão", resp: "Diego Almeida" },
  { codigo: "FL.GRH.003", titulo: "Formulário de Descrição de Cargo", tipo: "Formulário", rev: "01", data: "12/11/2025", status: "Vigente", resp: "Beatriz Souza" },
  { codigo: "FL.QUA.011", titulo: "Formulário de Registro de NC", tipo: "Formulário", rev: "03", data: "20/04/2026", status: "Vigente", resp: "Fernanda Lima" },
  { codigo: "IT.PRO.022", titulo: "Instrução de Setup Envasadora ENV-02", tipo: "Procedimento", rev: "01", data: "14/09/2024", status: "Obsoleto", resp: "Diego Almeida" },
  { codigo: "RG.QUA.009", titulo: "Registro de Análise Crítica pela Direção", tipo: "Registro", rev: "02", data: "30/06/2026", status: "Vigente", resp: "Fernanda Lima" },
];

const externos: Doc[] = [
  { codigo: "EXT.001", titulo: "ABNT NBR ISO 9001:2015", tipo: "Externo", rev: "—", data: "30/09/2015", status: "Vigente", resp: "Fernanda Lima", origem: "ABNT" },
  { codigo: "EXT.014", titulo: "RDC 216/2004 — Boas Práticas de Fabricação", tipo: "Externo", rev: "—", data: "15/09/2004", status: "Vigente", resp: "Regulatório", origem: "ANVISA" },
  { codigo: "EXT.022", titulo: "Manual do fornecedor MP-2231 rev. 2024", tipo: "Externo", rev: "2024", data: "10/04/2024", status: "Vigente", resp: "Rafael Costa", origem: "Fornecedor BASF" },
  { codigo: "EXT.031", titulo: "Especificação técnica cliente Alpha (contrato #22)", tipo: "Externo", rev: "B", data: "02/02/2026", status: "Vigente", resp: "Carla Menezes", origem: "Cliente Alpha" },
];

const pendentes = [
  { codigo: "PO.OPR.007", titulo: "Controle de Não Conformidades (rev. 03)", etapa: 2, quem: ["Diego A.", "Fernanda L.", "Diretor"] },
  { codigo: "IT.PRO.045", titulo: "Instrução operacional linha de mistura", etapa: 1, quem: ["Marcos V.", "Diego A.", "Ger. Qualidade"] },
  { codigo: "FL.GRH.019", titulo: "Formulário de Avaliação de Eficácia de Treinamento", etapa: 3, quem: ["Beatriz S.", "RH", "Diretora"] },
];

const statusColor: Record<Status, string> = {
  Vigente: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em revisão": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Obsoleto: "bg-muted text-muted-foreground border-border",
};

function DocTable({ docs, showOrigem }: { docs: Doc[]; showOrigem?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
            <TableHead>Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            {showOrigem && <TableHead>Origem</TableHead>}
            <TableHead>Rev.</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((d) => (
            <TableRow key={d.codigo} className="text-xs">
              <TableCell className="font-mono text-[11px] font-semibold text-brand">{d.codigo}</TableCell>
              <TableCell className="max-w-[320px] text-foreground/85">{d.titulo}</TableCell>
              <TableCell><Badge variant="outline" className="rounded-md text-[10px]">{d.tipo}</Badge></TableCell>
              {showOrigem && <TableCell className="text-muted-foreground">{d.origem}</TableCell>}
              <TableCell className="font-mono text-[11px] text-foreground/85">{d.rev}</TableCell>
              <TableCell className="text-muted-foreground">{d.data}</TableCell>
              <TableCell><Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[d.status])}>{d.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{d.resp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DocumentosPage() {
  const [busca, setBusca] = useState("");
  const filt = (arr: Doc[]) => arr.filter((d) => (d.codigo + d.titulo).toLowerCase().includes(busca.toLowerCase()));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documentos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Informação documentada — controle de documentos internos e externos.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} className="h-9 w-64 rounded-lg pl-8 text-xs" placeholder="Buscar por código ou título…" />
            </div>
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
              <Plus className="mr-1.5 h-4 w-4" /> Novo documento
            </Button>
          </div>
        </header>

        <Tabs defaultValue="int">
          <TabsList className="rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="int" className="rounded-md text-xs">Internos ({internos.length})</TabsTrigger>
            <TabsTrigger value="ext" className="rounded-md text-xs">Externos ({externos.length})</TabsTrigger>
            <TabsTrigger value="pen" className="rounded-md text-xs">Pendentes de aprovação ({pendentes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="int" className="mt-4">
            <DocTable docs={filt(internos)} />
          </TabsContent>

          <TabsContent value="ext" className="mt-4 space-y-3">
            <Card className="rounded-xl border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 shadow-none">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--severity-high)]" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Oportunidade de melhoria (OPM)</div>
                  <div className="text-[11px] text-muted-foreground">Recomenda-se centralizar o controle de documentos externos em um único repositório, com verificação semestral de vigência das normas técnicas e requisitos legais aplicáveis.</div>
                </div>
              </CardContent>
            </Card>
            <DocTable docs={filt(externos)} showOrigem />
          </TabsContent>

          <TabsContent value="pen" className="mt-4 space-y-3">
            {pendentes.map((p) => (
              <Card key={p.codigo} className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-semibold text-brand">{p.codigo}</div>
                      <div className="text-sm font-medium text-foreground">{p.titulo}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {["Elaborado", "Analisado", "Aprovado"].map((etapa, i) => {
                      const done = i < p.etapa;
                      const current = i === p.etapa;
                      return (
                        <div key={etapa} className="flex items-center gap-2">
                          <div className={cn(
                            "flex flex-col items-center gap-1",
                          )}>
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold",
                              done ? "border-[color:var(--success)] bg-[color:var(--success)] text-white" :
                              current ? "border-brand bg-brand-soft text-brand" :
                              "border-border bg-muted text-muted-foreground",
                            )}>
                              {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : (i + 1)}
                            </div>
                            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{etapa}</div>
                            <div className="text-[10px] font-medium text-foreground/80">{p.quem[i]}</div>
                          </div>
                          {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}