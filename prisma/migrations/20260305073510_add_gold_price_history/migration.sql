-- CreateTable
CREATE TABLE "GoldPriceHistory" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "buy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sell" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3),

    CONSTRAINT "GoldPriceHistory_pkey" PRIMARY KEY ("id")
);
