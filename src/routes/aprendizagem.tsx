import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/aprendizagem")({
  component: () => <PlaceholderPage title="Gestão de Aprendizagem" description="Trilhas, cursos e desenvolvimento de pessoas." />,
});
