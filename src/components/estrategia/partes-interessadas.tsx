import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Sparkles, Check, Wand2, Target } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, type ParteInteressada } from "@/lib/jawda-store";

const CATEGORIAS = [
  "Cliente",
  "Fornecedor",
  "Colaborador",
  "Órgão regulador",
  "Comunidade",
  "Acionista",
  "Sindicato",
  "Outro",
];

const NIVEIS_INFLUENCIA = [
  { label: "Baixa", valor: 1 },
  { label: "Média", valor: 3 },
  { label: "Alta", valor: 5 },
];
const NIVEIS_INTERESSE = [
  { label: "Baixo", valor: 1 },
  { label: "Médio", valor: 3 },
  { label: "Alto", valor: 5 },
];

function nivelLabel(v: number, tipo: "influencia" | "interesse") {
  const lista = tipo === "influencia" ? NIVEIS_INFLUENCIA : NIVEIS_INTERESSE;
  if (v <= 2) return lista[0]!.label;
  if (v <= 4) return lista[1]!.label;
  return lista[2]!.label;
}

function nivelValor(v: number) {
  return v <= 2 ? 1 : v <= 4 ? 3 : 5;
}

function prioridade(inf: number, inter: number): "Prioritária" | "Relevante" | "Monitorar" {
  if (inf >= 5 && inter >= 5) return "Prioritária";
  if (inf >= 3 && inter >= 3) return "Relevante";
  return "Monitorar";
}

function fmtData(d?: string) {
  if (!d) return "—";
  const dt = new Date(`${d}T00:00:00`);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("pt-BR");
}

const hoje = () => new Date().toISOString().slice(0, 10);

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

const SUGESTOES_POR_SEGMENTO: Record<string, Omit<Sugestao, "id" | "selecionada">[]> = {
  "Construção civil": [
    { nome: "Órgão ambiental estadual", categoria: "Órgão regulador", necessidades: "Controle de resíduos de obra e supressão vegetal", requisitos: "Licença ambiental vigente + PGRCC", influencia: 5, interesse: 3, motivo: "Obras exigem licenciamento e monitoramento ambiental contínuo." },
    { nome: "Comunidade do entorno da obra", categoria: "Comunidade", necessidades: "Controle de ruído, poeira e tráfego de caminhões", requisitos: "Canal de ouvidoria + restrição de horários", influencia: 3, interesse: 5, motivo: "Impacto direto na vizinhança durante a execução." },
    { nome: "Sindicato da construção civil", categoria: "Sindicato", necessidades: "Acordo coletivo cumprido e segurança em altura", requisitos: "CCT vigente + NR-18 e NR-35", influencia: 3, interesse: 5, motivo: "Setor com alta atuação sindical e risco ocupacional." },
    { nome: "Prefeitura — alvará de obras", categoria: "Órgão regulador", necessidades: "Conformidade urbanística do empreendimento", requisitos: "Alvará de construção e habite-se", influencia: 5, interesse: 1, motivo: "Condição legal para operar o canteiro." },
  ],
  "Indústria de alimentos": [
    { nome: "Vigilância sanitária", categoria: "Órgão regulador", necessidades: "Segurança de alimentos e boas práticas de fabricação", requisitos: "Alvará sanitário + APPCC", influencia: 5, interesse: 3, motivo: "Fiscalização direta sobre a produção." },
    { nome: "Grandes redes varejistas", categoria: "Cliente", necessidades: "Auditoria de fornecedor aprovada e prazo estável", requisitos: "Auditoria de segunda parte anual", influencia: 5, interesse: 5, motivo: "Concentram a maior parte do faturamento." },
    { nome: "Transportadoras de cadeia fria", categoria: "Fornecedor", necessidades: "Previsibilidade de coleta e temperatura controlada", requisitos: "Registro de temperatura por rota", influencia: 3, interesse: 3, motivo: "Elo crítico para conservação do produto." },
    { nome: "Comunidade do entorno da planta", categoria: "Comunidade", necessidades: "Controle de odores e efluentes", requisitos: "Monitoramento periódico de efluentes", influencia: 1, interesse: 3, motivo: "Reclamações recorrentes em plantas de processamento." },
  ],
  "Serviços / Tecnologia": [
    { nome: "Clientes contratantes (B2B)", categoria: "Cliente", necessidades: "Disponibilidade do serviço e proteção de dados", requisitos: "SLA contratual + LGPD", influencia: 5, interesse: 5, motivo: "Continuidade do contrato depende do nível de serviço." },
    { nome: "Autoridade de proteção de dados", categoria: "Órgão regulador", necessidades: "Tratamento lícito de dados pessoais", requisitos: "Registro de operações + encarregado nomeado", influencia: 5, interesse: 1, motivo: "Exposição regulatória por tratamento de dados." },
    { nome: "Colaboradores em regime remoto", categoria: "Colaborador", necessidades: "Clareza de metas e ergonomia no trabalho remoto", requisitos: "Política de trabalho remoto", influencia: 3, interesse: 5, motivo: "Retenção de talentos é risco operacional central." },
    { nome: "Provedores de nuvem", categoria: "Fornecedor", necessidades: "Capacidade contratada e suporte responsivo", requisitos: "Contrato com SLA e plano de continuidade", influencia: 5, interesse: 1, motivo: "Dependência crítica de terceiro." },
  ],
};

