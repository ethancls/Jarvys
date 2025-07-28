/*
  Warnings:

  - A unique constraint covering the columns `[studentId,exerciseId]` on the table `Solution` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Solution_studentId_exerciseId_key" ON "Solution"("studentId", "exerciseId");
