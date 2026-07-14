import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JawdaLogo } from "@/components/brand/logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Jáwda" },
      { name: "description", content: "Acesse a plataforma Jáwda de gestão de conformidade." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-brand-soft/50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <JawdaLogo showWordmark={false} size={48} />
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Bem-vindo à Jáwda
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestão de conformidade e qualidade
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">E-mail corporativo</Label>
              <Input id="email" type="email" placeholder="voce@empresa.com" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-xs font-medium">Senha</Label>
                <a href="#" className="text-xs font-medium text-brand hover:underline">Esqueci</a>
              </div>
              <Input id="senha" type="password" placeholder="••••••••" className="h-10 rounded-lg" />
            </div>
            <Button asChild className="mt-2 h-10 w-full rounded-lg bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/">Entrar</Link>
            </Button>
          </div>
          <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
            Ao entrar, você concorda com os termos e a política de privacidade.
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 Jáwda · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}