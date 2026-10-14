"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  DatabaseBackup,
  GitCommitHorizontal,
  Rocket,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Anel, Barra, Pilula } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { AREAS, PESSOAS, dataHora, prontidao, type Area, type Atividade } from "@/lib/data";
import { cn } from "@/lib/utils";

const PRIORIDADES: { area: Area[]; titulo: string; texto: string; href: string; imagem: string }[] = [
  { area: ["arquitetura"], titulo: "Arquitetura e código", texto: "Camada de serviços, regra de progresso única e testes onde dói.", href: "/diagnostico", imagem: "/img/codigo.jpg" },
  { area: ["seguranca"], titulo: "Segurança", texto: "Segredos no cofre, dono do recurso checado e login com limite.", href: "/diagnostico", imagem: "/img/candado.jpg" },
  { area: ["deploy"], titulo: "Deploy", texto: "Staging, migrações no pipeline e rollback em um clique.", href: "/deploy", imagem: "/img/devs.jpg" },
  { area: ["banco", "storage"], titulo: "PostgreSQL e storage", texto: "Índices, pooler e bucket privado com URL assinada.", href: "/dados", imagem: "/img/data.jpg" },
  { area: ["backup"], titulo: "Backups monitorados", texto: "PITR, cópia fora da região e restauração testada toda semana.", href: "/backups", imagem: "/img/sala-servidores.jpg" },
  { area: ["api"], titulo: "APIs e integrações", texto: "Webhooks assinados, /api/v1 tipada e chaves rotacionadas.", href: "/apis", imagem: "/img/fibra.jpg" },
  { area: ["mobile"], titulo: "Play Store e App Store", texto: "Builds Capacitor revisados antes de chegar ao revisor.", href: "/mobile", imagem: "/img/aparelhos.jpg" },
];

const ICONE_ATIV: Record<Atividade["tipo"], React.ElementType> = {
  deploy: Rocket,
  achado: CheckCircle2,
  backup: DatabaseBackup,
  seguranca: ShieldAlert,
  mobile: Smartphone,
  api: GitCommitHorizontal,
};

