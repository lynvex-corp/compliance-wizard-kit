import { createFileRoute } from "@tanstack/react-router";
import { EscopoSistemaPage } from "@/components/estrategia/escopo-sistema";

export const Route = createFileRoute("/escopo-sistema")({
  component: EscopoSistemaPage,
});
