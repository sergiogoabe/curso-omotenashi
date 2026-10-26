import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-black/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⛩️</span>
              <span className="font-display text-lg font-bold gradient-text">Omotenashi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforme seu atendimento com a arte japonesa da hospitalidade.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Curso</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/curso" className="hover:text-foreground transition-colors">Módulos</Link>
              <Link href="/ebook" className="hover:text-foreground transition-colors">E-book</Link>
              <Link href="#planos" className="hover:text-foreground transition-colors">Planos</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Empresas</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/selo" className="hover:text-foreground transition-colors">🏆 Selo Omotenashi</Link>
              <Link href="/in-company" className="hover:text-foreground transition-colors">🏢 In-Company</Link>
              <Link href="/rh" className="hover:text-foreground transition-colors">🏢 Para RH</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Suporte</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:contato@omotenashi.com" className="hover:text-foreground transition-colors">contato@omotenashi.com</a>
              <Link href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
              <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
              <span>🇧🇷 Feito no Brasil com ♥</span>
              <span className="text-xs mt-2">Infinity Agency . 2026 . All Rights Reserved</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}