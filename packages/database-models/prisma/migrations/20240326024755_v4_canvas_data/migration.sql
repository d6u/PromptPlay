-- AlterEnum
ALTER TYPE "CanvasDataSchemaVersion" ADD VALUE 'v4';

-- AlterTable
ALTER TABLE "Flow" ADD COLUMN     "canvasDataV4" JSONB NOT NULL DEFAULT 'null';
