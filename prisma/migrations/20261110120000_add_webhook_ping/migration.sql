CREATE TABLE "WebhookPing" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookPing_pkey" PRIMARY KEY ("id")
);
