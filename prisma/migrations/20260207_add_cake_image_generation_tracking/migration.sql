-- AddTable "CakeImageGeneration"
CREATE TABLE "CakeImageGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cakeId" TEXT,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CakeImageGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CakeImageGeneration_userId_idx" ON "CakeImageGeneration"("userId");

-- CreateIndex
CREATE INDEX "CakeImageGeneration_cakeId_idx" ON "CakeImageGeneration"("cakeId");

-- CreateIndex
CREATE INDEX "CakeImageGeneration_createdAt_idx" ON "CakeImageGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "CakeImageGeneration_userId_createdAt_idx" ON "CakeImageGeneration"("userId", "createdAt");
