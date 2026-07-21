import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, Users, Building2, Plus, ThumbsUp, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Com = { oque: string; quando: string; comQuem: string; como: string; quemComunica: string };

const internas: Com[] = [
  { oque: "Política da Qualidade (rev. 04)", quando: "Trimestral", comQuem: "Todos os colaboradores", como: "Mural + Intranet", quemComunica: "RD / Fernanda Lima" },
  { oque: "Resultados da análise crítica", quando: "Semestral", comQuem: "Gerentes e diretoria", como: "Reunião presencial", quemComunica: "Diretoria" },
  { oque: "Alterações de procedimentos", quando: "Sob demanda", comQuem: "Áreas impactadas", como: "E-mail + treinamento", quemComunica: "Dono do processo" },
  { oque: "Indicadores de qualidade", quando: "Mensal", comQuem: "Gestores", como: "Dashboard Jáwda", quemComunica: "Qualidade" },
  { oque: "Não conformidades relevantes", quando: "Sob ocorrência", comQuem: "Área envolvida + gestor", como: "Sistema Jáwda + reunião", quemComunica: "Qualidade" },
];

const externas: Com[] = [
  { oque: "Confirmação de pedidos e prazos", quando: "A cada pedido", comQuem: "Clientes", como: "E-mail / ERP", quemComunica: "Comercial" },
  { oque: "Especificações técnicas", quando: "A cada contrato", comQuem: "Fornecedores", como: "Pedido de compra", quemComunica: "Suprimentos" },
  { oque: "Relatórios de auditoria externa", quando: "Anual", comQuem: "Organismo certificador", como: "Portal + relatório", quemComunica: "RD" },
  { oque: "Resposta a reclamações", quando: "≤ 5 dias úteis", comQuem: "Clientes", como: "E-mail / Ouvidoria", quemComunica: "Qualidade + Comercial" },
];

const manifestacoes = [
  { tipo: "Elogio", texto: "Atendimento pós-venda foi excelente na tratativa do lote 4801.", cor: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30", icon: ThumbsUp, data: "12/07" },
  { tipo: "Reclamação", texto: "Embalagem chegou danificada na entrega do pedido #9921.", cor: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30", icon: AlertTriangle, data: "09/07" },
  { tipo: "Solicitação", texto: "Solicito ficha técnica atualizada do produto código MP-2231.", cor: "bg-brand-soft text-brand border-brand/20", icon: HelpCircle, data: "07/07" },
  { tipo: "Elogio", texto: "Equipe técnica muito prestativa na visita de inspeção.", cor: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30", icon: ThumbsUp, data: "02/07" },
];

function MiniTable({ c }: { c: Com }) {
  const rows: Array<[string, string]> = [
    ["O quê", c.oque], ["Quando", c.quando], ["Com quem", c.comQuem], ["Como", c.como], ["Quem comunica", c.quemComunica],
  ];
  return (
    <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-muted/20 text-[11px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[110px_1fr] gap-2 px-3 py-1.5">
          <span className="text-muted-foreground">{k}</span>
          <span className="font-medium text-foreground/85">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function ComunicacoesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Comunicações</h1>
            <p className="mt-1 text-sm text-muted-foreground">Comunicação interna e externa do SG — requisito 7.4.</p>
          </div>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
            <Plus className="mr-1.5 h-4 w-4" /> Nova comunicação
          </Button>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Users className="h-4 w-4" /></div>
              <h2 className="text-sm font-semibold text-foreground">Comunicação Interna</h2>
              <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{internas.length} registros</Badge>
            </div>
            {internas.map((c) => (
              <Card key={c.oque} className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{c.oque}</div>
                    <Badge variant="outline" className="rounded-md text-[10px]">{c.quando}</Badge>
                  </div>
                  <MiniTable c={c} />
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Building2 className="h-4 w-4" /></div>
              <h2 className="text-sm font-semibold text-foreground">Comunicação Externa</h2>
              <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{externas.length} registros</Badge>
            </div>
            {externas.map((c) => (
              <Card key={c.oque} className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{c.oque}</div>
                    <Badge variant="outline" className="rounded-md text-[10px]">{c.quando}</Badge>
                  </div>
                  <MiniTable c={c} />
                </CardContent>
              </Card>
            ))}

            <Card className="rounded-2xl border-brand/30 bg-gradient-to-br from-brand-soft/80 to-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-brand/30 bg-white text-brand shadow-inner">
                    <QrCode className="h-12 w-12" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand" />
                      <h3 className="text-sm font-semibold text-brand">Ouvidoria · Canal QR Code</h3>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">Cartazes espalhados na fábrica e portais de clientes. Manifestações caem diretamente no módulo de NC.</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand">147</span>
                      <span className="text-[11px] text-muted-foreground">manifestações em 2026</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-brand/20 pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Últimas manifestações</div>
                  {manifestacoes.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="flex items-start gap-2 rounded-lg border border-border/60 bg-white p-2.5">
                        <Badge variant="outline" className={cn("rounded-md text-[10px]", m.cor)}>
                          <Icon className="mr-1 h-3 w-3" /> {m.tipo}
                        </Badge>
                        <span className="flex-1 text-[11px] text-foreground/85">{m.texto}</span>
                        <span className="text-[10px] text-muted-foreground">{m.data}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}