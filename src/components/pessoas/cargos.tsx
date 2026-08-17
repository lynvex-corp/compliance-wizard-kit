import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  Lock, ShieldAlert, Paperclip, Plus, Trash2, Upload, FileText, History, CheckCircle2, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Situacao = "Atende" | "Atende parcialmente" | "Não atende";

const PERFIS_AUTORIZADOS = ["Gestor da Qualidade", "Alta Direção"];
const PERFIS = ["Gestor da Qualidade", "Alta Direção", "Auditor", "Gestor de Área", "Colaborador"];

const CATEGORIAS_ANEXO = [
  "Certificado de escolaridade",
  "Diploma",
  "Cursos extras",
  "ASO (atestado de saúde ocupacional)",
  "Outros",
] as const;

interface Anexo { id: string; nome: string; categoria: string; data: string; autor: string }
interface AcaoCompetencia {
  id: string; metodologia: string; acao: string; responsavel: string; prazo: string;
  resultado: string; concluida: boolean; registradoEm: string;
}
interface Registro {
  id: string;
  empregado: string;
  cargo: string;
  situacao: Situacao;
  requisitosTecnicos: string;
  requisitosDesejaveis: string;
  treinamentos: string[];
  responsabilidades: string;
  anexos: Anexo[];
  acoes: AcaoCompetencia[];
  atualizadoEm: string;
}

const hoje = () => new Date().toLocaleDateString("pt-BR");

const iniciais: Registro[] = [
  {
    id: "r1", empregado: "Fernanda Lima", cargo: "Analista da Qualidade", situacao: "Atende",
    requisitosTecnicos: "Superior em Engenharia; domínio da ISO 9001:2015; interpretação de indicadores.",
    requisitosDesejaveis: "Pós-graduação em Gestão da Qualidade; inglês intermediário.",
    treinamentos: ["ISO 9001:2015 — Interpretação", "Auditor Interno da Qualidade", "Análise de causa raiz (5 Porquês / Causa e Efeito)"],
    responsabilidades: "Conduzir auditorias internas, tratar não conformidades e reportar indicadores à Alta Direção.",
    anexos: [
      { id: "a1", nome: "diploma-eng-quimica.pdf", categoria: "Diploma", data: "12/03/2025", autor: "Beatriz Souza" },
      { id: "a2", nome: "aso-2025.pdf", categoria: "ASO (atestado de saúde ocupacional)", data: "10/10/2025", autor: "Beatriz Souza" },
    ],
    acoes: [], atualizadoEm: "10/10/2025",
  },
  {
    id: "r2", empregado: "Rafael Costa", cargo: "Analista da Qualidade", situacao: "Atende parcialmente",
    requisitosTecnicos: "Superior em Engenharia; formação de auditor interno; leitura de procedimentos.",
    requisitosDesejaveis: "Experiência prévia em indústria alimentícia.",
    treinamentos: ["ISO 9001:2015 — Interpretação", "Auditor Interno da Qualidade"],
    responsabilidades: "Apoiar auditorias internas e manter registros do SGQ atualizados.",
    anexos: [{ id: "a3", nome: "certificado-auditor.pdf", categoria: "Cursos extras", data: "05/09/2025", autor: "Ana Ribeiro" }],
    acoes: [], atualizadoEm: "05/09/2025",
  },
  {
    id: "r3", empregado: "Marcos Vinícius", cargo: "Operador de Produção", situacao: "Não atende",
    requisitosTecnicos: "Ensino médio completo; NR-06; NR-10 básico; BPF.",
    requisitosDesejaveis: "Curso técnico em processos industriais.",
    treinamentos: ["Boas Práticas de Fabricação (BPF)", "NR-06 — EPI", "IT.PRO.022 — Envase"],
    responsabilidades: "Executar operações de envase conforme instrução de trabalho e registrar ocorrências no SGQ.",
    anexos: [{ id: "a4", nome: "certificado-ensino-medio.jpg", categoria: "Certificado de escolaridade", data: "20/01/2025", autor: "Beatriz Souza" }],
    acoes: [], atualizadoEm: "20/01/2025",
  },
  {
    id: "r4", empregado: "Carla Menezes", cargo: "Gerente Comercial", situacao: "Atende",
    requisitosTecnicos: "Superior em Administração; análise crítica de contratos; gestão de equipe.",
    requisitosDesejaveis: "MBA em Gestão Comercial.",
    treinamentos: ["ISO 9001:2015 — Visão geral", "Análise crítica de contratos"],
    responsabilidades: "Garantir o entendimento dos requisitos do cliente e a comunicação com o SGQ.",
    anexos: [], acoes: [], atualizadoEm: "07/07/2025",
  },
];

