"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, CheckCircle, Loader2, ArrowRight } from "lucide-react"

function AtivarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCode = searchParams.get("code") || ""
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/ativar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível ativar a conta")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
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
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold">Conta Ativada!</h2>
            <p className="text-muted-foreground">Redirecionando para o login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔑</div>
          <CardTitle className="text-2xl">Ativar Conta</CardTitle>
          <CardDescription>
            Insira o código de ativação enviado por email
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
              <Label htmlFor="code">Código de Ativação</Label>
              <Input
                id="code"
                placeholder="EX: A1B2C3D4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="text-center text-lg font-mono tracking-widest"
                maxLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Ativando...</>
              ) : (
                <><Key className="h-4 w-4" /> Ativar Conta <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Ainda não tem código?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Cadastre-se primeiro
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function Ativar() {
  return (
    <Suspense fallback={null}>
      <AtivarForm />
    </Suspense>
  )
}
