import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FileText, ShieldCheck, AlertTriangle, Download, Pencil, Plus, Trash2, History, Wrench, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda } from "@/lib/jawda-store";

const normas = [
  { codigo: "ISO 9001:2015", titulo: "Sistemas de Gestão da Qualidade" },
  { codigo: "ISO 14001:2015", titulo: "Sistemas de Gestão Ambiental" },
  { codigo: "ISO 45001:2018", titulo: "Sistemas de Gestão de SST" },
];

export function EscopoSistemaPage() {
  const { escopoTexto, escopoRevisoes, updateEscopoTexto, exclusoes, addExclusao, updateExclusao, removeExclusao } = useJawda();
  const [editOpen, setEditOpen] = useState(false);
  const [novoTexto, setNovoTexto] = useState(escopoTexto);
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState({ requisito: "", descricao: "", justificativa: "" });
  const [tratando, setTratando] = useState<string | null>(null);
  const [justif, setJustif] = useState("");

  const semJust = exclusoes.filter((e) => !e.justificativa.trim());
  const revAtual = escopoRevisoes[escopoRevisoes.length - 1];

  const salvarEscopo = () => {
    if (!novoTexto.trim()) return;
    if (novoTexto === escopoTexto) { toast.info("Nenhuma alteração"); return; }
    updateEscopoTexto(novoTexto);
    toast.success("Nova revisão do escopo publicada");
    setEditOpen(false);
  };

  const salvarExclusao = () => {
    if (!nova.requisito.trim() || !nova.descricao.trim()) { toast.error("Requisito e descrição obrigatórios"); return; }
    addExclusao(nova);
    if (!nova.justificativa.trim()) toast.warning("Exclusão sem justificativa — trate para evitar NC");
    else toast.success("Exclusão registrada");
    setNova({ requisito: "", descricao: "", justificativa: "" });
    setNovaOpen(false);
  };

  const salvarJustif = () => {
    if (!tratando || !justif.trim()) return;
    updateExclusao(tratando, { justificativa: justif });
    toast.success("Justificativa registrada");
    setTratando(null);
    setJustif("");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Escopo do Sistema de Gestão</h1>
            <p className="mt-1 text-sm text-muted-foreground">Requisito 4.3 da ISO 9001:2015 — cada edição gera nova revisão automaticamente.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg"><Download className="mr-1.5 h-4 w-4" /> Exportar PDF</Button>
            <Button size="sm" onClick={() => { setNovoTexto(escopoTexto); setEditOpen(true); }} className="rounded-lg bg-brand text-white hover:bg-brand/90">
              <Pencil className="mr-1.5 h-4 w-4" /> Editar escopo
            </Button>
          </div>
        </header>

        {semJust.length > 0 && (
          <Alert variant="destructive" className="rounded-xl border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Exclusão sem justificativa registrada — risco de não conformidade no item 4.3</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {semJust.map((e) => (
                <Badge key={e.id} variant="outline" className="rounded-md border-[color:var(--severity-critical)]/40 bg-background text-[color:var(--severity-critical)]">
                  {e.requisito}
                  <Button size="sm" variant="ghost" onClick={() => { setTratando(e.id); setJustif(""); }} className="ml-1 h-5 rounded px-1 text-[10px] text-[color:var(--severity-critical)] hover:bg-[color:var(--severity-critical)]/20">
                    <Wrench className="mr-1 h-3 w-3" /> Tratar agora
                  </Button>
                </Badge>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><FileText className="h-5 w-5" /></div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-brand">Declaração de escopo · DOC-SG-001</div>
                  <div className="text-lg font-semibold text-foreground">Sistema de Gestão Integrada — Indústria Nova Aurora</div>
                </div>
                <Badge variant="outline" className="ml-auto rounded-md text-[10px]">
                  Rev. {revAtual?.rev} · {revAtual ? new Date(revAtual.data).toLocaleDateString("pt-BR") : ""}
                </Badge>
              </div>

              <Separator />

              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{escopoTexto}</p>

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
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4 text-brand" /> Histórico de revisões
              </div>
              <ol className="space-y-3">
                {[...escopoRevisoes].reverse().map((r, idx) => (
                  <li key={r.rev} className={cn("rounded-lg border p-2.5", idx === 0 ? "border-brand/40 bg-brand-soft/40" : "border-border/60")}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-brand">Rev. {r.rev}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.data).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">{r.texto}</p>
                    <div className="mt-1 text-[10px] text-muted-foreground/80">por {r.autor}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Exclusões e justificativas</h2>
                <p className="text-[11px] text-muted-foreground">Requisitos não aplicáveis ao escopo definido acima.</p>
              </div>
              <Button size="sm" onClick={() => setNovaOpen(true)} variant="outline" className="rounded-lg">
                <Plus className="mr-1 h-3 w-3" /> Nova exclusão
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TableHead className="w-[160px]">Item da norma</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {exclusoes.map((e) => (
                  <TableRow key={e.id} className="align-top text-xs">
                    <TableCell className="font-mono text-[11px] font-semibold text-brand">{e.requisito}</TableCell>
                    <TableCell className="text-foreground/85">{e.descricao}</TableCell>
                    <TableCell className="text-foreground/70">
                      {e.justificativa || (
                        <button onClick={() => { setTratando(e.id); setJustif(""); }} className="inline-flex items-center gap-1 rounded-md bg-[color:var(--severity-critical)]/10 px-2 py-0.5 text-[11px] text-[color:var(--severity-critical)] hover:bg-[color:var(--severity-critical)]/20">
                          <AlertTriangle className="h-3 w-3" /> Preencher justificativa
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => { removeExclusao(e.id); toast.success("Exclusão removida"); }} className="h-7 w-7 p-0 text-[color:var(--severity-critical)]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Editar escopo */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar escopo do SGI</DialogTitle>
            <DialogDescription>Ao salvar, uma nova revisão será registrada no histórico.</DialogDescription>
          </DialogHeader>
          <Textarea value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} className="min-h-[220px] rounded-lg text-sm" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}><X className="mr-1 h-3 w-3" /> Cancelar</Button>
            <Button onClick={salvarEscopo} className="bg-brand text-white hover:bg-brand/90">
              <Check className="mr-1 h-3 w-3" /> Publicar nova revisão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nova exclusão */}
      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nova exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div><label className="text-xs font-medium">Item da norma</label><Input placeholder="Ex.: ISO 9001 · 8.3" value={nova.requisito} onChange={(e) => setNova({ ...nova, requisito: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs font-medium">Descrição do requisito</label><Textarea value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} className="mt-1" /></div>
            <div><label className="text-xs font-medium">Justificativa</label><Textarea placeholder="Deixe em branco para gerar alerta" value={nova.justificativa} onChange={(e) => setNova({ ...nova, justificativa: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button onClick={salvarExclusao} className="bg-brand text-white hover:bg-brand/90">Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tratar justificativa */}
      <Dialog open={tratando !== null} onOpenChange={(o) => { if (!o) setTratando(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar justificativa</DialogTitle>
            <DialogDescription>{exclusoes.find((e) => e.id === tratando)?.requisito}</DialogDescription>
          </DialogHeader>
          <Textarea value={justif} onChange={(e) => setJustif(e.target.value)} className="min-h-[120px] rounded-lg text-sm" autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTratando(null)}>Cancelar</Button>
            <Button onClick={salvarJustif} className="bg-brand text-white hover:bg-brand/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}