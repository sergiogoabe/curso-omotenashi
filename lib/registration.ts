import { z } from "zod"

export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "")
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  const digit = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10])
}

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido").max(254),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
    .refine(value => new TextEncoder().encode(value).length <= 72, "A senha deve ter no máximo 72 bytes"),
  plan: z.enum(["individual", "empresarial30", "empresarial50", "combo"]).default("individual"),
  cpf: z.string()
    .refine(value => isValidCpf(value), "CPF inválido")
    .transform(value => value.replace(/\D/g, "")),
})
