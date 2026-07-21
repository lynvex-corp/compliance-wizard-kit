import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Users,
  CalendarClock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useJawda } from "@/lib/jawda-store";
import type { PlanoOrigemTipo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Origem e contexto", icon: ClipboardList },
  { id: 2, label: "Ações (5W2H)", icon: Sparkles },
  { id: 3, label: "Prazos e responsáveis", icon: CalendarClock },
];

const ORIGENS: PlanoOrigemTipo[] = [
  "Não Conformidade",
  "Auditoria Interna",
  "Auditoria Externa",
  "Risco/Oportunidade",
  "Análise Crítica",
  "Reclamação de Cliente",
  "Melhoria Contínua",
];

const DEPARTAMENTOS = ["Qualidade", "Produção", "Suprimentos", "Manutenção", "RH", "Comercial", "TI"];

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
                done && "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
                active && "border-brand bg-brand text-white",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              <span className="font-medium">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        );
      })}
    </div>
  );
}

type IAProposta = {
  contencao: string;
  acoes: Array<{
    oque: string;
    onde: string;
    quem: string;
    quando: string;
    como: string;
    quanto: string;
    porque: string;
  }>;
  resultado: string;
  prazoSugerido: number; // dias
};

function gerarPropostaIA(problema: string): IAProposta {
  const criticidade = /crític|urgent|paral/i.test(problema) ? 15 : /moder|risco/i.test(problema) ? 30 : 45;
  const foco = problema.trim().slice(0, 60) || "processo identificado";
  return {
    contencao: `Isolar imediatamente ${foco.toLowerCase()} e comunicar equipe responsável. Aplicar inspeção 100% até estabilização.`,
    acoes: [
      {
        oque: `Revisar procedimento operacional associado a ${foco.toLowerCase()}`,
        onde: "Área impactada",
        quem: "Coordenador de processo",
        quando: `+${Math.round(criticidade / 3)} dias`,
        como: "Reunião técnica + análise de causa raiz (5 Porquês)",
        quanto: "R$ 0",
        porque: "Eliminar a causa raiz e evitar reincidência",
      },
      {
        oque: "Atualizar POP e checklist de conferência",
        onde: "Gestão Documental",
        quem: "Analista da Qualidade",
        quando: `+${Math.round(criticidade / 2)} dias`,
        como: "Redação e aprovação via workflow documental",
        quanto: "R$ 0",
        porque: "Formalizar a nova prática",
      },
      {
        oque: "Treinamento dos operadores dos 3 turnos",
        onde: "Sala de treinamento + campo",
        quem: "Líder de área",
        quando: `+${criticidade - 5} dias`,
        como: "Treinamento presencial com avaliação de eficácia",
        quanto: "R$ 800",
        porque: "Garantir aderência ao novo procedimento",
      },
      {
        oque: "Auditoria de conformidade pós-implementação",
        onde: "Área impactada",
        quem: "Qualidade",
        quando: `+${criticidade} dias`,
        como: "Checklist e amostragem por 7 dias consecutivos",
        quanto: "R$ 0",
        porque: "Verificar eficácia da ação e liberar encerramento",
      },
    ],
    resultado: "Eliminar reincidência nos próximos 60 dias com aprovação na 1ª avaliação de eficácia.",
    prazoSugerido: criticidade,
  };
}

