import { createFileRoute } from "@tanstack/react-router";
import { AquisicaoPage } from "@/components/aquisicao/page";

const title = "Fornecedores — Suprimentos · Jáwda";
const description =
  "Cadastro, critérios de qualificação, parâmetros e avaliações de fornecedores de material e serviço, com controle de pendências e reavaliação periódica.";

export const Route = createFileRoute("/aquisicao")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AquisicaoPage,
});
