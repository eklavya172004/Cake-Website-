/*
  Warnings:

  - You are about to drop the column `address` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `serviceAreas` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cake" ADD COLUMN     "cakeType" TEXT,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "flavor" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "address",
DROP COLUMN "deliveryFee",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "serviceAreas",
ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "approvedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL,
    "vendorId" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "adminRole" TEXT,
    "adminPermissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "businessRegistration" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankIfscCode" TEXT NOT NULL,
    "bankAccountHolderName" TEXT NOT NULL,
    "businessProof" TEXT,
    "idProof" TEXT,
    "addressProof" TEXT,
    "cuisineTypes" TEXT[],
    "maxOrders" INTEGER,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verificationNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorLocation" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "operatingHours" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxOrders" INTEGER,
    "preparationTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorServiceArea" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "centerLatitude" DOUBLE PRECISION NOT NULL,
    "centerLongitude" DOUBLE PRECISION NOT NULL,
    "deliveryRadius" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "minDeliveryTime" INTEGER NOT NULL,
    "maxDeliveryTime" INTEGER NOT NULL,
    "freeDeliveryAbove" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxOrdersPerDay" INTEGER,
    "polygonCoordinates" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorRequest" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "details" JSONB NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorAnalytics" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderAcceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "orderCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "averageDeliveryTime" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topProducts" JSONB NOT NULL,
    "lowPerformingProducts" JSONB NOT NULL,
    "preparationTimeAvg" INTEGER NOT NULL DEFAULT 0,
    "deliveryAreaCoverage" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "messages" JSONB[],
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "maxDiscount" DOUBLE PRECISION,
    "minOrderAmount" DOUBLE PRECISION,
    "applicableTo" TEXT NOT NULL DEFAULT 'all',
    "applicableVendors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableCakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "usagePerUser" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "complainantId" TEXT NOT NULL,
    "complainantType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_vendorId_key" ON "Account"("vendorId");

-- CreateIndex
CREATE INDEX "Account_email_idx" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Account_role_idx" ON "Account"("role");

-- CreateIndex
CREATE INDEX "Account_vendorId_idx" ON "Account"("vendorId");

-- CreateIndex
CREATE INDEX "Account_isActive_idx" ON "Account"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_vendorId_key" ON "VendorProfile"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_gstNumber_key" ON "VendorProfile"("gstNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_panNumber_key" ON "VendorProfile"("panNumber");

-- CreateIndex
CREATE INDEX "VendorProfile_verificationStatus_idx" ON "VendorProfile"("verificationStatus");

-- CreateIndex
CREATE INDEX "VendorProfile_isApproved_idx" ON "VendorProfile"("isApproved");

-- CreateIndex
CREATE INDEX "VendorLocation_vendorId_idx" ON "VendorLocation"("vendorId");

-- CreateIndex
CREATE INDEX "VendorLocation_type_idx" ON "VendorLocation"("type");

-- CreateIndex
CREATE INDEX "VendorLocation_isActive_idx" ON "VendorLocation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VendorLocation_vendorId_postalCode_type_key" ON "VendorLocation"("vendorId", "postalCode", "type");

-- CreateIndex
CREATE INDEX "VendorServiceArea_vendorId_idx" ON "VendorServiceArea"("vendorId");

-- CreateIndex
CREATE INDEX "VendorServiceArea_city_state_idx" ON "VendorServiceArea"("city", "state");

-- CreateIndex
CREATE INDEX "VendorServiceArea_isAvailable_idx" ON "VendorServiceArea"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "VendorServiceArea_vendorId_pincode_key" ON "VendorServiceArea"("vendorId", "pincode");

-- CreateIndex
CREATE INDEX "VendorRequest_vendorId_idx" ON "VendorRequest"("vendorId");

-- CreateIndex
CREATE INDEX "VendorRequest_status_idx" ON "VendorRequest"("status");

-- CreateIndex
CREATE INDEX "VendorRequest_requestType_idx" ON "VendorRequest"("requestType");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAnalytics_vendorId_key" ON "VendorAnalytics"("vendorId");

-- CreateIndex
CREATE INDEX "VendorAnalytics_vendorId_idx" ON "VendorAnalytics"("vendorId");

-- CreateIndex
CREATE INDEX "VendorAnalytics_date_idx" ON "VendorAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAnalytics_vendorId_date_key" ON "VendorAnalytics"("vendorId", "date");

-- CreateIndex
CREATE INDEX "AuditLog_accountId_idx" ON "AuditLog"("accountId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_vendorId_idx" ON "SupportTicket"("vendorId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "CouponCode_code_key" ON "CouponCode"("code");

-- CreateIndex
CREATE INDEX "CouponCode_code_idx" ON "CouponCode"("code");

-- CreateIndex
CREATE INDEX "CouponCode_validFrom_validUntil_idx" ON "CouponCode"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "CouponCode_isActive_idx" ON "CouponCode"("isActive");

-- CreateIndex
CREATE INDEX "Dispute_orderId_idx" ON "Dispute"("orderId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_complainantType_idx" ON "Dispute"("complainantType");

-- CreateIndex
CREATE INDEX "Cake_cakeType_idx" ON "Cake"("cakeType");

-- CreateIndex
CREATE INDEX "Cake_flavor_idx" ON "Cake"("flavor");

-- CreateIndex
CREATE INDEX "Cake_deliveryCity_idx" ON "Cake"("deliveryCity");

-- CreateIndex
CREATE INDEX "Cake_tags_idx" ON "Cake"("tags");

-- CreateIndex
CREATE INDEX "Vendor_approvalStatus_idx" ON "Vendor"("approvalStatus");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorLocation" ADD CONSTRAINT "VendorLocation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceArea" ADD CONSTRAINT "VendorServiceArea_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorRequest" ADD CONSTRAINT "VendorRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorAnalytics" ADD CONSTRAINT "VendorAnalytics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
