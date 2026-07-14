import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/nao-conformidades")({
  component: () => (
    <PlaceholderPage
      title="Não Conformidades"
      description="Registre, acompanhe e trate NCs ao longo de todo o ciclo de vida."
    />
  ),
});