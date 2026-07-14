import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/indicadores")({
  component: () => (
    <PlaceholderPage title="Indicadores e KPIs" description="Métricas e indicadores de desempenho da qualidade." />
  ),
});