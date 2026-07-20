import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/suporte")({
  component: () => <PlaceholderPage title="Suporte" description="Central de ajuda e chamados da plataforma." />,
});
