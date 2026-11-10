"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Loader2, Building2, Shield, Crown, Award } from "lucide-react"
import { PIX_KEY } from "@/lib/pix"
import { seloCheckoutSchema, SELO_TIERS, type SeloTier } from "@/lib/selo"

type PixData = {
  pixPayload: string
  pixQR: string
  value: number
  tier: SeloTier
  invoiceUrl: string | null
}

const TIER_ICONS: Record<SeloTier, typeof Award> = { prata: Shield, ouro: Award, diamante: Crown }

export default function SeloCheckout() {
  const [step, setStep] = useState<"form" | "pix">("form")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [tier, setTier] = useState<SeloTier>("prata")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pixData, setPixData] = useState<PixData | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    const parsed = seloCheckoutSchema.safeParse({ companyName, email, cnpj, tier })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/selo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Não foi possível iniciar a compra")
        setLoading(false)
        return
      }

      setPixData(data)
      setLoading(false)
      setStep("pix")
    } catch {
      setError("Erro ao conectar com o servidor")
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!pixData) return
    try {
      await navigator.clipboard.writeText(pixData.pixPayload)
      setCopied(true)
      setError("")
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setError("Não foi possível copiar. Use a chave PIX exibida acima.")
    }
  }

  function formatValue(v: number) {
    return v.toFixed(2).replace(".", ",")
  }

  if (step === "pix") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">⛩️</div>
            <CardTitle className="text-2xl">Pagamento PIX</CardTitle>
            <CardDescription>Escaneie o QR Code para pagar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/30 border border-border/50 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Selo</p>
              <p className="text-sm font-semibold">{SELO_TIERS[pixData?.tier ?? "prata"].label}</p>
            </div>

            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-2">
                {pixData?.pixQR ? (
                  <img src={pixData.pixQR} alt="QR Code PIX" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-3xl font-bold">R$ {pixData ? formatValue(pixData.value) : ""}</p>
            </div>

            <div className="bg-secondary/50 border border-border/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Chave PIX</p>
              <p className="text-sm font-mono text-center break-all">{PIX_KEY}</p>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar Código PIX"}
            </Button>

            {error ? (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">{error}</div>
            ) : null}

            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-green-400 font-bold text-center">✅ Compra registrada! Agora finalize o pagamento</p>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-blue-400 font-bold">📨 Próximos Passos:</p>
              <ul className="text-xs text-muted-foreground space-y-2 ml-2">
                <li>✓ Escaneie o QR Code ou copie o código PIX acima</li>
                <li>✓ Realize o pagamento no banco da sua empresa</li>
                <li>✓ Após a confirmação, cadastramos sua empresa e enviamos as orientações de treinamento por email</li>
                <li>✓ Ao concluir o treinamento e a avaliação, sua empresa recebe o selo e o certificado digital</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground text-center">
              Dúvidas? <Link href="/selo" className="text-primary hover:underline">Voltar para a página do selo</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg border-border/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">⛩️</div>
          <CardTitle className="text-2xl">Selo Omotenashi</CardTitle>
          <CardDescription>Escolha o selo e pague com PIX</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Selo</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SELO_TIERS) as SeloTier[]).map((id) => {
                  const config = SELO_TIERS[id]
                  const selected = tier === id
                  const Icon = TIER_ICONS[id]
                  return (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={selected}
                      onClick={() => setTier(id)}
                      className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all ${
                        selected ? "border-red-500/50 bg-red-950/20" : "border-border/50 bg-card/50 hover:border-border"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selected ? "text-red-400" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                        {config.label.replace("Selo ", "")}
                      </span>
                      <span className="text-sm font-bold gradient-text">R$ {formatValue(config.value)}</span>
                      <span className="text-[10px] text-muted-foreground">{config.colaboradores}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error ? (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">{error}</div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                autoComplete="organization"
                minLength={2}
                maxLength={120}
                placeholder="Razão social ou nome fantasia"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                autoComplete="off"
                maxLength={18}
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email corporativo</Label>
              <Input
                id="email"
                name="email"
                autoComplete="email"
                maxLength={254}
                type="email"
                placeholder="contato@suaempresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                </>
              ) : (
                "Gerar PIX para Pagamento"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              <Building2 className="inline h-4 w-4 mr-1" />
              Após o pagamento, criamos o cadastro da sua empresa e enviamos as orientações por email.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
