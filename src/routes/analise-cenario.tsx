import { createFileRoute } from "@tanstack/react-router";
import { AnaliseCenarioPage } from "@/components/estrategia/analise-cenario";

export const Route = createFileRoute("/analise-cenario")({
  component: AnaliseCenarioPage,
});
