import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Search, AlertTriangle, FileText, CheckCircle2, Clock, ArrowRight,
  Archive, History, Sparkles, ShieldCheck, Server, DatabaseBackup, Lock, Upload, Ban,
  ScrollText, Users, PenLine, Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "Vigente" | "Em revisão" | "Obsoleto";
type Tipo = "Manual" | "Procedimento" | "Formulário" | "Registro" | "Externo" | "Lei" | "Norma" | "Planilha" | "Outro";

interface Revisao { rev: string; data: string; autor: string; mudanca: string }
interface Doc {
  codigo: string; titulo: string; tipo: Tipo; rev: string; data: string; status: Status;
  resp: string; origem?: string; historico: Revisao[];
}

const docsIniciais: Doc[] = [
  {
    codigo: "MA.SGI.001", titulo: "Manual do Sistema de Gestão da Qualidade", tipo: "Manual", rev: "05",
    data: "10/02/2026", status: "Vigente", resp: "Fernanda Lima",
    historico: [
      { rev: "05", data: "10/02/2026", autor: "Fernanda Lima", mudanca: "Atualização do escopo do SGQ e inclusão da unidade Campinas." },
      { rev: "04", data: "03/05/2025", autor: "Fernanda Lima", mudanca: "Revisão da política da qualidade e do organograma." },
      { rev: "03", data: "11/08/2024", autor: "Rafael Costa", mudanca: "Inclusão da matriz de partes interessadas." },
    ],
  },
  {
    codigo: "PO.SGI.001", titulo: "Procedimento de Controle de Documentos", tipo: "Procedimento", rev: "04",
    data: "22/03/2026", status: "Vigente", resp: "Fernanda Lima",
    historico: [
      { rev: "04", data: "22/03/2026", autor: "Fernanda Lima", mudanca: "Distinção entre permissão de Alteração e de Redação." },
      { rev: "03", data: "19/09/2025", autor: "Fernanda Lima", mudanca: "Definição do prazo de retenção de documentos obsoletos (5 anos)." },
    ],
  },
  {
    codigo: "PO.SGI.002", titulo: "Procedimento de Auditoria Interna", tipo: "Procedimento", rev: "03",
    data: "18/01/2026", status: "Vigente", resp: "Rafael Costa",
    historico: [
      { rev: "03", data: "18/01/2026", autor: "Rafael Costa", mudanca: "Novo critério de qualificação de auditores internos." },
      { rev: "02", data: "07/02/2025", autor: "Rafael Costa", mudanca: "Inclusão do checklist por requisito da ISO 9001:2015." },
    ],
  },
  {
    codigo: "PO.OPR.007", titulo: "Procedimento de Controle de Não Conformidades", tipo: "Procedimento", rev: "02",
    data: "05/06/2026", status: "Em revisão", resp: "Diego Almeida",
    historico: [
      { rev: "02", data: "05/06/2026", autor: "Diego Almeida", mudanca: "Em revisão: inclusão da análise de causa por 5 Porquês obrigatória." },
      { rev: "01", data: "12/03/2025", autor: "Diego Almeida", mudanca: "Emissão inicial." },
    ],
  },
  {
    codigo: "FL.GRH.003", titulo: "Formulário de Descrição de Cargo", tipo: "Formulário", rev: "01",
    data: "12/11/2025", status: "Vigente", resp: "Beatriz Souza",
    historico: [{ rev: "01", data: "12/11/2025", autor: "Beatriz Souza", mudanca: "Emissão inicial." }],
  },
  {
    codigo: "FL.QUA.011", titulo: "Formulário de Registro de NC", tipo: "Formulário", rev: "03",
    data: "20/04/2026", status: "Vigente", resp: "Fernanda Lima",
    historico: [
      { rev: "03", data: "20/04/2026", autor: "Fernanda Lima", mudanca: "Campo de gravidade alinhado ao cálculo de SLA." },
      { rev: "02", data: "14/10/2025", autor: "Fernanda Lima", mudanca: "Inclusão do campo setor de ocorrência." },
    ],
  },
  {
    codigo: "IT.PRO.022", titulo: "Instrução de Setup Envasadora ENV-02", tipo: "Procedimento", rev: "01",
    data: "14/09/2024", status: "Obsoleto", resp: "Diego Almeida",
    historico: [
      { rev: "01", data: "14/09/2024", autor: "Diego Almeida", mudanca: "Tornado obsoleto: equipamento substituído pela ENV-04." },
    ],
  },
  {
    codigo: "RG.QUA.009", titulo: "Registro de Análise Crítica pela Direção", tipo: "Registro", rev: "02",
    data: "30/06/2026", status: "Vigente", resp: "Fernanda Lima",
    historico: [
      { rev: "02", data: "30/06/2026", autor: "Fernanda Lima", mudanca: "Nova pauta alinhada ao requisito 9.3.2." },
      { rev: "01", data: "28/06/2025", autor: "Fernanda Lima", mudanca: "Emissão inicial." },
    ],
  },
];

