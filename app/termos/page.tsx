

import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Termos de Uso | Omotenashi",
  description: "Termos e condições de uso do curso Omotenashi - regras, responsabilidades e direitos.",
}

export default function Termos() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Termos de Uso</h1>
        <p className="text-muted-foreground text-lg">Última atualização: Outubro 2026</p>
      </div>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">1. Aceitação dos Termos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Ao acessar ou usar o curso Omotenashi ("Plataforma"), operado pela Infinity Agency, você concorda com estes Termos. Se não concordar, não use a Plataforma.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">2. Descrição do Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>A Plataforma oferece curso online sobre a filosofia japonesa Omotenashi (hospitalidade excepcional), incluindo:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Videoaulas estruturadas em módulos</li>
            <li>E-book complementar (300+ páginas)</li>
            <li>Fórum de discussão entre alunos</li>
            <li>Certificado de conclusão (após 100% do curso)</li>
            <li>Acesso vitalício ao conteúdo adquirido</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">3. Cadastro e Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>Você deve fornecer informações verdadeiras e mantê-las atualizadas</li>
            <li>É responsável por manter a confidencialidade da senha</li>
            <li>Uma conta por pessoa (CPF/email único)</li>
            <li>Contas corporativas: a empresa é responsável pelos acessos dos colaboradores</li>
            <li>Podemos suspender/encerrar contas que violem estes Termos</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">4. Pagamentos e Planos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>Preços em Reais (BRL), incluem impostos aplicáveis</li>
            <li>Pagamentos via PIX (Asaas) ou Cartão/PIX (Stripe)</li>
            <li>Liberação do acesso: imediata (cartão) ou após confirmação PIX (até 1 dia útil)</li>
            <li>Planos corporativos: válidos pelo período contratado, renováveis</li>
            <li>Não há reembolso parcial por tempo não utilizado em planos anuais</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">5. Garantia de 7 Dias (CDC Art. 49)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Conforme Código de Defesa do Consumidor, você tem <strong>7 dias corridos</strong> após a compra para solicitar reembolso integral, sem justificativa.</p>
          <p>Para solicitar: <a href="mailto:contato@omotenashi.com" className="text-primary underline">contato@omotenashi.com</a> com o email da compra.</p>
          <p>O reembolso será processado no mesmo meio de pagamento em até 10 dias úteis.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">6. Propriedade Intelectual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>Todo conteúdo (vídeos, textos, e-book, certificados) é propriedade da Infinity Agency</li>
            <li>Licença: uso pessoal, não-exclusivo, intransferível, para estudo</li>
            <li>Proibido: download para redistribuição, gravação de tela, compartilhamento de acesso, revenda</li>
            <li>Violações sujeitas a ação judicial (Lei 9.610/98 - Direitos Autorais)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">7. Conduta do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>É proibido:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Compartilhar credenciais ou permitir acesso de terceiros</li>
            <li>Publicar conteúdo ofensivo, ilegal, spam ou que viole direitos de terceiros no fórum</li>
            <li>Tentar burlar sistemas de segurança, pagamento ou controle de acesso</li>
            <li>Usar a Plataforma para fins comerciais não autorizados</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">8. Certificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>Emitido após conclusão de 100% das aulas obrigatórias</li>
            <li>Contém nome, CPF (hash), curso, data, carga horária, código de verificação</li>
            <li>Válido para horas complementares (consulte sua instituição)</li>
            <li>Não garante emprego, promoção ou reconhecimento oficial por órgãos públicos</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">9. Limitação de Responsabilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <ul className="list-disc list-inside space-y-2">
            <li>A Plataforma é fornecida "como está" e "conforme disponível"</li>
            <li>Não garantimos disponibilidade ininterrupta ou livre de erros</li>
            <li>Responsabilidade total limitada ao valor pago nos últimos 12 meses</li>
            <li>Não nos responsabilizamos por decisões tomadas baseadas no conteúdo do curso</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">10. Suspensão e Encerramento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Podemos suspender o acesso por:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Violação destes Termos</li>
            <li>Inadimplência (pagamento não confirmado)</li>
            <li>Manutenção programada (aviso prévio quando possível)</li>
            <li>Força maior ou determinação legal</li>
          </ul>
          <p>Encerramento definitivo: aviso de 30 dias, com direito a download do e-book e certificado já emitido.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">11. Lei Aplicável e Foro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Estes Termos são regidos pelas leis brasileiras. Foro da Comarca de Divinópolis/MG, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="text-xl">12. Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p><strong>Infinity Agency</strong><br/>
          CNPJ: 00.000.000/0001-00<br/>
          Divinópolis/MG<br/>
          Email: <a href="mailto:contato@omotenashi.com" className="text-primary underline">contato@omotenashi.com</a></p>
        </CardContent>
      </Card>

      <div className="text-center pt-8">
        <Link href="/" className="text-primary hover:underline">← Voltar ao início</Link>
      </div>
    </div>
  )
}