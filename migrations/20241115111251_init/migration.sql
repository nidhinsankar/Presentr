-- CreateTable
CREATE TABLE "GeneratedPowerpoints" (
    "id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slideCount" INTEGER NOT NULL,
    "sourceURL" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "GeneratedPowerpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasPurchasedCoins" BOOLEAN NOT NULL DEFAULT false,
    "lastCoinPurchase" TIMESTAMP(3),
    "totalSpend" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 3,
    "currentSecretForPayment" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "GeneratedPowerpoints" ADD CONSTRAINT "GeneratedPowerpoints_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
