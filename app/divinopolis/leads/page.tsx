"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, CheckCircle2, MapPin, Heart, Award, Users, Sparkles } from "lucide-react"

const WPP = "https://wa.me/5537984189874"

export default function LeadsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", size: "" })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = `*Lead - Divinópolis*\n\n*Nome:* ${form.name}\n*Email:* ${form.email}\n*Telefone:* ${form.phone}\n*Empresa:* ${form.company}\n*Porte:* ${form.size} funcionários`
    window.open(`${WPP}?text=${encodeURIComponent(msg)}`, "_blank")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-7xl mb-6">🎉</div>
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold mb-4">Recebemos seu contato!</h1>
          <p className="text-muted-foreground mb-8">Falamos com você em breve pelo WhatsApp. Fique de olho!</p>
          <Button asChild>
            <Link href="/divinopolis">Voltar para Divinópolis</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🗺️ Exclusivo para Divinópolis
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4">
              Treinamento Omotenashi para Sua Equipe em Divinópolis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Transforme o atendimento da sua empresa com a filosofia japonesa de hospitalidade.
              Sua equipe mais engajada, clientes mais fiéis, resultados melhores.
            </p>
          </div>
        </div>
      </section>

      {/* Form + Benefits */}
      <section className="py-16 -mt-24 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Benefits */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-display font-bold">Por que seu negócio precisa disso</h2>
              <div className="space-y-4">
                {[
                  { icon: Heart, text: "Atendimento que encanta e fideliza" },
                  { icon: Award, text: "Diferencial competitivo em Divinópolis" },
                  { icon: Users, text: "Equipe mais motivada e engajada" },
                  { icon: Sparkles, text: "Resultados visíveis em até 30 dias" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "Implementamos em 12 unidades. O NPS subiu de 72 para 94 em 6 meses."
                </p>
                <p className="text-xs font-medium mt-1">— Carlos Silva, Rede Transamérica</p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              <Card className="border-red-500/30 bg-linear-to-b from-red-950/10 to-card/50">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Quero Transformar Meu Atendimento</CardTitle>
                  <CardDescription>Preencha e falaremos com você pelo WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input id="name" placeholder="Seu nome" required value={form.name} onChange={e => update("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" required value={form.email} onChange={e => update("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input id="phone" placeholder="(37) 9XXXX-XXXX" required value={form.phone} onChange={e => update("phone", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input id="company" placeholder="Nome da sua empresa" required value={form.company} onChange={e => update("company", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Funcionários</Label>
                      <select
                        id="size"
                        className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={form.size}
                        onChange={e => update("size", e.target.value)}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="1-5">1 a 5</option>
                        <option value="6-20">6 a 20</option>
                        <option value="21-50">21 a 50</option>
                        <option value="51-100">51 a 100</option>
                        <option value="100+">Mais de 100</option>
                      </select>
                    </div>
                    <Button type="submit" size="xl" className="w-full gap-2 text-base">
                      Quero Transformar Meu Negócio <ArrowRight className="h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      🔒 Seus dados estão seguros. Não enviamos spam.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
            {[
              { number: "+47%", label: "Aumento no NPS" },
              { number: "+40%", label: "Ticket médio" },
              { number: "-60%", label: "Evasão de clientes" },
              { number: "150+", label: "Empresas atendidas" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.number}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-4">Quer falar direto com a gente?</h2>
          <p className="text-muted-foreground mb-6">Chame no WhatsApp e agende um workshop gratuito de 1h</p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base">
              Falar no WhatsApp Agora
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
