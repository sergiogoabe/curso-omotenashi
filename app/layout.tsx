import type { Metadata, Viewport } from "next"
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google"
import { Providers } from "./providers"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import "./globals.css"

const displayFont = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const sansFont = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Omotenashi Curso | A Arte Japonesa da Hospitalidade",
  description: "Transforme seu atendimento ao cliente com o curso Omotenashi. Aprenda a filosofia japonesa de hospitalidade excepcional para empresas e profissionais. +2.500 alunos, 150+ empresas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://curso-omotenashi.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Omotenashi Curso | A Arte Japonesa da Hospitalidade",
    description: "Transforme seu atendimento ao cliente com o curso Omotenashi. +2.500 alunos, 150+ empresas. Acesso vitalício, certificado reconhecido.",
    type: "website",
    locale: "pt_BR",
    siteName: "Omotenashi Curso",
    url: "/",
    images: [
      {
        url: "https://omotenashi.infinity-agency.online/og-image.jpg",
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
    images: ["https://omotenashi.infinity-agency.online/og-image.jpg"],
  },
  icons: {
    icon: "/icon.svg",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#050505",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${displayFont.variable} ${sansFont.variable}`}>
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
