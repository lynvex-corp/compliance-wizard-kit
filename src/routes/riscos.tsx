import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/riscos")({
  component: () => (
    <PlaceholderPage title="Riscos e Oportunidades" description="Mapa de riscos e oportunidades do SGQ." />
  ),
});