/*
  Warnings:

  - You are about to drop the column `likes` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "tweetId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_tweetId_username_key" ON "Like"("tweetId", "username");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
