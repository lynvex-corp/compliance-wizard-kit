import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle, BellRing, CheckCircle2, Clock, Eye, Megaphone, Plus, Send, Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Todas as listas suspensas em ordem alfabética (regra global do sistema)
const FORMAS = [
  "Aplicativo de mensagem",
  "Comunicação impressa",
  "Comunicação informal",
  "Comunicação virtual",
  "Diálogo de Segurança",
  "E-mail",
  "Quadro de aviso",
  "Reunião de análise crítica",
  "Reunião de rotina",
];
const RESPONSAVEIS = ["Alta Direção", "Comercial", "Gestor da Qualidade", "Recursos Humanos"];
const TIPOS = ["Externa", "Interna"];
const PERFIS_ALVO = ["Alta Direção", "Comercial", "Colaborador", "Gestor da Qualidade", "Gestor de Área", "Recursos Humanos", "Todos"];
const PERFIS_SESSAO = ["Alta Direção", "Colaborador", "Comercial", "Gestor da Qualidade", "Recursos Humanos"];
const COMUNICADORES = ["Alta Direção", "Comercial", "Gestor da Qualidade", "Recursos Humanos"];

const EXPEDIENTE = { inicio: "08:00", fim: "18:00" };

type ProcessoCom = {
  id: string;
  tipo: string;
  descricao: string;
  forma: string;
  responsavel: string;
  quando: string;
  sobDemanda: boolean;
  publico: string[];
};

type Leitura = { perfil: string; ciente: boolean; cienteEm?: string };

type Comunicacao = {
  id: string;
  tipo: string;
  descricao: string;
  responsavel: string;
  quando: string;
  publico: string[];
  leituras: Leitura[];
};

const PROCESSOS_INICIAIS: ProcessoCom[] = [
  { id: "PC-001", tipo: "Interna", descricao: "Divulgação da Política da Qualidade (rev. 04) e dos objetivos do SG.", forma: "Quadro de aviso", responsavel: "Gestor da Qualidade", quando: "", sobDemanda: true, publico: ["Todos"] },
  { id: "PC-002", tipo: "Interna", descricao: "Resultados da análise crítica da direção e desempenho dos indicadores.", forma: "Reunião de análise crítica", responsavel: "Alta Direção", quando: "2026-09-15", sobDemanda: false, publico: ["Gestor da Qualidade", "Gestor de Área"] },
  { id: "PC-003", tipo: "Interna", descricao: "Diálogo diário de segurança antes do início do turno na produção.", forma: "Diálogo de Segurança", responsavel: "Recursos Humanos", quando: "", sobDemanda: true, publico: ["Colaborador"] },
  { id: "PC-004", tipo: "Interna", descricao: "Alinhamento semanal de rotina das áreas operacionais.", forma: "Reunião de rotina", responsavel: "Gestor de Área", quando: "", sobDemanda: true, publico: ["Gestor de Área", "Colaborador"] },
  { id: "PC-005", tipo: "Externa", descricao: "Confirmação de pedidos, prazos e especificações com clientes.", forma: "E-mail", responsavel: "Comercial", quando: "", sobDemanda: true, publico: ["Comercial"] },
  { id: "PC-006", tipo: "Externa", descricao: "Envio de relatório de auditoria externa ao organismo certificador.", forma: "Comunicação virtual", responsavel: "Gestor da Qualidade", quando: "2026-11-20", sobDemanda: false, publico: ["Alta Direção", "Gestor da Qualidade"] },
  { id: "PC-007", tipo: "Interna", descricao: "Repasse informal de ajustes pontuais de processo entre turnos.", forma: "Comunicação informal", responsavel: "Gestor de Área", quando: "", sobDemanda: true, publico: ["Colaborador"] },
  { id: "PC-008", tipo: "Interna", descricao: "Avisos urgentes de parada de linha e mudança de escala.", forma: "Aplicativo de mensagem", responsavel: "Recursos Humanos", quando: "", sobDemanda: true, publico: ["Todos"] },
];