export function PartesInteressadasPage() {
  const { partesInteressadas, addParte, updateParte, removeParte } = useJawda();
  const [busca, setBusca] = useState("");
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState<Omit<ParteInteressada, "id">>({
    nome: "", categoria: "Cliente", influencia: 3, interesse: 3,
    necessidades: "", requisitos: "", ultimaRevisao: hoje(),
  });
  const [iaOpen, setIaOpen] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [segmento, setSegmento] = useState<string>("Construção civil");

  const rows = useMemo(
    () =>
      partesInteressadas.filter((p) =>
        (p.nome + p.categoria + p.necessidades + p.requisitos).toLowerCase().includes(busca.toLowerCase()),
      ),
    [partesInteressadas, busca],
  );

  const patch = (id: string, campo: keyof ParteInteressada, valor: string | number) =>
    updateParte(id, { [campo]: valor, ultimaRevisao: hoje() } as Partial<ParteInteressada>);

  const salvarNova = () => {
    if (!nova.nome.trim()) { toast.error("Informe o nome ou grupo"); return; }
    addParte({ ...nova, ultimaRevisao: hoje() });
    toast.success("Parte interessada adicionada");
    setNova({ nome: "", categoria: "Cliente", influencia: 3, interesse: 3, necessidades: "", requisitos: "", ultimaRevisao: hoje() });
    setNovaOpen(false);
  };

  const rodarIA = (seg = segmento) => {
    setSegmento(seg);
    setIaLoading(true);
    setIaOpen(true);
    setSugestoes([]);
    setTimeout(() => {
      const base = SUGESTOES_POR_SEGMENTO[seg] ?? SUGESTOES_POR_SEGMENTO["Construção civil"]!;
      setSugestoes(
        base
          .filter((s) => !partesInteressadas.some((p) => p.nome.toLowerCase() === s.nome.toLowerCase()))
          .map((s, i) => ({ ...s, id: `sug-${i}`, selecionada: i < 3 })),
      );
      setIaLoading(false);
    }, 800);
  };

  const aplicarSelecionadas = () => {
    const escolhidas = sugestoes.filter((s) => s.selecionada);
    escolhidas.forEach((s) =>
      addParte({
        nome: s.nome, categoria: s.categoria, necessidades: s.necessidades,
        requisitos: s.requisitos, influencia: s.influencia, interesse: s.interesse,
        ultimaRevisao: hoje(),
      }),
    );
    toast.success(`${escolhidas.length} parte(s) adicionada(s) ao cadastro`);
    setIaOpen(false);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Partes Interessadas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Requisito 4.2 da ISO 9001 — edite qualquer célula direto na tabela; a data de revisão é atualizada automaticamente.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => rodarIA()} className="rounded-lg">
              <Sparkles className="mr-1.5 h-4 w-4" /> Mapear com IA
            </Button>
            <Button size="sm" onClick={() => setNovaOpen(true)} className="rounded-lg bg-brand text-white hover:bg-brand/90">
              <Plus className="mr-1.5 h-4 w-4" /> Nova Parte Interessada
            </Button>
          </div>
        </header>

        {/* Tabela principal */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Cadastro de partes interessadas</h2>
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome, categoria, necessidade…"
                className="h-8 max-w-xs rounded-lg text-xs"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-[210px]">Nome / Grupo</TableHead>
                    <TableHead className="w-[150px]">Categoria</TableHead>
                    <TableHead className="min-w-[220px]">Necessidade / Expectativa</TableHead>
                    <TableHead className="min-w-[200px]">Requisito relevante</TableHead>
                    <TableHead className="w-[120px]">Influência</TableHead>
                    <TableHead className="w-[120px]">Interesse</TableHead>
                    <TableHead className="w-[130px]">Última revisão</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p, idx) => {
                    const prio = prioridade(nivelValor(p.influencia), nivelValor(p.interesse));
                    return (
                      <TableRow key={p.id} className="align-top text-xs">
                        <TableCell className="pt-4 font-mono text-[10px] text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={p.nome}
                            onChange={(e) => patch(p.id, "nome", e.target.value)}
                            className="h-8 rounded-md border-transparent bg-transparent px-2 text-xs font-medium hover:border-border focus-visible:border-brand"
                          />
                          {prio === "Prioritária" && (
                            <Badge className="ml-2 rounded-md bg-brand-soft text-[9px] text-brand">Atenção prioritária</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            value={CATEGORIAS.includes(p.categoria) ? p.categoria : "Outro"}
                            onChange={(e) => patch(p.id, "categoria", e.target.value)}
                            className="h-8 w-full rounded-md border border-transparent bg-transparent px-1 text-xs hover:border-border focus:border-brand focus:outline-none"
                          >
                            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={p.necessidades}
                            onChange={(e) => patch(p.id, "necessidades", e.target.value)}
                            className="min-h-[52px] rounded-md border-transparent bg-transparent px-2 py-1 text-xs hover:border-border focus-visible:border-brand"
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={p.requisitos}
                            onChange={(e) => patch(p.id, "requisitos", e.target.value)}
                            className="min-h-[52px] rounded-md border-transparent bg-transparent px-2 py-1 text-xs hover:border-border focus-visible:border-brand"
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={nivelValor(p.influencia)}
                            onChange={(e) => patch(p.id, "influencia", Number(e.target.value))}
                            className="h-8 w-full rounded-md border border-transparent bg-transparent px-1 text-xs hover:border-border focus:border-brand focus:outline-none"
                          >
                            {NIVEIS_INFLUENCIA.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            value={nivelValor(p.interesse)}
                            onChange={(e) => patch(p.id, "interesse", Number(e.target.value))}
                            className="h-8 w-full rounded-md border border-transparent bg-transparent px-1 text-xs hover:border-border focus:border-brand focus:outline-none"
                          >
                            {NIVEIS_INTERESSE.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
                          </select>
                        </TableCell>
                        <TableCell className="pt-4 text-[11px] text-muted-foreground">{fmtData(p.ultimaRevisao)}</TableCell>
                        <TableCell className="pt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { removeParte(p.id); toast.success("Parte interessada removida"); }}
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
            </div>
          </CardContent>
        </Card>

        {/* Mapa de bolhas */}
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">Mapa de bolhas — Interesse × Influência</h2>
                <p className="text-[11px] text-muted-foreground">
                  Canto superior direito = alta influência e alto interesse: exige atenção prioritária.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex w-6 shrink-0 items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                  Influência
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative h-[420px] rounded-xl border border-border/70 bg-gradient-to-tr from-background via-background to-brand-soft/50">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
                    <div className="absolute left-0 top-1/2 h-px w-full bg-border/60" />
                  </div>
                  <span className="absolute left-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Manter informado</span>
                  <span className="absolute right-3 top-2 text-[10px] font-semibold uppercase tracking-wide text-brand">Gerenciar de perto</span>
                  <span className="absolute bottom-2 left-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Esforço mínimo</span>
                  <span className="absolute bottom-2 right-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Manter satisfeito</span>

                  {partesInteressadas.map((p) => {
                    const inf = nivelValor(p.influencia);
                    const inter = nivelValor(p.interesse);
                    const prio = prioridade(inf, inter);
                    const size = prio === "Prioritária" ? 26 : prio === "Relevante" ? 22 : 18;
                    const color =
                      prio === "Prioritária"
                        ? "bg-[color:var(--severity-critical)]"
                        : prio === "Relevante"
                          ? "bg-[color:var(--warning)]"
                          : "bg-[color:var(--success)]";
                    const xPct = ((inter - 1) / 4) * 74 + 13;
                    const yPct = ((inf - 1) / 4) * 76 + 12;
                    return (
                      <div
                        key={p.id}
                        className="absolute flex items-center gap-1.5"
                        style={{ left: `${xPct}%`, bottom: `${yPct}%`, transform: "translate(-50%, 50%)" }}
                      >
                        <span
                          className={cn("shrink-0 rounded-full shadow-md ring-2 ring-card", color)}
                          style={{ width: size, height: size }}
                        />
                        <span className="max-w-[150px] truncate rounded-md bg-card/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
                          {p.nome}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Interesse baixo</span>
                  <span>Interesse</span>
                  <span>Interesse alto</span>
                </div>
              </div>
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
            <div>
              <label className="text-xs font-medium">Nome / Grupo</label>
              <Input value={nova.nome} onChange={(e) => setNova({ ...nova, nome: e.target.value })} className="mt-1 rounded-md" />
            </div>
            <div>
              <label className="text-xs font-medium">Categoria</label>
              <select
                value={nova.categoria}
                onChange={(e) => setNova({ ...nova, categoria: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Necessidade / Expectativa</label>
              <Textarea value={nova.necessidades} onChange={(e) => setNova({ ...nova, necessidades: e.target.value })} className="mt-1 rounded-md" />
            </div>
            <div>
              <label className="text-xs font-medium">Requisito relevante</label>
              <Textarea value={nova.requisitos} onChange={(e) => setNova({ ...nova, requisitos: e.target.value })} className="mt-1 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Influência</label>
                <select
                  value={nivelValor(nova.influencia)}
                  onChange={(e) => setNova({ ...nova, influencia: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  {NIVEIS_INFLUENCIA.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Interesse</label>
                <select
                  value={nivelValor(nova.interesse)}
                  onChange={(e) => setNova({ ...nova, interesse: Number(e.target.value) })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  {NIVEIS_INTERESSE.map((n) => <option key={n.valor} value={n.valor}>{n.label}</option>)}
                </select>
              </div>
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
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-brand" /> Mapear com IA</DialogTitle>
            <DialogDescription>
              Partes interessadas comuns ao segmento, com necessidade e requisito pré-preenchidos. Sugestão simulada de IA — revise antes de adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SUGESTOES_POR_SEGMENTO).map((s) => (
              <button
                key={s}
                onClick={() => rodarIA(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                  segmento === s ? "border-brand bg-brand-soft text-brand" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {iaLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Analisando o segmento…
            </div>
          ) : sugestoes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Todas as sugestões deste segmento já estão cadastradas.</p>
          ) : (
            <div className="max-h-[340px] space-y-2 overflow-y-auto">
              {sugestoes.map((s) => (
                <div key={s.id} className={cn("flex gap-3 rounded-xl border p-3 transition", s.selecionada ? "border-brand/40 bg-brand-soft/40" : "border-border/70 bg-card")}>
                  <button
                    onClick={() => setSugestoes((prev) => prev.map((x) => (x.id === s.id ? { ...x, selecionada: !x.selecionada } : x)))}
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
                    <div className="mt-1 grid gap-2 text-[11px] md:grid-cols-2">
                      <div><span className="font-medium text-foreground">Necessidade:</span> {s.necessidades}</div>
                      <div><span className="font-medium text-foreground">Requisito:</span> {s.requisitos}</div>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Influência {nivelLabel(s.influencia, "influencia")} · Interesse {nivelLabel(s.interesse, "interesse")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIaOpen(false)}>Fechar</Button>
            <Button
              onClick={aplicarSelecionadas}
              disabled={sugestoes.every((s) => !s.selecionada)}
              className="bg-brand text-white hover:bg-brand/90"
            >
              <Plus className="mr-1 h-3 w-3" /> Adicionar selecionadas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}