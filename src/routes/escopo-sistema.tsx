import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/app/placeholder-page";

export const Route = createFileRoute("/escopo-sistema")({
  component: () => <PlaceholderPage title="Escopo do Sistema" description="Definição e limites do sistema de gestão." />,
});
