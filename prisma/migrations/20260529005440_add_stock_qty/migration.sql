-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameEn" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionEs" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockQty" INTEGER NOT NULL DEFAULT 10,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL DEFAULT '',
    "careLevel" TEXT NOT NULL DEFAULT 'easy',
    "sunlight" TEXT NOT NULL DEFAULT 'full',
    "water" TEXT NOT NULL DEFAULT 'moderate',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plant" ("careLevel", "category", "createdAt", "descriptionEn", "descriptionEs", "featured", "id", "imageUrl", "inStock", "nameEn", "nameEs", "price", "sunlight", "tags", "updatedAt", "water") SELECT "careLevel", "category", "createdAt", "descriptionEn", "descriptionEs", "featured", "id", "imageUrl", "inStock", "nameEn", "nameEs", "price", "sunlight", "tags", "updatedAt", "water" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
