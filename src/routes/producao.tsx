import { createFileRoute } from "@tanstack/react-router";
import { ProducaoPage } from "@/components/producao/page";

export const Route = createFileRoute("/producao")({
  component: ProducaoPage,
});
