// Dados de exemplo do Alicerce, o console de diagnóstico e produção da plataforma Jornada
// (conteúdo + acompanhamento, Next.js/Node + clientes Capacitor). Cada coleção tem o formato
// que uma API real devolveria: ids, timestamps, status e relações por id.

export type Area = "arquitetura" | "seguranca" | "deploy" | "banco" | "storage" | "backup" | "api" | "mobile";
export type Severidade = "critica" | "alta" | "media" | "baixa";
export type StatusAchado = "aberto" | "andamento" | "resolvido";

export const AREAS: Record<Area, { rotulo: string; imagem: string }> = {
  arquitetura: { rotulo: "Arquitetura", imagem: "/img/codigo.jpg" },
  seguranca: { rotulo: "Segurança", imagem: "/img/candado.jpg" },
  deploy: { rotulo: "Deploy", imagem: "/img/devs.jpg" },
  banco: { rotulo: "PostgreSQL", imagem: "/img/data.jpg" },
  storage: { rotulo: "Storage", imagem: "/img/hd.jpg" },
  backup: { rotulo: "Backup", imagem: "/img/sala-servidores.jpg" },
  api: { rotulo: "APIs", imagem: "/img/fibra.jpg" },
  mobile: { rotulo: "Mobile", imagem: "/img/aparelhos.jpg" },
};

export const SEVERIDADES: Record<Severidade, { rotulo: string; peso: number }> = {
  critica: { rotulo: "Crítica", peso: 4 },
  alta: { rotulo: "Alta", peso: 3 },
  media: { rotulo: "Média", peso: 2 },
  baixa: { rotulo: "Baixa", peso: 1 },
};

export type Pessoa = { id: string; nome: string; papel: string; foto: string };
export const PESSOAS: Pessoa[] = [
  { id: "u1", nome: "Medhi Chan", papel: "Back-end sênior", foto: "/img/m-thiago.jpg" },
  { id: "u2", nome: "Romulo S.", papel: "Produto", foto: "/img/m-rafael.jpg" },
  { id: "u3", nome: "Camila Rocha", papel: "Front-end", foto: "/img/m-camila.jpg" },
  { id: "u4", nome: "Diego Martins", papel: "Design", foto: "/img/m-diego.jpg" },
  { id: "u5", nome: "Larissa Nunes", papel: "Conteúdo", foto: "/img/m-larissa.jpg" },
];
export const pessoa = (id: string) => PESSOAS.find((p) => p.id === id) ?? PESSOAS[0];

export type Achado = {
  id: string;
  codigo: string;
  area: Area;
  severidade: Severidade;
  titulo: string;
  onde: string;
  descricao: string;
  correcao: string;
  status: StatusAchado;
  marcoId: string;
  esforcoH: number;
  responsavelId: string;
  criadoEm: string;
  atualizadoEm: string;
};

