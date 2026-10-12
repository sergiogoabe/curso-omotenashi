"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(data => {
          setStatus(data.success ? "success" : "error")
        })
        .catch(() => setStatus("error"))
    } else {
      setStatus("error")
    }
  }, [sessionId])

  return (
    <Card className="w-full max-w-md border-border/50 text-center">
      <CardHeader>
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-amber-400 animate-spin" />
            <CardTitle className="text-2xl">Verificando Pagamento</CardTitle>
            <CardDescription>Aguarde enquanto confirmamos seu pagamento...</CardDescription>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <CardTitle className="text-2xl">Pagamento Confirmado! 🎉</CardTitle>
            <CardDescription>
              Seu acesso ao curso Omotenashi foi ativado. Você já pode começar a estudar!
            </CardDescription>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-4xl">😞</span>
            </div>
            <CardTitle className="text-2xl">Algo deu errado</CardTitle>
            <CardDescription>
              Não foi possível verificar seu pagamento. Entre em contato pelo WhatsApp.
            </CardDescription>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "success" && (
          <>
            <div className="bg-green-950/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Use o email e senha cadastrados para fazer login e acessar todo o conteúdo.
              </p>
            </div>
            <Link href="/auth/login">
              <Button className="w-full gap-2" size="lg">
                Fazer Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/curso">
              <Button variant="outline" className="w-full gap-2">
                Ver Cursos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <a
            href="https://wa.me/5537984189874"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full">Falar no WhatsApp</Button>
          </a>
        )}
        {status === "verifying" && (
          <p className="text-xs text-muted-foreground">
            Isso pode levar alguns segundos...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function PagamentoSucessoPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Suspense fallback={
        <Card className="w-full max-w-md border-border/50 text-center">
          <CardContent className="p-12">
            <Loader2 className="h-12 w-12 text-amber-400 animate-spin mx-auto" />
          </CardContent>
        </Card>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
