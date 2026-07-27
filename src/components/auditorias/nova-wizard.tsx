import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileDown,
  ShieldCheck,
  MapPin,
  Users,
  ClipboardList,
  FileText,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  locaisAuditaveis,
  normasDisponiveis,
  usuariosMock,
} from "@/lib/mock-data";
import { JawdaLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { useJawda } from "@/lib/jawda-store";

const STEPS_INTERNA = [
  { id: 1, label: "Programação", icon: ClipboardList },
  { id: 2, label: "Plano de Auditoria", icon: MapPin },
  { id: 3, label: "Relatório e emissão", icon: FileText },
];

const STEPS_EXTERNA = [{ id: 1, label: "Registro da auditoria externa", icon: ClipboardList }];

const EVENTOS = [
  "Certificação",
  "Monitoração 12 meses",
  "Monitoração 24 meses",
  "Recertificação",
  "Interna",
];

type Bloco = {
  id: string;
  horario: string;
  auditor: string;
  processo: string;
  itens: string[];
};

type Dia = { data: string; blocos: Bloco[] };

function Stepper({ current, steps }: { current: number; steps: typeof STEPS_INTERNA }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => {
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
              <span className="hidden font-medium sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.id}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChipToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-card text-muted-foreground hover:bg-brand-soft/60",
      )}
    >
      {label}
    </button>
  );
}

