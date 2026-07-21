import { createFileRoute } from "@tanstack/react-router";
import { SuportePage } from "@/components/suporte/page";

export const Route = createFileRoute("/suporte")({
  component: SuportePage,
});
