import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Sparkles, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, type ParteInteressada } from "@/lib/jawda-store";

interface Sugestao {
  id: string;
  nome: string;
  categoria: string;
  necessidades: string;
  requisitos: string;
  influencia: number;
  interesse: number;
  motivo: string;
  selecionada: boolean;
}

const CATEGORIAS = ["Cliente", "Colaborador", "Fornecedor", "Órgão regulador", "Comunidade", "Acionista", "Sindicato"];

function critFromInfluencia(inf: number, interesse: number): "Alta" | "Média" | "Baixa" {
  const media = (inf + interesse) / 2;
  if (media >= 4) return "Alta";
  if (media >= 2.5) return "Média";
  return "Baixa";
}

export function PartesInteressadasPage() {
  const { partesInteressadas, addParte, updateParte, removeParte } = useJawda();
  const [busca, setBusca] = useState("");
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState<Omit<ParteInteressada, "id">>({
    nome: "", categoria: "Cliente", influencia: 3, interesse: 3, necessidades: "", requisitos: "",
  });
  const [iaOpen, setIaOpen] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [ramo, setRamo] = useState("Indústria farmacêutica e alimentícia");

  const rows = useMemo(
    () =>
      partesInteressadas.filter((p) =>
        (p.nome + p.categoria + p.necessidades).toLowerCase().includes(busca.toLowerCase()),
      ),
    [partesInteressadas, busca],
  );

  const salvarNova = () => {
    if (!nova.nome.trim()) { toast.error("Informe o nome"); return; }
    addParte(nova);
    toast.success("Parte interessada adicionada");
    setNova({ nome: "", categoria: "Cliente", influencia: 3, interesse: 3, necessidades: "", requisitos: "" });
    setNovaOpen(false);
  };

  const rodarIA = () => {
    setIaLoading(true);
    setIaOpen(true);
    setSugestoes([]);
    setTimeout(() => {
      setSugestoes([
        { id: "s1", nome: "IBAMA / Órgão ambiental estadual", categoria: "Órgão regulador", influencia: 5, interesse: 3, necessidades: "Cumprimento de licenciamento e destinação de resíduos", requisitos: "Licença de Operação vigente + PGRS", motivo: "Ramo industrial exige monitoramento ambiental contínuo.", selecionada: true },
        { id: "s2", nome: "Comunidade do entorno da planta", categoria: "Comunidade", influencia: 3, interesse: 4, necessidades: "Redução de ruído, odores e tráfego de caminhões", requisitos: "Canal de ouvidoria + audiências", motivo: "Pressão social e reputacional relevante para o ramo.", selecionada: true },
        { id: "s3", nome: "Sindicato dos trabalhadores da categoria", categoria: "Sindicato", influencia: 4, interesse: 5, necessidades: "Diálogo formal, acordo coletivo, saúde ocupacional", requisitos: "CCT vigente + NR-05/NR-35", motivo: "Alto grau de sindicalização no setor.", selecionada: false },
        { id: "s4", nome: "Corpo de Bombeiros / Defesa Civil", categoria: "Órgão regulador", influencia: 4, interesse: 2, necessidades: "Prevenção e resposta a emergências", requisitos: "AVCB + brigada de emergência", motivo: "Instalações industriais exigem plano de emergência.", selecionada: false },
      ]);
      setIaLoading(false);
    }, 900);
  };

  const aplicarSelecionadas = () => {
    const escolhidas = sugestoes.filter((s) => s.selecionada);
    escolhidas.forEach((s) => {
      addParte({
        nome: s.nome, categoria: s.categoria, necessidades: s.necessidades,
        requisitos: s.requisitos, influencia: s.influencia, interesse: s.interesse,
      });
    });
    toast.success(`${escolhidas.length} partes adicionadas`);
    setIaOpen(false);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Partes Interessadas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Requisito 4.2 da ISO 9001 — arraste os sliders de cada linha para reposicionar as bolhas na matriz.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={rodarIA} className="rounded-lg">
              <Sparkles className="mr-1.5 h-4 w-4" /> Mapear com IA
            </Button>
            <Button size="sm" onClick={() => setNovaOpen(true)} className="rounded-lg bg-brand text-white hover:bg-brand/90">
              <Plus className="mr-1.5 h-4 w-4" /> Nova parte
            </Button>
          </div>
        </header>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Mapa de Influência × Interesse</h2>
                <p className="text-[11px] text-muted-foreground">O tamanho da bolha reflete a criticidade calculada.</p>
              </div>
            </div>
            <div className="relative h-[360px] rounded-xl border border-border/70 bg-gradient-to-br from-brand-soft/40 via-background to-background">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
                <div className="absolute top-1/2 left-0 h-px w-full bg-border/60" />
              </div>
              <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Monitorar</span>
              <span className="absolute right-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-brand">Gerenciar de perto</span>
              <span className="absolute left-3 bottom-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Esforço mínimo</span>
              <span className="absolute right-3 bottom-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Manter satisfeito</span>

              {partesInteressadas.map((p, idx) => {
                const crit = critFromInfluencia(p.influencia, p.interesse);
                const size = crit === "Alta" ? 54 : crit === "Média" ? 42 : 32;
                const color = crit === "Alta" ? "bg-[color:var(--severity-critical)]/80" : crit === "Média" ? "bg-[color:var(--warning)]/80" : "bg-[color:var(--success)]/80";
                const xPct = ((p.interesse - 1) / 4) * 90 + 5;
                const yPct = ((p.influencia - 1) / 4) * 90 + 5;
                return (
                  <div
                    key={p.id}
                    title={p.nome}
                    className={cn("group absolute flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ring-2 ring-white transition-all duration-500 hover:scale-110", color)}
                    style={{
                      width: size, height: size,
                      left: `calc(${xPct}% - ${size / 2}px)`,
                      bottom: `calc(${yPct}% - ${size / 2}px)`,
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

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Cadastro completo — edição inline</h2>
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar…" className="h-8 max-w-xs rounded-lg text-xs" />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-[220px]">Nome</TableHead>
                    <TableHead className="w-[140px]">Categoria</TableHead>
                    <TableHead>Necessidades</TableHead>
                    <TableHead>Requisitos</TableHead>
                    <TableHead className="w-[160px]">Influência</TableHead>
                    <TableHead className="w-[160px]">Interesse</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p, idx) => (
                    <TableRow key={p.id} className="align-top text-xs">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <Input value={p.nome} onChange={(e) => updateParte(p.id, { nome: e.target.value })} className="h-8 rounded-md text-xs" />
                      </TableCell>
                      <TableCell>
                        <select
                          value={p.categoria}
                          onChange={(e) => updateParte(p.id, { categoria: e.target.value })}
                          className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                        >
                          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Textarea value={p.necessidades} onChange={(e) => updateParte(p.id, { necessidades: e.target.value })} className="min-h-[52px] rounded-md text-xs" />
                      </TableCell>
                      <TableCell>
                        <Textarea value={p.requisitos} onChange={(e) => updateParte(p.id, { requisitos: e.target.value })} className="min-h-[52px] rounded-md text-xs" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Slider value={[p.influencia]} min={1} max={5} step={1} onValueChange={([v]) => updateParte(p.id, { influencia: v })} className="flex-1" />
                          <span className="w-4 text-center font-mono text-[11px] text-brand">{p.influencia}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Slider value={[p.interesse]} min={1} max={5} step={1} onValueChange={([v]) => updateParte(p.id, { interesse: v })} className="flex-1" />
                          <span className="w-4 text-center font-mono text-[11px] text-brand">{p.interesse}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { removeParte(p.id); toast.success("Removido"); }} className="h-7 w-7 p-0 text-[color:var(--severity-critical)]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Nova */}
      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nova parte interessada</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div><label className="text-xs font-medium">Nome</label><Input value={nova.nome} onChange={(e) => setNova({ ...nova, nome: e.target.value })} className="mt-1 rounded-md" /></div>
            <div><label className="text-xs font-medium">Categoria</label>
              <select value={nova.categoria} onChange={(e) => setNova({ ...nova, categoria: e.target.value })} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium">Necessidades</label><Textarea value={nova.necessidades} onChange={(e) => setNova({ ...nova, necessidades: e.target.value })} className="mt-1 rounded-md" /></div>
            <div><label className="text-xs font-medium">Requisitos</label><Textarea value={nova.requisitos} onChange={(e) => setNova({ ...nova, requisitos: e.target.value })} className="mt-1 rounded-md" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Influência ({nova.influencia})</label><Slider value={[nova.influencia]} min={1} max={5} step={1} onValueChange={([v]) => setNova({ ...nova, influencia: v })} className="mt-2" /></div>
              <div><label className="text-xs font-medium">Interesse ({nova.interesse})</label><Slider value={[nova.interesse]} min={1} max={5} step={1} onValueChange={([v]) => setNova({ ...nova, interesse: v })} className="mt-2" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button onClick={salvarNova} className="bg-brand text-white hover:bg-brand/90">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal IA */}
      <Dialog open={iaOpen} onOpenChange={setIaOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-brand" /> Sugestões da IA Jáwda</DialogTitle>
            <DialogDescription>Partes que costumam faltar em empresas do seu ramo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Ramo de atividade</label>
            <Input value={ramo} onChange={(e) => setRamo(e.target.value)} className="rounded-md text-sm" />
          </div>
          {iaLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Analisando ramo…
            </div>
          ) : (
            <div className="max-h-[340px] space-y-2 overflow-y-auto">
              {sugestoes.map((s) => (
                <div key={s.id} className={cn("flex gap-3 rounded-xl border p-3 transition", s.selecionada ? "border-brand/40 bg-brand-soft/40" : "border-border/70 bg-card")}>
                  <button
                    onClick={() => setSugestoes((prev) => prev.map((x) => x.id === s.id ? { ...x, selecionada: !x.selecionada } : x))}
                    className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2", s.selecionada ? "border-brand bg-brand text-white" : "border-border")}
                  >
                    {s.selecionada && <Check className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-foreground">{s.nome}</div>
                      <Badge variant="outline" className="rounded-md text-[10px]">{s.categoria}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{s.motivo}</p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="font-medium text-foreground">Necessidades:</span> {s.necessidades}</div>
                      <div><span className="font-medium text-foreground">Requisitos:</span> {s.requisitos}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIaOpen(false)}>Fechar</Button>
            <Button onClick={aplicarSelecionadas} disabled={sugestoes.every((s) => !s.selecionada)} className="bg-brand text-white hover:bg-brand/90">
              <Plus className="mr-1 h-3 w-3" /> Adicionar selecionadas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}