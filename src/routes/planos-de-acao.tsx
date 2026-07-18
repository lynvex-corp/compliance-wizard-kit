import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/planos-de-acao")({
  component: () => <Outlet />,
});