export function NovoPlanoWizard() {
  const navigate = useNavigate();
  const { addPlano } = useJawda();
  const [step, setStep] = useState(1);

  // Step 1
  const [origem, setOrigem] = useState<PlanoOrigemTipo>("Não Conformidade");
  const [vinculado, setVinculado] = useState("");
  const [problema, setProblema] = useState("");

  // Step 2 — IA + 5W2H fields
  const [contencao, setContencao] = useState("");
  const [acoes, setAcoes] = useState<IAProposta["acoes"]>([
    { oque: "", onde: "", quem: "", quando: "", como: "", quanto: "", porque: "" },
  ]);
  const [resultado, setResultado] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaProposta, setIaProposta] = useState<IAProposta | null>(null);

  // Step 3
  const [responsavelNome, setResponsavelNome] = useState("Beatriz Souza");
  const [departamento, setDepartamento] = useState("Qualidade");
  const [prazoDias, setPrazoDias] = useState(30);
  const [custo, setCusto] = useState(0);

  const iniciais = useMemo(
    () =>
      responsavelNome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join(""),
    [responsavelNome],
  );

  const gerarComIA = () => {
    if (!problema.trim()) {
      toast.error("Descreva o problema para a IA propor as ações.");
      return;
    }
    setIaLoading(true);
    setTimeout(() => {
      const p = gerarPropostaIA(problema);
      setIaProposta(p);
      setIaLoading(false);
    }, 1800);
  };

  const aplicarTudo = () => {
    if (!iaProposta) return;
    setContencao(iaProposta.contencao);
    setAcoes(iaProposta.acoes);
    setResultado(iaProposta.resultado);
    setPrazoDias(iaProposta.prazoSugerido);
    toast.success("Proposta aplicada — revise antes de concluir.");
    setIaProposta(null);
  };

  const aplicarSoAcoes = () => {
    if (!iaProposta) return;
    setAcoes(iaProposta.acoes);
    toast.success("Ações aplicadas ao formulário.");
    setIaProposta(null);
  };

  const concluir = () => {
    const descricao = acoes[0]?.oque || problema || "Plano de ação sem título";
    const prazoIso = new Date(Date.now() + prazoDias * 86400000).toISOString();
    addPlano({
      descricao,
      origemTipo: origem,
      vinculadoCodigo: vinculado || null,
      responsavel: { nome: responsavelNome, iniciais, departamento },
      pdca: "Plan",
      status: "Planejado",
      prazo: prazoIso,
      custo,
      percentual: 0,
      marcos: [
        new Date(Date.now() + (prazoDias / 3) * 86400000).toISOString(),
        new Date(Date.now() + (prazoDias / 1.5) * 86400000).toISOString(),
        prazoIso,
      ],
    });
    toast.success("Plano de ação criado com sucesso.");
    setTimeout(() => navigate({ to: "/planos-de-acao" }), 500);
  };

  const canPrev = step > 1;
  const canNext = step < 3;

  const updateAcao = (i: number, field: keyof IAProposta["acoes"][number], value: string) => {
    setAcoes((a) => a.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));
  };
  const addAcao = () =>
    setAcoes([...acoes, { oque: "", onde: "", quem: "", quando: "", como: "", quanto: "", porque: "" }]);
  const removeAcao = (i: number) => setAcoes(acoes.filter((_, idx) => idx !== i));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">
              <Link to="/planos-de-acao" className="hover:text-foreground">Planos de Ação</Link> / Novo
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Novo Plano de Ação</h1>
          </div>
          <Button variant="outline" asChild>
            <Link to="/planos-de-acao">Cancelar</Link>
          </Button>
        </header>

        <Card className="rounded-xl">
          <CardContent className="p-4">
            <Stepper current={step} />
          </CardContent>
        </Card>

        {step === 1 && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Origem e contexto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Origem</Label>
                  <Select value={origem} onValueChange={(v) => setOrigem(v as PlanoOrigemTipo)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Código vinculado (opcional)</Label>
                  <Input
                    className="mt-2"
                    value={vinculado}
                    onChange={(e) => setVinculado(e.target.value)}
                    placeholder="Ex.: NC-2026-014"
                  />
                </div>
              </div>
              <div>
                <Label>Descrição do problema / oportunidade</Label>
                <Textarea
                  className="mt-2 min-h-[120px]"
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  placeholder="Descreva o cenário — pode colar a descrição da NC de origem."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  A IA usará esta descrição para propor uma estrutura 5W2H completa.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="rounded-xl border-brand/30 bg-brand-soft/30">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" />
                  <div>
                    <div className="text-sm font-semibold text-brand">Gerar plano com IA</div>
                    <div className="text-xs text-muted-foreground">
                      Contenção imediata + ações corretivas 5W2H a partir da descrição do problema.
                    </div>
                  </div>
                </div>
                <Button className="bg-brand hover:bg-brand/90" onClick={gerarComIA} disabled={iaLoading}>
                  {iaLoading ? (<><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />IA analisando…</>) : (<><Sparkles className="mr-1.5 h-4 w-4" />Gerar proposta</>)}
                </Button>
              </CardContent>
            </Card>

            {iaProposta && (
              <Card className="rounded-xl border-brand/40 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-brand" /> Proposta da IA
                    <Badge variant="outline" className="ml-1 border-brand/30 bg-brand-soft text-brand">
                      prazo sugerido: {iaProposta.prazoSugerido} dias
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">Contenção imediata</div>
                    <div className="mt-1 text-sm">{iaProposta.contencao}</div>
                  </div>
                  <div className="space-y-2">
                    {iaProposta.acoes.map((a, i) => (
                      <div key={i} className="rounded-lg border border-border p-3 text-xs">
                        <div className="mb-1 font-semibold text-brand">Ação {i + 1}: {a.oque}</div>
                        <div className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                          <div>Onde: {a.onde}</div>
                          <div>Quem: {a.quem}</div>
                          <div>Quando: {a.quando}</div>
                          <div>Quanto: {a.quanto}</div>
                          <div className="sm:col-span-2">Como: {a.como}</div>
                          <div className="sm:col-span-2">Por quê: {a.porque}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-3 text-sm text-[color:var(--success)]">
                    <span className="font-semibold">Resultado esperado:</span> {iaProposta.resultado}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIaProposta(null)}>Descartar</Button>
                    <Button variant="outline" onClick={aplicarSoAcoes}>Aplicar apenas as ações</Button>
                    <Button className="bg-brand hover:bg-brand/90" onClick={aplicarTudo}>Aplicar tudo</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Contenção imediata</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[80px]"
                  value={contencao}
                  onChange={(e) => setContencao(e.target.value)}
                  placeholder="Ação de curto prazo para estancar o problema."
                />
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Ações corretivas (5W2H)</CardTitle>
                <Button variant="outline" size="sm" onClick={addAcao}>+ Ação</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {acoes.map((a, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand">Ação {i + 1}</span>
                      {acoes.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeAcao(i)}>Remover</Button>
                      )}
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div><Label className="text-xs">O quê (What)</Label><Input value={a.oque} onChange={(e) => updateAcao(i, "oque", e.target.value)} /></div>
                      <div><Label className="text-xs">Onde (Where)</Label><Input value={a.onde} onChange={(e) => updateAcao(i, "onde", e.target.value)} /></div>
                      <div><Label className="text-xs">Quem (Who)</Label><Input value={a.quem} onChange={(e) => updateAcao(i, "quem", e.target.value)} /></div>
                      <div><Label className="text-xs">Quando (When)</Label><Input value={a.quando} onChange={(e) => updateAcao(i, "quando", e.target.value)} /></div>
                      <div><Label className="text-xs">Como (How)</Label><Input value={a.como} onChange={(e) => updateAcao(i, "como", e.target.value)} /></div>
                      <div><Label className="text-xs">Quanto (How much)</Label><Input value={a.quanto} onChange={(e) => updateAcao(i, "quanto", e.target.value)} /></div>
                      <div className="md:col-span-2"><Label className="text-xs">Por quê (Why)</Label><Input value={a.porque} onChange={(e) => updateAcao(i, "porque", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <div>
                  <Label>Resultado esperado</Label>
                  <Textarea className="mt-2 min-h-[70px]" value={resultado} onChange={(e) => setResultado(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Prazos e responsáveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Responsável</Label>
                  <Input className="mt-2" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Select value={departamento} onValueChange={setDepartamento}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prazo (dias a partir de hoje)</Label>
                  <Input type="number" min={1} className="mt-2" value={prazoDias} onChange={(e) => setPrazoDias(Number(e.target.value))} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vencimento: {new Date(Date.now() + prazoDias * 86400000).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <Label>Custo estimado (R$)</Label>
                  <Input type="number" min={0} className="mt-2" value={custo} onChange={(e) => setCusto(Number(e.target.value))} />
                </div>
              </div>
              <div className="rounded-lg border border-brand/20 bg-brand-soft/30 p-3 text-xs text-foreground/80">
                <span className="font-semibold text-brand">Pronto para criar:</span> {acoes.length} ação(ões) 5W2H, contenção imediata {contencao ? "definida" : "não preenchida"}, responsável {responsavelNome}.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={!canPrev} onClick={() => setStep(step - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {canNext ? (
            <Button className="bg-brand hover:bg-brand/90" onClick={() => setStep(step + 1)}>
              Avançar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-brand hover:bg-brand/90" onClick={concluir}>
              <Check className="mr-1 h-4 w-4" /> Criar plano de ação
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}