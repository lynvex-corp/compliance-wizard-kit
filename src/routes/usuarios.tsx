import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/usuarios")({
  component: () => (
    <PlaceholderPage title="Usuários e Permissões" description="Gestão de acessos e papéis." />
  ),
});