import { createFileRoute } from "@tanstack/react-router";
import { IndicadoresDashboard } from "@/components/indicadores/dashboard";

export const Route = createFileRoute("/indicadores")({
  component: IndicadoresDashboard,
});