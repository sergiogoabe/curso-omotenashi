import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SELO_TIERS, SELO_STATUS_LABEL, type SeloStatus } from "@/lib/selo"

export const dynamic = "force-dynamic"

function formatarData(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(value)
}

export default async function VerificarSelo({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const certificado = await prisma.certification.findUnique({
    where: { verifyCode: codigo },
    include: { company: { select: { name: true } } },
  })

  if (!certificado) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center">
            <div className="mb-4 text-4xl">⛩️</div>
            <CardTitle className="text-2xl">Selo não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              O código <span className="font-mono">{codigo}</span> não corresponde a nenhuma certificação Omotenashi.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/selo">Conhecer o Selo Omotenashi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = certificado.status as SeloStatus
  const tier = SELO_TIERS[certificado.tier as keyof typeof SELO_TIERS] ?? SELO_TIERS.prata
  const valido = status === "certificado"
  const vencido = status === "vencido" || (certificado.expiresAt ? new Date(certificado.expiresAt) < new Date() : false)

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg border-border/50">
        <CardHeader className="text-center">
          <div className="mb-4 text-4xl">{valido ? "🏅" : "⛩️"}</div>
          <CardTitle className="text-2xl">{valido ? "Certificação válida" : vencido ? "Certificação vencida" : "Certificação em andamento"}</CardTitle>
          <p className="text-sm text-muted-foreground">Verificação oficial do Selo Omotenashi</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Empresa certificada</p>
            <p className="mt-1 text-lg font-semibold">{certificado.company.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Nível</p>
              <p className="mt-1 font-medium">{tier.label}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Situação</p>
              <p className="mt-1 font-medium">{SELO_STATUS_LABEL[status] ?? certificado.status}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Emitido em</p>
              <p className="mt-1 font-medium">{certificado.issuedAt ? formatarData(new Date(certificado.issuedAt)) : "—"}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-xs text-muted-foreground">Válido até</p>
              <p className="mt-1 font-medium">{certificado.expiresAt ? formatarData(new Date(certificado.expiresAt)) : "—"}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {valido
              ? "Esta empresa concluiu o treinamento Omotenashi e atende aos critérios de avaliação para uso do selo."
              : vencido
                ? "A validade desta certificação expirou. A recertificação é anual."
                : "Esta empresa está no processo de treinamento e avaliação para obter o Selo Omotenashi."}
          </p>

          {valido ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/api/certificados/${certificado.verifyCode}`} target="_blank">
                Baixar certificado (PDF)
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost" className="w-full">
            <Link href="/selo">Conhecer o Selo Omotenashi</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
