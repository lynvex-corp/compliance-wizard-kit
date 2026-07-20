import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/aquisicao")({
  component: () => <PlaceholderPage title="Aquisição / Fornecedores" description="Qualificação, avaliação e monitoramento de fornecedores." />,
});