export const ACHADOS_INICIAIS: Achado[] = [
  {
    id: "a1", codigo: "SEG-01", area: "seguranca", severidade: "critica",
    titulo: "Segredos do banco e do storage versionados no repositório",
    onde: ".env.production (histórico do git, 14 commits)",
    descricao: "DATABASE_URL e a chave do bucket de mídia estão no histórico. Qualquer pessoa com acesso de leitura ao repo consegue escrever no banco de produção.",
    correcao: "Rotacionar as duas credenciais, mover para o cofre de segredos do provedor, limpar o histórico e bloquear .env* no pre-commit.",
    status: "andamento", marcoId: "m2", esforcoH: 4, responsavelId: "u1", criadoEm: "2026-10-08T10:20:00Z", atualizadoEm: "2026-10-09T09:10:00Z",
  },
  {
    id: "a2", codigo: "SEG-02", area: "seguranca", severidade: "alta",
    titulo: "Rotas /api/progress sem checagem de dono do recurso",
    onde: "app/api/progress/[userId]/route.ts",
    descricao: "O token é validado, mas o userId vem da URL. Um aluno logado lê e altera o acompanhamento de outro trocando o id.",
    correcao: "Derivar o userId da sessão, aplicar Row Level Security nas tabelas de progresso e cobrir com teste de autorização.",
    status: "aberto", marcoId: "m2", esforcoH: 6, responsavelId: "u1", criadoEm: "2026-10-08T11:05:00Z", atualizadoEm: "2026-10-08T11:05:00Z",
  },
  {
    id: "a3", codigo: "SEG-03", area: "seguranca", severidade: "media",
    titulo: "Login sem limite de tentativas",
    onde: "app/api/auth/login/route.ts",
    descricao: "Sem rate limit nem atraso progressivo, o endpoint aceita força bruta de senha sem custo.",
    correcao: "Rate limit por IP e por e-mail (Redis), bloqueio temporário após 8 tentativas e alerta no log.",
    status: "aberto", marcoId: "m2", esforcoH: 3, responsavelId: "u1", criadoEm: "2026-10-08T11:40:00Z", atualizadoEm: "2026-10-08T11:40:00Z",
  },
  {
    id: "a4", codigo: "BD-01", area: "banco", severidade: "alta",
    titulo: "Consulta do feed faz varredura completa em content_views",
    onde: "lib/feed.ts · SELECT ... WHERE user_id = $1 ORDER BY viewed_at",
    descricao: "4,2 milhões de linhas sem índice composto. O p95 do feed passa de 1,8 s nos horários de pico.",
    correcao: "Índice (user_id, viewed_at DESC) criado CONCURRENTLY, depois revisar o N+1 que busca o autor de cada item.",
    status: "aberto", marcoId: "m3", esforcoH: 3, responsavelId: "u1", criadoEm: "2026-10-08T14:12:00Z", atualizadoEm: "2026-10-08T14:12:00Z",
  },
  {
    id: "a5", codigo: "BD-02", area: "banco", severidade: "media",
    titulo: "Conexões esgotando no deploy serverless",
    onde: "lib/db.ts · new Pool() por requisição",
    descricao: "Cada função abre seu próprio pool. Em pico o Postgres chega a 97 de 100 conexões e recusa novas.",
    correcao: "Pooler (PgBouncer em modo transaction) e um cliente único reaproveitado entre invocações.",
    status: "aberto", marcoId: "m3", esforcoH: 4, responsavelId: "u1", criadoEm: "2026-10-08T14:40:00Z", atualizadoEm: "2026-10-08T14:40:00Z",
  },
  {
    id: "a6", codigo: "BKP-01", area: "backup", severidade: "critica",
    titulo: "Backup diário existe, mas nunca foi restaurado",
    onde: "Snapshots automáticos do provedor, mesma região",
    descricao: "Não há teste de restauração nem cópia fora da região. Se a conta ou a região cair, os backups caem junto.",
    correcao: "PITR com WAL contínuo, cópia diária criptografada para outra região e restauração automática semanal num banco descartável.",
    status: "andamento", marcoId: "m3", esforcoH: 6, responsavelId: "u1", criadoEm: "2026-10-08T15:00:00Z", atualizadoEm: "2026-10-09T08:30:00Z",
  },
  {
    id: "a7", codigo: "STO-01", area: "storage", severidade: "alta",
    titulo: "Bucket de anexos dos alunos com leitura pública",
    onde: "jornada-uploads (ACL public-read)",
    descricao: "Fotos de evolução e PDFs enviados pelos alunos podem ser listados por quem souber o nome do bucket.",
    correcao: "Bucket privado, URLs assinadas de 10 minutos geradas pela API e varredura dos objetos já expostos.",
    status: "aberto", marcoId: "m3", esforcoH: 4, responsavelId: "u1", criadoEm: "2026-10-08T15:30:00Z", atualizadoEm: "2026-10-08T15:30:00Z",
  },
  {
    id: "a8", codigo: "DEP-01", area: "deploy", severidade: "alta",
    titulo: "Migrações rodadas à mão em produção",
    onde: "README · \"rodar npx prisma migrate deploy depois do push\"",
    descricao: "Se alguém esquece, o código novo sobe contra o schema antigo e quebra telas inteiras.",
    correcao: "Migração como etapa do pipeline, antes da troca de versão, com migrações sempre compatíveis com a versão anterior.",
    status: "resolvido", marcoId: "m4", esforcoH: 5, responsavelId: "u1", criadoEm: "2026-10-08T16:10:00Z", atualizadoEm: "2026-10-10T12:00:00Z",
  },
  {
    id: "a9", codigo: "DEP-02", area: "deploy", severidade: "media",
    titulo: "Sem ambiente de staging",
    onde: "Projeto de hospedagem único",
    descricao: "Toda alteração é testada direto em produção, com os dados reais dos alunos.",
    correcao: "Staging com banco próprio e dados anonimizados, promovido para produção pelo mesmo artefato de build.",
    status: "aberto", marcoId: "m4", esforcoH: 6, responsavelId: "u1", criadoEm: "2026-10-08T16:30:00Z", atualizadoEm: "2026-10-08T16:30:00Z",
  },
  {
    id: "a10", codigo: "ARQ-01", area: "arquitetura", severidade: "media",
    titulo: "Regra de negócio espalhada entre rotas e componentes",
    onde: "app/(app)/**/page.tsx · 23 chamadas diretas ao Prisma",
    descricao: "Páginas consultam o banco direto. A mesma regra de progresso existe em três lugares com resultados diferentes.",
    correcao: "Camada de serviços (lib/services) usada por rotas e server actions, com testes unitários na regra de progresso.",
    status: "aberto", marcoId: "m2", esforcoH: 10, responsavelId: "u1", criadoEm: "2026-10-08T17:00:00Z", atualizadoEm: "2026-10-08T17:00:00Z",
  },
  {
    id: "a11", codigo: "ARQ-02", area: "arquitetura", severidade: "baixa",
    titulo: "Logs sem correlação entre web, API e app",
    onde: "console.log em 140 pontos",
    descricao: "Quando um aluno relata erro no app, não dá pra seguir a requisição até o banco.",
    correcao: "Logger estruturado com request-id propagado do Capacitor até a API e envio para o Sentry.",
    status: "aberto", marcoId: "m5", esforcoH: 4, responsavelId: "u1", criadoEm: "2026-10-08T17:20:00Z", atualizadoEm: "2026-10-08T17:20:00Z",
  },
  {
    id: "a12", codigo: "API-01", area: "api", severidade: "alta",
    titulo: "Webhook de pagamento sem verificação de assinatura",
    onde: "app/api/webhooks/pagarme/route.ts",
    descricao: "Qualquer POST forjado libera acesso premium a um usuário.",
    correcao: "Validar a assinatura HMAC, guardar o id do evento para idempotência e reprocessar com fila em caso de erro.",
    status: "aberto", marcoId: "m4", esforcoH: 3, responsavelId: "u1", criadoEm: "2026-10-09T09:00:00Z", atualizadoEm: "2026-10-09T09:00:00Z",
  },
  {
    id: "a13", codigo: "API-02", area: "api", severidade: "baixa",
    titulo: "Rotas sem versionamento usadas pelo app das lojas",
    onde: "/api/* consumido pelo Capacitor 1.8.x",
    descricao: "Mudar o formato de uma resposta quebra quem ainda não atualizou o app, e a loja não força update.",
    correcao: "Prefixo /api/v1, contrato tipado com zod e aviso de versão mínima no app.",
    status: "aberto", marcoId: "m4", esforcoH: 4, responsavelId: "u1", criadoEm: "2026-10-09T09:30:00Z", atualizadoEm: "2026-10-09T09:30:00Z",
  },
  {
    id: "a14", codigo: "MOB-01", area: "mobile", severidade: "alta",
    titulo: "Build iOS sem texto de privacidade exigido pela Apple",
    onde: "ios/App/App/Info.plist · PrivacyInfo.xcprivacy ausente",
    descricao: "A Apple rejeita o envio sem o manifesto de privacidade e sem a justificativa de câmera e fotos.",
    correcao: "Adicionar PrivacyInfo.xcprivacy, NSCameraUsageDescription e NSPhotoLibraryUsageDescription em português.",
    status: "aberto", marcoId: "m5", esforcoH: 2, responsavelId: "u1", criadoEm: "2026-10-09T10:00:00Z", atualizadoEm: "2026-10-09T10:00:00Z",
  },
  {
    id: "a15", codigo: "MOB-02", area: "mobile", severidade: "media",
    titulo: "Android ainda mira API 33",
    onde: "android/variables.gradle · targetSdkVersion 33",
    descricao: "A Play Store exige API 35 para novas versões. O próximo envio seria bloqueado.",
    correcao: "Subir para API 35, Capacitor 7 e revisar permissões de notificação do Android 13+.",
    status: "resolvido", marcoId: "m5", esforcoH: 3, responsavelId: "u1", criadoEm: "2026-10-09T10:30:00Z", atualizadoEm: "2026-10-10T15:00:00Z",
  },
];

