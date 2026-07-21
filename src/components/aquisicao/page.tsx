import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Star, Upload, ChevronRight, ChevronLeft, Award, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Q = "Qualificado" | "Em qualificação" | "Desqualificado";
interface Forn {
  nome: string; categoria: string; status: Q; nota: number; ultima: string;
  docs: Array<{ nome: string; validade: string; diasP: number }>;
}

const seed: Forn[] = [
  { nome: "BASF Brasil", categoria: "Matéria-prima", status: "Qualificado", nota: 4.6, ultima: "12/05/2026",
    docs: [{ nome: "ISO 9001", validade: "10/2027", diasP: 400 }, { nome: "Alvará sanitário", validade: "08/2026", diasP: 20 }] },
  { nome: "Química Delta", categoria: "Matéria-prima", status: "Qualificado", nota: 4.2, ultima: "02/06/2026",
    docs: [{ nome: "ISO 9001", validade: "03/2027", diasP: 250 }] },
  { nome: "Transportes Rota Sul", categoria: "Logística", status: "Em qualificação", nota: 3.4, ultima: "—",
    docs: [{ nome: "ANTT", validade: "12/2026", diasP: 150 }] },
  { nome: "Metalúrgica Alpha", categoria: "Componentes", status: "Qualificado", nota: 4.8, ultima: "20/04/2026",
    docs: [{ nome: "ISO 9001", validade: "07/2026", diasP: 10 }, { nome: "Certificado ambiental", validade: "01/2028", diasP: 550 }] },
  { nome: "EPI Total", categoria: "EPIs", status: "Qualificado", nota: 4.0, ultima: "05/03/2026",
    docs: [{ nome: "CA vigente", validade: "11/2026", diasP: 120 }] },
  { nome: "Serviços Beta", categoria: "Serviços terceiros", status: "Desqualificado", nota: 2.1, ultima: "15/01/2026",
    docs: [{ nome: "CNPJ regular", validade: "—", diasP: 999 }] },
  { nome: "TecPack Embalagens", categoria: "Embalagens", status: "Qualificado", nota: 3.9, ultima: "28/06/2026",
    docs: [{ nome: "Laudo migração", validade: "09/2026", diasP: 60 }] },
];

const statusColor: Record<Q, string> = {
  Qualificado: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em qualificação": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Desqualificado: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(n) ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-muted-foreground/40")} />
        ))}
      </div>
      <span className="font-mono text-[11px] font-semibold text-foreground">{n.toFixed(1)}</span>
    </div>
  );
}

