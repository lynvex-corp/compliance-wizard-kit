import { createFileRoute } from "@tanstack/react-router";
import { MudancasSGPage } from "@/components/estrategia/mudancas-sg";

export const Route = createFileRoute("/mudancas-sg")({
  head: () => ({
    meta: [
      { title: "Mudanças no Sistema de Gestão | Jáwda" },
      { name: "description", content: "Controle de mudanças planejadas com checklist de avaliação obrigatório, decisão final e plano de implementação." },
      { property: "og:title", content: "Mudanças no Sistema de Gestão | Jáwda" },
      { property: "og:description", content: "Avalie propósito, integridade, recursos e responsabilidades antes de aprovar cada mudança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MudancasSGPage,
});
