import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, CheckCircle2, ClipboardList, Clock, Package, Plus, Search, User, CircleDot,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type StatusDemanda = "Requisitos em análise" | "Em produção" | "Em verificação" | "Entregue";
type StatusEtapa = "Concluída" | "Em andamento" | "Pendente";

interface Etapa { nome: string; responsavel: string; status: StatusEtapa }

interface Demanda {
  id: string;
  cliente: string;
  origem: string;
  requisitos: string;
  entregaPrevista: string;
  status: StatusDemanda;
  etapas: Etapa[];
  comparacao?: string;
}

const STATUS: StatusDemanda[] = ["Requisitos em análise", "Em produção", "Em verificação", "Entregue"];

const statusColor: Record<StatusDemanda, string> = {
  "Requisitos em análise": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  "Em produção": "bg-brand-soft text-brand border-brand/25",
  "Em verificação": "bg-[color:var(--severity-high)]/12 text-[color:var(--severity-high)] border-[color:var(--severity-high)]/30",
  Entregue: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
};

const etapaIcon = (s: StatusEtapa) =>
  s === "Concluída" ? <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" />
    : s === "Em andamento" ? <Clock className="h-3.5 w-3.5 text-[color:var(--warning)]" />
      : <CircleDot className="h-3.5 w-3.5 text-muted-foreground" />;

const SEED: Demanda[] = [
  {
    id: "PS-2026-031", cliente: "Cliente Alpha S/A", origem: "Pedido comercial nº 4471",
    requisitos: "120 conjuntos de suporte metálico galvanizado, com laudo dimensional e certificado de material por lote.",
    entregaPrevista: "2026-09-05", status: "Em produção",
    etapas: [
      { nome: "Análise dos requisitos do cliente", responsavel: "Beatriz Souza", status: "Concluída" },
      { nome: "Viabilidade técnica e comercial", responsavel: "Rafael Costa", status: "Concluída" },
      { nome: "Programação da produção", responsavel: "Carlos Mendes", status: "Concluída" },
      { nome: "Execução / fabricação", responsavel: "Diego Almeida", status: "Em andamento" },
      { nome: "Inspeção final", responsavel: "Fernanda Lima", status: "Pendente" },
      { nome: "Expedição e entrega", responsavel: "Marcos Vieira", status: "Pendente" },
    ],
  },
  {
    id: "PS-2026-028", cliente: "Prefeitura de Maracanaú", origem: "Contrato 018/2026",
    requisitos: "Serviço de manutenção preventiva em 8 estações de bombeamento, com relatório fotográfico por ponto.",
    entregaPrevista: "2026-08-28", status: "Em verificação",
    etapas: [
      { nome: "Análise dos requisitos do cliente", responsavel: "Beatriz Souza", status: "Concluída" },
      { nome: "Mobilização de equipe", responsavel: "Marcos Vieira", status: "Concluída" },
      { nome: "Execução do serviço", responsavel: "Diego Almeida", status: "Concluída" },
      { nome: "Verificação técnica do resultado", responsavel: "Fernanda Lima", status: "Em andamento" },
      { nome: "Aceite do cliente", responsavel: "Rafael Costa", status: "Pendente" },
    ],
  },
  {
    id: "PS-2026-024", cliente: "Indústria Beta Ltda.", origem: "Pedido comercial nº 4402",
    requisitos: "Fornecimento de 40 painéis elétricos montados conforme desenho DE-1187 rev. 03.",
    entregaPrevista: "2026-08-10", status: "Entregue",
    etapas: [
      { nome: "Análise dos requisitos do cliente", responsavel: "Beatriz Souza", status: "Concluída" },
      { nome: "Projeto e detalhamento", responsavel: "Ana Ribeiro", status: "Concluída" },
      { nome: "Montagem", responsavel: "Diego Almeida", status: "Concluída" },
      { nome: "Testes funcionais", responsavel: "Fernanda Lima", status: "Concluída" },
      { nome: "Entrega e aceite", responsavel: "Marcos Vieira", status: "Concluída" },
    ],
    comparacao: "Solicitado: 40 painéis conforme DE-1187 rev. 03 com teste dielétrico. Entregue: 40 painéis, todos com relatório de teste dielétrico aprovado. Divergência: 2 painéis entregues com 3 dias de atraso — cliente notificado e de acordo.",
  },
  {
    id: "PS-2026-035", cliente: "Cliente Gamma", origem: "Solicitação via portal do cliente",
    requisitos: "Adequação de plataforma de acesso com laudo de segurança assinado por engenheiro responsável.",
    entregaPrevista: "2026-09-22", status: "Requisitos em análise",
    etapas: [
      { nome: "Análise dos requisitos do cliente", responsavel: "Beatriz Souza", status: "Em andamento" },
      { nome: "Viabilidade técnica e comercial", responsavel: "Rafael Costa", status: "Pendente" },
      { nome: "Programação da execução", responsavel: "Carlos Mendes", status: "Pendente" },
      { nome: "Execução", responsavel: "Diego Almeida", status: "Pendente" },
      { nome: "Verificação e entrega", responsavel: "Fernanda Lima", status: "Pendente" },
    ],
  },
];

