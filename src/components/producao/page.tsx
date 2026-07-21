import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Factory, CheckCircle2, Clock, AlertTriangle, HardHat, FileCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Etapa { etapa: string; resp: string; data: string; status: "Verificado" | "Pendente" }
interface Obra {
  codigo: string; nome: string; cliente: string; avanco: number;
  etapas: Etapa[]; liberacoes: Array<{ item: string; data: string; por: string }>;
}

const obras: Obra[] = [
  { codigo: "OB-2026-014", nome: "Ampliação Fábrica Norte", cliente: "Cliente Alpha", avanco: 68,
    etapas: [
      { etapa: "Fundação", resp: "Diego A.", data: "12/04", status: "Verificado" },
      { etapa: "Estrutura metálica", resp: "Rafael C.", data: "28/05", status: "Verificado" },
      { etapa: "Cobertura e vedação", resp: "Diego A.", data: "10/07", status: "Verificado" },
      { etapa: "Instalações elétricas", resp: "Marcos V.", data: "20/07", status: "Pendente" },
      { etapa: "Acabamento", resp: "Diego A.", data: "05/08", status: "Pendente" },
    ],
    liberacoes: [{ item: "Concreto estrutural", data: "12/04", por: "Eng. Fernanda" }, { item: "Solda estrutural", data: "28/05", por: "Insp. Rafael" }] },
  { codigo: "OB-2026-018", nome: "Reforma Linha de Envase 03", cliente: "Interno", avanco: 42,
    etapas: [
      { etapa: "Desmontagem", resp: "Diego A.", data: "01/07", status: "Verificado" },
      { etapa: "Substituição de bombas", resp: "Rafael C.", data: "10/07", status: "Verificado" },
      { etapa: "Comissionamento", resp: "Diego A.", data: "22/07", status: "Pendente" },
      { etapa: "Validação de processo", resp: "Fernanda L.", data: "01/08", status: "Pendente" },
    ],
    liberacoes: [{ item: "Instalação de bombas B-04", data: "10/07", por: "Eng. Marcos" }] },
  { codigo: "OB-2026-021", nome: "Manutenção Preditiva CTA", cliente: "Interno", avanco: 90,
    etapas: [
      { etapa: "Diagnóstico", resp: "Marcos V.", data: "02/07", status: "Verificado" },
      { etapa: "Substituição de peças", resp: "Rafael C.", data: "08/07", status: "Verificado" },
      { etapa: "Testes de operação", resp: "Diego A.", data: "14/07", status: "Verificado" },
      { etapa: "Liberação final", resp: "Fernanda L.", data: "18/07", status: "Pendente" },
    ],
    liberacoes: [{ item: "Substituição rolamento R-32", data: "08/07", por: "Insp. Diego" }] },
];

export function ProducaoPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Produção e Serviços</h1>
              <Badge variant="outline" className="rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
                Integração externa
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Controle de execução por obra/contrato — dados sincronizados do ERP de obras.</p>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {obras.map((o) => (
            <Card key={o.codigo} className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <HardHat className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-semibold text-brand">{o.codigo}</div>
                      <div className="text-sm font-semibold text-foreground">{o.nome}</div>
                      <div className="text-[11px] text-muted-foreground">{o.cliente}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand">{o.avanco}%</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Avanço</div>
                  </div>
                </div>
                <Progress value={o.avanco} className="h-1.5" />
                <div>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Etapas verificadas</div>
                  <div className="overflow-hidden rounded-lg border border-border/70">
                    <Table>
                      <TableBody>
                        {o.etapas.map((e) => (
                          <TableRow key={e.etapa} className="text-[11px]">
                            <TableCell className="py-1.5">
                              {e.status === "Verificado" ? <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" /> : <Clock className="h-3.5 w-3.5 text-[color:var(--warning)]" />}
                            </TableCell>
                            <TableCell className="py-1.5 font-medium text-foreground">{e.etapa}</TableCell>
                            <TableCell className="py-1.5 text-muted-foreground">{e.resp}</TableCell>
                            <TableCell className="py-1.5 text-right text-muted-foreground">{e.data}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileCheck className="h-3 w-3" /> Liberações de serviço
                  </div>
                  <div className="space-y-1">
                    {o.liberacoes.map((l) => (
                      <div key={l.item} className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px]">
                        <span className="text-foreground/85">{l.item}</span>
                        <span className="text-muted-foreground">{l.por} · {l.data}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline" size="sm"
                  className="w-full rounded-lg border-[color:var(--severity-critical)]/40 text-xs text-[color:var(--severity-critical)] hover:bg-[color:var(--severity-critical)]/10"
                  onClick={() => {
                    toast.info("Abrindo Nova NC com origem 'Produção' pré-selecionada");
                    setTimeout(() => navigate({ to: "/nao-conformidades/nova" }), 400);
                  }}
                >
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Registrar Não Conformidade
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"><Factory className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-semibold text-foreground">Precisa iniciar uma nova obra ou contrato?</div>
                <div className="text-[11px] text-muted-foreground">Novos registros são criados diretamente no ERP e refletem automaticamente aqui.</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg text-xs"><Plus className="mr-1.5 h-3.5 w-3.5" /> Abrir ERP de obras</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}