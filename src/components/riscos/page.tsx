import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Link2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tipo = "Risco" | "Oportunidade";
type StatusR = "Identificado" | "Em tratamento" | "Monitorado" | "Encerrado";
interface Registro {
  id: number; codigo: string; descricao: string; tipo: Tipo; processo: string;
  origem: string; probabilidade: number; impacto: number; acoes: string[]; status: StatusR;
}

const seed: Registro[] = [
  { id: 1, codigo: "R-001", descricao: "Falha no fornecimento de matéria-prima crítica MP-2231", tipo: "Risco", processo: "Suprimentos", origem: "Contexto", probabilidade: 4, impacto: 5, acoes: ["PA-2026-0007"], status: "Em tratamento" },
  { id: 2, codigo: "R-002", descricao: "Vazamento em tubulação de vapor da utilidade", tipo: "Risco", processo: "Manutenção", origem: "Processo", probabilidade: 3, impacto: 5, acoes: ["PA-2026-0008"], status: "Em tratamento" },
  { id: 3, codigo: "O-003", descricao: "Expansão para mercado sul via licitação estadual", tipo: "Oportunidade", processo: "Comercial", origem: "Contexto", probabilidade: 4, impacto: 4, acoes: [], status: "Identificado" },
  { id: 4, codigo: "R-004", descricao: "Aumento de rotatividade em operação (>25%)", tipo: "Risco", processo: "RH", origem: "Parte interessada", probabilidade: 5, impacto: 3, acoes: ["PA-2026-0004"], status: "Em tratamento" },
  { id: 5, codigo: "R-005", descricao: "Falha em auditoria de recertificação ISO 9001", tipo: "Risco", processo: "Qualidade", origem: "Auditoria", probabilidade: 2, impacto: 5, acoes: ["PA-2026-0009"], status: "Monitorado" },
  { id: 6, codigo: "O-006", descricao: "Convênio de P&D com universidade — inovação em processos", tipo: "Oportunidade", processo: "Engenharia", origem: "Contexto", probabilidade: 3, impacto: 4, acoes: [], status: "Identificado" },
  { id: 7, codigo: "R-007", descricao: "Reclamação recorrente de cliente-chave (>3 no trimestre)", tipo: "Risco", processo: "Qualidade", origem: "Parte interessada", probabilidade: 3, impacto: 4, acoes: ["PA-2026-0010"], status: "Em tratamento" },
  { id: 8, codigo: "R-008", descricao: "Novo requisito ANVISA de rastreabilidade até 2027", tipo: "Risco", processo: "Regulatório", origem: "Contexto", probabilidade: 5, impacto: 4, acoes: [], status: "Identificado" },
  { id: 9, codigo: "R-009", descricao: "Falha em backup de sistema documental", tipo: "Risco", processo: "TI", origem: "Processo", probabilidade: 2, impacto: 3, acoes: [], status: "Monitorado" },
  { id: 10, codigo: "O-010", descricao: "Redução de consumo energético via retrofit de compressores", tipo: "Oportunidade", processo: "Utilidades", origem: "Processo", probabilidade: 4, impacto: 3, acoes: [], status: "Identificado" },
];

function nivel(p: number, i: number) {
  const v = p * i;
  if (v >= 15) return { label: "Crítico", color: "bg-[color:var(--severity-critical)]", text: "text-white" };
  if (v >= 10) return { label: "Alto", color: "bg-[color:var(--severity-high)]", text: "text-white" };
  if (v >= 5) return { label: "Médio", color: "bg-[color:var(--warning)]", text: "text-foreground" };
  return { label: "Baixo", color: "bg-[color:var(--success)]", text: "text-white" };
}

function cellColor(p: number, i: number) {
  const v = p * i;
  if (v >= 15) return "bg-[color:var(--severity-critical)]/85";
  if (v >= 10) return "bg-[color:var(--severity-high)]/80";
  if (v >= 5) return "bg-[color:var(--warning)]/70";
  return "bg-[color:var(--success)]/70";
}

const statusColor: Record<StatusR, string> = {
  Identificado: "bg-muted text-foreground border-border",
  "Em tratamento": "bg-brand-soft text-brand border-brand/20",
  Monitorado: "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Encerrado: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
};

