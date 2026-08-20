import { createFileRoute } from "@tanstack/react-router";
import { MudancasSGPage } from "@/components/estrategia/mudancas-sg";

export const Route = createFileRoute("/mudancas-sg")({
  head: () => ({
    meta: [
      { title: "Mudanças e Melhoria | Jáwda" },
      { name: "description", content: "Registre mudanças e melhorias no mesmo fluxo: checklist de avaliação obrigatório, decisão final e plano de implementação." },
      { property: "og:title", content: "Mudanças e Melhoria | Jáwda" },
      { property: "og:description", content: "Avalie propósito, integridade, recursos e responsabilidades antes de aprovar cada mudança ou melhoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MudancasSGPage,
});