export type StatusMarco = "concluido" | "andamento" | "planejado";
export type Marco = {
  id: string;
  ordem: number;
  nome: string;
  resumo: string;
  semanas: string;
  status: StatusMarco;
  imagem: string;
  entregaveis: { id: string; texto: string; feito: boolean }[];
  aprovadoEm?: string;
};

export const MARCOS_INICIAIS: Marco[] = [
  {
    id: "m1", ordem: 1, nome: "Diagnóstico", resumo: "Leitura do código, do banco, do deploy e dos apps. Relatório com achados priorizados e estimativa de cada marco.",
    semanas: "5 dias", status: "concluido", imagem: "/img/escritorio.jpg", aprovadoEm: "2026-10-11T14:00:00Z",
    entregaveis: [
      { id: "e1", texto: "Mapa da arquitetura atual", feito: true },
      { id: "e2", texto: "Lista de achados com severidade e esforço", feito: true },
      { id: "e3", texto: "Plano de marcos com prazos", feito: true },
    ],
  },
  {
    id: "m2", ordem: 2, nome: "Segurança e arquitetura", resumo: "Segredos fora do código, autorização por dono do recurso, rate limit e camada de serviços.",
    semanas: "1,5 semana", status: "andamento", imagem: "/img/candado.jpg",
    entregaveis: [
      { id: "e4", texto: "Credenciais rotacionadas e no cofre", feito: true },
      { id: "e5", texto: "RLS nas tabelas de progresso", feito: false },
      { id: "e6", texto: "Rate limit no login", feito: false },
      { id: "e7", texto: "lib/services com testes", feito: false },
    ],
  },
  {
    id: "m3", ordem: 3, nome: "Banco, storage e backup", resumo: "Índices, pooler, bucket privado com URL assinada, PITR e restauração testada toda semana.",
    semanas: "1 semana", status: "planejado", imagem: "/img/data.jpg",
    entregaveis: [
      { id: "e8", texto: "Índices das consultas lentas", feito: false },
      { id: "e9", texto: "PgBouncer em modo transaction", feito: false },
      { id: "e10", texto: "Cópia fora da região + teste de restauração", feito: false },
    ],
  },
  {
    id: "m4", ordem: 4, nome: "Deploy e APIs", resumo: "Pipeline com staging, migrações automáticas, rollback de um clique e APIs versionadas.",
    semanas: "1 semana", status: "planejado", imagem: "/img/devs.jpg",
    entregaveis: [
      { id: "e11", texto: "Pipeline com staging e smoke test", feito: false },
      { id: "e12", texto: "Webhooks assinados e idempotentes", feito: false },
      { id: "e13", texto: "/api/v1 com contrato tipado", feito: false },
    ],
  },
  {
    id: "m5", ordem: 5, nome: "Produção e lojas", resumo: "Observabilidade, checklist de lançamento e publicação na Play Store e na App Store.",
    semanas: "1 semana", status: "planejado", imagem: "/img/aparelhos.jpg",
    entregaveis: [
      { id: "e14", texto: "Sentry + logs com request-id", feito: false },
      { id: "e15", texto: "Build Android aprovado", feito: false },
      { id: "e16", texto: "Build iOS aprovado", feito: false },
    ],
  },
];

