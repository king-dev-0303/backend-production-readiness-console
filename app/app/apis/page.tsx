"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDownUp, KeyRound, PlugZap, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Girando, Pilula, Titulo, Vazio } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { ENDPOINTS, dataCurta, type Integracao, type Metodo } from "@/lib/data";
import { cn } from "@/lib/utils";

const COR_METODO: Record<Metodo, string> = {
  GET: "bg-ceu/20 text-[#cbe9ff] ring-ceu/40",
  POST: "bg-menta/20 text-[#c4fbec] ring-menta/40",
  PATCH: "bg-ambar/20 text-[#ffd9a8] ring-ambar/40",
  DELETE: "bg-coral/20 text-[#ffc4bc] ring-coral/40",
};

export default function Apis() {
  const { integracoes, testarIntegracao, rotacionarChave } = useAlicerce();
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"p95" | "erro" | "rpm">("p95");
  const [testando, setTestando] = useState<string | null>(null);
  const [rotacionando, setRotacionando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Integracao | null>(null);

  const rotas = useMemo(() => {
    const l = ENDPOINTS.filter((e) => e.rota.toLowerCase().includes(busca.trim().toLowerCase()) || e.metodo.toLowerCase() === busca.trim().toLowerCase());
    return [...l].sort((a, b) => (ordem === "p95" ? b.p95 - a.p95 : ordem === "erro" ? b.erroPct - a.erroPct : b.rpm - a.rpm));
  }, [busca, ordem]);

  return (
    <div className="space-y-5">
      <Titulo rotulo="APIs e integrações" titulo="Contratos estáveis para web e apps" sub="Rotas versionadas em /api/v1, limites por rota e integrações com chave rotacionada e teste de saúde." />

      <section className="vidro overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-nevoa/50" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Filtrar rota ou método" aria-label="Filtrar rotas" className="campo pl-10" />
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Ordenar rotas">
            <ArrowDownUp className="size-4 text-nevoa/55" />
            {(
              [
                ["p95", "Latência"],
                ["erro", "Erros"],
                ["rpm", "Volume"],
              ] as const
            ).map(([k, r]) => (
              <button key={k} aria-pressed={ordem === k} onClick={() => setOrdem(k)} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold transition", ordem === k ? "bg-white text-noite" : "text-nevoa/70 hover:bg-white/10")}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {rotas.length === 0 ? (
          <Vazio icone={SearchX} titulo="Nenhuma rota encontrada" texto="Busque por parte do caminho, como feed ou uploads, ou por um método HTTP." />
        ) : (
          <div className="scroll-fino overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] tracking-[0.14em] text-nevoa/55 uppercase">
                  <th className="px-4 py-3 font-semibold">Rota</th>
                  <th className="px-4 py-3 font-semibold">Acesso</th>
                  <th className="px-4 py-3 text-right font-semibold">p95</th>
                  <th className="px-4 py-3 text-right font-semibold">Erros</th>
                  <th className="px-4 py-3 text-right font-semibold">Req/min</th>
                  <th className="px-4 py-3 text-right font-semibold">Limite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {rotas.map((e) => (
                  <tr key={e.id} className="transition hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <span className={cn("w-14 rounded-md py-0.5 text-center font-mono text-[0.68rem] font-bold ring-1", COR_METODO[e.metodo])}>{e.metodo}</span>
                        <span className="font-mono text-white">{e.rota}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-nevoa/75">{e.auth}</td>
                    <td className={cn("px-4 py-3 text-right font-semibold tabular", e.p95 > 1000 ? "text-ambar" : "text-white")}>{e.p95} ms</td>
                    <td className={cn("px-4 py-3 text-right tabular", e.erroPct > 1 ? "text-coral" : "text-nevoa/80")}>{e.erroPct.toLocaleString("pt-BR")}%</td>
                    <td className="px-4 py-3 text-right text-nevoa/80 tabular">{e.rpm}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-nevoa/70">{e.limite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="int">
        <h2 id="int" className="mb-3 text-lg font-semibold text-white">Integrações</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {integracoes.map((i) => (
            <article key={i.id} className="vidro foto-zoom group overflow-hidden rounded-3xl">
              <div className="relative h-32">
                <Image src={i.imagem} alt="" fill sizes="(min-width: 1280px) 33vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#34436a] via-[#34436a]/40 to-transparent" />
                <span className="absolute top-3 right-3">
                  {i.status === "ok" ? <Pilula tom="menta">Saudável</Pilula> : i.status === "atencao" ? <Pilula tom="ambar">Chave antiga</Pilula> : <Pilula tom="coral">Não configurado</Pilula>}
                </span>
              </div>
              <div className="relative -mt-5 p-4 pt-0">
                <p className="font-heading text-lg font-semibold text-white">{i.nome}</p>
                <p className="text-sm text-nevoa/65">{i.funcao}</p>
                <div className="mt-3 flex gap-4 text-xs text-nevoa/60">
                  <span>
                    Latência <b className="text-white tabular">{i.latenciaMs ? `${i.latenciaMs} ms` : "-"}</b>
                  </span>
                  <span>
                    Chave <b className="text-white">{i.chaveRotacionada === "-" ? "-" : dataCurta(i.chaveRotacionada + "T12:00:00Z")}</b>
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="botao-vidro h-9 rounded-xl"
                    disabled={testando === i.id}
                    onClick={async () => {
                      setTestando(i.id);
                      const ok = await testarIntegracao(i.id);
                      setTestando(null);
                      if (ok) toast.success(`${i.nome} respondeu`, { description: "Chamada de teste concluída sem erro." });
                      else toast.error(`${i.nome} sem resposta`, { description: "DSN ausente nas variáveis de produção." });
                    }}
                  >
                    {testando === i.id ? <Girando /> : <PlugZap />} Testar
                  </Button>
                  <Button className="brilho-ambar h-9 rounded-xl" disabled={rotacionando === i.id || i.status === "erro"} onClick={() => setAlvo(i)}>
                    {rotacionando === i.id ? <Girando /> : <KeyRound />} Rotacionar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={!!alvo} onOpenChange={(v) => !v && setAlvo(null)}>
        <DialogContent className="vidro-forte rounded-3xl p-6 text-nevoa">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-white">Rotacionar a chave de {alvo?.nome}?</DialogTitle>
            <DialogDescription className="text-nevoa/65">A chave nova entra no cofre e nos ambientes. A antiga continua válida por 24 horas, para nenhum app em uso perder acesso no meio do caminho.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent">
            <Button variant="outline" className="botao-vidro rounded-xl" onClick={() => setAlvo(null)}>
              Cancelar
            </Button>
            <Button
              className="brilho-ambar rounded-xl"
              onClick={async () => {
                if (!alvo) return;
                const i = alvo;
                setAlvo(null);
                setRotacionando(i.id);
                await rotacionarChave(i.id);
                setRotacionando(null);
                toast.success(`Chave de ${i.nome} rotacionada`);
              }}
            >
              <KeyRound /> Rotacionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
