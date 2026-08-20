import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/pessoas/performance";

export const Route = createFileRoute("/avaliacao-performance")({
  head: () => ({
    meta: [
      { title: "Avaliação de Desempenho — Jáwda" },
      { name: "description", content: "Ciclos de avaliação, Método CHA com escala de 1 a 10, Matriz de Apoio à Decisão (Desempenho x Cultura) e registro de devolutiva." },
      { property: "og:title", content: "Avaliação de Desempenho — Jáwda" },
      { property: "og:description", content: "Programação dinâmica de ciclo, Método CHA confidencial, Matriz de Apoio à Decisão e devolutiva compartilhável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformancePage,
});
