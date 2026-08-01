import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Circle, Plus, Shuffle, Users, Package, Scale, ThumbsUp, ThumbsDown, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "Em avaliação" | "Aprovada" | "Implementada" | "Rejeitada";

type ChecklistKey = "proposito" | "integridade" | "recursos" | "responsabilidades";

interface Mudanca {
  id: string;
  titulo: string;
  descricao: string;
  dataProposta: string;
  responsavel: string;
  status: Status;
  avaliada: boolean;
  checklist: Record<ChecklistKey, string>;
  justificativa?: string;
  dataImplementacao?: string;
  responsavelExecucao?: string;
}

const CHECKS: { key: ChecklistKey; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "proposito", label: "Propósito da mudança e consequências potenciais", hint: "Por que mudar e o que pode decorrer disso.", icon: Shuffle },
  { key: "integridade", label: "Integridade do sistema de gestão", hint: "A mudança afeta outros processos, documentos ou controles?", icon: Scale },
  { key: "recursos", label: "Disponibilidade de recursos necessários", hint: "Pessoas, orçamento, tempo e infraestrutura.", icon: Package },
  { key: "responsabilidades", label: "Alocação/realocação de responsabilidades e autoridades", hint: "Quem passa a responder pelo que após a mudança.", icon: Users },
];

const statusColor: Record<Status, string> = {
  "Em avaliação": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Aprovada: "bg-brand-soft text-brand border-brand/20",
  Implementada: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  Rejeitada: "bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
};

const seed: Mudanca[] = [
  {
    id: "m1",
    titulo: "Assessoria da qualidade passa a responder diretamente à obra",
    descricao: "Alteração de subordinação funcional da área da qualidade, aproximando-a da rotina operacional das frentes de obra.",
    dataProposta: "2026-07-18",
    responsavel: "Beatriz Souza",
    status: "Em avaliação",
    avaliada: false,
    checklist: {
      proposito: "Reduzir o tempo de resposta a não conformidades em campo, hoje em média 9 dias.",
      integridade: "Afeta o processo de auditoria interna — reporte funcional mantido com o Diretor para preservar independência.",
      recursos: "",
      responsabilidades: "",
    },
  },
  {
    id: "m2",
    titulo: "Nova estrutura de comitês do SGQ (mensal → quinzenal)",
    descricao: "Aumento da frequência das reuniões de análise crítica dos indicadores estratégicos.",
    dataProposta: "2026-06-02",
    responsavel: "Rafael Costa",
    status: "Implementada",
    avaliada: true,
    checklist: {
      proposito: "Acelerar decisões sobre desvios de indicadores; consequência é maior demanda de agenda da diretoria.",
      integridade: "Impacta somente o processo de análise crítica; documentos PR-SG-004 e PR-SG-009 revisados.",
      recursos: "Cerca de 4 h/mês adicionais da diretoria; sem custo incremental.",
      responsabilidades: "Secretaria do comitê transferida da Qualidade para o PMO.",
    },
    justificativa: "Aprovada em reunião de diretoria de 05/06/2026 — ganho de governança comprovado no piloto.",
    dataImplementacao: "2026-06-15",
    responsavelExecucao: "Rafael Costa",
  },
  {
    id: "m3",
    titulo: "Terceirização parcial do laboratório físico-químico",
    descricao: "Transferência de ensaios não críticos para laboratório homologado externo.",
    dataProposta: "2026-05-15",
    responsavel: "Fernanda Lima",
    status: "Aprovada",
    avaliada: true,
    checklist: {
      proposito: "Reduzir custo operacional em 18% e ampliar catálogo de ensaios; consequência é dependência de terceiro.",
      integridade: "Impacta controle de processos providos externamente e a qualificação de fornecedores.",
      recursos: "Contrato anual de R$ 240 mil; sem necessidade de novos equipamentos.",
      responsabilidades: "Gestão do contrato sob a Qualidade; liberação de laudos permanece com a supervisão técnica.",
    },
    justificativa: "Aprovada com condicionante de SLA contratual de 48 h para ensaios críticos.",
    dataImplementacao: "2026-08-01",
    responsavelExecucao: "Fernanda Lima",
  },
  {
    id: "m4",
    titulo: "Migração do sistema documental para nova plataforma",
    descricao: "Adoção de plataforma com controle de versão automático e workflow de aprovação eletrônica.",
    dataProposta: "2026-03-20",
    responsavel: "Ana Ribeiro",
    status: "Implementada",
    avaliada: true,
    checklist: {
      proposito: "Eliminar controle manual de revisões; consequência é curva de aprendizado dos usuários.",
      integridade: "Afeta todos os processos que usam documentos controlados — plano de migração assistida definido.",
      recursos: "Licenças, 120 h de configuração e treinamento de 220 usuários.",
      responsabilidades: "Administração da plataforma atribuída à Qualidade com apoio de TI.",
    },
    justificativa: "Aprovada pela diretoria em 25/03/2026.",
    dataImplementacao: "2026-04-30",
    responsavelExecucao: "Ana Ribeiro",
  },
  {
    id: "m5",
    titulo: "Unificação dos turnos de inspeção final",
    descricao: "Concentração da inspeção final em turno único com equipe ampliada.",
    dataProposta: "2026-04-08",
    responsavel: "Carlos Menezes",
    status: "Rejeitada",
    avaliada: true,
    checklist: {
      proposito: "Padronizar critérios de inspeção; consequência é acúmulo de fila entre turnos.",
      integridade: "Impacta expedição e produção — risco de atraso na liberação de lotes.",
      recursos: "Necessidade de 3 inspetores adicionais no turno remanescente.",
      responsabilidades: "Supervisão de inspeção concentrada em um único coordenador.",
    },
    justificativa: "Rejeitada: risco de atraso na liberação de lotes superou o ganho de padronização.",
  },
];

