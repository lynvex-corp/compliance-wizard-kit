import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/cargos")({
  component: () => <PlaceholderPage title="Cargos e Perfis" description="Estrutura organizacional, cargos e competências." />,
});
