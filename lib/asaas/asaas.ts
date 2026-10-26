/**
 * Biblioteca unificada Asaas para PIX (one-time + recorrência)
 * Usada por todos os projetos: ComandaAI, Rent-Family, Contabil-AI, Omotenashi
 */

import { createHmac, timingSafeEqual } from "crypto";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const BASE = (process.env.ASAAS_ENV === "sandbox" || process.env.ASAAS_ENV === "homologacao")
  ? "https://api-sandbox.asaas.com/v3"
  : "https://api.asaas.com/v3";

interface AsaasHeaders {
  "Content-Type": "application/json";
  access_token: string;
}

function getHeaders(): AsaasHeaders {
  const token = process.env.ASAAS_API_KEY || process.env.ASAAS_SECRET_KEY;
  if (!token) throw new Error("ASAAS_API_KEY não configurada");
  return { "Content-Type": "application/json", access_token: token };
}

async function asaas<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method,
    headers: getHeaders() as unknown as Record<string, string>,
  };
  
  if (body !== undefined) {
    init.body = JSON.stringify(body as Record<string, unknown>);
  }

  const res = await fetch(`${BASE}${path}`, init);
  const json = (await res.json().catch(() => ({}))) as { 
    errors?: Array<{ description?: string }>; 
    message?: string 
  };
  if (!res.ok) {
    const msg = json.errors?.[0]?.description ?? json.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

export async function criarCliente(nome: string, email: string, cpfCnpj: string): Promise<AsaasCustomer> {
  return asaas<AsaasCustomer>("POST", "/customers", {
    name: nome,
    email,
    cpfCnpj: onlyDigits(cpfCnpj),
    type: onlyDigits(cpfCnpj).length === 11 ? "FISICA" : "JURIDICA",
  });
}

export interface AsaasSubscription {
  id: string;
  status: string;
  nextDueDate: string;
}

export interface CriarAssinaturaPixInput {
  customerId: string;
  valorCentavos: number;
  descricao: string;
  primeiroVencimento: string;
}

export async function criarAssinaturaPix(input: CriarAssinaturaPixInput): Promise<AsaasSubscription> {
  return asaas<AsaasSubscription>("POST", "/subscriptions", {
    customer: input.customerId,
    billingType: "PIX",
    cycle: "MONTHLY",
    value: input.valorCentavos / 100,
    nextDueDate: input.primeiroVencimento,
    description: input.descricao,
  });
}

export interface AsaasPayment {
  id: string;
  subscription?: string | null;
  value: number;
  netValue?: number | null;
  status: string;
  dueDate: string;
  invoiceUrl?: string | null;
  pixQrCode?: string;
  pixPayload?: string;
}

export async function listarPagamentosDaAssinatura(subscriptionId: string): Promise<AsaasPayment[]> {
  const r = await asaas<{ data: AsaasPayment[] }>(
    "GET",
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=10`
  );
  return r.data ?? [];
}

export interface PixQrCode {
  payload: string;
  encodedImage: string;
  expirationDate?: string | null;
}

export async function obterPixQrCode(paymentId: string): Promise<PixQrCode> {
  return asaas<PixQrCode>("GET", `/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

export interface CriarCobrancaPixInput {
  customerId: string;
  valorCentavos: number;
  descricao: string;
  vencimento: string;
  externalReference?: string;
}

export async function criarCobrancaPix(input: CriarCobrancaPixInput): Promise<AsaasPayment> {
  return asaas<AsaasPayment>("POST", "/payments", {
    customer: input.customerId,
    billingType: "PIX",
    value: input.valorCentavos / 100,
    dueDate: input.vencimento,
    description: input.descricao,
    externalReference: input.externalReference,
  });
}

export async function consultarPagamento(paymentId: string): Promise<AsaasPayment> {
  return asaas<AsaasPayment>("GET", `/payments/${encodeURIComponent(paymentId)}`);
}

export async function cancelarAssinatura(subscriptionId: string): Promise<AsaasSubscription> {
  return asaas<AsaasSubscription>(
    "POST",
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { status: "INACTIVE" }
  );
}

export async function verificarAssinaturaWebhook(
  rawBody: string, 
  assinaturaRecebida: string
): Promise<boolean> {
  const secret = process.env.ASAAS_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(hmac, "utf8");
  const b = Buffer.from(assinaturaRecebida, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface PixResponse {
  paymentId: string;
  valor: number;
  dueDate: string;
  pix: {
    payload: string;
    qrCodeBase64: string;
    qrCodeUrl?: string;
  };
  externalReference?: string;
}

export function toPixResponse(payment: any, qr: { payload: string; encodedImage: string }): any {
  return {
    paymentId: payment.id,
    valor: payment.value,
    dueDate: payment.dueDate,
    pix: {
      payload: qr.payload,
      qrCodeBase64: qr.encodedImage,
    },
  };
}
