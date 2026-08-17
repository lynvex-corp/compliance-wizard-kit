import { createFileRoute } from "@tanstack/react-router";
import { EscopoSistemaPage } from "@/components/estrategia/escopo-sistema";

export const Route = createFileRoute("/escopo-sistema")({
  head: () => ({
    meta: [
      { title: "Escopo do Sistema de Gestão | Jáwda" },
      { name: "description", content: "Declaração de escopo versionada com fluxo Rascunho → Aprovação da Alta Direção → Vigente e registro de itens não aplicáveis." },
      { property: "og:title", content: "Escopo do Sistema de Gestão | Jáwda" },
      { property: "og:description", content: "Versione o escopo do sistema de gestão e justifique cada item não aplicável da norma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EscopoSistemaPage,
});
