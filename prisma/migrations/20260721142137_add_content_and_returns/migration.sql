-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "calendarEventId" TEXT,
ADD COLUMN     "calendarSynced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slotDate" TIMESTAMP(3),
ADD COLUMN     "slotEnd" TEXT,
ADD COLUMN     "slotStart" TEXT;

-- AlterTable
ALTER TABLE "NewsletterSubscriber" ADD COLUMN     "confirmToken" TEXT,
ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unsubscribeToken" TEXT;

-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "boxHeight" DOUBLE PRECISION,
ADD COLUMN     "boxLength" DOUBLE PRECISION,
ADD COLUMN     "boxWidth" DOUBLE PRECISION,
ADD COLUMN     "etsyLastSync" TIMESTAMP(3),
ADD COLUMN     "etsyListingId" TEXT,
ADD COLUMN     "onlinePrice" DOUBLE PRECISION,
ADD COLUMN     "onlineStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onsiteStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plantHeight" TEXT,
ADD COLUMN     "potSize" TEXT,
ADD COLUMN     "shippingClass" TEXT DEFAULT 'standard',
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shipAddress1" TEXT NOT NULL,
    "shipAddress2" TEXT,
    "shipCity" TEXT NOT NULL,
    "shipState" TEXT NOT NULL,
    "shipZip" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL DEFAULT 'US',
    "shippingCarrier" TEXT,
    "shippingService" TEXT,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trackingNumber" TEXT,
    "shippoLabelUrl" TEXT,
    "shippedAt" TIMESTAMP(3),
    "squarePaymentId" TEXT,
    "squareOrderId" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'website',
    "etsyOrderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "storeOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDetail" TEXT,
    "isDamageClaim" BOOLEAN NOT NULL DEFAULT false,
    "photoUrls" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'requested',
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "refundType" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "squareRefundId" TEXT,
    "refundedAt" TIMESTAMP(3),
    "shippoLabelUrl" TEXT,
    "returnTracking" TEXT,
    "labelSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityTemplate" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 60,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'both',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityOverride" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "plantName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StoreOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "valueEn" TEXT NOT NULL DEFAULT '',
    "valueEs" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "contentBlockId" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL,
    "valueEs" TEXT NOT NULL,
    "savedBy" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StoreOrder_orderNumber_key" ON "StoreOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_returnNumber_key" ON "ReturnRequest"("returnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_storeOrderId_key" ON "ReturnRequest"("storeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_key_key" ON "ContentBlock"("key");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_confirmToken_key" ON "NewsletterSubscriber"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "StoreOrder" ADD CONSTRAINT "StoreOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_storeOrderId_fkey" FOREIGN KEY ("storeOrderId") REFERENCES "StoreOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreOrderItem" ADD CONSTRAINT "StoreOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "StoreOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreOrderItem" ADD CONSTRAINT "StoreOrderItem_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

