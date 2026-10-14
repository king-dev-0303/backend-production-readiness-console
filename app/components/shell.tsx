"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Cable,
  DatabaseZap,
  Flag,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Marca } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { prontidao } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const { achados, execucao, backups, builds, restaurar } = useAlicerce();
  const pathname = usePathname();
  const [confirmar, setConfirmar] = useState(false);
  const [menu, setMenu] = useState(false);
  const criticos = achados.filter((a) => a.status !== "resolvido" && (a.severidade === "critica" || a.severidade === "alta")).length;
  const falhaBackup = backups[0]?.status === "falhou" ? 1 : 0;
  const rejeitado = builds.some((b) => b.status === "rejeitado") ? 1 : 0;
  const nota = prontidao(achados);

  const NAV = [
    { href: "/", rotulo: "Visão geral", curto: "Início", icone: LayoutDashboard },
    { href: "/diagnostico", rotulo: "Diagnóstico", curto: "Achados", icone: ScanSearch, n: criticos },
    { href: "/deploy", rotulo: "Deploy", curto: "Deploy", icone: Rocket, vivo: !!execucao },
    { href: "/dados", rotulo: "Banco e storage", curto: "Dados", icone: DatabaseZap },
    { href: "/backups", rotulo: "Backups", curto: "Backups", icone: ShieldCheck, n: falhaBackup },
    { href: "/apis", rotulo: "APIs e integrações", curto: "APIs", icone: Cable },
    { href: "/mobile", rotulo: "Apps nas lojas", curto: "Mobile", icone: Smartphone, n: rejeitado },
    { href: "/marcos", rotulo: "Marcos", curto: "Marcos", icone: Flag },
  ];
  const ativo = (h: string) => (h === "/" ? pathname === h : pathname.startsWith(h));
  const MOBILE = [NAV[0], NAV[1], NAV[2], NAV[3]];

  const itens = (fechar?: () => void) =>
    NAV.map((n) => (
      <Link
        key={n.href}
        href={n.href}
        onClick={fechar}
        aria-current={ativo(n.href) ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
          ativo(n.href) ? "bg-white/90 text-noite shadow-[0_10px_30px_-12px_rgb(0_0_0/0.5)]" : "text-nevoa/75 hover:bg-white/10 hover:text-white",
        )}
      >
        <n.icone className={cn("size-[1.15rem]", ativo(n.href) && "text-[#2aa98a]")} />
        {n.rotulo}
        {n.vivo && <span className="ml-auto size-2 animate-pulso rounded-full bg-menta" aria-label="Deploy em andamento" />}
        {!!n.n && (
          <span className="tabular ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[0.7rem] font-bold text-white">{n.n}</span>
        )}
      </Link>
    ));

  return (
    <div className="fundo-console min-h-screen text-nevoa">
      <aside className="vidro scroll-fino fixed inset-y-3 left-3 z-30 hidden w-64 flex-col overflow-y-auto rounded-3xl p-4 lg:flex">
        <div className="px-2 pt-1">
          <Marca />
        </div>
        <nav className="mt-7 grid gap-1" aria-label="Seções do console">
          {itens()}
        </nav>
        <div className="mt-auto space-y-2 pt-6">
          <div className="relative overflow-hidden rounded-2xl p-4">
            <Image src="/img/datacenter.jpg" alt="" fill sizes="240px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-noite/95 via-noite/70 to-noite/20" />
            <div className="relative">
              <p className="text-xs font-semibold text-menta">Prontidão para produção</p>
              <p className="font-heading mt-1 text-2xl font-semibold text-white">
                {nota}
                <span className="text-sm text-nevoa/60">/100</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-menta to-lavanda transition-[width] duration-700" style={{ width: `${nota}%` }} />
              </div>
            </div>
          </div>
          <button onClick={() => setConfirmar(true)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-nevoa/60 hover:bg-white/10 hover:text-white">
            <RotateCcw className="size-[1.15rem]" /> Restaurar exemplo
          </button>
          <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-2.5">
            <Image src="/img/m-rafael.jpg" alt="" width={36} height={36} className="size-9 rounded-full object-cover ring-2 ring-menta/60" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">Romulo S.</p>
              <p className="text-xs text-nevoa/60">Produto · Jornada</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="vidro sticky top-0 z-30 flex h-16 items-center justify-between rounded-b-3xl px-4 lg:hidden">
        <Marca />
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
          <Activity className="size-4 text-menta" /> {nota}/100
        </span>
      </header>

      <main className="px-4 pt-5 pb-28 sm:px-6 lg:pt-7 lg:pr-7 lg:pb-12 lg:pl-[18.75rem]">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>

      <nav className="vidro-forte fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-3xl p-1.5 lg:hidden" aria-label="Seções do console no celular">
        {MOBILE.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={ativo(n.href) ? "page" : undefined}
            className={cn("relative flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[0.66rem] font-semibold", ativo(n.href) ? "bg-white/90 text-noite" : "text-nevoa/70")}
          >
            <n.icone className={cn("size-5", ativo(n.href) && "text-[#2aa98a]")} />
            {n.curto}
            {!!n.n && <span className="absolute top-1 right-[18%] grid size-4 place-items-center rounded-full bg-coral text-[0.6rem] font-bold text-white">{n.n}</span>}
          </Link>
        ))}
        <button onClick={() => setMenu(true)} className="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[0.66rem] font-semibold text-nevoa/70">
          <Menu className="size-5" />
          Mais
        </button>
      </nav>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="bottom" className="vidro-forte rounded-t-3xl border-white/15 p-4 text-nevoa">
          <SheetHeader className="p-1">
            <SheetTitle className="font-heading text-white">Todas as seções</SheetTitle>
            <SheetDescription className="text-nevoa/60">Prontidão atual: {nota}/100</SheetDescription>
          </SheetHeader>
          <nav className="grid gap-1 pb-4">{itens(() => setMenu(false))}</nav>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmar} onOpenChange={setConfirmar}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Restaurar os dados de exemplo?</DialogTitle>
            <DialogDescription className="text-nevoa/65">Achados, deploys, backups e builds voltam ao estado do diagnóstico. O que foi feito nesta sessão some.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setConfirmar(false)}>
              Cancelar
            </Button>
            <Button
              className="rounded-xl bg-coral text-white hover:bg-coral/90"
              onClick={() => {
                restaurar();
                setConfirmar(false);
                toast.success("Dados de exemplo restaurados");
              }}
            >
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
