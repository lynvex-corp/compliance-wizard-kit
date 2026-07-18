import { createFileRoute } from "@tanstack/react-router";
import { IndicadoresPage } from "@/components/indicadores/page";

export const Route = createFileRoute("/indicadores")({
  component: IndicadoresPage,
});