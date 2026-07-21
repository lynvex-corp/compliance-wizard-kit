import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart, Truck, HardHat, Users, ShieldCheck, Server,
  ArrowRight, GitBranch, FileText, Gauge, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Proc = {
  id: string;
  nome: string;
  icon: React.ComponentType<{ className?: string }>;
  dono: string;
  entradas: string[];
  saidas: string[];
  indicador: { nome: string; valor: string; meta: string };
  etapas: string[];
  raci: Array<{ atividade: string; R: string; A: string; C: string; I: string }>;
};

const processos: Proc[] = [
  { id: "com", nome: "Comercial", icon: ShoppingCart, dono: "Carla Menezes", entradas: ["Demanda do cliente", "Edital de licitação"], saidas: ["Proposta aprovada", "Contrato assinado"], indicador: { nome: "Taxa de conversão", valor: "34%", meta: "≥30%" },
    etapas: ["Prospecção", "Análise crítica", "Proposta", "Negociação", "Contrato"],
    raci: [
      { atividade: "Análise crítica do pedido", R: "Comercial", A: "Ger. Comercial", C: "Qualidade", I: "Diretoria" },
      { atividade: "Elaboração da proposta", R: "Comercial", A: "Ger. Comercial", C: "Financeiro", I: "Cliente" },
      { atividade: "Assinatura do contrato", R: "Jurídico", A: "Diretoria", C: "Comercial", I: "Cliente" },
    ],
  },
  { id: "sup", nome: "Suprimentos", icon: Truck, dono: "Rafael Costa", entradas: ["Requisição de compra", "Especificações técnicas"], saidas: ["Pedido de compra", "MP recebida e liberada"], indicador: { nome: "OTIF fornecedores", valor: "91%", meta: "≥90%" },
    etapas: ["Requisição", "Cotação", "Qualificação", "Pedido", "Recebimento"],
    raci: [
      { atividade: "Qualificação de fornecedor", R: "Suprimentos", A: "Ger. Suprimentos", C: "Qualidade", I: "Diretoria" },
      { atividade: "Inspeção de recebimento", R: "Qualidade", A: "Ger. Qualidade", C: "Suprimentos", I: "Produção" },
    ],
  },
  { id: "pro", nome: "Produção / Obras", icon: HardHat, dono: "Diego Almeida", entradas: ["Ordem de produção", "MP liberada", "Projeto"], saidas: ["Produto/serviço conforme"], indicador: { nome: "Índice de conformidade", valor: "97,2%", meta: "≥98%" },
    etapas: ["Programação", "Preparação", "Execução", "Verificação", "Liberação"],
    raci: [
      { atividade: "Preparação de setup", R: "Operador", A: "Supervisor", C: "Manutenção", I: "Qualidade" },
      { atividade: "Liberação de etapa", R: "Qualidade", A: "Ger. Operações", C: "Produção", I: "Cliente" },
    ],
  },
  { id: "rh", nome: "Recursos Humanos", icon: Users, dono: "Beatriz Souza", entradas: ["Requisição de vaga", "Necessidade de capacitação"], saidas: ["Colaborador competente"], indicador: { nome: "Eficácia de treinamentos", valor: "88%", meta: "≥85%" },
    etapas: ["Recrutamento", "Integração", "Capacitação", "Avaliação", "Desligamento"],
    raci: [
      { atividade: "Definição de competências", R: "RH", A: "Diretoria", C: "Gerentes", I: "Colaboradores" },
      { atividade: "Avaliação de eficácia", R: "Gestor direto", A: "RH", C: "Qualidade", I: "Colaborador" },
    ],
  },
  { id: "qua", nome: "Qualidade / SGI", icon: ShieldCheck, dono: "Fernanda Lima", entradas: ["Requisitos ISO 9001", "Contexto e riscos"], saidas: ["SGI implantado e monitorado"], indicador: { nome: "Nível de conformidade SG", valor: "82%", meta: "≥90%" },
    etapas: ["Planejamento", "Documentação", "Implementação", "Auditoria", "Análise crítica"],
    raci: [
      { atividade: "Auditoria interna", R: "Auditor líder", A: "RD/Qualidade", C: "Áreas auditadas", I: "Diretoria" },
      { atividade: "Análise crítica pela direção", R: "RD", A: "Diretoria", C: "Gerentes", I: "Colaboradores" },
    ],
  },
  { id: "ti", nome: "Tecnologia da Informação", icon: Server, dono: "Marcos Vinícius", entradas: ["Requisitos de sistemas", "Chamados de suporte"], saidas: ["Sistemas disponíveis e seguros"], indicador: { nome: "Disponibilidade", valor: "99,7%", meta: "≥99%" },
    etapas: ["Demanda", "Análise", "Desenvolvimento", "Testes", "Publicação"],
    raci: [
      { atividade: "Backup e restauração", R: "TI", A: "Ger. TI", C: "Qualidade", I: "Diretoria" },
      { atividade: "Gestão de acessos", R: "TI", A: "Ger. TI", C: "RH", I: "Gestores" },
    ],
  },
];

