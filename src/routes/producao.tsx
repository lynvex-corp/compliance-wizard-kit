import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/producao")({
  component: () => <PlaceholderPage title="Produção e Serviços" description="Planejamento e execução da produção e prestação de serviços." />,
});