const COMUNICACOES_INICIAIS: Comunicacao[] = [
  {
    id: "CM-2026-014", tipo: "Interna",
    descricao: "Revisão 04 da Política da Qualidade publicada. Leitura obrigatória antes do dia 20/08.",
    responsavel: "Gestor da Qualidade", quando: "2026-08-14T09:00",
    publico: ["Todos"],
    leituras: [
      { perfil: "Alta Direção", ciente: true, cienteEm: "14/08 09:41" },
      { perfil: "Colaborador", ciente: false },
      { perfil: "Comercial", ciente: true, cienteEm: "14/08 11:02" },
      { perfil: "Recursos Humanos", ciente: true, cienteEm: "14/08 10:15" },
    ],
  },
  {
    id: "CM-2026-015", tipo: "Interna",
    descricao: "Resultado da auditoria interna do 2º semestre: 3 NCs registradas no módulo de Não Conformidades.",
    responsavel: "Gestor da Qualidade", quando: "2026-08-17T14:30",
    publico: ["Alta Direção", "Gestor de Área", "Colaborador"],
    leituras: [
      { perfil: "Alta Direção", ciente: true, cienteEm: "17/08 15:10" },
      { perfil: "Colaborador", ciente: false },
    ],
  },
  {
    id: "CM-2026-016", tipo: "Externa",
    descricao: "Comunicado a fornecedores sobre nova especificação de embalagem MP-2231.",
    responsavel: "Comercial", quando: "2026-08-12T10:00",
    publico: ["Comercial"],
    leituras: [{ perfil: "Comercial", ciente: true, cienteEm: "12/08 10:22" }],
  },
];

function alcance(c: Comunicacao) {
  if (!c.leituras.length) return 0;
  return Math.round((c.leituras.filter((l) => l.ciente).length / c.leituras.length) * 100);
}

function dentroExpediente(hora: string) {
  if (!hora) return true;
  return hora >= EXPEDIENTE.inicio && hora <= EXPEDIENTE.fim;
}

function PublicoPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (p: string) => {
    if (p === "Todos") return onChange(value.includes("Todos") ? [] : ["Todos"]);
    const next = value.filter((v) => v !== "Todos");
    onChange(next.includes(p) ? next.filter((v) => v !== p) : [...next, p]);
  };
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border/70 p-2.5">
      {PERFIS_ALVO.map((p) => (
        <label key={p} className="flex items-center gap-2 text-[11px] text-foreground/85">
          <Checkbox checked={value.includes(p)} onCheckedChange={() => toggle(p)} />
          {p}
        </label>
      ))}
    </div>
  );
}

