"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, CircleX, GitBranch, History, Loader2, Rocket, RotateCcw, Server, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pilula, Titulo, Vazio } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { ETAPAS, dataHora, duracao, pessoa, type Ambiente, type Deploy } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function DeployPagina() {
  const { deploys, execucao, iniciarDeploy, reverter } = useAlicerce();
  const [filtro, setFiltro] = useState<"todos" | Ambiente>("todos");
  const [novo, setNovo] = useState(false);
  const [reverterAlvo, setReverterAlvo] = useState<Deploy | null>(null);

  const lista = useMemo(() => (filtro === "todos" ? deploys : deploys.filter((d) => d.ambiente === filtro)), [deploys, filtro]);
  const rodando = execucao ? deploys.find((d) => d.id === execucao.deployId) : null;
  const ultimo = rodando ?? deploys[0];
  const prod = deploys.find((d) => d.ambiente === "producao" && d.status === "sucesso");
  const stg = deploys.find((d) => d.ambiente === "staging" && d.status === "sucesso");
  const ok = deploys.filter((d) => d.status === "sucesso").length;

  const estadoEtapa = (i: number): "ok" | "rodando" | "falhou" | "pulado" | "espera" => {
    if (execucao) {
      const ultimaEtapa = execucao.ambiente === "producao" ? ETAPAS.length - 1 : ETAPAS.length - 2;
      if (i > ultimaEtapa) return "pulado";
      return i < execucao.etapa ? "ok" : i === execucao.etapa ? "rodando" : "espera";
    }
    if (!ultimo) return "espera";
    if (ultimo.status === "falhou") {
      const f = ETAPAS.findIndex((e) => e.id === ultimo.etapaFalha);
      return i < f ? "ok" : i === f ? "falhou" : "espera";
    }
    if (ultimo.ambiente === "staging" && i === ETAPAS.length - 1) return "pulado";
    return "ok";
  };

  return (
    <div className="space-y-5">
      <Titulo rotulo="Deploy" titulo="Do commit à loja, sem passo manual" sub="Lint, testes, build e migrações rodam antes de qualquer troca de versão. Staging recebe o mesmo artefato que vai para produção.">
        <Button className="brilho-menta sheen h-10 rounded-full px-4" onClick={() => setNovo(true)} disabled={!!execucao}>
          {execucao ? <Loader2 className="animate-spin" /> : <Rocket />} {execucao ? "Deploy rodando" : "Novo deploy"}
        </Button>
      </Titulo>

      {/* Pipeline */}
      <section className="reflexo relative isolate overflow-hidden rounded-3xl border border-white/20 p-5 sm:p-6">
        <Image src="/img/cabeamento.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2f3e68]/95 via-[#34436a]/88 to-[#2b3960]/80 backdrop-blur-[2px]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <GitBranch className="size-5 text-menta" />
            <p className="font-mono text-sm text-white">
              {ultimo?.versao} · {ultimo?.commit}
            </p>
            <span className="hidden truncate text-sm text-nevoa/65 sm:inline">{ultimo?.mensagem}</span>
          </div>
          {execucao ? (
            <Pilula tom="ceu">
              <Loader2 className="size-3.5 animate-spin" /> {ETAPAS[execucao.etapa].rotulo}
            </Pilula>
          ) : ultimo?.status === "falhou" ? (
            <Pilula tom="coral">Falhou em {ETAPAS.find((e) => e.id === ultimo.etapaFalha)?.rotulo}</Pilula>
          ) : (
            <Pilula tom="menta">Concluído em {duracao(ultimo?.duracaoS ?? 0)}</Pilula>
          )}
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {ETAPAS.map((e, i) => {
            const s = estadoEtapa(i);
            return (
              <li key={e.id} className="relative">
                {i < ETAPAS.length - 1 && (
                  <svg className="absolute top-7 left-[calc(50%+1.9rem)] hidden h-1 w-[calc(100%-3.8rem+0.75rem)] lg:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden>
                    <line x1="0" y1="1" x2="100" y2="1" stroke={s === "ok" ? "#5fe0c1" : "rgb(255 255 255 / 25%)"} strokeWidth="2" className={cn(s === "rodando" && "linha-fluxo")} />
                  </svg>
                )}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl ring-1 transition-all duration-500",
                      s === "ok" && "bg-menta/25 text-menta ring-menta/50 shadow-[0_0_24px_-4px_rgb(95_224_193/0.7)]",
                      s === "rodando" && "animate-pulso bg-ceu/25 text-ceu ring-ceu/60",
                      s === "falhou" && "bg-coral/25 text-coral ring-coral/60",
                      (s === "espera" || s === "pulado") && "bg-white/8 text-nevoa/40 ring-white/15",
                    )}
                  >
                    {s === "ok" ? <Check className="size-6" /> : s === "rodando" ? <Loader2 className="size-6 animate-spin" /> : s === "falhou" ? <CircleX className="size-6" /> : <span className="font-heading text-lg">{i + 1}</span>}
                  </span>
                  <p className={cn("mt-2 text-sm font-semibold", s === "pulado" || s === "espera" ? "text-nevoa/50" : "text-white")}>{e.rotulo}</p>
                  <p className="text-[0.7rem] text-nevoa/50">{s === "pulado" ? "não se aplica" : `~${e.s}s`}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Ambientes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Ambiente titulo="Produção" imagem="/img/sala-servidores.jpg" versao={prod?.versao} quando={prod?.inicio} detalhe="jornada.app · sa-east-1" tom="menta" />
        <Ambiente titulo="Staging" imagem="/img/racks.jpg" versao={stg?.versao} quando={stg?.inicio} detalhe="staging.jornada.app · dados anonimizados" tom="lavanda" />
        <div className="vidro rounded-3xl p-5">
          <p className="text-xs font-bold tracking-[0.18em] text-ambar uppercase">Últimos 14 dias</p>
          <p className="font-heading mt-2 text-4xl font-semibold text-white tabular">
            {Math.round((ok / Math.max(1, deploys.length)) * 100)}%
          </p>
          <p className="text-sm text-nevoa/65">dos deploys sem falha · {deploys.length} no total</p>
          <div className="mt-4 flex h-14 items-end gap-1.5" aria-hidden>
            {deploys.slice(0, 14).reverse().map((d) => (
              <span
                key={d.id}
                title={`${d.versao} · ${d.status}`}
                className={cn("flex-1 rounded-t-md", d.status === "sucesso" ? "bg-menta/80" : d.status === "rodando" ? "animate-pulse bg-ceu" : d.status === "revertido" ? "bg-ambar/80" : "bg-coral/80")}
                style={{ height: `${30 + ((d.duracaoS || 200) / 340) * 70}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Histórico */}
      <section className="vidro rounded-3xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <History className="size-5 text-menta" /> Histórico
          </h2>
          <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
            <TabsList className="rounded-full bg-white/10 p-1">
              {(["todos", "producao", "staging"] as const).map((t) => (
                <TabsTrigger key={t} value={t} className="rounded-full px-3 text-nevoa/75 data-active:bg-white data-active:text-noite">
                  {t === "todos" ? "Todos" : t === "producao" ? "Produção" : "Staging"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {lista.length === 0 ? (
          <Vazio icone={Server} titulo="Nenhum deploy neste ambiente" texto="Quando houver, ele aparece aqui com versão, commit e duração." />
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {lista.map((d) => {
              const autor = pessoa(d.autorId);
              return (
                <li key={d.id} className="flex animate-pop flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
                  <Image src={autor.foto} alt={autor.nome} width={36} height={36} className="size-9 rounded-full object-cover ring-2 ring-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                      <span className="font-mono">{d.versao}</span>
                      <span className="rounded-md bg-white/10 px-1.5 font-mono text-[0.7rem] text-nevoa/75">{d.commit}</span>
                      <Pilula tom={d.ambiente === "producao" ? "menta" : "lavanda"}>{d.ambiente === "producao" ? "Produção" : "Staging"}</Pilula>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-nevoa/70">{d.mensagem}</p>
                  </div>
                  <div className="text-right text-xs text-nevoa/60">
                    <p>{dataHora(d.inicio)}</p>
                    <p className="tabular">{d.status === "rodando" ? "rodando..." : duracao(d.duracaoS)}</p>
                  </div>
                  <StatusDeploy d={d} />
                  {d.ambiente === "producao" && d.status === "sucesso" && d.id === prod?.id && (
                    <Button size="sm" variant="outline" className="botao-vidro h-8 rounded-full px-3" onClick={() => setReverterAlvo(d)}>
                      <Undo2 /> Rollback
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <NovoDeploy
        aberto={novo}
        onFechar={() => setNovo(false)}
        onConfirmar={(amb, msg) => {
          iniciarDeploy(amb, msg);
          setNovo(false);
          toast.success(amb === "producao" ? "Deploy para produção iniciado" : "Deploy para staging iniciado", { description: "Acompanhe as etapas no pipeline." });
        }}
      />

      <Dialog open={!!reverterAlvo} onOpenChange={(v) => !v && setReverterAlvo(null)}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Reverter {reverterAlvo?.versao}?</DialogTitle>
            <DialogDescription className="text-nevoa/65">
              A versão anterior volta a receber o tráfego em cerca de 40 segundos. As migrações desta versão são compatíveis com a anterior, então o banco não precisa voltar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setReverterAlvo(null)}>
              Cancelar
            </Button>
            <Button
              className="brilho-ambar rounded-xl"
              onClick={() => {
                if (reverterAlvo) reverter(reverterAlvo.id);
                toast.success("Rollback concluído", { description: "Produção voltou para a versão anterior." });
                setReverterAlvo(null);
              }}
            >
              <RotateCcw /> Reverter agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusDeploy({ d }: { d: Deploy }) {
  if (d.status === "sucesso") return <Pilula tom="menta">Sucesso</Pilula>;
  if (d.status === "falhou") return <Pilula tom="coral">Falhou</Pilula>;
  if (d.status === "revertido") return <Pilula tom="ambar">Revertido</Pilula>;
  return (
    <Pilula tom="ceu">
      <Loader2 className="size-3 animate-spin" /> Rodando
    </Pilula>
  );
}

function Ambiente({ titulo, imagem, versao, quando, detalhe, tom }: { titulo: string; imagem: string; versao?: string; quando?: string; detalhe: string; tom: "menta" | "lavanda" }) {
  return (
    <div className="foto-zoom relative isolate overflow-hidden rounded-3xl border border-white/15 p-5">
      <Image src={imagem} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#26324f]/95 via-[#2b3960]/75 to-[#2b3960]/35" />
      <div className="flex items-center justify-between">
        <p className="font-heading text-lg font-semibold text-white">{titulo}</p>
        <span className={cn("chip-foto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", tom === "menta" ? "text-menta" : "text-lavanda")}>
          <span className={cn("size-2 rounded-full", tom === "menta" ? "animate-pulso bg-menta" : "bg-lavanda")} /> no ar
        </span>
      </div>
      <p className="font-mono mt-10 text-3xl font-semibold text-white">{versao ?? "-"}</p>
      <p className="mt-1 text-xs text-nevoa/70">{quando ? `desde ${dataHora(quando)}` : "sem deploy"}</p>
      <p className="mt-0.5 text-xs text-nevoa/55">{detalhe}</p>
    </div>
  );
}

function NovoDeploy({ aberto, onFechar, onConfirmar }: { aberto: boolean; onFechar: () => void; onConfirmar: (a: Ambiente, m: string) => void }) {
  const [amb, setAmb] = useState<Ambiente>("staging");
  const [msg, setMsg] = useState("");
  const [tentou, setTentou] = useState(false);
  const erro = msg.trim().length < 6 ? "Descreva a mudança (mínimo 6 caracteres)." : "";
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-white">Novo deploy</DialogTitle>
          <DialogDescription className="text-nevoa/65">O pipeline roda todas as etapas. Produção só recebe a versão depois do smoke test em staging.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTentou(true);
            if (erro) return;
            onConfirmar(amb, msg.trim());
            setMsg("");
            setTentou(false);
          }}
        >
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-1.5 text-sm font-semibold text-white">Destino</legend>
            {(["staging", "producao"] as const).map((a) => (
              <button
                type="button"
                key={a}
                aria-pressed={amb === a}
                onClick={() => setAmb(a)}
                className={cn("relative h-24 overflow-hidden rounded-2xl text-left ring-2 transition", amb === a ? "ring-menta" : "ring-white/15 hover:ring-white/35")}
              >
                <Image src={a === "producao" ? "/img/sala-servidores.jpg" : "/img/racks.jpg"} alt="" fill sizes="220px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#26324f]/95 to-[#26324f]/30" />
                <span className="absolute bottom-2.5 left-3 font-heading font-semibold text-white">{a === "producao" ? "Produção" : "Staging"}</span>
                {amb === a && <Check className="absolute top-2 right-2 size-5 rounded-full bg-menta p-0.5 text-noite" />}
              </button>
            ))}
          </fieldset>
          <div className="grid gap-1.5">
            <Label htmlFor="msg" className="font-semibold text-white">
              Descrição da mudança
            </Label>
            <Input id="msg" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="fix(feed): índice em content_views" className="campo font-mono text-sm" aria-invalid={tentou && !!erro} />
            {tentou && erro && <p className="text-xs text-[#ffb3a8]">{erro}</p>}
          </div>
          <DialogFooter className="border-0 bg-transparent p-0">
            <Button type="button" variant="outline" className="botao-vidro h-11 rounded-xl" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="brilho-menta h-11 rounded-xl px-5">
              <Rocket /> Iniciar deploy
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