export function RiscosPage() {
  const [rows, setRows] = useState<Registro[]>(seed);
  const [open, setOpen] = useState(false);
  const [novo, setNovo] = useState({
    descricao: "", tipo: "Risco" as Tipo, origem: "Contexto",
    probabilidade: 3, impacto: 3, acao: "",
  });

  const cellMap = useMemo(() => {
    const map = new Map<string, Registro[]>();
    rows.forEach((r) => {
      const key = `${r.probabilidade}-${r.impacto}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    });
    return map;
  }, [rows]);

  const salvar = () => {
    const id = rows.length + 1;
    const codigo = `${novo.tipo === "Risco" ? "R" : "O"}-${String(id).padStart(3, "0")}`;
    setRows([...rows, {
      id, codigo, descricao: novo.descricao || "Novo registro sem descrição",
      tipo: novo.tipo, processo: "Qualidade", origem: novo.origem,
      probabilidade: novo.probabilidade, impacto: novo.impacto,
      acoes: novo.acao ? [novo.acao] : [], status: "Identificado",
    }]);
    setOpen(false);
    toast.success(`${codigo} registrado`, { description: "Nível recalculado automaticamente na matriz." });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Riscos e Oportunidades</h1>
            <p className="mt-1 text-sm text-muted-foreground">Matriz 5×5 e registro completo — requisito 6.1 da ISO 9001.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
                <Plus className="mr-1.5 h-4 w-4" /> Novo registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle>Novo Risco / Oportunidade</DialogTitle>
                <DialogDescription>O nível é calculado automaticamente pela combinação Probabilidade × Impacto.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Descrição</label>
                  <Textarea value={novo.descricao} onChange={(e)=>setNovo({...novo, descricao:e.target.value})} rows={2} className="rounded-lg text-xs" placeholder="Ex.: Falha de fornecimento de matéria-prima crítica…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Tipo</label>
                    <Select value={novo.tipo} onValueChange={(v)=>setNovo({...novo, tipo: v as Tipo})}>
                      <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Risco">Risco</SelectItem>
                        <SelectItem value="Oportunidade">Oportunidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Origem</label>
                    <Select value={novo.origem} onValueChange={(v)=>setNovo({...novo, origem: v})}>
                      <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contexto">Contexto</SelectItem>
                        <SelectItem value="Parte interessada">Parte interessada</SelectItem>
                        <SelectItem value="Processo">Processo</SelectItem>
                        <SelectItem value="Auditoria">Auditoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground">Probabilidade</span>
                    <span className="font-mono font-semibold text-foreground">{novo.probabilidade}/5</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[novo.probabilidade]} onValueChange={(v)=>setNovo({...novo, probabilidade:v[0]})} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-muted-foreground">Impacto</span>
                    <span className="font-mono font-semibold text-foreground">{novo.impacto}/5</span>
                  </div>
                  <Slider min={1} max={5} step={1} value={[novo.impacto]} onValueChange={(v)=>setNovo({...novo, impacto:v[0]})} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                  <span className="text-[11px] text-muted-foreground">Nível calculado</span>
                  <Badge className={cn("rounded-md text-white", nivel(novo.probabilidade, novo.impacto).color)}>
                    {nivel(novo.probabilidade, novo.impacto).label}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Ação planejada</label>
                  <Input value={novo.acao} onChange={(e)=>setNovo({...novo, acao:e.target.value})} className="h-9 rounded-lg text-xs" placeholder="Ex.: Homologar segundo fornecedor" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)} className="rounded-lg">Cancelar</Button>
                <Button onClick={salvar} className="rounded-lg bg-brand text-white hover:bg-brand/90">Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          {/* Matrix */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Matriz 5×5</h2>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><ShieldAlert className="h-3 w-3" /> Prob × Impacto</span>
              </div>
              <div className="flex">
                {/* Y label */}
                <div className="flex w-6 items-center justify-center">
                  <span className="-rotate-90 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Probabilidade →</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-6 gap-1">
                    <div />
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="text-center text-[10px] font-mono text-muted-foreground">{i}</div>
                    ))}
                    {[5,4,3,2,1].map((p) => (
                      <>
                        <div key={`l-${p}`} className="text-right pr-1 text-[10px] font-mono text-muted-foreground">{p}</div>
                        {[1,2,3,4,5].map((i) => {
                          const list = cellMap.get(`${p}-${i}`) ?? [];
                          return (
                            <div key={`${p}-${i}`} className={cn("relative aspect-square rounded-md", cellColor(p, i))}>
                              <div className="flex h-full flex-wrap items-center justify-center gap-0.5 p-0.5">
                                {list.slice(0, 4).map((r) => (
                                  <span key={r.id} title={`${r.codigo} · ${r.descricao}`} className="rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow">
                                    {r.id}
                                  </span>
                                ))}
                                {list.length > 4 && <span className="text-[9px] font-bold text-white">+{list.length-4}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                  <div className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Impacto →</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px]">
                {(["Baixo","Médio","Alto","Crítico"] as const).map((l) => {
                  const c = l==="Crítico"?"bg-[color:var(--severity-critical)]":l==="Alto"?"bg-[color:var(--severity-high)]":l==="Médio"?"bg-[color:var(--warning)]":"bg-[color:var(--success)]";
                  return (
                    <span key={l} className="flex items-center gap-1 text-muted-foreground">
                      <span className={cn("inline-block h-2.5 w-2.5 rounded", c)} /> {l}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Registros ({rows.length})</h2>
                <Button size="sm" variant="ghost" className="h-7 rounded-md text-[11px] text-brand"><Sparkles className="mr-1 h-3 w-3" /> Sugerir riscos com IA</Button>
              </div>
              <div className="max-h-[520px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Processo</TableHead>
                      <TableHead>Avaliação</TableHead>
                      <TableHead>Ações</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const n = nivel(r.probabilidade, r.impacto);
                      return (
                        <TableRow key={r.id} className="text-xs">
                          <TableCell className="font-mono text-[11px] font-semibold text-brand">{r.codigo}</TableCell>
                          <TableCell className="max-w-[280px] text-foreground/85">{r.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md text-[10px]", r.tipo==="Risco" ? "border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]" : "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]")}>{r.tipo}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.processo}</TableCell>
                          <TableCell>
                            <Badge className={cn("rounded-md text-white", n.color)}>{n.label} · {r.probabilidade}×{r.impacto}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {r.acoes.length === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                              {r.acoes.map((a) => (
                                <Badge key={a} variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">
                                  <Link2 className="mr-0.5 h-3 w-3" /> {a}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[r.status])}>{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}