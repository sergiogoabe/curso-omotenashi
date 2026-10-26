/**
 * Biblioteca unificada de pagamentos PIX - Infinity Agency
 * 
 * Fornece interface unificada para:
 * - PIX one-time (cobrança única)
 * - PIX recorrente (assinaturas COBR)
 * - Controle de acesso pós-pagamento
 * - Integração com Infinity Agency Dashboard
 */

import { 
  criarCliente, 
  criarCobrancaPix, 
  criarAssinaturaPix, 
  obterPixQrCode, 
  listarPagamentosDaAssinatura,
  consultarPagamento,
  cancelarAssinatura,
  verificarAssinaturaWebhook,
  toPixResponse,
  type AsaasCustomer,
  type AsaasPayment,
  type AsaasSubscription,
  type PixResponse,
  type CriarCobrancaPixInput,
  type CriarAssinaturaPixInput
} from "./asaas";

// ============================================================================
// TIPOS UNIFICADOS
// ============================================================================

export interface PaymentContext {
  payerId: string;
  payerName: string;
  payerEmail: string;
  payerDocument: string;
  referenceId: string;
  description: string;
  amountCents: number;
  dueDate: string;
  externalReference?: string;
}

export interface PixPaymentResult {
  paymentId: string;
  asaasCustomerId: string;
  valor: number;
  dueDate: string;
  pix: {
    payload: string;
    qrCodeBase64: string;
  };
  externalReference?: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  asaasCustomerId: string;
  paymentId: string;
  valor: number;
  dueDate: string;
  pix: {
    payload: string;
    qrCodeBase64: string;
  };
}

export type PaymentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "REFUNDED";

export interface PaymentStatusUpdate {
  paymentId: string;
  status: PaymentStatus;
  paidAt?: Date;
  amountReceived?: number;
}

export interface AccessGrant {
  resourceId: string;
  resourceType: "course" | "saas" | "dashboard" | "content";
  userId: string;
  plan?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export type AccessGrantCallback = (grant: AccessGrant) => Promise<void>;

export interface DashboardSyncPayload {
  event: "payment_created" | "payment_confirmed" | "payment_failed" | "subscription_created" | "subscription_cancelled" | "access_granted" | "access_revoked";
  timestamp: string;
  data: {
    projectId: string;
    projectName: string;
    payerId: string;
    payerName: string;
    payerEmail: string;
    amount: number;
    plan?: string;
    paymentId: string;
    subscriptionId?: string;
    status: string;
    metadata?: Record<string, unknown>;
  };
}

interface PixPaymentsConfig {
  onAccessGrant?: AccessGrantCallback;
  dashboardUrl?: string;
}

export class PixPayments {
  private asaasCustomerIdCache = new Map<string, string>();
  private accessGrantCallback?: AccessGrantCallback;

  constructor(config?: PixPaymentsConfig) {
    this.accessGrantCallback = config?.onAccessGrant;
  }

  setAccessGrantCallback(cb: AccessGrantCallback) {
    this.accessGrantCallback = cb;
  }

  async createOneTimePix(context: {
    payerId: string;
    payerName: string;
    payerEmail: string;
    payerDocument: string;
    referenceId: string;
    description: string;
    amountCents: number;
    dueDate: string;
    externalReference?: string;
  }): Promise<{
    customerId: string;
    paymentId: string;
    pix: { payload: string; qrCodeBase64: string };
    valor: number;
    dueDate: string;
  }> {
    let customerId = await this.getOrCreateCustomer({
      name: context.payerName,
      email: context.payerEmail,
      document: context.payerDocument,
      referenceId: context.payerId,
    });

    const { criarCobrancaPix, obterPixQrCode } = await import("./asaas");

    const payment = await criarCobrancaPix({
      customerId,
      valorCentavos: context.amountCents,
      descricao: context.description,
      vencimento: context.dueDate,
      externalReference: context.externalReference || context.referenceId,
    });

    const qr = await obterPixQrCode(payment.id);

    return {
      customerId,
      paymentId: payment.id,
      pix: { payload: qr.payload, qrCodeBase64: qr.encodedImage },
      valor: payment.value,
      dueDate: payment.dueDate,
    };
  }

  async createSubscriptionPix(context: {
    payerId: string;
    payerName: string;
    payerEmail: string;
    payerDocument: string;
    referenceId: string;
    description: string;
    amountCents: number;
    dueDate: string;
    externalReference?: string;
  }): Promise<{
    customerId: string;
    subscriptionId: string;
    paymentId: string;
    pix: { payload: string; qrCodeBase64: string };
    valor: number;
    dueDate: string;
  }> {
    let customerId = await this.getOrCreateCustomer({
      name: context.payerName,
      email: context.payerEmail,
      document: context.payerDocument,
      referenceId: context.payerId,
    });

    const { criarAssinaturaPix, listarPagamentosDaAssinatura, obterPixQrCode } = await import("./asaas");

    const subscription = await criarAssinaturaPix({
      customerId,
      valorCentavos: context.amountCents,
      descricao: context.description,
      primeiroVencimento: context.dueDate,
    });

    const pagamentos = await listarPagamentosDaAssinatura(subscription.id);
    const pixPayment = pagamentos.find((p: any) => p.status === "PENDING" || p.status === "AWAITING_PAYMENT") ?? pagamentos[0];
    
    if (!pixPayment) {
      throw new Error("Asaas não gerou a cobrança PIX da assinatura");
    }

    const qr = await obterPixQrCode(pixPayment.id);

    return {
      customerId,
      subscriptionId: subscription.id,
      paymentId: pixPayment.id,
      pix: { payload: qr.payload, qrCodeBase64: qr.encodedImage },
      valor: pixPayment.value,
      dueDate: pixPayment.dueDate,
    };
  }

