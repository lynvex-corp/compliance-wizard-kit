import { createFileRoute } from "@tanstack/react-router";
import { AprendizagemPage } from "@/components/pessoas/aprendizagem";

export const Route = createFileRoute("/aprendizagem")({
  head: () => ({
    meta: [
      { title: "Gestão de Aprendizagem — Jáwda" },
      { name: "description", content: "Matriz anual de treinamentos por cargo, execução, verificação de eficácia e ações de conscientização do SGQ." },
      { property: "og:title", content: "Gestão de Aprendizagem — Jáwda" },
      { property: "og:description", content: "Treinamentos e conscientização com governança: rascunho, aguardando aprovação e aprovado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AprendizagemPage,
});
