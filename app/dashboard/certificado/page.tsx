"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, ArrowLeft, ArrowRight, Download, CheckCircle, Share2 } from "lucide-react"

export default function Certificado() {
  const { data: session, status } = useSession()
  const [lessons, setLessons] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login")
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/lessons").then(r => r.json()),
        fetch("/api/progress").then(r => r.json()),
      ]).then(([lessonsData, progressData]) => {
        setLessons(lessonsData)
        if (progressData.progress) setProgress(progressData.progress)
        setLoading(false)
      })
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">⛩️</div>
      </div>
    )
  }

  const completedCount = progress.filter((p: any) => p.completed).length
  const totalLessons = lessons.length
  const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const isComplete = completionPct === 100

  function handlePrint() {
    window.print()
  }

  const date = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Award className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Certificado de Conclusão</h1>
          <p className="text-muted-foreground">
            {isComplete
              ? "Parabéns por concluir todas as aulas do curso Omotenashi!"
              : `Você completou ${completedCount} de ${totalLessons} aulas (${completionPct}%). Continue estudando para obter seu certificado.`}
          </p>
        </div>

        {!isComplete && (
          <div className="w-full bg-secondary/30 rounded-full h-4 mb-8 overflow-hidden border border-border/50">
            <div
              className="h-full bg-linear-to-r from-red-600 to-amber-400 rounded-full transition-all duration-1000"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        )}

        <div
          ref={certRef}
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-linear-to-br from-red-950/20 via-background to-amber-950/20 p-8 md:p-16 text-center"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C27B0' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        >
          <div className="absolute top-4 left-4 text-4xl opacity-20">⛩️</div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-20">🌸</div>

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-red-600 to-amber-400 flex items-center justify-center">
              <Award className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-xl font-display font-bold text-amber-400 mb-2">CERTIFICADO</h2>
            <p className="text-xs text-muted-foreground mb-6">DE CONCLUSÃO</p>

            <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

            <p className="text-sm text-muted-foreground mb-2">Conferimos o presente certificado a</p>
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 gradient-text">
              {session?.user?.name || "Aluno"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              por ter concluído com êxito todas as aulas do curso
            </p>

            <h4 className="text-xl font-display font-bold mb-6">Omotenashi: A Arte Japonesa da Hospitalidade</h4>

            <div className="w-32 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

            <div className="flex items-center justify-center gap-4 mb-4">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">{totalLessons} aulas concluídas</span>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Carga horária: 4h30</span>
            </div>

            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={handlePrint} className="gap-2" disabled={!isComplete}>
            <Download className="h-4 w-4" /> {isComplete ? "Imprimir Certificado" : "Complete o Curso"}
          </Button>
          <Button variant="outline" className="gap-2" disabled={!isComplete}>
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>

        {!isComplete && (
          <div className="text-center mt-6">
            <Link href="/curso">
              <Button variant="outline" className="gap-2">
                Continuar Estudos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  )
}