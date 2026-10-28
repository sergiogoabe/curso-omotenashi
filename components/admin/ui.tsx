import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

export const fieldClass = "h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm text-foreground"
export const areaClass = "min-h-28 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"

export function AdminLoading() {
  return (
    <div className="py-20 text-center text-muted-foreground">
      <div className="mb-3 text-3xl animate-pulse">⛩️</div>
      <p className="text-sm">Carregando o painel</p>
    </div>
  )
}

export function PageHeading({ title, description, children }: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-display font-bold">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
}

export function StatLink({ href, label, value, hint, icon: Icon, tone = "text-red-400" }: {
  href: string
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: string
}) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full border-border/50 p-4 transition-colors hover:border-red-500/30">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className={`h-4 w-4 ${tone}`} />
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </Card>
    </Link>
  )
}
