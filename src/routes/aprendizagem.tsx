import { createFileRoute } from "@tanstack/react-router";
import { AprendizagemPage } from "@/components/pessoas/aprendizagem";

export const Route = createFileRoute("/aprendizagem")({
  component: AprendizagemPage,
});
