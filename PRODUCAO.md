# Verificação de produção

## Revisão em 2026-11-10 (2ª passada) — go-live Asaas produção

- **Chave live configurada** (`$aact_prod_...`, len 166) em `ASAAS_API_KEY` e `ASAAS_ENV=production` na Vercel (`curso-omotenashi`) + `.env` local. API live autenticada e verificada (listagem de webhooks da conta real).
- **Webhook live recriado**: antigo `5b6da23d-...` apontava para URL morta (`omotenashi.infinity-agency.online/api/asaas/webhook/`) — deletado; novo **id `d45a6850-f451-4de4-a960-815d0a2775c4`**, url `https://curso-omotenashi.vercel.app/api/webhooks/asaas`, events [PAYMENT_CONFIRMED, PAYMENT_RECEIVED], apiVersion 3, sendType NON_SEQUENTIALLY, `authToken` de 64 hex definido pelo painel (guardado em `ASAAS_WEBHOOK_SECRET` local + Vercel). Update via POST retorna 404 — recriação é DELETE+POST.
- **Smoke test em produção**: token correto → 200 `{"received":true}`; token errado → 400. Health OK. **E2E com cobrança real não foi executado** (criaria dinheiro real) — o fluxo completo já foi validado na homologação na 1ª passada.
- Conta live tem 5 webhooks (ComandaAI, Oriental, Rent a Family, Omotenashi, ERP) — todos do mesmo dono, sem conflito de eventos por URL distinta.
- Sandbox key (`$aact_hmlg_...`) substituída no `.env` — para voltar a homologar, gerar nova no sandbox ou restaurar de backup seguro.

## Revisão em 2026-11-10 — integração Asaas com PIX dinâmico e ativação automática

**Commits:** `bdd63a9` (feature) e `8e6c652` (fix autenticação do webhook), ambos em `master` e publicados.

