import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Library, Sparkles, PlusCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useKpis } from "@/lib/kpi-store";
import {
  bibliotecaIndicadores, fontesDerivadas, frequenciasKpi, processosKpi, responsaveisKpi,
  unidadesKpi, unidadesMedida, type BibliotecaItem, type FonteDados, type Kpi, type Polaridade,
} from "@/lib/kpi-data";
import { cn } from "@/lib/utils";

const passos = ["Identidade", "Como medir", "Meta e polaridade"];

type Draft = {
  nome: string; descricao: string; objetivoId: string; processo: string;
  responsavelMedicao: string; responsavelAnalise: string; formula: string; unidade: string;
  fonte: FonteDados; derivadoDe: string; frequencia: string; meta: number;
  faixaMin: number; faixaMax: number; polaridade: Polaridade; toleranciaPct: number;
  sugerirNc: boolean; ciclosParaDisparo: number; unidadeOrg: string;
};

const draftVazio: Draft = {
  nome: "", descricao: "", objetivoId: "", processo: "Qualidade",
  responsavelMedicao: "Ana Ribeiro", responsavelAnalise: "Ana Ribeiro", formula: "",
  unidade: "%", fonte: "manual", derivadoDe: "NCs abertas", frequencia: "Mensal",
  meta: 90, faixaMin: 0, faixaMax: 100, polaridade: "maior_melhor", toleranciaPct: 10,
  sugerirNc: true, ciclosParaDisparo: 2, unidadeOrg: "Matriz",
};