const externosIniciais: Doc[] = [
  {
    codigo: "EXT.001", titulo: "ABNT NBR ISO 9001:2015", tipo: "Norma", rev: "—", data: "30/09/2015",
    status: "Vigente", resp: "Fernanda Lima", origem: "ABNT",
    historico: [{ rev: "—", data: "30/09/2015", autor: "ABNT", mudanca: "Versão vigente da norma, verificada em 02/2026." }],
  },
  {
    codigo: "EXT.014", titulo: "RDC 216/2004 — Boas Práticas de Fabricação", tipo: "Lei", rev: "—", data: "15/09/2004",
    status: "Vigente", resp: "Regulatório", origem: "ANVISA",
    historico: [{ rev: "—", data: "15/09/2004", autor: "ANVISA", mudanca: "Requisito legal aplicável, vigência verificada em 01/2026." }],
  },
  {
    codigo: "EXT.022", titulo: "Manual do fornecedor MP-2231 rev. 2024", tipo: "Manual", rev: "2024", data: "10/04/2024",
    status: "Vigente", resp: "Rafael Costa", origem: "Fornecedor BASF",
    historico: [{ rev: "2024", data: "10/04/2024", autor: "Fornecedor", mudanca: "Substitui a revisão 2021." }],
  },
  {
    codigo: "EXT.031", titulo: "Especificação técnica cliente Alpha (contrato #22)", tipo: "Outro", rev: "B", data: "02/02/2026",
    status: "Vigente", resp: "Carla Menezes", origem: "Cliente Alpha",
    historico: [{ rev: "B", data: "02/02/2026", autor: "Cliente Alpha", mudanca: "Tolerância dimensional revisada." }],
  },
];

const pendentes = [
  { codigo: "PO.OPR.007", titulo: "Controle de Não Conformidades (rev. 03)", etapa: 2, quem: ["Diego A.", "Fernanda L.", "Diretor"] },
  { codigo: "IT.PRO.045", titulo: "Instrução operacional linha de mistura", etapa: 1, quem: ["Marcos V.", "Diego A.", "Ger. Qualidade"] },
  { codigo: "FL.GRH.019", titulo: "Formulário de Avaliação de Eficácia de Treinamento", etapa: 3, quem: ["Beatriz S.", "RH", "Diretora"] },
];

const statusColor: Record<Status, string> = {
  Vigente: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  "Em revisão": "bg-[color:var(--warning)]/20 text-[color:var(--severity-high)] border-[color:var(--warning)]/40",
  Obsoleto: "bg-muted text-muted-foreground border-border",
};

const perfis = [
  "Diretoria",
  "Gestor da Qualidade",
  "Executor Comercial",
  "Executor RH",
  "Executor Produção",
] as const;
type Perfil = (typeof perfis)[number];

const permissoes: { perfil: string; alteracao: boolean; redacao: boolean; visualizacao: boolean; nota: string }[] = [
  { perfil: "Diretoria", alteracao: true, redacao: true, visualizacao: true, nota: "Define o modelo e a governança documental." },
  { perfil: "Gestor da Qualidade", alteracao: true, redacao: true, visualizacao: true, nota: "Elabora, revisa e pode inutilizar ou revogar documentos." },
  { perfil: "Executor (por setor)", alteracao: false, redacao: true, visualizacao: true, nota: "Preenche informações e números nos registros do seu setor." },
];

function podeAlterar(p: Perfil) {
  return p === "Diretoria" || p === "Gestor da Qualidade";
}

const tiposRepositorio: Tipo[] = ["Lei", "Manual", "Norma", "Planilha", "Procedimento", "Outro"];

const raciPapeis = ["Responsável", "Elaborador", "Consultado", "Informado"] as const;
const raciAreas = ["Comercial", "Compras", "Produção", "Qualidade", "RH"];

/* ------------------------- Política da Qualidade -------------------------- */

const POLITICA_TEXTO_INICIAL =
  "A organização compromete-se a fornecer produtos e serviços que atendam integralmente aos requisitos dos clientes e aos requisitos legais aplicáveis, promovendo a melhoria contínua do sistema de gestão da qualidade, o desenvolvimento das pessoas, a segurança das operações e o relacionamento ético com todas as partes interessadas.";

interface PolRev { rev: string; data: string; autor: string; mudanca: string; aprovador: string }

const POLITICA_HISTORICO: PolRev[] = [
  { rev: "04", data: "10/02/2026", autor: "Fernanda Lima", aprovador: "Diretoria", mudanca: "Inclusão do compromisso com segurança das operações e desenvolvimento das pessoas." },
  { rev: "03", data: "03/05/2025", autor: "Fernanda Lima", aprovador: "Diretoria", mudanca: "Alinhamento da política ao novo escopo do SGQ." },
  { rev: "02", data: "11/08/2024", autor: "Rafael Costa", aprovador: "Diretoria", mudanca: "Revisão de redação após análise crítica da direção." },
];

