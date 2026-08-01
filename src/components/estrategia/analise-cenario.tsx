import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles, Plus, Link2, GripVertical, Pencil, Wand2, Lock, LockOpen,
  Archive, AlertTriangle, ExternalLink, ClipboardList, X, FileCheck2, History, Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useJawda, SWOT_CATEGORIAS, type SwotItem, type SwotCategoria } from "@/lib/jawda-store";

type Quadrant = "F" | "W" | "O" | "T";
type Slot = Quadrant | "N";
type Cruzamento = "FT" | "WO" | "FO" | "WT";

const quadrantMeta: Record<Quadrant, { label: string; sub: string; ring: string; head: string; chip: string }> = {
  F: { label: "Forças", sub: "Internas · Positivas", ring: "border-[color:var(--success)]/40", head: "bg-[color:var(--success)]/10 text-[color:var(--success)]", chip: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30" },
  W: { label: "Fraquezas", sub: "Internas · Negativas", ring: "border-[color:var(--warning)]/50", head: "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]", chip: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40" },
  O: { label: "Oportunidades", sub: "Externas · Positivas", ring: "border-brand/30", head: "bg-brand-soft text-brand", chip: "bg-brand-soft text-brand border-brand/20" },
  T: { label: "Ameaças", sub: "Externas · Negativas", ring: "border-[color:var(--severity-critical)]/40", head: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]", chip: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30" },
};

const QUADRANTES: Quadrant[] = ["F", "W", "O", "T"];

interface IARec {
  id: string;
  titulo: string;
  descricao: string;
  origem: string;
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

const CONTEXTO_INTERNO_INICIAL =
  "Estrutura matricial com 340 colaboradores, cultura orientada à segurança e forte governança fiscal. Sistema de gestão certificado desde 2011, com desempenho estável nos processos de produção e histórico de conhecimento técnico concentrado em especialistas seniores.";
const CONTEXTO_EXTERNO_INICIAL =
  "Mercado nacional em consolidação, pressão regulatória crescente (ANVISA/MAPA), instabilidade cambial afetando insumos importados e aceleração de exigências ESG por clientes corporativos, além de avanço tecnológico em automação de linhas de envase.";

const SUGESTAO_INTERNA =
  "Valores e cultura: segurança e conformidade como princípios declarados, com liderança acessível no chão de fábrica. Conhecimento organizacional: know-how técnico concentrado em 12 especialistas, sem trilha formal de sucessão. Desempenho dos processos: OEE médio de 78% e índice de retrabalho de 2,4%. Desempenho da organização: crescimento de 11% em receita no último exercício, com margem pressionada por custo de insumos.";
const SUGESTAO_EXTERNA =
  "Mercado: concorrência regional com política agressiva de preço e clientes exigindo auditoria de segunda parte. Tecnologia: adoção crescente de rastreabilidade digital e automação de inspeção. Cultura e social: maior exigência da sociedade por práticas ambientais e trabalhistas. Economia: câmbio volátil e crédito com custo elevado no cenário nacional; demanda internacional aquecida em alimentos processados.";

interface VersaoSnapshotCard {
  texto: string;
  quadrante: Quadrant;
  categoria?: SwotCategoria;
  origemNC?: string;
}

interface Versao {
  id: string;
  numero: number;
  titulo: string;
  data: string; // yyyy-mm-dd
  autor: string;
  contextoInterno: string;
  contextoExterno: string;
  cards: VersaoSnapshotCard[];
}

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};
const hojeISO = () => new Date().toISOString().slice(0, 10);
const rotuloVersao = (n: number) => `Análise de Contexto_${String(n).padStart(2, "0")}.2026`;

export function AnaliseCenarioPage() {
  const {
    swotItens, addSwotItem, updateSwotItem, removeSwotItem, moveSwotItem, usuario,
    naoConformidades,
  } = useJawda();
  const navigate = useNavigate();

  const [contextoInterno, setContextoInterno] = useState(CONTEXTO_INTERNO_INICIAL);
  const [contextoExterno, setContextoExterno] = useState(CONTEXTO_EXTERNO_INICIAL);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [fechada, setFechada] = useState(false);
  const [verVersaoId, setVerVersaoId] = useState<string | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Slot | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [formText, setFormText] = useState("");
  const [formCat, setFormCat] = useState<SwotCategoria>("Operacional");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiRecs, setAiRecs] = useState<IARec[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [cruz, setCruz] = useState<Cruzamento>("FT");
  const [sugerindo, setSugerindo] = useState<"interno" | "externo" | null>(null);

  const somenteLeitura = fechada || verVersaoId !== null;
  const ativos = useMemo(() => swotItens.filter((s) => !s.arquivado), [swotItens]);
  const naoClassificados = useMemo(() => ativos.filter((s) => s.quadrante === "N"), [ativos]);
  const ncIdPorCodigo = useMemo(
    () => new Map(naoConformidades.map((n) => [n.codigo, n.id])),
    [naoConformidades],
  );
  const versaoVista = versoes.find((v) => v.id === verVersaoId) ?? null;

  const onDrop = (slot: Slot) => {
    setDragOver(null);
    if (!dragId || somenteLeitura) return;
    moveSwotItem(dragId, slot);
    toast.success(slot === "N" ? "Card devolvido para “Cards a classificar”" : `Card classificado em ${quadrantMeta[slot].label}`);
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
    } else {
      addSwotItem({ quadrante: "N", texto, categoria: formCat });
      toast.success("Card criado em “Cards a classificar”", { description: "Arraste-o para o quadrante correspondente." });
    }
    setEditingId(null);
    setNovoOpen(false);
    setFormText("");
  };

  const sugerirContexto = (tipo: "interno" | "externo") => {
    setSugerindo(tipo);
    setTimeout(() => {
      if (tipo === "interno") setContextoInterno(SUGESTAO_INTERNA);
      else setContextoExterno(SUGESTAO_EXTERNA);
      setSugerindo(null);
      toast.success("Sugestão de IA aplicada", { description: "Sugestão simulada — revise e ajuste ao contexto real." });
    }, 900);
  };

  const formalizar = () => {
    if (!contextoInterno.trim() || !contextoExterno.trim()) {
      toast.error("Preencha o Contexto Interno e o Contexto Externo antes de formalizar");
      return;
    }
    if (naoClassificados.length > 0) {
      toast.error(`${naoClassificados.length} card(s) ainda em “Cards a classificar”`, {
        description: "Arraste todos para um quadrante antes de fechar a versão.",
      });
      return;
    }
    const vazio = QUADRANTES.find((q) => !ativos.some((s) => s.quadrante === q));
    if (vazio) {
      toast.error(`Nenhum card em ${quadrantMeta[vazio].label}`, { description: "Todos os quadrantes precisam de ao menos um card." });
      return;
    }
    const numero = (versoes[versoes.length - 1]?.numero ?? 0) + 1;
    const nova: Versao = {
      id: `ver-${numero}`,
      numero,
      titulo: rotuloVersao(numero),
      data: hojeISO(),
      autor: usuario.nome,
      contextoInterno,
      contextoExterno,
      cards: ativos
        .filter((s): s is SwotItem & { quadrante: Quadrant } => s.quadrante !== "N")
        .map((s) => ({ texto: s.texto, quadrante: s.quadrante, categoria: s.categoria, origemNC: s.origemNC })),
    };
    setVersoes((prev) => [...prev, nova]);
    setFechada(true);
    setVerVersaoId(null);
    toast.success(`${nova.titulo} formalizada`, { description: "Documento fechado — campos em modo somente leitura." });
  };

  const novaVersao = () => {
    setFechada(false);
    setVerVersaoId(null);
    toast.success("Nova versão aberta para edição", {
      description: "Cópia editável da última versão fechada — atualize contexto e quadrantes.",
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
        recs.push({ id: `${tipo}-${i}`, titulo, descricao, origem: meta.label });
      }
      setAiRecs(recs);
      setAiLoading(false);
    }, 900);
  };

  const abrirEdicao = (it: SwotItem) => {
    setEditingId(it.id);
    setFormText(it.texto);
    setFormCat(it.categoria ?? "Operacional");
  };

  const renderCard = (it: SwotItem, contexto: Slot) => {
    const ncId = it.origemNC ? ncIdPorCodigo.get(it.origemNC) : undefined;
    const showAction = contexto === "W" || contexto === "T";
    return (
      <div
        key={it.id}
        draggable={!somenteLeitura}
        onDragStart={() => setDragId(it.id)}
        onDragEnd={() => setDragId(null)}
        className={cn(
          "group rounded-xl border bg-card p-3 shadow-sm transition hover:border-brand/40 hover:shadow-md",
          it.origemNC ? "border-dashed border-brand/50 bg-brand-soft/20" : "border-border/70",
          somenteLeitura ? "opacity-90" : "cursor-grab active:cursor-grabbing",
          dragId === it.id && "opacity-50",
        )}
      >
        <div className="flex items-start gap-2">
          {!somenteLeitura && <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">{it.texto}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {it.categoria && <Badge variant="outline" className={categoriaChip}>{it.categoria}</Badge>}
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
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {it.criadoEm ? fmt(it.criadoEm.slice(0, 10)) : "—"}
              {it.autor ? ` · ${it.autor}` : ""}
            </div>
            {!somenteLeitura && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {it.planoVinculado ? (
                  <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                    <Link2 className="mr-1 h-3 w-3" /> {it.planoVinculado}
                  </Badge>
                ) : showAction ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => gerarPlano(it.origemNC ?? `SWOT-${it.quadrante}`, `Tratar ${contexto === "W" ? "fraqueza" : "ameaça"}: ${it.texto}`)}
                    className="h-7 rounded-md px-2 text-[11px] text-brand hover:bg-brand-soft"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Gerar Plano de Ação
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => abrirEdicao(it)} className="ml-auto h-7 w-7 rounded-md p-0 opacity-0 group-hover:opacity-100">
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { removeSwotItem(it.id); toast.success("Card arquivado"); }}
                  className="h-7 w-7 rounded-md p-0 text-[color:var(--severity-critical)] opacity-0 group-hover:opacity-100"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Cenário</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Documento formal versionado: preencha o contexto, classifique os cards nos quadrantes e formalize — a versão fechada não é mais editada.
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
            <Button size="sm" variant="outline" onClick={() => rodarIA("FT")} className="rounded-lg">
              <Sparkles className="mr-1.5 h-4 w-4" /> Analisar SWOT com IA
            </Button>
            {fechada && !versaoVista ? (
              <Button size="sm" onClick={novaVersao} className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <LockOpen className="mr-1.5 h-4 w-4" /> Nova versão
              </Button>
            ) : versaoVista ? (
              <Button size="sm" variant="outline" onClick={() => setVerVersaoId(null)} className="rounded-lg">
                <X className="mr-1.5 h-4 w-4" /> Sair do histórico
              </Button>
            ) : (
              <Button size="sm" onClick={formalizar} className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <FileCheck2 className="mr-1.5 h-4 w-4" /> Formalizar Análise de Cenário
              </Button>
            )}
          </div>
        </header>

        {somenteLeitura && (
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-brand" />
            {versaoVista
              ? `Snapshot de ${versaoVista.titulo}, fechado em ${fmt(versaoVista.data)} por ${versaoVista.autor}.`
              : "Documento formalizado — abra uma nova versão para atualizar o contexto e os quadrantes."}
          </div>
        )}

        {/* Contexto interno e externo */}
        <div className="grid gap-4 md:grid-cols-2">
          {([
            { key: "interno" as const, titulo: "Contexto Interno", apoio: "Valores, cultura, conhecimento, desempenho dos processos e da organização.", valor: versaoVista?.contextoInterno ?? contextoInterno, set: setContextoInterno },
            { key: "externo" as const, titulo: "Contexto Externo", apoio: "Mercado, tecnologia, cultura, social e economia — nos âmbitos nacional, regional e internacional.", valor: versaoVista?.contextoExterno ?? contextoExterno, set: setContextoExterno },
          ]).map((c) => (
            <Card key={c.key} className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{c.titulo}</h2>
                    <p className="text-[11px] text-muted-foreground">{c.apoio}</p>
                  </div>
                  {!somenteLeitura && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sugerindo === c.key}
                      onClick={() => sugerirContexto(c.key)}
                      className="h-7 rounded-md text-[11px] text-brand"
                    >
                      {sugerindo === c.key ? (
                        <><span className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent" /> Gerando…</>
                      ) : (
                        <><Sparkles className="mr-1.5 h-3 w-3" /> Sugerir com IA</>
                      )}
                    </Button>
                  )}
                </div>
                {somenteLeitura ? (
                  <p className="whitespace-pre-line rounded-lg border border-border/60 bg-muted/25 p-3 text-xs leading-relaxed text-foreground/85">
                    {c.valor}
                  </p>
                ) : (
                  <Textarea
                    value={c.valor}
                    onChange={(e) => c.set(e.target.value)}
                    className="min-h-[130px] rounded-lg text-xs leading-relaxed"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Área neutra + SWOT */}
        {!versaoVista && (
          <Card
            onDragOver={(e) => { e.preventDefault(); setDragOver("N"); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => onDrop("N")}
            className={cn(
              "rounded-2xl border-2 border-dashed shadow-sm transition",
              dragOver === "N" ? "border-brand bg-brand-soft/40" : "border-border/70",
            )}
          >
            <CardContent className="p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-brand" />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Cards a classificar</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Todo card nasce aqui — arraste para Forças, Fraquezas, Oportunidades ou Ameaças.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-md text-[10px]">{naoClassificados.length}</Badge>
                </div>
                {!somenteLeitura && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setNovoOpen(true); setFormText(""); setFormCat("Operacional"); }}
                    className="h-7 rounded-md text-[11px]"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Novo card
                  </Button>
                )}
              </div>
              {naoClassificados.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">
                  Nenhum card pendente de classificação.
                </p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {naoClassificados.map((it) => renderCard(it, "N"))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {QUADRANTES.map((q) => {
              const meta = quadrantMeta[q];
              const list = versaoVista
                ? versaoVista.cards
                    .filter((c) => c.quadrante === q)
                    .map((c, i) => ({
                      id: `${versaoVista.id}-${q}-${i}`,
                      quadrante: q,
                      texto: c.texto,
                      categoria: c.categoria,
                      origemNC: c.origemNC,
                    }) as SwotItem)
                : ativos.filter((i) => i.quadrante === q);
              return (
                <div
                  key={q}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(q); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => onDrop(q)}
                  className={cn(
                    "flex min-h-[320px] flex-col rounded-2xl border-2 bg-card p-3 shadow-sm transition",
                    meta.ring,
                    dragOver === q && "ring-2 ring-brand/60",
                  )}
                >
                  <div className={cn("mb-3 flex items-center justify-between rounded-xl px-3 py-2", meta.head)}>
                    <div>
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-[10px] uppercase tracking-wide opacity-80">{meta.sub}</div>
                    </div>
                    <Badge variant="outline" className={cn("rounded-md border text-[10px]", meta.chip)}>{list.length}</Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {list.length === 0 && (
                      <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">
                        Arraste cards da área “Cards a classificar”.
                      </p>
                    )}
                    {list.map((it) => renderCard(it, q))}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="space-y-4">
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
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-brand">{v.titulo}</span>
                            <span className="text-[10px] text-muted-foreground">{fmt(v.data)}</span>
                          </div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {v.cards.length} cards · por {v.autor}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-1.5 text-brand">
                  <Wand2 className="h-4 w-4" />
                  <h2 className="text-sm font-semibold text-foreground">Análise cruzada</h2>
                </div>
                <p className="text-[11px] text-muted-foreground">Combine dois quadrantes e receba estratégias sugeridas.</p>
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

            <Card className="rounded-2xl border-border/80 bg-brand-soft/40 shadow-sm">
              <CardContent className="p-4 text-[11px] leading-relaxed text-foreground/80">
                <div className="mb-1 flex items-center gap-1.5 text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Dica</span>
                </div>
                Cards com borda pontilhada chegam automaticamente de Não Conformidades sinalizadas como fraqueza ou ameaça — eles entram em “Cards a classificar” e precisam ser arrastados.
              </CardContent>
            </Card>
          </aside>
        </div>

        <Separator />
        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          Esta análise alimenta automaticamente o Planejamento (em breve) e fica disponível para importação no Plano de Ação e na Análise Crítica.
        </p>
      </div>

      {/* Novo / editar card */}
      <Dialog
        open={novoOpen || editingId !== null}
        onOpenChange={(o) => { if (!o) { setNovoOpen(false); setEditingId(null); } }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar card" : "Novo card"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Descreva de forma clara e objetiva."
                : "O card entra em “Cards a classificar” e depois é arrastado para o quadrante correspondente."}
            </DialogDescription>
          </DialogHeader>
          <Textarea value={formText} onChange={(e) => setFormText(e.target.value)} className="min-h-[110px] rounded-lg text-sm" autoFocus />
          <Select value={formCat} onValueChange={(v) => setFormCat(v as SwotCategoria)}>
            <SelectTrigger className="rounded-lg text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {SWOT_CATEGORIAS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNovoOpen(false); setEditingId(null); }}>Cancelar</Button>
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
                  Sem combinações suficientes neste cruzamento. Classifique mais cards nos quadrantes envolvidos.
                </p>
              )}
              {aiRecs.map((r) => (
                <div key={r.id} className="rounded-xl border border-border/70 bg-brand-soft/30 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-brand">{r.origem}</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{r.titulo}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{r.descricao}</p>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={() => gerarPlano(`SWOT · ${r.origem}`, r.titulo)} className="rounded-md bg-brand text-white hover:bg-brand/90">
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
