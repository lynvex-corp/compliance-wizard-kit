import {
  useState,
  type ReactNode,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  ShieldCheck,
  Trophy,
  Check,
  Award,
  Crown,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import {
  reconhecimentoIdentificadores,
  conquistasSetor,
  type ReconhecimentoPeriodo,
  type ConquistaSetor,
} from "@/lib/mock-data";

const periodos: ReconhecimentoPeriodo[] = [
  "Este mês",
  "Este trimestre",
  "Este ano",
];

/* ============================================================
 * Card 1 — Ranking "Quem mais identifica Não Conformidades"
 * ============================================================
 *
 * Nome em comentário para escolha do cliente:
 * - "Olho Vivo da Qualidade" (atual)
 * - "Guardiões da Qualidade"
 * - "Protetores do Padrão"
 * - "Heróis da Primeira Linha"
 */
function RankingCard() {
  const [periodo, setPeriodo] = useState<ReconhecimentoPeriodo>("Este mês");
  const [animating, setAnimating] = useState(false);

  const changePeriodo = (p: ReconhecimentoPeriodo) => {
    if (p === periodo) return;
    setAnimating(true);
    setPeriodo(p);
    setTimeout(() => setAnimating(false), 320);
  };

  const ranking = [...reconhecimentoIdentificadores]
    .sort((a, b) => b.contagens[periodo] - a.contagens[periodo])
    .slice(0, 5);

  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[color:var(--warning)]" />
              <CardTitle className="text-base font-semibold">
                Olho Vivo da Qualidade
              </CardTitle>
            </div>
            <CardDescription className="mt-1 max-w-md text-xs leading-relaxed">
              Pessoas que mais contribuem identificando problemas antes que
              virem prejuízo.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 p-1">
            {periodos.map((p) => (
              <Button
                key={p}
                variant={periodo === p ? "secondary" : "ghost"}
                size="sm"
                onClick={() => changePeriodo(p)}
                className={`h-7 px-2.5 text-xs ${
                  periodo === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul
          className={`space-y-2 transition-opacity duration-300 ease-out ${
            animating ? "opacity-60" : "opacity-100"
          }`}
        >
          {ranking.map((p, idx) => {
            const isFirst = idx === 0;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all duration-300 hover:bg-brand-soft/40 ${
                  isFirst
                    ? "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5"
                    : "border-border/60 bg-transparent"
                }`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isFirst
                      ? "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isFirst ? (
                    <Crown className="h-3.5 w-3.5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <Avatar className="h-9 w-9 border border-border/60">
                  <AvatarFallback
                    className={`text-xs font-semibold ${
                      isFirst
                        ? "bg-[color:var(--warning)]/15 text-[color:var(--severity-high)]"
                        : "bg-brand-soft text-brand"
                    }`}
                  >
                    {p.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {p.nome}
                    </span>
                    {isFirst && (
                      <Badge
                        variant="outline"
                        className="hidden border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 text-[color:var(--severity-high)] sm:inline-flex"
                      >
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.setor}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold leading-none text-foreground">
                    {p.contagens[periodo]}
                  </div>
                  <div className="text-[10px] text-muted-foreground">NCs</div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <span>Identificar cedo é cuidar. Cada registro aqui evita um prejuízo.</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
 * Card 2 — Selos e Conquistas por Setor
 * ============================================================ */

const iconMap: Record<ConquistaSetor["icone"], ReactNode> = {
  flame: <Flame className="h-5 w-5" />,
  "shield-check": <ShieldCheck className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  check: <Check className="h-5 w-5" />,
  award: <Award className="h-5 w-5" />,
};

function ConquistasCard() {
  const [items, setItems] = useState(conquistasSetor);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.ativa) {
          // Quebra o selo: registra a data e mantém a sequência histórica visível.
          return {
            ...c,
            ativa: false,
            quebradaEm: new Date().toLocaleDateString("pt-BR"),
            sequenciaAnterior: c.diasAtiva,
          };
        }
        // Reativa: reinicia a contagem.
        return { ...c, ativa: true, quebradaEm: undefined, diasAtiva: 0 };
      }),
    );
  };

  return (
    <Card className="rounded-xl border-border/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand" />
              <CardTitle className="text-base font-semibold">
                Conquistas da Qualidade
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-xs">
              Selos ativos por setor — reconhecimento coletivo.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setItems(conquistasSetor)}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Restaurar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const icone = iconMap[c.icone];
            if (!c.ativa) {
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className="group relative flex flex-col items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-left transition-all duration-300 hover:border-[color:var(--severity-critical)]/30 hover:bg-[color:var(--severity-critical)]/5"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {icone}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {c.setor}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-md border-[color:var(--severity-critical)]/30 bg-[color:var(--severity-critical)]/10 text-[color:var(--severity-critical)]"
                    >
                      Encerrada
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sequência encerrada em {c.quebradaEm} —{" "}
                    {c.sequenciaAnterior ?? c.diasAtiva} dias
                  </div>
                  <div className="text-[10px] text-muted-foreground/80">
                    Clique para simular reinício da contagem.
                  </div>
                </button>
              );
            }

            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className="group relative flex flex-col items-start gap-2 rounded-lg border border-border/80 bg-card p-3 text-left transition-all duration-300 hover:border-brand/30 hover:shadow-sm"
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        c.id === "conq-producao"
                          ? "bg-[color:var(--severity-high)]/12 text-[color:var(--severity-high)]"
                          : c.id === "conq-comercial"
                            ? "bg-[color:var(--success)]/12 text-[color:var(--success)]"
                            : "bg-[color:var(--warning)]/12 text-[color:var(--severity-high)]"
                      }`}
                    >
                      {icone}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {c.setor}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-md border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]"
                  >
                    Ativa
                  </Badge>
                </div>
                <div className="text-xs text-foreground">{c.titulo}</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Flame className="h-3 w-3" />
                  há {c.diasAtiva} dias
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReconhecimentoPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RankingCard />
      <ConquistasCard />
    </div>
  );
}
