-- Selo Omotenashi: ciclo de vida da certificação + intenção de compra do selo

CREATE TABLE "Certification" (    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'treinando',
    "verifyCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingCertification" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cnpj" TEXT,
    "tier" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "asaasPaymentId" TEXT,
    "pixPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingCertification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certification_verifyCode_key" ON "Certification"("verifyCode");
CREATE INDEX "Certification_companyId_idx" ON "Certification"("companyId");
CREATE INDEX "Certification_status_idx" ON "Certification"("status");
CREATE INDEX "Certification_expiresAt_idx" ON "Certification"("expiresAt");

CREATE UNIQUE INDEX "PendingCertification_email_key" ON "PendingCertification"("email");
CREATE UNIQUE INDEX "PendingCertification_asaasPaymentId_key" ON "PendingCertification"("asaasPaymentId");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
