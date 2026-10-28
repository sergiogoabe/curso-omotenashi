export const PAYMENT_STATUSES = [
  { id: "pending", label: "Pendente" },
  { id: "received", label: "Recebido" },
  { id: "confirmed", label: "Confirmado" },
  { id: "overdue", label: "Vencido" },
  { id: "refunded", label: "Estornado" },
  { id: "cancelled", label: "Cancelado" },
] as const

export const PAYMENT_METHODS = [
  { id: "pix", label: "PIX" },
  { id: "credit_card", label: "Cartão" },
  { id: "boleto", label: "Boleto" },
  { id: "manual", label: "Manual" },
] as const

const PAID_STATUSES = new Set(["paid", "received", "confirmed", "approved"])

export function isPaidStatus(status: string) {
  return PAID_STATUSES.has(status.toLowerCase())
}

export function paymentStatusLabel(status: string) {
  return PAYMENT_STATUSES.find((item) => item.id === status)?.label ?? status
}

export function paymentMethodLabel(method: string) {
  return PAYMENT_METHODS.find((item) => item.id === method)?.label ?? method
}

export const EVENT_TYPES = [
  { id: "in-company", label: "In-company" },
  { id: "workshop", label: "Workshop" },
  { id: "webinar", label: "Webinar" },
  { id: "selo", label: "Entrega de selo" },
  { id: "consultoria", label: "Consultoria" },
] as const

export const EVENT_STATUSES = [
  { id: "scheduled", label: "Agendado" },
  { id: "confirmed", label: "Confirmado" },
  { id: "done", label: "Realizado" },
  { id: "cancelled", label: "Cancelado" },
] as const

export function eventTypeLabel(type: string) {
  return EVENT_TYPES.find((item) => item.id === type)?.label ?? type
}

export function eventStatusLabel(status: string) {
  return EVENT_STATUSES.find((item) => item.id === status)?.label ?? status
}
