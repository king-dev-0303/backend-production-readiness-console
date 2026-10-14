"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, CheckCircle2, Circle, CircleDot, ClipboardList, Clock3, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Barra, Pilula, Titulo } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { dataCurta, type Marco } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Marcos() {
  const { marcos, achados, marcarEntregavel, aprovarMarco } = useAlicerce();
  const [aprovar, setAprovar] = useState<Marco | null>(null);
  const concluidos = marcos.filter((m) => m.status === "concluido").length;

  return (
    <div className="space-y-5">
      <Titulo rotulo="Marcos" titulo="Diagnóstico pago, depois entregas fechadas" sub="Cada marco tem entregáveis verificáveis. O seguinte só começa quando o anterior é aprovado.">
        <Pilula tom="menta" className="h-8 px-3 text-sm">
          {concluidos} de {marcos.length} aprovados
        </Pilula>
      </Titulo>

      <ol className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[1.35rem] before:w-px before:bg-gradient-to-b before:from-menta before:via-lavanda/60 before:to-white/10 md:before:left-[1.6rem]">
        {marcos.map((m, i) => {
          const feitos = m.entregaveis.filter((e) => e.feito).length;
          const tudo = feitos === m.entregaveis.length;
          const ligados = achados.filter((a) => a.marcoId === m.id);
          const resolvidos = ligados.filter((a) => a.status === "resolvido").length;
          const bloqueado = m.status === "planejado";
          return (
            <li key={m.id} className="relative animate-rise pl-12 md:pl-16" style={{ animationDelay: `${i * 70}ms` }}>
              <span
                className={cn(
                  "absolute top-5 left-0 grid size-11 place-items-center rounded-2xl ring-1 md:size-13",
                  m.status === "concluido" && "bg-menta text-noite ring-menta shadow-[0_0_30px_-6px_rgb(95_224_193/0.9)]",
                  m.status === "andamento" && "animate-pulso bg-white text-noite ring-white",
                  bloqueado && "bg-white/10 text-nevoa/60 ring-white/20 backdrop-blur",
                )}
              >
                {m.status === "concluido" ? <BadgeCheck className="size-6" /> : <span className="font-heading text-lg font-semibold">{m.ordem}</span>}
              </span>
              <article className={cn("vidro grid overflow-hidden rounded-3xl md:grid-cols-[15rem_1fr]", m.status === "andamento" && "ring-2 ring-menta/60")}>
                <div className="foto-zoom relative h-40 md:h-auto">
                  <Image src={m.imagem} alt="" fill sizes="(min-width: 768px) 240px, 100vw" className={cn("object-cover", bloqueado && "grayscale-[35%]")} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#34436a]/90 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#34436a]/40" />
                  <span className="absolute top-3 left-3">
                    {m.status === "concluido" ? (
                      <Pilula tom="menta" className="backdrop-blur">Aprovado {m.aprovadoEm && dataCurta(m.aprovadoEm)}</Pilula>
                    ) : m.status === "andamento" ? (
                      <Pilula tom="ceu" className="backdrop-blur">
                        <CircleDot className="size-3" /> Em andamento
                      </Pilula>
                    ) : (
                      <Pilula tom="neutro" className="backdrop-blur">
                        <Lock className="size-3" /> Planejado
                      </Pilula>
                    )}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {m.ordem}. {m.nome}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-nevoa/70">{m.resumo}</p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      <Clock3 className="size-3.5" /> {m.semanas}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_14rem]">
                    <ul className="grid gap-1">
                      {m.entregaveis.map((e) => (
                        <li key={e.id}>
                          <button
                            disabled={m.status !== "andamento"}
                            aria-pressed={e.feito}
                            onClick={() => marcarEntregavel(m.id, e.id)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-sm transition enabled:hover:bg-white/8 disabled:cursor-default"
                          >
                            {e.feito ? <CheckCircle2 className="size-4 shrink-0 text-menta" /> : <Circle className="size-4 shrink-0 text-nevoa/40" />}
                            <span className={cn(e.feito ? "text-nevoa/65" : "text-white")}>{e.texto}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-3 rounded-2xl bg-white/6 p-3.5 ring-1 ring-white/10">
                      <div>
                        <div className="flex justify-between text-xs text-nevoa/65">
                          <span>Entregáveis</span>
                          <span className="tabular">
                            {feitos}/{m.entregaveis.length}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <Barra valor={(feitos / m.entregaveis.length) * 100} tom="menta" />
                        </div>
                      </div>
                      <Link href="/diagnostico" className="flex items-center justify-between text-xs text-nevoa/65 hover:text-white">
                        <span className="flex items-center gap-1.5">
                          <ClipboardList className="size-3.5" /> Achados ligados
                        </span>
                        <span className="tabular font-semibold text-white">
                          {resolvidos}/{ligados.length}
                        </span>
                      </Link>
                      {m.status === "andamento" && (
                        <Button className={cn("h-10 w-full rounded-xl", tudo ? "brilho-menta sheen" : "botao-vidro")} disabled={!tudo} onClick={() => setAprovar(m)}>
                          {tudo ? "Aprovar marco" : "Conclua os entregáveis"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <Dialog open={!!aprovar} onOpenChange={(v) => !v && setAprovar(null)}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Aprovar o marco {aprovar?.ordem}?</DialogTitle>
            <DialogDescription className="text-nevoa/65">
              {aprovar?.nome} fica registrado como entregue e o marco seguinte é liberado para começar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setAprovar(null)}>
              Ainda não
            </Button>
            <Button
              className="brilho-menta rounded-xl"
              onClick={() => {
                if (aprovar) aprovarMarco(aprovar.id);
                toast.success(`Marco ${aprovar?.ordem} aprovado`, { description: "O próximo marco já está em andamento." });
                setAprovar(null);
              }}
            >
              <BadgeCheck /> Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
