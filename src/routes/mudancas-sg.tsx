import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/mudancas-sg")({
  component: () => <PlaceholderPage title="Mudanças no SG" description="Controle de mudanças no sistema de gestão." />,
});
