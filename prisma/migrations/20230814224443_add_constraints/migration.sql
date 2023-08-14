/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `SourcePage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_key" ON "Collection"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_url_key" ON "Collection"("url");

-- CreateIndex
CREATE UNIQUE INDEX "SourcePage_url_key" ON "SourcePage"("url");
