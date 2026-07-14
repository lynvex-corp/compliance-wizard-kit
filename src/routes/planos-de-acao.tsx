import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/planos-de-acao")({
  component: () => (
    <PlaceholderPage title="Planos de Ação" description="Gestão de ações corretivas e preventivas." />
  ),
});