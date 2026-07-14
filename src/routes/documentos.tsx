import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/documentos")({
  component: () => (
    <PlaceholderPage title="Documentos" description="Controle de documentos e registros da qualidade." />
  ),
});