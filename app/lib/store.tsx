"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ACHADOS_INICIAIS,
  ATIVIDADE_INICIAL,
  BACKUPS_INICIAIS,
  BUCKETS_INICIAIS,
  BUILDS_INICIAIS,
  CHECKLIST_INICIAL,
  CONSULTAS_INICIAIS,
  DEPLOYS_INICIAIS,
  ETAPAS,
  INTEGRACOES_INICIAIS,
  MARCOS_INICIAIS,
  type Achado,
  type Ambiente,
  type Atividade,
  type Backup,
  type Bucket,
  type Build,
  type Consulta,
  type Deploy,
  type Integracao,
  type ItemChecklist,
  type Marco,
  type Plataforma,
} from "./data";

const CHAVE = "alicerce:v1";
const agora = () => new Date().toISOString();
const novoId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

type Estado = {
  achados: Achado[];
  marcos: Marco[];
  deploys: Deploy[];
  consultas: Consulta[];
  buckets: Bucket[];
  backups: Backup[];
  integracoes: Integracao[];
  builds: Build[];
  checklist: ItemChecklist[];
  atividade: Atividade[];
};

const INICIAL: Estado = {
  achados: ACHADOS_INICIAIS,
  marcos: MARCOS_INICIAIS,
  deploys: DEPLOYS_INICIAIS,
  consultas: CONSULTAS_INICIAIS,
  buckets: BUCKETS_INICIAIS,
  backups: BACKUPS_INICIAIS,
  integracoes: INTEGRACOES_INICIAIS,
  builds: BUILDS_INICIAIS,
  checklist: CHECKLIST_INICIAL,
  atividade: ATIVIDADE_INICIAL,
};

export type Execucao = { deployId: string; etapa: number; ambiente: Ambiente } | null;

type Ctx = Estado & {
  pronto: boolean;
  execucao: Execucao;
  salvarAchado: (a: Omit<Achado, "id" | "criadoEm" | "atualizadoEm"> & { id?: string }) => void;
  mudarStatusAchado: (id: string, status: Achado["status"]) => void;
  iniciarDeploy: (ambiente: Ambiente, mensagem: string) => void;
  reverter: (id: string) => void;
  aplicarIndice: (id: string) => Promise<void>;
  alternarPublico: (id: string) => void;
  rodarBackup: () => Promise<void>;
  testarRestauracao: (id: string) => Promise<void>;
  rotacionarChave: (id: string) => Promise<void>;
  testarIntegracao: (id: string) => Promise<boolean>;
  marcarChecklist: (id: string) => void;
  enviarBuild: (p: Plataforma) => Promise<void>;
  marcarEntregavel: (marcoId: string, entregavelId: string) => void;
  aprovarMarco: (id: string) => void;
  restaurar: () => void;
};

