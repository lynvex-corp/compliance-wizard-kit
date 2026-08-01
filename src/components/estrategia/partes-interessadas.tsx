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
import {
  Plus, Trash2, Sparkles, Check, Wand2, Lock, LockOpen, FileCheck2, History, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, type ParteInteressada } from "@/lib/jawda-store";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};
const hoje = () => new Date().toISOString().slice(0, 10);
const rotuloVersao = (n: number) => `Análise das Partes Interessadas_${String(n).padStart(2, "0")}.2026`;

interface Sugestao {
  id: string;
  nome: string;
  requisitos: string;
  expectativas: string;
  motivo: string;
  selecionada: boolean;
}

interface Versao {
  id: string;
  numero: number;
  titulo: string;
  data: string;
  autor: string;
  partes: { nome: string; requisitos: string; expectativas: string }[];
}

const SUGESTOES_POR_SEGMENTO: Record<string, Omit<Sugestao, "id" | "selecionada">[]> = {
  "Construção civil": [
    { nome: "Órgão ambiental estadual", requisitos: "Licença ambiental vigente e PGRCC aprovado", expectativas: "Relatórios de destinação de resíduos enviados a cada trimestre", motivo: "Obras exigem licenciamento e monitoramento ambiental contínuo." },
    { nome: "Comunidade do entorno da obra", requisitos: "Controle de ruído, poeira e tráfego de caminhões", expectativas: "Canal de ouvidoria ativo e restrição de horários de operação", motivo: "Impacto direto na vizinhança durante a execução." },
    { nome: "Sindicato da construção civil", requisitos: "CCT vigente cumprida e atendimento à NR-18 e NR-35", expectativas: "Reuniões periódicas registradas e evidência de treinamentos de segurança", motivo: "Setor com alta atuação sindical e risco ocupacional." },
    { nome: "Prefeitura — alvará de obras", requisitos: "Alvará de construção e habite-se emitidos", expectativas: "Documentação urbanística mantida atualizada no canteiro", motivo: "Condição legal para operar o canteiro." },
  ],
  "Indústria de alimentos": [
    { nome: "Vigilância sanitária", requisitos: "Alvará sanitário vigente e plano APPCC implantado", expectativas: "Registros de BPF disponíveis para inspeção sem aviso prévio", motivo: "Fiscalização direta sobre a produção." },
    { nome: "Grandes redes varejistas", requisitos: "Auditoria de fornecedor aprovada anualmente", expectativas: "Plano de ação para desvios enviado em até 15 dias após a auditoria", motivo: "Concentram a maior parte do faturamento." },
    { nome: "Transportadoras de cadeia fria", requisitos: "Registro de temperatura por rota", expectativas: "Coletas confirmadas em janela programada e relatório de desvios térmicos", motivo: "Elo crítico para conservação do produto." },
    { nome: "Comunidade do entorno da planta", requisitos: "Monitoramento periódico de efluentes e odores", expectativas: "Laudos divulgados e tratativa de reclamações em até 10 dias", motivo: "Reclamações recorrentes em plantas de processamento." },
  ],
  "Serviços / Tecnologia": [
    { nome: "Clientes contratantes (B2B)", requisitos: "SLA contratual de disponibilidade e conformidade com a LGPD", expectativas: "Relatório mensal de disponibilidade e comunicação de incidentes em 24h", motivo: "Continuidade do contrato depende do nível de serviço." },
    { nome: "Autoridade de proteção de dados", requisitos: "Registro de operações e encarregado nomeado", expectativas: "Evidências de tratamento lícito mantidas e auditáveis", motivo: "Exposição regulatória por tratamento de dados." },
    { nome: "Colaboradores em regime remoto", requisitos: "Política de trabalho remoto formalizada", expectativas: "Metas claras por ciclo e apoio ergonômico documentado", motivo: "Retenção de talentos é risco operacional central." },
    { nome: "Provedores de nuvem", requisitos: "Contrato com SLA e plano de continuidade", expectativas: "Testes de recuperação anuais com evidência de resultado", motivo: "Dependência crítica de terceiro." },
  ],
};

