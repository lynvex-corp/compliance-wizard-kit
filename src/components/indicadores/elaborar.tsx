import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowLeft, Save, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ElaborarIndicadorPage() {
  const [nome, setNome] = useState("Taxa de eficácia de ações corretivas");
  const [objetivo, setObjetivo] = useState("qualidade");
  const [formula, setFormula] = useState("(Ações eficazes / Total de ações avaliadas) × 100");
  const [unidade, setUnidade] = useState("%");
  const [meta, setMeta] = useState(90);
  const [polaridade, setPolaridade] = useState<"maior_melhor" | "menor_melhor">("maior_melhor");
  const [frequencia, setFrequencia] = useState("mensal");
  const [responsavel, setResponsavel] = useState("Ana Ribeiro");
  const [fonte, setFonte] = useState("manual");
  const [categoria, setCategoria] = useState("Qualidade");

  const externo = fonte === "externo";

  const preview = [65, 72, 78, 74, 82, 86].map((v, i) => ({ mes: ["Fev","Mar","Abr","Mai","Jun","Jul"][i], v }));
  const atual = preview[preview.length - 1].v;
  const atingido = polaridade === "maior_melhor" ? atual >= meta : atual <= meta;

  const salvar = () => toast.success("Indicador criado", { description: `${nome} foi adicionado ao painel.` });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1300px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link to="/indicadores" className="mb-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand">
              <ArrowLeft className="h-3 w-3" /> Voltar ao painel de indicadores
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Elaborar indicador</h1>
            <p className="mt-1 text-sm text-muted-foreground">Configure a métrica e visualize o card final em tempo real.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-lg"><Sparkles className="mr-1.5 h-4 w-4" /> Sugerir com IA</Button>
            <Button size="sm" onClick={salvar} className="rounded-lg bg-brand text-white hover:bg-brand/90"><Save className="mr-1.5 h-4 w-4" /> Salvar indicador</Button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardContent className="space-y-5 p-6">
              <section className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-brand">Identificação</h2>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Nome do indicador</label>
                  <Input value={nome} onChange={(e)=>setNome(e.target.value)} className="rounded-lg text-sm" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Objetivo do SGI</label>
                    <Select value={objetivo} onValueChange={setObjetivo}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qualidade">Aumentar a satisfação do cliente</SelectItem>
                        <SelectItem value="custo">Reduzir custo operacional</SelectItem>
                        <SelectItem value="seguranca">Zerar acidentes com afastamento</SelectItem>
                        <SelectItem value="fornecedor">Melhorar avaliação de fornecedores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Categoria</label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Qualidade">Qualidade</SelectItem>
                        <SelectItem value="Produção">Produção</SelectItem>
                        <SelectItem value="Segurança">Segurança</SelectItem>
                        <SelectItem value="Ambiental">Ambiental</SelectItem>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-brand">Cálculo e meta</h2>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Fórmula de cálculo</label>
                  <Textarea value={formula} onChange={(e)=>setFormula(e.target.value)} rows={2} className="rounded-lg font-mono text-xs" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Unidade</label>
                    <Input value={unidade} onChange={(e)=>setUnidade(e.target.value)} className="rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Meta</label>
                    <Input type="number" value={meta} onChange={(e)=>setMeta(Number(e.target.value))} className="rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Polaridade</label>
                    <Select value={polaridade} onValueChange={(v)=>setPolaridade(v as typeof polaridade)}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maior_melhor">Maior é melhor</SelectItem>
                        <SelectItem value="menor_melhor">Menor é melhor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-brand">Governança</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Frequência de medição</label>
                    <Select value={frequencia} onValueChange={setFrequencia}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Responsável</label>
                    <Input value={responsavel} onChange={(e)=>setResponsavel(e.target.value)} className="rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground">Fonte de dados</label>
                    <Select value={fonte} onValueChange={setFonte}>
                      <SelectTrigger className="rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Coleta manual</SelectItem>
                        <SelectItem value="modulo">Módulo da plataforma</SelectItem>
                        <SelectItem value="externo">Sistema externo — integração</SelectItem>
                      </SelectContent>
                    </Select>
                    {externo && (
                      <Badge variant="outline" className="mt-1 rounded-md border-border bg-muted text-[10px] text-muted-foreground">
                        Externo — integração com sistema já existente
                      </Badge>
                    )}
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          {/* Live preview */}
          <aside className="space-y-3">
            <div className="rounded-xl border border-dashed border-brand/40 bg-brand-soft/40 px-3 py-2 text-[11px] text-brand">
              Pré-visualização em tempo real
            </div>
            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-brand">IND-NOVO</span>
                      <Badge variant="outline" className="rounded-md border-brand/20 bg-brand-soft text-[10px] text-brand">{categoria}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{nome || "Novo indicador"}</h3>
                  </div>
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full",
                    atingido ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)]",
                  )}>
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold tracking-tight", atingido ? "text-[color:var(--success)]" : "text-[color:var(--severity-critical)]")}>
                    {atual}
                  </span>
                  <span className="text-xs text-muted-foreground">{unidade}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">Meta {meta}{unidade}</span>
                </div>
                <div className="h-[80px]">
                  <ResponsiveContainer>
                    <LineChart data={preview} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <XAxis dataKey="mes" hide />
                      <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid var(--border)" }} />
                      <Line type="monotone" dataKey="v" stroke={atingido ? "var(--success)" : "var(--severity-critical)"} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[10px] text-muted-foreground">
                  <div><span className="font-semibold text-foreground">Frequência:</span> {frequencia}</div>
                  <div><span className="font-semibold text-foreground">Responsável:</span> {responsavel}</div>
                  <div><span className="font-semibold text-foreground">Fórmula:</span> <span className="font-mono">{formula}</span></div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}