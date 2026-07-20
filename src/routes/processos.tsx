import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/processos")({
  component: () => <PlaceholderPage title="Processos e Fluxos" description="Mapa de processos e interações." />,
});
