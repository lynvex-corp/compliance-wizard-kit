import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/auditorias")({
  component: () => (
    <PlaceholderPage title="Auditorias" description="Programação e execução de auditorias internas e externas." />
  ),
});