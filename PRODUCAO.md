# Verificação de produção

## Revisão em 2026-10-18

- Site publicado (`https://curso-omotenashi.vercel.app/`): HTTP 200.
- Health check publicado: HTTP 200, banco reportado como conectado (resposta em aproximadamente 880 ms).
- `npm test`: 25/25 antes desta revisão; `npm run typecheck`: passou.
- `npm run test:integration`: 15/15 com PostgreSQL isolado, sem pagamentos externos.
- `npm run build`: o wrapper `npx prisma generate` falhou no Termux (`sh: 1: prisma: not found`). Executados diretamente os mesmos estágios: `node node_modules/prisma/build/index.js generate` gerou o Prisma Client e `node node_modules/next/dist/bin/next build --webpack` concluiu o build. O Next reportou apenas os avisos de middleware legado e `z-index` não suportado. O build do commit pela pipeline da Vercel não foi verificado.
- `npm audit --omit=dev`: indisponível porque o endpoint de auditoria do npm falhou; não interpretar como auditoria limpa.
- Ajustado o endpoint público de health para não expor ambiente nem mensagem interna do banco em falha.

**Decisão:** o ambiente publicado responde, mas produção real não está completamente validada. Antes de considerar o fluxo comercial pronto, confirmar na Vercel/Stripe que chaves secret/publicável/webhook são todas live e do mesmo modo, conferir migrations aplicadas no banco publicado, e executar um checkout de homologação controlado. Nenhuma cobrança, deploy ou alteração ao banco publicado foi executada nesta revisão.

## Status desta passada (hardening para produção)

Aplicado no código (build, typecheck e 25/25 testes passando):