  private async getOrCreateCustomer(params: {
    name: string;
    email: string;
    document: string;
    referenceId: string;
  }): Promise<string> {
    const cacheKey = `customer:${params.referenceId}`;
    if (this.asaasCustomerIdCache.has(cacheKey)) {
      return this.asaasCustomerIdCache.get(cacheKey)!;
    }

    const { criarCliente } = await import("./asaas");
    const customer = await criarCliente(params.name, params.email, params.document);
    this.asaasCustomerIdCache.set(cacheKey, customer.id);
    return customer.id;
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; paidAt?: Date }> {
    const { consultarPagamento } = await import("./asaas");
    const payment = await consultarPagamento(paymentId);
    return {
      status: payment.status,
      paidAt: payment.status === "RECEIVED" ? new Date() : undefined,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { cancelarAssinatura } = await import("./asaas");
    await cancelarAssinatura(subscriptionId);
  }

  async handleWebhook(rawBody: string, signature: string): Promise<boolean> {
    const { verificarAssinaturaWebhook } = await import("./asaas");
    const valid = await verificarAssinaturaWebhook(rawBody, signature);
    if (!valid) {
      console.error("[PixPayments] Assinatura inválida");
      return false;
    }

    const event = JSON.parse(rawBody);
    
    if (event.event === "PAYMENT_RECEIVED" || event.event === "PAYMENT_CONFIRMED") {
      const payment = event.payment;
      await this.handlePaymentConfirmed(payment);
      return true;
    }

    if (event.event === "PAYMENT_OVERDUE" || event.event === "PAYMENT_DELETED") {
      const payment = event.payment;
      await this.handlePaymentFailed(payment);
      return true;
    }

    if (event.event === "SUBSCRIPTION_CANCELLED" || event.event === "SUBSCRIPTION_EXPIRED") {
      const subscription = event.subscription;
      await this.handleSubscriptionCancelled(subscription);
      return true;
    }

    return true;
  }

  protected async handlePaymentConfirmed(payment: any): Promise<void> {
    console.log("[PixPayments] Pagamento confirmado:", payment.id, payment.value);
    
    if (this.accessGrantCallback && payment.externalReference) {
      try {
        await this.accessGrantCallback({
          resourceId: payment.externalReference,
          resourceType: "saas",
          userId: payment.externalReference,
          plan: "premium",
          metadata: { asaasPaymentId: payment.id, amount: payment.value },
        });
      } catch (e) {
        console.error("[PixPayments] Erro ao liberar acesso:", e);
      }
    }
  }

  protected async handlePaymentFailed(payment: any): Promise<void> {
    console.log("[PixPayments] Pagamento falhou/expirou:", payment.id);
  }

  protected async handleSubscriptionCancelled(subscription: any): Promise<void> {
    console.log("[PixPayments] Assinatura cancelada/expirada:", subscription.id);
  }
}

export function createPixPayments(config?: {
  onAccessGrant?: AccessGrantCallback;
  dashboardUrl?: string;
}) {
  return new PixPayments(config);
}

export async function syncToInfinityDashboard(payload: {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}): Promise<boolean> {
  const dashboardUrl = process.env.INFINITY_DASHBOARD_URL || "https://erp.infinity-agency.online";
  const apiKey = process.env.INFINITY_DASHBOARD_API_KEY;
  
  if (!apiKey) {
    console.warn("[Infinity Dashboard] API Key não configurada - pulando sincronização");
    return false;
  }

  try {
    const res = await fetch(`${dashboardUrl}/api/webhooks/infinity-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[Infinity Dashboard] Falha na sincronização:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (e) {
    console.error("[Infinity Dashboard] Erro na sincronização:", e);
    return false;
  }
}

export async function syncPaymentConfirmed(params: {
  projectId: string;
  projectName: string;
  payerId: string;
  payerName: string;
  payerEmail: string;
  amount: number;
  plan?: string;
  paymentId: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await syncToInfinityDashboard({
    event: "payment_confirmed",
    timestamp: new Date().toISOString(),
    data: {
      projectId: params.projectId,
      projectName: params.projectName,
      payerId: params.payerId,
      payerName: params.payerName,
      payerEmail: params.payerEmail,
      amount: params.amount,
      plan: params.plan,
      paymentId: params.paymentId,
      subscriptionId: params.subscriptionId,
      status: "confirmed",
      metadata: params.metadata,
    },
  });
}

export async function syncAccessGranted(params: {
  projectId: string;
  projectName: string;
  userId: string;
  resourceType: "course" | "saas" | "dashboard" | "content";
  resourceId: string;
  plan?: string;
  expiresAt?: Date;
  paymentId: string;
}): Promise<void> {
  await syncToInfinityDashboard({
    event: "access_granted",
    timestamp: new Date().toISOString(),
    data: {
      projectId: params.projectId,
      projectName: params.projectName,
      payerId: params.userId,
      payerName: "",
      payerEmail: "",
      amount: 0,
      plan: params.plan,
      paymentId: params.paymentId,
      status: "access_granted",
      metadata: {
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        expiresAt: params.expiresAt?.toISOString(),
      },
    },
  });
}
