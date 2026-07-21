import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Plus, Link2, GripVertical, CalendarCheck2, Pencil, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, type SwotItem } from "@/lib/jawda-store";

type Quadrant = SwotItem["quadrante"];

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
}

export function AnaliseCenarioPage() {
  const {
    swotItens, addSwotItem, updateSwotItem, removeSwotItem, moveSwotItem,
    addPlano,
  } = useJawda();
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SwotItem | null>(null);
  const [adding, setAdding] = useState<Quadrant | null>(null);
  const [formText, setFormText] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiRecs, setAiRecs] = useState<IARec[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const onDrop = (q: Quadrant) => {
    if (!dragId) return;
    moveSwotItem(dragId, q);
    toast.success("Card reclassificado");
    setDragId(null);
  };

  const gerarPlano = (it: SwotItem) => {
    const plano = addPlano({
      descricao: `Tratar ${it.quadrante === "W" ? "fraqueza" : "ameaça"}: ${it.texto}`,
      origemTipo: "Estratégia",
      vinculadoCodigo: `SWOT-${it.quadrante}`,
      pdca: "Plan",
      status: "Planejado",
    });
    updateSwotItem(it.id, { planoVinculado: plano.codigo });
    toast.success("Plano de ação gerado", { description: `Vínculo criado: ${plano.codigo}` });
  };

  const salvar = () => {
    const texto = formText.trim();
    if (!texto) return;
    if (editing) {
      updateSwotItem(editing.id, { texto });
      toast.success("Card atualizado");
    } else if (adding) {
      addSwotItem({ quadrante: adding, texto });
      toast.success("Card adicionado");
    }
    setEditing(null);
    setAdding(null);
    setFormText("");
  };

  const excluir = (id: string) => {
    removeSwotItem(id);
    toast.success("Card removido");
  };

  const rodarIA = () => {
    setAiLoading(true);
    setAiOpen(true);
    setAiRecs([]);
    setTimeout(() => {
      const forcas = swotItens.filter((s) => s.quadrante === "F");
      const ameacas = swotItens.filter((s) => s.quadrante === "T");
      const fraq = swotItens.filter((s) => s.quadrante === "W");
      const oport = swotItens.filter((s) => s.quadrante === "O");
      const recs: IARec[] = [];
      if (forcas[0] && ameacas[0])
        recs.push({ id: "r1", titulo: `Usar ${forcas[0].texto.slice(0, 40)}... para mitigar "${ameacas[0].texto.slice(0, 40)}..."`, descricao: "Estratégia defensiva (Máxi-Míni): capitalize sua força interna para neutralizar a ameaça externa mais aguda.", origem: "Força × Ameaça" });
      if (fraq[0] && oport[0])
        recs.push({ id: "r2", titulo: `Corrigir "${fraq[0].texto.slice(0, 40)}..." aproveitando "${oport[0].texto.slice(0, 40)}..."`, descricao: "Estratégia de reforço (Míni-Máxi): use a oportunidade externa como alavanca para reduzir a fraqueza interna.", origem: "Fraqueza × Oportunidade" });
      if (forcas[1] && oport[1])
        recs.push({ id: "r3", titulo: `Combinar "${forcas[1].texto.slice(0, 40)}..." com "${oport[1].texto.slice(0, 40)}..."`, descricao: "Estratégia ofensiva (Máxi-Máxi): use a força interna para capturar valor máximo da oportunidade.", origem: "Força × Oportunidade" });
      setAiRecs(recs);
      setAiLoading(false);
    }, 900);
  };

  const aplicarRec = (rec: IARec) => {
    const plano = addPlano({
      descricao: rec.titulo,
      origemTipo: "Estratégia",
      vinculadoCodigo: "SWOT-IA",
      pdca: "Plan",
      status: "Planejado",
    });
    toast.success("Plano criado a partir da IA", { description: plano.codigo });
    setAiRecs((prev) => prev.filter((r) => r.id !== rec.id));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Cenário</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Matriz SWOT do sistema de gestão — arraste os cards entre quadrantes, gere planos de ação a partir de fraquezas e ameaças ou peça uma análise cruzada à IA Jáwda.
            </p>
          </div>
          <Button size="sm" onClick={rodarIA} className="rounded-lg bg-brand text-white hover:bg-brand/90">
            <Sparkles className="mr-1.5 h-4 w-4" /> Analisar SWOT com IA
          </Button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(Object.keys(quadrantMeta) as Quadrant[]).map((q) => {
              const meta = quadrantMeta[q];
              const list = swotItens.filter((i) => i.quadrante === q);
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
                    <Badge variant="outline" className={cn("rounded-md border text-[10px]", meta.chip)}>{list.length}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {list.map((it) => (
                      <div
                        key={it.id}
                        draggable
                        onDragStart={() => setDragId(it.id)}
                        className="group cursor-grab rounded-xl border border-border/70 bg-card p-3 shadow-sm transition hover:border-brand/40 hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground">{it.texto}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {it.planoVinculado ? (
                                <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                                  <Link2 className="mr-1 h-3 w-3" /> {it.planoVinculado}
                                </Badge>
                              ) : showAction ? (
                                <Button size="sm" variant="ghost" onClick={() => gerarPlano(it)} className="h-7 rounded-md px-2 text-[11px] text-brand hover:bg-brand-soft">
                                  <Plus className="mr-1 h-3 w-3" /> Gerar Plano de Ação
                                </Button>
                              ) : null}
                              <Button size="sm" variant="ghost" onClick={() => { setEditing(it); setFormText(it.texto); }} className="ml-auto h-7 w-7 rounded-md p-0 opacity-0 group-hover:opacity-100">
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => excluir(it.id)} className="h-7 w-7 rounded-md p-0 text-[color:var(--severity-critical)] opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => { setAdding(q); setFormText(""); }}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 py-2 text-[11px] text-muted-foreground hover:border-brand/40 hover:text-brand"
                    >
                      <Plus className="h-3 w-3" /> Adicionar item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-4">
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
                Fraquezas e Ameaças devem virar plano de ação. Use "Analisar com IA" para cruzar os quadrantes e receber recomendações estratégicas prontas.
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal add/edit */}
      <Dialog open={editing !== null || adding !== null} onOpenChange={(o) => { if (!o) { setEditing(null); setAdding(null); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar item" : `Novo item — ${adding ? quadrantMeta[adding].label : ""}`}</DialogTitle>
            <DialogDescription>Descreva de forma clara e objetiva.</DialogDescription>
          </DialogHeader>
          <Textarea value={formText} onChange={(e) => setFormText(e.target.value)} className="min-h-[120px] rounded-lg text-sm" autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditing(null); setAdding(null); }}>Cancelar</Button>
            <Button onClick={salvar} className="bg-brand text-white hover:bg-brand/90">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal IA */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-brand" /> Análise cruzada por IA
            </DialogTitle>
            <DialogDescription>
              A IA Jáwda combina os quadrantes e propõe estratégias acionáveis.
            </DialogDescription>
          </DialogHeader>
          {aiLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              Cruzando quadrantes…
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecs.length === 0 && (
                <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Todas as recomendações foram aplicadas. Boa execução!
                </p>
              )}
              {aiRecs.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/70 bg-brand-soft/30 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-brand">{r.origem}</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{r.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.descricao}</p>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={() => aplicarRec(r)} className="rounded-md bg-brand text-white hover:bg-brand/90">
                      <Plus className="mr-1 h-3 w-3" /> Gerar plano de ação
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