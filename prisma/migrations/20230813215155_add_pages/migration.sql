-- CreateTable
CREATE TABLE "SourcePage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "lastRefresh" DATETIME,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "collectionId" INTEGER NOT NULL,
    CONSTRAINT "SourcePage_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
