import { createFileRoute } from "@tanstack/react-router";
import { RiscosPage } from "@/components/riscos/page";

export const Route = createFileRoute("/riscos")({
  component: RiscosPage,
});