export type Ambiente = "staging" | "producao";
export type StatusDeploy = "sucesso" | "falhou" | "revertido" | "rodando";
export type Deploy = {
  id: string;
  versao: string;
  commit: string;
  mensagem: string;
  autorId: string;
  ambiente: Ambiente;
  status: StatusDeploy;
  inicio: string;
  duracaoS: number;
  etapaFalha?: string;
};

export const ETAPAS = [
  { id: "lint", rotulo: "Lint e tipos", s: 38 },
  { id: "testes", rotulo: "Testes", s: 74 },
  { id: "build", rotulo: "Build", s: 96 },
  { id: "migracao", rotulo: "Migrações", s: 12 },
  { id: "staging", rotulo: "Staging", s: 41 },
  { id: "smoke", rotulo: "Smoke test", s: 27 },
  { id: "producao", rotulo: "Produção", s: 33 },
] as const;

export const DEPLOYS_INICIAIS: Deploy[] = [
  { id: "d9", versao: "v2.14.3", commit: "8f3a1c2", mensagem: "fix(progress): userId vem da sessão", autorId: "u1", ambiente: "producao", status: "sucesso", inicio: "2026-10-10T18:42:00Z", duracaoS: 321 },
  { id: "d8", versao: "v2.14.2", commit: "b71e09d", mensagem: "feat(conteudo): trilha de mobilidade", autorId: "u3", ambiente: "producao", status: "sucesso", inicio: "2026-10-10T13:05:00Z", duracaoS: 309 },
  { id: "d7", versao: "v2.14.2-rc1", commit: "a90cc41", mensagem: "chore(db): migração content_views", autorId: "u1", ambiente: "staging", status: "falhou", inicio: "2026-10-10T11:20:00Z", duracaoS: 162, etapaFalha: "migracao" },
  { id: "d6", versao: "v2.14.1", commit: "4e2d7b0", mensagem: "fix(feed): paginação por cursor", autorId: "u1", ambiente: "producao", status: "revertido", inicio: "2026-10-09T19:40:00Z", duracaoS: 298 },
  { id: "d5", versao: "v2.14.0", commit: "19c4f5a", mensagem: "feat(checkin): lembrete semanal por push", autorId: "u3", ambiente: "producao", status: "sucesso", inicio: "2026-10-09T14:10:00Z", duracaoS: 315 },
  { id: "d4", versao: "v2.13.9", commit: "c03b6e8", mensagem: "chore(ci): pipeline com staging", autorId: "u1", ambiente: "staging", status: "sucesso", inicio: "2026-10-09T10:02:00Z", duracaoS: 254 },
];

