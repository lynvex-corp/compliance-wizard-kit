import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/comunicacoes")({
  component: () => <PlaceholderPage title="Comunicações" description="Comunicação interna e externa do SG." />,
});
