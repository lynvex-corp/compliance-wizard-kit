import { createFileRoute } from "@tanstack/react-router";
import { ComunicacoesPage } from "@/components/comunicacoes/page";

export const Route = createFileRoute("/comunicacoes")({
  component: ComunicacoesPage,
});