export default function VisaoGeral() {
  const { achados, deploys, backups, builds, marcos, atividade, execucao } = useAlicerce();
  const nota = prontidao(achados);
  const abertos = achados.filter((a) => a.status !== "resolvido");
  const graves = abertos.filter((a) => a.severidade === "critica" || a.severidade === "alta").length;
  const ultimoProd = deploys.find((d) => d.ambiente === "producao" && d.status === "sucesso");
  const ultimoRestauro = backups.find((b) => b.restauradoEm);
  const marcoAtual = marcos.find((m) => m.status === "andamento") ?? marcos[marcos.length - 1];
  const progressoArea = (areas: Area[]) => {
    const l = achados.filter((a) => areas.includes(a.area));
    if (!l.length) return 100;
    return Math.round((l.reduce((s, a) => s + (a.status === "resolvido" ? 1 : a.status === "andamento" ? 0.4 : 0), 0) / l.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Herói */}
      <section className="reflexo relative isolate animate-rise overflow-hidden rounded-[2rem] border border-white/20 shadow-[0_40px_80px_-40px_rgb(8_12_28/0.8)]">
        <Image src="/img/datacenter.jpg" alt="Corredor de servidores iluminado" fill priority sizes="(min-width: 1024px) 1100px, 100vw" className="-z-20 animate-kenburns object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2b3960]/95 via-[#2f3e68]/80 to-[#2f3e68]/30" />
        <div className="grade-fina absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(90deg,black,transparent_70%)]" />
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <Pilula tom="menta">
              <Sparkles className="size-3.5" /> Marco {marcoAtual.ordem} de {marcos.length} · {marcoAtual.nome}
            </Pilula>
            <h1 className="mt-4 text-[2rem] leading-[1.08] font-semibold text-white sm:text-5xl">
              A Jornada pronta para <span className="texto-aurora">produção</span>, sem surpresa no caminho.
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-nevoa/80">
              Tudo o que o diagnóstico encontrou no back-end, no banco, no deploy e nos apps, com o que já foi corrigido e o que vem no próximo marco. O front e o design seguem com a equipe interna.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/diagnostico" className="brilho-menta sheen inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm">
                Ver achados <ArrowRight className="size-4" />
              </Link>
              <Link href="/marcos" className="botao-vidro inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold backdrop-blur">
                Plano de marcos
              </Link>
            </div>
          </div>
          <div className="vidro flex flex-col items-center gap-5 rounded-3xl p-5 sm:flex-row lg:flex-col xl:flex-row">
            <Anel valor={nota} tamanho={148}>
              <div>
                <p className="font-heading text-4xl font-semibold text-white tabular">{nota}</p>
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-nevoa/60 uppercase">prontidão</p>
              </div>
            </Anel>
            <dl className="grid w-full grid-cols-2 gap-2.5 text-sm">
              <Indicador rotulo="Graves abertos" valor={String(graves)} tom={graves ? "coral" : "menta"} />
              <Indicador rotulo="Resolvidos" valor={`${achados.length - abertos.length}/${achados.length}`} tom="menta" />
              <Indicador rotulo="Em produção" valor={ultimoProd?.versao ?? "-"} tom="lavanda" />
              <Indicador rotulo="Último restauro" valor={ultimoRestauro?.restauroMin ? `${ultimoRestauro.restauroMin} min` : "nunca"} tom="ambar" />
            </dl>
          </div>
        </div>
      </section>

      {/* Prioridades do projeto */}
      <section aria-labelledby="prio">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="prio" className="text-xl font-semibold text-white">As sete prioridades</h2>
          <span className="text-xs text-nevoa/60">progresso pelos achados de cada área</span>
        </div>
        <div className="sem-barra -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          {PRIORIDADES.map((p, i) => {
            const v = progressoArea(p.area);
            return (
              <Link
                key={p.titulo}
                href={p.href}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn("foto-zoom group relative isolate flex min-h-52 w-72 shrink-0 animate-rise snap-start flex-col justify-end overflow-hidden rounded-3xl border border-white/15 p-4 sm:w-auto", i === 0 && "xl:col-span-2")}
              >
                <Image src={p.imagem} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 18rem" className="-z-20 object-cover" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#26324f] via-[#2b3960]/70 to-transparent" />
                <span className="chip-foto absolute top-3 left-3 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold">{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="absolute top-3 right-3 size-5 text-white/80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <p className="font-heading text-lg font-semibold text-white">{p.titulo}</p>
                <p className="mt-1 text-[0.82rem] leading-snug text-nevoa/75">{p.texto}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <Barra valor={v} tom={v >= 70 ? "menta" : v >= 30 ? "lavanda" : "ambar"} />
                  </div>
                  <span className="tabular text-xs font-bold text-white">{v}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Marcos */}
        <section className="vidro rounded-3xl p-5" aria-labelledby="marcos-h">
          <div className="flex items-center justify-between">
            <h2 id="marcos-h" className="text-lg font-semibold text-white">Diagnóstico e marcos</h2>
            <Link href="/marcos" className="text-xs font-semibold text-menta hover:underline">
              Abrir plano
            </Link>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-5">
            {marcos.map((m) => {
              const feitos = m.entregaveis.filter((e) => e.feito).length;
              return (
                <li key={m.id} className="relative">
                  <div className={cn("relative h-24 overflow-hidden rounded-2xl ring-1", m.status === "andamento" ? "ring-2 ring-menta" : "ring-white/15")}>
                    <Image src={m.imagem} alt="" fill sizes="200px" className={cn("object-cover", m.status === "planejado" && "opacity-60 grayscale-[40%]")} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#26324f]/90 to-transparent" />
                    <span className="absolute bottom-2 left-2.5 font-heading text-2xl font-semibold text-white">{m.ordem}</span>
                    {m.status === "concluido" && <CheckCircle2 className="absolute top-2 right-2 size-5 text-menta drop-shadow" />}
                    {m.status === "andamento" && <CircleDot className="absolute top-2 right-2 size-5 animate-pulse text-menta" />}
                  </div>
                  <p className="mt-2 text-sm leading-tight font-semibold text-white">{m.nome}</p>
                  <p className="mt-0.5 text-xs text-nevoa/60">
                    {m.semanas} · {feitos}/{m.entregaveis.length}
                  </p>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniCartao icone={Rocket} titulo="Pipeline" texto={execucao ? "Deploy rodando agora" : `${ultimoProd?.versao} em produção`} href="/deploy" vivo={!!execucao} />
            <MiniCartao icone={DatabaseBackup} titulo="Backup" texto={backups[0]?.status === "falhou" ? "Último incremental falhou" : "Cópia em 2 regiões"} href="/backups" alerta={backups[0]?.status === "falhou"} />
            <MiniCartao icone={Smartphone} titulo="Lojas" texto={builds.some((b) => b.status === "rejeitado") ? "iOS com ajuste pendente" : "Builds em dia"} href="/mobile" alerta={builds.some((b) => b.status === "rejeitado")} />
          </div>
        </section>

        {/* Atividade */}
        <section className="vidro rounded-3xl p-5" aria-labelledby="ativ-h">
          <div className="flex items-center justify-between">
            <h2 id="ativ-h" className="text-lg font-semibold text-white">Atividade recente</h2>
            <div className="flex -space-x-2">
              {PESSOAS.slice(0, 4).map((p) => (
                <Image key={p.id} src={p.foto} alt={p.nome} title={`${p.nome} · ${p.papel}`} width={28} height={28} className="size-7 rounded-full object-cover ring-2 ring-[#34436a]" />
              ))}
            </div>
          </div>
          <ul className="scroll-fino mt-4 max-h-[22rem] space-y-1 overflow-y-auto pr-1">
            {atividade.slice(0, 8).map((a) => {
              const I = ICONE_ATIV[a.tipo];
              return (
                <li key={a.id} className="flex animate-pop gap-3 rounded-2xl p-2.5 transition hover:bg-white/6">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <I className="size-4 text-menta" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-white">{a.texto}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-nevoa/55">
                      <Clock3 className="size-3" /> {dataHora(a.quando)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl border border-white/15 p-6 sm:p-8">
        <Image src="/img/cidade.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2b3960]/95 via-[#2b3960]/75 to-[#2b3960]/40" />
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-ambar uppercase">Áreas do diagnóstico</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Cada achado aponta o arquivo, o risco e a correção.</h2>
            <p className="mt-2 text-sm text-nevoa/75">Sem relatório genérico: o que está quebrado, onde está, quanto custa corrigir e em qual marco entra.</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(AREAS) as Area[]).map((a) => (
              <Link key={a} href={`/diagnostico?area=${a}`} className="foto-zoom group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/20">
                <Image src={AREAS[a].imagem} alt="" fill sizes="120px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#26324f]/95 to-transparent" />
                <span className="absolute inset-x-1.5 bottom-1.5 text-[0.68rem] leading-tight font-semibold text-white">{AREAS[a].rotulo}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Indicador({ rotulo, valor, tom }: { rotulo: string; valor: string; tom: "menta" | "coral" | "lavanda" | "ambar" }) {
  const cor = { menta: "text-menta", coral: "text-coral", lavanda: "text-lavanda", ambar: "text-ambar" }[tom];
  return (
    <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/12">
      <dt className="text-[0.7rem] text-nevoa/60">{rotulo}</dt>
      <dd className={cn("font-heading mt-0.5 text-lg font-semibold tabular", cor)}>{valor}</dd>
    </div>
  );
}

function MiniCartao({ icone: I, titulo, texto, href, vivo, alerta }: { icone: React.ElementType; titulo: string; texto: string; href: string; vivo?: boolean; alerta?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/12 transition hover:bg-white/12">
      <span className={cn("grid size-10 place-items-center rounded-xl", alerta ? "bg-coral/25 text-coral" : "bg-menta/20 text-menta", vivo && "animate-pulso")}>
        <I className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{titulo}</p>
        <p className="truncate text-xs text-nevoa/65">{texto}</p>
      </div>
    </Link>
  );
}