const Contexto = createContext<Ctx | null>(null);
const registrar = (texto: string, tipo: Atividade["tipo"]) => (e: Estado): Estado => ({
  ...e,
  atividade: [{ id: novoId("t"), quando: agora(), texto, tipo }, ...e.atividade].slice(0, 30),
});
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AlicerceProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [pronto, setPronto] = useState(false);
  const [execucao, setExecucao] = useState<Execucao>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const estadoRef = useRef(estado);
  useEffect(() => {
    estadoRef.current = estado;
  }, [estado]);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (salvo) setEstado({ ...INICIAL, ...JSON.parse(salvo) });
    } catch {}
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {}
  }, [estado, pronto]);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const salvarAchado: Ctx["salvarAchado"] = useCallback((a) => {
    setEstado((e) => {
      if (a.id) {
        return { ...e, achados: e.achados.map((x) => (x.id === a.id ? { ...x, ...a, id: x.id, atualizadoEm: agora() } : x)) };
      }
      const novo: Achado = { ...a, id: novoId("a"), criadoEm: agora(), atualizadoEm: agora() };
      return registrar(`Novo achado ${novo.codigo}: ${novo.titulo}`, "achado")({ ...e, achados: [novo, ...e.achados] });
    });
  }, []);

  const mudarStatusAchado: Ctx["mudarStatusAchado"] = useCallback((id, status) => {
    setEstado((e) => {
      const a = e.achados.find((x) => x.id === id);
      const prox = { ...e, achados: e.achados.map((x) => (x.id === id ? { ...x, status, atualizadoEm: agora() } : x)) };
      return status === "resolvido" && a ? registrar(`${a.codigo} resolvido: ${a.titulo}`, "achado")(prox) : prox;
    });
  }, []);

  const iniciarDeploy: Ctx["iniciarDeploy"] = useCallback((ambiente, mensagem) => {
    if (timer.current) return;
    const ultima = estadoRef.current.deploys.find((d) => d.status === "sucesso" && d.ambiente === "producao")?.versao ?? "v2.14.3";
    const [maj, min, pat] = ultima.replace("v", "").split(".").map((n) => parseInt(n));
    const versao = ambiente === "producao" ? `v${maj}.${min}.${pat + 1}` : `v${maj}.${min}.${pat + 1}-rc${Math.floor(Math.random() * 3) + 1}`;
    const d: Deploy = {
      id: novoId("d"), versao, commit: Math.random().toString(16).slice(2, 9), mensagem, autorId: "u1",
      ambiente, status: "rodando", inicio: agora(), duracaoS: 0,
    };
    setEstado((e) => ({ ...e, deploys: [d, ...e.deploys] }));
    setExecucao({ deployId: d.id, etapa: 0, ambiente });
    const ultimaEtapa = ambiente === "producao" ? ETAPAS.length - 1 : ETAPAS.length - 2;
    let etapa = 0;
    timer.current = setInterval(() => {
      if (etapa < ultimaEtapa) {
        etapa += 1;
        setExecucao({ deployId: d.id, etapa, ambiente });
        return;
      }
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setExecucao(null);
      const dur = ETAPAS.slice(0, ultimaEtapa + 1).reduce((s, t) => s + t.s, 0) + Math.floor(Math.random() * 20);
      setEstado((e) =>
        registrar(`${d.versao} em ${ambiente === "producao" ? "produção" : "staging"} - ${d.mensagem}`, "deploy")({
          ...e,
          deploys: e.deploys.map((y) => (y.id === d.id ? { ...y, status: "sucesso", duracaoS: dur } : y)),
        }),
      );
    }, 900);
  }, []);

  const reverter: Ctx["reverter"] = useCallback((id) => {
    setEstado((e) => {
      const d = e.deploys.find((x) => x.id === id);
      const anterior = e.deploys.find((x) => x.ambiente === "producao" && x.status === "sucesso" && x.id !== id && x.inicio < (d?.inicio ?? ""));
      return registrar(`Rollback de ${d?.versao} para ${anterior?.versao ?? "a versão anterior"} em 40 s`, "deploy")({
        ...e,
        deploys: e.deploys.map((x) => (x.id === id ? { ...x, status: "revertido" } : x)),
      });
    });
  }, []);

  const aplicarIndice: Ctx["aplicarIndice"] = useCallback(async (id) => {
    await espera(1600);
    setEstado((e) => {
      const q = e.consultas.find((x) => x.id === id);
      return registrar(`Índice aplicado: ${q?.origem} caiu de ${q?.mediaMs} ms para ${q ? q.mediaMs - q.ganhoMs : 0} ms`, "api")({
        ...e,
        consultas: e.consultas.map((x) => (x.id === id ? { ...x, aplicada: true } : x)),
      });
    });
  }, []);

  const alternarPublico: Ctx["alternarPublico"] = useCallback((id) => {
    setEstado((e) => {
      const b = e.buckets.find((x) => x.id === id);
      return registrar(`${b?.nome} agora é ${b?.publico ? "privado, com URL assinada" : "público"}`, "seguranca")({
        ...e,
        buckets: e.buckets.map((x) => (x.id === id ? { ...x, publico: !x.publico, ciclo: !x.publico ? x.ciclo : "URL assinada de 10 min" } : x)),
      });
    });
  }, []);

  const rodarBackup: Ctx["rodarBackup"] = useCallback(async () => {
    const id = novoId("k");
    setEstado((e) => ({
      ...e,
      backups: [{ id, tipo: "incremental", inicio: agora(), tamanhoGB: 0, duracaoMin: 0, destino: "sa-east-1 + us-east-1", status: "rodando" }, ...e.backups],
    }));
    await espera(2600);
    setEstado((e) =>
      registrar("Backup incremental manual concluído e copiado para us-east-1", "backup")({
        ...e,
        backups: e.backups.map((b) => (b.id === id ? { ...b, status: "ok", tamanhoGB: 0.23, duracaoMin: 2 } : b)),
      }),
    );
  }, []);

  const testarRestauracao: Ctx["testarRestauracao"] = useCallback(async (id) => {
    await espera(2400);
    setEstado((e) =>
      registrar("Restauração de teste concluída: 6 tabelas conferidas, contagens batem", "backup")({
        ...e,
        backups: e.backups.map((b) => (b.id === id ? { ...b, restauradoEm: agora(), restauroMin: 13 } : b)),
      }),
    );
  }, []);

  const rotacionarChave: Ctx["rotacionarChave"] = useCallback(async (id) => {
    await espera(1400);
    setEstado((e) => {
      const i = e.integracoes.find((x) => x.id === id);
      return registrar(`Chave de ${i?.nome} rotacionada, a antiga expira em 24 h`, "seguranca")({
        ...e,
        integracoes: e.integracoes.map((x) => (x.id === id ? { ...x, chaveRotacionada: agora().slice(0, 10), status: x.status === "erro" ? x.status : "ok" } : x)),
      });
    });
  }, []);

  const testarIntegracao: Ctx["testarIntegracao"] = useCallback(async (id) => {
    await espera(1200);
    let ok = true;
    setEstado((e) => ({
      ...e,
      integracoes: e.integracoes.map((x) => {
        if (x.id !== id) return x;
        ok = x.status !== "erro";
        return { ...x, latenciaMs: ok ? Math.round(x.latenciaMs * (0.85 + Math.random() * 0.3)) : 0 };
      }),
    }));
    return ok;
  }, []);

  const marcarChecklist: Ctx["marcarChecklist"] = useCallback((id) => {
    setEstado((e) => ({ ...e, checklist: e.checklist.map((c) => (c.id === id ? { ...c, feito: !c.feito } : c)) }));
  }, []);

  const enviarBuild: Ctx["enviarBuild"] = useCallback(async (p) => {
    const id = novoId("bd");
    setEstado((e) => {
      const ult = e.builds.filter((b) => b.plataforma === p).sort((a, b) => b.numero - a.numero)[0];
      const b: Build = { id, plataforma: p, versao: "1.9.1", numero: (ult?.numero ?? 0) + 1, trilha: p === "android" ? "Teste fechado" : "TestFlight", status: "enviado", enviadoEm: agora() };
      return registrar(`${p === "android" ? "Android" : "iOS"} 1.9.1 (${b.numero}) enviado para ${b.trilha}`, "mobile")({ ...e, builds: [b, ...e.builds] });
    });
    await espera(2200);
    setEstado((e) => ({ ...e, builds: e.builds.map((b) => (b.id === id ? { ...b, status: "revisao" } : b)) }));
  }, []);

  const marcarEntregavel: Ctx["marcarEntregavel"] = useCallback((marcoId, entregavelId) => {
    setEstado((e) => ({
      ...e,
      marcos: e.marcos.map((m) =>
        m.id === marcoId ? { ...m, entregaveis: m.entregaveis.map((x) => (x.id === entregavelId ? { ...x, feito: !x.feito } : x)) } : m,
      ),
    }));
  }, []);

  const aprovarMarco: Ctx["aprovarMarco"] = useCallback((id) => {
    setEstado((e) => {
      const m = e.marcos.find((x) => x.id === id);
      const marcos = e.marcos.map((x) => (x.id === id ? { ...x, status: "concluido" as const, aprovadoEm: agora() } : x));
      const prox = marcos.find((x) => x.status === "planejado");
      return registrar(`Marco ${m?.ordem} aprovado: ${m?.nome}`, "achado")({
        ...e,
        marcos: marcos.map((x) => (x.id === prox?.id ? { ...x, status: "andamento" } : x)),
      });
    });
  }, []);

  const restaurar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setExecucao(null);
    setEstado(INICIAL);
  }, []);

  const valor = useMemo<Ctx>(
    () => ({
      ...estado, pronto, execucao, salvarAchado, mudarStatusAchado, iniciarDeploy, reverter, aplicarIndice, alternarPublico,
      rodarBackup, testarRestauracao, rotacionarChave, testarIntegracao, marcarChecklist, enviarBuild, marcarEntregavel, aprovarMarco, restaurar,
    }),
    [estado, pronto, execucao, salvarAchado, mudarStatusAchado, iniciarDeploy, reverter, aplicarIndice, alternarPublico, rodarBackup, testarRestauracao, rotacionarChave, testarIntegracao, marcarChecklist, enviarBuild, marcarEntregavel, aprovarMarco, restaurar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAlicerce() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useAlicerce fora do AlicerceProvider");
  return c;
}
