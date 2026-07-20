import { createFileRoute } from "@tanstack/react-router";
import { NovaAuditoriaWizard } from "@/components/auditorias/nova-wizard";

export const Route = createFileRoute("/auditorias/nova")({
  component: NovaAuditoriaWizard,
});
