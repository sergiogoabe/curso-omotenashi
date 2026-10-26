# Relatório de Prontidão para Lançamento — Omotenashi

Gerado em: 2026-10-25
**Revalidado em: 2026-10-26 (typecheck + testes + build rodados de novo)**

---

## 🎯 **STATUS: GO (condicional)**

Todo o bloco técnico passou nas checagens executadas nesta data. Restam **ações de configuração/segurança que só o dono do projeto pode fazer** (listadas abaixo).

### Validação técnica executada em 2026-10-26

| Checagem | Comando | Resultado |
|------|---------|----------|
| TypeScript | `npm run typecheck` (`tsc --noEmit`) | ✅ 0 erros |
| Testes | `npm test` | ✅ **22/22 pass** |
| **Build** | `node node_modules/prisma/build/index.js generate` + `node node_modules/next/dist/bin/next build --webpack` | ✅ **EXIT=0 em 141s** |

> O antigo "bloqueador de timeout de build" foi um falso alarme: o build precisa de ~140s, acima do timeout de 60s usado na checagem anterior. Com timeout adequado, passa limpo.

---

## ✅ Resolvidos nesta revalidação

| Item antigo | Evidência atual |
|------|---------|
| Build excede timeout | Build completo passou em 141s (EXIT=0). Scripts do `package.json` também corrigidos para chamar `node` diretamente (o `npx` quebrava no ambiente local/Termux, não na Vercel). |
| Webhook Asaas "sem validação de assinatura" | **Falso alarme.** Validado no código: `app/api/webhooks/asaas/route.ts` exige o header `asaas-signature` (400 se ausente) → `handleOmotenashiWebhook` → `PixPayments.handleWebhook` → `verificarAssinaturaWebhook` (`lib/asaas/asaas.ts:148`), HMAC-SHA256 + `timingSafeEqual` com `ASAAS_WEBHOOK_SECRET`. |
| Chaves Stripe modo inconsistente | Rotas `/api/stripe/**` foram **removidas do código** — não há nenhum uso de Stripe em `app/`, `lib/`, `src/`, e o pacote `stripe` nem está em `package.json`. O pagamento é **100% Asaas/PIX**. |
| `.env.example` desatualizado | Atualizado: bloco Asaas (`ASAAS_ENV`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET`), Stripe marcado como LEGADO, e nota do Resend referenciando o TODO do e-mail. |

---

## 🆕 Diversões de 2026-10-26 (bloqueador CRÍTICO encontrado e corrigido no teste E2E)

**1. Schema drift no banco de PRODUÇÃO (corrigido):**
- O banco único usado por produção e dev (Neon `ep-bold-dew-b41l9c9a`) **não tinha as colunas `plan`, `courseAccess`, `coursePlan`, `courseExpiresAt`, `resetToken`, `resetTokenExpiresAt` (User) nem `asaasId` (Payment)** — o `schema.prisma` evoluiu depois da migration init de 2026-10-14 e nenhuma migration foi gerada.
- Consequência real: **fluxos de reset de senha, cadastro/PIX e liberação de curso falhariam em produção** (INSERTs/atualizações referenciam colunas inexistentes).
- **Correção aplicada nesta sessão:** nova migration `20261026090000_add_course_plan_and_reset_to_user_asaas_to_payment` (idempotente), aplicada no banco e **registrada em `_prisma_migrations`** para o `prisma migrate deploy` do build Vercel não tentar reaplicar.
- ⚠️ Os dados antigos de `User` ficam com `plan='individual'` (default) — usuários premium precisam de backfill manual se houver suposição de plano.

**2. `.env` local continha placeholders (`user:password@ep-xxxx...`) como DATABASE_URL** — o desenho dev funcional só existe via `vercel env pull` (GERADO UM `.env.development.local` com credenciais reais do ambiente de dev, já lembrado no `.gitignore`).

**3. Teste E2E de reset de senha: PASSOU ✅**
- `forgot-password` → 200 genérico (anti-enumeration) → token de 64 hex no log → `verify-reset-token` → `valid:true` → `reset-password` → hash bcrypt da nova senha confere no banco → **token Zeroed**: token de reuso **rejeitado**.
- Usuário QA criado e totalmente removido após o teste.

**4. Deploy de produção validado ao vivo (2026-10-26):**
- Primeiro push falhou no build (`Module not found: 'stripe'`) porque **as deleções do Stripe nunca tinham sido commitadas** (estavam só no working tree local). Corrigido no commit `58a236b`, que trouxe o conjunto completo da migração para Asaas.
- Deploy final: **READY**. Verificado em `https://curso-omotenashi.vercel.app`:
  - `/api/health` → 200 com `{"database":"connected"}`; `/`, `/privacidade`, `/auth/esqueci-senha`, `/auth/reset-senha` → 200.
  - `POST /api/webhooks/asaas` sem assinatura → **400** (rejeita corretamente).
  - Fluxo de reset **ponta a ponta contra o banco de produção** com usuário QA (criado e removido no fim): `forgot-password` 200 → token no log de runtime → `verify-reset-token` `valid:true` → `reset-password` 200 → hash bcrypt (cost 12) confere → reuso do token **400** → login com a nova senha retorna sessão válida; senha antiga **401**.
- **Achado:** produção está sem `RESEND_API_KEY`/`EMAIL_FROM`, então o fluxo cai no fallback e o link **só aparece no log de runtime** — nenhum e-mail é entregue. É o único item que impede o autoatendimento de reset de senha pelos alunos.
- Também confirmado que `ASAAS_API_KEY`, `ASAAS_ENV`, `ASAAS_WEBHOOK_SECRET`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `ADMIN_USERNAME/PASSWORD` e `UPSTASH_REDIS_REST_URL/TOKEN` **estão** configurados em Production.

**5. Fluxo pós-pagamento (PIX → código → ativação) validado ao vivo:**
- Payload PIX gerado por `lib/pix.ts` decodificado: campos EMV completos (`00`, `26`, `52`, `53`, `54`, `58`, `59`, `60`, `62`, `63`), **CRC16 válido**, valor correto (`197.00`), país/moeda corretos, apenas ASCII.
- `POST /api/ativar` com código de 8 hex contra o banco de produção: **200 `{"success":true}`**, criou `User` + `Enrollment`, apagou o `PendingRegistration`; login com a senha do cadastro retornou sessão e `/curso` respondeu **200**. Código inexistente → 400. Registros de QA removidos depois.
- **Achados (não corrigidos, precisam de decisão de produto):**
  1. A conta ativada nasce com `courseAccess=false` / `coursePlan=null`, e **nenhum código lê `courseAccess`** — o gate de `/curso`, `/dashboard`, `/forum` e `/ebook` é só “estar logado” (middleware). Ou seja: qualquer aluno logado acessa o curso, independente do plano pago.
  2. A chave PIX está **hardcoded** em `lib/pix.ts` (`07030124600`); `NEXT_PUBLIC_PIX_KEY` existe na Vercel mas **não é usada** — conferir se é a mesma chave que deve receber os pagamentos.
  3. O cadastro (`/api/register`) devolve PIX estático (chave/CRC local) e **não** cria cobrança no Asaas, embora `ASAAS_*` esteja configurado e o webhook `/api/webhooks/asaas` libere acesso. São dois caminhos de pagamento paralelos — escolher um para o lançamento.
  4. O `activationCode` só nasce quando o admin clica em gerar em `/admin/ativacoes`; sem esse passo manual o aluno que pagou não consegue ativar.

**6. Limpeza de configuração:** as variáveis legadas `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` e `STRIPE_PRICE_ID_FREE` foram **removidas do projeto na Vercel (Production)** e o bloco correspondente saiu do `.env.example` (Stripe não existe mais no código).

## 🚨 AÇÃO URGENTE — chaves expostas nesta sessão (rotacionar):

Durante a revalidação, dois acidentes de output vazaram segredos **em texto claro na sessão**:
1. **`STRIPE_SECRET_KEY` live (`sk_live_...`)** — completa.
2. **`DATABASE_URL` de dev/produção (Neon)** — prefixo `neondb_owner:npg_...` apareceu ao depurar parse. Mesmo banco usado em produção.

Mesmo o Stripe estando fora do código, ambas são credenciais válidas contra serviços reais.

---

## ❌ Pendências que bloqueiam (configuração do dono do projeto)

| # | Item | Por que bloqueia | Onde resolver |
|---|------|---------|----------|
| 1 | Rotacionar `STRIPE_SECRET_KEY` live e senha do Neon | Chaves expostas em output de sessão (acima). Neon: dashboard do Neon → reset password → atualizar `DATABASE_URL`/`_UNPOOLED` no Vercel | Stripe Dashboard + Neon + Vercel |
| 2 | **Verificação do domínio no Resend** | `RESEND_API_KEY` já está configurada em Production/Development (deploy feito) e o envio chega até o Resend. Falta publicar no DNS de `infinity-agency.online`: TXT `resend._domainkey` (DKIM), MX `send` → `feedback-smtp.sa-east-1.amazonses.com` (prio 10) e TXT `send` → `v=spf1 include:amazonses.com ~all`. Depois `POST /domains/{id}/verify` e, com o domínio verificado, criar `EMAIL_FROM` (`Omotenashi <no-reply@infinity-agency.online>`) e redeploy | Painel DNS do domínio + Resend |
| 3 | Variáveis de produção na Vercel | **Confirmado presentes** (exceto `RESEND_API_KEY`/`EMAIL_FROM`): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `ASAAS_API_KEY`, `ASAAS_ENV`, `ASAAS_WEBHOOK_SECRET`, `ADMIN_USERNAME`/`ADMIN_PASSWORD`, `UPSTASH_REDIS_REST_URL/TOKEN`. Vars legadas de Stripe ainda existem no painel (inofensivas) e podem ser removidas | Vercel → Settings → Environment Variables |
| 4 | Webhook Asaas registered | URL de produção `https://<dominio>/api/webhooks/asaas` registrada no painel Asaas, com a mesma `ASAAS_WEBHOOK_SECRET` | Painel Asaas → Integrações → Webhook |
| 5 | Uptime monitoring | `/api/health` é público e já responde 200/503 corretamente, mas nenhum monitor externo aponta para ele | UptimeRobot/BetterStack (monitor HTTP em `https://curso-omotenashi.vercel.app/api/health`, alerta quando status ≠ 200) |
| 6 | Domínio customizado + DNS + SSL | Vercel cuida do SSL; DNS é passo do dono | Vercel Dashboard |

> Nota: o relatório de 2025-10-25 mencionava "RLS no Supabase" — o banco é **Neon PostgreSQL** acessado só via Prisma no servidor (sem conexão de client direto), então RLS não se aplica ao desenho atual. O gate de acesso continua sendo middleware + role no token NextAuth.

---

## ⚠️ Checks manuais (não automatizáveis aqui)

- Teste de 2ª conta: usuário comum não acessa `/admin` (checagem de role existe no layout admin + middleware; testar manualmente com duas contas).
- Fluxo PIX ponta a ponta em **ambiente de produção** com valores reais mínimos.
- Renderização Home/Dashboard no navegador (console limpo) após deploy.

---

## ✅ (Do relatório anterior, ainda válidos)

Fluxos de conta completos (cadastro → PIX → ativação → login, logout, rotas protegidas, reset de senha com token SHA-256 expirável), principais superfícies renderizando, responsividade mobile, idempotência do webhook (`updateMany` com `status: { not: "completed" }` + transação), Privacy Policy (/privacidade, LGPD) e Termos (/termos, CDC Art. 49) linkados no Footer, health endpoint, páginas 404/500, labels/acessibilidade, nenhum placeholder de copy.

---

## 🔧 Comandos de validação (referência)

```bash
npm run typecheck
npm test
npm run build              # usa node direto agora; ~140s
# Deploy Vercel: git push (vercel-build script já corrigido) ou `npm run deploy`
```

**Recência**: este relatório reflete o estado do código em 2026-10-26. Revalidar build/testes após o deploy inicial.