- **Cadastro com PIX dinâmico Asaas**: `/api/register` valida CPF (zod + dígitos verificadores), cria cliente e cobrança PIX no Asaas (`lib/asaas/asaas.ts`), persiste `asaasPaymentId` + `pixPayload` dinâmico no `PendingRegistration` e envia `invoiceUrl` no email. Fallback para PIX estático da chave central se a API Asaas falhar.
- **Ativação automática via webhook** (`/api/webhooks/asaas`): eventos `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED` criam o User em transação, consomem o pending, registram Payment (`asaasId`), sincronizam acesso ao curso e enviam email de verificação. Idempotente.
- **⚠️ Correção importante na autenticação do webhook**: o Asaas **não assina o payload com HMAC** — ele envia o `authToken` configurado no webhook no header `asaas-access-token` (docs oficiais + hookdeck). A implementação anterior (`asaas-signature` HMAC) nunca receberia entrega real do Asaas. Substituída por `validarTokenWebhook` (comparação em tempo constante via hash). POST do webhook no Asaas **exige** `"interrupted": false` no body (senão 400 `invalid_poolInterrupted`); o `authToken` enviado no POST é ignorado quando o Asaas gera o próprio — solução: recriar o webhook e usar o token da resposta.
- **Dois projetos Vercel no time**: `omotenashi` (deploy CLI, protegido, alias `omotenashi-vert`) e **`curso-omotenashi` (produção real, deploy via GitHub push)** servindo `curso-omotenashi.vercel.app`. Env vars de runtime devem ser configuradas **no projeto `curso-omotenashi`** — o CLI local agora está linkado a ele (`.vercel/project.json`). Misturar os dois faz variáveis "irem ao ar".
- **Bancos diferentes**: o `DATABASE_URL` do `.env` local NÃO é o banco de produção do `curso-omotenashi` (verificado empiricamente: pending criado em produção não aparece na conexão local). Limpeza de dados de produção deve usar as rotas admin (`/api/admin/users` DELETE, `/api/admin/payments` DELETE) com sessão admin.
- **Webhook Asaas (sandbox/homologação)**: id `6d5d69c3-1012-4f95-9012-327252051fad`, url `https://curso-omotenashi.vercel.app/api/webhooks/asaas`, events [PAYMENT_CONFIRMED, PAYMENT_RECEIVED], apiVersion 3, sendType NON_SEQUENTIALLY, `authToken` próprio (`whsec_...`, 54 chars, guardado em `ASAAS_WEBHOOK_SECRET` local + Vercel/curso-omotenashi).
- **Teste E2E real executado em produção**: registro com CPF válido → PIX dinâmico Asaas (`pix-h.asaas.com`) criado; cobrança marcada como recebida no sandbox (`receiveInCash`) → Asaas entregou o webhook real → conta ativada (User criado, pending consumido, Payment registrado, login bloqueado apenas pela verificação de email — comportamento desenhado). Dados de teste removidos em seguida via rotas admin. Smoke: token correto → 200 `{"received":true}`, token errado/ausente → 400.
- **Domínio Resend verificado** ✅ (`infinity-agency.online`, id `d0010ae7-...`): emails transacionais (verificação/PIX) saem do domínio próprio. Duplicata antiga (`2aaf4c59-...`, sa-east-1) ainda no painel — remoção opcional.
- Migration `20261110090000_add_cpf_asaas_to_pending_registration` aplicada em produção (via `vercel-build` → `prisma migrate deploy`). `npm test`: 41/41. Typecheck limpo.
- **Antes de cobrar clientes reais**: trocar `ASAAS_API_KEY` por chave live, `ASAAS_ENV=production` (senão BASE continua no sandbox), e recriar o webhook na conta live do Asaas com o mesmo fluxo (POST com `interrupted:false`, guardar o `authToken` da resposta em `ASAAS_WEBHOOK_SECRET` do projeto `curso-omotenashi`).
- Pendências conhecidas: Zod 3.25.76 com vuln high (fix requer migração para v4 — adiado), código morto mantido por decisão (`src/lib/asaas.ts`, `lib/asaas/pix-payments.ts` — este último atualizado para usar `validarTokenWebhook`).

## Revisão em 2026-11-09 — verificação de email no cadastro

- **Novo fluxo de verificação de email** (commits pendentes deste dia): conta só entra depois de clicar no link enviado por email (token SHA-256 de 64 hex, expira em 24h, tabela `VerificationToken` já existente). Contas antigas foram marcadas como verificadas pela migration `20261105170000_verify_existing_emails`.
- **Login auto-recupera**: se o dono da conta (senha correta) tentar entrar sem email verificado e não existir token válido, o sistema reemite e reenvia o link automaticamente.
- Hardening desta passada: escape de HTML no email de pagamento (anti-injeção de markup no nome), timeout de 5s + guard de API key no sync do ERP, chave PIX centralizada em `lib/pix.ts` (`PIX_KEY`), fallback de URL base corrigido para `curso-omotenashi.vercel.app`, e tratamento de erro no `/api/auth/verify-email` (usuário deletado → 400 limpo em vez de 500).
- `npm run typecheck`: passou. `npm test`: 25/25.
- **Pendente (configuração, não código):** verificação do domínio no Resend continua pendente no DNS (GoDaddy) — sem ela, o email de verificação/PIX pode não ser entregue e o link cai no log de runtime. Ver `LAUNCH-READINESS-REPORT.md` item 2.

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

## Conciliação automática (cron)

A Vercel dispara diariamente `GET /api/cron/conciliacao` às 09:00 UTC (06:00 BRT), autenticado por `Authorization: Bearer $CRON_SECRET` (env na Vercel e no `.env`). A rota confere no Asaas cada cadastro pendente com PIX dinâmico, ativa os pagos que o webhook não processou, reporta conflitos (e-mail já possui conta) e erros de API, e envia ao admin um e-mail diário de heartbeat (`ADMIN_ALERT_EMAIL`, com fallback para `ADMIN_USERNAME`) — assunto `[Ação necessária]` quando há pendências. Silêncio = tudo em ordem. Cadastros de PIX estático continuam exigindo o código manual em `/admin/ativacoes`.

