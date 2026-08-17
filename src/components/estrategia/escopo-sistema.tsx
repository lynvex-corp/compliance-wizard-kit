import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, ShieldCheck, AlertTriangle, Download, Pencil, Plus, Trash2, History, X, Check,
  Bold, Italic, List, Undo2, Send, BadgeCheck, Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda } from "@/lib/jawda-store";

const normas = [
  { codigo: "ISO 9001:2015", titulo: "Sistemas de Gestão da Qualidade" },
  { codigo: "ISO 14001:2015", titulo: "Sistemas de Gestão Ambiental" },
  { codigo: "ISO 45001:2018", titulo: "Sistemas de Gestão de SST" },
];

/** Itens da norma redigidos com termos próprios (não transcritos literalmente). */
const REQUISITOS_NORMA = [
  { item: "4.3", rotulo: "Definição dos limites do sistema de gestão" },
  { item: "7.1.5.2", rotulo: "Confiabilidade e calibração de instrumentos de medição" },
  { item: "8.2.1", rotulo: "Canais de relacionamento e comunicação com o cliente" },
  { item: "8.3", rotulo: "Projeto e desenvolvimento de produtos e serviços" },
  { item: "8.4", rotulo: "Controle de processos, produtos e serviços fornecidos por terceiros" },
  { item: "8.5.1", rotulo: "Controle das condições de produção e prestação de serviço" },
  { item: "8.5.3", rotulo: "Guarda de bens pertencentes a clientes ou fornecedores" },
  { item: "8.5.4", rotulo: "Preservação do produto durante manuseio e armazenagem" },
  { item: "8.5.5", rotulo: "Atividades posteriores à entrega (garantia e assistência)" },
  { item: "8.7", rotulo: "Tratamento de saídas que não atendem aos requisitos" },
];

