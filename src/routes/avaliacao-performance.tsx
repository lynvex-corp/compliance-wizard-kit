import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/avaliacao-performance")({
  component: () => <PlaceholderPage title="Avaliação de Performance" description="Avaliação de desempenho e feedback." />,
});
