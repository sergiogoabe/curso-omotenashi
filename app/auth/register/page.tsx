"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Loader2, ArrowRight, Building2, User, Users, CreditCard, Smartphone } from "lucide-react"

const PIX_KEY = "07030124600"

const PLANS = [
  {
    id: "individual",
    label: "Individual",
    desc: "Para profissionais",
    value: 197.0,
    icon: User,
    badge: "MAIS POPULAR",
  },
  {
    id: "empresarial30",
    label: "Empresarial 30",
    desc: "Até 30 colaboradores",
    value: 1497.0,
    icon: Building2,
  },
  {
    id: "empresarial50",
    label: "Empresarial 50",
    desc: "Até 50 colaboradores",
    value: 2497.0,
    icon: Building2,
    badge: "MAIS VENDIDO",
  },
  {
    id: "combo",
    label: "Combo",
    desc: "Empresas + individuais",
    value: 3200.0,
    icon: Users,
  },
]

export default function Register() {
  const [step, setStep] = useState<"form" | "pix" | "stripe">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [plan, setPlan] = useState("individual")
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pixData, setPixData] = useState<{
    pixPayload: string
    pixQR: string
    value: number
    plan: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (paymentMethod === "card") {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, plan }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
          setLoading(false)
          return
        }

        if (data.url) {
          window.location.href = data.url
        } else {
          setError("Erro ao redirecionar para pagamento")
          setLoading(false)
        }
      } catch {
        setError("Erro ao conectar com o servidor")
        setLoading(false)
      }
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
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

  function handleCopy() {
    if (!pixData) return
    navigator.clipboard.writeText(pixData.pixPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
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
            <CardDescription>
              Escaneie o QR Code para pagar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/30 border border-border/50 rounded-lg px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">Plano</p>
              <p className="text-sm font-semibold capitalize">
                {PLANS.find((p) => p.id === pixData?.plan)?.label || pixData?.plan}
              </p>
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

            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 space-y-2">
              <p className="text-sm text-amber-400 font-medium text-center">
                ✅ Cadastro registrado com sucesso!
              </p>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Após realizar o pagamento, aguarde o email de ativação.
                Assim que eu confirmar o recebimento do PIX, enviarei um
                código de ativação para <strong>{email}</strong>.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground text-center">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Entrar
              </Link>
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
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Escolha o plano e a forma de pagamento
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Plano</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map((p) => {
                  const selected = plan === p.id
                  const Icon = p.icon
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all ${
                        selected
                          ? "border-red-500/50 bg-red-950/20"
                          : "border-border/50 bg-card/50 hover:border-border"
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-500 text-[10px] text-white font-bold px-2 py-0.5 rounded whitespace-nowrap">
                          {p.badge}
                        </span>
                      )}
                      <Icon className={`h-5 w-5 ${selected ? "text-red-400" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                        {p.label}
                      </span>
                      <span className="text-sm font-bold gradient-text">R$ {formatValue(p.value)}</span>
                      <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    paymentMethod === "pix"
                      ? "border-red-500/50 bg-red-950/20"
                      : "border-border/50 bg-card/50 hover:border-border"
                  }`}
                >
                  <Smartphone className={`h-5 w-5 ${paymentMethod === "pix" ? "text-red-400" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className={`text-xs font-semibold ${paymentMethod === "pix" ? "text-foreground" : "text-muted-foreground"}`}>PIX</div>
                    <div className="text-[10px] text-muted-foreground">QR Code ou chave</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                    paymentMethod === "card"
                      ? "border-red-500/50 bg-red-950/20"
                      : "border-border/50 bg-card/50 hover:border-border"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-red-400" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <div className={`text-xs font-semibold ${paymentMethod === "card" ? "text-foreground" : "text-muted-foreground"}`}>Cartão / PIX</div>
                    <div className="text-[10px] text-muted-foreground">Pagamento via Stripe</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
              ) : paymentMethod === "card" ? (
                <><CreditCard className="h-4 w-4" /> Pagar com Cartão / PIX</>
              ) : (
                "Gerar PIX para Pagamento"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
