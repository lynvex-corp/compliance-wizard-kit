import { createFileRoute } from "@tanstack/react-router";
import { NaoConformidadesPage } from "@/components/nao-conformidades/page";

export const Route = createFileRoute("/nao-conformidades/")({
  component: NaoConformidadesPage,
});
