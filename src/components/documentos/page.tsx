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
  { perfil: "Gestor da Qualidade", alteracao: true, redacao: true, visualizacao: true, nota: "Elabora, revisa e torna documentos obsoletos." },
  { perfil: "Executor (por setor)", alteracao: false, redacao: true, visualizacao: true, nota: "Preenche informações e números nos registros do seu setor." },
];

function podeAlterar(p: Perfil) {
  return p === "Diretoria" || p === "Gestor da Qualidade";
}

const tiposRepositorio: Tipo[] = ["Lei", "Manual", "Norma", "Planilha", "Procedimento", "Outro"];

const raciPapeis = ["Responsável", "Aprovador", "Consultado", "Informado"] as const;
const raciAreas = ["Comercial", "Compras", "Produção", "Qualidade", "RH"];

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
                      <Archive className="h-3.5 w-3.5" /> Obsoletar
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
            <Label className="text-xs">Responsável pela elaboração</Label>
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
    toast.success(`${obsoletar.codigo} tornado obsoleto e mantido no histórico.`);
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

        <PermissoesCard />

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
            <AlertDialogTitle className="text-base">Tornar o documento obsoleto?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {obsoletar?.codigo} — {obsoletar?.titulo}. O documento sai de uso imediatamente e deixa de ser aplicável
              às atividades, mas <strong>permanece no histórico</strong> para fins de rastreabilidade e auditoria. A ação é registrada com autor e data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-brand text-white hover:bg-brand/90" onClick={confirmarObsoleto}>
              Confirmar obsolescência
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
