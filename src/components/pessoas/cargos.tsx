import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Lock, ShieldAlert, Plus, Trash2, Upload, FileText, CheckCircle2, X, Info, Pencil,
  AlertTriangle, Briefcase, Users, ClipboardCheck, CalendarClock, PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CARGOS_SEED, PESSOAS_SEED, PERFIS_ACESSO, PERFIS_AUTORIZADOS, SETORES,
  itensObrigatorios, pendenciasDaPessoa,
  type AcaoCompetencia, type AnexoPessoa, type CargoPerfil, type PerfilAcesso,
  type Pessoa, type SituacaoCompetencia,
} from "@/lib/pessoas-data";

const SITUACOES: SituacaoCompetencia[] = ["Atende", "Atende parcialmente", "Não atende"];
const LGPD_KEY = "jawda.cargos.lgpd";
const CIENCIA_KEY = "jawda.cargos.ciencia";
const EU = "Marcos Vinícius"; // pessoa simulada no perfil "Usuário comum"

const hoje = () => new Date().toLocaleDateString("pt-BR");
const agora = () => new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const chip: Record<SituacaoCompetencia, string> = {
  "Atende": "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
  "Atende parcialmente": "border-[color:var(--severity-medium)]/40 bg-[color:var(--severity-medium)]/10 text-[color:var(--severity-medium)]",
  "Não atende": "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]",
};

/* ------------------------------- barra de itens ---------------------------- */