export function PartesInteressadasPage() {
  const { partesInteressadas, addParte, updateParte, removeParte, usuario } = useJawda();
  const [busca, setBusca] = useState("");
  const [novaOpen, setNovaOpen] = useState(false);
  const [nova, setNova] = useState({ nome: "", requisitos: "", expectativas: "" });
  const [iaOpen, setIaOpen] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [segmento, setSegmento] = useState<string>("Construção civil");
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [fechada, setFechada] = useState(false);
  const [verVersaoId, setVerVersaoId] = useState<string | null>(null);

  const versaoVista = versoes.find((v) => v.id === verVersaoId) ?? null;
  const somenteLeitura = fechada || versaoVista !== null;

  const rows = useMemo(
    () =>
      partesInteressadas.filter((p) =>
        (p.nome + p.requisitos + (p.expectativas ?? "")).toLowerCase().includes(busca.toLowerCase()),
      ),
    [partesInteressadas, busca],
  );

  const patch = (id: string, campo: "nome" | "requisitos" | "expectativas", valor: string) =>
    updateParte(id, { [campo]: valor, ultimaRevisao: hoje() } as Partial<ParteInteressada>);

  const salvarNova = () => {
    if (!nova.nome.trim()) { toast.error("Informe o nome da parte interessada"); return; }
    addParte({
      nome: nova.nome,
      requisitos: nova.requisitos,
      expectativas: nova.expectativas,
      necessidades: nova.requisitos,
      ultimaRevisao: hoje(),
    });
    toast.success("Parte interessada adicionada");
    setNova({ nome: "", requisitos: "", expectativas: "" });
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
        nome: s.nome,
        requisitos: s.requisitos,
        expectativas: s.expectativas,
        necessidades: s.requisitos,
        ultimaRevisao: hoje(),
      }),
    );
    toast.success(`${escolhidas.length} parte(s) adicionada(s) ao cadastro`);
    setIaOpen(false);
  };

  const formalizar = () => {
    const incompleta = partesInteressadas.find((p) => !p.nome.trim() || !p.requisitos.trim() || !(p.expectativas ?? "").trim());
    if (!partesInteressadas.length) { toast.error("Cadastre ao menos uma parte interessada"); return; }
    if (incompleta) {
      toast.error(`“${incompleta.nome || "Registro sem nome"}” está incompleta`, {
        description: "Requisitos e expectativas são obrigatórios para formalizar a versão.",
      });
      return;
    }
    const numero = (versoes[versoes.length - 1]?.numero ?? 0) + 1;
    const v: Versao = {
      id: `ver-pi-${numero}`,
      numero,
      titulo: rotuloVersao(numero),
      data: hoje(),
      autor: usuario.nome,
      partes: partesInteressadas.map((p) => ({
        nome: p.nome, requisitos: p.requisitos, expectativas: p.expectativas ?? "",
      })),
    };
    setVersoes((prev) => [...prev, v]);
    setFechada(true);
    setVerVersaoId(null);
    toast.success(`${v.titulo} formalizada`, { description: "Versão fechada — os campos ficam somente leitura." });
  };

  const novaVersao = () => {
    setFechada(false);
    setVerVersaoId(null);
    toast.success("Nova versão aberta para edição", { description: "Cópia editável da última versão fechada." });
  };

  const linhas = versaoVista
    ? versaoVista.partes.map((p, i) => ({ id: `snap-${i}`, ...p, ultimaRevisao: versaoVista.data }))
    : rows.map((p) => ({ id: p.id, nome: p.nome, requisitos: p.requisitos, expectativas: p.expectativas ?? "", ultimaRevisao: p.ultimaRevisao }));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Partes Interessadas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Requisito 4.2 da ISO 9001 — registre requisitos e expectativas e formalize a versão do documento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md text-[10px]",
                somenteLeitura ? "border-[color:var(--success)]/40 text-[color:var(--success)]" : "border-[color:var(--warning)]/50 text-[color:var(--severity-high)]",
              )}
            >
              {versaoVista
                ? `${versaoVista.titulo} · somente leitura`
                : fechada
                  ? `${versoes[versoes.length - 1]?.titulo} · formalizada`
                  : `Em elaboração — versão ${String((versoes[versoes.length - 1]?.numero ?? 0) + 1).padStart(2, "0")}.2026`}
            </Badge>
            {!somenteLeitura && (
              <>
                <Button size="sm" variant="outline" onClick={() => rodarIA()} className="rounded-lg">
                  <Sparkles className="mr-1.5 h-4 w-4" /> Mapear com IA
                </Button>
                <Button size="sm" variant="outline" onClick={() => setNovaOpen(true)} className="rounded-lg">
                  <Plus className="mr-1.5 h-4 w-4" /> Nova Parte Interessada
                </Button>
                <Button size="sm" onClick={formalizar} className="rounded-lg bg-brand text-white hover:bg-brand/90">
                  <FileCheck2 className="mr-1.5 h-4 w-4" /> Formalizar Partes Interessadas
                </Button>
              </>
            )}
            {versaoVista ? (
              <Button size="sm" variant="outline" onClick={() => setVerVersaoId(null)} className="rounded-lg">
                <X className="mr-1.5 h-4 w-4" /> Sair do histórico
              </Button>
            ) : fechada ? (
              <Button size="sm" onClick={novaVersao} className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <LockOpen className="mr-1.5 h-4 w-4" /> Nova versão
              </Button>
            ) : null}
          </div>
        </header>

        {somenteLeitura && (
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-brand" />
            {versaoVista
              ? `Snapshot de ${versaoVista.titulo}, fechado em ${fmt(versaoVista.data)} por ${versaoVista.autor}.`
              : "Documento formalizado — abra uma nova versão para atualizar o cadastro."}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Tabela principal */}
          <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Cadastro de partes interessadas</h2>
                {!versaoVista && (
                  <Input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar nome, requisito, expectativa…"
                    className="h-8 max-w-xs rounded-lg text-xs"
                  />
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      <TableHead className="w-10">#</TableHead>
                      <TableHead className="w-[220px]">Nome da parte interessada</TableHead>
                      <TableHead className="min-w-[240px]">Descrição dos Requisitos</TableHead>
                      <TableHead className="min-w-[240px]">Descrição das Expectativas</TableHead>
                      <TableHead className="w-[120px]">Última revisão</TableHead>
                      {!somenteLeitura && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linhas.map((p, idx) => (
                      <TableRow key={p.id} className="align-top text-xs">
                        <TableCell className="pt-4 font-mono text-[10px] text-muted-foreground">{idx + 1}</TableCell>
                        {somenteLeitura ? (
                          <>
                            <TableCell className="pt-4 text-xs font-medium text-foreground">{p.nome}</TableCell>
                            <TableCell className="pt-4 text-xs text-foreground/85">{p.requisitos}</TableCell>
                            <TableCell className="pt-4 text-xs text-foreground/85">{p.expectativas}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>
                              <Input
                                value={p.nome}
                                onChange={(e) => patch(p.id, "nome", e.target.value)}
                                className="h-8 rounded-md border-transparent bg-transparent px-2 text-xs font-medium hover:border-border focus-visible:border-brand"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                value={p.requisitos}
                                onChange={(e) => patch(p.id, "requisitos", e.target.value)}
                                placeholder="Requisito da parte interessada (o que ela exige)"
                                className="min-h-[54px] rounded-md border-transparent bg-transparent px-2 py-1 text-xs hover:border-border focus-visible:border-brand"
                              />
                            </TableCell>
                            <TableCell>
                              <Textarea
                                value={p.expectativas}
                                onChange={(e) => patch(p.id, "expectativas", e.target.value)}
                                placeholder="Expectativa — a forma como a necessidade será atendida"
                                className="min-h-[54px] rounded-md border-transparent bg-transparent px-2 py-1 text-xs hover:border-border focus-visible:border-brand"
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell className="pt-4 text-[11px] text-muted-foreground">{fmt(p.ultimaRevisao)}</TableCell>
                        {!somenteLeitura && (
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
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            {/* Histórico de versões */}
            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-1.5 text-brand">
                  <History className="h-4 w-4" />
                  <h2 className="text-sm font-semibold text-foreground">Histórico de versões</h2>
                </div>
                {versoes.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    Nenhuma versão formalizada ainda. Ao formalizar, o documento é fechado e datado.
                  </p>
                ) : (
                  <ol className="space-y-1.5">
                    {[...versoes].reverse().map((v) => (
                      <li key={v.id}>
                        <button
                          onClick={() => setVerVersaoId(verVersaoId === v.id ? null : v.id)}
                          className={cn(
                            "w-full rounded-xl border p-2.5 text-left transition hover:border-brand/50",
                            verVersaoId === v.id ? "border-brand/50 bg-brand-soft/50" : "border-border/60 bg-card",
                          )}
                        >
                          <div className="text-xs font-semibold text-brand">{v.titulo}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {fmt(v.data)} · {v.partes.length} partes · por {v.autor}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Roadmap v2.0 */}
            <Card className="rounded-2xl border-dashed border-border/80 bg-muted/30 shadow-none">
              <CardContent className="p-4 opacity-70">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    Mapa de Influência e Interesse — disponível na v2.0
                  </h2>
                </div>
                <div className="pointer-events-none mt-3 grid grid-cols-2 gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-lg border border-border/60 bg-card/60" />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Priorização visual das partes interessadas por influência e interesse entrará em uma próxima versão do Jáwda.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Modal Nova */}
      <Dialog open={novaOpen} onOpenChange={setNovaOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nova parte interessada</DialogTitle>
            <DialogDescription>Registre o requisito e a expectativa correspondente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium">Nome da parte interessada</label>
              <Input value={nova.nome} onChange={(e) => setNova({ ...nova, nome: e.target.value })} className="mt-1 rounded-md" />
            </div>
            <div>
              <label className="text-xs font-medium">Descrição dos Requisitos</label>
              <Textarea
                value={nova.requisitos}
                onChange={(e) => setNova({ ...nova, requisitos: e.target.value })}
                placeholder="O que a parte interessada exige da organização"
                className="mt-1 rounded-md"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Descrição das Expectativas</label>
              <Textarea
                value={nova.expectativas}
                onChange={(e) => setNova({ ...nova, expectativas: e.target.value })}
                placeholder="A forma como a necessidade será atendida"
                className="mt-1 rounded-md"
              />
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
              Partes interessadas comuns ao segmento, com requisito e expectativa pré-preenchidos. Sugestão simulada de IA — revise antes de adicionar.
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
                    <div className="text-sm font-medium text-foreground">{s.nome}</div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{s.motivo}</p>
                    <div className="mt-1 grid gap-2 text-[11px] md:grid-cols-2">
                      <div><span className="font-medium text-foreground">Requisitos:</span> {s.requisitos}</div>
                      <div><span className="font-medium text-foreground">Expectativas:</span> {s.expectativas}</div>
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
