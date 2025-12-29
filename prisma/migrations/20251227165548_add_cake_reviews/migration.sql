/*
  Warnings:

  - You are about to drop the column `contributors` on the `CoPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CoPayment" DROP COLUMN "contributors";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "razorpayAccountId" TEXT;

-- CreateTable
CREATE TABLE "CakeReview" (
    "id" TEXT NOT NULL,
    "cakeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CakeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "coPaymentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentLinkId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CakeReview_cakeId_idx" ON "CakeReview"("cakeId");

-- CreateIndex
CREATE INDEX "CakeReview_rating_idx" ON "CakeReview"("rating");

-- CreateIndex
CREATE INDEX "CakeReview_createdAt_idx" ON "CakeReview"("createdAt");

-- CreateIndex
CREATE INDEX "ReviewPhoto_reviewId_idx" ON "ReviewPhoto"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_paymentLinkId_key" ON "Contributor"("paymentLinkId");

-- AddForeignKey
ALTER TABLE "CakeReview" ADD CONSTRAINT "CakeReview_cakeId_fkey" FOREIGN KEY ("cakeId") REFERENCES "Cake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CakeReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_coPaymentId_fkey" FOREIGN KEY ("coPaymentId") REFERENCES "CoPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
