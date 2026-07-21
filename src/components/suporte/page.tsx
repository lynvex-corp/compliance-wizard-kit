import { useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, CalendarDays, Clock, Send, Video, BookOpen, PhoneCall } from "lucide-react";

const especialistas = [
  { nome: "Marina Duarte", cargo: "Especialista ISO 9001 · Lead Auditor", iniciais: "MD" },
  { nome: "Rafael Correa", cargo: "Consultor SGI · Construção Civil", iniciais: "RC" },
  { nome: "Juliana Peixoto", cargo: "Especialista em Riscos e Auditorias", iniciais: "JP" },
];

const slots = ["09:00", "10:30", "13:00", "14:30", "16:00"];
const dias = [
  { d: "Seg", n: 21, disponivel: true },
  { d: "Ter", n: 22, disponivel: true },
  { d: "Qua", n: 23, disponivel: false },
  { d: "Qui", n: 24, disponivel: true },
  { d: "Sex", n: 25, disponivel: true },
  { d: "Sáb", n: 26, disponivel: false },
  { d: "Dom", n: 27, disponivel: false },
];

const chat = [
  { de: "bot", nome: "Jáwda Assist", msg: "Olá! Como posso ajudar hoje? Você pode perguntar sobre funcionalidades ou abrir um chamado.", h: "09:41" },
  { de: "user", nome: "Você", msg: "Como configuro os prazos de SLA por gravidade?", h: "09:42" },
  { de: "bot", nome: "Jáwda Assist", msg: "Vá em Configurações → Notificações e SLAs. Lá você edita os prazos de cada gravidade.", h: "09:42" },
];

export function SuportePage() {
  const [selectedDia, setSelectedDia] = useState(22);
  const [selectedSlot, setSelectedSlot] = useState("10:30");
  const [selectedEsp, setSelectedEsp] = useState(0);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suporte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tire dúvidas sobre a plataforma ou converse com um especialista em ISO.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Suporte Técnico */}
          <Card className="overflow-hidden rounded-xl">
            <CardHeader className="border-b border-border bg-brand-soft/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Suporte Técnico</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">Uso da plataforma, bugs e configurações</p>
                  </div>
                </div>
                <Badge className="bg-[color:var(--severity-low)]/15 text-[color:var(--severity-low)] hover:bg-[color:var(--severity-low)]/15">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-[color:var(--severity-low)]" /> Online agora
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-0">
              <div className="flex-1 space-y-3 p-4">
                {chat.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.de === "user" ? "justify-end" : ""}`}>
                    {m.de === "bot" && (
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-brand text-brand-foreground text-[10px] font-semibold">JA</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.de === "user" ? "bg-brand text-brand-foreground" : "bg-muted"}`}>
                      <div className="mb-0.5 text-[10px] font-semibold opacity-70">{m.nome} · {m.h}</div>
                      {m.msg}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-border bg-muted/30 p-3">
                <Input placeholder="Escreva sua mensagem…" className="h-10 bg-background" />
                <Button size="icon" className="h-10 w-10 bg-brand text-brand-foreground hover:bg-brand/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-around border-t border-border px-3 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Resposta &lt; 5 min</div>
                <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Central de ajuda</div>
                <div className="flex items-center gap-1.5"><PhoneCall className="h-3.5 w-3.5" /> 0800 123 4567</div>
              </div>
            </CardContent>
          </Card>

          {/* Suporte Metodológico */}
          <Card className="overflow-hidden rounded-xl">
            <CardHeader className="border-b border-border bg-brand-soft/40">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Suporte Metodológico</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">Consultoria com especialistas em ISO</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Escolha um especialista</div>
                <div className="space-y-2">
                  {especialistas.map((e, i) => (
                    <button
                      key={e.nome}
                      onClick={() => setSelectedEsp(i)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                        selectedEsp === i ? "border-brand bg-brand-soft/40" : "border-border hover:border-brand/40"
                      }`}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-brand-soft text-brand text-xs font-semibold">{e.iniciais}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{e.nome}</div>
                        <div className="truncate text-xs text-muted-foreground">{e.cargo}</div>
                      </div>
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">Julho 2026</span>
                  <span className="text-muted-foreground">Semana 21–27</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {dias.map((d) => (
                    <button
                      key={d.n}
                      disabled={!d.disponivel}
                      onClick={() => setSelectedDia(d.n)}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 text-xs transition ${
                        !d.disponivel
                          ? "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/50"
                          : selectedDia === d.n
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border hover:border-brand/40"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase">{d.d}</span>
                      <span className="text-base font-bold">{d.n}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Horários disponíveis</div>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                        selectedSlot === s
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-border hover:border-brand/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-brand-soft/40 p-3 text-xs">
                <div>
                  <div className="font-semibold text-brand">{especialistas[selectedEsp].nome}</div>
                  <div className="text-muted-foreground">24/07/2026 — {selectedSlot} · 45 min por videochamada</div>
                </div>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90">Agendar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}