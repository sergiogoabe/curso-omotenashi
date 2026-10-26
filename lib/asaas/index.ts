/**
 * Biblioteca Unificada Asaas + PIX - Infinity Agency
 * 
 * Exporta tudo o que os projetos precisam para:
 * - PIX one-time (cobrança única)
 * - PIX recorrente (assinaturas COBR)
 * - Webhooks e controle de acesso
 * - Sincronização com Infinity Agency Dashboard
 */

// Asaas core
export * from "./asaas";

// PixPayments - classe principal
export * from "./pix-payments";

// Tipos, classes e sync: tudo reexportado por "export *" acima
