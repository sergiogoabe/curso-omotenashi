import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { prisma } from "@/lib/prisma"
import { SELO_TIERS, isSeloVencido } from "@/lib/selo"

export const dynamic = "force-dynamic"

const VERMELHO = rgb(0.62, 0.11, 0.11)
const TINTA = rgb(0.1, 0.1, 0.12)
const CINZA = rgb(0.45, 0.45, 0.5)

function formatarData(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(value)
}

function centralizar(page: { getWidth: () => number }, text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number) {
  return (page.getWidth() - font.widthOfTextAtSize(text, size)) / 2
}

function quebrarTexto(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const palavras = text.split(" ")
  const linhas: string[] = []
  let atual = ""
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (font.widthOfTextAtSize(tentativa, size) > maxWidth && atual) {
      linhas.push(atual)
      atual = palavra
    } else {
      atual = tentativa
    }
  }
  if (atual) linhas.push(atual)
  return linhas
}

/**
 * Certificado PDF público do Selo Omotenashi (A4 paisagem, pdf-lib).
 * Disponível apenas para certificações com status "certificado".
 */
export async function GET(req: Request, context: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await context.params

  const certificado = await prisma.certification.findUnique({
    where: { verifyCode: codigo },
    include: { company: { select: { name: true } } },
  })

  if (!certificado) return NextResponse.json({ error: "Certificação não encontrada" }, { status: 404 })
  if (certificado.status !== "certificado" || isSeloVencido(certificado.status, certificado.expiresAt)) {
    return NextResponse.json({ error: "Esta certificação não está válida" }, { status: 404 })
  }

  const tier = SELO_TIERS[certificado.tier as keyof typeof SELO_TIERS] ?? SELO_TIERS.prata
  const emitidoEm = certificado.issuedAt ? new Date(certificado.issuedAt) : new Date()
  const validoAte = certificado.expiresAt ? new Date(certificado.expiresAt) : new Date(emitidoEm.getTime() + 365 * 24 * 60 * 60 * 1000)

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  const urlVerificacao = `${origin}/selo/verificar/${certificado.verifyCode}`

  const pdf = await PDFDocument.create()
  const page = pdf.addPage()
  page.setSize(841.89, 595.28)
  const { width, height } = page.getSize()

  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  // Moldura dupla estilo japonês
  page.drawRectangle({ x: 36, y: 36, width: width - 72, height: height - 72, borderColor: VERMELHO, borderWidth: 3 })
  page.drawRectangle({ x: 48, y: 48, width: width - 96, height: height - 96, borderColor: VERMELHO, borderWidth: 0.75 })

  // Marca no topo
  page.drawText("O M O T E N A S H I", { x: centralizar(page, "O M O T E N A S H I", helvetica, 11), y: height - 92, size: 11, font: helvetica, color: VERMELHO })
  page.drawLine({ start: { x: width / 2 - 60, y: height - 104 }, end: { x: width / 2 + 60, y: height - 104 }, thickness: 0.75, color: VERMELHO })

  page.drawText("CERTIFICADO", { x: centralizar(page, "CERTIFICADO", bold, 34), y: height - 160, size: 34, font: bold, color: TINTA })
  page.drawText(tier.label.toUpperCase(), { x: centralizar(page, tier.label.toUpperCase(), helvetica, 15), y: height - 186, size: 15, font: helvetica, color: VERMELHO })

  // Empresa
  page.drawText("Certificamos que", { x: centralizar(page, "Certificamos que", italic, 12), y: height - 232, size: 12, font: italic, color: CINZA })
  const nomeEmpresa = certificado.company.name.length > 48 ? `${certificado.company.name.slice(0, 45)}...` : certificado.company.name
  page.drawText(nomeEmpresa, { x: centralizar(page, nomeEmpresa, bold, 24), y: height - 268, size: 24, font: bold, color: TINTA })

  // Corpo
  const corpo =
    "concluiu o programa de treinamento Omotenashi e atende aos critérios de avaliação " +
    "de excelência no atendimento, conforme o nível desta certificação, estando apta a " +
    "exibir o Selo Omotenashi em seus canais oficiais."
  const linhas = quebrarTexto(corpo, helvetica, 11.5, width - 240)
  let y = height - 306
  for (const linha of linhas) {
    page.drawText(linha, { x: centralizar(page, linha, helvetica, 11.5), y, size: 11.5, font: helvetica, color: TINTA })
    y -= 18
  }

  // Datas e código
  page.drawText(`Emitido em ${formatarData(emitidoEm)}`, { x: centralizar(page, `Emitido em ${formatarData(emitidoEm)}`, helvetica, 11), y: y - 26, size: 11, font: helvetica, color: CINZA })
  const validade = `Válido até ${formatarData(validoAte)}`
  page.drawText(validade, { x: centralizar(page, validade, helvetica, 11), y: y - 44, size: 11, font: helvetica, color: CINZA })

  // Código de verificação
  page.drawRectangle({ x: width / 2 - 150, y: 96, width: 300, height: 34, borderColor: VERMELHO, borderWidth: 0.75, color: rgb(0.98, 0.96, 0.95) })
  page.drawText(`Código: ${certificado.verifyCode}`, { x: centralizar(page, `Código: ${certificado.verifyCode}`, bold, 12), y: 107, size: 12, font: bold, color: TINTA })
  page.drawText(`Verifique a autenticidade em ${urlVerificacao}`, {
    x: centralizar(page, `Verifique a autenticidade em ${urlVerificacao}`, helvetica, 8.5),
    y: 80,
    size: 8.5,
    font: helvetica,
    color: CINZA,
  })
  page.drawText("Documento emitido eletronicamente pela plataforma Omotenashi.", {
    x: centralizar(page, "Documento emitido eletronicamente pela plataforma Omotenashi.", helvetica, 8),
    y: 62,
    size: 8,
    font: helvetica,
    color: CINZA,
  })

  const bytes = await pdf.save()

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificado-omotenashi-${certificado.verifyCode}.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
