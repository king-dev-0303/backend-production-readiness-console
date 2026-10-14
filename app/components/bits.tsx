"use client";

import Link from "next/link";
import { Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEVERIDADES, type Severidade, type StatusAchado } from "@/lib/data";

export function Marca({ sub = "Console de produção" }: { sub?: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Alicerce, visão geral">
      <span className="brilho-menta grid size-9 place-items-center rounded-xl transition-transform duration-500 group-hover:-rotate-6">
        <Layers className="size-5" strokeWidth={2} />
      </span>
      <span className="leading-none">
        <span className="font-heading block text-[1.25rem] font-semibold text-white">Alicerce</span>
        <span className="mt-1 block text-[0.64rem] font-semibold tracking-[0.14em] whitespace-nowrap text-nevoa/60 uppercase">{sub}</span>
      </span>
    </Link>
  );
}

const COR_SEV: Record<Severidade, string> = {
  critica: "bg-coral/25 text-[#ffc4bc] ring-coral/50",
  alta: "bg-ambar/20 text-[#ffd9a8] ring-ambar/45",
  media: "bg-lavanda/20 text-[#d7dcff] ring-lavanda/40",
  baixa: "bg-white/10 text-nevoa/80 ring-white/20",
};

export function SeloSeveridade({ s, className }: { s: Severidade; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ring-1", COR_SEV[s], className)}>
      <span className={cn("size-1.5 rounded-full bg-current", s === "critica" && "animate-pulse")} />
      {SEVERIDADES[s].rotulo}
    </span>
  );
}

const COR_STATUS: Record<StatusAchado, [string, string]> = {
  aberto: ["Aberto", "bg-white/10 text-nevoa/85 ring-white/20"],
  andamento: ["Em andamento", "bg-ceu/20 text-[#cbe9ff] ring-ceu/40"],
  resolvido: ["Resolvido", "bg-menta/20 text-[#c4fbec] ring-menta/45"],
};

export function SeloStatus({ s }: { s: StatusAchado }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ring-1", COR_STATUS[s][1])}>{COR_STATUS[s][0]}</span>;
}

export function Pilula({ tom, children, className }: { tom: "menta" | "ambar" | "coral" | "lavanda" | "neutro" | "ceu"; children: React.ReactNode; className?: string }) {
  const cores = {
    menta: "bg-menta/20 text-[#c4fbec] ring-menta/45",
    ambar: "bg-ambar/20 text-[#ffd9a8] ring-ambar/45",
    coral: "bg-coral/25 text-[#ffc4bc] ring-coral/50",
    lavanda: "bg-lavanda/20 text-[#d7dcff] ring-lavanda/40",
    ceu: "bg-ceu/20 text-[#cbe9ff] ring-ceu/40",
    neutro: "bg-white/10 text-nevoa/80 ring-white/20",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold whitespace-nowrap ring-1", cores[tom], className)}>{children}</span>;
}

export function Girando({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}

export function Titulo({ rotulo, titulo, sub, children }: { rotulo: string; titulo: React.ReactNode; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex animate-rise flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.22em] text-menta uppercase">
          <span className="h-px w-6 bg-current" />
          {rotulo}
        </p>
        <h1 className="mt-2 text-[1.75rem] leading-tight font-semibold text-white sm:text-4xl">{titulo}</h1>
        {sub && <p className="mt-2 text-sm leading-relaxed text-nevoa/70 sm:text-[0.95rem]">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

// Anel de progresso com gradiente menta → lavanda
export function Anel({ valor, tamanho = 132, espessura = 11, children }: { valor: number; tamanho?: number; espessura?: number; children?: React.ReactNode }) {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="anel-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7af0d2" />
            <stop offset="0.6" stopColor="#a9b4ff" />
            <stop offset="1" stopColor="#ffb35c" />
          </linearGradient>
        </defs>
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="rgb(255 255 255 / 12%)" strokeWidth={espessura} />
        <circle
          cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="url(#anel-g)" strokeWidth={espessura} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - valor / 100)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.2,0.7,0.2,1)", filter: "drop-shadow(0 0 8px rgb(95 224 193 / 55%))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Barra({ valor, tom = "menta" }: { valor: number; tom?: "menta" | "ambar" | "coral" | "lavanda" }) {
  const g = {
    menta: "from-[#7af0d2] to-[#3fc3a4]",
    ambar: "from-[#ffc982] to-[#ff9f43]",
    coral: "from-[#ff9d90] to-[#ff6a5a]",
    lavanda: "from-[#c8cfff] to-[#8d9bff]",
  }[tom];
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-700", g)} style={{ width: `${Math.max(2, Math.min(100, valor))}%` }} />
    </div>
  );
}

export function Vazio({ icone: Icone, titulo, texto, children }: { icone: React.ElementType; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
        <Icone className="size-6 text-menta" />
      </span>
      <p className="font-heading text-lg text-white">{titulo}</p>
      <p className="max-w-sm text-sm text-nevoa/65">{texto}</p>
      {children}
    </div>
  );
}
