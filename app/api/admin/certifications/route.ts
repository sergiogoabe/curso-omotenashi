import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin, publicError } from "@/lib/admin"
import { SELO_TIER_IDS, SELO_STATUSES, isSeloTier } from "@/lib/selo"
import { createCertificationComCodigo } from "@/lib/selo/ativar"

export const dynamic = "force-dynamic"

/** Um ano de validade a partir da emissão. */
const UM_ANO_MS = 365 * 24 * 60 * 60 * 1000

const isoDate = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Data inválida")

const certificationSchema = z.object({
  companyId: z.string().min(1, "Selecione a empresa"),
  tier: z.string().refine(isSeloTier, "Selo inválido"),
  status: z.enum(SELO_STATUSES).optional(),
  issuedAt: isoDate.optional().nullable(),
  expiresAt: isoDate.optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
})

type CertificationInput = z.infer<typeof certificationSchema>

/**
 * Regras de datas: a transição PARA certificado define issuedAt=agora e
 * expiresAt=+1 ano (renovação), preservando apenas o que vier explícito.
 * Edições que não mudam o status não tocam nas datas.
 */
function toCertificationData(input: CertificationInput, autoDates: boolean) {
  const status = input.status ?? "treinando"
  let issuedAt = input.issuedAt ? new Date(input.issuedAt) : null
  let expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
  if (autoDates && status === "certificado") {
    if (!issuedAt) issuedAt = new Date()
    if (!expiresAt) expiresAt = new Date(issuedAt.getTime() + UM_ANO_MS)
  }
  return {
    companyId: input.companyId,
    tier: input.tier,
    status,
    issuedAt,
    expiresAt,
    notes: input.notes || null,
  }
}


export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const [certifications, companies, pendings] = await Promise.all([
      prisma.certification.findMany({
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.pendingCertification.findMany({ orderBy: { createdAt: "desc" } }),
    ])
    return NextResponse.json({ certifications, companies, pendings, tiers: SELO_TIER_IDS })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = certificationSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    const certification = await createCertificationComCodigo(prisma, toCertificationData(parsed.data, true))
    return NextResponse.json(certification)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = certificationSchema
    .extend({ id: z.string().min(1), renew: z.boolean().optional() })
    .partial()
    .safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 })

  try {
    const { id, renew, ...rest } = parsed.data
    const current = await prisma.certification.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: "Certificação não encontrada" }, { status: 404 })

    if (renew) {
      const now = new Date()
      const certification = await prisma.certification.update({
        where: { id },
        data: {
          status: "certificado",
          issuedAt: now,
          expiresAt: new Date(now.getTime() + UM_ANO_MS),
        },
      })
      return NextResponse.json(certification)
    }

    const status = rest.status ?? (current.status as CertificationInput["status"])
    const merged: CertificationInput = {
      companyId: rest.companyId ?? current.companyId,
      tier: rest.tier ?? (current.tier as CertificationInput["tier"]),
      status,
      issuedAt: "issuedAt" in rest ? rest.issuedAt ?? null : current.issuedAt?.toISOString() ?? null,
      expiresAt: "expiresAt" in rest ? rest.expiresAt ?? null : current.expiresAt?.toISOString() ?? null,
      notes: "notes" in rest ? rest.notes ?? null : current.notes,
    }
    const certification = await prisma.certification.update({
      where: { id },
      data: toCertificationData(merged, status === "certificado" && current.status !== "certificado"),
    })
    return NextResponse.json(certification)
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  try {
    await prisma.certification.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 400 })
  }
}
