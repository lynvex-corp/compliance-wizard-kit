import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CalendarClock, Grid3x3, Lock, Plus, Settings2, ShieldCheck, Star, Target,
  MessageSquare, Save, Check, Users, Search, CalendarPlus,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* --------------------------------- dados --------------------------------- */

const PERFIS = ["Diretoria", "Gestor da Qualidade", "Líder", "Colaborador"];
const PERFIS_CONFIG = ["Diretoria"];
const LIDERES = ["Diego Almeida", "Carla Menezes", "Fernanda Lima"];
const PERIODICIDADES = ["Anual", "Bienal", "Semestral", "Trimestral"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const EMPREGADOS = [
  "Ana Ribeiro", "Beatriz Souza", "Carla Menezes", "Diego Almeida",
  "Fernanda Lima", "Juliana Peixoto", "Marcos Vinícius", "Rafael Costa",
];

const CARGOS: Record<string, string> = {
  "Ana Ribeiro": "Analista de Produção Jr.",
  "Beatriz Souza": "Analista de RH",
  "Carla Menezes": "Gerente Comercial",
  "Diego Almeida": "Coordenador de Produção",
  "Fernanda Lima": "Analista de Qualidade Sr.",
  "Juliana Peixoto": "Auditora Interna",
  "Marcos Vinícius": "Operador Sr.",
  "Rafael Costa": "Analista de Qualidade",
};

const BLOCOS = [
  {
    nome: "Conhecimento",
    perguntas: [
      "Possui conhecimento técnico das atividades que realiza?",
      "Busca se aperfeiçoar nos conhecimentos necessários?",
      "Compreende como seu trabalho impacta o sistema de gestão da qualidade?",
      "Conhece os procedimentos aplicáveis à sua função?",
      "Aplica o conhecimento adquirido em treinamentos no dia a dia?",
    ],
  },
  {
    nome: "Habilidades",
    perguntas: [
      "Exerce um trabalho eficiente?",
      "Cumpre prazos e entregas acordadas?",
      "Resolve problemas dentro da sua alçada com autonomia?",
      "Comunica-se de forma clara com a equipe?",
      "Adapta-se a mudanças de processo ou prioridade?",
    ],
  },
  {
    nome: "Atitudes",
    perguntas: [
      "Possui atitudes condizentes com a cultura e política da qualidade, bem como com os valores da empresa?",
      "É engajado?",
      "Busca a melhoria contínua do seu processo?",
      "Colabora com colegas e outras áreas?",
      "Reporta problemas e não conformidades quando os identifica?",
    ],
  },
] as const;

const POTENCIAIS = ["Alto Potencial", "Cultura", "Técnico"] as const;
type Potencial = (typeof POTENCIAIS)[number];

const MATRIZ: { label: string; acao: string }[][] = [
  // linha 0 = Alto Potencial
  [
    { label: "Enigma", acao: "Acompanhar de perto — potencial alto sem entrega" },
    { label: "Forte contribuidor", acao: "Desenvolver para assumir novos desafios" },
    { label: "Estrela", acao: "Promover e reter — sucessão" },
  ],
  [
    { label: "Questionável", acao: "Acompanhar de perto com metas claras" },
    { label: "Mantenedor", acao: "Desenvolver competências específicas" },
    { label: "Alto desempenho", acao: "Reter e ampliar escopo" },
  ],
  [
    { label: "Insuficiente", acao: "Plano de recuperação com prazo definido" },
    { label: "Eficaz", acao: "Acompanhar e reforçar consistência" },
    { label: "Especialista", acao: "Reter como referência técnica" },
  ],
];

const CELL_COLOR = [
  ["bg-[color:var(--warning)]/20", "bg-brand-soft", "bg-[color:var(--success)]/25"],
  ["bg-[color:var(--severity-critical)]/10", "bg-muted/60", "bg-brand-soft"],
  ["bg-[color:var(--severity-critical)]/20", "bg-[color:var(--warning)]/15", "bg-muted/60"],
];

/* --------------------------------- tipos --------------------------------- */

interface Notas { [key: string]: number }
interface Detalhes { [key: string]: string }

interface Avaliacao {
  id: string;
  empregado: string;
  avaliador: string;
  ciclo: string;
  notas: Notas;
  detalhes: Detalhes;
  potencial: Potencial;
  registroDevolutiva: string;
  dataDevolutiva: string;
  devolutivaCompartilhada: boolean;
  concluida: boolean;
}

const CICLOS = [
  { nome: "Ciclo 2026.1", periodo: "Programado para abr/2026", status: "Aberto", mes: 4 },
  { nome: "Ciclo 2025.2", periodo: "Realizado em nov/2025", status: "Encerrado", mes: 11 },
  { nome: "Ciclo 2025.1", periodo: "Realizado em mai/2025", status: "Encerrado", mes: 5 },
];

const key = (b: number, q: number) => `${b}-${q}`;

function notasIniciais(seed?: number[]): Notas {
  const n: Notas = {};
  BLOCOS.forEach((b, bi) => b.perguntas.forEach((_, qi) => {
    n[key(bi, qi)] = seed ? seed[bi * 5 + qi] : 7;
  }));
  return n;
}

const AVALIACOES_INICIAIS: Avaliacao[] = [
  {
    id: "AV-2026-001",
    empregado: "Fernanda Lima",
    avaliador: "Carla Menezes",
    ciclo: "Ciclo 2026.1",
    notas: notasIniciais([9, 9, 10, 9, 8, 9, 8, 9, 9, 8, 10, 9, 9, 9, 10]),
    detalhes: {},
    potencial: "Alto Potencial",
    registroDevolutiva: "Conversa realizada; alinhado plano de sucessão técnica.",
    dataDevolutiva: "2026-04-18",
    devolutivaCompartilhada: true,
    concluida: true,
  },
  {
    id: "AV-2026-002",
    empregado: "Ana Ribeiro",
    avaliador: "Diego Almeida",
    ciclo: "Ciclo 2026.1",
    notas: notasIniciais([6, 8, 6, 6, 7, 6, 6, 5, 7, 7, 8, 8, 7, 8, 6]),
    detalhes: {},
    potencial: "Alto Potencial",
    registroDevolutiva: "",
    dataDevolutiva: "",
    devolutivaCompartilhada: false,
    concluida: false,
  },
  {
    id: "AV-2026-003",
    empregado: "Marcos Vinícius",
    avaliador: "Diego Almeida",
    ciclo: "Ciclo 2026.1",
    notas: notasIniciais([7, 6, 6, 7, 6, 7, 7, 6, 6, 6, 7, 7, 6, 7, 7]),
    detalhes: {},
    potencial: "Cultura",
    registroDevolutiva: "",
    dataDevolutiva: "",
    devolutivaCompartilhada: false,
    concluida: false,
  },
];

/* ------------------------------- utilitários ------------------------------ */

function mediaBloco(notas: Notas, bi: number) {
  const vals = BLOCOS[bi].perguntas.map((_, qi) => notas[key(bi, qi)] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function mediaGeral(notas: Notas) {
  return (mediaBloco(notas, 0) + mediaBloco(notas, 1) + mediaBloco(notas, 2)) / 3;
}
function faixaDesempenho(media: number, meta: number): 0 | 1 | 2 {
  if (media < meta - 1) return 0;
  if (media < meta + 1.5) return 1;
  return 2;
}
const linhaPotencial = (p: Potencial) => (p === "Alto Potencial" ? 0 : p === "Cultura" ? 1 : 2);

/* -------------------------------- componente ------------------------------ */

export function PerformancePage() {
  const [perfil, setPerfil] = useState("Gestor da Qualidade");
  const podeConfigurar = PERFIS_CONFIG.includes(perfil);

  const [periodicidade, setPeriodicidade] = useState("Anual");
  const [metaMinima, setMetaMinima] = useState(7);
  const [notificar, setNotificar] = useState(true);
  const [programacao, setProgramacao] = useState<Record<number, string[]>>({
    4: ["Ciclo 2026.1 — abertura"],
    5: ["Ciclo 2026.1 — devolutivas"],
    10: ["Ciclo 2026.2 — abertura"],
  });

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(AVALIACOES_INICIAIS);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState({ empregado: EMPREGADOS[0], ciclo: CICLOS[0].nome });

  // Governança: só vê o que o próprio perfil avaliou
  const minhas = useMemo(
    () => avaliacoes.filter((a) => a.avaliador === perfil),
    [avaliacoes, perfil],
  );
  const aberta = avaliacoes.find((a) => a.id === abertaId) ?? null;

  const patch = (id: string, p: Partial<Avaliacao>) =>
    setAvaliacoes((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));

  function criar() {
    const id = `AV-2026-${String(avaliacoes.length + 1).padStart(3, "0")}`;
    const nv: Avaliacao = {
      id,
      empregado: nova.empregado,
      avaliador: perfil,
      ciclo: nova.ciclo,
      notas: notasIniciais(),
      detalhes: {},
      potencial: "Cultura",
        registroDevolutiva: "",
      dataDevolutiva: "",
      devolutivaCompartilhada: false,
      concluida: false,
    };
    setAvaliacoes((p) => [nv, ...p]);
    setNovaOpen(false);
    setAbertaId(id);
    if (notificar) toast.info(`${nova.empregado} foi notificado sobre a abertura da avaliação.`);
  }

  function toggleMes(mes: number) {
    if (!podeConfigurar) return;
    setProgramacao((prev) => {
      const atual = prev[mes] ?? [];
      if (atual.length) { const c = { ...prev }; delete c[mes]; return c; }
      return { ...prev, [mes]: ["Ciclo — avaliação de desempenho"] };
    });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Avaliação de Desempenho</h1>
              <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
                Pessoas
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Ciclos, formulário CHA (Conhecimento, Habilidades e Atitudes), matriz de decisão e devolutiva.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Perfil logado:</span>
            <Select value={perfil} onValueChange={setPerfil}>
              <SelectTrigger className="h-9 w-[190px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERFIS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setNovaOpen(true)}>
              <Plus className="h-4 w-4" /> Nova avaliação
            </Button>
          </div>
        </header>

        <Card className="rounded-xl border-brand/25 bg-brand-soft/30">
          <CardContent className="flex items-start gap-2 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>
              <strong className="text-foreground">Confidencialidade:</strong> cada avaliação é visível apenas para o
              avaliador que a realizou. Nem outros avaliadores nem o avaliado têm acesso ao formulário — o avaliado só
              enxerga a devolutiva quando ela é explicitamente compartilhada.
            </span>
          </CardContent>
        </Card>

        <Tabs defaultValue="avaliacoes">
          <TabsList>
            <TabsTrigger value="avaliacoes">Minhas avaliações ({minhas.length})</TabsTrigger>
            <TabsTrigger value="ciclo">Configuração do ciclo</TabsTrigger>
          </TabsList>

          {/* ------------------------- avaliações ------------------------- */}
          <TabsContent value="avaliacoes" className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {CICLOS.map((c) => (
                <Card key={c.nome} className={cn("rounded-2xl border-border/80 shadow-sm", c.status === "Aberto" && "border-brand/30 bg-brand-soft/30")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className={cn("rounded-md text-[10px]",
                        c.status === "Aberto"
                          ? "border-brand/30 bg-background text-brand"
                          : "border-border bg-muted text-muted-foreground")}>{c.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{c.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{c.periodo}</div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Escala 1 a 10 · meta mínima {metaMinima} · {periodicidade.toLowerCase()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Empregado</TableHead>
                      <TableHead>Ciclo</TableHead>
                      <TableHead className="text-center">Média geral</TableHead>
                      <TableHead>Quadrante</TableHead>
                      <TableHead>Devolutiva</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minhas.map((a) => {
                      const m = mediaGeral(a.notas);
                      const col = faixaDesempenho(m, metaMinima);
                      const q = MATRIZ[linhaPotencial(a.potencial)][col];
                      return (
                        <TableRow key={a.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setAbertaId(a.id)}>
                          <TableCell className="font-mono text-xs">{a.id}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{a.empregado}</div>
                            <div className="text-[11px] text-muted-foreground">{CARGOS[a.empregado] ?? "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.ciclo}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn("text-sm font-bold", m >= metaMinima ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                              {m.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{q.label}</TableCell>
                          <TableCell>
                            {a.dataDevolutiva ? (
                              <Badge variant="outline" className="rounded-md border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[10px] text-[color:var(--success)]">
                                {new Date(`${a.dataDevolutiva}T00:00:00`).toLocaleDateString("pt-BR")}
                                {a.devolutivaCompartilhada ? " · compartilhada" : ""}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pendente</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Abrir</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {minhas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                          Nenhuma avaliação registrada por este perfil. Avaliações de outros avaliadores não são exibidas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --------------------------- ciclo ---------------------------- */}
          <TabsContent value="ciclo" className="mt-4 space-y-4">
            {!podeConfigurar ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm font-semibold">Configuração restrita</div>
                  <p className="max-w-md text-xs text-muted-foreground">
                    A configuração do ciclo é permitida apenas para Gestor da Qualidade e Alta Direção.
                    Seu perfil atual é <strong>{perfil}</strong>.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="rounded-xl">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-brand" />
                      <h2 className="text-sm font-semibold">Parâmetros do ciclo</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Periodicidade</Label>
                        <Select value={periodicidade} onValueChange={setPeriodicidade}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PERIODICIDADES.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Critério de pontuação</Label>
                        <Input value="Escala de 1 a 10" readOnly className="h-9 bg-muted/40 text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Meta mínima</Label>
                        <Input
                          type="number" min={1} max={10} value={metaMinima}
                          onChange={(e) => setMetaMinima(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                      <div>
                        <div className="text-sm font-medium">Notificar o empregado avaliado quando o ciclo abrir</div>
                        <div className="text-[11px] text-muted-foreground">
                          Envia aviso automático no início do ciclo, sem expor o conteúdo da avaliação.
                        </div>
                      </div>
                      <Switch checked={notificar} onCheckedChange={setNotificar} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-brand" />
                      <h2 className="text-sm font-semibold">Programação do ciclo — 2026</h2>
                      <span className="text-[11px] text-muted-foreground">Clique no mês para programar ou remover.</span>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="grid min-w-[1100px] grid-cols-12 gap-2">
                        {MESES.map((m, i) => {
                          const itens = programacao[i + 1] ?? [];
                          return (
                            <button
                              key={m}
                              onClick={() => toggleMes(i + 1)}
                              className="border-l border-dashed border-border pl-2 text-left"
                            >
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m}</div>
                              <div className="flex min-h-[110px] flex-col gap-2">
                                {itens.map((t) => (
                                  <div key={t} className="rounded-lg border border-brand/30 bg-brand-soft p-2 text-[11px] font-medium text-brand">
                                    {t}
                                  </div>
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* --------------------------- nova avaliação --------------------------- */}
      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova avaliação</DialogTitle>
            <DialogDescription>O avaliador é preenchido automaticamente pelo perfil logado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Empregado avaliado</Label>
              <Select value={nova.empregado} onValueChange={(v) => setNova((n) => ({ ...n, empregado: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPREGADOS.map((e) => <SelectItem key={e} value={e} className="text-xs">{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ciclo de avaliação</Label>
              <Select value={nova.ciclo} onValueChange={(v) => setNova((n) => ({ ...n, ciclo: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CICLOS.map((c) => <SelectItem key={c.nome} value={c.nome} className="text-xs">{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Avaliador</Label>
              <Input value={perfil} readOnly className="h-9 bg-muted/40 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaOpen(false)}>Cancelar</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={criar}>Iniciar avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------- formulário CHA --------------------------- */}
      <Dialog open={!!aberta} onOpenChange={(o) => !o && setAbertaId(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {aberta && (
            <FormularioAvaliacao
              key={aberta.id}
              a={aberta}
              meta={metaMinima}
              onPatch={(p) => patch(aberta.id, p)}
              onClose={() => setAbertaId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ---------------------------- formulário + matriz --------------------------- */

function FormularioAvaliacao({
  a, meta, onPatch, onClose,
}: {
  a: Avaliacao;
  meta: number;
  onPatch: (p: Partial<Avaliacao>) => void;
  onClose: () => void;
}) {
  const geral = mediaGeral(a.notas);
  const col = faixaDesempenho(geral, meta);
  const row = linhaPotencial(a.potencial);
  const quadrante = MATRIZ[row][col];

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Star className="h-4 w-4 text-brand" /> Avaliação de desempenho — {a.empregado}
        </DialogTitle>
        <DialogDescription>Metodologia CHA · escala de 1 a 10 · meta mínima {meta}.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 md:grid-cols-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Empregado</div>
          <div className="text-sm font-medium">{a.empregado}</div>
          <div className="text-[11px] text-muted-foreground">{CARGOS[a.empregado] ?? "—"}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Avaliador</div>
          <div className="text-sm font-medium">{a.avaliador}</div>
          <div className="text-[11px] text-muted-foreground">Preenchido pelo perfil logado</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ciclo</div>
          <div className="text-sm font-medium">{a.ciclo}</div>
        </div>
      </div>

      {BLOCOS.map((b, bi) => {
        const m = mediaBloco(a.notas, bi);
        const ok = m >= meta;
        return (
          <Card key={b.nome} className="rounded-xl">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{b.nome}</h3>
                <Badge variant="outline" className={cn("rounded-md text-[11px]",
                  ok ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                     : "border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]")}>
                  Média {m.toFixed(1)} / meta {meta}
                </Badge>
              </div>
              {b.perguntas.map((p, qi) => {
                const k = key(bi, qi);
                const v = a.notas[k] ?? 7;
                return (
                  <div key={k} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-medium text-foreground">{qi + 1}. {p}</div>
                      <span className={cn("min-w-9 rounded-md px-2 py-0.5 text-center text-sm font-bold",
                        v >= meta ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
                                  : "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]")}>{v}</span>
                    </div>
                    <Slider
                      className="mt-3"
                      min={1} max={10} step={1} value={[v]}
                      onValueChange={([nv]) => onPatch({ notas: { ...a.notas, [k]: nv } })}
                    />
                    <Textarea
                      placeholder="Detalhamento (opcional)"
                      value={a.detalhes[k] ?? ""}
                      onChange={(e) => onPatch({ detalhes: { ...a.detalhes, [k]: e.target.value } })}
                      className="mt-2 min-h-[52px] text-xs"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Card className="rounded-xl border-brand/25 bg-brand-soft/25">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-brand" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Média geral</div>
              <div className={cn("text-2xl font-bold", geral >= meta ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                {geral.toFixed(1)}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[220px]">
            <Progress value={geral * 10} className="h-2" />
            <div className="mt-1 text-[11px] text-muted-foreground">
              {geral >= meta ? "Atinge a meta mínima do ciclo." : `Abaixo da meta mínima (${meta}).`}
            </div>
          </div>
          {BLOCOS.map((b, bi) => (
            <div key={b.nome} className="text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.nome}</div>
              <div className={cn("text-sm font-bold", mediaBloco(a.notas, bi) >= meta ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                {mediaBloco(a.notas, bi).toFixed(1)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* matriz de decisão */}
      <Card className="rounded-xl">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-semibold">Matriz de decisão — desempenho × potencial</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Potencial avaliado:</span>
              <Select value={a.potencial} onValueChange={(v) => onPatch({ potencial: v as Potencial })}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POTENCIAIS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex">
            <div className="flex w-6 items-center justify-center">
              <span className="-rotate-90 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Potencial →</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-2">
                {MATRIZ.map((linha, ri) =>
                  linha.map((cel, ci) => {
                    const ativo = ri === row && ci === col;
                    return (
                      <div key={`${ri}-${ci}`} className={cn(
                        "min-h-[92px] rounded-xl border border-border/50 p-3",
                        CELL_COLOR[ri][ci],
                        ativo && "border-brand ring-2 ring-brand",
                      )}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{cel.label}</div>
                        {ativo && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 text-[11px] font-semibold text-brand shadow ring-1 ring-brand/20">
                            <Users className="h-3 w-3" /> {a.empregado}
                          </div>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
              <div className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Desempenho →</div>
            </div>
          </div>
          <div className="rounded-lg border border-brand/25 bg-brand-soft/40 p-3 text-xs">
            <strong className="text-foreground">Recomendação de ação:</strong> {quadrante.acao}.
            <span className="text-muted-foreground"> Apoio à decisão da liderança — não substitui a análise do gestor.</span>
          </div>
        </CardContent>
      </Card>

      {/* devolutiva */}
      <Card className="rounded-xl">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand" />
            <h3 className="text-sm font-semibold">Devolutiva</h3>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Plano de ação de desenvolvimento</Label>
              <Button
                size="sm" variant="outline" className="h-7 gap-1.5 rounded-lg text-[11px]"
                onClick={() => toast.success("Plano de ação gerado", {
                  description: `Plano de desenvolvimento vinculado à avaliação ${a.id} de ${a.empregado}.`,
                })}
              >
                <Plus className="h-3.5 w-3.5" /> Gerar Plano de Ação
              </Button>
            </div>
            <Textarea
              value={a.planoDesenvolvimento}
              onChange={(e) => onPatch({ planoDesenvolvimento: e.target.value })}
              placeholder="Ações de desenvolvimento acordadas com o avaliado…"
              className="min-h-[70px] text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Registro da devolutiva</Label>
            <Textarea
              value={a.registroDevolutiva}
              onChange={(e) => onPatch({ registroDevolutiva: e.target.value })}
              placeholder="Resumo da conversa entre avaliador e avaliado…"
              className="min-h-[70px] text-xs"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Data da devolutiva</Label>
              <Input type="date" value={a.dataDevolutiva} onChange={(e) => onPatch({ dataDevolutiva: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
              <div>
                <div className="text-xs font-medium">Compartilhar devolutiva com o avaliado</div>
                <div className="text-[10px] text-muted-foreground">As notas e o formulário permanecem restritos ao avaliador.</div>
              </div>
              <Switch checked={a.devolutivaCompartilhada} onCheckedChange={(v) => onPatch({ devolutivaCompartilhada: v })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>Fechar</Button>
        <Button
          className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => { onPatch({ concluida: true }); toast.success("Avaliação salva", { description: `${a.empregado} — média ${geral.toFixed(1)}.` }); onClose(); }}
        >
          {a.concluida ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} Salvar avaliação
        </Button>
      </DialogFooter>
    </div>
  );
}