const vazio = { proposito: "", integridade: "", recursos: "", responsabilidades: "" };

export function MudancasSGPage() {
  const [items, setItems] = useState<Mudanca[]>(seed);
  const [openNova, setOpenNova] = useState(false);
  const [nova, setNova] = useState({ titulo: "", descricao: "", dataProposta: "", responsavel: "" });
  const [decisao, setDecisao] = useState<{ id: string; tipo: "Aprovar" | "Rejeitar" } | null>(null);
  const [form, setForm] = useState({ justificativa: "", dataImplementacao: "", responsavelExecucao: "" });

  const resumo = useMemo(() => ({
    total: items.length,
    emAvaliacao: items.filter((m) => m.status === "Em avaliação").length,
    aprovadas: items.filter((m) => m.status === "Aprovada").length,
    implementadas: items.filter((m) => m.status === "Implementada").length,
  }), [items]);

  const atualizarChecklist = (id: string, key: ChecklistKey, valor: string) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, checklist: { ...m.checklist, [key]: valor } } : m)));
  };

  const completo = (m: Mudanca) => CHECKS.every((c) => m.checklist[c.key].trim().length > 0);

  const marcarAvaliada = (m: Mudanca) => {
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, avaliada: true } : x)));
    toast.success(`${m.titulo.slice(0, 40)}… avaliada`, { description: "Registre agora a decisão final." });
  };

  const salvarNova = () => {
    if (!nova.titulo.trim()) return;
    const m: Mudanca = {
      id: `m-${Date.now()}`,
      titulo: nova.titulo,
      descricao: nova.descricao,
      dataProposta: nova.dataProposta || new Date().toISOString().slice(0, 10),
      responsavel: nova.responsavel || "Ana Ribeiro",
      status: "Em avaliação",
      avaliada: false,
      checklist: { ...vazio },
    };
    setItems([m, ...items]);
    setOpenNova(false);
    setNova({ titulo: "", descricao: "", dataProposta: "", responsavel: "" });
    toast.success("Mudança registrada", { description: "Preencha os 4 itens de avaliação para avançar o status." });
  };

  const confirmarDecisao = () => {
    if (!decisao) return;
    const aprovar = decisao.tipo === "Aprovar";
    if (!form.justificativa.trim()) {
      toast.error("Justificativa obrigatória para registrar a decisão.");
      return;
    }
    setItems((prev) =>
      prev.map((m) =>
        m.id === decisao.id
          ? {
              ...m,
              status: aprovar ? "Aprovada" : "Rejeitada",
              justificativa: form.justificativa,
              dataImplementacao: aprovar ? form.dataImplementacao : undefined,
              responsavelExecucao: aprovar ? form.responsavelExecucao : undefined,
            }
          : m,
      ),
    );
    toast.success(aprovar ? "Mudança aprovada" : "Mudança rejeitada");
    setDecisao(null);
    setForm({ justificativa: "", dataImplementacao: "", responsavelExecucao: "" });
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="mx-auto max-w-[1100px] space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mudanças no Sistema de Gestão</h1>
              <p className="mt-1 text-sm text-muted-foreground">Requisito 6.3 da ISO 9001 — controle de mudanças planejadas.</p>
            </div>
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setOpenNova(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Nova mudança
            </Button>
          </header>

          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: resumo.total },
              { label: "Em avaliação", value: resumo.emAvaliacao },
              { label: "Aprovadas", value: resumo.aprovadas },
              { label: "Implementadas", value: resumo.implementadas },
            ].map((k) => (
              <Card key={k.label} className="rounded-xl border-border/80 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{k.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            {items.map((m) => {
              const preenchidos = CHECKS.filter((c) => m.checklist[c.key].trim()).length;
              const podeAvaliar = completo(m);
              return (
                <Card key={m.id} className="rounded-2xl border-border/80 shadow-sm">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Proposta em {new Date(m.dataProposta).toLocaleDateString("pt-BR")} · {m.responsavel}
                        </div>
                        <h3 className="mt-0.5 text-base font-semibold text-foreground">{m.titulo}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/80">{m.descricao}</p>
                      </div>
                      <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[m.status])}>{m.status}</Badge>
                    </div>

                    <div className="rounded-lg border border-border/60 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Checklist de avaliação (6.3 a–d)
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{preenchidos}/4</span>
                      </div>
                      <div className="grid gap-2.5 md:grid-cols-2">
                        {CHECKS.map((c) => {
                          const valor = m.checklist[c.key];
                          const done = valor.trim().length > 0;
                          const Icon = c.icon;
                          const editavel = m.status === "Em avaliação" && !m.avaliada;
                          return (
                            <div
                              key={c.key}
                              className={cn(
                                "rounded-md border p-2.5",
                                done ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5" : "border-border bg-background",
                              )}
                            >
                              <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
                                <span className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                  done ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground",
                                )}>
                                  {done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                                </span>
                                <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                <span className="flex-1 leading-snug">{c.label}</span>
                              </div>
                              {editavel ? (
                                <Input
                                  value={valor}
                                  onChange={(e) => atualizarChecklist(m.id, c.key, e.target.value)}
                                  placeholder={c.hint}
                                  className="mt-2 h-8 rounded-md text-[11px]"
                                />
                              ) : (
                                <p className="mt-1.5 pl-7 text-[11px] leading-relaxed text-foreground/80">
                                  {valor || <span className="text-muted-foreground">Não registrado</span>}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {m.status === "Em avaliação" && !m.avaliada && (
                        <div className="mt-3 flex justify-end">
                          {podeAvaliar ? (
                            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => marcarAvaliada(m)}>
                              Marcar como Avaliada
                            </Button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                  <Button size="sm" disabled className="rounded-lg">Marcar como Avaliada</Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-[11px]">
                                Preencha os 4 itens de avaliação (propósito e consequências, integridade do sistema, recursos e responsabilidades) para habilitar este botão.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>

                    {m.avaliada && m.status === "Em avaliação" && (
                      <div className="rounded-lg border border-brand/25 bg-brand-soft/40 p-3">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand">Decisão final</div>
                        <p className="mb-2.5 text-[11px] text-foreground/80">Avaliação concluída. Registre a decisão com justificativa.</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-lg bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
                            onClick={() => { setDecisao({ id: m.id, tipo: "Aprovar" }); setForm({ justificativa: "", dataImplementacao: "", responsavelExecucao: m.responsavel }); }}
                          >
                            <ThumbsUp className="mr-1.5 h-3.5 w-3.5" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-[color:var(--severity-critical)]/40 text-[color:var(--severity-critical)]"
                            onClick={() => { setDecisao({ id: m.id, tipo: "Rejeitar" }); setForm({ justificativa: "", dataImplementacao: "", responsavelExecucao: "" }); }}
                          >
                            <ThumbsDown className="mr-1.5 h-3.5 w-3.5" /> Rejeitar
                          </Button>
                        </div>
                      </div>
                    )}

                    {m.justificativa && (
                      <div className="grid gap-2.5 md:grid-cols-2">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Justificativa da decisão</div>
                          <p className="mt-1 text-xs leading-relaxed text-foreground/85">{m.justificativa}</p>
                        </div>
                        {m.status !== "Rejeitada" && (
                          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                              <CalendarClock className="h-3 w-3" /> Implementação
                            </div>
                            <p className="mt-1 text-xs text-foreground/85">
                              {m.dataImplementacao ? new Date(m.dataImplementacao).toLocaleDateString("pt-BR") : "Data a definir"}
                              {" · "}
                              {m.responsavelExecucao ?? "Responsável a definir"}
                            </p>
                            {m.status === "Aprovada" && (
                              <Button
                                size="sm" variant="outline" className="mt-2 h-7 rounded-md text-[10px]"
                                onClick={() => {
                                  setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "Implementada" } : x)));
                                  toast.success("Mudança marcada como implementada");
                                }}
                              >
                                Marcar como Implementada
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nova mudança */}
        <Dialog open={openNova} onOpenChange={setOpenNova}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Nova mudança no Sistema de Gestão</DialogTitle>
              <DialogDescription>Após registrar, preencha os 4 itens de avaliação obrigatórios no card da mudança.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Título</label>
                <Input value={nova.titulo} onChange={(e) => setNova({ ...nova, titulo: e.target.value })} className="h-9 rounded-lg text-xs" placeholder="Ex.: Centralização do controle de calibração" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Descrição</label>
                <Textarea value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} rows={3} className="rounded-lg text-xs" placeholder="O que exatamente muda no sistema de gestão…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Data proposta</label>
                  <Input type="date" value={nova.dataProposta} onChange={(e) => setNova({ ...nova, dataProposta: e.target.value })} className="h-9 rounded-lg text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Responsável</label>
                  <Input value={nova.responsavel} onChange={(e) => setNova({ ...nova, responsavel: e.target.value })} className="h-9 rounded-lg text-xs" placeholder="Ex.: Ana Ribeiro" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-lg" onClick={() => setOpenNova(false)}>Cancelar</Button>
              <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" disabled={!nova.titulo.trim()} onClick={salvarNova}>Registrar mudança</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Decisão final */}
        <Dialog open={!!decisao} onOpenChange={(v) => !v && setDecisao(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>{decisao?.tipo === "Aprovar" ? "Aprovar mudança" : "Rejeitar mudança"}</DialogTitle>
              <DialogDescription>A justificativa é obrigatória e fica registrada no histórico da mudança.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Justificativa</label>
                <Textarea value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} rows={3} className="rounded-lg text-xs" placeholder="Fundamento técnico da decisão…" />
              </div>
              {decisao?.tipo === "Aprovar" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Data de implementação</label>
                    <Input type="date" value={form.dataImplementacao} onChange={(e) => setForm({ ...form, dataImplementacao: e.target.value })} className="h-9 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Responsável pela execução</label>
                    <Input value={form.responsavelExecucao} onChange={(e) => setForm({ ...form, responsavelExecucao: e.target.value })} className="h-9 rounded-lg text-xs" placeholder="Ex.: Rafael Costa" />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-lg" onClick={() => setDecisao(null)}>Cancelar</Button>
              <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={confirmarDecisao}>Registrar decisão</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AppShell>
  );
}
