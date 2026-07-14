import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/configuracoes")({
  component: () => (
    <PlaceholderPage title="Configurações" description="Preferências, integrações e parâmetros do sistema." />
  ),
});