- **Rate limiting de aplicação implementado** em `lib/rate-limit.ts`: função `rateLimit(identifier, {limit, windowSec, prefix})` com backend Upstash Redis REST (pipeline `INCR`/`EXPIRE NX`/`TTL`) quando `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` estão definidos; fallback para `Map` em memória caso contrário; fail-open em erro. Helpers `clientIp(headers)` e `tooMany(retryAfter)` (Response 429 com `Retry-After`).
- **Ligado nos endpoints sensíveis** (todos com `export const runtime = "nodejs"`): login (`lib/auth.ts` authorize, 10/60s, IP via `x-forwarded-for`/`x-real-ip` do req NextAuth), register (5/60s), ativar (10/60s), stripe/checkout (5/60s). `enroll` não recebeu (admin-only).
- **Git inicializado** na pasta (commit snapshot inicial). `.gitignore` já cobria `.env`, `node_modules`, `.next`, `.vercel`.
- **Env vars de produção conferidas na Vercel** (`infinity-agency/curso-omotenashi`): presentes `DATABASE_URL` (+UNPOOLED), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_PIX_KEY`, `ADMIN_USERNAME/PASSWORD`, `MUX_*`.

Ainda pendente (ação externa, fora do código):

- **Upstash configurado na Vercel Production** ✅ (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, testados com `SET`/`GET`/`DEL`). Rate limiting agora é distribuído entre instâncias serverless.
- **⚠️ Chaves Stripe inconsistentes.** As chaves fornecidas na revisão estavam misturadas: `sk_test_` + `rk_test_` (modo TESTE) com `pk_live_` (modo PRODUÇÃO). Secret de teste não opera com publishable de produção e `sk_test` não cobra pagamentos reais. **Não foi sobrescrito** o `STRIPE_SECRET_KEY` da Vercel para não quebrar um possível live existente. Confirmar que Production usa `sk_live_` + `pk_live_` do mesmo modo.
- Validar valores (Hidden) de `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` (domínio HTTPS definitivo).
- Homologação Stripe real, teste visual, e os demais itens abaixo.

## Comandos de validação

- `npm test`: regressões de validação, PIX, login e pagamento com dependências simuladas.
- `npm run typecheck`: TypeScript do projeto completo.
- `npm run build`: artefato Next.js de produção, com geração do Prisma Client.
- `npm run test:integration`: HTTP real contra o artefato compilado e PostgreSQL temporário. Requer `initdb` e `pg_ctl` no PATH. Cria e encerra instâncias isoladas; não usa o DATABASE_URL configurado. O esquema SQL é uma fixture baseada no schema deste projeto, não um sistema de migrations. Eventos Stripe são fixtures assinadas localmente, não pagamentos externos.

## Bloqueadores antes de publicar

1. Disponibilizar o PostgreSQL do ambiente e validar sua estrutura. A execução local com a configuração existente encontrou banco inacessível em `127.0.0.1:5432`. A suíte isolada não prova conectividade com o banco real.
2. Conferir no provedor as variáveis DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_BASE_URL, STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET. Usar o domínio HTTPS definitivo nas URLs. Não colocar valores secretos neste documento.
3. Aplicar limitação distribuída de tentativas de login, cadastro, checkout e ativação. **Rate limiting de aplicação já implementado** (`lib/rate-limit.ts`), mas exige `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` na Vercel para ser distribuído; sem elas o contador em memória não resolve em Vercel/serverless. Alternativamente, WAF na borda.
4. Realizar pagamento de homologação na Stripe e verificar os eventos `checkout.session.completed` e `checkout.session.async_payment_succeeded`, assinatura, retorno e criação de conta. Eventos locais assinados validam o código, não a integração externa.
5. Verificar visualmente cadastro/login em navegador desktop e celular. O HTML foi testado via HTTP; automação visual não estava disponível no Termux.
6. Revisar os alertas de dependências antes da liberação. A auditoria executada reportou 11 itens: 9 altos e 2 moderados, nas cadeias Tailwind/PostCSS e Prisma CLI (`braces`, `postcss-selector-parser`, `deepmerge-ts`, `effect` e dependentes). O Next.js foi atualizado para 16.3.8; `source-map-js` recebeu atualização compatível. Não foi aplicada migração forçada para Tailwind 4 nem downgrade que removeria o motor Prisma compatível com Android. Essas bibliotecas participam do build: restringir entradas/configurações a código confiável não equivale a uma auditoria limpa. Reavaliar versões corrigidas ou fazer migração dedicada antes de aceitar os riscos.

## Pagamentos e dados legados

- O checkout antigo enviava senha em texto puro nos metadados da Stripe. Novos checkouts enviam somente identificador do cadastro e dados do plano; o hash bcrypt fica no banco.
- Se houve utilização do fluxo antigo, avaliar as contas afetadas, remover os metadados sensíveis quando permitido e orientar troca de senha. Nenhum dado remoto foi inspecionado ou alterado nesta revisão.
- Checkouts legados sem `registrationId` precisam de conciliação manual. A aplicação não cria mais conta com senha padrão.
- O PIX direto é estático e depende de confirmação manual e envio manual do código de ativação pelo administrador. O aplicativo não possui entrega automática de email para esse fluxo.
- Checkouts expirados exigem atendimento/reinício controlado; cadastros pendentes não são sobrescritos com outra senha.
- O relatório empresarial foi restringido a administradores vinculados à empresa ativa. Não existe papel separado de gestor no projeto; não conceder papel global de admin a gestores para contornar esse bloqueio. Implementar autorização empresarial específica caso o painel precise ser disponibilizado a clientes.

## Banco e deploy

O build da Vercel executa `npm run build`, sem alterar automaticamente o banco. Não rodar `db:push` indiscriminadamente em produção. Fazer backup e revisar alterações de estrutura separadamente; o script não utiliza mais `--accept-data-loss`.

O Prisma usa `engineType = "client"` e o adaptador PostgreSQL JavaScript. Isso elimina a incompatibilidade do binário nativo observada no Android. A mudança do generator não adiciona tabelas.

Os endpoints de seed estão desabilitados em produção e não devem ser usados para inicializar um ambiente publicado.

## Limites da validação

Não houve deploy, cobrança externa, alteração do banco real nem teste visual. Passar build e testes não elimina os bloqueadores acima. Permanecem avisos de depreciação de middleware e de z-index no gerador de imagem; não impediram a compilação. A pasta agora tem repositório Git local (sem remote configurado).
