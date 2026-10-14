"use client";

import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, FileCode2, Plus, Search, SearchX, Timer, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SeloSeveridade, SeloStatus, Titulo, Vazio } from "@/components/bits";
import { useAlicerce } from "@/lib/store";
import { AREAS, SEVERIDADES, dataHora, semAcento, type Achado, type Area, type Severidade, type StatusAchado } from "@/lib/data";
import { cn } from "@/lib/utils";

const ORDENS = [
  { value: "severidade", label: "Mais graves primeiro" },
  { value: "esforco", label: "Menor esforço" },
  { value: "recentes", label: "Mais recentes" },
];
const SEV_ITENS = [{ value: "todas", label: "Todas as severidades" }, ...(Object.keys(SEVERIDADES) as Severidade[]).map((s) => ({ value: s, label: SEVERIDADES[s].rotulo }))];
const STATUS: { id: StatusAchado | "todos"; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "aberto", rotulo: "Abertos" },
  { id: "andamento", rotulo: "Em andamento" },
  { id: "resolvido", rotulo: "Resolvidos" },
];

export default function Pagina() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-3xl bg-white/10" />}>
      <Diagnostico />
    </Suspense>
  );
}

function Diagnostico() {
  const { achados, marcos, pronto } = useAlicerce();
  const params = useSearchParams();
  const inicial = params.get("area") as Area | null;
  const [area, setArea] = useState<Area | "todas">(inicial && inicial in AREAS ? inicial : "todas");
  const [sev, setSev] = useState("todas");
  const [status, setStatus] = useState<StatusAchado | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("severidade");
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [editando, setEditando] = useState<Achado | "novo" | null>(null);

  const lista = useMemo(() => {
    let l = achados;
    if (area !== "todas") l = l.filter((a) => a.area === area);
    if (sev !== "todas") l = l.filter((a) => a.severidade === sev);
    if (status !== "todos") l = l.filter((a) => a.status === status);
    if (busca.trim()) l = l.filter((a) => semAcento(`${a.codigo} ${a.titulo} ${a.onde} ${a.descricao}`).includes(semAcento(busca.trim())));
    return [...l].sort((a, b) =>
      ordem === "esforco" ? a.esforcoH - b.esforcoH : ordem === "recentes" ? b.criadoEm.localeCompare(a.criadoEm) : SEVERIDADES[b.severidade].peso - SEVERIDADES[a.severidade].peso,
    );
  }, [achados, area, sev, status, busca, ordem]);

  const horasAbertas = achados.filter((a) => a.status !== "resolvido").reduce((s, a) => s + a.esforcoH, 0);
  const aberto = achados.find((a) => a.id === abertoId) ?? null;

  return (
    <div className="space-y-5">
      <Titulo rotulo="Diagnóstico" titulo="Achados do back-end, priorizados" sub={`${achados.length} achados em ${Object.keys(AREAS).length} áreas · cerca de ${horasAbertas} h de correção ainda em aberto.`}>
        <Button className="brilho-menta sheen h-10 rounded-full px-4" onClick={() => setEditando("novo")}>
          <Plus /> Novo achado
        </Button>
      </Titulo>

      {/* Áreas com imagem */}
      <div className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por área">
        {(["todas", ...Object.keys(AREAS)] as (Area | "todas")[]).map((a) => {
          const n = a === "todas" ? achados.length : achados.filter((x) => x.area === a).length;
          const sel = area === a;
          return (
            <button
              key={a}
              aria-pressed={sel}
              onClick={() => setArea(a)}
              className={cn(
                "relative isolate flex h-14 shrink-0 items-center gap-2 overflow-hidden rounded-2xl pr-3.5 pl-1.5 text-sm font-semibold ring-1 transition",
                sel ? "bg-white text-noite ring-white" : "bg-white/8 text-nevoa/80 ring-white/15 hover:bg-white/14",
              )}
            >
              {a === "todas" ? (
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-menta/70 to-lavanda/70 text-noite">
                  <Wrench className="size-5" />
                </span>
              ) : (
                <Image src={AREAS[a].imagem} alt="" width={44} height={44} className="size-11 rounded-xl object-cover" />
              )}
              {a === "todas" ? "Todas" : AREAS[a].rotulo}
              <span className={cn("tabular rounded-full px-1.5 text-xs", sel ? "bg-noite/10" : "bg-white/10")}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="vidro flex flex-col gap-3 rounded-3xl p-3 md:flex-row md:flex-wrap md:items-center">
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-nevoa/50" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por código, arquivo ou texto" aria-label="Buscar achado" className="campo pl-10" />
        </div>
        <div className="sem-barra flex gap-1.5 overflow-x-auto">
          {STATUS.map((s) => (
            <button
              key={s.id}
              aria-pressed={status === s.id}
              onClick={() => setStatus(s.id)}
              className={cn("shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition", status === s.id ? "bg-white text-noite" : "text-nevoa/70 hover:bg-white/10 hover:text-white")}
            >
              {s.rotulo}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 md:ml-auto md:flex">
          <Select value={sev} onValueChange={(v) => setSev(String(v))} items={SEV_ITENS}>
            <SelectTrigger className="campo w-full min-w-0 md:w-48" aria-label="Filtrar por severidade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEV_ITENS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ordem} onValueChange={(v) => setOrdem(String(v))} items={ORDENS}>
            <SelectTrigger className="campo w-full min-w-0 md:w-48" aria-label="Ordenar achados">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDENS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!pronto ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl bg-white/10" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="vidro rounded-3xl">
          <Vazio icone={SearchX} titulo="Nenhum achado com esses filtros" texto="Tente outra área ou limpe a busca para ver a lista completa.">
            <Button
              variant="outline"
              className="botao-vidro mt-1 rounded-full"
              onClick={() => {
                setArea("todas");
                setSev("todas");
                setStatus("todos");
                setBusca("");
              }}
            >
              Limpar filtros
            </Button>
          </Vazio>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {lista.map((a, i) => (
            <li key={a.id} className="min-w-0 animate-pop" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <button
                onClick={() => setAbertoId(a.id)}
                className={cn(
                  "vidro group flex h-full w-full gap-4 rounded-3xl p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/14",
                  a.status === "resolvido" && "opacity-75",
                )}
              >
                <div className="relative hidden size-24 shrink-0 overflow-hidden rounded-2xl sm:block">
                  <Image src={AREAS[a.area].imagem} alt="" fill sizes="96px" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#26324f]/80 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 font-mono text-[0.7rem] font-bold text-white">{a.codigo}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-menta sm:hidden">{a.codigo}</span>
                    <SeloSeveridade s={a.severidade} />
                    <SeloStatus s={a.status} />
                    <span className="text-xs text-nevoa/55">{AREAS[a.area].rotulo}</span>
                  </div>
                  <p className={cn("mt-2 leading-snug font-semibold text-white", a.status === "resolvido" && "line-through decoration-white/40")}>{a.titulo}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate font-mono text-[0.72rem] text-nevoa/60">
                    <FileCode2 className="size-3.5 shrink-0" /> {a.onde}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3 text-xs text-nevoa/60">
                    <span className="flex items-center gap-1">
                      <Timer className="size-3.5" /> {a.esforcoH} h
                    </span>
                    <span>Marco {marcos.find((m) => m.id === a.marcoId)?.ordem}</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!aberto} onOpenChange={(v) => !v && setAbertoId(null)}>
        <SheetContent className="vidro-forte scroll-fino w-full gap-0 overflow-y-auto border-white/15 p-0 text-nevoa sm:max-w-lg">
          {aberto && <Detalhe a={aberto} onEditar={() => setEditando(aberto)} />}
        </SheetContent>
      </Sheet>

      <FormAchado key={editando === "novo" ? "novo" : (editando?.id ?? "x")} alvo={editando} onFechar={() => setEditando(null)} />
    </div>
  );
}

function Detalhe({ a, onEditar }: { a: Achado; onEditar: () => void }) {
  const { mudarStatusAchado, marcos } = useAlicerce();
  const marco = marcos.find((m) => m.id === a.marcoId);
  return (
    <>
      <div className="relative h-44 shrink-0">
        <Image src={AREAS[a.area].imagem} alt="" fill sizes="512px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34436a] via-[#34436a]/50 to-transparent" />
      </div>
      <SheetHeader className="-mt-14 relative p-5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-white/90 px-2 py-0.5 font-mono text-xs font-bold text-noite">{a.codigo}</span>
          <SeloSeveridade s={a.severidade} />
          <SeloStatus s={a.status} />
        </div>
        <SheetTitle className="font-heading mt-2 text-xl leading-snug text-white">{a.titulo}</SheetTitle>
        <SheetDescription className="font-mono text-xs text-nevoa/65">{a.onde}</SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-5 pb-6">
        <Bloco titulo="O que acontece">{a.descricao}</Bloco>
        <Bloco titulo="Como corrigir" destaque>
          {a.correcao}
        </Bloco>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <Dado rotulo="Esforço" valor={`${a.esforcoH} h`} />
          <Dado rotulo="Marco" valor={`${marco?.ordem} de 5`} />
          <Dado rotulo="Área" valor={AREAS[a.area].rotulo} />
        </dl>
        <p className="flex items-center gap-1.5 text-xs text-nevoa/55">
          <Clock3 className="size-3.5" /> Atualizado em {dataHora(a.atualizadoEm)}
        </p>
        <div className="grid gap-2">
          {a.status !== "andamento" && a.status !== "resolvido" && (
            <Button
              variant="outline"
              className="botao-vidro h-11 rounded-xl"
              onClick={() => {
                mudarStatusAchado(a.id, "andamento");
                toast.success(`${a.codigo} em andamento`);
              }}
            >
              <Wrench /> Iniciar correção
            </Button>
          )}
          {a.status !== "resolvido" ? (
            <Button
              className="brilho-menta h-11 rounded-xl"
              onClick={() => {
                mudarStatusAchado(a.id, "resolvido");
                toast.success(`${a.codigo} resolvido`, { description: "A nota de prontidão foi recalculada." });
              }}
            >
              <CheckCircle2 /> Marcar como resolvido
            </Button>
          ) : (
            <Button
              variant="outline"
              className="botao-vidro h-11 rounded-xl"
              onClick={() => {
                mudarStatusAchado(a.id, "aberto");
                toast(`${a.codigo} reaberto`);
              }}
            >
              Reabrir
            </Button>
          )}
          <Button variant="outline" className="botao-vidro h-11 rounded-xl" onClick={onEditar}>
            Editar achado
          </Button>
        </div>
      </div>
    </>
  );
}

function Bloco({ titulo, children, destaque }: { titulo: string; children: React.ReactNode; destaque?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-4 ring-1", destaque ? "bg-menta/12 ring-menta/30" : "bg-white/7 ring-white/12")}>
      <p className={cn("text-[0.7rem] font-bold tracking-[0.16em] uppercase", destaque ? "text-menta" : "text-nevoa/55")}>{titulo}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-white">{children}</p>
    </div>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl bg-white/7 p-2.5 ring-1 ring-white/12">
      <dt className="text-[0.68rem] text-nevoa/55">{rotulo}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-white">{valor}</dd>
    </div>
  );
}

const AREA_ITENS = (Object.keys(AREAS) as Area[]).map((a) => ({ value: a, label: AREAS[a].rotulo }));

function FormAchado({ alvo, onFechar }: { alvo: Achado | "novo" | null; onFechar: () => void }) {
  const { salvarAchado, marcos, achados } = useAlicerce();
  const base = alvo && alvo !== "novo" ? alvo : null;
  const [titulo, setTitulo] = useState(base?.titulo ?? "");
  const [onde, setOnde] = useState(base?.onde ?? "");
  const [descricao, setDescricao] = useState(base?.descricao ?? "");
  const [correcao, setCorrecao] = useState(base?.correcao ?? "");
  const [area, setArea] = useState<Area>(base?.area ?? "seguranca");
  const [sev, setSev] = useState<Severidade>(base?.severidade ?? "media");
  const [esforco, setEsforco] = useState(String(base?.esforcoH ?? 2));
  const [marco, setMarco] = useState(base?.marcoId ?? "m2");
  const [tentou, setTentou] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const erros = {
    titulo: titulo.trim().length < 8 ? "Descreva o achado em pelo menos 8 caracteres." : "",
    onde: !onde.trim() ? "Informe o arquivo, rota ou recurso." : "",
    correcao: correcao.trim().length < 10 ? "Diga como corrigir." : "",
    esforco: !(Number(esforco) > 0 && Number(esforco) <= 80) ? "Entre 1 e 80 horas." : "",
  };
  const valido = Object.values(erros).every((e) => !e);
  const marcoItens = marcos.map((m) => ({ value: m.id, label: `${m.ordem} · ${m.nome}` }));
  const sevItens = (Object.keys(SEVERIDADES) as Severidade[]).map((s) => ({ value: s, label: SEVERIDADES[s].rotulo }));

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setTentou(true);
    if (!valido) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 600));
    const prefixo = { arquitetura: "ARQ", seguranca: "SEG", deploy: "DEP", banco: "BD", storage: "STO", backup: "BKP", api: "API", mobile: "MOB" }[area];
    const codigo = base?.codigo ?? `${prefixo}-${String(achados.filter((a) => a.area === area).length + 1).padStart(2, "0")}`;
    salvarAchado({
      id: base?.id, codigo, area, severidade: sev, titulo: titulo.trim(), onde: onde.trim(), descricao: descricao.trim() || "-", correcao: correcao.trim(),
      status: base?.status ?? "aberto", marcoId: marco, esforcoH: Number(esforco), responsavelId: "u1",
    });
    setSalvando(false);
    toast.success(base ? "Achado atualizado" : `Achado ${codigo} criado`);
    onFechar();
  };

  return (
    <Dialog open={!!alvo} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="vidro-forte scroll-fino max-h-[92vh] overflow-y-auto rounded-3xl p-6 text-nevoa sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-white">{base ? `Editar ${base.codigo}` : "Registrar achado"}</DialogTitle>
          <DialogDescription className="text-nevoa/65">O achado entra na lista, no marco escolhido e na nota de prontidão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={salvar} className="grid gap-4" noValidate>
          <Campo id="f-titulo" rotulo="Título" erro={tentou ? erros.titulo : ""}>
            <Input id="f-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Upload aceita qualquer tipo de arquivo" className="campo" aria-invalid={tentou && !!erros.titulo} required />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="f-area" rotulo="Área">
              <Select value={area} onValueChange={(v) => setArea(v as Area)} items={AREA_ITENS}>
                <SelectTrigger id="f-area" className="campo w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_ITENS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo id="f-sev" rotulo="Severidade">
              <Select value={sev} onValueChange={(v) => setSev(v as Severidade)} items={sevItens}>
                <SelectTrigger id="f-sev" className="campo w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sevItens.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </div>
          <Campo id="f-onde" rotulo="Onde" erro={tentou ? erros.onde : ""}>
            <Input id="f-onde" value={onde} onChange={(e) => setOnde(e.target.value)} placeholder="app/api/uploads/route.ts" className="campo font-mono text-sm" aria-invalid={tentou && !!erros.onde} required />
          </Campo>
          <Campo id="f-desc" rotulo="O que acontece (opcional)">
            <Textarea id="f-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="rounded-xl border-white/20 bg-white/9 text-nevoa" placeholder="Impacto para o aluno, para os dados ou para o custo" />
          </Campo>
          <Campo id="f-corr" rotulo="Correção" erro={tentou ? erros.correcao : ""}>
            <Textarea id="f-corr" value={correcao} onChange={(e) => setCorrecao(e.target.value)} rows={2} className="rounded-xl border-white/20 bg-white/9 text-nevoa" placeholder="O que muda e como validar" aria-invalid={tentou && !!erros.correcao} required />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="f-esf" rotulo="Esforço (horas)" erro={tentou ? erros.esforco : ""}>
              <Input id="f-esf" type="number" min={1} max={80} value={esforco} onChange={(e) => setEsforco(e.target.value)} className="campo tabular" aria-invalid={tentou && !!erros.esforco} />
            </Campo>
            <Campo id="f-marco" rotulo="Marco">
              <Select value={marco} onValueChange={(v) => setMarco(String(v))} items={marcoItens}>
                <SelectTrigger id="f-marco" className="campo w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {marcoItens.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </div>
          <DialogFooter className="border-0 bg-transparent p-0 pt-1">
            <Button type="button" variant="outline" className="botao-vidro h-11 rounded-xl" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="brilho-menta h-11 rounded-xl px-5" disabled={salvando}>
              {salvando ? "Salvando..." : base ? "Salvar alterações" : "Registrar achado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-white">
        {rotulo}
      </Label>
      {children}
      {erro && <p className="text-xs font-medium text-[#ffb3a8]">{erro}</p>}
    </div>
  );
}
