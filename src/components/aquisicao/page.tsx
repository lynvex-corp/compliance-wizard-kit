import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Search, Star, Paperclip, ChevronLeft, AlertTriangle, CheckCircle2,
  Mail, Sliders, ListChecks, Building2, Bell, Send, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FORNECEDORES_SEED, CRITERIOS_QUALIFICACAO, CRITERIOS_AVALIACAO, PERIODICIDADES,
  ordinalAvaliacao, pendenciasDe, diasPara, duasAbaixo,
  type Fornecedor, type Categoria, type Periodicidade, type StatusForn, type CriterioSel,
} from "@/lib/fornecedores-data";

const statusColor: Record<StatusForn, string> = {
  Qualificado: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em qualificação": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Desqualificado: "bg-[color:var(--severity-critical)]/15 text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/30",
};

function Nota({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-[color:var(--warning)] text-[color:var(--warning)]" />
      <span className="font-mono text-[11px] font-semibold text-foreground">{n.toFixed(1)}</span>
    </span>
  );
}

/* ------------------------------- Cadastro -------------------------------- */

function CadastroDialog({
  open, onOpenChange, inicial, onSalvar,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  inicial?: Fornecedor | null; onSalvar: (f: Fornecedor) => void;
}) {
  const base: Fornecedor = inicial ?? {
    id: "", nomeFantasia: "", ramo: "", cnpj: "", representante: "", contato: "", email: "",
    fornece: "", categoria: "Material", status: "Em qualificação", criterios: [],
    notaMinima: 7, periodicidade: "Anual", proximaAvaliacao: "—", avaliacoes: [],
  };
  const [f, setF] = useState<Fornecedor>(base);
  const set = <K extends keyof Fornecedor>(k: K, v: Fornecedor[K]) => setF((p) => ({ ...p, [k]: v }));

  // Integração futura possível: consulta automática de CNPJ em base pública
  // (ex.: ReceitaWS / BrasilAPI). Aqui a busca é simulada e apenas preenche os campos.
  const buscarCnpj = () => {
    if (!f.cnpj.trim()) return toast.error("Informe o CNPJ para buscar.");
    toast.loading("Consultando base pública…", { id: "cnpj" });
    setTimeout(() => {
      setF((p) => ({
        ...p,
        nomeFantasia: p.nomeFantasia || "Indústria Consultada Ltda",
        ramo: p.ramo || "Fabricação de produtos diversos",
        representante: p.representante || "Sócio-administrador informado na base",
        contato: p.contato || "(11) 3000-0000",
        email: p.email || "contato@empresaconsultada.com.br",
      }));
      toast.success("Dados preenchidos a partir da consulta pública", { id: "cnpj" });
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">{inicial ? "Editar cadastro do fornecedor" : "Novo fornecedor"}</DialogTitle>
          <DialogDescription className="text-xs">Dados cadastrais do fornecedor de material ou serviço.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">CNPJ</Label>
            <div className="flex gap-2">
              <Input value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00"
                className="h-9 font-mono text-xs" />
              <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 rounded-lg text-[11px]" onClick={buscarCnpj}>
                <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Buscar automaticamente
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Consulta simulada a base pública de CNPJ.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Nome Fantasia</Label>
            <Input value={f.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Ramo</Label>
            <Input value={f.ramo} onChange={(e) => set("ramo", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Nome do Representante</Label>
            <Input value={f.representante} onChange={(e) => set("representante", e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Contato</Label>
            <Input value={f.contato} onChange={(e) => set("contato", e.target.value)} className="h-9 text-xs" placeholder="(00) 0000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">E-mail</Label>
            <Input value={f.email} onChange={(e) => set("email", e.target.value)} className="h-9 text-xs" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Categoria</Label>
            <Select value={f.categoria} onValueChange={(v) => set("categoria", v as Categoria)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Material" className="text-xs">Material</SelectItem>
                <SelectItem value="Serviço" className="text-xs">Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">O que fornece</Label>
            <Textarea value={f.fornece} onChange={(e) => set("fornece", e.target.value)} rows={2} className="text-xs"
              placeholder="Ex.: Material de escritório, Serviço de transporte, Serviço de consultoria" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"
            disabled={!f.nomeFantasia.trim()}
            onClick={() => { onSalvar(f); onOpenChange(false); toast.success("Cadastro salvo."); }}>
            Salvar cadastro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Critérios / Parâmetros ----------------------- */

function CriteriosDialog({
  open, onOpenChange, selecionados, onConfirmar,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  selecionados: CriterioSel[]; onConfirmar: (c: CriterioSel[]) => void;
}) {
  const [marcados, setMarcados] = useState<string[]>(selecionados.map((c) => c.nome));
  const toggle = (n: string) =>
    setMarcados((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Selecione os Critérios de Qualificação</DialogTitle>
          <DialogDescription className="text-xs">
            Lista fechada. Cada critério selecionado exige anexo de evidência ou observação justificando a ausência.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
          {CRITERIOS_QUALIFICACAO.map((c) => (
            <label key={c} className="flex items-start gap-2 rounded-lg border border-border/60 px-3 py-2 text-xs">
              <Checkbox className="mt-0.5" checked={marcados.includes(c)} onCheckedChange={() => toggle(c)} />
              <span className="text-foreground/85">{c}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"
            onClick={() => {
              onConfirmar(marcados.map((n) => selecionados.find((s) => s.nome === n) ?? { nome: n }));
              onOpenChange(false);
              toast.success(`${marcados.length} critério(s) aplicado(s).`);
            }}>
            Aplicar critérios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ParametrosDialog({
  open, onOpenChange, forn, onSalvar,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; forn: Fornecedor;
  onSalvar: (notaMinima: number, periodicidade: Periodicidade) => void;
}) {
  const [nota, setNota] = useState(forn.notaMinima);
  const [per, setPer] = useState<Periodicidade>(forn.periodicidade);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Definir Parâmetros</DialogTitle>
          <DialogDescription className="text-xs">
            A contagem da periodicidade começa a partir da 1ª avaliação realizada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <Label>Nota mínima de aprovação</Label>
              <span className="font-mono font-semibold text-brand">{nota.toFixed(1)} / 10</span>
            </div>
            <Slider min={1} max={10} step={0.5} value={[nota]} onValueChange={(v) => setNota(v[0])} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Periodicidade da avaliação</Label>
            <Select value={per} onValueChange={(v) => setPer(v as Periodicidade)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODICIDADES.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            Notificação automática ao Gestor da Qualidade quando o prazo da reavaliação se aproximar (30 dias) ou atrasar.
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"
            onClick={() => { onSalvar(nota, per); onOpenChange(false); toast.success("Parâmetros definidos."); }}>
            Salvar parâmetros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- Avaliação -------------------------------- */

function AvaliacaoDialog({
  open, onOpenChange, forn, onRegistrar,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; forn: Fornecedor;
  onRegistrar: (notas: Record<string, number>, media: number, mensagem: string) => void;
}) {
  const ordem = forn.avaliacoes.length + 1;
  const [notas, setNotas] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIOS_AVALIACAO.map((c) => [c, 8])),
  );
  const media = CRITERIOS_AVALIACAO.reduce((a, c) => a + notas[c], 0) / CRITERIOS_AVALIACAO.length;
  const aprovado = media >= forn.notaMinima;
  const sugestao = aprovado
    ? `Prezado(a) ${forn.representante || forn.nomeFantasia}, agradecemos pelo desempenho apresentado nesta ${ordinalAvaliacao(ordem)} (média ${media.toFixed(1)}). Seguimos contando com a parceria e com a manutenção do padrão de qualidade.`
    : `Prezado(a) ${forn.representante || forn.nomeFantasia}, na ${ordinalAvaliacao(ordem)} o desempenho ficou em ${media.toFixed(1)}, abaixo da nota mínima acordada (${forn.notaMinima.toFixed(1)}). Solicitamos agendamento de tratativa para alinhamento e plano de melhoria.`;
  const [mensagem, setMensagem] = useState(sugestao);
  const [tocado, setTocado] = useState(false);
  const msg = tocado ? mensagem : sugestao;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {forn.nomeFantasia}
            <Badge variant="outline" className="rounded-md border-brand/40 bg-brand-soft text-[10px] text-brand">
              {ordinalAvaliacao(ordem)}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">Nota mínima de aprovação: {forn.notaMinima.toFixed(1)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {CRITERIOS_AVALIACAO.map((c) => (
            <div key={c} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground">{c}</span>
                <span className="font-mono font-semibold text-brand">{notas[c]}/10</span>
              </div>
              <Slider min={1} max={10} step={1} value={[notas[c]]} onValueChange={(v) => setNotas({ ...notas, [c]: v[0] })} />
            </div>
          ))}

          <div className={cn("flex items-center justify-between rounded-xl border p-3",
            aprovado ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10"
              : "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10")}>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Média final</div>
              <div className="text-xl font-bold text-foreground">{media.toFixed(2)} <span className="text-xs text-muted-foreground">/ 10</span></div>
            </div>
            <Badge className={cn("rounded-md text-white", aprovado ? "bg-[color:var(--success)]" : "bg-[color:var(--severity-critical)]")}>
              {aprovado ? "Aprovado" : "Abaixo da nota mínima"}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[11px]">
              <Mail className="h-3.5 w-3.5 text-brand" /> Mensagem de retorno ao fornecedor
            </Label>
            <Textarea value={msg} rows={4} className="text-xs"
              onChange={(e) => { setTocado(true); setMensagem(e.target.value); }} />
            <p className="text-[10px] text-muted-foreground">
              Enviada por e-mail para {forn.email || "—"} · remetente: perfil Gestor da Qualidade.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90"
            onClick={() => { onRegistrar(notas, media, msg); onOpenChange(false); }}>
            <Send className="mr-1.5 h-4 w-4" /> Registrar e enviar retorno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Detalhe -------------------------------- */

function Detalhe({
  forn, onVoltar, onChange,
}: { forn: Fornecedor; onVoltar: () => void; onChange: (f: Fornecedor) => void }) {
  const [editar, setEditar] = useState(false);
  const [criterios, setCriterios] = useState(false);
  const [params, setParams] = useState(false);
  const [avaliar, setAvaliar] = useState(false);
  const pend = pendenciasDe(forn);
  const alerta = duasAbaixo(forn);

  const registrarAvaliacao = (notas: Record<string, number>, media: number, mensagem: string) => {
    const ordem = forn.avaliacoes.length + 1;
    const hoje = new Date().toLocaleDateString("pt-BR");
    const meses = forn.periodicidade === "Trimestral" ? 3 : forn.periodicidade === "Semestral" ? 6 : 12;
    const prox = new Date();
    prox.setMonth(prox.getMonth() + meses);
    onChange({
      ...forn,
      avaliacoes: [...forn.avaliacoes, { ordem, data: hoje, notas, media, mensagem }],
      proximaAvaliacao: prox.toLocaleDateString("pt-BR"),
      status: media >= forn.notaMinima ? "Qualificado" : forn.status,
    });
    toast.success(`${ordinalAvaliacao(ordem)} registrada`, { description: `Retorno enviado por e-mail a ${forn.email || "—"}.` });
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="mb-1 h-7 px-1 text-[11px] text-muted-foreground" onClick={onVoltar}>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Voltar para fornecedores
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            {forn.nomeFantasia}
            <Badge variant="outline" className="rounded-md border-brand/40 bg-brand-soft text-[10px] text-brand">
              Avaliação atual: {ordinalAvaliacao(Math.max(1, forn.avaliacoes.length))}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{forn.ramo} · {forn.categoria} · {forn.fornece}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-lg text-[11px]" onClick={() => setEditar(true)}>Editar cadastro</Button>
          <Button size="sm" variant="outline" className="rounded-lg text-[11px]" onClick={() => setCriterios(true)}>
            <ListChecks className="mr-1.5 h-3.5 w-3.5" /> Selecione os Critérios de Qualificação
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg text-[11px]" onClick={() => setParams(true)}>
            <Sliders className="mr-1.5 h-3.5 w-3.5" /> Definir Parâmetros
          </Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setAvaliar(true)}>
            Avaliar fornecedor
          </Button>
        </div>
      </div>

      {alerta && (
        <Card className="rounded-xl border-[color:var(--severity-critical)]/50 bg-[color:var(--severity-critical)]/10 shadow-none">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--severity-critical)]" />
            <div className="text-[11px]">
              <div className="text-xs font-semibold text-[color:var(--severity-critical)]">
                Duas avaliações seguidas abaixo da média
              </div>
              <div className="text-muted-foreground">
                Recomenda-se tomada de decisão pela liderança: tratativa formal, plano de ação com o fornecedor
                ou substituição. Registre a decisão na próxima análise crítica.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pend.length > 0 && (
        <Card className="rounded-xl border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 shadow-none">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[color:var(--severity-high)]">
              <AlertTriangle className="h-4 w-4" /> {pend.length} pendência(s) no fornecedor
            </div>
            <ul className="ml-6 list-disc space-y-0.5 text-[11px] text-muted-foreground">
              {pend.map((p, i) => <li key={i}><strong className="text-foreground/80">{p.tipo}:</strong> {p.detalhe}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cadastro">
        <TabsList className="rounded-lg bg-muted/60 p-1">
          <TabsTrigger value="cadastro" className="rounded-md text-xs">Cadastro e qualificação</TabsTrigger>
          <TabsTrigger value="avaliacoes" className="rounded-md text-xs">Avaliações e reavaliações ({forn.avaliacoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="mt-4 space-y-4">
          <Card className="rounded-xl border-border/70 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-brand" /> Dados cadastrais</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-xs md:grid-cols-3">
              {[
                ["CNPJ", forn.cnpj], ["Nome Fantasia", forn.nomeFantasia], ["Ramo", forn.ramo],
                ["Representante", forn.representante], ["Contato", forn.contato], ["E-mail", forn.email],
                ["Categoria", forn.categoria], ["Fornece", forn.fornece],
                ["Nota mínima / periodicidade", `${forn.notaMinima.toFixed(1)} · ${forn.periodicidade}`],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
                  <div className="text-foreground/85">{v || "—"}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><ListChecks className="h-4 w-4 text-brand" /> Critérios de qualificação selecionados</CardTitle>
              <p className="text-[11px] text-muted-foreground">Cada critério exige anexo de evidência ou observação justificando a ausência.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {forn.criterios.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
                  Nenhum critério selecionado.
                </div>
              )}
              {forn.criterios.map((c, i) => {
                const falta = !c.anexo && !(c.observacao && c.observacao.trim());
                return (
                  <div key={c.nome} className={cn("grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_auto_1.2fr]",
                    falta ? "border-[color:var(--warning)]/50 bg-[color:var(--warning)]/5" : "border-border/70")}>
                    <div className="text-xs font-medium text-foreground/85">{c.nome}</div>
                    <label className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border px-2 text-[11px] text-muted-foreground hover:border-brand/50">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span className="max-w-[140px] truncate">{c.anexo || "Anexar evidência"}</span>
                      <input type="file" className="hidden" onChange={(e) => {
                        const nome = e.target.files?.[0]?.name;
                        if (!nome) return;
                        const next = [...forn.criterios];
                        next[i] = { ...c, anexo: nome };
                        onChange({ ...forn, criterios: next });
                      }} />
                    </label>
                    <Input defaultValue={c.observacao ?? ""} placeholder="Observação (justifique a ausência do anexo)"
                      className="h-8 text-[11px]"
                      onBlur={(e) => {
                        const next = [...forn.criterios];
                        next[i] = { ...c, observacao: e.target.value };
                        onChange({ ...forn, criterios: next });
                      }} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <Bell className="h-3.5 w-3.5 text-brand" />
            Próxima avaliação prevista: <strong className="text-foreground/85">{forn.proximaAvaliacao}</strong>
            {forn.proximaAvaliacao !== "—" && (
              <span>· {diasPara(forn.proximaAvaliacao) < 0 ? `${Math.abs(diasPara(forn.proximaAvaliacao))} dia(s) em atraso` : `faltam ${diasPara(forn.proximaAvaliacao)} dia(s)`}</span>
            )}
          </div>
          {forn.avaliacoes.length === 0 ? (
            <Card className="rounded-xl border-dashed"><CardContent className="py-10 text-center text-xs text-muted-foreground">
              Nenhuma avaliação realizada. A contagem da periodicidade começa na 1ª avaliação.
            </CardContent></Card>
          ) : forn.avaliacoes.slice().reverse().map((a) => (
            <Card key={a.ordem} className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-md text-[10px]">{ordinalAvaliacao(a.ordem)}</Badge>
                    <span className="text-[11px] text-muted-foreground">{a.data}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Nota n={a.media} />
                    <Badge className={cn("rounded-md text-white", a.media >= forn.notaMinima ? "bg-[color:var(--success)]" : "bg-[color:var(--severity-critical)]")}>
                      {a.media >= forn.notaMinima ? "Aprovado" : "Abaixo da nota mínima"}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CRITERIOS_AVALIACAO.map((c) => (
                    <div key={c} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-1.5 text-[11px]">
                      <span className="text-foreground/85">{c}</span>
                      <span className="font-mono font-semibold text-brand">{a.notas[c]}/10</span>
                    </div>
                  ))}
                </div>
                {a.mensagem && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                    <span>{a.mensagem}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {editar && (
        <CadastroDialog open={editar} onOpenChange={setEditar} inicial={forn}
          onSalvar={(f) => onChange({ ...forn, ...f, id: forn.id })} />
      )}
      {criterios && (
        <CriteriosDialog open={criterios} onOpenChange={setCriterios} selecionados={forn.criterios}
          onConfirmar={(c) => onChange({ ...forn, criterios: c })} />
      )}
      {params && (
        <ParametrosDialog open={params} onOpenChange={setParams} forn={forn}
          onSalvar={(n, p) => onChange({ ...forn, notaMinima: n, periodicidade: p })} />
      )}
      {avaliar && (
        <AvaliacaoDialog open={avaliar} onOpenChange={setAvaliar} forn={forn} onRegistrar={registrarAvaliacao} />
      )}
    </div>
  );
}

/* ---------------------------------- Lista --------------------------------- */

export function AquisicaoPage() {
  const [lista, setLista] = useState<Fornecedor[]>(FORNECEDORES_SEED);
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todas");
  const [sel, setSel] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);

  const filtrados = useMemo(
    () => lista.filter((f) =>
      (cat === "Todas" || f.categoria === cat) &&
      (f.nomeFantasia + f.ramo + f.fornece).toLowerCase().includes(busca.toLowerCase())),
    [lista, busca, cat],
  );

  const atual = lista.find((f) => f.id === sel) ?? null;
  const atualizar = (f: Fornecedor) => setLista((p) => p.map((x) => (x.id === f.id ? f : x)));

  if (atual) {
    return <AppShell><Detalhe forn={atual} onVoltar={() => setSel(null)} onChange={atualizar} /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Suprimentos · Fornecedores</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastro, qualificação, avaliação e reavaliação de fornecedores de material e serviço.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar fornecedor…"
                className="h-9 w-56 rounded-lg pl-8 text-xs" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Todas", "Material", "Serviço"].map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => setNovo(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Novo fornecedor
            </Button>
          </div>
        </header>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Ramo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Última avaliação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((f) => {
                  const pend = pendenciasDe(f);
                  const ult = f.avaliacoes[f.avaliacoes.length - 1];
                  return (
                    <TableRow key={f.id} className="cursor-pointer text-xs" onClick={() => setSel(f.id)}>
                      <TableCell className="font-semibold text-foreground">
                        {f.nomeFantasia}
                        {duasAbaixo(f) && (
                          <Badge className="ml-2 rounded-md bg-[color:var(--severity-critical)] text-[9px] text-white">2 notas baixas</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{f.ramo}</TableCell>
                      <TableCell><Badge variant="outline" className="rounded-md text-[10px]">{f.categoria}</Badge></TableCell>
                      <TableCell>
                        {ult ? (
                          <span className="flex items-center gap-2">
                            <Nota n={ult.media} />
                            <span className="text-[10px] text-muted-foreground">{ordinalAvaliacao(ult.ordem)} · {ult.data}</span>
                          </span>
                        ) : <span className="text-muted-foreground">Sem avaliação</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[f.status])}>{f.status}</Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {pend.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--success)]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Em dia
                          </span>
                        ) : (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="inline-flex cursor-help items-center gap-1 rounded-md border border-[color:var(--warning)]/50 bg-[color:var(--warning)]/10 px-2 py-0.5 text-[11px] text-[color:var(--severity-high)]">
                                <AlertTriangle className="h-3.5 w-3.5" /> {pend.length} pendência(s)
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 text-[11px]">
                              <div className="mb-1 text-xs font-semibold text-foreground">Pendências do cadastro</div>
                              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                                {pend.map((p, i) => <li key={i}><strong className="text-foreground/80">{p.tipo}:</strong> {p.detalhe}</li>)}
                              </ul>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-[11px] text-muted-foreground">
          Clique em um fornecedor para abrir o cadastro completo, os critérios de qualificação e o histórico de avaliações.
        </p>
      </div>

      {novo && (
        <CadastroDialog open={novo} onOpenChange={setNovo} onSalvar={(f) =>
          setLista((p) => [{ ...f, id: `FOR-${String(p.length + 1).padStart(3, "0")}` }, ...p])} />
      )}
    </AppShell>
  );
}
