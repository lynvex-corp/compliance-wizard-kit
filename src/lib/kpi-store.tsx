import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  mockKpis, objetivosQualidade, kpiCodigo,
  type Kpi, type Medicao, type ObjetivoQualidade, type TrilhaEvento,
} from "./kpi-data";

interface KpiCtx {
  kpis: Kpi[];
  objetivos: ObjetivoQualidade[];
  addKpi: (k: Omit<Kpi, "id" | "codigo" | "medicoes" | "trilha">) => Kpi;
  updateKpi: (id: string, patch: Partial<Kpi>, evento?: string) => void;
  arquivarKpi: (id: string) => void;
  addMedicao: (id: string, m: Omit<Medicao, "id">) => void;
  addObjetivo: (o: Omit<ObjetivoQualidade, "id">) => void;
  proximoCodigo: (fonte: Kpi["fonte"]) => string;
}

const Ctx = createContext<KpiCtx | null>(null);

const agora = () =>
  new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function KpiProvider({ children }: { children: ReactNode }) {
  const [kpis, setKpis] = useState<Kpi[]>(mockKpis);
  const [objetivos, setObjetivos] = useState<ObjetivoQualidade[]>(objetivosQualidade);

  const value = useMemo<KpiCtx>(() => {
    const proximoCodigo = (fonte: Kpi["fonte"]) => kpiCodigo(fonte, kpis.length + 1);

    return {
      kpis,
      objetivos,
      proximoCodigo,
      addKpi: (k) => {
        const novo: Kpi = {
          ...k,
          id: `kpi-${Date.now()}`,
          codigo: proximoCodigo(k.fonte),
          medicoes: [],
          trilha: [{ id: `t-${Date.now()}`, data: agora(), autor: k.responsavelMedicao, acao: "Indicador criado", detalhe: k.nome }],
        };
        setKpis((prev) => [novo, ...prev]);
        return novo;
      },
      updateKpi: (id, patch, evento) => {
        setKpis((prev) =>
          prev.map((k) => {
            if (k.id !== id) return k;
            const trilha: TrilhaEvento[] = evento
              ? [...k.trilha, { id: `t-${Date.now()}`, data: agora(), autor: "Você", acao: evento }]
              : k.trilha;
            return { ...k, ...patch, trilha };
          }),
        );
      },
      arquivarKpi: (id) => {
        setKpis((prev) =>
          prev.map((k) =>
            k.id === id
              ? { ...k, arquivado: true, trilha: [...k.trilha, { id: `t-${Date.now()}`, data: agora(), autor: "Você", acao: "Indicador arquivado" }] }
              : k,
          ),
        );
      },
      addMedicao: (id, m) => {
        setKpis((prev) =>
          prev.map((k) =>
            k.id === id
              ? {
                  ...k,
                  medicoes: [...k.medicoes, { ...m, id: `med-${Date.now()}` }],
                  trilha: [
                    ...k.trilha,
                    { id: `t-${Date.now()}`, data: agora(), autor: m.responsavel, acao: "Medição lançada", detalhe: `${m.periodo} · ${m.valor}${k.unidade}` },
                  ],
                }
              : k,
          ),
        );
      },
      addObjetivo: (o) => setObjetivos((prev) => [...prev, { ...o, id: `obj-${Date.now()}` }]),
    };
  }, [kpis, objetivos]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKpis() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKpis deve ser usado dentro de KpiProvider");
  return ctx;
}