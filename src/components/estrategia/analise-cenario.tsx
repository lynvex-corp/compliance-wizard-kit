import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles, Plus, Link2, GripVertical, CalendarCheck2, Pencil, Trash2, Wand2,
  Archive, ArchiveRestore, AlertTriangle, ExternalLink, ClipboardList, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, SWOT_CATEGORIAS, type SwotItem, type SwotCategoria } from "@/lib/jawda-store";

type Quadrant = SwotItem["quadrante"];
type Cruzamento = "FT" | "WO" | "FO" | "WT";

const quadrantMeta: Record<Quadrant, { label: string; sub: string; ring: string; head: string; chip: string }> = {
  F: { label: "Forças", sub: "Internas · Positivas", ring: "border-[color:var(--success)]/40", head: "bg-[color:var(--success)]/10 text-[color:var(--success)]", chip: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30" },
  W: { label: "Fraquezas", sub: "Internas · Negativas", ring: "border-[color:var(--warning)]/50", head: "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]", chip: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40" },
  O: { label: "Oportunidades", sub: "Externas · Positivas", ring: "border-brand/30", head: "bg-brand-soft text-brand", chip: "bg-brand-soft text-brand border-brand/20" },
  T: { label: "Ameaças", sub: "Externas · Negativas", ring: "border-[color:var(--severity-critical)]/40", head: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]", chip: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30" },
};

interface IARec {
  id: string;
  titulo: string;
  descricao: string;
  origem: string;
  quadranteOrigem: Quadrant;
}

const cruzamentos: Record<Cruzamento, { label: string; sub: string; a: Quadrant; b: Quadrant }> = {
  FT: { label: "Forças × Ameaças", sub: "Defensiva (Máxi-Míni)", a: "F", b: "T" },
  WO: { label: "Fraquezas × Oportunidades", sub: "Reforço (Míni-Máxi)", a: "W", b: "O" },
  FO: { label: "Forças × Oportunidades", sub: "Ofensiva (Máxi-Máxi)", a: "F", b: "O" },
  WT: { label: "Fraquezas × Ameaças", sub: "Sobrevivência (Míni-Míni)", a: "W", b: "T" },
};

const estrategiaTexto: Record<Cruzamento, (x: string, y: string) => { titulo: string; descricao: string }> = {
  FT: (x, y) => ({ titulo: `Usar a força "${x}" para mitigar a ameaça "${y}"`, descricao: "Estratégia defensiva: capitalize a força interna para neutralizar a ameaça externa mais aguda." }),
  WO: (x, y) => ({ titulo: `Corrigir a fraqueza "${x}" aproveitando a oportunidade "${y}"`, descricao: "Estratégia de reforço: use a oportunidade externa como alavanca para reduzir a fraqueza interna." }),
  FO: (x, y) => ({ titulo: `Combinar a força "${x}" com a oportunidade "${y}"`, descricao: "Estratégia ofensiva: use a força interna para capturar o valor máximo da oportunidade." }),
  WT: (x, y) => ({ titulo: `Blindar a fraqueza "${x}" contra a ameaça "${y}"`, descricao: "Estratégia de sobrevivência: reduza a exposição interna antes que a ameaça externa se materialize." }),
};

const categoriaChip = "rounded-md border-border/70 bg-muted/60 text-[10px] font-medium text-muted-foreground";

const corte = (t: string, n = 46) => (t.length > n ? `${t.slice(0, n)}…` : t);

export function AnaliseCenarioPage() {
  const {
    swotItens, addSwotItem, updateSwotItem, removeSwotItem, moveSwotItem,
    ncs,
  } = useJawda();
  const navigate = useNavigate();
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<Quadrant | null>(null);
  const [formText, setFormText] = useState("");
  const [formCat, setFormCat] = useState<SwotCategoria>("Operacional");
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiRecs, setAiRecs] = useState<IARec[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [cruz, setCruz] = useState<Cruzamento>("FT");

  const ativos = useMemo(() => swotItens.filter((s) => !s.arquivado), [swotItens]);
  const arquivados = useMemo(() => swotItens.filter((s) => s.arquivado), [swotItens]);
  const ncIdPorCodigo = useMemo(
    () => new Map(ncs.map((n) => [n.codigo, n.id])),
    [ncs],
  );

  const onDrop = (q: Quadrant) => {
    if (!dragId) return;
    moveSwotItem(dragId, q);
    toast.success("Card reclassificado");
    setDragId(null);
  };

  const gerarPlano = (origemLabel: string, problema: string) => {
    navigate({
      to: "/planos-de-acao/novo",
      search: { origem: "Estratégia", vinculado: origemLabel, problema },
    });
  };

  const salvar = () => {
    const texto = formText.trim();
    if (!texto) return;
    if (editingId) {
      updateSwotItem(editingId, { texto, categoria: formCat });
      toast.success("Card atualizado");
    } else if (adding) {
      addSwotItem({ quadrante: adding, texto, categoria: formCat });
      toast.success("Card adicionado");
    }
    setEditingId(null);
    setAdding(null);
    setFormText("");
  };

  const arquivar = (it: SwotItem) => {
    removeSwotItem(it.id);
    toast.success("Card arquivado", {
      description: "Nada é excluído definitivamente — consulte em “Arquivados”.",
    });
  };

  const rodarIA = (tipo: Cruzamento = cruz) => {
    setCruz(tipo);
    setAiLoading(true);
    setAiOpen(true);
    setAiRecs([]);
    setTimeout(() => {
      const meta = cruzamentos[tipo];
      const listaA = ativos.filter((s) => s.quadrante === meta.a);
      const listaB = ativos.filter((s) => s.quadrante === meta.b);
      const recs: IARec[] = [];
      for (let i = 0; i < 3; i++) {
        const a = listaA[i];
        const b = listaB[i];
        if (!a || !b) break;
        const { titulo, descricao } = estrategiaTexto[tipo](corte(a.texto), corte(b.texto));
        recs.push({
          id: `${tipo}-${i}`,
          titulo,
          descricao,
          origem: meta.label,
          quadranteOrigem: meta.a === "F" ? meta.b : meta.a,
        });
      }
      setAiRecs(recs);
      setAiLoading(false);
    }, 900);
  };

  const aplicarRec = (rec: IARec) => {
    gerarPlano(`SWOT · ${rec.origem}`, rec.titulo);
  };

  const abrirEdicao = (it: SwotItem) => {
    setEditingId(it.id);
    setFormText(it.texto);
    setFormCat(it.categoria ?? "Operacional");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Cenário</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Matriz SWOT do sistema de gestão — arraste os cards entre quadrantes, gere planos de ação a partir de fraquezas e ameaças ou cruze quadrantes com a IA Jáwda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Switch checked={mostrarArquivados} onCheckedChange={setMostrarArquivados} />
              Ver arquivados ({arquivados.length})
            </label>
            <Button size="sm" onClick={() => rodarIA("FT")} className="rounded-lg bg-brand text-white hover:bg-brand/90">
              <Sparkles className="mr-1.5 h-4 w-4" /> Analisar SWOT com IA
            </Button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(Object.keys(quadrantMeta) as Quadrant[]).map((q) => {
              const meta = quadrantMeta[q];
              const list = (mostrarArquivados ? swotItens : ativos).filter((i) => i.quadrante === q);
              const ativosNoQuadrante = ativos.filter((i) => i.quadrante === q).length;
              const showAction = q === "W" || q === "T";
              return (
                <div
                  key={q}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(q)}
                  className={cn("flex min-h-[360px] flex-col rounded-2xl border-2 bg-card p-3 shadow-sm", meta.ring)}
                >
                  <div className={cn("mb-3 flex items-center justify-between rounded-xl px-3 py-2", meta.head)}>
                    <div>
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-[10px] uppercase tracking-wide opacity-80">{meta.sub}</div>
                    </div>
                    <Badge variant="outline" className={cn("rounded-md border text-[10px]", meta.chip)}>{ativosNoQuadrante}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {list.map((it) => {
                      const ncId = it.origemNC ? ncIdPorCodigo.get(it.origemNC) : undefined;
                      return (
                      <div
                        key={it.id}
                        draggable={!it.arquivado}
                        onDragStart={() => setDragId(it.id)}
                        className={cn(
                          "group rounded-xl border bg-card p-3 shadow-sm transition hover:border-brand/40 hover:shadow-md",
                          it.origemNC ? "border-dashed border-brand/50 bg-brand-soft/20" : "border-border/70",
                          it.arquivado ? "opacity-60" : "cursor-grab active:cursor-grabbing",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                          <div className="min-w-0 flex-1">
                            <div className={cn("text-sm font-medium text-foreground", it.arquivado && "line-through")}>{it.texto}</div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {it.categoria && (
                                <Badge variant="outline" className={categoriaChip}>{it.categoria}</Badge>
                              )}
                              {it.origemNC && (
                                <Link
                                  to="/nao-conformidades/$id"
                                  params={{ id: ncId ?? it.origemNC }}
                                  className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand hover:underline"
                                >
                                  Origem: {it.origemNC}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                              {it.arquivado && (
                                <Badge variant="outline" className="rounded-md text-[10px]">Arquivado</Badge>
                              )}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {it.criadoEm ? new Date(`${it.criadoEm}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
                              {it.autor ? ` · ${it.autor}` : ""}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {it.planoVinculado ? (
                                <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                                  <Link2 className="mr-1 h-3 w-3" /> {it.planoVinculado}
                                </Badge>
                              ) : showAction && !it.arquivado ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => gerarPlano(it.origemNC ?? `SWOT-${it.quadrante}`, `Tratar ${q === "W" ? "fraqueza" : "ameaça"}: ${it.texto}`)}
                                  className="h-7 rounded-md px-2 text-[11px] text-brand hover:bg-brand-soft"
                                >
                                  <Plus className="mr-1 h-3 w-3" /> Gerar Plano de Ação
                                </Button>
                              ) : null}
                              {it.arquivado ? (
                                <Button size="sm" variant="ghost" onClick={() => { updateSwotItem(it.id, { arquivado: false }); toast.success("Card restaurado"); }} className="ml-auto h-7 rounded-md px-2 text-[11px]">
                                  <ArchiveRestore className="mr-1 h-3 w-3" /> Restaurar
                                </Button>
                              ) : (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => abrirEdicao(it)} className="ml-auto h-7 w-7 rounded-md p-0 opacity-0 group-hover:opacity-100">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => arquivar(it)} className="h-7 w-7 rounded-md p-0 text-[color:var(--severity-critical)] opacity-0 group-hover:opacity-100">
                                    <Archive className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}

                    {adding === q ? (
                      <div className="space-y-2 rounded-xl border border-brand/40 bg-brand-soft/25 p-3">
                        <Textarea
                          value={formText}
                          onChange={(e) => setFormText(e.target.value)}
                          placeholder={`Descreva a ${meta.label.toLowerCase().replace(/s$/, "")} de forma curta e objetiva`}
                          className="min-h-[70px] rounded-lg bg-card text-xs"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <Select value={formCat} onValueChange={(v) => setFormCat(v as SwotCategoria)}>
                            <SelectTrigger className="h-8 flex-1 rounded-lg text-[11px]">
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {SWOT_CATEGORIAS.map((c) => (
                                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={salvar} className="h-8 rounded-md bg-brand px-3 text-[11px] text-white hover:bg-brand/90">Salvar</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAdding(null); setFormText(""); }} className="h-8 w-8 rounded-md p-0">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAdding(q); setEditingId(null); setFormText(""); setFormCat("Operacional"); }}
                        className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 py-2 text-[11px] text-muted-foreground hover:border-brand/40 hover:text-brand"
                      >
                        <Plus className="h-3 w-3" /> Novo Card
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-4">
            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-1.5 text-brand">
                  <Wand2 className="h-4 w-4" />
                  <h2 className="text-sm font-semibold text-foreground">Análise cruzada</h2>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Combine dois quadrantes e receba estratégias sugeridas.
                </p>
                <div className="space-y-1.5 pt-1">
                  {(Object.keys(cruzamentos) as Cruzamento[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => rodarIA(k)}
                      className="flex w-full items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-left transition hover:border-brand/40 hover:bg-brand-soft/40"
                    >
                      <span>
                        <span className="block text-xs font-medium text-foreground">Cruzar {cruzamentos[k].label}</span>
                        <span className="block text-[10px] text-muted-foreground">{cruzamentos[k].sub}</span>
                      </span>
                      <Sparkles className="h-3.5 w-3.5 text-brand" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Contexto</h2>
                  <Badge variant="outline" className="rounded-md text-[10px]">Rev. 3</Badge>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Contexto interno</label>
                  <Textarea
                    defaultValue="Estrutura matricial com 340 colaboradores, cultura orientada à segurança e forte governança fiscal. SGI certificado ISO 9001 desde 2011."
                    className="min-h-[110px] rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Contexto externo</label>
                  <Textarea
                    defaultValue="Mercado em consolidação, pressão regulatória crescente (ANVISA/MAPA), instabilidade cambial e aceleração de exigências ESG."
                    className="min-h-[110px] rounded-lg text-xs"
                  />
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <CalendarCheck2 className="h-3.5 w-3.5 text-brand" />
                  Última análise crítica: <span className="font-medium text-foreground">28/mar/2026</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 bg-brand-soft/40 shadow-sm">
              <CardContent className="p-4 text-[11px] leading-relaxed text-foreground/80">
                <div className="mb-1 flex items-center gap-1.5 text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Dica</span>
                </div>
                Fraquezas e Ameaças devem virar plano de ação. Cards com borda pontilhada vêm automaticamente de Não Conformidades sinalizadas como fraqueza ou ameaça.
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal de edição */}
      <Dialog open={editingId !== null} onOpenChange={(o) => { if (!o) setEditingId(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar card</DialogTitle>
            <DialogDescription>Descreva de forma clara e objetiva.</DialogDescription>
          </DialogHeader>
          <Textarea value={formText} onChange={(e) => setFormText(e.target.value)} className="min-h-[110px] rounded-lg text-sm" autoFocus />
          <Select value={formCat} onValueChange={(v) => setFormCat(v as SwotCategoria)}>
            <SelectTrigger className="rounded-lg text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {SWOT_CATEGORIAS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
            <Button onClick={salvar} className="bg-brand text-white hover:bg-brand/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal IA */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-brand" /> Análise cruzada — {cruzamentos[cruz].label}
            </DialogTitle>
            <DialogDescription>
              {cruzamentos[cruz].sub} — a IA Jáwda combina os quadrantes e propõe estratégias acionáveis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3 text-[11px] leading-relaxed text-foreground/80">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--severity-high)]" />
            <span>
              <strong>Sugestão simulada de IA</strong> — apenas sugestão, deve ser analisada e validada por um responsável antes de virar plano de ação.
            </span>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              Cruzando quadrantes…
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecs.length === 0 && (
                <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Sem combinações suficientes neste cruzamento. Adicione mais cards nos quadrantes envolvidos.
                </p>
              )}
              {aiRecs.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/70 bg-brand-soft/30 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-brand">{r.origem}</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{r.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.descricao}</p>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={() => aplicarRec(r)} className="rounded-md bg-brand text-white hover:bg-brand/90">
                      <ClipboardList className="mr-1 h-3 w-3" /> Gerar plano de ação
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}