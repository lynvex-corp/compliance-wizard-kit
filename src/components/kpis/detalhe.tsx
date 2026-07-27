import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft, MoreHorizontal, Archive, Pencil, FileDown, Plus, History, Paperclip,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useKpis } from "@/lib/kpi-store";
import { foraDaMeta, semaforo, semaforoCor, semaforoLabel, ultimoValor } from "@/lib/kpi-data";
import { SemaforoDot, TendenciaIcon } from "./shared";
import { LancarMedicaoDialog } from "./medicao-dialogs";

export function IndicadorDetalhe({ id }: { id: string }) {
  const { kpis, objetivos, arquivarKpi, updateKpi } = useKpis();
  const kpi = kpis.find((k) => k.id === id);
  const [medOpen, setMedOpen] = useState(false);
  const [metaDialog, setMetaDialog] = useState(false);
  const [novaMeta, setNovaMeta] = useState<string>("");

  if (!kpi) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Indicador não encontrado.{" "}
          <Link to="/indicadores" className="text-brand underline">Voltar ao painel</Link>
        </div>
      </AppShell>
    );
  }

  const objetivo = objetivos.find((o) => o.id === kpi.objetivoId);
  const s = semaforo(kpi);
  const valores = kpi.medicoes.map((m) => m.valor);
  const chart = kpi.medicoes.map((m) => ({ periodo: m.periodo, valor: m.valor, meta: kpi.meta }));
  const melhor = valores.length ? (kpi.polaridade === "menor_melhor" ? Math.min(...valores) : Math.max(...valores)) : null;
  const pior = valores.length ? (kpi.polaridade === "menor_melhor" ? Math.max(...valores) : Math.min(...valores)) : null;
  const media = valores.length ? +(valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : null;

  function confirmarMeta() {
    const v = Number(novaMeta);
    if (Number.isNaN(v)) return toast.error("Informe um valor numérico.");
    updateKpi(kpi!.id, { meta: v }, `Meta alterada de ${kpi!.meta} para ${v}`);
    toast.success("Meta atualizada", { description: "A meta anterior foi preservada no histórico." });
    setMetaDialog(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1300px] space-y-5">
        <Link to="/indicadores" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-3 w-3" /> Voltar aos indicadores
        </Link>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="flex flex-wrap items-center gap-5 p-5">
            <SemaforoDot kpi={kpi} size="lg" />
            <div className="min-w-[240px] flex-1 space-y-1.5">
              <span className="font-mono text-[11px] font-semibold text-brand">{kpi.codigo}</span>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{kpi.nome}</h1>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="rounded-md border-brand/20 bg-brand-soft text-[10px] text-brand">{objetivo?.nome}</Badge>
                <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{kpi.processo}</Badge>
                <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{semaforoLabel[s]}</Badge>
              </div>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Meta</p>
                <p className="text-lg font-semibold">{kpi.meta}{kpi.unidade}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Realizado</p>
                <p className="text-3xl font-bold" style={{ color: semaforoCor[s] }}>
                  {ultimoValor(kpi) ?? "—"}{ultimoValor(kpi) !== null ? kpi.unidade : ""}
                </p>
              </div>
              <TendenciaIcon kpi={kpi} className="mb-2 h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setMedOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Lançar nova medição
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setNovaMeta(String(kpi.meta)); setMetaDialog(true); }}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Editar meta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { arquivarKpi(kpi.id); toast.success("Indicador arquivado", { description: "Continua acessível no filtro Arquivados." }); }}>
                    <Archive className="mr-2 h-3.5 w-3.5" /> Arquivar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Histórico exportado em CSV")}>
                    <FileDown className="mr-2 h-3.5 w-3.5" /> Exportar histórico
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="visao" className="space-y-4">
          <TabsList className="rounded-xl">
            <TabsTrigger value="visao" className="rounded-lg text-xs">Visão geral</TabsTrigger>
            <TabsTrigger value="medicoes" className="rounded-lg text-xs">Medições</TabsTrigger>
            <TabsTrigger value="analise" className="rounded-lg text-xs">Análise por período</TabsTrigger>
            <TabsTrigger value="config" className="rounded-lg text-xs">Configuração</TabsTrigger>
            <TabsTrigger value="trilha" className="rounded-lg text-xs">Trilha</TabsTrigger>
          </TabsList>

          <TabsContent value="visao">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-5">
                  <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-brand">Últimos períodos</h2>
                  <div className="h-[300px]">
                    {chart.length ? (
                      <ResponsiveContainer>
                        <LineChart data={chart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid var(--border)" }} />
                          <ReferenceLine y={kpi.meta} stroke="var(--brand)" strokeDasharray="5 4" label={{ value: `Meta ${kpi.meta}`, fontSize: 10, fill: "var(--brand)", position: "right" }} />
                          <Line type="monotone" dataKey="valor" stroke={semaforoCor[s]} strokeWidth={2.4} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Ainda sem medições registradas.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                {[
                  { l: "Melhor resultado", v: melhor, c: "var(--success)" },
                  { l: "Pior resultado", v: pior, c: "var(--danger-deep)" },
                  { l: "Média do período", v: media, c: "var(--brand)" },
                ].map((c) => (
                  <Card key={c.l} className="rounded-2xl border-border/80">
                    <CardContent className="p-4">
                      <p className="text-[11px] text-muted-foreground">{c.l}</p>
                      <p className="text-2xl font-bold" style={{ color: c.c }}>{c.v ?? "—"}{c.v !== null ? kpi.unidade : ""}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medicoes">
            <div className="overflow-hidden rounded-2xl border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[11px]">Período</TableHead>
                    <TableHead className="text-[11px]">Valor</TableHead>
                    <TableHead className="text-[11px]">Responsável</TableHead>
                    <TableHead className="text-[11px]">Lançado em</TableHead>
                    <TableHead className="text-[11px]">Observação</TableHead>
                    <TableHead className="text-[11px]">Evidência</TableHead>
                    <TableHead className="text-[11px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpi.medicoes.map((m) => (
                    <TableRow key={m.id} className="text-xs">
                      <TableCell>{m.periodo}</TableCell>
                      <TableCell className="font-semibold" style={{ color: foraDaMeta(kpi, m.valor) ? "var(--danger-deep)" : "var(--success)" }}>
                        {m.valor}{kpi.unidade}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.responsavel}</TableCell>
                      <TableCell className="text-muted-foreground">{m.lancadoEm}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">{m.observacao ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.evidencia ? <span className="inline-flex items-center gap-1"><Paperclip className="h-3 w-3" />{m.evidencia}</span> : "—"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 rounded-lg text-[11px]"
                          onClick={() => toast.info("Edição registrada na trilha", { description: "Disponível para o autor do lançamento e administradores." })}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!kpi.medicoes.length && (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">Nenhuma medição lançada.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analise" className="space-y-3">
            {kpi.medicoes.filter((m) => foraDaMeta(kpi, m.valor)).map((m, i) => (
              <Card key={m.id} className="rounded-2xl border-[color:var(--danger-deep)]/30 bg-[color:var(--danger-deep)]/5">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{m.periodo} · {m.valor}{kpi.unidade} (meta {kpi.meta}{kpi.unidade})</p>
                    <span className="text-[10px] text-muted-foreground">{m.responsavel}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {m.analise ?? "Análise crítica pendente de registro para este período."}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="rounded-md border-[color:var(--danger-deep)]/30 text-[10px] text-[color:var(--danger-deep)]">
                      NC_ID_{String(i + 21).padStart(3, "0")}_2026
                    </Badge>
                    <Badge variant="outline" className="rounded-md text-[10px]">PA-2026-0{i + 2}</Badge>
                    {i > 0 && <Badge variant="outline" className="rounded-md text-[10px]">Reincidência</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!kpi.medicoes.some((m) => foraDaMeta(kpi, m.valor)) && (
              <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Nenhum período fora da meta neste indicador.
              </p>
            )}
          </TabsContent>

          <TabsContent value="config">
            <Card className="rounded-2xl border-border/80">
              <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                <Campo label="Nome"><Input defaultValue={kpi.nome} className="rounded-lg text-sm" /></Campo>
                <Campo label="Código"><Input value={kpi.codigo} readOnly className="rounded-lg bg-muted/40 font-mono text-xs" /></Campo>
                <Campo label="Descrição" full><Textarea rows={2} defaultValue={kpi.descricao} className="rounded-lg text-sm" /></Campo>
                <Campo label="Fórmula" full><Textarea rows={2} defaultValue={kpi.formula} className="rounded-lg font-mono text-xs" /></Campo>
                <Campo label="Unidade"><Input defaultValue={kpi.unidade} className="rounded-lg text-sm" /></Campo>
                <Campo label="Frequência"><Input defaultValue={kpi.frequencia} className="rounded-lg text-sm" /></Campo>
                <Campo label="Meta">
                  <div className="flex gap-2">
                    <Input value={kpi.meta} readOnly className="rounded-lg bg-muted/40 text-sm" />
                    <Button variant="outline" className="rounded-lg" onClick={() => { setNovaMeta(String(kpi.meta)); setMetaDialog(true); }}>Editar</Button>
                  </div>
                </Campo>
                <Campo label="Tolerância para amarelo (%)"><Input defaultValue={kpi.toleranciaPct} className="rounded-lg text-sm" /></Campo>
                <Campo label="Responsável pela medição"><Input defaultValue={kpi.responsavelMedicao} className="rounded-lg text-sm" /></Campo>
                <Campo label="Responsável pela análise"><Input defaultValue={kpi.responsavelAnalise} className="rounded-lg text-sm" /></Campo>
                <Campo label="Ciclos fora antes de disparar"><Input defaultValue={kpi.ciclosParaDisparo} className="rounded-lg text-sm" /></Campo>
                <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                  <span className="text-xs text-foreground">Sugerir abrir NC quando fora da meta</span>
                  <Switch checked={kpi.sugerirNc} onCheckedChange={(v) => updateKpi(kpi.id, { sugerirNc: v }, "Configuração alterada")} />
                </div>
                <div className="md:col-span-2">
                  <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => toast.success("Configuração salva", { description: "Alteração registrada na trilha." })}>
                    Salvar configuração
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trilha">
            <Card className="rounded-2xl border-border/80">
              <CardContent className="p-5">
                <ol className="relative space-y-5 border-l border-border pl-5">
                  {kpi.trilha.map((t) => (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft">
                        <History className="h-3 w-3 text-brand" />
                      </span>
                      <p className="text-xs font-semibold text-foreground">{t.acao}</p>
                      {t.detalhe && <p className="text-[11px] text-muted-foreground">{t.detalhe}</p>}
                      <p className="text-[10px] text-muted-foreground">{t.data} · {t.autor}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <LancarMedicaoDialog kpi={kpi} open={medOpen} onOpenChange={setMedOpen} />

      <AlertDialog open={metaDialog} onOpenChange={setMetaDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar meta do indicador</AlertDialogTitle>
            <AlertDialogDescription>
              A meta anterior será preservada no histórico. O novo período partirá com a nova meta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input type="number" value={novaMeta} onChange={(e) => setNovaMeta(e.target.value)} className="rounded-lg text-sm" />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={confirmarMeta}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Campo({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}