export function EscopoSistemaPage() {
  const {
    escopoTexto, escopoRevisoes, updateEscopoTexto,
    exclusoes, addExclusao, updateExclusao, removeExclusao,
  } = useJawda();

  const [editOpen, setEditOpen] = useState(false);
  const [novoTexto, setNovoTexto] = useState(escopoTexto);
  const [revSelecionada, setRevSelecionada] = useState<string | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState({ item: REQUISITOS_NORMA[0]!.item, justificativa: "" });
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [destaque, setDestaque] = useState<string | null>(null);
  const [statusDoc, setStatusDoc] = useState<"Rascunho" | "Aguardando Aprovação" | "Vigente">("Vigente");

  const FLUXO = ["Rascunho", "Aguardando Aprovação", "Vigente"] as const;
  const etapaAtual = FLUXO.indexOf(statusDoc);

  const semJust = useMemo(() => exclusoes.filter((e) => !e.justificativa.trim()), [exclusoes]);
  const revAtual = escopoRevisoes[escopoRevisoes.length - 1];
  const revVisivel = revSelecionada
    ? escopoRevisoes.find((r) => r.rev === revSelecionada) ?? revAtual
    : revAtual;
  const vendoHistorico = Boolean(revSelecionada && revSelecionada !== revAtual?.rev);

  const salvarEscopo = () => {
    if (!novoTexto.trim()) { toast.error("O escopo não pode ficar vazio"); return; }
    if (novoTexto.trim() === escopoTexto.trim()) { toast.info("Nenhuma alteração para revisar"); return; }
    updateEscopoTexto(novoTexto);
    setStatusDoc("Rascunho");
    toast.success("Nova revisão criada como Rascunho", {
      description: "Envie para aprovação da Alta Direção para torná-la vigente.",
    });
    setRevSelecionada(null);
    setEditOpen(false);
  };

  /** Marcação simples de texto no editor (rich text básico em markdown). */
  const aplicarMarca = (tipo: "bold" | "italic" | "list") => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = novoTexto.slice(start, end) || "texto";
    const marcado =
      tipo === "bold" ? `**${sel}**` : tipo === "italic" ? `_${sel}_` : `\n• ${sel}`;
    const proximo = novoTexto.slice(0, start) + marcado + novoTexto.slice(end);
    setNovoTexto(proximo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marcado.length, start + marcado.length);
    });
  };

  const salvarExclusao = () => {
    if (!nova.justificativa.trim()) {
      toast.error("A justificativa da exclusão é obrigatória");
      return;
    }
    const req = REQUISITOS_NORMA.find((r) => r.item === nova.item)!;
    addExclusao({
      requisito: `ISO 9001 · ${req.item}`,
      descricao: req.rotulo,
      justificativa: nova.justificativa,
    });
    toast.success("Item não aplicável registrado com justificativa");
    setNova({ item: REQUISITOS_NORMA[0]!.item, justificativa: "" });
    setNovaOpen(false);
  };

  const tratarAgora = () => {
    const alvo = semJust[0];
    if (!alvo) return;
    setDestaque(alvo.id);
    rowRefs.current[alvo.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const campo = document.getElementById(`just-${alvo.id}`) as HTMLTextAreaElement | null;
      campo?.focus();
    }, 500);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Escopo do Sistema de Gestão</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Declare os limites e a aplicabilidade do sistema de gestão: produtos e serviços cobertos, unidades,
              processos e locais. Cada alteração gera uma nova revisão em Rascunho, que passa por aprovação da
              Alta Direção antes de se tornar vigente. As revisões anteriores nunca são sobrescritas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.info("Exportação de PDF simulada no protótipo")}>
              <Download className="mr-1.5 h-4 w-4" /> Exportar PDF
            </Button>
            {statusDoc === "Rascunho" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-[color:var(--warning)]/50 text-[color:var(--warning)]"
                onClick={() => { setStatusDoc("Aguardando Aprovação"); toast.success("Revisão enviada para aprovação da Alta Direção"); }}
              >
                <Send className="mr-1.5 h-4 w-4" /> Enviar para aprovação
              </Button>
            )}
            {statusDoc === "Aguardando Aprovação" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-[color:var(--success)]/50 text-[color:var(--success)]"
                onClick={() => { setStatusDoc("Vigente"); toast.success("Escopo aprovado pela Alta Direção — revisão vigente"); }}
              >
                <BadgeCheck className="mr-1.5 h-4 w-4" /> Aprovar (Alta Direção)
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => { setNovoTexto(escopoTexto); setEditOpen(true); }}
              className="rounded-lg bg-brand text-white hover:bg-brand/90"
            >
              <Pencil className="mr-1.5 h-4 w-4" /> Editar escopo
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
          {FLUXO.map((etapa, idx) => (
            <div key={etapa} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium",
                  idx === etapaAtual
                    ? "border-brand/50 bg-brand-soft text-brand"
                    : idx < etapaAtual
                      ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                      : "border-border/60 bg-card text-muted-foreground",
                )}
              >
                <span className="font-mono">{idx + 1}</span> {etapa}
                {etapa === "Aguardando Aprovação" && <span className="text-[10px]">(Alta Direção)</span>}
              </span>
              {idx < FLUXO.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>

        {semJust.length > 0 && (
          <Alert
            variant="destructive"
            className="rounded-xl border-[color:var(--severity-critical)]/50 bg-[color:var(--severity-critical)]/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Item não aplicável sem justificativa registrada — risco de apontamento em auditoria</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span>
                {semJust.length} item(ns) não aplicável(is) pendente(s): {semJust.map((e) => e.requisito).join(", ")}
              </span>
              <Button
                size="sm"
                onClick={tratarAgora}
                className="h-7 rounded-md bg-[color:var(--severity-critical)] px-2 text-[11px] text-white hover:bg-[color:var(--severity-critical)]/90"
              >
                Tratar agora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                    Declaração de escopo · DOC-SG-001
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    Sistema de Gestão Integrada — Indústria Nova Aurora
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto rounded-md text-[10px]",
                    vendoHistorico
                      ? "border-[color:var(--warning)]/50 text-[color:var(--warning)]"
                      : "border-brand/40 text-brand",
                  )}
                >
                  Rev. {revVisivel?.rev} ·{" "}
                  {revVisivel ? new Date(revVisivel.data).toLocaleDateString("pt-BR") : ""}
                  {vendoHistorico ? " · histórico" : " · vigente"}
                </Badge>
              </div>

              {vendoHistorico && (
                <div className="flex items-center justify-between rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-3 py-2 text-[11px] text-foreground">
                  <span>Você está visualizando uma revisão histórica (somente leitura).</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={() => setRevSelecionada(null)}>
                    <Undo2 className="mr-1 h-3 w-3" /> Voltar à revisão vigente
                  </Button>
                </div>
              )}

              <Separator />

              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                {revVisivel?.texto}
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
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <History className="h-4 w-4 text-brand" /> Histórico de revisões
              </div>
              <ol className="space-y-2">
                {[...escopoRevisoes].reverse().map((r) => {
                  const vigente = r.rev === revAtual?.rev;
                  const ativa = r.rev === revVisivel?.rev;
                  return (
                    <li key={r.rev}>
                      <button
                        onClick={() => setRevSelecionada(vigente ? null : r.rev)}
                        className={cn(
                          "w-full rounded-lg border p-2.5 text-left transition hover:border-brand/50",
                          ativa ? "border-brand/50 bg-brand-soft/50" : "border-border/60 bg-card",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-brand">Rev. {r.rev}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(r.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {vigente && (
                          <Badge className="mt-1 rounded-md bg-brand text-[9px] text-white">Revisão atual</Badge>
                        )}
                        <p className="mt-1 line-clamp-3 text-[11px] text-muted-foreground">{r.texto}</p>
                        <div className="mt-1 text-[10px] text-muted-foreground/80">por {r.autor}</div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Exclusões de requisitos</h2>
                <p className="text-[11px] text-muted-foreground">
                  Requisitos não aplicáveis ao escopo declarado — a justificativa é obrigatória.
                </p>
              </div>
              <Button size="sm" onClick={() => setNovaOpen(true)} variant="outline" className="rounded-lg">
                <Plus className="mr-1 h-3 w-3" /> Nova exclusão
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <TableHead className="w-[150px]">Item da norma</TableHead>
                  <TableHead className="w-[280px]">Requisito</TableHead>
                  <TableHead>Justificativa da exclusão</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {exclusoes.map((e) => {
                  const pendente = !e.justificativa.trim();
                  return (
                    <TableRow
                      key={e.id}
                      ref={(el) => { rowRefs.current[e.id] = el; }}
                      className={cn(
                        "align-top text-xs transition-colors",
                        pendente && "bg-[color:var(--severity-critical)]/5",
                        destaque === e.id && "ring-2 ring-[color:var(--severity-critical)]/50",
                      )}
                    >
                      <TableCell className="font-mono text-[11px] font-semibold text-brand">{e.requisito}</TableCell>
                      <TableCell className="text-foreground/85">{e.descricao}</TableCell>
                      <TableCell>
                        <Textarea
                          id={`just-${e.id}`}
                          value={e.justificativa}
                          onChange={(ev) => updateExclusao(e.id, { justificativa: ev.target.value })}
                          placeholder="Descreva por que o requisito não se aplica ao escopo (obrigatório)"
                          className={cn(
                            "min-h-[60px] rounded-md text-xs",
                            pendente && "border-[color:var(--severity-critical)]/60",
                          )}
                        />
                        {pendente && (
                          <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[color:var(--severity-critical)]">
                            <AlertTriangle className="h-3 w-3" /> Justificativa obrigatória não preenchida
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { removeExclusao(e.id); toast.success("Exclusão removida"); }}
                          className="h-7 w-7 p-0 text-[color:var(--severity-critical)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Editor de escopo */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar escopo do sistema de gestão</DialogTitle>
            <DialogDescription>
              Ao salvar, a revisão {revAtual?.rev} é preservada no histórico e uma nova revisão é publicada.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => aplicarMarca("bold")} title="Negrito">
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => aplicarMarca("italic")} title="Itálico">
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => aplicarMarca("list")} title="Item de lista">
              <List className="h-3.5 w-3.5" />
            </Button>
            <span className="ml-auto pr-2 text-[10px] text-muted-foreground">{novoTexto.length} caracteres</span>
          </div>
          <Textarea
            ref={editorRef}
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            className="min-h-[260px] rounded-lg text-sm leading-relaxed"
          />
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
            <DialogTitle>Nova exclusão de requisito</DialogTitle>
            <DialogDescription>Selecione o requisito e registre a justificativa.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium">Requisito da norma</label>
              <select
                value={nova.item}
                onChange={(e) => setNova({ ...nova, item: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {REQUISITOS_NORMA.map((r) => (
                  <option key={r.item} value={r.item}>{r.item} — {r.rotulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Justificativa da exclusão *</label>
              <Textarea
                value={nova.justificativa}
                onChange={(e) => setNova({ ...nova, justificativa: e.target.value })}
                placeholder="Explique por que o requisito não é aplicável ao escopo declarado"
                className="mt-1 min-h-[110px] rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button
              onClick={salvarExclusao}
              disabled={!nova.justificativa.trim()}
              className="bg-brand text-white hover:bg-brand/90"
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}