## Selo Omotenashi (certificação corporativa)

**Commit:** `2719621` — `feat(selo): certificacao Omotenashi com admin, verificacao publica, PDF e checkout PIX`.

- **Modelos**: `Certification` (tier, status `treinando|avaliacao|certificado|vencido|suspenso`, `verifyCode` único no formato `OMO-XXXX-XXXX`, `issuedAt`, `expiresAt`, notas) e `PendingCertification` (intenção de compra: empresa, e-mail único, CNPJ, tier, valor, `asaasPaymentId`, payload PIX). Relation `Company.certifications`. Migration `20261110150000_add_certification_selo` aplicada em produção pelo `vercel-build` (`prisma migrate deploy`).
- **Admin `/admin/selo`** (menu "Rede → Selo"): lista certificações com nível, status, validade e dias restantes, cria/edita status, renova (`+1 ano` → status certificado + `issuedAt` agora + `expiresAt` +365d), edita notas, copia o código público, links para `/selo/verificar/<código>` e `/api/certificados/<código>`, e exibe as compras aguardando pagamento (badge PIX dinâmico/estático).
- **Verificação pública `/selo/verificar/<código>`**: página server-side com estados "Certificação válida", "vencida", "em andamento" (treinando/avaliação) e "não encontrada"; exibe empresa, nível, situação e período de validade.
- **Certificado `/api/certificados/<código>`**: PDF A4 paisagem (pdf-lib, WinAnsi), moldura dupla, empresa, nível, período, código e link público de verificação. Emitido apenas para certificações com status `certificado` (404 caso contrário).
- **Checkout `/selo/checkout` + `/api/selo/checkout`**: seleção de nível (Prata R$ 1.497 / Ouro R$ 2.497 / Diamante R$ 3.200), empresa, CNPJ (dígitos verificadores validados) e e-mail corporativo; PIX dinâmico no Asaas (`externalReference` = id do pending) com fallback para o PIX estático central e envio do e-mail com o QR. Pendência existente para o mesmo e-mail é bloqueada. A landing `/selo` aponta o CTA principal para o checkout e mantém o WhatsApp como secundário.
- **Ativação**: webhook Asaas (`PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED`) → sem `PendingRegistration` busca `PendingCertification` por `asaasPaymentId`/`externalReference` → `ativarCertificacao` em transação (cria ou reaproveita a `Company`, cria `Certification` em `treinando`, consome o pending, registra `Payment` com `plan = selo-<tier>`). Idempotente: o pending é removido na transação.
- **Cron**: além do curso, concilia as compras de selo (pagas → ativam; não pagas → aguardando; falhas → erros), marca como `vencido` o selo certificado com validade vencida e lista os que vencem em até 30 dias. O e-mail diário ganhou a seção "Selo Omotenashi".
- **Smoke em produção (2026-11-10)**: migration aplicada (`/api/admin/certifications` → 200), criação de certificação via admin → código `OMO-XXXX-XXXX` gerado, página pública exibindo "Certificação válida", PDF `application/pdf` válido com o texto esperado, cron 200 com o bloco `selos`, checkout inválido → 400 sem criar cobrança. Registros de teste removidos ao final (empresa e certificação).
- **Não validado**: compra real de selo (criaria cobrança live no Asaas). O primeiro pagamento PIX de um selo deve ser feito em ambiente controlado e conferido no painel do Asaas.

## Limites da validação

Não houve deploy, cobrança externa, alteração do banco real nem teste visual. Passar build e testes não elimina os bloqueadores acima. Permanecem avisos de depreciação de middleware e de z-index no gerador de imagem; não impediram a compilação. A pasta agora tem repositório Git local (sem remote configurado).
