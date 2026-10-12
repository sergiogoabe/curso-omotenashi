# Verificação de produção

## Comandos de validação

- `npm test`: regressões de validação, PIX, login e pagamento com dependências simuladas.
- `npm run typecheck`: TypeScript do projeto completo.
- `npm run build`: artefato Next.js de produção, com geração do Prisma Client.
- `npm run test:integration`: HTTP real contra o artefato compilado e PostgreSQL temporário. Requer `initdb` e `pg_ctl` no PATH. Cria e encerra instâncias isoladas; não usa o DATABASE_URL configurado. O esquema SQL é uma fixture baseada no schema deste projeto, não um sistema de migrations. Eventos Stripe são fixtures assinadas localmente, não pagamentos externos.

## Bloqueadores antes de publicar

1. Disponibilizar o PostgreSQL do ambiente e validar sua estrutura. A execução local com a configuração existente encontrou banco inacessível em `127.0.0.1:5432`. A suíte isolada não prova conectividade com o banco real.
2. Conferir no provedor as variáveis DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_BASE_URL, STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET. Usar o domínio HTTPS definitivo nas URLs. Não colocar valores secretos neste documento.
3. Aplicar limitação distribuída de tentativas de login, cadastro, checkout e ativação (WAF ou armazenamento compartilhado). Não há proteção de força bruta implementada no aplicativo; contador em memória não resolve em Vercel/serverless.
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

Não houve deploy, cobrança externa, alteração do banco real nem teste visual. A pasta não contém repositório Git. Passar build e testes não elimina os bloqueadores acima. Permanecem avisos de depreciação de middleware e de z-index no gerador de imagem; não impediram a compilação.
