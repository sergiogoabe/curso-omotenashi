import { z } from "zod"

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido").max(254),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
    .refine(value => new TextEncoder().encode(value).length <= 72, "A senha deve ter no máximo 72 bytes"),
  plan: z.enum(["free", "individual", "empresarial30", "empresarial50", "combo"]).default("individual"),
})
