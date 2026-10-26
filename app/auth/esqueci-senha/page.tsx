"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, ArrowRight } from "lucide-react"

export default function EsqueciSenha() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível enviar o email")
        return
      }
      setSuccess(true)
    } catch {
      setError("Não foi possível conectar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="py-12 text-center space-y-4">
            <Mail className="h-16 w-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold">Email Enviado!</h2>
            <p className="text-muted-foreground">
              Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.
            </p>
            <p className="text-sm text-muted-foreground">Verifique também a pasta de spam.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full gap-2" size="lg">
                Voltar ao Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔑</div>
          <CardTitle className="text-2xl">Esqueci Minha Senha</CardTitle>
          <CardDescription>
            Informe seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                autoComplete="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Mail className="h-4 w-4" /> Enviar Link de Recuperação <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Lembrou a senha?{" "}
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