export type Tabela = { nome: string; linhas: number; tamanhoMB: number; indices: number; seqScanPct: number; cresc30: number };
export const TABELAS: Tabela[] = [
  { nome: "content_views", linhas: 4_218_400, tamanhoMB: 1_840, indices: 2, seqScanPct: 71, cresc30: 18 },
  { nome: "progress_entries", linhas: 1_906_120, tamanhoMB: 912, indices: 3, seqScanPct: 22, cresc30: 11 },
  { nome: "checkins", linhas: 642_380, tamanhoMB: 388, indices: 4, seqScanPct: 6, cresc30: 9 },
  { nome: "contents", linhas: 3_412, tamanhoMB: 64, indices: 5, seqScanPct: 2, cresc30: 3 },
  { nome: "users", linhas: 18_437, tamanhoMB: 21, indices: 4, seqScanPct: 1, cresc30: 6 },
  { nome: "subscriptions", linhas: 9_870, tamanhoMB: 7, indices: 3, seqScanPct: 0, cresc30: 5 },
];

export type Consulta = { id: string; sql: string; origem: string; mediaMs: number; porMin: number; sugestao: string; ganhoMs: number; aplicada: boolean };
export const CONSULTAS_INICIAIS: Consulta[] = [
  {
    id: "q1", sql: "SELECT c.* FROM content_views v JOIN contents c ON c.id = v.content_id WHERE v.user_id = $1 ORDER BY v.viewed_at DESC LIMIT 20",
    origem: "GET /api/feed", mediaMs: 1840, porMin: 310, sugestao: "CREATE INDEX CONCURRENTLY idx_views_user_time ON content_views (user_id, viewed_at DESC);", ganhoMs: 1792, aplicada: false,
  },
  {
    id: "q2", sql: "SELECT * FROM progress_entries WHERE user_id = $1 AND module_id = ANY($2)",
    origem: "GET /api/progress", mediaMs: 420, porMin: 190, sugestao: "CREATE INDEX CONCURRENTLY idx_progress_user_module ON progress_entries (user_id, module_id);", ganhoMs: 395, aplicada: false,
  },
  {
    id: "q3", sql: "SELECT count(*) FROM checkins WHERE created_at > now() - interval '7 days' AND coach_id = $1",
    origem: "GET /api/coach/resumo", mediaMs: 260, porMin: 42, sugestao: "CREATE INDEX CONCURRENTLY idx_checkins_coach_date ON checkins (coach_id, created_at);", ganhoMs: 238, aplicada: false,
  },
];