function BarraDeItens({ label, hint, itens, onChange, placeholder }: {
  label: string; hint?: string; itens: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [valor, setValor] = useState("");
  const add = () => {
    const v = valor.trim();
    if (!v) return;
    if (itens.includes(v)) { toast.error("Item já adicionado."); return; }
    onChange([...itens, v]);
    setValor("");
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <div className="flex gap-2">
        <Input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
        <Button type="button" variant="outline" className="h-9 gap-1 whitespace-nowrap" onClick={add}>
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>
      <div className="space-y-1">
        {itens.map((t, i) => (
          <div key={`${t}-${i}`} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-xs">
            <span className="text-foreground/85">{t}</span>
            <button type="button" onClick={() => onChange(itens.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-[color:var(--severity-critical)]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {itens.length === 0 && <p className="text-xs text-muted-foreground">Nenhum item adicionado.</p>}
      </div>
    </div>
  );
}

/* --------------------------------- página ---------------------------------- */

export function CargosPage() {
  const [perfil, setPerfil] = useState<PerfilAcesso>("Gestor da Qualidade");
  const [aceite, setAceite] = useState<{ perfil: string; em: string } | null>(null);
  const [hidratado, setHidratado] = useState(false);
  const [check, setCheck] = useState(false);

  const [cargos, setCargos] = useState<CargoPerfil[]>(CARGOS_SEED);
  const [pessoas, setPessoas] = useState<Pessoa[]>(PESSOAS_SEED);

  const [editCargo, setEditCargo] = useState<CargoPerfil | null>(null);
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null);
  const [acoesDe, setAcoesDe] = useState<string | null>(null);
  const [excluir, setExcluir] = useState<{ tipo: "cargo" | "pessoa"; id: string; nome: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LGPD_KEY);
      if (raw) setAceite(JSON.parse(raw));
    } catch { /* ignore */ }
    setHidratado(true);
  }, []);

  const autorizado = PERFIS_AUTORIZADOS.includes(perfil);
  const isDiretoria = perfil === "Diretoria";
  const comum = perfil === "Usuário comum";
  const cargoDe = (id: string) => cargos.find((c) => c.id === id);

  function aceitarTermo() {
    const registro = { perfil, em: agora() };
    setAceite(registro);
    localStorage.setItem(LGPD_KEY, JSON.stringify(registro));
    toast.success("Termo LGPD aceito", { description: `${registro.perfil} — ${registro.em}` });
  }

  const seletorPerfil = (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">Visão de demonstração:</span>
      <Select value={perfil} onValueChange={(v) => setPerfil(v as PerfilAcesso)}>
        <SelectTrigger className="h-8 w-[190px] text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PERFIS_ACESSO.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  /* ------------------------------ usuário comum ---------------------------- */
  if (comum) {
    return (
      <AppShell>
        <MinhaVisao
          pessoa={pessoas.find((p) => p.nome === EU)!}
          cargo={cargoDe(pessoas.find((p) => p.nome === EU)!.cargoId)}
          seletorPerfil={seletorPerfil}
          onAssinar={(em) => setPessoas((s) => s.map((p) => p.nome === EU ? { ...p, cienciaAssinadaEm: em } : p))}
        />
      </AppShell>
    );
  }

  /* ------------------------------ acesso negado ---------------------------- */
  if (!autorizado) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-16">
          <Card className="rounded-2xl border-[color:var(--severity-critical)]/30">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--severity-critical)]/10">
                <ShieldAlert className="h-7 w-7 text-[color:var(--severity-critical)]" />
              </div>
              <h1 className="text-xl font-semibold">Acesso negado</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Cargos e Perfis contém dados pessoais sensíveis. O acesso é liberado automaticamente apenas para{" "}
                <strong>Gestor da Qualidade</strong> e <strong>Diretoria</strong>. Seu perfil atual é <strong>{perfil}</strong>.
              </p>
              {seletorPerfil}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const novoCargo = (): CargoPerfil => ({
    id: `c${Date.now()}`, nome: "", requisitosTecnicos: [], requisitosDesejaveis: [],
    treinamentos: [], responsabilidades: "", criadoEm: hoje(),
  });
  const novaPessoa = (): Pessoa => ({
    id: `p${Date.now()}`, nome: "", matricula: "", email: "", admissao: "",
    cargoId: "", setor: "", situacao: "Atende", anexos: [], acoes: [],
    atualizadoEm: hoje(), cienciaAssinadaEm: null,
  });

  function salvarPessoa(p: Pessoa) {
    let final = { ...p, atualizadoEm: hoje() };
    const precisaAcao = final.situacao !== "Atende";
    const jaTemAberta = final.acoes.some((a) => !a.dataRealizacao);
    if (precisaAcao && !jaTemAberta) {
      final = {
        ...final,
        acoes: [...final.acoes, {
          id: `ac${Date.now()}`, metodologia: "", responsavel: "", prazoPrevisto: "",
          dataRealizacao: null, evidencia: null, motivo: final.situacao, abertaEm: hoje(),
        }],
      };
      toast.warning("Ação de competência aberta automaticamente", {
        description: `${final.nome} — situação "${final.situacao}".`,
      });
    }
    setPessoas((s) => s.some((x) => x.id === final.id) ? s.map((x) => x.id === final.id ? final : x) : [...s, final]);
    setEditPessoa(null);
    toast.success("Registro de pessoa salvo");
  }

  const pessoaAcoes = pessoas.find((p) => p.id === acoesDe) ?? null;

  return (
    <AppShell>
      <TooltipProvider delayDuration={150}>
        <div className="mx-auto max-w-[1400px] space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cargos e Perfis</h1>
                <Badge variant="outline" className="gap-1 rounded-md border-border bg-muted text-[10px] uppercase text-muted-foreground">
                  <Lock className="h-3 w-3" /> Dados restritos
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Registre o cargo com seu perfil de requisitos e, depois, as pessoas que ocupam cada cargo.
              </p>
              {aceite && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Termo LGPD aceito por {aceite.perfil} em {aceite.em}.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {seletorPerfil}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2" onClick={() => setEditCargo(novoCargo())}>
                    <Briefcase className="h-4 w-4" /> Novo Registro de Cargo
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Cadastre primeiro o cargo com seu perfil e requisitos. Depois cadastre as pessoas e associe cada uma a um cargo.
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setEditPessoa(novaPessoa())}>
                    <Users className="h-4 w-4" /> Novo Registro de Pessoa
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Cadastre primeiro o cargo com seu perfil e requisitos. Depois cadastre as pessoas e associe cada uma a um cargo.
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          <div className="flex items-start gap-2 rounded-xl border border-brand/20 bg-brand-soft/40 p-3 text-xs text-foreground/80">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>
              <strong>Como usar:</strong> cadastre primeiro o cargo com seu perfil e requisitos. Depois cadastre as pessoas
              e associe cada uma a um cargo. Um cargo existe sozinho e pode ser ocupado por várias pessoas.
            </span>
          </div>

          <Tabs defaultValue="pessoas">
            <TabsList className="rounded-lg">
              <TabsTrigger value="pessoas" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Pessoas ({pessoas.length})</TabsTrigger>
              <TabsTrigger value="cargos" className="gap-1.5 text-xs"><Briefcase className="h-3.5 w-3.5" /> Cargos ({cargos.length})</TabsTrigger>
            </TabsList>

            {/* ------------------------------ pessoas ------------------------------ */}
            <TabsContent value="pessoas" className="mt-4">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        <TableHead>Pessoa</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Situação da competência</TableHead>
                        <TableHead>Pendência</TableHead>
                        <TableHead>Ação de competência</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pessoas.map((p) => {
                        const cargo = cargoDe(p.cargoId);
                        const pend = pendenciasDaPessoa(p, cargo);
                        const acaoAberta = p.acoes.some((a) => !a.dataRealizacao);
                        return (
                          <TableRow key={p.id} className="text-xs">
                            <TableCell>
                              <div className="font-semibold text-foreground">{p.nome}</div>
                              <div className="text-[10px] text-muted-foreground">Matrícula {p.matricula || "—"}</div>
                            </TableCell>
                            <TableCell className="text-foreground/80">{cargo?.nome ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{p.setor || "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("rounded-md text-[10px]", chip[p.situacao])}>{p.situacao}</Badge>
                            </TableCell>
                            <TableCell>
                              {pend.length === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--success)]">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Completo
                                </span>
                              ) : (
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <button className="inline-flex items-center gap-1 rounded-md border border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--severity-critical)]">
                                      <AlertTriangle className="h-3 w-3" /> {pend.length} pendência{pend.length > 1 ? "s" : ""}
                                    </button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80 text-xs">
                                    <div className="mb-1 font-semibold">Pendências de {p.nome}</div>
                                    <ul className="space-y-1 text-muted-foreground">
                                      {pend.map((x, i) => (
                                        <li key={i} className="flex gap-1.5">
                                          <span className="text-[color:var(--severity-critical)]">•</span>
                                          <span>[{x.tipo}] {x.texto}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </HoverCardContent>
                                </HoverCard>
                              )}
                            </TableCell>
                            <TableCell>
                              {p.acoes.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground">—</span>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => setAcoesDe(p.id)}>
                                  <ClipboardCheck className="h-3.5 w-3.5" />
                                  {p.acoes.length} ação(ões) · {acaoAberta ? "em andamento" : "concluída"}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7" disabled={!isDiretoria}
                                title={isDiretoria ? "Editar" : "Somente a Diretoria pode editar"}
                                onClick={() => setEditPessoa(p)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-[color:var(--severity-critical)]" disabled={!isDiretoria}
                                title={isDiretoria ? "Excluir" : "Somente a Diretoria pode excluir"}
                                onClick={() => setExcluir({ tipo: "pessoa", id: p.id, nome: p.nome })}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {!isDiretoria && (
                    <p className="border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
                      Editar e excluir são exclusivos da Diretoria — por isso aparecem desabilitados neste perfil.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ------------------------------- cargos ------------------------------ */}
            <TabsContent value="cargos" className="mt-4">
              <Card className="rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        <TableHead>Cargo</TableHead>
                        <TableHead>Requisitos técnicos</TableHead>
                        <TableHead>Treinamentos necessários</TableHead>
                        <TableHead>Pessoas no cargo</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cargos.map((c) => {
                        const ocupantes = pessoas.filter((p) => p.cargoId === c.id);
                        return (
                          <TableRow key={c.id} className="text-xs">
                            <TableCell className="font-semibold text-foreground">{c.nome}</TableCell>
                            <TableCell className="text-muted-foreground">{c.requisitosTecnicos.length}</TableCell>
                            <TableCell className="text-muted-foreground">{c.treinamentos.length}</TableCell>
                            <TableCell>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-[11px]">
                                    <Users className="h-3.5 w-3.5 text-brand" /> {ocupantes.length}
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-64 text-xs">
                                  <div className="mb-1 font-semibold">Ocupantes de {c.nome}</div>
                                  {ocupantes.length === 0 ? <p className="text-muted-foreground">Nenhuma pessoa associada.</p> : (
                                    <ul className="space-y-0.5 text-muted-foreground">
                                      {ocupantes.map((o) => <li key={o.id}>{o.nome} — {o.setor}</li>)}
                                    </ul>
                                  )}
                                </HoverCardContent>
                              </HoverCard>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditCargo(c)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-[color:var(--severity-critical)]" disabled={!isDiretoria}
                                title={isDiretoria ? "Excluir" : "Somente a Diretoria pode excluir"}
                                onClick={() => setExcluir({ tipo: "cargo", id: c.id, nome: c.nome })}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Termo LGPD */}
        <Dialog open={hidratado && !aceite}>
          <DialogContent className="max-w-lg rounded-2xl [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand" /> Termo de confidencialidade — LGPD
              </DialogTitle>
              <DialogDescription className="text-left">
                Esta tela contém dados pessoais sensíveis (saúde ocupacional e documentos pessoais). O acesso é
                registrado e o uso é permitido exclusivamente para a gestão de competências.
              </DialogDescription>
            </DialogHeader>
            <label className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
              <Checkbox checked={check} onCheckedChange={(v) => setCheck(!!v)} className="mt-0.5" />
              <span>Declaro estar ciente das obrigações da LGPD e assumo a responsabilidade pelo sigilo destes dados.</span>
            </label>
            <DialogFooter>
              <Button disabled={!check} onClick={aceitarTermo} className="bg-brand text-brand-foreground hover:bg-brand/90">
                Li e aceito
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {editCargo && (
          <CargoDialog
            cargo={editCargo}
            onClose={() => setEditCargo(null)}
            onSave={(c) => {
              if (!c.nome.trim()) { toast.error("Informe o nome do cargo."); return; }
              setCargos((s) => s.some((x) => x.id === c.id) ? s.map((x) => x.id === c.id ? c : x) : [...s, c]);
              setEditCargo(null);
              toast.success("Registro de cargo salvo");
            }}
          />
        )}

        {editPessoa && (
          <PessoaDialog
            pessoa={editPessoa}
            cargos={cargos}
            onClose={() => setEditPessoa(null)}
            onSave={salvarPessoa}
          />
        )}

        {pessoaAcoes && (
          <AcoesDialog
            pessoa={pessoaAcoes}
            cargo={cargoDe(pessoaAcoes.cargoId)}
            onClose={() => setAcoesDe(null)}
            onUpdate={(atualizada) => setPessoas((s) => s.map((x) => x.id === atualizada.id ? atualizada : x))}
          />
        )}

        {excluir && (
          <Dialog open onOpenChange={(v) => !v && setExcluir(null)}>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Excluir {excluir.tipo === "cargo" ? "cargo" : "pessoa"}</DialogTitle>
                <DialogDescription>
                  Confirma a exclusão de <strong>{excluir.nome}</strong>? Esta ação é registrada na trilha de auditoria.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setExcluir(null)}>Cancelar</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (excluir.tipo === "cargo") setCargos((s) => s.filter((x) => x.id !== excluir.id));
                    else setPessoas((s) => s.filter((x) => x.id !== excluir.id));
                    setExcluir(null);
                    toast.success("Registro excluído");
                  }}
                >
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </TooltipProvider>
    </AppShell>
  );
}

/* ------------------------------ dialog cargo ------------------------------- */

function CargoDialog({ cargo, onClose, onSave }: {
  cargo: CargoPerfil; onClose: () => void; onSave: (c: CargoPerfil) => void;
}) {
  const [form, setForm] = useState<CargoPerfil>(cargo);
  const set = <K extends keyof CargoPerfil>(k: K, v: CargoPerfil[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{cargo.nome ? `${cargo.nome} — perfil do cargo` : "Novo Registro de Cargo"}</DialogTitle>
          <DialogDescription>
            O cargo existe sozinho: aqui se define o perfil exigido, sem nome de pessoa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do cargo</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Analista da Qualidade" />
          </div>

          <BarraDeItens
            label="Requisitos técnicos necessários"
            hint="Cada requisito adicionado gera automaticamente um espaço de anexo obrigatório no dossiê das pessoas deste cargo."
            itens={form.requisitosTecnicos}
            onChange={(v) => set("requisitosTecnicos", v)}
            placeholder="Ex.: Ensino superior em Engenharia"
          />

          <BarraDeItens
            label="Requisitos desejáveis"
            itens={form.requisitosDesejaveis}
            onChange={(v) => set("requisitosDesejaveis", v)}
            placeholder="Ex.: Inglês intermediário"
          />

          <BarraDeItens
            label="Treinamentos necessários"
            hint="Cada treinamento também gera um espaço de anexo obrigatório no dossiê."
            itens={form.treinamentos}
            onChange={(v) => set("treinamentos", v)}
            placeholder="Ex.: ISO 9001:2015 — Interpretação"
          />

          <div className="space-y-1.5">
            <Label className="text-xs">Responsabilidades e autoridades no sistema de gestão da qualidade</Label>
            <Textarea rows={3} value={form.responsabilidades} onChange={(e) => set("responsabilidades", e.target.value)} />
          </div>

          <div className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
            Mínimo exigido no dossiê das pessoas deste cargo:{" "}
            <strong>{form.requisitosTecnicos.length + form.treinamentos.length} anexo(s)</strong>{" "}
            ({form.requisitosTecnicos.length} de requisitos técnicos + {form.treinamentos.length} de treinamentos).
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => onSave(form)}>Salvar cargo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ dialog pessoa ------------------------------ */

function PessoaDialog({ pessoa, cargos, onClose, onSave }: {
  pessoa: Pessoa; cargos: CargoPerfil[]; onClose: () => void; onSave: (p: Pessoa) => void;
}) {
  const [form, setForm] = useState<Pessoa>(pessoa);
  const [arquivo, setArquivo] = useState<Record<string, string>>({});
  const set = <K extends keyof Pessoa>(k: K, v: Pessoa[K]) => setForm((f) => ({ ...f, [k]: v }));

  const cargo = cargos.find((c) => c.id === form.cargoId);
  const obrigatorios = useMemo(() => itensObrigatorios(cargo), [cargo]);
  const pend = pendenciasDaPessoa(form, cargo);

  const anexar = (tipoItem: AnexoPessoa["tipoItem"], item: string) => {
    const nome = (arquivo[item] ?? "").trim();
    if (!nome) { toast.error("Informe o nome do arquivo."); return; }
    set("anexos", [...form.anexos, {
      id: `a${Date.now()}`, nome, tipoItem, item, origem: "Dossiê", data: hoje(), autor: "Ana Ribeiro",
    }]);
    setArquivo((s) => ({ ...s, [item]: "" }));
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{pessoa.nome ? `${pessoa.nome} — registro de pessoa` : "Novo Registro de Pessoa"}</DialogTitle>
          <DialogDescription>Associe a pessoa a um cargo já cadastrado e mantenha o dossiê completo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome completo</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex.: Fernanda Lima" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Matrícula</Label>
              <Input value={form.matricula} onChange={(e) => set("matricula", e.target.value)} placeholder="0012" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">E-mail corporativo</Label>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nome@empresa.com.br" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data de admissão</Label>
              <Input value={form.admissao} onChange={(e) => set("admissao", e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cargo</Label>
              <Select value={form.cargoId} onValueChange={(v) => set("cargoId", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione um cargo cadastrado" /></SelectTrigger>
                <SelectContent>
                  {[...cargos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Setor</Label>
              <Select value={form.setor} onValueChange={(v) => set("setor", v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                <SelectContent>
                  {SETORES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Situação da competência</Label>
            <Select value={form.situacao} onValueChange={(v) => set("situacao", v as SituacaoCompetencia)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SITUACOES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.situacao !== "Atende" && (
              <p className="flex items-center gap-1.5 text-[11px] text-[color:var(--severity-medium)]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Ao salvar, uma ação de competência será aberta automaticamente.
              </p>
            )}
          </div>

          {cargo && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
              <div className="mb-1 font-semibold text-foreground">Perfil do cargo {cargo.nome}</div>
              <div>Requisitos técnicos: {cargo.requisitosTecnicos.join("; ") || "—"}</div>
              <div>Requisitos desejáveis: {cargo.requisitosDesejaveis.join("; ") || "—"}</div>
              <div>Treinamentos: {cargo.treinamentos.join("; ") || "—"}</div>
              <div>Responsabilidades: {cargo.responsabilidades || "—"}</div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Dossiê da pessoa</Label>
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Dado restrito — acesso registrado</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mínimo necessário: pelo menos <strong>1 anexo por requisito técnico</strong> e{" "}
              <strong>1 anexo por treinamento</strong> definidos no cargo
              {cargo ? ` (${obrigatorios.length} anexos no total)` : ""}. Itens sem anexo aparecem na coluna Pendência.
            </p>

            {!cargo && <p className="text-xs text-muted-foreground">Selecione um cargo para carregar os espaços de anexo.</p>}

            {obrigatorios.map((o) => {
              const anexos = form.anexos.filter((a) => a.tipoItem === o.tipoItem && a.item === o.item);
              return (
                <div key={`${o.tipoItem}-${o.item}`} className={cn(
                  "rounded-lg border p-3",
                  anexos.length ? "border-border/60" : "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/5",
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-foreground">{o.item}</div>
                    <Badge variant="outline" className="rounded-md text-[10px]">{o.tipoItem}</Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    {anexos.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-[11px]">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-brand" />
                          {a.nome}
                          <span className="text-muted-foreground">· {a.data} · origem: {a.origem}</span>
                        </span>
                        <button onClick={() => set("anexos", form.anexos.filter((x) => x.id !== a.id))}
                          className="text-muted-foreground hover:text-[color:var(--severity-critical)]">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {anexos.length === 0 && (
                      <p className="text-[11px] text-[color:var(--severity-critical)]">Nenhum anexo — pendência aberta.</p>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={arquivo[o.item] ?? ""}
                      onChange={(e) => setArquivo((s) => ({ ...s, [o.item]: e.target.value }))}
                      placeholder="nome-do-arquivo.pdf"
                      className="h-8 text-xs"
                    />
                    <Button variant="outline" className="h-8 gap-1 text-xs" onClick={() => anexar(o.tipoItem, o.item)}>
                      <Upload className="h-3.5 w-3.5" /> Anexar
                    </Button>
                  </div>
                </div>
              );
            })}

            {form.anexos.filter((a) => a.tipoItem === "Documento geral" || a.origem === "Ação de competência").length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">Outros documentos do dossiê</Label>
                {form.anexos
                  .filter((a) => a.tipoItem === "Documento geral" || a.origem === "Ação de competência")
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-[11px]">
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-brand" /> {a.nome}
                        <span className="text-muted-foreground">· {a.item} · {a.data}</span>
                      </span>
                      <Badge variant="outline" className="rounded-md text-[9px]">{a.origem}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {pend.length > 0 && (
            <div className="rounded-lg border border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/5 p-3 text-[11px] text-[color:var(--severity-critical)]">
              <strong>{pend.length} pendência(s):</strong> {pend.map((x) => x.texto).join(" · ")}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => { if (!form.nome.trim() || !form.cargoId) { toast.error("Informe o nome e o cargo."); return; } onSave(form); }}>
            Salvar pessoa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- dialog ações competência ---------------------- */

function AcoesDialog({ pessoa, cargo, onClose, onUpdate }: {
  pessoa: Pessoa; cargo?: CargoPerfil; onClose: () => void; onUpdate: (p: Pessoa) => void;
}) {
  const [form, setForm] = useState<Pessoa>(pessoa);
  const [evidencia, setEvidencia] = useState<Record<string, string>>({});

  const setAcao = (id: string, patch: Partial<AcaoCompetencia>) =>
    setForm((f) => ({ ...f, acoes: f.acoes.map((a) => a.id === id ? { ...a, ...patch } : a) }));

  const concluir = (a: AcaoCompetencia) => {
    if (!a.metodologia.trim() || !a.responsavel.trim() || !a.prazoPrevisto.trim()) {
      toast.error("Preencha metodologia, responsável e prazo previsto."); return;
    }
    const nomeEvid = (evidencia[a.id] ?? "").trim();
    if (!nomeEvid && !a.evidencia) { toast.error("Anexe a evidência da conformidade."); return; }
    const data = a.dataRealizacao || hoje();
    const novoAnexo: AnexoPessoa | null = nomeEvid ? {
      id: `a${Date.now()}`, nome: nomeEvid, tipoItem: "Documento geral",
      item: "Evidência de competência atestada", origem: "Ação de competência",
      data, autor: "Ana Ribeiro",
    } : null;
    setForm((f) => {
      const acoes = f.acoes.map((x) => x.id === a.id
        ? { ...x, dataRealizacao: data, evidencia: nomeEvid || x.evidencia } : x);
      const aindaAberta = acoes.some((x) => !x.dataRealizacao);
      return {
        ...f,
        acoes,
        anexos: novoAnexo ? [...f.anexos, novoAnexo] : f.anexos,
        situacao: aindaAberta ? f.situacao : "Atende",
        atualizadoEm: hoje(),
      };
    });
    setEvidencia((s) => ({ ...s, [a.id]: "" }));
    toast.success("Ação concluída — evidência enviada ao dossiê", {
      description: "Situação da competência atualizada automaticamente.",
    });
  };

  const novaAcao = () => setForm((f) => ({
    ...f,
    acoes: [...f.acoes, {
      id: `ac${Date.now()}`, metodologia: "", responsavel: "", prazoPrevisto: "",
      dataRealizacao: null, evidencia: null, motivo: f.situacao, abertaEm: hoje(),
    }],
  }));

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-brand" /> Ações de competência — {pessoa.nome}
          </DialogTitle>
          <DialogDescription>
            {cargo?.nome ?? "Sem cargo"} · situação atual: {form.situacao}. As ações são abertas automaticamente quando a
            situação é "Atende parcialmente" ou "Não atende"; aqui elas ficam para consulta e acompanhamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {form.acoes.map((a, i) => {
            const concluida = !!a.dataRealizacao;
            return (
              <Card key={a.id} className={cn("rounded-xl", concluida ? "border-[color:var(--success)]/40" : "border-[color:var(--severity-medium)]/40")}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-foreground">Ação {i + 1} · aberta em {a.abertaEm}</div>
                    <Badge variant="outline" className={cn("rounded-md text-[10px]", concluida
                      ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                      : "border-[color:var(--severity-medium)]/40 bg-[color:var(--severity-medium)]/10 text-[color:var(--severity-medium)]")}>
                      {concluida ? "Concluída" : "Em andamento"} · motivo: {a.motivo}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Metodologia para atestar competência</Label>
                    <Textarea rows={2} value={a.metodologia} disabled={concluida}
                      onChange={(e) => setAcao(a.id, { metodologia: e.target.value })}
                      placeholder="Ex.: Avaliação prática supervisionada com checklist do posto de trabalho." />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Responsável</Label>
                      <Input value={a.responsavel} disabled={concluida}
                        onChange={(e) => setAcao(a.id, { responsavel: e.target.value })} placeholder="Ex.: Ana Ribeiro" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1 text-xs"><CalendarClock className="h-3 w-3" /> Prazo previsto</Label>
                      <Input value={a.prazoPrevisto} disabled={concluida}
                        onChange={(e) => setAcao(a.id, { prazoPrevisto: e.target.value })} placeholder="dd/mm/aaaa" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data de realização</Label>
                      <Input value={a.dataRealizacao ?? ""} disabled={concluida}
                        onChange={(e) => setAcao(a.id, { dataRealizacao: e.target.value || null })} placeholder="dd/mm/aaaa" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Evidência da conformidade (vai para o dossiê)</Label>
                    {a.evidencia && (
                      <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-[11px]">
                        <FileText className="h-3.5 w-3.5 text-brand" /> {a.evidencia}
                        <Badge variant="outline" className="ml-auto rounded-md text-[9px]">Ação de competência</Badge>
                      </div>
                    )}
                    {!concluida && (
                      <div className="flex gap-2">
                        <Input value={evidencia[a.id] ?? ""} onChange={(e) => setEvidencia((s) => ({ ...s, [a.id]: e.target.value }))}
                          placeholder="evidencia-competencia.pdf" className="h-8 text-xs" />
                        <Button variant="outline" className="h-8 gap-1 text-xs" onClick={() => concluir(a)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Concluir ação
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {form.acoes.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma ação aberta.</p>}
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={novaAcao}>
            <Plus className="h-3.5 w-3.5" /> Adicionar outra ação
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => { onUpdate(form); onClose(); toast.success("Acompanhamento salvo"); }}>
            Salvar acompanhamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- visão usuário comum -------------------------- */

const TREINAMENTOS_PREVISTOS: Record<string, string> = {
  "BPF — Boas Práticas": "18/04/2026",
  "NR-06 — EPI": "22/06/2026",
  "NR-10 — Segurança elétrica": "30/07/2026",
  "ISO 9001:2015 — Interpretação": "14/09/2026",
  "Análise de causa raiz": "06/05/2026",
  "Auditor Interno ISO 9001": "10/03/2026",
};

function MinhaVisao({ pessoa, cargo, seletorPerfil, onAssinar }: {
  pessoa: Pessoa; cargo?: CargoPerfil; seletorPerfil: React.ReactNode; onAssinar: (em: string) => void;
}) {
  const [popup, setPopup] = useState(false);
  const [aceito, setAceito] = useState(false);

  useEffect(() => {
    const assinado = localStorage.getItem(CIENCIA_KEY);
    const vencido = !assinado || (Date.now() - Number(assinado)) > 365 * 24 * 60 * 60 * 1000;
    if (vencido && !pessoa.cienciaAssinadaEm) setPopup(true);
  }, [pessoa.cienciaAssinadaEm]);

  const assinar = () => {
    const em = agora();
    localStorage.setItem(CIENCIA_KEY, String(Date.now()));
    onAssinar(em);
    setPopup(false);
    toast.success("Termo de Ciência assinado", { description: `Registrado em ${em} — renovação automática em 12 meses.` });
  };

  const treinos = (cargo?.treinamentos ?? []).map((t) => {
    const feito = pessoa.anexos.find((a) => a.tipoItem === "Treinamento" && a.item === t);
    return { nome: t, realizadoEm: feito?.data ?? null, previsto: TREINAMENTOS_PREVISTOS[t] ?? "A programar" };
  });

  const termoTexto = (
    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
      <p>
        Declaro estar ciente das atribuições, responsabilidades e autoridades do cargo de{" "}
        <strong className="text-foreground">{cargo?.nome ?? "—"}</strong>, conforme o perfil definido pela organização.
      </p>
      <p>
        Declaro conhecer a <strong className="text-foreground">Política da Qualidade</strong> e os objetivos da qualidade,
        e compreender de que forma minha atividade contribui para a eficácia do sistema de gestão e para a satisfação do cliente.
      </p>
      <p>
        Estou ciente das <strong className="text-foreground">implicações do não atendimento</strong> aos requisitos do sistema
        de gestão da qualidade — incluindo retrabalho, não conformidades, impacto em custo e prazo, risco à segurança
        e perda de confiança do cliente e da certificação.
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meu cargo e minhas competências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pessoa.nome} · {cargo?.nome ?? "—"} · {pessoa.setor}
          </p>
        </div>
        {seletorPerfil}
      </header>

      <Card className="rounded-2xl border-border/80">
        <CardContent className="space-y-3 p-5">
          <h2 className="text-base font-semibold text-foreground">Perfil do meu cargo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase text-muted-foreground">Requisitos técnicos</div>
              <ul className="mt-1 space-y-0.5 text-xs text-foreground/85">
                {(cargo?.requisitosTecnicos ?? []).map((r) => <li key={r}>• {r}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase text-muted-foreground">Requisitos desejáveis</div>
              <ul className="mt-1 space-y-0.5 text-xs text-foreground/85">
                {(cargo?.requisitosDesejaveis ?? []).map((r) => <li key={r}>• {r}</li>)}
              </ul>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Responsabilidades e autoridades</div>
            <p className="mt-1 text-xs text-foreground/85">{cargo?.responsabilidades}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Situação da minha competência:</span>
            <Badge variant="outline" className={cn("rounded-md text-[10px]", chip[pessoa.situacao])}>{pessoa.situacao}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80">
        <CardContent className="space-y-3 p-5">
          <h2 className="text-base font-semibold text-foreground">Meus treinamentos</h2>
          <p className="text-xs text-muted-foreground">Mapeados para o meu cargo, com previsão vinda da matriz de treinamento.</p>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                <TableHead>Treinamento</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Realizado em</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treinos.map((t) => (
                <TableRow key={t.nome} className="text-xs">
                  <TableCell className="font-medium text-foreground">{t.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{t.previsto}</TableCell>
                  <TableCell className="text-muted-foreground">{t.realizadoEm ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("rounded-md text-[10px]", t.realizadoEm
                      ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                      : "border-border bg-muted text-muted-foreground")}>
                      {t.realizadoEm ? "Realizado" : "Programado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-brand" />
            <h2 className="text-base font-semibold text-foreground">Termo de Ciência</h2>
          </div>
          {termoTexto}
          {pessoa.cienciaAssinadaEm ? (
            <div className="rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-3 text-xs text-[color:var(--success)]">
              <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
              Assinado por {pessoa.nome} em {pessoa.cienciaAssinadaEm} · renovação automática em 12 meses.
            </div>
          ) : (
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => setPopup(true)}>
              Assinar termo
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={popup} onOpenChange={setPopup}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Termo de Ciência — renovação anual</DialogTitle>
            <DialogDescription>Leia e assine para manter seu registro de competência atualizado.</DialogDescription>
          </DialogHeader>
          {termoTexto}
          <label className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
            <Checkbox checked={aceito} onCheckedChange={(v) => setAceito(!!v)} className="mt-0.5" />
            <span>Li e estou ciente das informações acima.</span>
          </label>
          <DialogFooter>
            <Button disabled={!aceito} onClick={assinar} className="bg-brand text-brand-foreground hover:bg-brand/90">
              Assinar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
