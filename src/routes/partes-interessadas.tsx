import { createFileRoute } from "@tanstack/react-router";
import { PartesInteressadasPage } from "@/components/estrategia/partes-interessadas";

export const Route = createFileRoute("/partes-interessadas")({
  component: PartesInteressadasPage,
});
