/**
 * Wrapper Asaas para Omotenashi - usa biblioteca unificada
 */

export * from "../../lib/asaas";

const INFINITY_ERP_URL = process.env.INFINITY_ERP_URL || "https://erp.infinity-agency.online";
const INFINITY_DASHBOARD_API_KEY = process.env.INFINITY_DASHBOARD_API_KEY;

async function updateErpUser(userEmail: string, plan: string, status: string = 'active') {
  if (!INFINITY_DASHBOARD_API_KEY) return;
  try {
    await fetch(`${INFINITY_ERP_URL}/api/col/omotenashi-users`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${INFINITY_DASHBOARD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: { email: userEmail },
        updates: { plan, status, updatedAt: new Date().toISOString() }
      })
    });
  } catch (err) {
    console.warn('[ERP Sync] Failed to update user:', err);
  }
}

async function dispatchToInfinityDashboard(grant: any) {
  if (!INFINITY_DASHBOARD_API_KEY) {
    console.warn("[Infinity Sync] INFINITY_DASHBOARD_API_KEY not set, skipping");
    return;
  }
  try {
    await fetch(`${INFINITY_ERP_URL}/api/webhooks/infinity-sync`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${INFINITY_DASHBOARD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event: "payment_confirmed",
        timestamp: new Date().toISOString(),
        data: {
          projectId: "omotenashi",
          projectName: "Omotenashi",
          payerId: grant.userId || grant.metadata?.payerId || grant.resourceId,
          payerName: grant.metadata?.payerName || "Cliente",
          payerEmail: grant.metadata?.payerEmail || "email@exemplo.com",
          amount: grant.amountCents ? grant.amountCents / 100 : 0,
          plan: grant.plan || grant.metadata?.plan || "individual",
          paymentId: grant.metadata?.asaasPaymentId || grant.resourceId,
          subscriptionId: grant.metadata?.asaasSubscriptionId,
          status: "confirmed",
        }
      })
    });
    console.log("[Infinity Sync] payment_confirmed dispatched for Omotenashi:", grant.resourceId);
  } catch (err) {
    console.error("[Infinity Sync] Failed to dispatch:", err);
  }
}

export interface OmotenashiPaymentContext {
  userId: string;
  userName: string;
  userEmail: string;
  userDocument: string;
  planId: string;
  planName: string;
  amountCents: number;
  description: string;
}

export interface OmotenashiPixResult {
  paymentId: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  dueDate: string;
}

export async function createOmotenashiCoursePix(context: OmotenashiPaymentContext) {
  const { createPixPayments } = await import("../../lib/asaas/pix-payments") as unknown as {
    createPixPayments: (config?: { onAccessGrant?: (grant: any) => Promise<void>; dashboardUrl?: string }) => {
      createOneTimePix: (ctx: any) => Promise<any>;
      handleWebhook: (rawBody: string, signature: string) => Promise<boolean>;
    };
  };
  
  const pix = createPixPayments({
    onAccessGrant: async (grant) => {
      const { prisma } = await import("@/lib/prisma");
      
      const userId = grant.userId;
      const plan = grant.plan || grant.metadata?.plan as string;
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: plan || "premium",
          courseAccess: true,
          coursePlan: plan,
          courseExpiresAt: grant.expiresAt || null,
        },
      });
      
      console.log("[Omotenashi Webhook] Curso liberado:", userId, plan);
      
      await dispatchToInfinityDashboard(grant);
      
      const userEmail = grant.metadata?.payerEmail || grant.metadata?.customerEmail;
      if (userEmail) await updateErpUser(userEmail, plan);
    },
  });

  const result = await pix.createOneTimePix({
    payerId: context.userId,
    payerName: context.userName,
    payerEmail: context.userEmail,
    payerDocument: context.userDocument,
    referenceId: `omotenashi_${context.userId}_${context.planId}`,
    description: context.description,
    amountCents: context.amountCents,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    externalReference: `omotenashi_${context.userId}_${context.planId}`,
  });

  return {
    paymentId: result.paymentId,
    pixCode: result.pix.payload,
    pixQrCode: result.pix.qrCodeBase64,
    amount: result.valor,
    dueDate: result.dueDate,
  };
}

export async function handleOmotenashiWebhook(rawBody: string, signature: string) {
  const { createPixPayments } = await import("../../lib/asaas/pix-payments") as unknown as {
    createPixPayments: (config?: { onAccessGrant?: (grant: any) => Promise<void>; dashboardUrl?: string }) => {
      handleWebhook: (rawBody: string, signature: string) => Promise<boolean>;
    };
  };
  
  const pix = createPixPayments({
    onAccessGrant: async (grant) => {
      const { prisma } = await import("@/lib/prisma");
      
      const userId = grant.userId;
      const plan = grant.plan || grant.metadata?.plan as string;
      
      if (grant.resourceType === "course" || grant.resourceId.startsWith("omotenashi_")) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: plan || "premium",
            courseAccess: true,
            coursePlan: plan,
            courseExpiresAt: grant.expiresAt || null,
          },
        });
        
        console.log("[Omotenashi Webhook] Curso liberado:", userId, plan);
        
        await dispatchToInfinityDashboard(grant);
        
        const userEmail = grant.metadata?.payerEmail || grant.metadata?.customerEmail;
        if (userEmail) await updateErpUser(userEmail, plan);
      }
    },
  });

  return pix.handleWebhook(rawBody, signature);
}