function PoliticaQualidadeCard({ perfil }: { perfil: Perfil }) {
  const [texto, setTexto] = useState(POLITICA_TEXTO_INICIAL);
  const [rascunho, setRascunho] = useState(POLITICA_TEXTO_INICIAL);
  const [editando, setEditando] = useState(false);
  const [historico, setHistorico] = useState<PolRev[]>(POLITICA_HISTORICO);
  const [pendente, setPendente] = useState<{ rev: string; texto: string } | null>(null);

  const podeEditar = perfil === "Gestor da Qualidade" || perfil === "Diretoria";
  const podeAprovar = perfil === "Diretoria";
  const revAtual = historico[0].rev;
  const proximaRev = String(Number(revAtual) + 1).padStart(2, "0");

  return (
    <Card className="rounded-xl border-brand/30 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ScrollText className="h-4 w-4 text-brand" /> Política da Qualidade
              <Badge variant="outline" className="rounded-md text-[10px]">rev. {revAtual}</Badge>
            </CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Documento formal. Edição por Gestor da Qualidade e Diretoria; aprovação exclusiva da Diretoria.
              Referenciada pelos Objetivos da Qualidade (módulo Indicadores) — o texto não é duplicado lá, apenas consultado.
            </p>
          </div>
          <div className="flex gap-2">
            {!editando && podeEditar && (
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-[11px]" onClick={() => { setRascunho(texto); setEditando(true); }}>
                <PenLine className="mr-1.5 h-3.5 w-3.5" /> Editar política
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {editando ? (
          <>
            <Textarea value={rascunho} onChange={(e) => setRascunho(e.target.value)} rows={6} className="text-xs" />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="text-[11px]" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button size="sm" className="rounded-lg bg-brand text-white text-[11px] hover:bg-brand/90"
                onClick={() => {
                  setPendente({ rev: proximaRev, texto: rascunho });
                  setEditando(false);
                  toast.success(`Revisão ${proximaRev} submetida para aprovação da Diretoria.`);
                }}>
                Submeter para aprovação
              </Button>
            </div>
          </>
        ) : (
          <p className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs leading-relaxed text-foreground/85">{texto}</p>
        )}

        {pendente && (
          <div className="rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-3">
            <div className="text-xs font-semibold text-[color:var(--severity-high)]">
              Revisão {pendente.rev} aguardando aprovação da Diretoria
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{pendente.texto}</p>
            {podeAprovar ? (
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="h-7 rounded-lg bg-[color:var(--success)] text-[11px] text-white hover:opacity-90"
                  onClick={() => {
                    setTexto(pendente.texto);
                    setHistorico((h) => [{
                      rev: pendente.rev, data: new Date().toLocaleDateString("pt-BR"),
                      autor: "Gestor da Qualidade", aprovador: "Diretoria",
                      mudanca: "Revisão do texto da Política da Qualidade aprovada pela Diretoria.",
                    }, ...h]);
                    setPendente(null);
                    toast.success("Política da Qualidade aprovada e publicada.");
                  }}>
                  Aprovar revisão
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { setPendente(null); toast("Revisão devolvida ao elaborador."); }}>
                  Devolver
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-muted-foreground">Somente o perfil Diretoria pode aprovar.</p>
            )}
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <History className="h-3.5 w-3.5 text-brand" /> Histórico de revisões
          </div>
          <div className="overflow-hidden rounded-lg border border-border/70">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableHead>Revisão</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Elaborador</TableHead>
                  <TableHead>Aprovação</TableHead>
                  <TableHead>Alteração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((h, i) => (
                  <TableRow key={h.rev} className="text-xs">
                    <TableCell className="font-mono text-[11px] font-semibold text-brand">
                      {h.rev}{i === 0 && <Badge variant="outline" className="ml-1.5 rounded-md text-[9px]">vigente</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{h.data}</TableCell>
                    <TableCell className="text-muted-foreground">{h.autor}</TableCell>
                    <TableCell className="text-muted-foreground">{h.aprovador}</TableCell>
                    <TableCell className="text-foreground/85">{h.mudanca}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------- Atas e Listas de Frequência ------------------------ */

interface Ata { id: string; titulo: string; data: string; participantes: string; pauta: string; deliberacoes: string; anexo?: string }
interface ListaFreq { id: string; evento: string; data: string; participantes: { nome: string; confirmado: boolean }[] }

const ATAS_INICIAIS: Ata[] = [
  {
    id: "ATA-2026-004", titulo: "Análise crítica da direção — 1º semestre", data: "30/06/2026",
    participantes: "Diretoria, Fernanda Lima, Rafael Costa, Beatriz Souza",
    pauta: "Desempenho dos indicadores, resultado das auditorias, status das NCs e recursos necessários.",
    deliberacoes: "Aprovada a contratação de auditor interno adicional e revisão da meta de eficácia para 90%.",
    anexo: "ata-analise-critica-1s2026.pdf",
  },
  {
    id: "ATA-2026-003", titulo: "Reunião de abertura de auditoria interna", data: "12/05/2026",
    participantes: "Rafael Costa, Diego Almeida, gestores de área",
    pauta: "Escopo, critérios e agenda da auditoria interna.",
    deliberacoes: "Agenda validada; auditoria da produção antecipada para o turno da manhã.",
  },
];

const LISTAS_INICIAIS: ListaFreq[] = [
  {
    id: "LF-2026-011", evento: "Diálogo Diário de Segurança — linha de envase", data: "18/08/2026",
    participantes: [
      { nome: "Marcos Vieira", confirmado: true },
      { nome: "Ana Paula Reis", confirmado: true },
      { nome: "Jonas Ferreira", confirmado: false },
    ],
  },
  {
    id: "LF-2026-010", evento: "Treinamento — Controle de documentos (rev. 04)", data: "05/08/2026",
    participantes: [
      { nome: "Beatriz Souza", confirmado: true },
      { nome: "Diego Almeida", confirmado: true },
      { nome: "Carla Menezes", confirmado: true },
    ],
  },
];

function NovaAtaDialog({ onCreate }: { onCreate: (a: Ata) => void }) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [pauta, setPauta] = useState("");
  const [deliberacoes, setDeliberacoes] = useState("");
  const [anexo, setAnexo] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-lg">
          <Plus className="mr-1.5 h-4 w-4" /> Nova Ata de Reunião
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Ata de Reunião</DialogTitle>
          <DialogDescription className="text-xs">
            Registro estruturado da reunião. Campos genéricos por ora — serão ajustados quando o modelo oficial for fornecido.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">Título da reunião</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Anexo</Label>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 text-[11px] text-muted-foreground hover:border-brand/50">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="truncate">{anexo || "Selecionar arquivo"}</span>
              <input type="file" className="hidden" onChange={(e) => setAnexo(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">Participantes</Label>
            <Input value={participantes} onChange={(e) => setParticipantes(e.target.value)} className="h-9 text-xs" placeholder="Nomes separados por vírgula" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">Pauta</Label>
            <Textarea value={pauta} onChange={(e) => setPauta(e.target.value)} rows={2} className="text-xs" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px]">Deliberações</Label>
            <Textarea value={deliberacoes} onChange={(e) => setDeliberacoes(e.target.value)} rows={2} className="text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" disabled={!titulo.trim()} className="bg-brand text-white hover:bg-brand/90"
            onClick={() => {
              onCreate({
                id: `ATA-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
                titulo, data: data ? new Date(`${data}T00:00`).toLocaleDateString("pt-BR") : "—",
                participantes, pauta, deliberacoes, anexo: anexo || undefined,
              });
              setOpen(false);
              setTitulo(""); setData(""); setParticipantes(""); setPauta(""); setDeliberacoes(""); setAnexo("");
              toast.success("Ata de reunião arquivada.");
            }}>
            Arquivar ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovaListaDialog({ onCreate }: { onCreate: (l: ListaFreq) => void }) {
  const [open, setOpen] = useState(false);
  const [evento, setEvento] = useState("");
  const [data, setData] = useState("");
  const [nomes, setNomes] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-lg">
          <Plus className="mr-1.5 h-4 w-4" /> Nova Lista de Frequência
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Nova Lista de Frequência</DialogTitle>
          <DialogDescription className="text-xs">
            Usada em treinamentos e no Diálogo Diário de Segurança (DDS). Este registro também pode ser
            anexado a partir do submódulo Comunicações — a lista é apenas referenciada, nunca duplicada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px]">Título / evento</Label>
            <Input value={evento} onChange={(e) => setEvento(e.target.value)} className="h-9 text-xs" placeholder="Ex.: DDS — uso de EPI na linha 2" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Participantes (um por linha)</Label>
            <Textarea value={nomes} onChange={(e) => setNomes(e.target.value)} rows={4} className="text-xs" placeholder={"Marcos Vieira\nAna Paula Reis"} />
            <p className="text-[10px] text-muted-foreground">Cada participante recebe uma confirmação/assinatura eletrônica na lista.</p>
          </div>
        </div>
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="sm" disabled={!evento.trim()} className="bg-brand text-white hover:bg-brand/90"
            onClick={() => {
              onCreate({
                id: `LF-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
                evento, data: data ? new Date(`${data}T00:00`).toLocaleDateString("pt-BR") : "—",
                participantes: nomes.split("\n").map((n) => n.trim()).filter(Boolean).map((n) => ({ nome: n, confirmado: false })),
              });
              setOpen(false);
              setEvento(""); setData(""); setNomes("");
              toast.success("Lista de frequência criada.");
            }}>
            Criar lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegistrosSection({
  atas, listas, onAta, onLista, onAssinar,
}: {
  atas: Ata[]; listas: ListaFreq[];
  onAta: (a: Ata) => void; onLista: (l: ListaFreq) => void;
  onAssinar: (idLista: string, nome: string) => void;
}) {
  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Archive className="h-4 w-4 text-brand" /> Atas e listas de frequência
            </CardTitle>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Seção arquivada separadamente das demais categorias de documento.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NovaAtaDialog onCreate={onAta} />
            <NovaListaDialog onCreate={onLista} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="atas">
          <TabsList className="rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="atas" className="rounded-md text-xs">Atas de reunião ({atas.length})</TabsTrigger>
            <TabsTrigger value="listas" className="rounded-md text-xs">Listas de frequência ({listas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="atas" className="mt-3 space-y-2">
            {atas.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-brand">{a.id}</span>
                  <span className="text-xs font-medium text-foreground">{a.titulo}</span>
                  <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{a.data}</Badge>
                  {a.anexo && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Paperclip className="h-3 w-3" /> {a.anexo}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 grid gap-1 text-[11px] text-muted-foreground md:grid-cols-3">
                  <div><strong className="text-foreground/80">Participantes:</strong> {a.participantes || "—"}</div>
                  <div><strong className="text-foreground/80">Pauta:</strong> {a.pauta || "—"}</div>
                  <div><strong className="text-foreground/80">Deliberações:</strong> {a.deliberacoes || "—"}</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="listas" className="mt-3 space-y-2">
            {listas.map((l) => (
              <div key={l.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-brand">{l.id}</span>
                  <span className="text-xs font-medium text-foreground">{l.evento}</span>
                  <Badge variant="outline" className="rounded-md text-[10px] text-muted-foreground">{l.data}</Badge>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {l.participantes.filter((p) => p.confirmado).length}/{l.participantes.length} confirmados
                  </span>
                </div>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {l.participantes.map((p) => (
                    <div key={p.nome} className={cn(
                      "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-[11px]",
                      p.confirmado ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/10" : "border-border/70",
                    )}>
                      <span className="text-foreground/85">{p.nome}</span>
                      {p.confirmado ? (
                        <span className="inline-flex items-center gap-1 text-[color:var(--success)]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Assinado
                        </span>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-brand" onClick={() => onAssinar(l.id, p.nome)}>
                          Confirmar presença
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PermissoesCard() {
  return (
    <Card className="rounded-xl border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-brand" /> Matriz de permissões documentais
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          <strong className="text-foreground/80">Alteração</strong> — mudar o documento padrão ou a governança (quem define o modelo).{" "}
          <strong className="text-foreground/80">Redação</strong> — preencher com informações e números (quem alimenta os registros).
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border/70">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                <TableHead>Perfil</TableHead>
                <TableHead className="text-center">Alteração</TableHead>
                <TableHead className="text-center">Redação</TableHead>
                <TableHead className="text-center">Visualização</TableHead>
                <TableHead>Escopo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissoes.map((p) => (
                <TableRow key={p.perfil} className="text-xs">
                  <TableCell className="font-medium">{p.perfil}</TableCell>
                  {[p.alteracao, p.redacao, p.visualizacao].map((v, i) => (
                    <TableCell key={i} className="text-center">
                      {v ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-[color:var(--success)]" />
                      ) : (
                        <Ban className="mx-auto h-3.5 w-3.5 text-muted-foreground/60" />
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-muted-foreground">{p.nota}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoricoDialog({ doc, open, onOpenChange }: { doc: Doc | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Histórico de revisões — {doc?.codigo}</DialogTitle>
          <DialogDescription className="text-xs">{doc?.titulo}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {doc?.historico.map((h, i) => (
            <div key={h.rev + h.data} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold",
                  i === 0 ? "bg-brand text-white" : "bg-muted text-muted-foreground",
                )}>{h.rev}</div>
                {i < doc.historico.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-border" />}
              </div>
              <div className="pb-3">
                <div className="text-xs font-medium text-foreground">
                  Revisão {h.rev} · {h.data}
                  {i === 0 && <Badge variant="outline" className="ml-2 rounded-md text-[10px]">atual</Badge>}
                </div>
                <div className="text-[11px] text-muted-foreground">Por {h.autor}</div>
                <div className="mt-1 text-xs text-foreground/85">{h.mudanca}</div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocTable({
  docs, showOrigem, perfil, onHistorico, onObsoletar,
}: {
  docs: Doc[]; showOrigem?: boolean; perfil: Perfil;
  onHistorico: (d: Doc) => void; onObsoletar: (d: Doc) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
            <TableHead>Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            {showOrigem && <TableHead>Origem</TableHead>}
            <TableHead>Revisão atual</TableHead>
            <TableHead>Última revisão</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((d) => (
            <TableRow key={d.codigo} className="text-xs">
              <TableCell className="font-mono text-[11px] font-semibold text-brand">{d.codigo}</TableCell>
              <TableCell className="max-w-[300px] text-foreground/85">{d.titulo}</TableCell>
              <TableCell><Badge variant="outline" className="rounded-md text-[10px]">{d.tipo}</Badge></TableCell>
              {showOrigem && <TableCell className="text-muted-foreground">{d.origem}</TableCell>}
              <TableCell className="font-mono text-[11px] text-foreground/85">{d.rev}</TableCell>
              <TableCell className="text-muted-foreground">{d.data}</TableCell>
              <TableCell className="text-muted-foreground">{d.resp}</TableCell>
              <TableCell><Badge variant="outline" className={cn("rounded-md border text-[10px]", statusColor[d.status])}>{d.status}</Badge></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => onHistorico(d)}>
                    <History className="h-3.5 w-3.5" /> Histórico
                  </Button>
                  {podeAlterar(perfil) && d.status !== "Obsoleto" && (
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-[color:var(--severity-high)]" onClick={() => onObsoletar(d)}>
                      <Ban className="h-3.5 w-3.5" /> Inutilizar ou Revogar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function NovoDocumentoDialog({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [raci, setRaci] = useState<Record<string, string>>({
    Comercial: "Consultado", Compras: "Informado", Produção: "Responsável", Qualidade: "Aprovador", RH: "Informado",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled} className="rounded-lg bg-brand text-white hover:bg-brand/90">
          <Plus className="mr-1.5 h-4 w-4" /> Novo documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base">Novo documento de processo</DialogTitle>
          <DialogDescription className="text-xs">
            Criar ou alterar um fluxo de Processo de Suporte ou de Produto/Serviço, com a matriz RACI correspondente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Título do documento</Label>
            <Input className="h-9 text-xs" placeholder="Ex.: Procedimento de Atendimento Comercial" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Natureza do processo</Label>
            <Select defaultValue="suporte">
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="suporte">Processo de Suporte</SelectItem>
                <SelectItem value="produto">Processo de Produto ou Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Código</Label>
            <Input className="h-9 font-mono text-xs" placeholder="PO.XXX.000" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Elaborador</Label>
            <Input className="h-9 text-xs" placeholder="Nome do elaborador" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Objetivo e escopo do fluxo</Label>
            <Textarea className="min-h-[70px] text-xs" placeholder="Descreva entradas, atividades principais e saídas do processo." />
          </div>
        </div>

        <Separator />
        <div className="space-y-2">
          <div className="text-xs font-semibold">Matriz RACI do fluxo</div>
          <div className="overflow-hidden rounded-lg border border-border/70">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <TableHead>Área / submódulo</TableHead>
                  <TableHead>Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {raciAreas.map((a) => (
                  <TableRow key={a} className="text-xs">
                    <TableCell className="font-medium">{a}</TableCell>
                    <TableCell>
                      <Select value={raci[a]} onValueChange={(v) => setRaci((r) => ({ ...r, [a]: v }))}>
                        <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {raciPapeis.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            size="sm"
            className="bg-brand text-white hover:bg-brand/90"
            onClick={() => { setOpen(false); toast.success("Documento de processo enviado para aprovação."); }}
          >
            Enviar para aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RepositorioDialog({ onIncluir }: { onIncluir: (d: Doc) => void }) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<Tipo>("Norma");
  const [rev, setRev] = useState("");
  const [data, setData] = useState("");
  const [resp, setResp] = useState("");
  const [status, setStatus] = useState<Status>("Vigente");
  const [arquivo, setArquivo] = useState("");
  const [sugestao, setSugestao] = useState<{ rev: string; data: string } | null>(null);
  const [analisando, setAnalisando] = useState(false);

  const analisar = () => {
    setAnalisando(true);
    setTimeout(() => {
      const s = { rev: "03", data: "18/05/2026" };
      setSugestao(s);
      setRev(s.rev);
      setData(s.data);
      setAnalisando(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-lg">
          <Upload className="mr-1.5 h-4 w-4" /> Incluir documento no repositório
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Incluir documento no repositório</DialogTitle>
          <DialogDescription className="text-xs">
            Arquivamento de documentos manuais de qualquer natureza, vindos de fora do sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="h-9 text-xs" placeholder="Ex.: NR-12 — Segurança em máquinas e equipamentos" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {tiposRepositorio.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Responsável</Label>
            <Input value={resp} onChange={(e) => setResp(e.target.value)} className="h-9 text-xs" placeholder="Nome do responsável" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Revisão</Label>
            <Input value={rev} onChange={(e) => setRev(e.target.value)} className="h-9 font-mono text-xs" placeholder="Ex.: 02" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data da última revisão</Label>
            <Input value={data} onChange={(e) => setData(e.target.value)} className="h-9 text-xs" placeholder="dd/mm/aaaa" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Vigente">Vigente</SelectItem>
                <SelectItem value="Em revisão">Em revisão</SelectItem>
                <SelectItem value="Obsoleto">Obsoleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Upload do arquivo</Label>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 text-[11px] text-muted-foreground hover:border-brand/50">
              <Upload className="h-3.5 w-3.5" />
              <span className="truncate">{arquivo || "Selecionar arquivo (PDF, DOCX, XLSX)"}</span>
              <input type="file" className="hidden" onChange={(e) => setArquivo(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
          <div className="text-[11px] text-muted-foreground">
            A IA lê o arquivo anexado e sugere revisão e data da última revisão.
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[11px] text-brand" onClick={analisar} disabled={analisando}>
            <Sparkles className="h-3.5 w-3.5" /> {analisando ? "Analisando…" : "Analisar com IA"}
          </Button>
        </div>

        {sugestao && (
          <Card className="rounded-xl border-brand/40 bg-brand-soft/40 shadow-none">
            <CardContent className="flex items-start gap-3 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-brand" />
              <div className="text-[11px]">
                <div className="text-xs font-semibold text-foreground">Sugestão da IA</div>
                <div className="text-muted-foreground">
                  Revisão <strong className="font-mono">{sugestao.rev}</strong> · última revisão em <strong>{sugestao.data}</strong>,
                  identificadas no cabeçalho e no rodapé do arquivo.
                </div>
                <div className="mt-1 text-muted-foreground">
                  Esta informação é <strong>apenas uma sugestão</strong> e deve ser analisada e confirmada por um responsável antes do arquivamento.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            size="sm"
            className="bg-brand text-white hover:bg-brand/90"
            disabled={!titulo}
            onClick={() => {
              onIncluir({
                codigo: `REP.${String(Math.floor(Math.random() * 900) + 100)}`,
                titulo, tipo, rev: rev || "—", data: data || "—", status, resp: resp || "—",
                origem: "Repositório manual",
                historico: [{ rev: rev || "—", data: data || "—", autor: resp || "—", mudanca: "Documento arquivado no repositório a partir de arquivo externo." }],
              });
              setOpen(false);
              toast.success("Documento incluído no repositório.");
              setTitulo(""); setRev(""); setData(""); setResp(""); setArquivo(""); setSugestao(null);
            }}
          >
            Incluir no repositório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SegurancaPanel() {
  const itens = [
    { icone: Server, titulo: "Hospedagem dos dados", texto: "Servidores em data centers no Brasil (região São Paulo), com criptografia em trânsito (TLS 1.3) e em repouso (AES-256). Aderente à LGPD." },
    { icone: DatabaseBackup, titulo: "Política de backup", texto: "Backup automático diário com retenção de 30 dias, cópia semanal retida por 12 meses e teste de restauração trimestral documentado." },
    { icone: Lock, titulo: "Proteção contra alteração indevida", texto: "Toda revisão gera registro imutável de autor, data e conteúdo alterado. Documentos obsoletos não podem ser excluídos, apenas arquivados, e o acesso segue a matriz de permissões (Alteração x Redação)." },
  ];
  return (
    <Card className="rounded-xl border-border/70 bg-muted/20 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-brand" /> Segurança da informação e backup
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Informações de apoio para auditorias e para apresentação a clientes.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {itens.map((i) => (
          <div key={i.titulo} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <i.icone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">{i.titulo}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{i.texto}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DocumentosPage() {
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Gestor da Qualidade");
  const [internos, setInternos] = useState<Doc[]>(docsIniciais);
  const [externos, setExternos] = useState<Doc[]>(externosIniciais);
  const [histDoc, setHistDoc] = useState<Doc | null>(null);
  const [histOpen, setHistOpen] = useState(false);
  const [obsoletar, setObsoletar] = useState<Doc | null>(null);
  const [atas, setAtas] = useState<Ata[]>(ATAS_INICIAIS);
  const [listas, setListas] = useState<ListaFreq[]>(LISTAS_INICIAIS);

  const filt = (arr: Doc[]) => arr.filter((d) => (d.codigo + d.titulo).toLowerCase().includes(busca.toLowerCase()));
  const abrirHistorico = (d: Doc) => { setHistDoc(d); setHistOpen(true); };

  const confirmarObsoleto = () => {
    if (!obsoletar) return;
    const marcar = (arr: Doc[]) => arr.map((d) => d.codigo === obsoletar.codigo
      ? {
          ...d, status: "Obsoleto" as Status,
          historico: [{ rev: d.rev, data: "17/08/2026", autor: perfil, mudanca: "Documento tornado obsoleto — retirado de uso e mantido no histórico." }, ...d.historico],
        }
      : d);
    setInternos(marcar);
    setExternos(marcar);
    toast.success(`${obsoletar.codigo} inutilizado/revogado e mantido no histórico.`);
    setObsoletar(null);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documentos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Informação documentada — controle de documentos internos, externos e repositório.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={perfil} onValueChange={(v) => setPerfil(v as Perfil)}>
              <SelectTrigger className="h-9 w-52 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {perfis.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} className="h-9 w-56 rounded-lg pl-8 text-xs" placeholder="Buscar por código ou título…" />
            </div>
            <RepositorioDialog onIncluir={(d) => setExternos((prev) => [d, ...prev])} />
            <NovoDocumentoDialog disabled={!podeAlterar(perfil)} />
          </div>
        </header>

        {!podeAlterar(perfil) && (
          <Card className="rounded-xl border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 shadow-none">
            <CardContent className="flex items-start gap-3 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--severity-high)]" />
              <div className="text-[11px] text-muted-foreground">
                O perfil <strong className="text-foreground">{perfil}</strong> possui permissão de <strong>Redação</strong> e <strong>Visualização</strong>:
                pode preencher informações e números nos registros do seu setor, mas não pode alterar o documento padrão nem torná-lo obsoleto.
              </div>
            </CardContent>
          </Card>
        )}

        <PoliticaQualidadeCard perfil={perfil} />

        <PermissoesCard />

        <RegistrosSection
          atas={atas}
          listas={listas}
          onAta={(a) => setAtas((p) => [a, ...p])}
          onLista={(l) => setListas((p) => [l, ...p])}
          onAssinar={(id, nome) => {
            setListas((p) => p.map((l) => l.id === id
              ? { ...l, participantes: l.participantes.map((x) => (x.nome === nome ? { ...x, confirmado: true } : x)) }
              : l));
            toast.success(`Presença de ${nome} confirmada.`);
          }}
        />

        <Tabs defaultValue="int">
          <TabsList className="rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="int" className="rounded-md text-xs">Internos ({internos.length})</TabsTrigger>
            <TabsTrigger value="ext" className="rounded-md text-xs">Externos e repositório ({externos.length})</TabsTrigger>
            <TabsTrigger value="pen" className="rounded-md text-xs">Pendentes de aprovação ({pendentes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="int" className="mt-4">
            <DocTable docs={filt(internos)} perfil={perfil} onHistorico={abrirHistorico} onObsoletar={setObsoletar} />
          </TabsContent>

          <TabsContent value="ext" className="mt-4 space-y-3">
            <Card className="rounded-xl border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 shadow-none">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-[color:var(--severity-high)]" />
                <div>
                  <div className="text-xs font-semibold text-foreground">Oportunidade de melhoria (OPM)</div>
                  <div className="text-[11px] text-muted-foreground">Recomenda-se centralizar o controle de documentos externos em um único repositório, com verificação semestral de vigência das normas técnicas e requisitos legais aplicáveis.</div>
                </div>
              </CardContent>
            </Card>
            <DocTable docs={filt(externos)} showOrigem perfil={perfil} onHistorico={abrirHistorico} onObsoletar={setObsoletar} />
          </TabsContent>

          <TabsContent value="pen" className="mt-4 space-y-3">
            {pendentes.map((p) => (
              <Card key={p.codigo} className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] font-semibold text-brand">{p.codigo}</div>
                      <div className="text-sm font-medium text-foreground">{p.titulo}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {["Elaborado", "Analisado", "Aprovado"].map((etapa, i) => {
                      const done = i < p.etapa;
                      const current = i === p.etapa;
                      return (
                        <div key={etapa} className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold",
                              done ? "border-[color:var(--success)] bg-[color:var(--success)] text-white" :
                              current ? "border-brand bg-brand-soft text-brand" :
                              "border-border bg-muted text-muted-foreground",
                            )}>
                              {done ? <CheckCircle2 className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : (i + 1)}
                            </div>
                            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{etapa}</div>
                            <div className="text-[10px] font-medium text-foreground/80">{p.quem[i]}</div>
                          </div>
                          {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <SegurancaPanel />
      </div>

      <HistoricoDialog doc={histDoc} open={histOpen} onOpenChange={setHistOpen} />

      <AlertDialog open={!!obsoletar} onOpenChange={(v) => !v && setObsoletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Inutilizar ou revogar o documento?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {obsoletar?.codigo} — {obsoletar?.titulo}. O documento sai de uso imediatamente e deixa de ser aplicável
              às atividades, mas <strong>permanece no histórico</strong> para fins de rastreabilidade e auditoria. A ação é registrada com autor e data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-brand text-white hover:bg-brand/90" onClick={confirmarObsoleto}>
              Confirmar inutilização/revogação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