export type Bucket = { id: string; nome: string; uso: string; objetos: number; tamanhoGB: number; publico: boolean; versionado: boolean; ciclo: string; imagem: string };
export const BUCKETS_INICIAIS: Bucket[] = [
  { id: "b1", nome: "jornada-midia", uso: "Vídeos e capas dos conteúdos", objetos: 12_840, tamanhoGB: 486, publico: false, versionado: true, ciclo: "Originais para camada fria após 90 dias", imagem: "/img/lectura.jpg" },
  { id: "b2", nome: "jornada-uploads", uso: "Fotos de evolução e PDFs dos alunos", objetos: 58_210, tamanhoGB: 73, publico: true, versionado: false, ciclo: "Sem regra", imagem: "/img/escrita.jpg" },
  { id: "b3", nome: "jornada-backups", uso: "Dumps e WAL do PostgreSQL", objetos: 1_204, tamanhoGB: 212, publico: false, versionado: true, ciclo: "Retenção de 35 dias + mensal por 12 meses", imagem: "/img/racks.jpg" },
];

export type StatusBackup = "ok" | "falhou" | "rodando";
export type Backup = { id: string; tipo: "completo" | "incremental"; inicio: string; tamanhoGB: number; duracaoMin: number; destino: string; status: StatusBackup; restauradoEm?: string; restauroMin?: number };
export const BACKUPS_INICIAIS: Backup[] = [
  { id: "k8", tipo: "completo", inicio: "2026-10-11T03:00:00Z", tamanhoGB: 3.4, duracaoMin: 11, destino: "sa-east-1 + us-east-1", status: "ok", restauradoEm: "2026-10-11T04:10:00Z", restauroMin: 14 },
  { id: "k7", tipo: "incremental", inicio: "2026-10-10T15:00:00Z", tamanhoGB: 0.21, duracaoMin: 2, destino: "sa-east-1 + us-east-1", status: "ok" },
  { id: "k6", tipo: "completo", inicio: "2026-10-10T03:00:00Z", tamanhoGB: 3.38, duracaoMin: 12, destino: "sa-east-1", status: "ok" },
  { id: "k5", tipo: "incremental", inicio: "2026-10-09T15:00:00Z", tamanhoGB: 0.19, duracaoMin: 2, destino: "sa-east-1", status: "falhou" },
  { id: "k4", tipo: "completo", inicio: "2026-10-09T03:00:00Z", tamanhoGB: 3.35, duracaoMin: 11, destino: "sa-east-1", status: "ok" },
];

