import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/pessoas/performance";

export const Route = createFileRoute("/avaliacao-performance")({
  head: () => ({
    meta: [
      { title: "Avaliação de Desempenho — Jáwda" },
      { name: "description", content: "Ciclos de avaliação, formulário CHA com escala de 1 a 10, matriz de decisão desempenho × potencial e registro de devolutiva." },
      { property: "og:title", content: "Avaliação de Desempenho — Jáwda" },
      { property: "og:description", content: "Configuração de ciclo, avaliação CHA confidencial, matriz de decisão e devolutiva compartilhável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformancePage,
});
