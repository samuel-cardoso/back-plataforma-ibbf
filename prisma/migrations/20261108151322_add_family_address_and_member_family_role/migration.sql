-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('HEAD', 'SPOUSE', 'CHILD', 'OTHER');

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "familyRole" "FamilyRole";
