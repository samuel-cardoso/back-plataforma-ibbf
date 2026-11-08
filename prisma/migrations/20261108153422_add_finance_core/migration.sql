-- CreateEnum
CREATE TYPE "FinanceRole" AS ENUM ('TREASURER', 'FISCAL_COUNCIL', 'PASTOR_VIEWER', 'COUNTER');

-- CreateEnum
CREATE TYPE "FinanceCategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "CashAccountKind" AS ENUM ('CASH', 'BANK');

-- CreateEnum
CREATE TYPE "FinanceTransactionKind" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'OPENING_BALANCE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PIX', 'CARD', 'BANK_TRANSFER', 'CHECK', 'BOLETO');

-- CreateEnum
CREATE TYPE "FinancePeriodStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "user_finance_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FinanceRole" NOT NULL,
    "canViewIndividualGiving" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_finance_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pixTxid" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinanceCategoryType" NOT NULL,
    "parentId" TEXT,
    "accountingCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "CashAccountKind" NOT NULL,
    "bankName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_transactions" (
    "id" TEXT NOT NULL,
    "kind" "FinanceTransactionKind" NOT NULL,
    "date" DATE NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "description" TEXT,
    "fundId" TEXT NOT NULL,
    "cashAccountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "method" "PaymentMethod",
    "memberId" TEXT,
    "documentNumber" TEXT,
    "transferGroupId" TEXT,
    "approvalReference" TEXT,
    "reversesId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_periods" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" "FinancePeriodStatus" NOT NULL DEFAULT 'OPEN',
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "reopenReason" TEXT,

    CONSTRAINT "finance_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_finance_roles_userId_key" ON "user_finance_roles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "funds_name_key" ON "funds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "funds_pixTxid_key" ON "funds"("pixTxid");

-- CreateIndex
CREATE UNIQUE INDEX "finance_categories_type_name_key" ON "finance_categories"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cash_accounts_name_key" ON "cash_accounts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transactions_reversesId_key" ON "finance_transactions"("reversesId");

-- CreateIndex
CREATE INDEX "finance_transactions_date_idx" ON "finance_transactions"("date");

-- CreateIndex
CREATE INDEX "finance_transactions_fundId_idx" ON "finance_transactions"("fundId");

-- CreateIndex
CREATE INDEX "finance_transactions_cashAccountId_idx" ON "finance_transactions"("cashAccountId");

-- CreateIndex
CREATE INDEX "finance_transactions_transferGroupId_idx" ON "finance_transactions"("transferGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_periods_year_month_key" ON "finance_periods"("year", "month");

-- CreateIndex
CREATE INDEX "finance_audit_logs_entity_entityId_idx" ON "finance_audit_logs"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "user_finance_roles" ADD CONSTRAINT "user_finance_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_cashAccountId_fkey" FOREIGN KEY ("cashAccountId") REFERENCES "cash_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "finance_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
