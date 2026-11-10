-- AlterTable
ALTER TABLE "PendingRegistration" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "asaasPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_asaasPaymentId_key" ON "PendingRegistration"("asaasPaymentId");
