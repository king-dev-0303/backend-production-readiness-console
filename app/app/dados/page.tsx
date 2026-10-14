"use client";

import Image from "next/image";
import { useState } from "react";
import { Database, Eye, EyeOff, Gauge, HardDrive, History, Lock, Sparkles, TriangleAlert, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Anel, Barra, Girando, Pilula, Titulo } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { TABELAS, num, tamanho, type Bucket } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function Dados() {
  const { consultas, buckets, aplicarIndice, alternarPublico } = useAlicerce();
  const [aplicando, setAplicando] = useState<string | null>(null);
  const [confirmarBucket, setConfirmarBucket] = useState<Bucket | null>(null);
  const aplicadas = consultas.filter((q) => q.aplicada).length;
  const conexoes = 97 - aplicadas * 14;
  const maior = Math.max(...TABELAS.map((t) => t.tamanhoMB));
  const totalMB = TABELAS.reduce((s, t) => s + t.tamanhoMB, 0);

  return (
    <div className="space-y-5">
      <Titulo rotulo="Banco e storage" titulo="PostgreSQL rápido, arquivos protegidos" sub="O que pesa no banco, as consultas que seguram o feed e quem consegue ler os arquivos dos alunos." />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="reflexo relative isolate overflow-hidden rounded-3xl border border-white/20 p-5 sm:p-6">
          <Image src="/img/data.jpg" alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="-z-20 animate-kenburns object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2b3960]/95 via-[#34436a]/85 to-[#34436a]/60" />
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database className="size-5 text-menta" /> PostgreSQL 16 · db.jornada (sa-east-1)
          </div>
          <div className="mt-5 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <Anel valor={conexoes} tamanho={140}>
              <div>
                <p className="font-heading text-3xl font-semibold text-white tabular">{conexoes}</p>
                <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-nevoa/60 uppercase">conexões / 100</p>
              </div>
            </Anel>
            <dl className="grid grid-cols-2 gap-2.5">
              <Metrica icone={HardDrive} rotulo="Tamanho" valor={tamanho(totalMB)} />
              <Metrica icone={Gauge} rotulo="Cache hit" valor={`${(94.1 + aplicadas * 1.6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} />
              <Metrica icone={Zap} rotulo="p95 do feed" valor={consultas[0].aplicada ? "120 ms" : "1,9 s"} alerta={!consultas[0].aplicada} />
              <Metrica icone={History} rotulo="PITR" valor="35 dias" />
            </dl>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-ambar/15 p-3 text-sm text-[#ffe2bd] ring-1 ring-ambar/35">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" /> Pool por requisição no deploy serverless. PgBouncer em modo transaction entra no marco 3.
          </p>
        </section>

        <section className="vidro rounded-3xl p-5">
          <h2 className="text-lg font-semibold text-white">Tabelas que mais pesam</h2>
          <ul className="mt-4 space-y-3.5">
            {TABELAS.map((t) => (
              <li key={t.nome}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-mono text-white">{t.nome}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-nevoa/65">
                    <span className="tabular">{num(t.linhas)} linhas</span>
                    <span className="tabular font-semibold text-white">{tamanho(t.tamanhoMB)}</span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex-1">
                    <Barra valor={(t.tamanhoMB / maior) * 100} tom={t.seqScanPct > 50 ? "ambar" : "lavanda"} />
                  </div>
                  {t.seqScanPct > 20 && (
                    <span className={cn("tabular w-20 text-right text-[0.7rem] font-semibold", t.seqScanPct > 50 ? "text-ambar" : "text-nevoa/60")}>{t.seqScanPct}% seq scan</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Consultas lentas */}
      <section className="vidro rounded-3xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Consultas lentas e índices sugeridos</h2>
          <Pilula tom={aplicadas === consultas.length ? "menta" : "ambar"}>
            {aplicadas}/{consultas.length} aplicados
          </Pilula>
        </div>
        <ul className="mt-4 grid gap-3 xl:grid-cols-3">
          {consultas.map((q) => (
            <li key={q.id} className={cn("flex flex-col rounded-2xl p-4 ring-1 transition", q.aplicada ? "bg-menta/10 ring-menta/35" : "bg-white/7 ring-white/12")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-lavanda">{q.origem}</span>
                <span className="text-xs text-nevoa/55">{q.porMin}/min</span>
              </div>
              <code className="mt-2 line-clamp-3 font-mono text-[0.72rem] leading-relaxed text-nevoa/80">{q.sql}</code>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <p className="text-[0.68rem] text-nevoa/55">média</p>
                  <p className={cn("font-heading text-2xl font-semibold tabular", q.aplicada ? "text-menta" : "text-ambar")}>
                    {q.aplicada ? q.mediaMs - q.ganhoMs : num(q.mediaMs)} <span className="text-sm">ms</span>
                  </p>
                </div>
                {q.aplicada && <p className="pb-1 text-xs text-nevoa/55 line-through">{num(q.mediaMs)} ms</p>}
              </div>
              <pre className="scroll-fino mt-3 overflow-x-auto rounded-xl bg-[#1e2944]/70 p-3 font-mono text-[0.68rem] leading-relaxed text-[#c4fbec] ring-1 ring-white/10">{q.sugestao}</pre>
              <Button
                className={cn("mt-3 h-10 rounded-xl", q.aplicada ? "botao-vidro" : "brilho-menta")}
                disabled={q.aplicada || aplicando === q.id}
                onClick={async () => {
                  setAplicando(q.id);
                  await aplicarIndice(q.id);
                  setAplicando(null);
                  toast.success("Índice criado sem travar a tabela", { description: `${q.origem}: ${q.mediaMs} ms → ${q.mediaMs - q.ganhoMs} ms` });
                }}
              >
                {aplicando === q.id ? (
                  <>
                    <Girando /> Criando CONCURRENTLY...
                  </>
                ) : q.aplicada ? (
                  "Aplicado"
                ) : (
                  <>
                    <Sparkles /> Aplicar índice
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {/* Storage */}
      <section aria-labelledby="sto">
        <h2 id="sto" className="mb-3 text-lg font-semibold text-white">Storage</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {buckets.map((b) => (
            <article key={b.id} className="vidro foto-zoom overflow-hidden rounded-3xl">
              <div className="relative h-36">
                <Image src={b.imagem} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#34436a] to-transparent" />
                <span className="absolute top-3 left-3">
                  {b.publico ? (
                    <Pilula tom="coral" className="backdrop-blur">
                      <Eye className="size-3" /> Leitura pública
                    </Pilula>
                  ) : (
                    <Pilula tom="menta" className="backdrop-blur">
                      <Lock className="size-3" /> Privado
                    </Pilula>
                  )}
                </span>
              </div>
              <div className="-mt-6 relative p-4 pt-0">
                <p className="font-mono text-sm font-semibold text-white">{b.nome}</p>
                <p className="text-xs text-nevoa/65">{b.uso}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/7 p-2 ring-1 ring-white/10">
                    <dt className="text-nevoa/55">Objetos</dt>
                    <dd className="font-semibold text-white tabular">{num(b.objetos)}</dd>
                  </div>
                  <div className="rounded-xl bg-white/7 p-2 ring-1 ring-white/10">
                    <dt className="text-nevoa/55">Tamanho</dt>
                    <dd className="font-semibold text-white tabular">{b.tamanhoGB} GB</dd>
                  </div>
                </dl>
                <p className="mt-2.5 text-xs text-nevoa/60">{b.ciclo}</p>
                <label className="mt-3 flex items-center justify-between rounded-xl bg-white/7 p-2.5 text-sm ring-1 ring-white/10">
                  <span className="flex items-center gap-2 text-white">
                    {b.publico ? <Eye className="size-4 text-coral" /> : <EyeOff className="size-4 text-menta" />} Leitura pública
                  </span>
                  <Switch checked={b.publico} onCheckedChange={() => (b.publico ? setConfirmarBucket(b) : (alternarPublico(b.id), toast.warning(`${b.nome} ficou público`)))} aria-label={`Leitura pública de ${b.nome}`} />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={!!confirmarBucket} onOpenChange={(v) => !v && setConfirmarBucket(null)}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Fechar {confirmarBucket?.nome}?</DialogTitle>
            <DialogDescription className="text-nevoa/65">
              Os links diretos param de funcionar. A API passa a gerar URLs assinadas de 10 minutos, e o app já pede a URL antes de abrir cada arquivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setConfirmarBucket(null)}>
              Cancelar
            </Button>
            <Button
              className="brilho-menta rounded-xl"
              onClick={() => {
                if (confirmarBucket) alternarPublico(confirmarBucket.id);
                toast.success("Bucket privado", { description: "58.210 objetos agora só abrem com URL assinada." });
                setConfirmarBucket(null);
              }}
            >
              <Lock /> Tornar privado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metrica({ icone: I, rotulo, valor, alerta }: { icone: React.ElementType; rotulo: string; valor: string; alerta?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/9 p-3 ring-1 ring-white/14 backdrop-blur">
      <dt className="flex items-center gap-1.5 text-[0.7rem] text-nevoa/60">
        <I className="size-3.5" /> {rotulo}
      </dt>
      <dd className={cn("font-heading mt-0.5 text-lg font-semibold tabular", alerta ? "text-ambar" : "text-white")}>{valor}</dd>
    </div>
  );
}
