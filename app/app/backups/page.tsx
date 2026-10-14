"use client";

import Image from "next/image";
import { useState } from "react";
import { ArchiveRestore, CalendarClock, CheckCircle2, CircleX, CloudUpload, Globe2, Loader2, Play, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Girando, Pilula, Titulo } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { dataHora, type Backup } from "@/lib/data";
import { cn } from "@/lib/utils";

const ROTINA = [
  { icone: CloudUpload, titulo: "WAL contínuo", texto: "Cada transação segue para o storage em segundos. Volta a qualquer minuto dos últimos 35 dias.", imagem: "/img/fibra.jpg" },
  { icone: CalendarClock, titulo: "Completo às 03:00", texto: "Dump diário criptografado, mais um mensal guardado por 12 meses.", imagem: "/img/hd.jpg" },
  { icone: Globe2, titulo: "Fora da região", texto: "Cópia em us-east-1 com outra credencial. Se a conta principal cair, o backup não cai junto.", imagem: "/img/terra.jpg" },
  { icone: ArchiveRestore, titulo: "Restauro semanal", texto: "Todo domingo um banco descartável é restaurado e as contagens são conferidas.", imagem: "/img/sala-servidores.jpg" },
];

export default function Backups() {
  const { backups, rodarBackup, testarRestauracao } = useAlicerce();
  const [rodando, setRodando] = useState(false);
  const [restaurando, setRestaurando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Backup | null>(null);
  const ultimoOk = backups.find((b) => b.status === "ok");
  const restaurado = backups.find((b) => b.restauradoEm);
  const falhas = backups.filter((b) => b.status === "falhou").length;

  return (
    <div className="space-y-5">
      <Titulo rotulo="Backups" titulo="Backup só vale se volta" sub="Cada cópia é monitorada, guardada em duas regiões e restaurada de verdade num banco de teste.">
        <Button
          className="brilho-menta sheen h-10 rounded-full px-4"
          disabled={rodando}
          onClick={async () => {
            setRodando(true);
            await rodarBackup();
            setRodando(false);
            toast.success("Backup incremental concluído", { description: "Copiado para sa-east-1 e us-east-1." });
          }}
        >
          {rodando ? <Girando /> : <Play />} {rodando ? "Rodando backup..." : "Rodar backup agora"}
        </Button>
      </Titulo>

      <section className="reflexo relative isolate overflow-hidden rounded-3xl border border-white/20 p-5 sm:p-7">
        <Image src="/img/terra.jpg" alt="Terra vista do espaço à noite" fill sizes="100vw" className="-z-20 animate-kenburns object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2b3960]/95 via-[#34436a]/75 to-[#34436a]/35" />
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <Pilula tom={falhas ? "ambar" : "menta"}>
              <ShieldCheck className="size-3.5" /> {falhas ? `${falhas} falha nos últimos 5 dias` : "Sem falhas nos últimos 5 dias"}
            </Pilula>
            <p className="font-heading mt-4 text-3xl leading-tight font-semibold text-white sm:text-4xl">
              Perda máxima: <span className="texto-aurora">5 minutos</span>.
              <br /> Volta ao ar: <span className="texto-aurora">~15 minutos</span>.
            </p>
            <p className="mt-3 max-w-md text-sm text-nevoa/75">RPO e RTO medidos na última restauração de teste, não estimados.</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Card rotulo="Último backup" valor={ultimoOk ? dataHora(ultimoOk.inicio) : "-"} />
            <Card rotulo="Último restauro" valor={restaurado?.restauradoEm ? dataHora(restaurado.restauradoEm) : "nunca"} />
            <Card rotulo="Tempo de restauro" valor={restaurado?.restauroMin ? `${restaurado.restauroMin} min` : "-"} />
            <Card rotulo="Retenção" valor="35 d + 12 meses" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROTINA.map((r, i) => (
          <div key={r.titulo} className="vidro foto-zoom animate-rise overflow-hidden rounded-3xl" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="relative h-28">
              <Image src={r.imagem} alt="" fill sizes="(min-width: 1280px) 25vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#34436a] to-transparent" />
              <span className="absolute bottom-2 left-4 grid size-10 place-items-center rounded-xl bg-white/90 text-noite shadow-lg">
                <r.icone className="size-5" />
              </span>
            </div>
            <div className="p-4 pt-3">
              <p className="font-semibold text-white">{r.titulo}</p>
              <p className="mt-1 text-sm leading-snug text-nevoa/70">{r.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="vidro rounded-3xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-white">Execuções</h2>
        <ul className="mt-3 divide-y divide-white/10">
          {backups.map((b) => (
            <li key={b.id} className="flex animate-pop flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl ring-1",
                  b.status === "ok" ? "bg-menta/20 text-menta ring-menta/40" : b.status === "falhou" ? "bg-coral/20 text-coral ring-coral/40" : "bg-ceu/20 text-ceu ring-ceu/40",
                )}
              >
                {b.status === "ok" ? <CheckCircle2 className="size-5" /> : b.status === "falhou" ? <CircleX className="size-5" /> : <Loader2 className="size-5 animate-spin" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {b.tipo === "completo" ? "Completo" : "Incremental"} · {dataHora(b.inicio)}
                </p>
                <p className="text-xs text-nevoa/60">
                  {b.status === "rodando" ? "copiando..." : b.status === "falhou" ? "Token do storage expirado - reenviado no ciclo seguinte" : `${b.tamanhoGB.toLocaleString("pt-BR")} GB · ${b.duracaoMin} min · ${b.destino}`}
                </p>
              </div>
              {b.restauradoEm ? (
                <Pilula tom="menta">
                  <ArchiveRestore className="size-3" /> Restaurado em {b.restauroMin} min
                </Pilula>
              ) : (
                b.status === "ok" && (
                  <Button size="sm" variant="outline" className="botao-vidro h-8 rounded-full px-3" disabled={restaurando === b.id} onClick={() => setAlvo(b)}>
                    {restaurando === b.id ? <Girando className="size-3.5" /> : <ArchiveRestore />} {restaurando === b.id ? "Restaurando..." : "Testar restauração"}
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={!!alvo} onOpenChange={(v) => !v && setAlvo(null)}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Testar esta restauração?</DialogTitle>
            <DialogDescription className="text-nevoa/65">
              O backup de {alvo && dataHora(alvo.inicio)} é restaurado num banco temporário, isolado de produção. Conferimos as contagens das tabelas principais e o banco é apagado no fim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setAlvo(null)}>
              Cancelar
            </Button>
            <Button
              className="brilho-menta rounded-xl"
              onClick={async () => {
                if (!alvo) return;
                const id = alvo.id;
                setAlvo(null);
                setRestaurando(id);
                await testarRestauracao(id);
                setRestaurando(null);
                toast.success("Restauração conferida", { description: "users, contents, progress_entries e checkins batem com a origem." });
              }}
            >
              <ArchiveRestore /> Restaurar em teste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="vidro rounded-2xl p-3.5">
      <p className="text-[0.7rem] text-nevoa/60">{rotulo}</p>
      <p className="font-heading mt-1 text-[0.98rem] font-semibold text-white">{valor}</p>
    </div>
  );
}