export function NovoIndicadorDialog({
  open, onOpenChange, objetivoPadrao, preset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  objetivoPadrao?: string;
  preset?: BibliotecaItem | null;
}) {
  const { objetivos, addKpi, proximoCodigo } = useKpis();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    ...draftVazio,
    objetivoId: objetivoPadrao ?? "",
    ...(preset
      ? {
          nome: preset.nome, descricao: preset.descricao, formula: preset.formula,
          unidade: preset.unidade, frequencia: preset.frequencia, polaridade: preset.polaridade,
        }
      : {}),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const codigo = useMemo(() => proximoCodigo(draft.fonte), [draft.fonte, proximoCodigo]);
  const podeAvancar = step !== 0 || (draft.objetivoId !== "" && draft.nome.trim() !== "");

  function salvar() {
    const novo = addKpi({
      nome: draft.nome, descricao: draft.descricao, objetivoId: draft.objetivoId,
      processo: draft.processo, unidadeOrg: draft.unidadeOrg,
      responsavelMedicao: draft.responsavelMedicao, responsavelAnalise: draft.responsavelAnalise,
      formula: draft.fonte === "derivado" ? `Derivado de: ${draft.derivadoDe}` : draft.formula,
      unidade: draft.unidade, fonte: draft.fonte, frequencia: draft.frequencia,
      meta: draft.meta, polaridade: draft.polaridade,
      faixaMin: draft.polaridade === "faixa_ideal" ? draft.faixaMin : undefined,
      faixaMax: draft.polaridade === "faixa_ideal" ? draft.faixaMax : undefined,
      toleranciaPct: draft.toleranciaPct, sugerirNc: draft.sugerirNc,
      ciclosParaDisparo: draft.ciclosParaDisparo,
    } as Omit<Kpi, "id" | "codigo" | "medicoes" | "trilha">);
    toast.success("Indicador criado", { description: `${novo.codigo} · ${novo.nome}` });
    onOpenChange(false);
    setStep(0);
    setDraft(draftVazio);
  }

  const objetivoNome = objetivos.find((o) => o.id === draft.objetivoId)?.nome;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Novo indicador</DialogTitle>
          <DialogDescription>Código gerado automaticamente conforme a fonte dos dados.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {passos.map((p, i) => (
            <div key={p} className={cn("flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium",
              i === step ? "bg-brand text-white" : i < step ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground")}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/25 text-[10px]">{i + 1}</span>
              {p}
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
            {step === 0 && (
              <>
                <Field label="Nome do indicador">
                  <Input value={draft.nome} onChange={(e) => set("nome", e.target.value)} className="rounded-lg text-sm" />
                </Field>
                <Field label="Código (automático)">
                  <Input value={codigo} readOnly className="rounded-lg bg-muted/40 font-mono text-xs" />
                </Field>
                <Field label="Descrição / o que ele mede">
                  <Textarea rows={2} value={draft.descricao} onChange={(e) => set("descricao", e.target.value)} className="rounded-lg text-sm" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Objetivo da qualidade (obrigatório)">
                    <Select value={draft.objetivoId} onValueChange={(v) => set("objetivoId", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {objetivos.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Processo relacionado">
                    <Select value={draft.processo} onValueChange={(v) => set("processo", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{processosKpi.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Responsável pela medição">
                    <Select value={draft.responsavelMedicao} onValueChange={(v) => set("responsavelMedicao", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{responsaveisKpi.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Responsável pela análise">
                    <Select value={draft.responsavelAnalise} onValueChange={(v) => set("responsavelAnalise", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{responsaveisKpi.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Unidade organizacional">
                    <Select value={draft.unidadeOrg} onValueChange={(v) => set("unidadeOrg", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{unidadesKpi.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Fórmula de cálculo">
                  <Textarea rows={2} value={draft.formula} onChange={(e) => set("formula", e.target.value)}
                    placeholder="peças conformes ÷ total × 100" className="rounded-lg font-mono text-xs" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Unidade de medida">
                    <Select value={draft.unidade} onValueChange={(v) => set("unidade", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{unidadesMedida.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Frequência">
                    <Select value={draft.frequencia} onValueChange={(v) => set("frequencia", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{frequenciasKpi.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Fonte dos dados">
                  <RadioGroup value={draft.fonte} onValueChange={(v) => set("fonte", v as FonteDados)} className="space-y-2">
                    {([
                      ["manual", "Manual — o usuário lança periodicamente"],
                      ["derivado", "Derivado do sistema"],
                      ["importado", "Importado (planilha)"],
                    ] as const).map(([v, label]) => (
                      <label key={v} className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs">
                        <RadioGroupItem value={v} /> {label}
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
                {draft.fonte === "derivado" && (
                  <Field label="Origem no sistema">
                    <Select value={draft.derivadoDe} onValueChange={(v) => set("derivadoDe", v)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{fontesDerivadas.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={`Meta (${draft.unidade})`}>
                    <Input type="number" value={draft.meta} onChange={(e) => set("meta", Number(e.target.value))} className="rounded-lg text-sm" />
                  </Field>
                  <Field label="Tolerância para amarelo (%)">
                    <Input type="number" value={draft.toleranciaPct} onChange={(e) => set("toleranciaPct", Number(e.target.value))} className="rounded-lg text-sm" />
                  </Field>
                </div>
                <Field label="Polaridade">
                  <RadioGroup value={draft.polaridade} onValueChange={(v) => set("polaridade", v as Polaridade)} className="space-y-2">
                    {([
                      ["maior_melhor", "Maior é melhor"],
                      ["menor_melhor", "Menor é melhor"],
                      ["faixa_ideal", "Faixa ideal"],
                    ] as const).map(([v, label]) => (
                      <label key={v} className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs">
                        <RadioGroupItem value={v} /> {label}
                      </label>
                    ))}
                  </RadioGroup>
                </Field>
                {draft.polaridade === "faixa_ideal" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Mínimo"><Input type="number" value={draft.faixaMin} onChange={(e) => set("faixaMin", Number(e.target.value))} className="rounded-lg text-sm" /></Field>
                    <Field label="Máximo"><Input type="number" value={draft.faixaMax} onChange={(e) => set("faixaMax", Number(e.target.value))} className="rounded-lg text-sm" /></Field>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Sugerir abrir NC quando ficar fora da meta</p>
                    <p className="text-[10px] text-muted-foreground">A NC nasce com origem “ID — Indicador de Desempenho”.</p>
                  </div>
                  <Switch checked={draft.sugerirNc} onCheckedChange={(v) => set("sugerirNc", v)} />
                </div>
                <Field label="Ciclos consecutivos fora antes de disparar">
                  <Input type="number" value={draft.ciclosParaDisparo} onChange={(e) => set("ciclosParaDisparo", Number(e.target.value))} className="w-28 rounded-lg text-sm" />
                </Field>
              </>
            )}
          </div>

          <aside className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pré-visualização</p>
            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <span className="font-mono text-[10px] font-semibold text-brand">{codigo}</span>
                <h3 className="text-sm font-semibold text-foreground">{draft.nome || "Novo indicador"}</h3>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="rounded-md border-brand/20 bg-brand-soft text-[10px] text-brand">{objetivoNome ?? "Objetivo pendente"}</Badge>
                  <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{draft.processo}</Badge>
                </div>
                <div className="flex items-end gap-6 border-t border-border/60 pt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Meta</p>
                    <p className="text-base font-semibold">{draft.meta}{draft.unidade}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Resultado</p>
                    <p className="text-xl font-bold text-muted-foreground">—</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {draft.frequencia} · {draft.responsavelMedicao}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" className="rounded-lg" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
          )}
          {step < 2 ? (
            podeAvancar ? (
              <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setStep((s) => s + 1)}>
                Avançar <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled className="rounded-lg">Avançar <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Todo indicador precisa estar vinculado a um objetivo da qualidade</TooltipContent>
              </Tooltip>
            )
          ) : (
            <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvar}>
              <Check className="mr-1.5 h-4 w-4" /> Criar indicador
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ---------- Escolha: do zero ou biblioteca ---------- */

export function EscolhaCriacaoDialog({
  open, onOpenChange, onDoZero, onBiblioteca,
}: { open: boolean; onOpenChange: (v: boolean) => void; onDoZero: () => void; onBiblioteca: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Como deseja criar o indicador?</DialogTitle>
          <DialogDescription>Comece do zero ou adote indicadores prontos da biblioteca Jáwda.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onDoZero} className="rounded-xl border border-border/80 p-4 text-left transition hover:border-brand/50 hover:bg-brand-soft/40">
            <PlusCircle className="mb-2 h-5 w-5 text-brand" />
            <p className="text-sm font-semibold text-foreground">Criar do zero</p>
            <p className="text-[11px] text-muted-foreground">Wizard em 3 passos com preview em tempo real.</p>
          </button>
          <button onClick={onBiblioteca} className="rounded-xl border border-border/80 p-4 text-left transition hover:border-brand/50 hover:bg-brand-soft/40">
            <Library className="mb-2 h-5 w-5 text-brand" />
            <p className="text-sm font-semibold text-foreground">Escolher da biblioteca</p>
            <p className="text-[11px] text-muted-foreground">25+ indicadores sugeridos por categoria.</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Biblioteca ---------- */

export function BibliotecaDialog({
  open, onOpenChange, onAdotar,
}: { open: boolean; onOpenChange: (v: boolean) => void; onAdotar: (item: BibliotecaItem) => void }) {
  const { addKpi, objetivos } = useKpis();
  const [sel, setSel] = useState<string[]>([]);

  const todos = bibliotecaIndicadores.flatMap((g) => g.itens);

  function adotarVarios() {
    const itens = todos.filter((i) => sel.includes(i.nome));
    if (!itens.length) return toast.error("Selecione ao menos um indicador.");
    itens.forEach((i) =>
      addKpi({
        nome: i.nome, descricao: i.descricao, objetivoId: objetivos[0].id, processo: "Qualidade",
        unidadeOrg: "Matriz", responsavelMedicao: "Ana Ribeiro", responsavelAnalise: "Ana Ribeiro",
        formula: i.formula, unidade: i.unidade, fonte: "manual", frequencia: i.frequencia,
        meta: 90, polaridade: i.polaridade, toleranciaPct: 10, sugerirNc: true, ciclosParaDisparo: 2,
      } as Omit<Kpi, "id" | "codigo" | "medicoes" | "trilha">),
    );
    toast.success(`${itens.length} indicadores adotados`, { description: "Ajuste meta e responsável na aba Configuração." });
    setSel([]);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Biblioteca de indicadores sugeridos</DialogTitle>
          <DialogDescription>Adote um indicador pronto e ajuste apenas meta e responsável.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[58vh] overflow-y-auto pr-1">
          <Accordion type="multiple" defaultValue={["Cliente"]}>
            {bibliotecaIndicadores.map((g) => (
              <AccordionItem key={g.categoria} value={g.categoria}>
                <AccordionTrigger className="text-sm font-semibold">
                  {g.categoria}
                  <Badge variant="outline" className="ml-2 rounded-md text-[10px]">{g.itens.length}</Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {g.itens.map((i) => (
                      <Card key={i.nome} className="rounded-xl border-border/80">
                        <CardContent className="space-y-2 p-4">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={sel.includes(i.nome)}
                              onCheckedChange={(c) => setSel((p) => (c ? [...p, i.nome] : p.filter((n) => n !== i.nome)))}
                              className="mt-0.5"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{i.nome}</p>
                              <p className="text-[11px] text-muted-foreground">{i.descricao}</p>
                            </div>
                          </div>
                          <p className="rounded-md bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground">{i.formula}</p>
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            <Badge variant="outline" className="rounded-md">{i.unidade}</Badge>
                            <Badge variant="outline" className="rounded-md">{i.frequencia}</Badge>
                            <Badge variant="outline" className="rounded-md">
                              {i.polaridade === "menor_melhor" ? "Menor é melhor" : i.polaridade === "faixa_ideal" ? "Faixa ideal" : "Maior é melhor"}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" className="w-full rounded-lg text-[11px]" onClick={() => onAdotar(i)}>
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Adotar este indicador
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <DialogFooter>
          <span className="mr-auto self-center text-[11px] text-muted-foreground">{sel.length} selecionado(s)</span>
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={adotarVarios}>Adotar selecionados</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}