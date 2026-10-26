

import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Política de Privacidade | Omotenashi",
  description: "Política de privacidade do curso Omotenashi - como coletamos, usamos e protegemos seus dados pessoais.",
}

export default function Privacidade() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Política de Privacidade</h1>
        <p className="text-muted-foreground text-lg">Última atualização: Outubro 2026</p>
      </div>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">1. Controlador de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>O curso Omotenashi é operado pela Infinity Agency, inscrita no CNPJ sob o nº 00.000.000/0001-00, com sede em Divinópolis/MG.</p>
          <p>Para dúvidas sobre esta política ou exercício de direitos, contate: <strong>contato@omotenashi.com</strong></p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">2. Dados Coletados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p><strong>Dados de cadastro:</strong> Nome, email, senha (hash bcrypt), telefone opcional, empresa opcional.</p>
          <p><strong>Dados de pagamento:</strong> Processados pela Asaas (PIX) e Stripe (cartão). Não armazenamos números de cartão.</p>
          <p><strong>Dados de uso:</strong> Progresso no curso, aulas concluídas, tempo de estudo, acessos ao fórum.</p>
          <p><strong>Dados técnicos:</strong> IP, user-agent, logs de erro (para segurança e debugging).</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">3. Finalidades e Base Legal (LGPD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Execução de contrato (Art. 7º, V):</strong> Entregar o curso, gerar certificado, processar pagamentos.</li>
            <li><strong>Consentimento (Art. 7º, I):</strong> Enviar comunicações educativas e ofertas (opt-in no cadastro).</li>
            <li><strong>Interesse legítimo (Art. 7º, IX):</strong> Melhorar a plataforma, prevenir fraudes, segurança.</li>
            <li><strong>Obrigação legal (Art. 7º, II):</strong> Manter registros de transações financeiras (5 anos, Art. 12 LGPD + CDC).</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">4. Compartilhamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Seus dados <strong>não são vendidos</strong>. Compartilhamos apenas com:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Asaas / Stripe — processamento de pagamentos (LGPD Art. 7º, V)</li>
            <li>Provedores de email (ex: Resend) — envio de códigos de ativação e comunicações</li>
            <li>Autoridades — mediante ordem judicial ou requisição legal válida</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">5. Seus Direitos (LGPD Art. 18)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Você pode solicitar a qualquer momento:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Confirmação de tratamento e acesso aos dados</li>
            <li>Correção de dados incompletos/inexatos</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados a outro fornecedor</li>
            <li>Eliminação dos dados tratados com consentimento</li>
            <li>Informação sobre compartilhamento</li>
            <li>Revogação do consentimento</li>
          </ul>
          <p>Para exercer seus direitos: <a href="mailto:contato@omotenashi.com" className="text-primary underline">contato@omotenashi.com</a></p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">6. Retenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>Dados de conta e progresso: enquanto a conta estiver ativa + 2 anos após inatividade</li>
            <li>Dados de pagamento: 5 anos (obrigação fiscal/CDC)</li>
            <li>Logs de segurança: 1 ano</li>
            <li>Dados de marketing: até revogação do consentimento</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">7. Segurança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Implementamos: criptografia em trânsito (TLS 1.3), senhas com bcrypt (cost 12), rate limiting, headers de segurança (CSP, HSTS), monitoramento de erros, backups criptografados.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">8. Cookies e Tecnologias Similares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Usamos cookies essenciais (sessão, CSRF, preferências) e, com consentimento, cookies analíticos (Vercel Analytics / PostHop). Você pode gerenciar nas configurações do navegador.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">9. Transferência Internacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Servidores da Vercel (EUA) e Asaas/Stripe podem processar dados fora do Brasil. Contratos incluem cláusulas padrão (LGPD Art. 33) e avaliação de nível adequado de proteção.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">10. Alterações nesta Política</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Atualizações serão publicadas nesta página com nova data. Alterações materiais serão comunicadas por email.</p>
        </CardContent>
      </Card>

      <div className="text-center pt-8">
        <Link href="/" className="text-primary hover:underline">← Voltar ao início</Link>
      </div>
    </div>
  )
}