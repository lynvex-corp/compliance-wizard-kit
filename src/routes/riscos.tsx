import { createFileRoute } from "@tanstack/react-router";
import { RiscosPage } from "@/components/riscos/page";

export const Route = createFileRoute("/riscos")({
  head: () => ({
    meta: [
      { title: "Riscos e Oportunidades | Jáwda" },
      { name: "description", content: "Matriz 5×5 de probabilidade e impacto, reavaliação pós-ação e identificação de riscos por processo." },
      { property: "og:title", content: "Riscos e Oportunidades | Jáwda" },
      { property: "og:description", content: "Inventário de riscos e oportunidades com matriz 5×5, planos vinculados e reavaliação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RiscosPage,
});