export type Metodo = "GET" | "POST" | "PATCH" | "DELETE";
export type Endpoint = { id: string; metodo: Metodo; rota: string; p95: number; erroPct: number; rpm: number; auth: "sessão" | "pública" | "assinatura"; limite: string };
export const ENDPOINTS: Endpoint[] = [
  { id: "r1", metodo: "GET", rota: "/api/v1/feed", p95: 1910, erroPct: 0.4, rpm: 310, auth: "sessão", limite: "120/min" },
  { id: "r2", metodo: "GET", rota: "/api/v1/contents/:slug", p95: 180, erroPct: 0.1, rpm: 520, auth: "pública", limite: "300/min" },
  { id: "r3", metodo: "POST", rota: "/api/v1/progress", p95: 240, erroPct: 0.2, rpm: 190, auth: "sessão", limite: "60/min" },
  { id: "r4", metodo: "POST", rota: "/api/v1/checkins", p95: 310, erroPct: 1.6, rpm: 44, auth: "sessão", limite: "20/min" },
  { id: "r5", metodo: "POST", rota: "/api/v1/uploads/assinar", p95: 95, erroPct: 0, rpm: 28, auth: "sessão", limite: "30/min" },
  { id: "r6", metodo: "POST", rota: "/api/webhooks/pagarme", p95: 130, erroPct: 0.3, rpm: 6, auth: "assinatura", limite: "-" },
  { id: "r7", metodo: "POST", rota: "/api/v1/auth/login", p95: 210, erroPct: 3.1, rpm: 37, auth: "pública", limite: "8/15min" },
];

export type Integracao = { id: string; nome: string; funcao: string; status: "ok" | "atencao" | "erro"; latenciaMs: number; chaveRotacionada: string; imagem: string };
export const INTEGRACOES_INICIAIS: Integracao[] = [
  { id: "i1", nome: "Pagar.me", funcao: "Assinaturas e Pix", status: "atencao", latenciaMs: 420, chaveRotacionada: "2026-03-02", imagem: "/img/celular.jpg" },
  { id: "i2", nome: "Firebase Cloud Messaging", funcao: "Push no Android", status: "ok", latenciaMs: 160, chaveRotacionada: "2026-09-28", imagem: "/img/android.jpg" },
  { id: "i3", nome: "Apple Push (APNs)", funcao: "Push no iOS", status: "ok", latenciaMs: 190, chaveRotacionada: "2026-09-28", imagem: "/img/iphone.jpg" },
  { id: "i4", nome: "Resend", funcao: "E-mails de acompanhamento", status: "ok", latenciaMs: 240, chaveRotacionada: "2026-08-11", imagem: "/img/notebook.jpg" },
  { id: "i5", nome: "Mux", funcao: "Streaming dos vídeos", status: "ok", latenciaMs: 210, chaveRotacionada: "2026-06-20", imagem: "/img/macbook.jpg" },
  { id: "i6", nome: "Sentry", funcao: "Erros de web, API e app", status: "erro", latenciaMs: 0, chaveRotacionada: "-", imagem: "/img/soc.jpg" },
];

