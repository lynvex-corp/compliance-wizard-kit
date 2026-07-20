import { createFileRoute } from "@tanstack/react-router";
import { AuditoriasPage } from "@/components/auditorias/page";

export const Route = createFileRoute("/auditorias/")({
  component: AuditoriasPage,
});
