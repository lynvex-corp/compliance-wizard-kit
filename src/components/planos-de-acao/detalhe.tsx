import { useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit3,
  FileDown,
  MoreVertical,
  MessageSquarePlus,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  BarChart3,
  History,
  Paperclip,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { format, formatDistanceToNowStrict, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mockPlanos,
  mockNCs,
  mockIndicadores,
  planoStatusClasses,
  pdcaClasses,
  planoBaseDate,
  type PDCA,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const PDCA_STEPS: PDCA[] = ["Plan", "Do", "Check", "Act"];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function PlanoDetailPage() {
  const { id } = useParams({ from: "/planos-de-acao/$id" });
  const plano = useMemo(() => mockPlanos.find((p) => p.id === id) ?? mockPlanos[0], [id]);

  const [comentario, setComentario] = useState("");
  const ncOrigem = plano.vinculadoLink ? mockNCs.find((n) => n.id === plano.vinculadoLink) : null;
  const indicadorImpactado = useMemo(
    () => mockIndicadores.find((i) => i.planosVinculados.includes(plano.id)) ?? mockIndicadores[0],
    [plano.id],
  );

  const inicio = new Date(plano.inicio);
  const prazo = new Date(plano.prazo);
  const hoje = new Date(planoBaseDate);
  const totalDias = Math.max(1, differenceInCalendarDays(prazo, inicio));
  const decorrido = Math.max(0, differenceInCalendarDays(hoje, inicio));
  const pctTempo = Math.min(100, Math.round((decorrido / totalDias) * 100));

  const custoRealizado = Math.round(plano.custo * (plano.percentual / 100) * 0.95);
  const delta = plano.custo - custoRealizado;
  const deltaPositivo = delta >= 0;

  const pdcaIdx = PDCA_STEPS.indexOf(plano.pdca);
  const reprovadoEficacia = plano.eficaciaAprovadaPrimeira === false;

  // Marcos mockados construídos a partir do array de datas
  const marcosLabels = [
    "Aprovação da tratativa",
    "Compra/insumo disponível",
    "Execução em campo",
    "Documentação atualizada",
    "Treinamento concluído",
  ];
  const marcos = plano.marcos.map((iso, i) => {
    const data = new Date(iso);
    const atrasado = data < hoje && plano.percentual < ((i + 1) / plano.marcos.length) * 100 - 10;
    const concluido = data < hoje && !atrasado;
    return {
      label: marcosLabels[i % marcosLabels.length],
      previsto: iso,
      real: concluido ? iso : null,
      status: concluido ? "Concluído" : atrasado ? "Atrasado" : "No prazo",
    };
  });

  const comentarios = [
    {
      autor: { nome: "Beatriz Souza", iniciais: "BS" },
      quando: format(new Date(inicio.getTime() + 86400_000), "dd/MM 'às' HH:mm", { locale: ptBR }),
      texto: "Plano aprovado. Já solicitei o insumo ao almoxarifado para acelerar o cronograma.",
    },
    {
      autor: { nome: "Carlos Mendes", iniciais: "CM" },
      quando: format(new Date(inicio.getTime() + 86400_000 * 3), "dd/MM 'às' HH:mm", { locale: ptBR }),
      texto: "Execução em campo iniciou hoje pela manhã. Estimo 2 dias para o primeiro checkpoint.",
    },
    {
      autor: { nome: "Fernanda Lima", iniciais: "FL" },
      quando: format(new Date(inicio.getTime() + 86400_000 * 5), "dd/MM 'às' HH:mm", { locale: ptBR }),
      texto: "Anexei foto do parâmetro antes/depois. Podemos considerar reduzir tolerância a 0,2%.",
    },
  ];

  const historico = [
    { evento: "Plano criado a partir da NC", usuario: "Ana Ribeiro", quando: format(inicio, "dd/MM/yyyy HH:mm", { locale: ptBR }) },
    { evento: "Responsável atribuído", usuario: "Beatriz Souza", quando: format(new Date(inicio.getTime() + 3600_000 * 2), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
    { evento: "Detalhamento da ação preenchido", usuario: plano.responsavel.nome, quando: format(new Date(inicio.getTime() + 86400_000), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
    { evento: `Status alterado para "${plano.status}"`, usuario: "Sistema", quando: format(new Date(inicio.getTime() + 86400_000 * 2), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
    { evento: "Comentário adicionado", usuario: "Fernanda Lima", quando: format(new Date(inicio.getTime() + 86400_000 * 5), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
  ];

  const evidenciasEficacia = [
    { name: "reinspecao-parametros.pdf", kind: "file" as const },
    { name: "grafico-controle.png", kind: "image" as const },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1300px] space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
              <Link to="/planos-de-acao">
                <ArrowLeft className="h-4 w-4" /> Voltar para lista
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-base font-semibold text-brand">{plano.codigo}</span>
              <Badge variant="outline" className={cn("rounded-md border text-xs", planoStatusClasses[plano.status].badge)}>
                {plano.status}
              </Badge>
              {ncOrigem && (
                <Link
                  to="/nao-conformidades/$id"
                  params={{ id: ncOrigem.id }}
                  className="inline-flex items-center gap-1 rounded-md border border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 px-2 py-0.5 text-xs text-[color:var(--severity-critical)] hover:bg-[color:var(--severity-critical)]/20"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Originado de {ncOrigem.codigo}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
              {!ncOrigem && plano.vinculadoCodigo && (
                <Badge variant="outline" className="rounded-md border-border text-xs text-muted-foreground">
                  Originado de {plano.vinculadoCodigo}
                </Badge>
              )}
            </div>
            <p className="max-w-3xl text-sm text-foreground/80">{plano.descricao}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5 rounded-lg">
              <Edit3 className="h-4 w-4" /> Editar
            </Button>
            <Button variant="outline" className="gap-1.5 rounded-lg">
              <FileDown className="h-4 w-4" /> Exportar PDF
            </Button>
            <Button className="gap-1.5 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90">
              <MessageSquarePlus className="h-4 w-4" /> Comentar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicar plano</DropdownMenuItem>
                <DropdownMenuItem>Reatribuir responsável</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[color:var(--severity-critical)]">Cancelar plano</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* PDCA Indicator */}
        <Card className="rounded-xl border-border/80 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Ciclo PDCA</h3>
              <span className="text-xs text-muted-foreground">Fase atual: <span className="font-medium text-brand">{plano.pdca}</span></span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PDCA_STEPS.map((step, i) => {
                const done = i < pdcaIdx;
                const current = i === pdcaIdx;
                return (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      done && "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]",
                      current && "border-brand bg-brand text-brand-foreground shadow-sm",
                      !done && !current && "border-border bg-muted/40 text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                        done && "bg-[color:var(--success)] text-white",
                        current && "bg-white/20 text-brand-foreground",
                        !done && !current && "bg-muted text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="font-semibold">{step}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {reprovadoEficacia && (
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--severity-critical)]" />
            <div className="text-sm text-foreground/80">
              <span className="font-semibold text-[color:var(--severity-critical)]">Plano reaberto:</span>{" "}
              este plano foi reprovado na 1ª avaliação de eficácia em {format(new Date(prazo.getTime() + 86400_000 * 5), "dd/MM/yyyy", { locale: ptBR })}.
              <button className="ml-1 underline underline-offset-2 hover:text-brand">Ver histórico da tentativa anterior</button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Coluna principal */}
          <div className="space-y-6">
            {/* Contenção Imediata */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Contenção Imediata</h2>
                  <Badge variant="outline" className="rounded-md border-border text-[10px] text-muted-foreground">Herdado da NC</Badge>
                </div>
                <p className="text-sm text-foreground/80">
                  Segregação imediata do lote 4821 (127 unidades) e bloqueio da envasadora ENV-02 até nova conferência de setup. Amostragem 100% no lote subsequente até liberação.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-brand-soft text-[9px] font-semibold text-brand">DA</AvatarFallback>
                    </Avatar>
                    Diego Almeida
                  </div>
                  <span>· Executada em {format(inicio, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>

            {/* 5W2H */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Ação Corretiva — Detalhamento da Ação</h2>
                  <p className="text-xs text-muted-foreground">Ficha técnica da ação planejada</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FiveW label="O quê" en="descrição da ação" value={plano.descricao} />
                  <FiveW
                    label="Por quê"
                    en="justificativa"
                    value={
                      <>
                        Causa raiz identificada na NC de origem:{" "}
                        {ncOrigem ? (
                          <Link to="/nao-conformidades/$id" params={{ id: ncOrigem.id }} className="text-brand underline underline-offset-2">
                            "Falha no processo de gestão de setup e conferência da envasadora"
                          </Link>
                        ) : (
                          "Falha sistemática de processo"
                        )}
                      </>
                    }
                  />
                  <FiveW label="Onde" en="local de aplicação" value="Linha de envase 02 — Setor de Produção" />
                  <FiveW label="Quem" en="responsável" value={`${plano.responsavel.nome} (${plano.responsavel.departamento})`} />
                  <FiveW label="Quando" en="prazo" value={`${format(inicio, "dd/MM/yyyy", { locale: ptBR })} → ${format(prazo, "dd/MM/yyyy", { locale: ptBR })}`} />
                  <FiveW label="Como" en="método de execução" value="Revisão do POP-ENV-02, calibração dos sensores de peso e retreinamento dos operadores dos 3 turnos." />
                  <FiveW label="Quanto custa" en="custo estimado" value={formatBRL(plano.custo)} className="sm:col-span-2" />
                </div>
                <Separator />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado esperado</div>
                  <p className="mt-1 text-sm text-foreground/80">
                    Redução da variação de peso para ≤ 0,3% e eliminação de reincidência nos próximos 60 dias, com aprovação na 1ª avaliação de eficácia.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Marcos */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Marcos de Execução</h2>
                    <p className="text-xs text-muted-foreground">Checkpoints do plano com burndown</p>
                  </div>
                  <span className="text-xs font-medium text-foreground">{plano.percentual}% concluído</span>
                </div>
                {/* Mini burndown (barra) */}
                <div className="space-y-1.5">
                  <Progress value={plano.percentual} className="h-2 bg-muted [&>div]:bg-brand" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{format(inicio, "dd/MM", { locale: ptBR })}</span>
                    <span>Hoje ({format(hoje, "dd/MM", { locale: ptBR })})</span>
                    <span>{format(prazo, "dd/MM", { locale: ptBR })}</span>
                  </div>
                </div>
                <div className="divide-y divide-border/60 rounded-lg border border-border/60">
                  {marcos.map((m, i) => {
                    const cor =
                      m.status === "Concluído"
                        ? "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30"
                        : m.status === "Atrasado"
                          ? "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30"
                          : "bg-brand-soft text-brand border-brand/20";
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", cor)}>
                            {i + 1}
                          </span>
                          <span className="font-medium">{m.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Previsto: <span className="text-foreground">{format(new Date(m.previsto), "dd/MM/yyyy", { locale: ptBR })}</span></span>
                          <span>Real: <span className="text-foreground">{m.real ? format(new Date(m.real), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span></span>
                          <Badge variant="outline" className={cn("rounded-md border text-[10px]", cor)}>{m.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Eficácia */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Verificação de Eficácia</h2>
                  <p className="text-xs text-muted-foreground">Resultado da avaliação pós-implementação</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Método de avaliação" value="Observação em campo + reinspeção" />
                  <Info label="Avaliador" value="Fernanda Lima" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado</div>
                  {plano.eficaciaAprovadaPrimeira === true && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--success)]">
                      <Check className="h-4 w-4" /> Aprovado — ação eficaz confirmada
                    </div>
                  )}
                  {plano.eficaciaAprovadaPrimeira === false && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 px-4 py-2.5 text-sm font-semibold text-[color:var(--severity-critical)]">
                      <AlertTriangle className="h-4 w-4" /> Reprovado — necessária nova iteração
                    </div>
                  )}
                  {plano.eficaciaAprovadaPrimeira === null && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/20 px-4 py-2.5 text-sm font-semibold text-[color:var(--severity-high)]">
                      <CalendarClock className="h-4 w-4" /> Aguardando avaliação
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidências anexadas</div>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {evidenciasEficacia.map((ev, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border/70 bg-muted">
                        {ev.kind === "image" ? (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-soft to-brand/20 text-brand">
                            <ImageIcon className="h-7 w-7" />
                          </div>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-muted-foreground">
                            <FileText className="h-6 w-6" />
                            <span className="line-clamp-2 text-center text-[9px]">{ev.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Comentários e Colaboração</h2>
                  <p className="text-xs text-muted-foreground">Discussão da equipe sobre o andamento</p>
                </div>
                <div className="space-y-4">
                  {comentarios.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-soft text-[11px] font-semibold text-brand">{c.autor.iniciais}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-lg border border-border/60 bg-muted/30 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{c.autor.nome}</span>
                          <span className="text-[10px] text-muted-foreground">{c.quando}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{c.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 border-t border-border/60 pt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-brand text-brand-foreground text-[11px] font-semibold">AR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Adicionar comentário para a equipe…"
                      className="min-h-[70px] resize-none rounded-lg"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" className="rounded-lg bg-brand text-brand-foreground hover:bg-brand/90" disabled={!comentario.trim()}>
                        Publicar comentário
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <h3 className="text-sm font-semibold text-foreground">Resumo</h3>
                <dl className="space-y-3 text-xs">
                  <InfoRow label="Origem" value={plano.origemTipo} />
                  <InfoRow label="Categoria" value="Qualidade" />
                  <InfoRow label="Departamento" value={plano.responsavel.departamento} />
                  <InfoRow label="Requisito normativo" value="ISO 9001:2015 — 10.2" />
                  <div>
                    <dt className="text-muted-foreground">Responsável</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-brand-soft text-[10px] font-semibold text-brand">
                          {plano.responsavel.iniciais}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{plano.responsavel.nome}</span>
                    </dd>
                  </div>
                </dl>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prazo</span>
                    <span className="font-medium text-foreground">{format(prazo, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        plano.status === "Atrasado" ? "bg-[color:var(--severity-critical)]" : pctTempo > 80 ? "bg-[color:var(--warning)]" : "bg-brand",
                      )}
                      style={{ width: `${pctTempo}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {pctTempo}% do tempo decorrido ·{" "}
                    {prazo > hoje
                      ? `vence em ${formatDistanceToNowStrict(prazo, { locale: ptBR })}`
                      : `vencido há ${formatDistanceToNowStrict(prazo, { locale: ptBR })}`}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" /> Custo
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border/60 p-2.5">
                      <div className="text-[10px] text-muted-foreground">Estimado</div>
                      <div className="mt-0.5 text-sm font-semibold text-foreground">{formatBRL(plano.custo)}</div>
                    </div>
                    <div className="rounded-lg border border-border/60 p-2.5">
                      <div className="text-[10px] text-muted-foreground">Realizado</div>
                      <div className="mt-0.5 text-sm font-semibold text-foreground">{formatBRL(custoRealizado)}</div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-1 text-[11px] font-medium",
                      deltaPositivo ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]",
                    )}
                  >
                    {deltaPositivo ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {deltaPositivo ? "Economia" : "Estouro"} de {formatBRL(Math.abs(delta))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Módulos relacionados */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-2 p-5">
                <h3 className="text-sm font-semibold text-foreground">Módulos relacionados</h3>
                {ncOrigem && (
                  <Link
                    to="/nao-conformidades/$id"
                    params={{ id: ncOrigem.id }}
                    className="flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">Não Conformidade</div>
                        <div className="text-[10px] text-muted-foreground">{ncOrigem.codigo}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
                <ModuleLink
                  icon={ClipboardCheck}
                  title="Auditoria relacionada"
                  subtitle="AUD-2026-004 · Interna Q2"
                  color="brand"
                />
                <ModuleLink
                  icon={ShieldAlert}
                  title="Risco impactado"
                  subtitle="R-018 · Vazamento de utilidades"
                  color="high"
                />
                <Link
                  to="/indicadores"
                  className="flex items-center justify-between rounded-lg border border-border/70 p-2.5 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">Indicador impactado</div>
                      <div className="text-[10px] text-muted-foreground">{indicadorImpactado.codigo} · {indicadorImpactado.nome}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card className="rounded-xl border-border/80 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
                </div>
                <div className="space-y-2.5">
                  {historico.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                      <div className="flex-1">
                        <div className="text-foreground">{h.evento}</div>
                        <div className="text-[10px] text-muted-foreground">{h.usuario} · {h.quando}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-brand/20 bg-brand-soft/30 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" />
                  <span className="text-xs font-semibold text-brand">Insight da IA</span>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  Planos similares (envase/setup) tiveram, em média, 87% de eficácia. Sugerimos incluir teste piloto de 48h antes do encerramento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FiveW({
  label,
  en,
  value,
  className,
}: {
  label: string;
  en: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-muted/30 p-3", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">{label}</span>
        <span className="text-[10px] text-muted-foreground">{en}</span>
      </div>
      <div className="mt-1 text-sm text-foreground/90">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ModuleLink({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: typeof AlertTriangle;
  title: string;
  subtitle: string;
  color: "brand" | "high" | "critical" | "success";
}) {
  const colorMap = {
    brand: "bg-brand-soft text-brand",
    high: "bg-[color:var(--severity-high)]/10 text-[color:var(--severity-high)]",
    critical: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]",
    success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
  } as const;
  return (
    <button className="flex w-full items-center justify-between rounded-lg border border-border/70 p-2.5 text-left transition-colors hover:border-brand/40 hover:bg-brand-soft/30">
      <div className="flex items-center gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", colorMap[color])}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-foreground">{title}</div>
          <div className="text-[10px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}