export function ComunicacoesPage() {
  const [perfil, setPerfil] = useState("Gestor da Qualidade");
  const [processos, setProcessos] = useState(PROCESSOS_INICIAIS);
  const [comunicacoes, setComunicacoes] = useState(COMUNICACOES_INICIAIS);

  const ehComunicador = COMUNICADORES.includes(perfil);

  const recebidas = useMemo(
    () => comunicacoes.filter((c) => c.publico.includes("Todos") || c.publico.includes(perfil)),
    [comunicacoes, perfil],
  );
  const enviadas = useMemo(
    () => comunicacoes.filter((c) => c.responsavel === perfil),
    [comunicacoes, perfil],
  );
  const naoLidas = recebidas.filter((c) => !c.leituras.find((l) => l.perfil === perfil)?.ciente);

  const darCiente = (id: string) => {
    const agora = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    setComunicacoes((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const existe = c.leituras.some((l) => l.perfil === perfil);
        return {
          ...c,
          leituras: existe
            ? c.leituras.map((l) => (l.perfil === perfil ? { ...l, ciente: true, cienteEm: agora } : l))
            : [...c.leituras, { perfil, ciente: true, cienteEm: agora }],
        };
      }),
    );
    toast.success("Ciência registrada", { description: `Recebimento de ${id} registrado em ${agora}.` });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Comunicações</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Processo de comunicação e disparo de comunicados — requisito 7.4 da ISO 9001.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Perfil da sessão</Label>
              <Select value={perfil} onValueChange={setPerfil}>
                <SelectTrigger className="mt-1 h-9 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERFIS_SESSAO.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {ehComunicador && <NovaComunicacaoDialog perfil={perfil} onCreate={(c) => setComunicacoes((p) => [c, ...p])} />}
          </div>
        </header>

        {naoLidas.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-soft px-4 py-3">
            <BellRing className="h-4 w-4 shrink-0 text-brand" />
            <p className="text-xs text-foreground/85">
              <strong>{naoLidas.length}</strong> comunicação(ões) nova(s) aguardando sua ciência.
            </p>
          </div>
        )}

        {!ehComunicador ? (
          <QuadroEmpregado recebidas={recebidas} perfil={perfil} onCiente={darCiente} />
        ) : (
          <Tabs defaultValue="processo" className="space-y-4">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="processo" className="text-xs">Processo de comunicação</TabsTrigger>
              <TabsTrigger value="historico" className="text-xs">Histórico e leituras</TabsTrigger>
              <TabsTrigger value="minhas" className="text-xs">
                Recebidas
                {naoLidas.length > 0 && (
                  <Badge className="ml-2 h-4 rounded-full bg-[color:var(--severity-critical)] px-1.5 text-[10px] text-white">
                    {naoLidas.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processo" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-2xl text-xs text-muted-foreground">
                  Registro de como as comunicações acontecem na organização, incluindo as que ocorrem fora do
                  sistema (reuniões, diálogos de segurança, comunicação informal). Serve como evidência do
                  processo de comunicação exigido pela norma.
                </p>
                <NovoProcessoDialog onCreate={(p) => setProcessos((prev) => [...prev, p])} />
              </div>
              <Card className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[11px]">Código</TableHead>
                        <TableHead className="text-[11px]">Tipo</TableHead>
                        <TableHead className="text-[11px]">Descrição</TableHead>
                        <TableHead className="text-[11px]">Forma</TableHead>
                        <TableHead className="text-[11px]">Responsável</TableHead>
                        <TableHead className="text-[11px]">Quando</TableHead>
                        <TableHead className="text-[11px]">Quem será comunicado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processos.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-[11px] text-brand">{p.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-md text-[10px]">{p.tipo}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[320px] text-[11px] text-foreground/85">{p.descricao}</TableCell>
                          <TableCell className="text-[11px]">{p.forma}</TableCell>
                          <TableCell className="text-[11px]">{p.responsavel}</TableCell>
                          <TableCell className="text-[11px]">
                            {p.sobDemanda ? (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" /> Sob demanda
                              </span>
                            ) : (
                              new Date(`${p.quando}T00:00`).toLocaleDateString("pt-BR")
                            )}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            <div className="flex flex-wrap gap-1">
                              {p.publico.map((x) => (
                                <Badge key={x} variant="outline" className="rounded-md text-[10px] text-muted-foreground">{x}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Como perfil comunicador, você vê as comunicações que enviou e os respectivos registros de leitura.
              </p>
              {enviadas.length === 0 && (
                <Card className="rounded-xl border-dashed"><CardContent className="py-12 text-center text-xs text-muted-foreground">
                  Nenhuma comunicação enviada por este perfil.
                </CardContent></Card>
              )}
              {enviadas.map((c) => (
                <Card key={c.id} className="rounded-xl border-border/70 shadow-sm">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-brand">{c.id}</span>
                          <Badge variant="outline" className="rounded-md text-[10px]">{c.tipo}</Badge>
                        </div>
                        <p className="mt-1 max-w-2xl text-sm text-foreground">{c.descricao}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand">{alcance(c)}%</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">alcance</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Programada para {new Date(c.quando).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {c.leituras.map((l) => (
                        <div key={l.perfil} className={cn(
                          "flex items-center justify-between rounded-lg border p-2.5 text-[11px]",
                          l.ciente ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10" : "border-border/70 bg-muted/20",
                        )}>
                          <span className="flex items-center gap-1.5 font-medium text-foreground/85">
                            {l.ciente ? <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                            {l.perfil}
                          </span>
                          <span className="text-muted-foreground">{l.ciente ? `Ciente · ${l.cienteEm}` : "Aguardando ciência"}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="minhas">
              <QuadroEmpregado recebidas={recebidas} perfil={perfil} onCiente={darCiente} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppShell>
  );
}

function QuadroEmpregado({
  recebidas, perfil, onCiente,
}: { recebidas: Comunicacao[]; perfil: string; onCiente: (id: string) => void }) {
  const pendentes = recebidas.filter((c) => !c.leituras.find((l) => l.perfil === perfil)?.ciente);
  const lidas = recebidas.filter((c) => c.leituras.find((l) => l.perfil === perfil)?.ciente);

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand"><Megaphone className="h-4 w-4" /></div>
          <h2 className="text-sm font-semibold text-foreground">Novas comunicações</h2>
          <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{pendentes.length}</Badge>
        </div>
        {pendentes.length === 0 ? (
          <Card className="rounded-xl border-dashed"><CardContent className="py-10 text-center text-xs text-muted-foreground">
            Nenhuma comunicação pendente de ciência.
          </CardContent></Card>
        ) : (
          pendentes.map((c) => (
            <Card key={c.id} className="rounded-xl border-brand/40 bg-brand-soft/40 shadow-sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--severity-high)]" />
                    <span className="font-mono text-[11px] text-brand">{c.id}</span>
                    <Badge variant="outline" className="rounded-md text-[10px]">{c.tipo}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{c.descricao}</p>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {c.responsavel} · {new Date(c.quando).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
                <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={() => onCiente(c.id)}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Ciente
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Users className="h-4 w-4" /></div>
          <h2 className="text-sm font-semibold text-foreground">Histórico recebido</h2>
        </div>
        <Card className="rounded-xl border-border/70 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px]">Código</TableHead>
                  <TableHead className="text-[11px]">Descrição</TableHead>
                  <TableHead className="text-[11px]">Responsável</TableHead>
                  <TableHead className="text-[11px]">Ciência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lidas.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                    Nenhuma comunicação com ciência registrada.
                  </TableCell></TableRow>
                ) : lidas.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-[11px] text-brand">{c.id}</TableCell>
                    <TableCell className="max-w-[420px] text-[11px] text-foreground/85">{c.descricao}</TableCell>
                    <TableCell className="text-[11px]">{c.responsavel}</TableCell>
                    <TableCell className="text-[11px] text-[color:var(--success)]">
                      {c.leituras.find((l) => l.perfil === perfil)?.cienteEm}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function NovoProcessoDialog({ onCreate }: { onCreate: (p: ProcessoCom) => void }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("Interna");
  const [descricao, setDescricao] = useState("");
  const [forma, setForma] = useState(FORMAS[0]);
  const [responsavel, setResponsavel] = useState(RESPONSAVEIS[0]);
  const [sobDemanda, setSobDemanda] = useState(false);
  const [quando, setQuando] = useState("");
  const [publico, setPublico] = useState<string[]>([]);

  const salvar = () => {
    if (!descricao.trim() || publico.length === 0 || (!sobDemanda && !quando)) {
      toast.error("Preencha descrição, quando comunicar e quem será comunicado.");
      return;
    }
    onCreate({
      id: `PC-${String(Math.floor(Math.random() * 900) + 100)}`,
      tipo, descricao, forma, responsavel, sobDemanda, quando, publico,
    });
    toast.success("Registro de processo de comunicação criado.");
    setOpen(false);
    setDescricao(""); setPublico([]); setQuando(""); setSobDemanda(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-lg">
          <Plus className="mr-1.5 h-4 w-4" /> Novo Registro de Processo de Comunicação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Novo Registro de Processo de Comunicação</DialogTitle>
          <DialogDescription className="text-xs">
            Documente como a comunicação acontece, inclusive fora do sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Tipo de comunicação</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Responsável</Label>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{RESPONSAVEIS.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[11px]">Descrição da comunicação</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="mt-1 text-xs"
              placeholder="Ex.: Divulgação mensal dos indicadores de qualidade nas reuniões de rotina." />
          </div>
          <div>
            <Label className="text-[11px]">Forma de comunicação</Label>
            <Select value={forma} onValueChange={setForma}>
              <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{FORMAS.map((f) => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px]">Sob demanda</Label>
              <Switch checked={sobDemanda} onCheckedChange={setSobDemanda} />
            </div>
            {!sobDemanda && (
              <div className="mt-2">
                <Label className="text-[11px]">Quando comunicar</Label>
                <Input type="date" value={quando} onChange={(e) => setQuando(e.target.value)} className="mt-1 h-9 text-xs" />
              </div>
            )}
          </div>
          <div>
            <Label className="text-[11px]">Quem será comunicado</Label>
            <div className="mt-1"><PublicoPicker value={publico} onChange={setPublico} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={salvar}>Salvar registro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovaComunicacaoDialog({ perfil, onCreate }: { perfil: string; onCreate: (c: Comunicacao) => void }) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState("Interna");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("09:00");
  const [publico, setPublico] = useState<string[]>([]);
  const horaValida = dentroExpediente(hora);

  const enviar = () => {
    if (!descricao.trim() || !data || publico.length === 0) {
      toast.error("Preencha descrição, data/horário e quem será comunicado.");
      return;
    }
    if (!horaValida) {
      toast.error("Horário fora do expediente", { description: `Selecione entre ${EXPEDIENTE.inicio} e ${EXPEDIENTE.fim}.` });
      return;
    }
    const destinos = publico.includes("Todos")
      ? PERFIS_SESSAO.filter((p) => p !== perfil)
      : publico;
    onCreate({
      id: `CM-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      tipo, descricao, responsavel: perfil, quando: `${data}T${hora}`, publico,
      leituras: destinos.map((p) => ({ perfil: p, ciente: false })),
    });
    toast.success("Comunicação programada", { description: `Envio em ${new Date(`${data}T${hora}`).toLocaleString("pt-BR")}.` });
    setOpen(false);
    setDescricao(""); setPublico([]); setData("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-lg bg-brand text-white hover:bg-brand/90">
          <Send className="mr-1.5 h-4 w-4" /> Nova Comunicação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Comunicação</DialogTitle>
          <DialogDescription className="text-xs">
            Disparo real do comunicado aos perfis selecionados, com registro de ciência.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px]">Responsável</Label>
              <Input value={perfil} readOnly className="mt-1 h-9 bg-muted/40 text-xs" />
            </div>
          </div>
          <div>
            <Label className="text-[11px]">Descrição da comunicação</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} className="mt-1 text-xs"
              placeholder="Ex.: Publicada a revisão 05 do procedimento de inspeção de recebimento." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Data programada</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px]">Horário programado</Label>
              <Input
                type="time" value={hora} min={EXPEDIENTE.inicio} max={EXPEDIENTE.fim}
                onChange={(e) => setHora(e.target.value)}
                className={cn("mt-1 h-9 text-xs", !horaValida && "border-[color:var(--severity-critical)]")}
              />
            </div>
          </div>
          <div className={cn(
            "rounded-lg border p-2.5 text-[11px]",
            horaValida ? "border-border/70 bg-muted/20 text-muted-foreground"
              : "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]",
          )}>
            {horaValida
              ? `Envios permitidos apenas dentro do expediente (${EXPEDIENTE.inicio} às ${EXPEDIENTE.fim}).`
              : `Horário fora do expediente. A comunicação deve ser programada entre ${EXPEDIENTE.inicio} e ${EXPEDIENTE.fim} para garantir que o destinatário esteja em jornada de trabalho.`}
          </div>
          <div>
            <Label className="text-[11px]">Quem será comunicado</Label>
            <div className="mt-1"><PublicoPicker value={publico} onChange={setPublico} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" disabled={!horaValida} className="rounded-lg bg-brand text-white hover:bg-brand/90" onClick={enviar}>
            <Send className="mr-1.5 h-4 w-4" /> Enviar comunicação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
