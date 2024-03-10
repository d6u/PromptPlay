-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('RegisteredUser', 'PlaceholderUser');

-- CreateEnum
CREATE TYPE "CanvasDataSchemaVersion" AS ENUM ('V3');

-- CreateEnum
CREATE TYPE "BatchTestPresetConfigDataSchemaVersion" AS ENUM ('V1');

-- CreateTable
CREATE TABLE "LoginSession" (
    "id" TEXT NOT NULL,
    "auth0IdToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "profilePictureUrl" TEXT,
    "auth0UserId" TEXT,
    "placeholderClientToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canvasDataSchemaVersion" "CanvasDataSchemaVersion" NOT NULL,
    "canvasDataV3" JSONB NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchTestPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "csv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configDataSchemaVersion" "BatchTestPresetConfigDataSchemaVersion" NOT NULL,
    "configDataV1" TEXT NOT NULL,
    "userId" TEXT,
    "flowId" TEXT,

    CONSTRAINT "BatchTestPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0UserId_key" ON "User"("auth0UserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_placeholderClientToken_key" ON "User"("placeholderClientToken");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTestPreset" ADD CONSTRAINT "BatchTestPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTestPreset" ADD CONSTRAINT "BatchTestPreset_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
