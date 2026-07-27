import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Upload, Download, FileSpreadsheet, AlertTriangle, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useKpis } from "@/lib/kpi-store";
import { ciclosFora, foraDaMeta, periodos6, type Kpi } from "@/lib/kpi-data";
import { cn } from "@/lib/utils";

function proximoPeriodo(kpi: Kpi) {
  const usados = kpi.medicoes.map((m) => m.periodo);
  return periodos6.find((p) => !usados.includes(p)) ?? "Ago/26";
}

function sugestaoIA(kpi: Kpi, valor: number) {
  return `O indicador ${kpi.nome} apresentou ${valor}${kpi.unidade} no período, frente à meta de ${kpi.meta}${kpi.unidade}. O desvio concentra-se no processo ${kpi.processo}, com indícios de variação no método de execução e falhas pontuais de controle. Recomenda-se verificar a padronização das atividades, revisar a capacitação dos envolvidos e avaliar a abertura de não conformidade para tratamento estruturado da causa raiz.`;
}

export function LancarMedicaoDialog({
  kpi, open, onOpenChange,
}: { kpi: Kpi; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addMedicao } = useKpis();
  const [periodo, setPeriodo] = useState(proximoPeriodo(kpi));
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");
  const [analise, setAnalise] = useState("");
  const [breve, setBreve] = useState(false);
  const [sugestao, setSugestao] = useState<string | null>(null);
  const [evidencia, setEvidencia] = useState<string | null>(null);

  const num = Number(valor);
  const temValor = valor !== "" && !Number.isNaN(num);
  const fora = temValor && foraDaMeta(kpi, num);
  const analiseOk = !fora || analise.trim().length >= 20;

  function salvar() {
    if (!temValor) return toast.error("Informe o valor da medição.");
    if (!analiseOk) return toast.error("Análise crítica obrigatória (mínimo 20 caracteres) para valor fora da meta.");
    addMedicao(kpi.id, {
      periodo, valor: num, responsavel: kpi.responsavelMedicao,
      lancadoEm: new Date().toLocaleDateString("pt-BR"),
      observacao: obs || undefined, analise: analise || undefined, evidencia: evidencia || undefined,
    });
    toast.success("Medição registrada", { description: `${kpi.nome} · ${periodo}: ${num}${kpi.unidade}` });
    if (fora && ciclosFora(kpi) + 1 >= kpi.ciclosParaDisparo && kpi.sugerirNc) {
      toast.warning("Ciclos consecutivos fora da meta", {
        description: `Sugerimos abrir uma NC com origem "ID — Indicador de Desempenho".`,
      });
    }
    onOpenChange(false);
    setValor(""); setObs(""); setAnalise(""); setSugestao(null); setEvidencia(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lançar nova medição</DialogTitle>
          <DialogDescription>{kpi.codigo} · {kpi.nome} · frequência {kpi.frequencia.toLowerCase()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Período de referência</Label>
              <Input value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="rounded-lg text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Valor ({kpi.unidade})</Label>
              <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={`Meta ${kpi.meta}`} className="rounded-lg text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Observação (opcional)</Label>
            <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="rounded-lg text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Evidência (opcional)</Label>
            <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={() => setEvidencia("evidencia-medicao.pdf")}>
              <Upload className="mr-1.5 h-3.5 w-3.5" /> {evidencia ?? "Anexar evidência"}
            </Button>
          </div>

          <div className={cn("space-y-2 rounded-xl border p-3", fora ? "border-[color:var(--danger-deep)]/40 bg-[color:var(--danger-deep)]/5" : "border-border/70 bg-muted/30")}>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] font-semibold">
                Análise crítica {fora ? <span className="text-[color:var(--danger-deep)]">· obrigatória</span> : <span className="text-muted-foreground">· opcional</span>}
              </Label>
              {fora && <AlertTriangle className="h-4 w-4 text-[color:var(--danger-deep)]" />}
            </div>
            <Textarea
              value={analise}
              onChange={(e) => setAnalise(e.target.value)}
              rows={breve ? 2 : 4}
              placeholder={fora ? "Descreva a causa provável e o encaminhamento (mín. 20 caracteres)" : "adicione observações se quiser"}
              className="rounded-lg text-sm"
            />
            {fora && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-lg text-[11px]" onClick={() => setSugestao(sugestaoIA(kpi, num))}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Sugerir análise com IA
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-[11px]" onClick={() => setBreve((b) => !b)}>
                  Análise breve
                </Button>
              </div>
            )}
            {sugestao && (
              <Card className="rounded-lg border-brand/30 bg-brand-soft/40">
                <CardContent className="space-y-2 p-3">
                  <Badge variant="outline" className="rounded-md border-brand/30 bg-background text-[10px] text-brand">
                    Sugestão — deve ser analisada
                  </Badge>
                  <p className="text-[11px] leading-relaxed text-foreground">{sugestao}</p>
                  <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => { setAnalise(sugestao); setSugestao(null); }}>
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Usar esta análise
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvar}>Salvar medição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LoteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { kpis, addMedicao } = useKpis();
  const mensais = kpis.filter((k) => !k.arquivado && k.frequencia === "Mensal");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [analises, setAnalises] = useState<Record<string, string>>({});

  function salvarTudo() {
    const entradas = mensais.filter((k) => valores[k.id] && !Number.isNaN(Number(valores[k.id])));
    if (!entradas.length) return toast.error("Nenhum valor informado.");
    const faltando = entradas.filter((k) => foraDaMeta(k, Number(valores[k.id])) && (analises[k.id] ?? "").trim().length < 20);
    if (faltando.length) return toast.error(`Análise crítica obrigatória em ${faltando.length} indicador(es) fora da meta.`);
    entradas.forEach((k) =>
      addMedicao(k.id, {
        periodo: proximoPeriodo(k), valor: Number(valores[k.id]), responsavel: k.responsavelMedicao,
        lancadoEm: new Date().toLocaleDateString("pt-BR"), analise: analises[k.id],
      }),
    );
    toast.success(`${entradas.length} medições registradas`);
    setValores({}); setAnalises({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lançar medição em lote</DialogTitle>
          <DialogDescription>Indicadores de frequência mensal no período atual.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {mensais.map((k) => {
            const v = valores[k.id];
            const fora = v !== undefined && v !== "" && !Number.isNaN(Number(v)) && foraDaMeta(k, Number(v));
            return (
              <div key={k.id} className={cn("rounded-xl border p-3", fora ? "border-[color:var(--danger-deep)]/40 bg-[color:var(--danger-deep)]/5" : "border-border/70")}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{k.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{k.codigo} · meta {k.meta}{k.unidade} · {k.processo}</p>
                  </div>
                  <Input
                    type="number" value={v ?? ""} placeholder={k.unidade}
                    onChange={(e) => setValores((p) => ({ ...p, [k.id]: e.target.value }))}
                    className="h-9 w-28 rounded-lg text-sm"
                  />
                </div>
                {fora && (
                  <Textarea
                    rows={2}
                    value={analises[k.id] ?? ""}
                    onChange={(e) => setAnalises((p) => ({ ...p, [k.id]: e.target.value }))}
                    placeholder="Análise crítica obrigatória (mín. 20 caracteres)"
                    className="mt-2 rounded-lg text-xs"
                  />
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvarTudo}>Salvar todas as medições</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportarDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Baixar modelo", "Upload", "Mapear colunas", "Confirmar"];
  const preview = [
    { codigo: "IND_MAN_001_2026", periodo: "Jul/26", valor: "9.0" },
    { codigo: "IND_DER_002_2026", periodo: "Jul/26", valor: "92" },
    { codigo: "IND_MAN_003_2026", periodo: "Jul/26", valor: "95" },
  ];
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setStep(0); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar medições de planilha</DialogTitle>
          <DialogDescription>Registros importados nascem com origem “Importado”, visível na trilha.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className={cn("flex-1 rounded-lg px-2 py-1.5 text-center text-[10px]", i === step ? "bg-brand text-white" : i < step ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground")}>{s}</div>
          ))}
        </div>
        <div className="min-h-[160px] rounded-xl border border-border/70 p-4">
          {step === 0 && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">Baixe o modelo CSV com as colunas esperadas: código do indicador, período e valor.</p>
              <Button variant="outline" className="rounded-lg" onClick={() => toast.success("Modelo modelo-indicadores.csv gerado")}>
                <Download className="mr-1.5 h-4 w-4" /> Baixar modelo CSV
              </Button>
            </div>
          )}
          {step === 1 && (
            <div className="flex h-[130px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand/40 bg-brand-soft/30 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-6 w-6 text-brand" />
              Arraste a planilha aqui ou clique para selecionar
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2 text-xs">
              {["Código do indicador", "Período", "Valor"].map((c, i) => (
                <div key={c} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                  <span className="text-muted-foreground">Coluna {String.fromCharCode(65 + i)} da planilha</span>
                  <Badge variant="outline" className="rounded-md border-brand/30 bg-brand-soft text-[10px] text-brand">{c}</Badge>
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-1 text-xs">
              <p className="mb-2 text-muted-foreground">3 medições serão importadas:</p>
              {preview.map((p) => (
                <div key={p.codigo} className="flex justify-between rounded-lg bg-muted/40 px-3 py-1.5">
                  <span className="font-mono text-[10px] text-brand">{p.codigo}</span>
                  <span className="text-muted-foreground">{p.periodo}</span>
                  <span className="font-medium text-foreground">{p.valor}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 0 && <Button variant="outline" className="rounded-lg" onClick={() => setStep((s) => s - 1)}>Voltar</Button>}
          {step < 3 ? (
            <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setStep((s) => s + 1)}>Avançar</Button>
          ) : (
            <Button className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => { toast.success("3 medições importadas"); onOpenChange(false); setStep(0); }}>
              Confirmar importação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}