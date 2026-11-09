"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

function VerificarEmail() {
  const token = useSearchParams().get("token") || ""
  const [state, setState] = useState<"loading" | "ok" | "error">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("Link inválido")
      setState("error")
      return
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Não foi possível confirmar")
          setState("error")
          return
        }
        setState("ok")
      })
      .catch(() => {
        setError("Não foi possível conectar")
        setState("error")
      })
  }, [token])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="py-12 text-center space-y-4">
          {state === "loading" && <Loader2 className="h-12 w-12 animate-spin mx-auto" />}
          {state === "ok" && <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />}
          {state === "error" && <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />}
          <h1 className="text-2xl font-bold">
            {state === "ok" ? "Email confirmado" : state === "error" ? "Não confirmado" : "Confirmando email"}
          </h1>
          <p className="text-muted-foreground">{state === "error" ? error : "Você já pode entrar."}</p>
          {state !== "loading" && (
            <Link href="/auth/login" className="text-primary hover:underline">Ir para o login</Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Confirmando email...</div>}>
      <VerificarEmail />
    </Suspense>
  )
}
