"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Circle, CircleAlert, Hourglass, Send } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Girando, Pilula, Titulo, Barra } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { dataHora, type Build, type Plataforma } from "@/lib/data";
import { cn } from "@/lib/utils";

const LOJAS: Record<Plataforma, { nome: string; loja: string; imagem: string; icone: React.ElementType }> = {
  android: { nome: "Android", loja: "Google Play", imagem: "/img/android.jpg", icone: FaGooglePlay },
  ios: { nome: "iOS", loja: "App Store", imagem: "/img/iphone.jpg", icone: FaApple },
};

export default function Mobile() {
  const { builds, checklist, marcarChecklist, enviarBuild } = useAlicerce();
  const [enviando, setEnviando] = useState<Plataforma | null>(null);

  const pendentes = (p: Plataforma) => checklist.filter((c) => (c.plataforma === p || c.plataforma === "ambas") && !c.feito);

  return (
    <div className="space-y-5">
      <Titulo rotulo="Apps nas lojas" titulo="Capacitor no Android e no iOS" sub="O mesmo back-end atende web e apps. Cada build só sobe quando o checklist da loja está fechado, para não voltar do revisor." />

      <div className="grid gap-4 lg:grid-cols-2">
        {(["android", "ios"] as const).map((p) => {
          const L = LOJAS[p];
          const atual = builds.filter((b) => b.plataforma === p).sort((a, b) => b.numero - a.numero);
          const prod = atual.find((b) => b.trilha === "Produção" || b.trilha === "App Store");
          const ultimo = atual[0];
          const itens = checklist.filter((c) => c.plataforma === p || c.plataforma === "ambas");
          const feitos = itens.filter((c) => c.feito).length;
          const falta = pendentes(p).length;
          return (
            <section key={p} className="vidro overflow-hidden rounded-3xl">
              <div className="relative h-52 overflow-hidden">
                <Image src={p === "android" ? "/img/galaxy.jpg" : "/img/movil.jpg"} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="animate-kenburns object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#34436a] via-[#34436a]/50 to-[#2b3960]/20" />
                <div className="absolute top-4 right-4 hidden h-40 w-20 animate-float overflow-hidden rounded-[1.1rem] border-[3px] border-white/70 shadow-2xl sm:block">
                  <Image src={L.imagem} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/90 text-noite shadow-lg">
                    <L.icone className="size-6" />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold text-white">{L.loja}</p>
                    <p className="text-xs text-nevoa/75">Em produção: {prod ? `${prod.versao} (${prod.numero})` : "-"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-5">
                {ultimo && <UltimoBuild b={ultimo} />}
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-white">Checklist da loja</p>
                    <span className="text-xs text-nevoa/60 tabular">
                      {feitos}/{itens.length}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Barra valor={(feitos / itens.length) * 100} tom={falta ? "lavanda" : "menta"} />
                  </div>
                  <ul className="mt-3 grid gap-1.5">
                    {itens.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => marcarChecklist(c.id)}
                          aria-pressed={c.feito}
                          className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-white/8"
                        >
                          {c.feito ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-menta" /> : <Circle className="mt-0.5 size-4 shrink-0 text-nevoa/45" />}
                          <span className={cn(c.feito ? "text-nevoa/60 line-through decoration-white/30" : "text-white")}>{c.texto}</span>
                          {c.plataforma === "ambas" && <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2 text-[0.65rem] text-nevoa/60">ambas</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className={cn("h-11 w-full rounded-xl", falta ? "botao-vidro" : "brilho-menta sheen")}
                  disabled={!!falta || enviando === p}
                  onClick={async () => {
                    setEnviando(p);
                    await enviarBuild(p);
                    setEnviando(null);
                    toast.success(`Build ${L.nome} enviado`, { description: `Agora em revisão na ${L.loja}.` });
                  }}
                >
                  {enviando === p ? <Girando /> : <Send />}
                  {enviando === p ? "Enviando..." : falta ? `Faltam ${falta} itens para enviar` : `Enviar 1.9.1 para ${L.loja}`}
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <section className="vidro rounded-3xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-white">Histórico de builds</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {builds.map((b) => {
            const L = LOJAS[b.plataforma];
            return (
              <li key={b.id} className="flex animate-pop items-center gap-3 rounded-2xl bg-white/6 p-3 ring-1 ring-white/10">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-white">
                  <L.icone className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {L.nome} {b.versao} <span className="text-nevoa/55">({b.numero})</span>
                  </p>
                  <p className="truncate text-xs text-nevoa/60">
                    {b.trilha} · {b.enviadoEm ? dataHora(b.enviadoEm) : "-"}
                  </p>
                </div>
                <StatusBuild b={b} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function StatusBuild({ b }: { b: Build }) {
  if (b.status === "aprovado") return <Pilula tom="menta">Aprovado</Pilula>;
  if (b.status === "rejeitado") return <Pilula tom="coral">Rejeitado</Pilula>;
  if (b.status === "revisao") return <Pilula tom="ambar">Em revisão</Pilula>;
  if (b.status === "enviado") return <Pilula tom="ceu">Processando</Pilula>;
  return <Pilula tom="neutro">Rascunho</Pilula>;
}

function UltimoBuild({ b }: { b: Build }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl p-3.5 ring-1", b.status === "rejeitado" ? "bg-coral/12 ring-coral/35" : "bg-white/7 ring-white/12")}>
      {b.status === "rejeitado" ? <CircleAlert className="mt-0.5 size-5 shrink-0 text-coral" /> : b.status === "aprovado" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-menta" /> : <Hourglass className="mt-0.5 size-5 shrink-0 text-ambar" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">
            Último build: {b.versao} ({b.numero}) · {b.trilha}
          </p>
          <StatusBuild b={b} />
        </div>
        <p className="mt-0.5 text-xs text-nevoa/65">{b.nota ?? (b.enviadoEm ? `Enviado ${dataHora(b.enviadoEm)}` : "")}</p>
      </div>
    </div>
  );
}
