import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/pessoas/performance";

export const Route = createFileRoute("/avaliacao-performance")({
  component: PerformancePage,
});
