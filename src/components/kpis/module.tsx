import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Plus, Upload, FileSpreadsheet, Eye, Sparkles, FileDown, Target, Gauge,
  CheckCircle2, AlertTriangle, XCircle, ListFilter,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useKpis } from "@/lib/kpi-store";
import {
  processosKpi, responsaveisKpi, semaforo, semaforoClasses, semaforoCor, semaforoLabel,
  ultimoValor, progressoObjetivo, ciclosFora, unidadesKpi, type BibliotecaItem, type Kpi, type SemaforoKpi,
} from "@/lib/kpi-data";
import { KpiCard, SemaforoChip, SemaforoDot, TendenciaIcon, Sparkline } from "./shared";
import { LoteDialog, ImportarDialog } from "./medicao-dialogs";
import { NovoIndicadorDialog, BibliotecaDialog, EscolhaCriacaoDialog } from "./wizard-dialog";
import { cn } from "@/lib/utils";

type FiltroCard = "todos" | SemaforoKpi;

export function IndicadoresModule() {
  const { kpis, objetivos, addObjetivo } = useKpis();

  const [tab, setTab] = useState("painel");
  const [filtroCard, setFiltroCard] = useState<FiltroCard>("todos");
  const [periodo, setPeriodo] = useState("mes");
  const [fProcesso, setFProcesso] = useState("all");
  const [fObjetivo, setFObjetivo] = useState("all");
  const [fUnidade, setFUnidade] = useState("all");
  const [fResp, setFResp] = useState("all");
  const [soFora, setSoFora] = useState(false);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  const [escolhaOpen, setEscolhaOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bibliotecaOpen, setBibliotecaOpen] = useState(false);
  const [loteOpen, setLoteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [preset, setPreset] = useState<BibliotecaItem | null>(null);
  const [objetivoPadrao, setObjetivoPadrao] = useState<string | undefined>();
  const [novoObjOpen, setNovoObjOpen] = useState(false);
  const [objExpandido, setObjExpandido] = useState<string | null>(null);

  const ativos = kpis.filter((k) => !k.arquivado);

  const base = useMemo(
    () =>
      ativos.filter(
        (k) =>
          (fProcesso === "all" || k.processo === fProcesso) &&
          (fObjetivo === "all" || k.objetivoId === fObjetivo) &&
          (fUnidade === "all" || k.unidadeOrg === fUnidade) &&
          (fResp === "all" || k.responsavelMedicao === fResp),
      ),
    [ativos, fProcesso, fObjetivo, fUnidade, fResp],
  );

  const contagem = {
    total: base.length,
    verde: base.filter((k) => semaforo(k) === "verde").length,
    amarelo: base.filter((k) => semaforo(k) === "amarelo").length,
    vermelho: base.filter((k) => semaforo(k) === "vermelho").length,
  };
  const diasFora = base
    .filter((k) => semaforo(k) === "vermelho")
    .reduce((acc, k) => acc + ciclosFora(k) * 30, 0);

  const filtrados = base.filter((k) => filtroCard === "todos" || semaforo(k) === filtroCard);

  const cards = [
    { key: "todos" as const, label: "Total de indicadores", valor: contagem.total, sub: "ativos no período", icon: Gauge, cor: "var(--brand)" },
    { key: "verde" as const, label: "Atingindo a meta", valor: contagem.verde, sub: `${contagem.total ? Math.round((contagem.verde / contagem.total) * 100) : 0}% do total`, icon: CheckCircle2, cor: "var(--success)" },
    { key: "amarelo" as const, label: "Em atenção", valor: contagem.amarelo, sub: "próximos de estourar", icon: AlertTriangle, cor: "var(--warning)" },
    { key: "vermelho" as const, label: "Fora da meta", valor: contagem.vermelho, sub: `${diasFora} dias fora`, icon: XCircle, cor: "var(--danger-deep)" },
  ];

  function abrirCriacao() {
    setPreset(null);
    setObjetivoPadrao(undefined);
    setEscolhaOpen(true);
  }

  const filtrosBar = (
    <div className="flex flex-wrap items-center gap-2">
      <ListFilter className="h-4 w-4 text-muted-foreground" />
      <Select value={periodo} onValueChange={setPeriodo}>
        <SelectTrigger className="h-9 w-[130px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="mes">Mês</SelectItem>
          <SelectItem value="trimestre">Trimestre</SelectItem>
          <SelectItem value="ano">Ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      <Select value={fProcesso} onValueChange={setFProcesso}>
        <SelectTrigger className="h-9 w-[150px] rounded-lg text-xs"><SelectValue placeholder="Processo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os processos</SelectItem>
          {processosKpi.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={fObjetivo} onValueChange={setFObjetivo}>
        <SelectTrigger className="h-9 w-[190px] rounded-lg text-xs"><SelectValue placeholder="Objetivo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os objetivos</SelectItem>
          {objetivos.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={fUnidade} onValueChange={setFUnidade}>
        <SelectTrigger className="h-9 w-[130px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas unidades</SelectItem>
          {unidadesKpi.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={fResp} onValueChange={setFResp}>
        <SelectTrigger className="h-9 w-[160px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos responsáveis</SelectItem>
          {responsaveisKpi.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Indicadores e KPIs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Medição, análise crítica e objetivos da qualidade do SGQ.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={abrirCriacao}>
              <Plus className="mr-1.5 h-4 w-4" /> Novo Indicador
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setLoteOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" /> Lançar medição em lote
            </Button>
            <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setImportOpen(true)}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Importar de planilha
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <TabsList className="rounded-xl">
            <TabsTrigger value="painel" className="rounded-lg text-xs">Painel</TabsTrigger>
            <TabsTrigger value="meus" className="rounded-lg text-xs">Meus indicadores</TabsTrigger>
            <TabsTrigger value="objetivos" className="rounded-lg text-xs">Objetivos da qualidade</TabsTrigger>
            <TabsTrigger value="analise" className="rounded-lg text-xs">Análise crítica</TabsTrigger>
          </TabsList>

          {/* ---------- PAINEL ---------- */}
          <TabsContent value="painel" className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((c) => {
                const ativo = filtroCard === c.key;
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    onClick={() => setFiltroCard(ativo ? "todos" : c.key)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      ativo ? "border-transparent bg-[color:var(--danger-deep)] text-white shadow-md" : "border-border/80 bg-card hover:-translate-y-0.5 hover:shadow-md",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn("text-[11px] font-medium", ativo ? "text-white/80" : "text-muted-foreground")}>{c.label}</p>
                      <Icon className="h-4 w-4" style={{ color: ativo ? "white" : c.cor }} />
                    </div>
                    <p className="mt-2 text-3xl font-bold" style={{ color: ativo ? "white" : c.cor }}>{c.valor}</p>
                    <p className={cn("text-[10px]", ativo ? "text-white/70" : "text-muted-foreground")}>{c.sub}</p>
                  </button>
                );
              })}
            </div>

            {filtrosBar}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((k) => (
                <KpiCard key={k.id} kpi={k} objetivo={objetivos.find((o) => o.id === k.objetivoId)} />
              ))}
              {!filtrados.length && (
                <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nenhum indicador para os filtros selecionados.
                </p>
              )}
            </div>
          </TabsContent>

          {/* ---------- MEUS INDICADORES ---------- */}
          <TabsContent value="meus" className="space-y-4">
            {filtrosBar}
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <Switch id="so-fora" checked={soFora} onCheckedChange={setSoFora} />
                <Label htmlFor="so-fora" className="text-xs text-muted-foreground">Mostrar apenas com meta não atingida</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="arquivados" checked={mostrarArquivados} onCheckedChange={setMostrarArquivados} />
                <Label htmlFor="arquivados" className="text-xs text-muted-foreground">Arquivados</Label>
              </div>
            </div>
            <TabelaIndicadores
              kpis={(mostrarArquivados ? kpis.filter((k) => k.arquivado) : base).filter(
                (k) => !soFora || ["vermelho", "amarelo"].includes(semaforo(k)),
              )}
            />
          </TabsContent>

          {/* ---------- OBJETIVOS ---------- */}
          <TabsContent value="objetivos" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setNovoObjOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Novo Objetivo
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {objetivos.map((o) => {
                const filhos = ativos.filter((k) => k.objetivoId === o.id);
                const prog = progressoObjetivo(filhos);
                const cor = prog >= 100 ? "var(--success)" : prog >= 85 ? "var(--warning)" : "var(--danger-deep)";
                return (
                  <Card
                    key={o.id}
                    onClick={() => setObjExpandido(objExpandido === o.id ? null : o.id)}
                    className={cn("cursor-pointer rounded-2xl border-border/80 shadow-sm transition hover:shadow-md", objExpandido === o.id && "ring-2 ring-brand/30")}
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-brand" />
                          <h3 className="text-sm font-semibold text-foreground">{o.nome}</h3>
                        </div>
                        <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: cor }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{o.descricao}</p>
                      <Badge variant="outline" className="rounded-md border-brand/20 bg-brand-soft text-[10px] text-brand">
                        {filhos.length} indicadores vinculados
                      </Badge>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Progresso agregado</span><span>{prog}%</span>
                        </div>
                        <Progress value={Math.min(100, prog)} className="h-2" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Prazo {o.prazo} · {o.responsavel}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {objExpandido && (
              <Card className="rounded-2xl border-brand/30">
                <CardContent className="space-y-3 p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Indicadores de “{objetivos.find((o) => o.id === objExpandido)?.nome}”
                  </h3>
                  <TabelaIndicadores kpis={ativos.filter((k) => k.objetivoId === objExpandido)} />
                  <Button
                    size="sm" variant="outline" className="rounded-lg"
                    onClick={() => { setObjetivoPadrao(objExpandido); setPreset(null); setWizardOpen(true); }}
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Criar indicador para este objetivo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ---------- ANÁLISE CRÍTICA ---------- */}
          <TabsContent value="analise">
            <AnaliseCritica kpis={ativos} />
          </TabsContent>
        </Tabs>
      </div>

      <EscolhaCriacaoDialog
        open={escolhaOpen}
        onOpenChange={setEscolhaOpen}
        onDoZero={() => { setEscolhaOpen(false); setWizardOpen(true); }}
        onBiblioteca={() => { setEscolhaOpen(false); setBibliotecaOpen(true); }}
      />
      {wizardOpen && (
        <NovoIndicadorDialog
          key={preset?.nome ?? objetivoPadrao ?? "zero"}
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          objetivoPadrao={objetivoPadrao}
          preset={preset}
        />
      )}
      <BibliotecaDialog
        open={bibliotecaOpen}
        onOpenChange={setBibliotecaOpen}
        onAdotar={(item) => { setPreset(item); setBibliotecaOpen(false); setWizardOpen(true); }}
      />
      <LoteDialog open={loteOpen} onOpenChange={setLoteOpen} />
      <ImportarDialog open={importOpen} onOpenChange={setImportOpen} />
      <NovoObjetivoDialog open={novoObjOpen} onOpenChange={setNovoObjOpen} onSalvar={addObjetivo} />
    </AppShell>
  );
}

/* ---------------- Tabela ---------------- */

function scoreKpi(k: Kpi) {
  const v = ultimoValor(k);
  if (v === null) return 999;
  return k.polaridade === "menor_melhor" ? (k.meta / Math.max(v, 0.001)) * 100 : (v / Math.max(k.meta, 0.001)) * 100;
}

function TabelaIndicadores({ kpis }: { kpis: Kpi[] }) {
  const { objetivos } = useKpis();
  const ordenados = [...kpis].sort((a, b) => scoreKpi(a) - scoreKpi(b));
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[110px] text-[11px]">Detalhamento</TableHead>
            <TableHead className="text-[11px]">Código</TableHead>
            <TableHead className="text-[11px]">Nome</TableHead>
            <TableHead className="text-[11px]">Objetivo</TableHead>
            <TableHead className="text-[11px]">Processo</TableHead>
            <TableHead className="text-[11px]">Meta</TableHead>
            <TableHead className="text-[11px]">Último resultado</TableHead>
            <TableHead className="text-[11px]">Tendência</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">Responsável</TableHead>
            <TableHead className="text-[11px]">Última medição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenados.map((k) => {
            const ultima = k.medicoes[k.medicoes.length - 1];
            return (
              <TableRow key={k.id} className="text-xs hover:bg-muted/40">
                <TableCell>
                  <Link to="/indicadores/$id" params={{ id: k.id }}>
                    <Button size="sm" variant="outline" className="h-7 rounded-lg text-[11px]">
                      <Eye className="mr-1 h-3 w-3" /> Ver
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-brand">{k.codigo}</TableCell>
                <TableCell className="font-medium text-foreground">{k.nome}</TableCell>
                <TableCell className="text-muted-foreground">{objetivos.find((o) => o.id === k.objetivoId)?.nome}</TableCell>
                <TableCell className="text-muted-foreground">{k.processo}</TableCell>
                <TableCell>{k.meta}{k.unidade}</TableCell>
                <TableCell className="font-semibold" style={{ color: semaforoCor[semaforo(k)] }}>
                  {ultimoValor(k) ?? "—"}{ultimoValor(k) !== null ? k.unidade : ""}
                </TableCell>
                <TableCell><TendenciaIcon kpi={k} /></TableCell>
                <TableCell><SemaforoChip kpi={k} /></TableCell>
                <TableCell className="text-muted-foreground">{k.responsavelMedicao}</TableCell>
                <TableCell className="text-muted-foreground">{ultima?.lancadoEm ?? "—"}</TableCell>
              </TableRow>
            );
          })}
          {!ordenados.length && (
            <TableRow><TableCell colSpan={11} className="py-8 text-center text-xs text-muted-foreground">Nenhum indicador encontrado.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------------- Novo objetivo ---------------- */

function NovoObjetivoDialog({
  open, onOpenChange, onSalvar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSalvar: (o: { nome: string; descricao: string; justificativa: string; prazo: string; responsavel: string }) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [prazo, setPrazo] = useState("31/12/2026");
  const [responsavel, setResponsavel] = useState(responsaveisKpi[0]);

  function salvar() {
    if (!nome.trim() || !justificativa.trim()) {
      return toast.error("Nome e justificativa de coerência com a Política da Qualidade são obrigatórios.");
    }
    onSalvar({ nome, descricao, justificativa, prazo, responsavel });
    toast.success("Objetivo da qualidade criado", { description: nome });
    onOpenChange(false);
    setNome(""); setDescricao(""); setJustificativa("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo objetivo da qualidade</DialogTitle>
          <DialogDescription>Todo objetivo precisa ser coerente com a Política da Qualidade.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px]">Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Descrição</Label>
            <Textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Justificativa de coerência com a Política da Qualidade *</Label>
            <Textarea rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} className="rounded-lg text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Prazo</Label>
              <Input value={prazo} onChange={(e) => setPrazo(e.target.value)} className="rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Responsável</Label>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{responsaveisKpi.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="rounded-lg bg-muted/40 p-2 text-[10px] text-muted-foreground">
            Vincule indicadores existentes na aba Painel ou use “Criar indicador para este objetivo”.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvar}>Salvar objetivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Análise crítica ---------------- */

function AnaliseCritica({ kpis }: { kpis: Kpi[] }) {
  const { objetivos } = useKpis();
  const [periodo, setPeriodo] = useState("1s2026");
  const [texto, setTexto] = useState("");
  const [decisoes, setDecisoes] = useState("");
  const [sugestao, setSugestao] = useState<string | null>(null);

  const verdes = kpis.filter((k) => semaforo(k) === "verde");
  const vermelhos = kpis.filter((k) => semaforo(k) === "vermelho");

  const acoes = [
    { id: "PA-2026-018", titulo: "Padronizar setup da linha 2", indicador: "Índice de Retrabalho", resp: "Carlos Menezes", prazo: "30/08/2026" },
    { id: "PA-2026-021", titulo: "Programa de redução de absenteísmo", indicador: "Absenteísmo", resp: "Paula Andrade", prazo: "15/09/2026" },
    { id: "PA-2026-024", titulo: "Revisar fluxo de tratativa de NCs", indicador: "Tempo Médio de Tratativa de NC", resp: "Ana Ribeiro", prazo: "10/10/2026" },
  ];

  const gerar = () =>
    setSugestao(
      `No ${periodo === "1s2026" ? "1º semestre de 2026" : "período selecionado"}, foram monitorados ${kpis.length} indicadores, dos quais ${verdes.length} atingiram a meta e ${vermelhos.length} permaneceram fora. Os melhores desempenhos concentram-se nos objetivos de satisfação do cliente e eficácia das ações corretivas, indicando maturidade crescente do tratamento de não conformidades. Os desvios relevantes estão em retrabalho, absenteísmo e volume de NCs abertas, com correlação entre variação de método na produção e disponibilidade de pessoas. Recomenda-se priorizar recursos para padronização das operações críticas, reforçar a capacitação das equipes e revisar as metas de tratativa de NC no próximo ciclo.`,
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="h-9 w-[190px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1s2026">1º semestre 2026</SelectItem>
            <SelectItem value="2s2025">2º semestre 2025</SelectItem>
            <SelectItem value="2025">Ano 2025</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("Consolidação gerada para o período")}>
            Gerar consolidação
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toast.success("PDF da análise crítica gerado")}>
            <FileDown className="mr-1.5 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <Bloco titulo="Panorama geral">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { l: "indicadores no período", v: kpis.length, c: "var(--brand)" },
            { l: "atingiram a meta", v: verdes.length, c: "var(--success)" },
            { l: "fora da meta", v: vermelhos.length, c: "var(--danger-deep)" },
          ].map((c) => (
            <Card key={c.l} className="rounded-xl border-border/80">
              <CardContent className="p-4">
                <p className="text-3xl font-bold" style={{ color: c.c }}>{c.v}</p>
                <p className="text-[11px] text-muted-foreground">{c.l}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Objetivos da qualidade e grau de atendimento">
        <div className="space-y-2">
          {objetivos.map((o) => {
            const filhos = kpis.filter((k) => k.objetivoId === o.id);
            const prog = progressoObjetivo(filhos);
            const cor = prog >= 100 ? "var(--success)" : prog >= 85 ? "var(--warning)" : "var(--danger-deep)";
            return (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                <span className="h-3 w-3 rounded-full" style={{ background: cor }} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{o.nome}</span>
                <span className="w-40"><Progress value={Math.min(100, prog)} className="h-2" /></span>
                <span className="w-12 text-right text-xs font-semibold" style={{ color: cor }}>{prog}%</span>
              </div>
            );
          })}
        </div>
      </Bloco>

      <Bloco titulo="Indicadores em destaque positivo">
        <div className="grid gap-3 md:grid-cols-3">
          {verdes.map((k) => (
            <Card key={k.id} className="rounded-xl border-[color:var(--success)]/30 bg-[color:var(--success)]/5">
              <CardContent className="space-y-1 p-4">
                <p className="text-xs font-semibold text-foreground">{k.nome}</p>
                <p className="text-xl font-bold text-[color:var(--success)]">{ultimoValor(k)}{k.unidade}</p>
                <p className="text-[10px] text-muted-foreground">meta {k.meta}{k.unidade} · {k.processo}</p>
                <Sparkline valores={k.medicoes.map((m) => m.valor)} cor="var(--success)" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Indicadores em atenção">
        <div className="grid gap-3 md:grid-cols-3">
          {vermelhos.map((k, i) => (
            <Card key={k.id} className="rounded-xl border-[color:var(--danger-deep)]/30 bg-[color:var(--danger-deep)]/5">
              <CardContent className="space-y-1.5 p-4">
                <p className="text-xs font-semibold text-foreground">{k.nome}</p>
                <p className="text-xl font-bold text-[color:var(--danger-deep)]">{ultimoValor(k)}{k.unidade}</p>
                <p className="text-[10px] text-muted-foreground">
                  Causa provável: {k.medicoes[k.medicoes.length - 1]?.analise ?? "variação de método no processo " + k.processo + "."}
                </p>
                <Badge variant="outline" className="rounded-md border-[color:var(--danger-deep)]/30 text-[10px] text-[color:var(--danger-deep)]">
                  NC_ID_{String(i + 11).padStart(3, "0")}_2026
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Ações originadas de indicadores">
        <div className="space-y-2">
          {acoes.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-3 text-xs">
              <span className="font-mono text-[10px] text-brand">{a.id}</span>
              <span className="font-medium text-foreground">{a.titulo}</span>
              <Badge variant="outline" className="rounded-md text-[10px]">{a.indicador}</Badge>
              <span className="ml-auto text-[10px] text-muted-foreground">{a.resp} · prazo {a.prazo}</span>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Campo de análise crítica">
        <div className="space-y-2">
          <Textarea rows={6} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Registre a análise crítica do período…" className="rounded-xl text-sm" />
          <Button size="sm" variant="outline" className="rounded-lg" onClick={gerar}>
            <Sparkles className="mr-1.5 h-4 w-4" /> Sugerir análise com IA
          </Button>
          {sugestao && (
            <Card className="rounded-xl border-brand/30 bg-brand-soft/40">
              <CardContent className="space-y-2 p-4">
                <Badge variant="outline" className="rounded-md border-brand/30 bg-background text-[10px] text-brand">
                  Sugestão de IA — deve ser analisada e aprovada
                </Badge>
                <p className="text-[11px] leading-relaxed text-foreground">{sugestao}</p>
                <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => { setTexto(sugestao); setSugestao(null); }}>
                  Usar esta análise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </Bloco>

      <Bloco titulo="Decisões da direção">
        <Textarea rows={5} value={decisoes} onChange={(e) => setDecisoes(e.target.value)}
          placeholder="Mudanças no SGQ, oportunidades de melhoria e recursos necessários…" className="rounded-xl text-sm" />
      </Bloco>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardContent className="space-y-3 p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-brand">{titulo}</h2>
        {children}
      </CardContent>
    </Card>
  );
}