import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/partes-interessadas")({
  component: () => <PlaceholderPage title="Partes Interessadas" description="Mapeamento de stakeholders, necessidades e expectativas." />,
});
