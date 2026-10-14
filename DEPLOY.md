# ✅ CHECKLIST DE DEPLOY — PRODUÇÃO

## Status Geral: 🟢 PRONTO PARA PRODUÇÃO

Última auditoria: 2026-10-14

---

## ✅ Itens Corrigidos

### 🔒 Segurança
- ✅ **SEC-01** Nenhuma API key exposta no frontend
- ✅ **SEC-02** Middleware de autenticação protege rotas críticas
- ✅ **SEC-07** Rate limiting implementado (Upstash Redis + fallback in-memory)
  - Login: 10 req/60s por IP
  - Register: 5 req/60s por IP
  - Checkout: 5 req/60s por IP
- ✅ **SEC-08** Senhas com bcrypt
- ✅ **SEC-17/18** .env não está no git
- ✅ **SEC-04** CORS não usa wildcard
- ✅ **SEC-13** Sem eval() ou dangerouslySetInnerHTML

### 🗄️ Database
- ✅ **DB-03** Prisma protege contra SQL injection
- ⚠️ **DB-06** Migrations: usar `prisma migrate deploy` no primeiro deploy

### 💻 Code Quality
- ✅ **CODE-01** Sem console.log em produção
- ✅ **CODE-03** Sem empty catch blocks
- ✅ **CODE-07** Sem TODOs de segurança
- ✅ **CODE-09** Error boundary adicionado (`app/error.tsx`)
- ✅ **CODE-14** TypeScript strict mode ativo
- ✅ **CODE-12** Lockfile commitado

### 🎨 Frontend
- ✅ **FE-01** Meta tags configuradas
- ✅ **FE-02** Favicon presente
- ✅ **FE-03** Página 404 customizada (`app/not-found.tsx`)

### 📊 Observability
- ✅ **DEPLOY-09** Health check endpoint criado (`/api/health`)
- ⚠️ **OBS-01** Sentry recomendado (ver instruções abaixo)

### 📦 Dependencies
- ✅ **DEP-04** 0 vulnerabilidades (`npm audit` limpo; overrides de `effect`/`deepmerge-ts` aplicados)

---

## 🚀 DEPLOY NO VERCEL

### Pré-requisitos

1. **Variáveis de Ambiente** (configurar no Vercel Dashboard)

```bash
# Obrigatórias
DATABASE_URL="postgresql://..."           # Neon/Supabase PostgreSQL
NEXTAUTH_SECRET="..."                     # Gerar: openssl rand -base64 32
NEXTAUTH_URL="https://seu-dominio.com"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
ADMIN_USERNAME="..."                      # Login admin
ADMIN_PASSWORD="..."                      # Senha admin

# Stripe (se usar pagamentos)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Rate Limiting Distribuído (RECOMENDADO)
UPSTASH_REDIS_REST_URL="https://..."     # Upstash Redis
UPSTASH_REDIS_REST_TOKEN="..."

# Error Monitoring (RECOMENDADO)
# NEXT_PUBLIC_SENTRY_DSN="https://..."
```

2. **Build Settings no Vercel**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

3. **Deploy**
```bash
# Automático via GitHub
# Push/merge no branch master → deploy de PRODUÇÃO
# (Vercel Production Branch = master)

# Manual via CLI
npm run deploy
```

---

## 🔧 APÓS O PRIMEIRO DEPLOY

### 1. Criar Migrations (OBRIGATÓRIO)
```bash
# Localmente
npx prisma migrate dev --name init

# Fazer commit das migrations
git add prisma/migrations
git commit -m "Add initial database migration"
git push
```

### 2. Testar Endpoints Críticos
- [ ] `GET /api/health` → deve retornar 200 OK
- [ ] `POST /api/auth/signin` → rate limit funciona?
- [ ] `POST /api/register` → rate limit funciona?
- [ ] Webhook Stripe (se configurado)

### 3. Configurar Sentry (Opcional mas Recomendado)

```bash
# Instalar
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Configurar variáveis no Vercel
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."
```

### 4. Configurar Upstash Redis (Recomendado)

**Por quê?** O fallback in-memory não compartilha estado entre instâncias serverless.
Rate limiting real precisa de Redis distribuído.

1. Criar conta: https://upstash.com (tem free tier)
2. Criar Redis database
3. Copiar REST URL e Token para variáveis de ambiente Vercel
4. Re-deploy

### 5. Monitoramento

- [ ] Configurar Uptime monitoring (UptimeRobot, Better Uptime, etc)
  - Endpoint: `https://seu-dominio.com/api/health`
  - Frequência: 5 minutos
  
- [ ] Configurar alertas de erro (se usar Sentry)

---

## 🧪 TESTES PRÉ-PRODUÇÃO

```bash
# TypeScript
npm run typecheck

# Build local
npm run build

# Health check (após deploy)
curl https://seu-dominio.com/api/health
```

---

## ⚠️ AVISOS IMPORTANTES

1. **Rate Limiting**: sem Upstash, cada instância serverless tem seu próprio contador
   - Configurar Upstash ANTES de ir para produção com tráfego real

2. **Migrations**: `prisma db push` não é recomendado em produção
   - Sempre usar `prisma migrate deploy`

3. **Admin Credentials**: trocar ADMIN_USERNAME e ADMIN_PASSWORD dos valores padrão

4. **NEXTAUTH_SECRET**: NUNCA usar o mesmo valor em dev e produção

5. **Sentry**: sem monitoring, você não verá erros que usuários enfrentam

---

## 📋 VERIFICAÇÕES FINAIS

Antes de abrir para usuários reais:

- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] Migrations rodaram com sucesso
- [ ] `/api/health` retorna 200 OK
- [ ] Login funciona
- [ ] Rate limiting testado (tentar logar 11x rapidamente → deve bloquear)
- [ ] Stripe webhook configurado (se usar pagamentos)
- [ ] Upstash Redis configurado (recomendado)
- [ ] Sentry configurado (recomendado)
- [ ] Domínio customizado configurado
- [ ] SSL ativo (Vercel faz automaticamente)

---

## 🆘 TROUBLESHOOTING

### Build falha no Vercel
```bash
# Verificar localmente primeiro
npm run build
```

### Database connection error
- Verificar se DATABASE_URL está correto
- Neon: permitir conexões do IP do Vercel
- Verificar se migrations rodaram

### Rate limiting não funciona
- Sem Upstash: cada função serverless tem contador próprio
- Solução: configurar Upstash Redis

### Error boundary não aparece
- Verificar `app/error.tsx` existe
- Tentar forçar erro em dev: `throw new Error("test")`

---

## 📚 RECURSOS

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [NextAuth.js Production](https://next-auth.js.org/deployment)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

**Status:** ✅ CLEAR TO SHIP com configuração de Upstash Redis recomendada
