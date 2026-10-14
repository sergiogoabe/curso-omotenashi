# ✅ CHECKLIST PRÉ-DEPLOY - OMOTENASHI

**Data:** _________  
**Responsável:** _________

---

## 🔐 VARIÁVEIS DE AMBIENTE

Configure no Vercel Dashboard antes do deploy:

```
[ ] DATABASE_URL (Neon/Supabase PostgreSQL)
[ ] NEXTAUTH_SECRET (gerar com: openssl rand -base64 32)
[ ] NEXTAUTH_URL (https://seu-dominio.vercel.app)
[ ] NEXT_PUBLIC_APP_URL (https://seu-dominio.vercel.app)
[ ] ADMIN_USERNAME (trocar do padrão!)
[ ] ADMIN_PASSWORD (trocar do padrão!)
```

### Stripe (se usar pagamentos)
```
[ ] STRIPE_SECRET_KEY
[ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
[ ] STRIPE_WEBHOOK_SECRET
```

### Rate Limiting (RECOMENDADO)
```
[ ] UPSTASH_REDIS_REST_URL
[ ] UPSTASH_REDIS_REST_TOKEN
```

### Error Monitoring (RECOMENDADO)
```
[ ] NEXT_PUBLIC_SENTRY_DSN
[ ] SENTRY_AUTH_TOKEN
[ ] SENTRY_ORG
[ ] SENTRY_PROJECT
```

---

## 🧪 TESTES LOCAIS

Rodar antes de fazer push:

```bash
[ ] npm run typecheck   # TypeScript compila?
[ ] npm run build       # Build funciona?
```

---

## 🗄️ DATABASE

```
[ ] Database criado (Neon/Supabase)
[ ] DATABASE_URL configurado no Vercel
[ ] Migrations criadas: npx prisma migrate dev --name init
[ ] Migrations commitadas no git
```

---

## 🚀 DEPLOY

```
[ ] Código commitado no git
[ ] Push para GitHub/GitLab
[ ] Projeto importado no Vercel
[ ] Variáveis de ambiente configuradas
[ ] Deploy iniciado
```

---

## ✅ PÓS-DEPLOY

Testar esses endpoints:

```
[ ] https://seu-dominio.com/api/health → 200 OK?
[ ] https://seu-dominio.com → carrega?
[ ] https://seu-dominio.com/auth/login → login funciona?
```

### Testar Rate Limiting
```
[ ] Tentar login 11x rápido → bloqueia na 11ª?
[ ] Mensagem: "Muitas tentativas..."
```

### Testar Autenticação
```
[ ] Login com admin funciona?
[ ] Acesso a /admin funciona?
[ ] Acesso a /curso funciona?
[ ] Logout funciona?
```

---

## 📊 MONITORAMENTO

```
[ ] Uptime monitoring configurado (UptimeRobot/Better Uptime)
    - URL: https://seu-dominio.com/api/health
    - Frequência: 5 minutos
    
[ ] Sentry configurado (se instalado)
    - Testar erro proposital
    - Verificar se aparece no Sentry dashboard

[ ] Vercel Analytics ativo (opcional)
```

---

## 🔧 CONFIGURAÇÕES OPCIONAIS

```
[ ] Domínio customizado configurado
[ ] SSL ativo (automático no Vercel)
[ ] Redirects configurados (www → apex, etc)
[ ] Stripe webhook configurado (se usar)
```

---

## ⚠️ SEGURANÇA FINAL

```
[ ] .env NÃO está no git
[ ] ADMIN_USERNAME trocado do padrão
[ ] ADMIN_PASSWORD forte e trocado do padrão
[ ] NEXTAUTH_SECRET único (não reusar de dev)
[ ] Upstash Redis configurado (rate limiting real)
```

---

## 📝 NOTAS

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

**Status Final:** [ ] APROVADO PARA PRODUÇÃO

**Assinatura:** ________________  **Data:** ________
