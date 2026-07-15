import { useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  CalendarIcon,
  UploadCloud,
  X,
  Search,
  FileText,
  Image as ImageIcon,
  Film,
  ShieldAlert,
  BadgeCheck,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  mockNCs,
  usuariosMock,
  requisitosNormativos,
  slaPorGravidade,
  severityClasses,
  type Severity,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Identificação", short: "Ident." },
  { n: 2, label: "Classificação", short: "Class." },
  { n: 3, label: "Análise de Causa", short: "Causa" },
  { n: 4, label: "Plano de Ação", short: "Ação" },
  { n: 5, label: "Avaliação de Eficácia", short: "Eficácia" },
];

const CATEGORIAS = ["Qualidade", "Segurança", "Meio Ambiente", "Regulatório", "Financeiro"];
const LOCAIS = ["Produção", "Administrativo", "Serviço", "Outros"];
const ORIGENS = [
  "Auditoria interna",
  "Auditoria externa",
  "Rotina do processo",
  "Comunicação",
  "Cliente",
  "Documental",
  "Outros",
];

const NEW_CODE = "NC-2026-000042";

interface Evidence {
  id: string;
  name: string;
  size: number;
  kind: "image" | "video" | "document";
  url?: string;
}

function fileKind(name: string, type: string): Evidence["kind"] {
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name)) return "image";
  if (type.startsWith("video/") || /\.(mp4|mov|avi|mkv)$/i.test(name)) return "video";
  return "document";
}

function Stepper({ current, completed }: { current: number; completed: Set<number> }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const isDone = completed.has(s.n);
        const isActive = current === s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isDone && "border-[color:var(--success)] bg-[color:var(--success)] text-white",
                  !isDone && isActive && "border-brand bg-brand text-brand-foreground",
                  !isDone && !isActive && "border-border bg-card text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <div className="hidden sm:block">
                <div className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                  Etapa {s.n}
                </div>
                <div className={cn("text-sm", isActive ? "text-foreground font-semibold" : "text-muted-foreground")}>
                  {s.label}
                </div>
              </div>
              <div className="sm:hidden">
                <div className={cn("text-xs", isActive ? "text-foreground font-semibold" : "text-muted-foreground")}>
                  {s.short}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px flex-1", isDone ? "bg-[color:var(--success)]" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeverityCard({
  sev,
  selected,
  onSelect,
}: {
  sev: Severity;
  selected: boolean;
  onSelect: () => void;
}) {
  const sla = slaPorGravidade[sev];
  const dotColor: Record<Severity, string> = {
    Baixa: "bg-[color:var(--severity-low)]",
    Média: "bg-[color:var(--severity-medium)]",
    Alta: "bg-[color:var(--severity-high)]",
    Crítica: "bg-[color:var(--severity-critical)]",
  };
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-all",
        selected
          ? "border-brand ring-2 ring-brand/20 shadow-sm"
          : "border-border/80 hover:border-brand/40 hover:shadow-sm",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", dotColor[sev])} />
          <span className="text-sm font-semibold">{sev}</span>
        </div>
        {selected && <Check className="h-4 w-4 text-brand" />}
      </div>
      <div className="text-xs text-muted-foreground">SLA</div>
      <div className="text-sm font-medium text-foreground">{sla.label}</div>
    </button>
  );
}