const RESPONSAVEIS = ["Beatriz Souza", "Rafael Costa", "Carlos Mendes", "Diego Almeida", "Fernanda Lima", "Marcos Vieira", "Ana Ribeiro"];

const ETAPAS_PADRAO = [
  "Análise dos requisitos do cliente",
  "Viabilidade técnica e comercial",
  "Programação da execução",
  "Execução",
  "Verificação do resultado",
  "Entrega e aceite",
];

export function ProdutoServicoPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Demanda[]>(SEED);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusDemanda | "Todas">("Todas");
  const [openNova, setOpenNova] = useState(false);
  const [nova, setNova] = useState({ cliente: "", origem: "", requisitos: "", entregaPrevista: "", responsavel: RESPONSAVEIS[0] });
  const [comparar, setComparar] = useState<{ id: string; texto: string } | null>(null);

  const contagem = useMemo(
    () => STATUS.map((s) => ({ status: s, total: items.filter((d) => d.status === s).length })),
    [items],
  );

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return items.filter((d) => {
      const okStatus = filtro === "Todas" || d.status === filtro;
      const okBusca = !q || [d.id, d.cliente, d.origem, d.requisitos].some((v) => v.toLowerCase().includes(q));
      return okStatus && okBusca;
    });
  }, [items, busca, filtro]);

  const avancarEtapa = (demandaId: string, index: number) => {
    setItems((prev) =>
      prev.map((d) => {
        if (d.id !== demandaId) return d;
        const etapas = d.etapas.map((e, i) =>
          i === index
            ? { ...e, status: (e.status === "Concluída" ? "Pendente" : e.status === "Em andamento" ? "Concluída" : "Em andamento") as StatusEtapa }
            : e,
        );
        const todas = etapas.every((e) => e.status === "Concluída");
        const alguma = etapas.some((e) => e.status !== "Pendente");
        const status: StatusDemanda = todas
          ? "Em verificação"
          : alguma
            ? etapas.filter((e) => e.status === "Concluída").length > 1 ? "Em produção" : "Requisitos em análise"
            : "Requisitos em análise";
        return { ...d, etapas, status: d.status === "Entregue" ? d.status : status };
      }),
    );
  };

  const salvarNova = () => {
    if (!nova.cliente.trim() || !nova.requisitos.trim()) return;
    const d: Demanda = {
      id: `PS-2026-${String(40 + items.length).padStart(3, "0")}`,
      cliente: nova.cliente,
      origem: nova.origem || "Registro manual",
      requisitos: nova.requisitos,
      entregaPrevista: nova.entregaPrevista || new Date(Date.now() + 20 * 864e5).toISOString().slice(0, 10),
      status: "Requisitos em análise",
      etapas: ETAPAS_PADRAO.map((nome, i) => ({
        nome,
        responsavel: i === 0 ? nova.responsavel : RESPONSAVEIS[(i + 1) % RESPONSAVEIS.length],
        status: i === 0 ? "Em andamento" : "Pendente",
      })),
    };
    setItems([d, ...items]);
    setOpenNova(false);
    setNova({ cliente: "", origem: "", requisitos: "", entregaPrevista: "", responsavel: RESPONSAVEIS[0] });
    toast.success(`Demanda ${d.id} adicionada`, { description: "Acompanhe as etapas no card." });
  };

  const registrarNC = (d: Demanda) => {
    toast.info(`Abrindo Nova NC vinculada a ${d.id}`, { description: `Origem "Produto ou Serviço" · ${d.cliente}` });
    setTimeout(() => navigate({ to: "/nao-conformidades/nova" }), 400);
  };

  const salvarComparacao = () => {
    if (!comparar) return;
    setItems((prev) => prev.map((d) => (d.id === comparar.id ? { ...d, comparacao: comparar.texto, status: "Entregue" } : d)));
    toast.success("Comparação registrada", { description: "Demanda marcada como entregue." });
    setComparar(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Produto ou Serviço</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada demanda acompanhada do requisito do cliente até a entrega, com responsável por etapa.
            </p>
          </div>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setOpenNova(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Adicionar Demanda
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, código ou requisito…"
              className="h-9 rounded-lg pl-8 text-xs"
            />
          </div>
          <Select value={filtro} onValueChange={(v) => setFiltro(v as StatusDemanda | "Todas")}>
            <SelectTrigger className="h-9 w-[210px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todos os status</SelectItem>
              {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Barra de status clicável */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <button
            onClick={() => setFiltro("Todas")}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              filtro === "Todas" ? "border-brand/40 bg-brand-soft/50" : "border-border/70 bg-card hover:border-brand/25",
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Todas as demandas</div>
            <div className="mt-0.5 text-xl font-semibold text-foreground">{items.length}</div>
          </button>
          {contagem.map((c) => (
            <button
              key={c.status}
              onClick={() => setFiltro(filtro === c.status ? "Todas" : c.status)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                filtro === c.status ? "border-brand/40 bg-brand-soft/50" : "border-border/70 bg-card hover:border-brand/25",
              )}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{c.status}</div>
              <div className="mt-0.5 text-xl font-semibold text-foreground">{c.total}</div>
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {lista.map((d) => {
            const concluidas = d.etapas.filter((e) => e.status === "Concluída").length;
            const pct = Math.round((concluidas / d.etapas.length) * 100);
            const todasConcluidas = concluidas === d.etapas.length;
            return (
              <Card key={d.id} className="rounded-2xl border-border/80 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] font-semibold text-brand">{d.id}</div>
                        <div className="text-sm font-semibold text-foreground">{d.cliente}</div>
                        <div className="text-[11px] text-muted-foreground">{d.origem}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[d.status])}>{d.status}</Badge>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <ClipboardList className="h-3 w-3" /> Requisitos do pedido
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">{d.requisitos}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Entrega prevista: <span className="font-medium text-foreground">{new Date(d.entregaPrevista).toLocaleDateString("pt-BR")}</span>
                    </span>
                    <span className="font-semibold text-brand">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />

                  <div>
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Etapas do processo</div>
                    <div className="space-y-1">
                      {d.etapas.map((e, i) => (
                        <button
                          key={e.nome}
                          onClick={() => avancarEtapa(d.id, i)}
                          className="flex w-full items-center gap-2 rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-left text-[11px] transition-colors hover:border-brand/30 hover:bg-brand-soft/30"
                        >
                          {etapaIcon(e.status)}
                          <span className="flex-1 truncate font-medium text-foreground">{e.nome}</span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" /> {e.responsavel.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {d.comparacao ? (
                    <div className="rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-2.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--success)]">
                        Pedido × Entregue
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">{d.comparacao}</p>
                    </div>
                  ) : todasConcluidas ? (
                    <Button
                      size="sm" variant="outline"
                      className="w-full rounded-lg border-brand/40 text-xs text-brand hover:bg-brand-soft/50"
                      onClick={() => setComparar({ id: d.id, texto: `Solicitado: ${d.requisitos}\nEntregue: ` })}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Concluir e comparar pedido × entrega
                    </Button>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">
                      A comparação entre o que foi pedido e o que foi entregue é liberada quando todas as etapas estiverem concluídas.
                    </p>
                  )}

                  <Button
                    variant="outline" size="sm"
                    className="w-full rounded-lg border-[color:var(--severity-critical)]/40 text-xs text-[color:var(--severity-critical)] hover:bg-[color:var(--severity-critical)]/10"
                    onClick={() => registrarNC(d)}
                  >
                    <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Registrar Não Conformidade
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {lista.length === 0 && (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma demanda encontrada para esse filtro.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Nova demanda */}
      <Dialog open={openNova} onOpenChange={setOpenNova}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Demanda</DialogTitle>
            <DialogDescription>As etapas padrão do processo são criadas automaticamente e podem ser acompanhadas no card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Cliente</label>
              <Input value={nova.cliente} onChange={(e) => setNova({ ...nova, cliente: e.target.value })} className="h-9 rounded-lg text-xs" placeholder="Ex.: Cliente Alpha S/A" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Origem da demanda</label>
              <Input value={nova.origem} onChange={(e) => setNova({ ...nova, origem: e.target.value })} className="h-9 rounded-lg text-xs" placeholder="Ex.: Pedido comercial nº 4471" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">Requisitos do pedido</label>
              <Textarea value={nova.requisitos} onChange={(e) => setNova({ ...nova, requisitos: e.target.value })} rows={3} className="rounded-lg text-xs" placeholder="O que o cliente solicitou, com critérios de aceitação…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Data prevista de entrega</label>
                <Input type="date" value={nova.entregaPrevista} onChange={(e) => setNova({ ...nova, entregaPrevista: e.target.value })} className="h-9 rounded-lg text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Responsável pela 1ª etapa</label>
                <Select value={nova.responsavel} onValueChange={(v) => setNova({ ...nova, responsavel: v })}>
                  <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESPONSAVEIS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setOpenNova(false)}>Cancelar</Button>
            <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" disabled={!nova.cliente.trim() || !nova.requisitos.trim()} onClick={salvarNova}>
              Adicionar demanda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comparação pedido x entrega */}
      <Dialog open={!!comparar} onOpenChange={(v) => !v && setComparar(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Comparação entre pedido e entrega</DialogTitle>
            <DialogDescription>Registre o que foi solicitado, o que foi efetivamente entregue e eventuais divergências.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={comparar?.texto ?? ""}
            onChange={(e) => setComparar((p) => (p ? { ...p, texto: e.target.value } : p))}
            rows={7}
            className="rounded-lg text-xs"
          />
          <DialogFooter>
            <Button variant="outline" className="rounded-lg" onClick={() => setComparar(null)}>Cancelar</Button>
            <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvarComparacao}>Concluir demanda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
