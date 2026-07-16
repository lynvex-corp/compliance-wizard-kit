import { createFileRoute } from "@tanstack/react-router";
import { NCDetailPage } from "@/components/nao-conformidades/detalhe";

export const Route = createFileRoute("/nao-conformidades/$id")({
  component: NCDetailPage,
});