export function AquisicaoPage() {
  const [novoOpen, setNovoOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [avOpen, setAvOpen] = useState<Forn | null>(null);
  const [notas, setNotas] = useState({ prazo: 4, qualidade: 4, atendimento: 4, doc: 4 });
  const media = (notas.prazo + notas.qualidade + notas.atendimento + notas.doc) / 4;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Aquisição / Fornecedores</h1>
            <p className="mt-1 text-sm text-muted-foreground">Qualificação, avaliação e monitoramento — requisito 8.4.</p>
          </div>
          <Dialog open={novoOpen} onOpenChange={(v) => { setNovoOpen(v); if (!v) setStep(0); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"><Plus className="mr-1.5 h-4 w-4" /> Inserir novo fornecedor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-2xl">
              <DialogHeader>
                <DialogTitle>Novo Fornecedor</DialogTitle>
                <DialogDescription>Complete as 3 etapas para submeter à qualificação.</DialogDescription>
              </DialogHeader>
              <div className="mb-3 flex items-center gap-2">
                {["Dados", "Critérios", "Documentos"].map((s, i) => (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold",
                      i === step ? "bg-brand text-white" : i < step ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                    <span className={cn("text-[11px]", i === step ? "font-semibold text-brand" : "text-muted-foreground")}>{s}</span>
                    {i < 2 && <div className="flex-1 border-t border-dashed border-border/70" />}
                  </div>
                ))}
              </div>
              <div className="min-h-[220px] space-y-3 py-2">
                {step === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[11px] text-muted-foreground">Razão social</label><Input className="h-9 rounded-lg text-xs" /></div>
                      <div><label className="text-[11px] text-muted-foreground">CNPJ</label><Input className="h-9 rounded-lg text-xs" placeholder="00.000.000/0000-00" /></div>
                    </div>
                    <div><label className="text-[11px] text-muted-foreground">Categoria</label>
                      <Select><SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp">Matéria-prima</SelectItem>
                          <SelectItem value="log">Logística</SelectItem>
                          <SelectItem value="serv">Serviços terceiros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><label className="text-[11px] text-muted-foreground">Contato principal</label><Input className="h-9 rounded-lg text-xs" /></div>
                  </>
                )}
                {step === 1 && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-muted-foreground">Marque os critérios atendidos:</div>
                    {["Possui sistema de gestão da qualidade", "Fornece certificados de análise (CoA)", "Atende ao lead time acordado", "Realiza inspeção final antes do envio", "Possui plano de contingência", "Aceita auditoria externa"].map((c) => (
                      <label key={c} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs">
                        <Checkbox defaultChecked /> <span className="text-foreground/85">{c}</span>
                      </label>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-2">
                    {["ISO 9001", "Alvará sanitário", "Certificado ambiental"].map((d) => (
                      <div key={d} className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand"><Upload className="h-4 w-4" /></div>
                        <div className="flex-1 text-xs">
                          <div className="font-medium text-foreground">{d}</div>
                          <div className="text-[10px] text-muted-foreground">Arraste o arquivo aqui ou clique para selecionar</div>
                        </div>
                        <Input type="text" placeholder="Validade" className="h-8 w-28 rounded-md text-[11px]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-lg"><ChevronLeft className="mr-1 h-4 w-4" /> Voltar</Button>
                {step < 2 ? (
                  <Button onClick={() => setStep(step + 1)} className="rounded-lg bg-brand text-white hover:bg-brand/90">Continuar <ChevronRight className="ml-1 h-4 w-4" /></Button>
                ) : (
                  <Button onClick={() => { setNovoOpen(false); setStep(0); toast.success("Fornecedor submetido para qualificação"); }} className="rounded-lg bg-brand text-white hover:bg-brand/90">Concluir</Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Última avaliação</TableHead>
                    <TableHead>Documentos / Licenças</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seed.map((f) => (
                    <TableRow key={f.nome} className="text-xs">
                      <TableCell className="font-semibold text-foreground">{f.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{f.categoria}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[f.status])}>{f.status}</Badge></TableCell>
                      <TableCell><Stars n={f.nota} /></TableCell>
                      <TableCell className="text-muted-foreground">{f.ultima}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {f.docs.map((d) => (
                            <Badge key={d.nome} variant="outline" className={cn("rounded-md text-[10px]",
                              d.diasP <= 30 ? "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]" :
                              "border-border bg-muted text-foreground/80")}>
                              {d.nome} · {d.validade}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 rounded-md text-[11px] text-brand" onClick={() => setAvOpen(f)}>
                          Avaliar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!avOpen} onOpenChange={(v) => !v && setAvOpen(null)}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle>Avaliação de fornecedor</DialogTitle>
              <DialogDescription>{avOpen?.nome}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {([["prazo","Prazo de entrega"],["qualidade","Qualidade do produto/serviço"],["atendimento","Atendimento"],["doc","Documentação"]] as const).map(([k, label]) => (
                <div key={k} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="font-mono font-semibold text-brand">{notas[k]}/5</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[notas[k]]} onValueChange={(v) => setNotas({ ...notas, [k]: v[0] })} />
                </div>
              ))}
              <div><label className="text-[11px] text-muted-foreground">Comentários</label><Textarea className="rounded-lg text-xs" rows={2} /></div>
              <div className={cn("flex items-center justify-between rounded-xl border p-4",
                media >= 4 ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10" :
                media >= 3 ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10" :
                "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10")}>
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white",
                    media >= 4 ? "bg-[color:var(--success)]" : media >= 3 ? "bg-[color:var(--warning)]" : "bg-[color:var(--severity-critical)]")}>
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Média final</div>
                    <div className="text-xl font-bold text-foreground">{media.toFixed(2)} <span className="text-xs text-muted-foreground">/ 5</span></div>
                  </div>
                </div>
                <Badge className={cn("rounded-md text-white", media >= 4 ? "bg-[color:var(--success)]" : media >= 3 ? "bg-[color:var(--warning)]" : "bg-[color:var(--severity-critical)]")}>
                  {media >= 4 ? "Aprovado" : media >= 3 ? "Aprovado com ressalvas" : "Reprovado"}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAvOpen(null)} className="rounded-lg">Cancelar</Button>
              <Button onClick={() => { setAvOpen(null); toast.success("Avaliação registrada"); }} className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <Check className="mr-1 h-4 w-4" /> Registrar avaliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}