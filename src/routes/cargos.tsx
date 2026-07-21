import { createFileRoute } from "@tanstack/react-router";
import { CargosPage } from "@/components/pessoas/cargos";

export const Route = createFileRoute("/cargos")({
  component: CargosPage,
});