const chip: Record<Situacao, string> = {
  "Atende": "border-[color:var(--success)]/40 bg-[color:var(--success)]/10 text-[color:var(--success)]",
  "Atende parcialmente": "border-[color:var(--severity-medium)]/40 bg-[color:var(--severity-medium)]/10 text-[color:var(--severity-medium)]",
  "Não atende": "border-[color:var(--severity-critical)]/40 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]",
};

const LGPD_KEY = "jawda.cargos.lgpd";

export function CargosPage() {
  const [perfil, setPerfil] = useState("Gestor da Qualidade");
  const [aceite, setAceite] = useState<{ perfil: string; em: string } | null>(null);
  const [hidratado, setHidratado] = useState(false);
  const [check, setCheck] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>(iniciais);
  const [edit, setEdit] = useState<Registro | null>(null);
  const [acaoDe, setAcaoDe] = useState<Registro | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LGPD_KEY);
      if (raw) setAceite(JSON.parse(raw));
    } catch { /* ignore */ }
    setHidratado(true);
  }, []);

  const autorizado = PERFIS_AUTORIZADOS.includes(perfil);
  const cargosConhecidos = useMemo(
    () => Array.from(new Set(registros.map((r) => r.cargo))).sort(),
    [registros],
  );

  function aceitarTermo() {
    const registro = { perfil, em: new Date().toLocaleString("pt-BR") };
    setAceite(registro);
    localStorage.setItem(LGPD_KEY, JSON.stringify(registro));
    toast.success("Termo LGPD aceito", { description: `${registro.perfil} — ${registro.em}` });
  }

  const seletorPerfil = (
    <Select value={perfil} onValueChange={setPerfil}>
      <SelectTrigger className="h-8 w-[210px] text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        {PERFIS.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
      </SelectContent>
    </Select>
  );

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
                Cargos e Perfis contém dados pessoais sensíveis (saúde e documentos). Conforme a política de
                privacidade e a LGPD, a visualização é restrita aos perfis <strong>Gestor da Qualidade</strong> e{" "}
                <strong>Alta Direção</strong>. Seu perfil atual é <strong>{perfil}</strong>.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">Simular perfil:</span>
                {seletorPerfil}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
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
              Descrições de cargo, competências, dossiê do empregado e atestação de competência.
            </p>
            {aceite && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Termo LGPD aceito por {aceite.perfil} em {aceite.em}.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {seletorPerfil}
            <Button
              className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={() => setEdit({
                id: `r${Date.now()}`, empregado: "", cargo: "", situacao: "Atende",
                requisitosTecnicos: "", requisitosDesejaveis: "", treinamentos: [],
                responsabilidades: "", anexos: [], acoes: [], atualizadoEm: hoje(),
              })}
            >
              <Plus className="h-4 w-4" /> Novo registro
            </Button>
          </div>
        </header>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableHead>Empregado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Situação da competência</TableHead>
                  <TableHead>Anexos</TableHead>
                  <TableHead>Última atualização</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((r) => (
                  <TableRow key={r.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">{r.empregado}</TableCell>
                    <TableCell className="text-foreground/80">{r.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-md text-[10px]", chip[r.situacao])}>{r.situacao}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Paperclip className="h-3 w-3" /> {r.anexos.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.atualizadoEm}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      {r.situacao !== "Atende" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setAcaoDe(r)}>
                          Registrar ação de competência
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setEdit(r)}>Abrir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Termo LGPD */}
      <Dialog open={hidratado && !aceite}>
        <DialogContent className="max-w-lg rounded-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand" /> Termo de confidencialidade — LGPD
            </DialogTitle>
            <DialogDescription className="text-left">
              Esta tela contém dados pessoais sensíveis (informações de saúde ocupacional e documentos pessoais).
              O acesso é registrado e o uso é permitido exclusivamente para a gestão de competências do sistema
              de gestão da qualidade. É vedado copiar, compartilhar ou divulgar tais dados a terceiros.
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

      {edit && (
        <EditorDialog
          registro={edit}
          cargos={cargosConhecidos}
          onClose={() => setEdit(null)}
          onSave={(r) => {
            setRegistros((prev) => prev.some((p) => p.id === r.id)
              ? prev.map((p) => (p.id === r.id ? { ...r, atualizadoEm: hoje() } : p))
              : [...prev, { ...r, atualizadoEm: hoje() }]);
            setEdit(null);
            toast.success("Registro salvo");
          }}
        />
      )}

      {acaoDe && (
        <AcaoDialog
          registro={acaoDe}
          onClose={() => setAcaoDe(null)}
          onSave={(acao, promover) => {
            setRegistros((prev) => prev.map((p) => p.id === acaoDe.id
              ? { ...p, acoes: [...p.acoes, acao], situacao: promover ? "Atende" : p.situacao, atualizadoEm: hoje() }
              : p));
            setAcaoDe(null);
            toast.success(promover ? "Competência atestada — situação alterada para Atende" : "Ação de competência registrada");
          }}
        />
      )}
    </AppShell>
  );
}

function EditorDialog({ registro, cargos, onClose, onSave }: {
  registro: Registro; cargos: string[]; onClose: () => void; onSave: (r: Registro) => void;
}) {
  const [form, setForm] = useState<Registro>(registro);
  const [novoTreino, setNovoTreino] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_ANEXO[0]);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const set = <K extends keyof Registro>(k: K, v: Registro[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{registro.empregado ? `${registro.empregado} — descrição de cargo` : "Novo registro de cargo"}</DialogTitle>
          <DialogDescription>Competências, treinamentos e dossiê do empregado.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do empregado</Label>
              <Input value={form.empregado} onChange={(e) => set("empregado", e.target.value)} placeholder="Ex.: Fernanda Lima" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome do cargo</Label>
              <Input
                list="jawda-cargos"
                value={form.cargo}
                onChange={(e) => set("cargo", e.target.value)}
                placeholder="Selecione ou digite um novo cargo"
              />
              <datalist id="jawda-cargos">
                {cargos.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Situação da competência</Label>
            <Select value={form.situacao} onValueChange={(v) => set("situacao", v as Situacao)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Atende", "Atende parcialmente", "Não atende"] as Situacao[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Requisitos técnicos (necessários)</Label>
            <Textarea rows={3} value={form.requisitosTecnicos} onChange={(e) => set("requisitosTecnicos", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Requisitos desejáveis</Label>
            <Textarea rows={2} value={form.requisitosDesejaveis} onChange={(e) => set("requisitosDesejaveis", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Treinamentos necessários para o cargo (inclui os do SGQ)</Label>
            <div className="space-y-1">
              {form.treinamentos.map((t, i) => (
                <div key={`${t}-${i}`} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-xs">
                  <span className="text-foreground/85">{t}</span>
                  <button
                    onClick={() => set("treinamentos", form.treinamentos.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-[color:var(--severity-critical)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.treinamentos.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum treinamento definido.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={novoTreino}
                onChange={(e) => setNovoTreino(e.target.value)}
                placeholder="Ex.: ISO 9001:2015 — Interpretação"
                className="h-9"
              />
              <Button
                variant="outline"
                className="h-9 gap-1 whitespace-nowrap"
                onClick={() => {
                  if (!novoTreino.trim()) return;
                  set("treinamentos", [...form.treinamentos, novoTreino.trim()]);
                  setNovoTreino("");
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar treinamento
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Responsabilidades e autoridades no sistema de gestão</Label>
            <Textarea rows={3} value={form.responsabilidades} onChange={(e) => set("responsabilidades", e.target.value)} />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Dossiê do empregado (anexos)</Label>
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Dado restrito — acesso registrado</span>
            </div>
            <div className="space-y-1">
              {form.anexos.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-brand" />
                    <div>
                      <div className="text-foreground/85">{a.nome}</div>
                      <div className="text-[10px] text-muted-foreground">{a.categoria} · enviado em {a.data} por {a.autor}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => set("anexos", form.anexos.filter((x) => x.id !== a.id))}
                    className="text-muted-foreground hover:text-[color:var(--severity-critical)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.anexos.length === 0 && <p className="text-xs text-muted-foreground">Nenhum anexo enviado.</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3">
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="h-9 w-[240px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_ANEXO.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                value={nomeArquivo}
                onChange={(e) => setNomeArquivo(e.target.value)}
                placeholder="nome-do-arquivo.pdf"
                className="h-9 w-56"
              />
              <Button
                variant="outline"
                className="h-9 gap-1"
                onClick={() => {
                  if (!nomeArquivo.trim()) return;
                  set("anexos", [...form.anexos, {
                    id: `a${Date.now()}`, nome: nomeArquivo.trim(), categoria,
                    data: hoje(), autor: "Ana Ribeiro",
                  }]);
                  setNomeArquivo("");
                }}
              >
                <Upload className="h-3.5 w-3.5" /> Enviar anexo
              </Button>
            </div>
          </div>

          {form.acoes.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs"><History className="h-3.5 w-3.5" /> Histórico de atestação de competência</Label>
              {form.acoes.map((a) => (
                <div key={a.id} className="rounded-md border border-border/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground/85">{a.acao}</span>
                    <span className="text-[10px] text-muted-foreground">{a.registradoEm}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">Metodologia: {a.metodologia}</p>
                  <p className="text-muted-foreground">Responsável: {a.responsavel} · Prazo: {a.prazo}</p>
                  {a.resultado && <p className="text-muted-foreground">Resultado: {a.resultado}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => onSave(form)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AcaoDialog({ registro, onClose, onSave }: {
  registro: Registro; onClose: () => void; onSave: (a: AcaoCompetencia, promover: boolean) => void;
}) {
  const [metodologia, setMetodologia] = useState("");
  const [acao, setAcao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState("");
  const [resultado, setResultado] = useState("");
  const [concluida, setConcluida] = useState(false);

  const valido = metodologia.trim() && acao.trim() && responsavel.trim() && prazo;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Registrar ação de competência</DialogTitle>
          <DialogDescription>
            {registro.empregado} — {registro.cargo} · situação atual: {registro.situacao}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Metodologia de atestação</Label>
            <Textarea rows={2} value={metodologia} onChange={(e) => setMetodologia(e.target.value)}
              placeholder="Ex.: Avaliação prática supervisionada com checklist do posto de trabalho." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ação definida</Label>
            <Textarea rows={2} value={acao} onChange={(e) => setAcao(e.target.value)}
              placeholder="Ex.: Reciclagem da NR-10 básico e acompanhamento por 30 dias." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Responsável</Label>
              <Input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Ex.: Beatriz Souza" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prazo</Label>
              <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Resultado</Label>
            <Textarea rows={2} value={resultado} onChange={(e) => setResultado(e.target.value)}
              placeholder="Registre a evidência do resultado da atestação." />
          </div>
          <label className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 text-xs">
            <Checkbox checked={concluida} onCheckedChange={(v) => setConcluida(!!v)} className="mt-0.5" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success)]" />
              Concluída com sucesso — alterar situação para "Atende" (histórico preservado)
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!valido}
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => onSave({
              id: `ac${Date.now()}`, metodologia, acao, responsavel,
              prazo: prazo ? new Date(prazo + "T00:00:00").toLocaleDateString("pt-BR") : "",
              resultado, concluida, registradoEm: hoje(),
            }, concluida)}
          >
            Salvar ação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
