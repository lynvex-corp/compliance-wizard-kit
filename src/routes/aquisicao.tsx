import { createFileRoute } from "@tanstack/react-router";
import { AquisicaoPage } from "@/components/aquisicao/page";

export const Route = createFileRoute("/aquisicao")({
  component: AquisicaoPage,
});
