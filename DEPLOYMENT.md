# Deployment Guide - Omotenashi Vercel

## Checklist de Produção

### ✅ Correções Aplicadas (24 Jun 2026)

1. **Import ArrowRight** - Corrigido em `app/dashboard/certificado/page.tsx`
   - Adicionado ArrowRight ao import de lucide-react
   
2. **Stripe API Version** - Atualizado em `lib/stripe.ts`
   - De: `2024-11-20.acacia` → Para: `2025-02-24.acacia`
   - Versão compatível com Stripe SDK 17.7.0

3. **Type Checking** - Validação com `tsc --noEmit` ✓ PASSED

### 🔍 Validações Executadas

- [x] TypeScript: Sem erros (`tsc --noEmit` OK)
- [x] Prisma Schema: Válido e pronto
- [x] Vercel config: vercel.json presente e correto
- [x] Environment variables: .env configurado
- [x] Projeto linkado ao Vercel: ✓ (projectId presente)

### 🚀 Build Status

Build Next.js em progresso... Aguarde conclusão.

### 📋 Variáveis de Ambiente Necessárias

Configurar no Vercel Dashboard (Settings → Environment Variables):

```
DATABASE_URL=postgresql://...@*.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=<gerar-novo-secret>
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 🔐 Segurança

- [x] .env não commitado
- [x] .gitignore configurado
- [x] Secrets não em código-fonte
- [x] NextAuth com HTTPS enforcement

### 📦 Dependências

```
npm list | grep -E "(next|react|@auth|prisma|stripe)@"
- next@14.2.21
- react@18.3.1
- @auth/prisma-adapter@2.7.4
- @prisma/client@6.19.3
- stripe@17.7.0
```

Prisma pode ser atualizado para 7.8.0 (major version) em upgrade futuro.

### 🌐 Domínio Vercel

Projeto ID: `prj_iTxJSRJFU1XHFhKIMBjMPVVnr6mz`
Org ID: `team_Jqoz8bZhdcB8hcK4o2YPHwYs`

### 📝 Build Command

```bash
npx prisma generate && npx prisma db push --accept-data-loss && next build
```

### ✨ Deploy Procedure

1. **Local Build Verification** (em progresso)
   ```bash
   npm run build
   ```

2. **Git Push**
   ```bash
   git add .
   git commit -m "Production ready - type fixes and Stripe API update"
   git push origin main
   ```

3. **Vercel Auto-Deploy**
   - Webhook automático ativa build no Vercel
   - Prisma migrations automáticas executadas
   - Next.js build otimizado para produção

4. **Verificações Pós-Deploy**
   - [ ] Health check: `https://seu-dominio.vercel.app/api/health`
   - [ ] Auth flow: Login e registro funcionando
   - [ ] Database: Conexão com Neon PostgreSQL OK
   - [ ] Stripe: Webhooks recebindo eventos
   - [ ] Performance: Lighthouse score > 80

### 🛠️ Troubleshooting

Se build falhar no Vercel:

1. Verificar logs: `vercel logs --prod`
2. Revalidar environment variables
3. Testar Prisma: `npx prisma db push`
4. Limpar build cache: `vercel cache rm`
5. Redeploy: `vercel deploy --prod`

### 📞 Suporte

- Docs Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://next-auth.js.org
# Deploy trigger Thu Jun 25 19:36:24 -03 2026
