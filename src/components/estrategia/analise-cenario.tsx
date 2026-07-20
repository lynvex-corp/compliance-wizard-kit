import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Plus, Link2, GripVertical, CalendarCheck2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Quadrant = "S" | "W" | "O" | "T";
interface SwotItem {
  id: string;
  q: Quadrant;
  titulo: string;
  descricao: string;
  planoVinculado?: string;
}

const initial: SwotItem[] = [
  { id: "s1", q: "S", titulo: "Equipe técnica certificada", descricao: "Corpo técnico com 12 engenheiros certificados PMP e Lean." },
  { id: "s2", q: "S", titulo: "Marca reconhecida no setor", descricao: "22 anos de mercado com carteira de clientes recorrentes." },
  { id: "s3", q: "S", titulo: "Certificação ISO 9001 ativa", descricao: "Sistema de gestão maduro, auditado anualmente." },
  { id: "w1", q: "W", titulo: "Alta rotatividade em operação", descricao: "Turnover de 28% no último semestre no chão de fábrica." },
  { id: "w2", q: "W", titulo: "Sistemas legados desconectados", descricao: "ERP e MES sem integração — dupla digitação em produção." },
  { id: "w3", q: "W", titulo: "Baixa maturidade digital", descricao: "Processos ainda dependem de planilhas e formulários em papel." },
  { id: "o1", q: "O", titulo: "Expansão para mercado sul", descricao: "Demanda crescente em SC e RS mapeada por inteligência de mercado." },
  { id: "o2", q: "O", titulo: "Linha de crédito verde BNDES", descricao: "Financiamento com juros reduzidos para modernização sustentável." },
  { id: "o3", q: "O", titulo: "Parceria com universidades", descricao: "Convênio de P&D com UFMG para inovação em processos." },
  { id: "t1", q: "T", titulo: "Nova regulamentação ANVISA", descricao: "RDC 658/2022 amplia exigências de rastreabilidade até 2027." },
  { id: "t2", q: "T", titulo: "Concorrente asiático agressivo", descricao: "Entrada de importados com preço 18% abaixo do praticado." },
  { id: "t3", q: "T", titulo: "Escassez de mão de obra técnica", descricao: "Déficit regional de soldadores e operadores especializados." },
];

const quadrantMeta: Record<Quadrant, { label: string; sub: string; ring: string; head: string; chip: string }> = {
  S: { label: "Forças", sub: "Internas · Positivas", ring: "border-[color:var(--success)]/40", head: "bg-[color:var(--success)]/10 text-[color:var(--success)]", chip: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30" },
  W: { label: "Fraquezas", sub: "Internas · Negativas", ring: "border-[color:var(--warning)]/50", head: "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]", chip: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40" },
  O: { label: "Oportunidades", sub: "Externas · Positivas", ring: "border-brand/30", head: "bg-brand-soft text-brand", chip: "bg-brand-soft text-brand border-brand/20" },
  T: { label: "Ameaças", sub: "Externas · Negativas", ring: "border-[color:var(--severity-critical)]/40", head: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]", chip: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30" },
};

export function AnaliseCenarioPage() {
  const [items, setItems] = useState<SwotItem[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);

  const onDrop = (q: Quadrant) => {
    if (!dragId) return;
    setItems((prev) => prev.map((it) => (it.id === dragId ? { ...it, q } : it)));
    setDragId(null);
  };

  const gerarPlano = (id: string) => {
    const code = `PA-2026-${String(200 + parseInt(id.replace(/\D/g, ""), 10)).padStart(4, "0")}`;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, planoVinculado: code } : it)));
    toast.success("Plano de Ação gerado", { description: `Vínculo criado: ${code}` });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Cenário</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Matriz SWOT do sistema de gestão — arraste os cards entre quadrantes e gere planos de ação a partir de fraquezas e ameaças.
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-lg">
            <Sparkles className="mr-1.5 h-4 w-4" /> Sugerir SWOT com IA
          </Button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(Object.keys(quadrantMeta) as Quadrant[]).map((q) => {
              const meta = quadrantMeta[q];
              const list = items.filter((i) => i.q === q);
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
                            <div className="text-sm font-medium text-foreground">{it.titulo}</div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{it.descricao}</p>
                            {(showAction || it.planoVinculado) && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {it.planoVinculado ? (
                                  <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                                    <Link2 className="mr-1 h-3 w-3" /> {it.planoVinculado}
                                  </Badge>
                                ) : (
                                  <Button size="sm" variant="ghost" onClick={() => gerarPlano(it.id)} className="h-7 rounded-md px-2 text-[11px] text-brand hover:bg-brand-soft">
                                    <Plus className="mr-1 h-3 w-3" /> Gerar Plano de Ação
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 py-2 text-[11px] text-muted-foreground hover:border-brand/40 hover:text-brand">
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
                    defaultValue="Estrutura organizacional matricial com 340 colaboradores, cultura orientada à segurança e forte governança fiscal. Sistema de gestão certificado ISO 9001 desde 2011."
                    className="min-h-[110px] rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Contexto externo</label>
                  <Textarea
                    defaultValue="Mercado em consolidação com pressão regulatória crescente (ANVISA/MAPA), instabilidade cambial impactando insumos e aceleração de exigências ESG por clientes-chave."
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
                Cards em <strong>Fraquezas</strong> e <strong>Ameaças</strong> devem ser tratados via plano de ação. Arraste um card entre quadrantes para reclassificar rapidamente.
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}