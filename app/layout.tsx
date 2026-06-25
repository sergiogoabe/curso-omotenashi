import type { Metadata } from "next"
import { Providers } from "./providers"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://curso-omotenashi.vercel.app"),
  title: "Omotenashi Curso | A Arte Japonesa da Hospitalidade",
  description: "Transforme seu atendimento ao cliente com o curso Omotenashi. Aprenda a filosofia japonesa de hospitalidade excepcional para empresas e profissionais. +2.500 alunos, 150+ empresas.",
  openGraph: {
    title: "Omotenashi Curso | A Arte Japonesa da Hospitalidade",
    description: "Transforme seu atendimento ao cliente com o curso Omotenashi. +2.500 alunos, 150+ empresas. Acesso vitalício, certificado reconhecido.",
    type: "website",
    locale: "pt_BR",
    siteName: "Omotenashi Curso",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Omotenashi - A Arte Japonesa da Hospitalidade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omotenashi Curso | A Arte Japonesa da Hospitalidade",
    description: "Transforme seu atendimento ao cliente com o curso Omotenashi. +2.500 alunos, 150+ empresas.",
    images: ["/og-image.png"],
  },
  keywords: ["omotenashi", "hospitalidade", "atendimento ao cliente", "curso online", "japão", "treinamento corporativo", "NPS", "RH", "hotelaria"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
