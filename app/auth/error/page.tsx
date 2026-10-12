import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-display font-bold mb-4">Erro de Autenticação</h1>
        <p className="text-muted-foreground mb-8">Ocorreu um erro ao tentar autenticar. Tente novamente.</p>
        <Link href="/auth/login">
          <Button size="lg">Voltar ao Login</Button>
        </Link>
      </div>
    </div>
  )
}
