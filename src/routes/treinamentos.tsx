import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/treinamentos")({
  component: () => (
    <PlaceholderPage title="Treinamentos" description="Capacitação e trilhas de aprendizado." />
  ),
});