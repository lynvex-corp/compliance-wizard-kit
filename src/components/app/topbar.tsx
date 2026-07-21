import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { empresas } from "@/lib/mock-data";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hidden h-9 gap-2 rounded-lg px-3 text-sm font-medium text-foreground hover:bg-brand-soft/60 md:inline-flex"
          >
            {empresas[0].nome}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Trocar empresa / filial</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {empresas.map((e) => (
            <DropdownMenuItem key={e.id}>{e.nome}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative ml-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar NCs, documentos, auditorias…"
          className="h-9 rounded-lg border-border bg-muted/40 pl-9 text-sm focus-visible:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-lg"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--severity-critical)] px-1 text-[10px] font-semibold text-white">
          4
        </span>
      </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-brand-soft/60">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand text-brand-foreground text-xs font-semibold">
                AR
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <div className="text-xs font-medium leading-tight">Ana Ribeiro</div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                Gerente da Qualidade
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" /> Meu perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}