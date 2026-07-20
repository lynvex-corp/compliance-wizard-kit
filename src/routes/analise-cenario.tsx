import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/analise-cenario")({
  component: () => <PlaceholderPage title="Análise de Cenário" description="Contexto interno e externo da organização (SWOT/PESTAL)." />,
});