export type Plataforma = "android" | "ios";
export type StatusBuild = "rascunho" | "enviado" | "revisao" | "aprovado" | "rejeitado";
export type Build = { id: string; plataforma: Plataforma; versao: string; numero: number; trilha: string; status: StatusBuild; enviadoEm?: string; nota?: string };
export const BUILDS_INICIAIS: Build[] = [
  { id: "bd1", plataforma: "android", versao: "1.9.0", numero: 58, trilha: "Teste interno", status: "aprovado", enviadoEm: "2026-10-10T16:00:00Z" },
  { id: "bd2", plataforma: "ios", versao: "1.9.0", numero: 41, trilha: "TestFlight", status: "rejeitado", enviadoEm: "2026-10-09T21:00:00Z", nota: "Guideline 5.1.1 - falta justificar o acesso à câmera e às fotos." },
  { id: "bd3", plataforma: "android", versao: "1.8.4", numero: 55, trilha: "Produção", status: "aprovado", enviadoEm: "2026-09-02T12:00:00Z" },
  { id: "bd4", plataforma: "ios", versao: "1.8.4", numero: 38, trilha: "App Store", status: "aprovado", enviadoEm: "2026-09-03T12:00:00Z" },
];

export type ItemChecklist = { id: string; plataforma: Plataforma | "ambas"; texto: string; feito: boolean };
export const CHECKLIST_INICIAL: ItemChecklist[] = [
  { id: "c1", plataforma: "ambas", texto: "API aponta para /api/v1 e versão mínima configurada", feito: true },
  { id: "c2", plataforma: "android", texto: "targetSdk 35 e permissões de notificação", feito: true },
  { id: "c3", plataforma: "android", texto: "AAB assinado com a chave de upload do Play App Signing", feito: true },
  { id: "c4", plataforma: "android", texto: "Formulário de segurança de dados atualizado", feito: false },
  { id: "c5", plataforma: "ios", texto: "PrivacyInfo.xcprivacy e textos de câmera/fotos", feito: false },
  { id: "c6", plataforma: "ios", texto: "Conta de teste para o revisor da Apple", feito: false },
  { id: "c7", plataforma: "ios", texto: "Capturas 6,9\" e 6,5\" com a nova trilha", feito: false },
  { id: "c8", plataforma: "ambas", texto: "Deep links (App Links / Universal Links) validados", feito: false },
];

export type Atividade = { id: string; quando: string; texto: string; tipo: "deploy" | "achado" | "backup" | "seguranca" | "mobile" | "api" };
export const ATIVIDADE_INICIAL: Atividade[] = [
  { id: "t1", quando: "2026-10-11T04:10:00Z", texto: "Restauração de teste do backup das 03:00 concluída em 14 min", tipo: "backup" },
  { id: "t2", quando: "2026-10-10T18:47:00Z", texto: "v2.14.3 em produção - progresso agora lê o usuário da sessão", tipo: "deploy" },
  { id: "t3", quando: "2026-10-10T16:00:00Z", texto: "Android 1.9.0 (58) aprovado no teste interno", tipo: "mobile" },
  { id: "t4", quando: "2026-10-09T21:30:00Z", texto: "iOS 1.9.0 (41) rejeitado: guideline 5.1.1", tipo: "mobile" },
  { id: "t5", quando: "2026-10-09T09:10:00Z", texto: "Chave do storage rotacionada e removida do repositório", tipo: "seguranca" },
];

// Utilitários de formatação
export const num = (n: number) => n.toLocaleString("pt-BR");
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).replace(".", "");
export const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "");
export const duracao = (s: number) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
export const tamanho = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} GB` : `${num(mb)} MB`);
export const semAcento = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Nota de prontidão para produção: parte de 100 e perde pontos por achado aberto, pesando a severidade
export function prontidao(achados: Achado[]) {
  const total = achados.reduce((s, a) => s + SEVERIDADES[a.severidade].peso, 0);
  const resolvido = achados.reduce((s, a) => s + (a.status === "resolvido" ? SEVERIDADES[a.severidade].peso : a.status === "andamento" ? SEVERIDADES[a.severidade].peso * 0.4 : 0), 0);
  return Math.round(28 + (resolvido / total) * 72);
}