const politica = {
  texto: "Fornecer produtos e serviços que atendam integralmente aos requisitos legais e às expectativas de nossos clientes, promovendo a melhoria contínua do sistema de gestão da qualidade e o desenvolvimento das pessoas.",
  revisao: "Rev. 04 · 12/03/2026",
};

export function ProcessosPage() {
  const [sel, setSel] = useState<Proc | null>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Processos e Fluxos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mapa de processos, interações e responsabilidades — requisito 4.4.</p>
        </header>

        <Card className="rounded-2xl border-brand/20 bg-brand-soft/40 shadow-sm">
          <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-brand">Política da Qualidade</h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-foreground/85">{politica.texto}</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-md border-brand/30 bg-white text-[11px] text-brand">{politica.revisao}</Badge>
          </CardContent>
        </Card>

        {sel ? (
          <ProcessoDetalhe proc={sel} onBack={() => setSel(null)} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processos.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.id} className="group rounded-2xl border-border/80 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{p.id.toUpperCase()}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{p.nome}</h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Dono: <span className="font-medium text-foreground/80">{p.dono}</span></p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="min-w-16 text-muted-foreground">Entradas</span>
                        <span className="truncate text-foreground/85">{p.entradas.join(" · ")}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="min-w-16 text-muted-foreground">Saídas</span>
                        <span className="truncate text-foreground/85">{p.saidas.join(" · ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-brand-soft/50 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-brand">
                        <Gauge className="h-3.5 w-3.5" /> {p.indicador.nome}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-brand">{p.indicador.valor}</div>
                        <div className="text-[9px] text-muted-foreground">Meta {p.indicador.meta}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSel(p)} className="w-full rounded-lg text-xs">
                      <GitBranch className="mr-1.5 h-3.5 w-3.5" /> Ver fluxo e RACI
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ProcessoDetalhe({ proc, onBack }: { proc: Proc; onBack: () => void }) {
  const Icon = proc.icon;
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="h-8 rounded-md text-xs text-muted-foreground">
        <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Voltar aos processos
      </Button>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{proc.nome}</h2>
              <p className="text-[11px] text-muted-foreground">Dono: <span className="font-medium text-foreground/80">{proc.dono}</span></p>
            </div>
          </div>

          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Fluxo do processo</div>
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-3">
            {proc.etapas.map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <div className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium shadow-sm",
                  i === 0 ? "border-brand/30 bg-brand-soft text-brand" :
                  i === proc.etapas.length - 1 ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]" :
                  "border-border bg-card text-foreground",
                )}>
                  {e}
                </div>
                {i < proc.etapas.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Matriz RACI</div>
              <div className="overflow-hidden rounded-xl border border-border/70">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      <TableHead>Atividade</TableHead>
                      <TableHead className="w-16 text-center">R</TableHead>
                      <TableHead className="w-16 text-center">A</TableHead>
                      <TableHead className="w-16 text-center">C</TableHead>
                      <TableHead className="w-16 text-center">I</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proc.raci.map((r) => (
                      <TableRow key={r.atividade} className="text-xs">
                        <TableCell className="text-foreground/85">{r.atividade}</TableCell>
                        <TableCell className="text-center text-[11px] text-foreground/85">{r.R}</TableCell>
                        <TableCell className="text-center text-[11px] text-foreground/85">{r.A}</TableCell>
                        <TableCell className="text-center text-[11px] text-foreground/85">{r.C}</TableCell>
                        <TableCell className="text-center text-[11px] text-foreground/85">{r.I}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                <span><b className="text-foreground">R</b> Responsável</span>
                <span><b className="text-foreground">A</b> Aprovador</span>
                <span><b className="text-foreground">C</b> Consultado</span>
                <span><b className="text-foreground">I</b> Informado</span>
              </div>
            </div>

            <div className="space-y-3">
              <Card className="rounded-xl border-border/70 bg-muted/30 shadow-none">
                <CardContent className="space-y-2 p-4 text-xs">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Entradas</div>
                  {proc.entradas.map((e) => <div key={e} className="text-foreground/85">• {e}</div>)}
                  <div className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Saídas</div>
                  {proc.saidas.map((s) => <div key={s} className="text-foreground/85">• {s}</div>)}
                </CardContent>
              </Card>
              <Card className="rounded-xl border-brand/20 bg-brand-soft/40 shadow-none">
                <CardContent className="p-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand"><Gauge className="h-3 w-3" /> Indicador</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{proc.indicador.nome}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-brand">{proc.indicador.valor}</span>
                    <span className="text-[10px] text-muted-foreground">Meta {proc.indicador.meta}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border/70 shadow-none">
                <CardContent className="space-y-1.5 p-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><FileText className="h-3 w-3" /> Documentos vinculados</div>
                  <div className="text-foreground/85">PO.SGI.001 · Procedimento operacional</div>
                  <div className="text-foreground/85">IT.{proc.id.toUpperCase()}.014 · Instrução de trabalho</div>
                  <div className="text-foreground/85">FL.{proc.id.toUpperCase()}.002 · Formulário de registro</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}