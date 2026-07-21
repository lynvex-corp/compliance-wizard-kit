import { createFileRoute } from "@tanstack/react-router";
import { NovoPlanoWizard } from "@/components/planos-de-acao/nova-wizard";

export const Route = createFileRoute("/planos-de-acao/novo")({
  component: NovoPlanoWizard,
});