function UserPicker({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 rounded-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {usuariosMock.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-brand-soft text-brand text-[10px] font-semibold">
                  {u.iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm">{u.nome}</span>
                <span className="text-[10px] text-muted-foreground">{u.cargo}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function NovaNCWizard() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  // Step 1
  const [dataOcorrencia, setDataOcorrencia] = useState<Date | undefined>(new Date("2026-07-14"));
  const [local, setLocal] = useState<string>();
  const [origem, setOrigem] = useState<string>();
  const [tipoNC, setTipoNC] = useState<"Real" | "Potencial">("Real");
  const [tipoAcao, setTipoAcao] = useState<"Corretiva" | "Preventiva">("Corretiva");
  const [descricao, setDescricao] = useState("");
  const [requisito, setRequisito] = useState<string>();
  const [reqOpen, setReqOpen] = useState(false);
  const [reincidente, setReincidente] = useState(false);
  const [ncsVinculadas, setNcsVinculadas] = useState<string[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [gravidade, setGravidade] = useState<Severity | undefined>();
  const [categoria, setCategoria] = useState<string>();
  const [responsavel, setResponsavel] = useState<string>();
  const [aprovador, setAprovador] = useState<string>();

  const prazoFinal = useMemo(() => {
    if (!gravidade) return null;
    const horas = slaPorGravidade[gravidade].horas;
    const base = dataOcorrencia ?? new Date("2026-07-15");
    return new Date(base.getTime() + horas * 3600 * 1000);
  }, [gravidade, dataOcorrencia]);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: Evidence[] = Array.from(files).map((f) => {
      const kind = fileKind(f.name, f.type);
      return {
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        kind,
        url: kind === "image" ? URL.createObjectURL(f) : undefined,
      };
    });
    setEvidences((prev) => [...prev, ...next]);
  }

  function removeEvidence(id: string) {
    setEvidences((prev) => prev.filter((e) => e.id !== id));
  }

  function goNext() {
    setCompleted((prev) => new Set(prev).add(step));
    setStep((s) => Math.min(STEPS.length, s + 1));
  }
  function goPrev() {
    setStep((s) => Math.max(1, s - 1));
  }

  const ncsCatalog = mockNCs.slice(0, 12);
  const linkedNCs = ncsCatalog.filter((nc) => ncsVinculadas.includes(nc.id));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6 pb-28">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/nao-conformidades" className="hover:text-brand">
                Não Conformidades
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span>Nova</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nova Não Conformidade
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha as etapas do fluxo. Você pode salvar como rascunho a qualquer momento.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Código</span>
            <span className="font-mono text-sm font-semibold text-brand">{NEW_CODE}</span>
          </div>
        </div>

        {/* Stepper */}
        <Card className="rounded-xl border-border/80 shadow-sm">
          <CardContent className="p-4">
            <Stepper current={step} completed={completed} />
          </CardContent>
        </Card>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="rounded-xl border-border/80 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">1. Identificação</h2>
                <p className="text-sm text-muted-foreground">
                  Registre o contexto e as evidências da não conformidade.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Código da NC</Label>
                  <Input readOnly value={NEW_CODE} className="h-10 rounded-lg bg-muted font-mono text-sm text-brand" />
                </div>
                <div className="space-y-1.5">
                  <Label>Data da ocorrência</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-10 w-full justify-start rounded-lg text-left font-normal",
                          !dataOcorrencia && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataOcorrencia
                          ? format(dataOcorrencia, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataOcorrencia}
                        onSelect={setDataOcorrencia}
                        initialFocus
                        className="pointer-events-auto p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label>Local de ocorrência</Label>
                  <Select value={local} onValueChange={setLocal}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Selecione um local" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCAIS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Origem da NC</Label>
                  <Select value={origem} onValueChange={setOrigem}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGENS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Tipo de não conformidade</Label>
                  <ToggleGroup
                    type="single"
                    value={tipoNC}
                    onValueChange={(v) => v && setTipoNC(v as "Real" | "Potencial")}
                    className="grid grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem
                      value="Real"
                      className="h-10 rounded-lg border border-border data-[state=on]:border-brand data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
                    >
                      Real
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="Potencial"
                      className="h-10 rounded-lg border border-border data-[state=on]:border-brand data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
                    >
                      Potencial
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de ação prevista</Label>
                  <ToggleGroup
                    type="single"
                    value={tipoAcao}
                    onValueChange={(v) => v && setTipoAcao(v as "Corretiva" | "Preventiva")}
                    className="grid grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem
                      value="Corretiva"
                      className="h-10 rounded-lg border border-border data-[state=on]:border-brand data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
                    >
                      Corretiva
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="Preventiva"
                      className="h-10 rounded-lg border border-border data-[state=on]:border-brand data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
                    >
                      Preventiva
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Descrição da não conformidade</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={5}
                  placeholder="Descreva o desvio observado, contexto, produto/lote envolvido e impacto imediato…"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Requisito normativo associado</Label>
                <Popover open={reqOpen} onOpenChange={setReqOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-10 w-full justify-between rounded-lg font-normal">
                      {requisito
                        ? (() => {
                            const r = requisitosNormativos.find((x) => x.id === requisito)!;
                            return `${r.codigo} — ${r.titulo}`;
                          })()
                        : <span className="text-muted-foreground">Buscar requisito…</span>}
                      <Search className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por código ou tema…" />
                      <CommandList>
                        <CommandEmpty>Nenhum requisito encontrado.</CommandEmpty>
                        <CommandGroup>
                          {requisitosNormativos.map((r) => (
                            <CommandItem
                              key={r.id}
                              value={`${r.codigo} ${r.titulo}`}
                              onSelect={() => { setRequisito(r.id); setReqOpen(false); }}
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-brand">{r.codigo}</span>
                                <span className="text-sm">{r.titulo}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <Label>Evidências</Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                    isDragging ? "border-brand bg-brand-soft/40" : "border-border/80 bg-muted/30 hover:border-brand/50 hover:bg-brand-soft/20",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    Arraste arquivos aqui ou <span className="text-brand">clique para selecionar</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Fotos, vídeos ou documentos — até 20MB por arquivo
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
                {evidences.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border/70 bg-muted"
                      >
                        {ev.kind === "image" && ev.url ? (
                          <img src={ev.url} alt={ev.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-muted-foreground">
                            {ev.kind === "video" ? <Film className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            <span className="line-clamp-2 text-center text-[10px]">{ev.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeEvidence(ev.id); }}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                          {ev.kind === "image" ? <ImageIcon className="h-2.5 w-2.5" /> : ev.kind === "video" ? <Film className="h-2.5 w-2.5" /> : <FileText className="h-2.5 w-2.5" />}
                          {(ev.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reincidente */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Reincidente?</div>
                    <div className="text-xs text-muted-foreground">
                      Marque se este desvio já ocorreu anteriormente para vincular NCs relacionadas.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs", !reincidente && "font-medium text-foreground")}>Não</span>
                    <Switch checked={reincidente} onCheckedChange={setReincidente} />
                    <span className={cn("text-xs", reincidente && "font-medium text-foreground")}>Sim</span>
                  </div>
                </div>
                {reincidente && (
                  <div className="mt-4 space-y-2">
                    <Popover open={linkOpen} onOpenChange={setLinkOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-9 w-full justify-between rounded-lg font-normal">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Search className="h-4 w-4" /> Buscar NC(s) para vincular…
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por código ou descrição…" />
                          <CommandList>
                            <CommandEmpty>Nenhuma NC encontrada.</CommandEmpty>
                            <CommandGroup>
                              {ncsCatalog.map((nc) => {
                                const isSel = ncsVinculadas.includes(nc.id);
                                return (
                                  <CommandItem
                                    key={nc.id}
                                    value={`${nc.codigo} ${nc.descricao}`}
                                    onSelect={() => {
                                      setNcsVinculadas((prev) =>
                                        prev.includes(nc.id) ? prev.filter((x) => x !== nc.id) : [...prev, nc.id],
                                      );
                                    }}
                                  >
                                    <div className="flex w-full items-center justify-between gap-2">
                                      <div className="flex flex-col">
                                        <span className="font-mono text-[11px] font-semibold text-brand">{nc.codigo}</span>
                                        <span className="line-clamp-1 text-xs">{nc.descricao}</span>
                                      </div>
                                      {isSel && <Check className="h-4 w-4 text-brand" />}
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {linkedNCs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {linkedNCs.map((nc) => (
                          <span
                            key={nc.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs text-brand"
                          >
                            <span className="font-mono font-semibold">{nc.codigo}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setNcsVinculadas((prev) => prev.filter((x) => x !== nc.id))
                              }
                              className="rounded-full p-0.5 hover:bg-brand/10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="rounded-xl border-border/80 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">2. Classificação</h2>
                <p className="text-sm text-muted-foreground">
                  Defina gravidade, categoria e responsáveis. O SLA é calculado automaticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Gravidade</Label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {(["Baixa", "Média", "Alta", "Crítica"] as Severity[]).map((s) => (
                    <SeverityCard key={s} sev={s} selected={gravidade === s} onSelect={() => setGravidade(s)} />
                  ))}
                </div>
              </div>

              {gravidade && prazoFinal && (
                <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Resumo do SLA</span>
                        <Badge variant="outline" className={cn("rounded-md border", severityClasses(gravidade))}>
                          {gravidade}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo</div>
                          <div className="text-sm font-semibold text-foreground">
                            {slaPorGravidade[gravidade].label}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vencimento</div>
                          <div className="text-sm font-semibold text-foreground">
                            {format(prazoFinal, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Escalonamento
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <ShieldAlert className="h-3.5 w-3.5 text-[color:var(--severity-high)]" />
                            {slaPorGravidade[gravidade].escalonamento}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Responsável pela tratativa</Label>
                  <UserPicker value={responsavel} onChange={setResponsavel} placeholder="Selecione o responsável" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Aprovador da classificação</Label>
                  <UserPicker value={aprovador} onChange={setAprovador} placeholder="Selecione o aprovador" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps 3-5 placeholders */}
        {step > 2 && (
          <Card className="rounded-xl border border-dashed border-border/80 bg-card/50 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Etapa {step}: {STEPS[step - 1].label}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Esta etapa será liberada em um próximo ciclo do protótipo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border/80 bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <div>
            <Button
              variant="ghost"
              onClick={goPrev}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1 rounded-lg">
              <Save className="h-4 w-4" /> Salvar rascunho
            </Button>
            <Button
              onClick={goNext}
              disabled={step === STEPS.length}
              className="gap-1 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Salvar e continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}