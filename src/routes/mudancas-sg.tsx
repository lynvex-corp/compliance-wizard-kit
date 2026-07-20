import { createFileRoute } from "@tanstack/react-router";
import { MudancasSGPage } from "@/components/estrategia/mudancas-sg";

export const Route = createFileRoute("/mudancas-sg")({
  component: MudancasSGPage,
});
