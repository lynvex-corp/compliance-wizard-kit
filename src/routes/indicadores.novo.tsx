import { createFileRoute } from "@tanstack/react-router";
import { ElaborarIndicadorPage } from "@/components/indicadores/elaborar";

export const Route = createFileRoute("/indicadores/novo")({
  component: ElaborarIndicadorPage,
});