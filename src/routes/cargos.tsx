import { createFileRoute } from "@tanstack/react-router";
import { CargosPage } from "@/components/pessoas/cargos";

export const Route = createFileRoute("/cargos")({
  head: () => ({
    meta: [
      { title: "Cargos e Perfis — Competências | Jáwda" },
      { name: "description", content: "Descrições de cargo, requisitos, treinamentos, dossiê do empregado e atestação de competência com controle de acesso LGPD." },
      { property: "og:title", content: "Cargos e Perfis — Competências | Jáwda" },
      { property: "og:description", content: "Gestão de competências por cargo com dossiê restrito e fluxo de atestação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CargosPage,
});
