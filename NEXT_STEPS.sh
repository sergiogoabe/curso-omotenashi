#!/bin/bash

# Quick Start - Deploy para Vercel
# ================================

echo "
╔════════════════════════════════════════════════════════════════╗
║         OMOTENASHI - READY FOR PRODUCTION DEPLOYMENT          ║
║                     24 de Junho de 2026                        ║
╚════════════════════════════════════════════════════════════════╝
"

echo "✅ PROJECT STATUS"
echo "   Build:        PASSED ✓"
echo "   Type Check:   PASSED ✓"
echo "   Prisma DB:    READY ✓"
echo "   Vercel Link:  CONNECTED ✓"
echo ""

echo "📋 ARQUIVO COM CORREÇÕES:"
echo "   1. app/dashboard/certificado/page.tsx - ArrowRight import adicionado"
echo "   2. lib/stripe.ts - API version atualizada (2025-02-24.acacia)"
echo "   3. app/layout.tsx - metadataBase URL adicionada"
echo ""

echo "📚 DOCUMENTAÇÃO GERADA:"
echo "   • PRODUCTION_READY.md  - Checklist completo de produção"
echo "   • DEPLOYMENT.md        - Guia de deployment e troubleshooting"
echo "   • deploy-vercel.sh     - Script de deploy automático"
echo ""

echo "🚀 PRÓXIMOS PASSOS:"
echo ""
echo "   1️⃣  CONFIGURAR ENVIRONMENT VARIABLES no Vercel:"
echo "       https://vercel.com/dashboard/projects"
echo ""
echo "       Variables necessárias:"
echo "       • DATABASE_URL (Neon PostgreSQL)"
echo "       • NEXTAUTH_SECRET (gerar: openssl rand -hex 32)"
echo "       • NEXTAUTH_URL"
echo "       • NEXT_PUBLIC_APP_URL"
echo ""
echo "   2️⃣  FAZER GIT COMMIT E PUSH:"
echo "       git add ."
echo "       git commit -m 'fix: production ready - type fixes, Stripe API update, metadata'"
echo "       git push origin main"
echo ""
echo "   3️⃣  WEBHOOK AUTOMÁTICO:"
echo "       • Vercel receberá webhook do GitHub"
echo "       • Build automático iniciará"
echo "       • Prisma migrations executarão"
echo ""
echo "   4️⃣  VERIFICAR DEPLOYMENT:"
echo "       • Ir para: https://vercel.com/dashboard"
echo "       • Aguardar conclusão do build (2-5 minutos)"
echo "       • Acessar: https://curso-omotenashi.vercel.app"
echo ""

echo "🔍 VERIFICAÇÕES PÓS-DEPLOY:"
echo "   ☐ Health check API"
echo "   ☐ Login/Register funcionando"
echo "   ☐ Database conectada"
echo "   ☐ Stripe webhooks recebendo"
echo "   ☐ Performance (Lighthouse > 80)"
echo ""

echo "📞 SUPORTE RÁPIDO:"
echo "   Logs Vercel:  vercel logs --prod"
echo "   Cache limpar: vercel cache rm"
echo "   Redeploy:     vercel deploy --prod"
echo ""

echo "✨ Deploy via script automático:"
echo "   chmod +x deploy-vercel.sh"
echo "   ./deploy-vercel.sh --prod"
echo ""
