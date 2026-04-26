/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "birth_place" TEXT,
ADD COLUMN     "blood_type" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "marital_status" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
