import { createFileRoute } from "@tanstack/react-router";
import { AuditoriaDetailPage } from "@/components/auditorias/detalhe";

export const Route = createFileRoute("/auditorias/$id")({
  component: AuditoriaDetailPage,
});