function EquipeCard({
  papel,
  descricao,
  defaultUser,
  multi = false,
}: {
  papel: string;
  descricao: string;
  defaultUser?: string;
  multi?: boolean;
}) {
  const [users, setUsers] = useState<string[]>(defaultUser ? [defaultUser] : []);
  const [inicio, setInicio] = useState("2026-11-09");
  const [fim, setFim] = useState("2026-11-13");
  const [declarou, setDeclarou] = useState(true);

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{papel}</CardTitle>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {users.map((uid) => {
            const u = usuariosMock.find((x) => x.id === uid);
            if (!u) return null;
            return (
              <div
                key={uid}
                className="flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-3"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand text-[10px] font-semibold text-white">
                  {u.iniciais}
                </span>
                <span className="text-xs font-medium text-foreground">{u.nome}</span>
                <button
                  type="button"
                  onClick={() => setUsers(users.filter((x) => x !== uid))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <Select
            value=""
            onValueChange={(v) => {
              if (!v) return;
              if (multi) setUsers([...users, v]);
              else setUsers([v]);
            }}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="+ Adicionar pessoa" />
            </SelectTrigger>
            <SelectContent>
              {usuariosMock
                .filter((u) => !users.includes(u.id))
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome} · {u.cargo}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Início</Label>
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Fim</Label>
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs">
          <Checkbox
            checked={declarou}
            onCheckedChange={(v) => setDeclarou(Boolean(v))}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-brand" />
            Independência e confidencialidade declaradas
          </span>
        </label>
      </CardContent>
    </Card>
  );
}

export function NovaAuditoriaWizard() {
  const navigate = useNavigate();
  const { addAuditoria } = useJawda();
  const [step, setStep] = useState(1);

  // Step 1
  const [tipo, setTipo] = useState<"Interna" | "Externa">("Interna");
  const [certificadora, setCertificadora] = useState("BRTÜV");
  const [auditorLider, setAuditorLider] = useState("u8");
  const [auditores, setAuditores] = useState<string[]>(["u1"]);
  const [equipeAmpliada, setEquipeAmpliada] = useState(false);
  const [auditoresExternos, setAuditoresExternos] = useState("Equipe da certificadora — a confirmar");
  const [relatorioExterno, setRelatorioExterno] = useState<string[]>([]);
  const [logoCliente, setLogoCliente] = useState<string | null>(null);
  const [normasSel, setNormasSel] = useState<string[]>(["ISO 9001", "ISO 14001"]);
  const [evento, setEvento] = useState<string>("Interna");
  const [escopo, setEscopo] = useState(
    "Sistema de Gestão da Qualidade e Meio Ambiente — Sede e obras ativas",
  );
  const [cargaDias, setCargaDias] = useState("5");
  const [periodicidade, setPeriodicidade] = useState("Anual");
  const [dataInicio, setDataInicio] = useState("2026-11-09");
  const [dataFim, setDataFim] = useState("2026-11-13");

  // Step 3
  const [locais, setLocais] = useState<Record<string, boolean>>({
    "Sede/Escritório": true,
    "Obra Zona Norte": true,
    "Obra Zona Sul": true,
    "Almoxarifado Central": false,
    "Filial SP": false,
    "Filial RS": false,
  });
  const [dias, setDias] = useState<Dia[]>([
    {
      data: "2026-11-09",
      blocos: [
        {
          id: "b1",
          horario: "08:00 – 08:30",
          auditor: "Auditor Externo — BRTÜV",
          processo: "Reunião de Abertura",
          itens: ["5.1", "9.2"],
        },
        {
          id: "b2",
          horario: "08:30 – 12:00",
          auditor: "Auditor Externo — BRTÜV",
          processo: "Contexto e Liderança",
          itens: ["4.1", "4.2", "5.1"],
        },
        {
          id: "b3",
          horario: "13:30 – 17:30",
          auditor: "Auditor Externo — BRTÜV",
          processo: "Planejamento e Riscos",
          itens: ["6.1", "6.2", "6.3"],
        },
      ],
    },
    {
      data: "2026-11-10",
      blocos: [
        {
          id: "b4",
          horario: "08:00 – 12:00",
          auditor: "Ana Ribeiro",
          processo: "Operação — Produção",
          itens: ["8.1", "8.5"],
        },
        {
          id: "b5",
          horario: "13:30 – 17:00",
          auditor: "Marcos Vinícius",
          processo: "Suprimentos e Fornecedores",
          itens: ["8.4"],
        },
      ],
    },
  ]);

  const toggleNorma = (n: string) =>
    setNormasSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  const addBloco = (di: number) => {
    setDias((ds) =>
      ds.map((d, i) =>
        i === di
          ? {
              ...d,
              blocos: [
                ...d.blocos,
                {
                  id: `b-${Date.now()}`,
                  horario: "—",
                  auditor: "",
                  processo: "",
                  itens: [],
                },
              ],
            }
          : d,
      ),
    );
  };
  const removeBloco = (di: number, bi: number) => {
    setDias((ds) =>
      ds.map((d, i) => (i === di ? { ...d, blocos: d.blocos.filter((_, j) => j !== bi) } : d)),
    );
  };
  const addDia = () => {
    const lastDate = new Date(dias[dias.length - 1]?.data ?? dataInicio);
    lastDate.setDate(lastDate.getDate() + 1);
    setDias([...dias, { data: lastDate.toISOString().slice(0, 10), blocos: [] }]);
  };

  const locaisSelecionados = useMemo(
    () => Object.entries(locais).filter(([, v]) => v).map(([k]) => k),
    [locais],
  );

  // Overlap detection: parse "08:00 – 12:00" into minutes and flag conflicts
  const parseRange = (h: string): [number, number] | null => {
    const m = h.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])];
  };
  const blocosConflito = useMemo(() => {
    const conflict = new Set<string>();
    dias.forEach((d) => {
      for (let i = 0; i < d.blocos.length; i++) {
        for (let j = i + 1; j < d.blocos.length; j++) {
          const a = d.blocos[i], b = d.blocos[j];
          if (!a.auditor || a.auditor !== b.auditor) continue;
          const ra = parseRange(a.horario), rb = parseRange(b.horario);
          if (!ra || !rb) continue;
          if (ra[0] < rb[1] && rb[0] < ra[1]) {
            conflict.add(a.id); conflict.add(b.id);
          }
        }
      }
    });
    return conflict;
  }, [dias]);

  // IA — Montar plano de auditoria
  const [iaLoading, setIaLoading] = useState(false);
  const [iaNota, setIaNota] = useState<string | null>(null);

  const montarComIA = () => {
    if (normasSel.length === 0) {
      toast.error("Selecione ao menos uma norma para a IA propor a agenda.");
      return;
    }
    setIaLoading(true);
    setTimeout(() => {
      const carga = Math.max(1, Number(cargaDias) || 3);
      const startDate = new Date(dataInicio);
      const propostaProcessos = [
        { processo: "Alta Direção — Contexto e Liderança", itens: ["4.1", "4.2", "5.1", "5.2", "6.1", "9.3"] },
        { processo: "Planejamento e Riscos", itens: ["6.1", "6.2", "6.3"] },
        { processo: "Operação — Produção", itens: ["8.1", "8.5", "8.6"] },
        { processo: "Suprimentos e Fornecedores", itens: ["8.4"] },
        { processo: "Recursos Humanos e Competência", itens: ["7.1", "7.2", "7.3"] },
        { processo: "Gestão Documental e Comunicação", itens: ["7.4", "7.5"] },
        { processo: "Avaliação de Desempenho e Melhoria", itens: ["9.1", "9.2", "10.1", "10.2"] },
      ];
      const novosDias: Dia[] = [];
      let idx = 0;
      for (let d = 0; d < carga; d++) {
        const data = new Date(startDate);
        data.setDate(startDate.getDate() + d);
        const blocos: Bloco[] = [];
        if (d === 0) {
          blocos.push({
            id: `ia-${Date.now()}-open`,
            horario: "08:00 – 08:30",
            auditor: "Auditor Líder",
            processo: "Reunião de Abertura",
            itens: ["5.1", "9.2"],
          });
        }
        const restantes = d === 0 ? 2 : 3;
        for (let b = 0; b < restantes && idx < propostaProcessos.length; b++, idx++) {
          const p = propostaProcessos[idx];
          const horario = b === 0 ? "08:30 – 12:00" : b === 1 ? "13:30 – 15:30" : "15:45 – 17:30";
          blocos.push({
            id: `ia-${Date.now()}-${d}-${b}`,
            horario,
            auditor: b % 2 === 0 ? "Ana Ribeiro" : "Marcos Vinícius",
            processo: p.processo,
            itens: p.itens,
          });
        }
        if (d === carga - 1) {
          blocos.push({
            id: `ia-${Date.now()}-close`,
            horario: "17:30 – 18:00",
            auditor: "Auditor Líder",
            processo: "Reunião de Encerramento",
            itens: ["9.2", "10.2"],
          });
        }
        novosDias.push({ data: data.toISOString().slice(0, 10), blocos });
      }
      setDias(novosDias);
      setIaNota(
        "Sugeri auditar Suprimentos junto de 8.4 porque o último ciclo apontou fragilidade em qualificação de fornecedor. Alta Direção concentrada no D1 para liberar auditor líder nos processos operacionais.",
      );
      setIaLoading(false);
      toast.success("Agenda gerada pela IA — revise e ajuste antes de emitir.");
    }, 1800);
  };

  const emitir = () => {
    if (blocosConflito.size > 0) {
      toast.error("Existem sobreposições de horário do mesmo auditor. Ajuste antes de emitir.");
      return;
    }
    const lider = usuariosMock.find((u) => u.id === auditorLider);
    const aud = addAuditoria({
      tipo,
      normas: normasSel,
      evento: evento as "Certificação" | "Monitoração 12 meses" | "Monitoração 24 meses" | "Recertificação" | "Auditoria Interna Ciclo 2026",
      escopo,
      status: "Programada",
      mesInicio: new Date(dataInicio).getMonth() + 1,
      mesFim: new Date(dataFim).getMonth() + 1,
      dataInicio,
      dataFim,
      locais: locaisSelecionados,
      ...(tipo === "Externa"
        ? { certificadora }
        : lider
          ? {
              auditorLider: { nome: lider.nome, iniciais: lider.iniciais },
              equipe: auditores
                .map((id) => usuariosMock.find((u) => u.id === id))
                .filter(Boolean)
                .map((u) => ({ nome: u!.nome })),
            }
          : {}),
    });
    toast.success(
      tipo === "Externa" ? "Auditoria externa programada" : "Plano de Auditoria emitido",
      {
        description:
          tipo === "Externa"
            ? `${aud.codigo} · ${certificadora} — registro externo criado.`
            : `${aud.codigo} · ${normasSel.join(" · ")} — ${evento}. Aguardando ciência do auditor líder.`,
      },
    );
    setTimeout(() => navigate({ to: "/auditorias" }), 700);
  };

  const steps = tipo === "Interna" ? STEPS_INTERNA : STEPS_EXTERNA;
  const canNext = step < steps.length;
  const canPrev = step > 1;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              <Link to="/auditorias" className="hover:text-foreground">
                Auditorias
              </Link>{" "}
              / Nova
            </div>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground">
              Programar Nova Auditoria
            </h1>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link to="/auditorias">Cancelar</Link>
          </Button>
        </header>

        <Card className="rounded-xl">
          <CardContent className="p-4">
            <Stepper current={step} steps={steps} />
          </CardContent>
        </Card>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Dados gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tipo de auditoria</Label>
                  <div className="mt-2 flex gap-2">
                    <ChipToggle
                      label="Interna"
                      active={tipo === "Interna"}
                      onClick={() => setTipo("Interna")}
                    />
                    <ChipToggle
                      label="Externa"
                      active={tipo === "Externa"}
                      onClick={() => setTipo("Externa")}
                    />
                  </div>
                </div>
                <div>
                  <Label>Evento</Label>
                  <Select value={evento} onValueChange={setEvento}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENTOS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Normas auditadas</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {normasDisponiveis.map((n) => (
                    <ChipToggle
                      key={n}
                      label={n}
                      active={normasSel.includes(n)}
                      onClick={() => toggleNorma(n)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Escopo</Label>
                <Textarea
                  value={escopo}
                  onChange={(e) => setEscopo(e.target.value)}
                  className="mt-2 min-h-[90px]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Carga (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={cargaDias}
                    onChange={(e) => setCargaDias(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Periodicidade</Label>
                  <Select value={periodicidade} onValueChange={setPeriodicidade}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anual">Anual</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Trienal">Trienal (recertificação)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Data fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <EquipeCard
              papel="Auditor Líder"
              descricao="Responsável pela condução da auditoria e emissão do relatório final."
              defaultUser="u8"
            />
            <EquipeCard
              papel="Auditores"
              descricao="Equipe designada para as áreas técnicas."
              defaultUser="u1"
              multi
            />
            <EquipeCard
              papel="Especialista"
              descricao="Suporte técnico em requisitos específicos da norma."
              multi
            />
            <EquipeCard
              papel="Trainee"
              descricao="Auditor em formação — participa sob supervisão."
              multi
            />
            <EquipeCard
              papel="Observadores"
              descricao="Acompanham sem intervir (clientes, direção, terceiros)."
              multi
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="rounded-xl border-brand/30 bg-brand-soft/30">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" />
                  <div>
                    <div className="text-sm font-semibold text-brand">Montar plano de auditoria com IA</div>
                    <div className="text-xs text-muted-foreground">
                      A partir das normas, escopo e carga em dias, a IA propõe a agenda distribuindo processos por dia com itens da norma vinculados.
                    </div>
                  </div>
                </div>
                <Button className="bg-brand hover:bg-brand/90" onClick={montarComIA} disabled={iaLoading}>
                  {iaLoading ? (<><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />IA analisando…</>) : (<><Sparkles className="mr-1.5 h-4 w-4" />Gerar agenda</>)}
                </Button>
              </CardContent>
            </Card>
            {iaNota && (
              <div className="flex items-start gap-2 rounded-lg border border-brand/30 bg-brand-soft/40 p-3 text-xs text-foreground/80">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 text-brand" />
                <div><span className="font-semibold text-brand">Nota da IA:</span> {iaNota}</div>
              </div>
            )}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Locais do sistema de gestão</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Selecione quais locais serão auditados neste ciclo.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {locaisAuditaveis.map((l) => (
                    <label
                      key={l}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {l}
                      </span>
                      <Switch
                        checked={locais[l] ?? false}
                        onCheckedChange={(v) => setLocais({ ...locais, [l]: Boolean(v) })}
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Agenda por dia</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Monte a programação com blocos de horário, auditor e requisitos auditados.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addDia}>
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar dia
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {dias.map((dia, di) => (
                  <div key={dia.data + di} className="rounded-xl border border-border bg-muted/20 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={dia.data}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDias((ds) => ds.map((d, i) => (i === di ? { ...d, data: v } : d)));
                          }}
                          className="h-8 w-[160px]"
                        />
                        <span className="text-xs text-muted-foreground">
                          {dia.blocos.length} bloco(s)
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => addBloco(di)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Bloco
                      </Button>
                    </div>
                    <div className="space-y-2">
                       {dia.blocos.map((b, bi) => {
                         const conflict = blocosConflito.has(b.id);
                         return (
                         <div
                           key={b.id}
                           className={cn(
                             "grid gap-2 rounded-lg border bg-card p-3 md:grid-cols-[140px_1fr_1fr_1.5fr_auto] md:items-center",
                             conflict ? "border-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/60" : "border-border",
                           )}
                         >
                           {conflict && (
                             <div className="col-span-full flex items-center gap-1 text-[10px] font-semibold text-[color:var(--severity-high)]">
                               <AlertTriangle className="h-3 w-3" /> Sobreposição de horário para este auditor
                             </div>
                           )}
                          <Input
                            value={b.horario}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDias((ds) =>
                                ds.map((d, i) =>
                                  i === di
                                    ? {
                                        ...d,
                                        blocos: d.blocos.map((x, j) =>
                                          j === bi ? { ...x, horario: v } : x,
                                        ),
                                      }
                                    : d,
                                ),
                              );
                            }}
                            className="h-8 text-xs"
                            placeholder="08:00 – 09:30"
                          />
                          <Input
                            value={b.auditor}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDias((ds) =>
                                ds.map((d, i) =>
                                  i === di
                                    ? {
                                        ...d,
                                        blocos: d.blocos.map((x, j) =>
                                          j === bi ? { ...x, auditor: v } : x,
                                        ),
                                      }
                                    : d,
                                ),
                              );
                            }}
                            className="h-8 text-xs"
                            placeholder="Auditor responsável"
                          />
                          <Input
                            value={b.processo}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDias((ds) =>
                                ds.map((d, i) =>
                                  i === di
                                    ? {
                                        ...d,
                                        blocos: d.blocos.map((x, j) =>
                                          j === bi ? { ...x, processo: v } : x,
                                        ),
                                      }
                                    : d,
                                ),
                              );
                            }}
                            className="h-8 text-xs"
                            placeholder="Processo / setor"
                          />
                          <div className="flex flex-wrap items-center gap-1">
                            {b.itens.map((it) => (
                              <span
                                key={it}
                                className="rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand"
                              >
                                {it}
                              </span>
                            ))}
                            <Input
                              placeholder="+ item"
                              className="h-6 w-16 text-[10px]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const v = (e.target as HTMLInputElement).value.trim();
                                  if (!v) return;
                                  setDias((ds) =>
                                    ds.map((d, i) =>
                                      i === di
                                        ? {
                                            ...d,
                                            blocos: d.blocos.map((x, j) =>
                                              j === bi ? { ...x, itens: [...x.itens, v] } : x,
                                            ),
                                          }
                                        : d,
                                    ),
                                  );
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBloco(di, bi)}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                         </div>
                         );
                       })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card className="rounded-xl">
            <CardContent className="space-y-6 p-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <JawdaLogo size={28} />
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground">Plano de Auditoria</div>
                    <div>Emissão: {new Date().toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Tipo
                    </div>
                    <div className="text-sm text-foreground">{tipo}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Evento
                    </div>
                    <div className="text-sm text-foreground">{evento}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Normas
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {normasSel.map((n) => (
                        <span
                          key={n}
                          className="rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Período
                    </div>
                    <div className="text-sm text-foreground">
                      {new Date(dataInicio).toLocaleDateString("pt-BR")} —{" "}
                      {new Date(dataFim).toLocaleDateString("pt-BR")} ({cargaDias} dias)
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Escopo
                    </div>
                    <div className="text-sm text-foreground">{escopo}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Locais
                    </div>
                    <div className="text-sm text-foreground">
                      {locaisSelecionados.join(" · ") || "—"}
                    </div>
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={["abertura"]} className="mt-6">
                  <AccordionItem value="abertura">
                    <AccordionTrigger className="text-sm">
                      Tópicos padrão · Reunião de Abertura
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        <li>Apresentação da equipe auditora e do escopo</li>
                        <li>Confirmação de objetivos, critérios e método de amostragem</li>
                        <li>Declaração de independência e confidencialidade</li>
                        <li>Comunicação de riscos e canais de contato</li>
                        <li>Confirmação da agenda e horários</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="encerramento">
                    <AccordionTrigger className="text-sm">
                      Tópicos padrão · Reunião de Encerramento
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        <li>Agradecimentos e resumo do trabalho executado</li>
                        <li>Apresentação de OPMs e não conformidades identificadas</li>
                        <li>Conclusões do auditor líder</li>
                        <li>Prazos para plano de ação e envio do relatório</li>
                        <li>Assinatura da ata de encerramento</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="agenda">
                    <AccordionTrigger className="text-sm">Agenda ({dias.length} dias)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {dias.map((d) => (
                          <div key={d.data} className="rounded-lg border border-border p-3">
                            <div className="mb-2 text-xs font-semibold text-foreground">
                              {new Date(d.data).toLocaleDateString("pt-BR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                              })}
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {d.blocos.map((b) => (
                                <li key={b.id}>
                                  <span className="font-mono text-foreground">{b.horario}</span> ·{" "}
                                  {b.processo} — {b.auditor}
                                  {b.itens.length > 0 && (
                                    <span className="ml-1 text-brand">({b.itens.join(", ")})</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Assinatura do auditor líder</Label>
                    <Input placeholder="Ex.: Marcos Vinícius" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline">
                  <FileDown className="mr-1.5 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button className="bg-brand hover:bg-brand/90" onClick={emitir}>
                  <Check className="mr-1.5 h-4 w-4" />
                  Emitir Plano de Auditoria
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={!canPrev} onClick={() => setStep(step - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          {canNext && (
            <Button className="bg-brand hover:bg-brand/90" onClick={() => setStep(step + 1)}>
              Avançar
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
