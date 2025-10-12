/*
  Warnings:

  - A unique constraint covering the columns `[clerkOrganizationId]` on the table `schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "clerkOrganizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "schools_clerkOrganizationId_key" ON "schools"("clerkOrganizationId");
