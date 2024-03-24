-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('RegisteredUser', 'PlaceholderUser');

-- CreateEnum
CREATE TYPE "CanvasDataSchemaVersion" AS ENUM ('v3');

-- CreateEnum
CREATE TYPE "BatchTestPresetConfigDataSchemaVersion" AS ENUM ('v1');

-- CreateTable
CREATE TABLE "LoginSession" (
    "id" UUID NOT NULL,
    "auth0IdToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "userType" "UserType" NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "profilePictureUrl" TEXT,
    "auth0UserId" TEXT,
    "placeholderClientToken" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flow" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canvasDataSchemaVersion" "CanvasDataSchemaVersion" NOT NULL,
    "canvasDataV3" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Flow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchTestPreset" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "csv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configDataSchemaVersion" "BatchTestPresetConfigDataSchemaVersion" NOT NULL,
    "configDataV1" JSONB NOT NULL,
    "userId" UUID NOT NULL,
    "flowId" UUID NOT NULL,

    CONSTRAINT "BatchTestPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0UserId_key" ON "User"("auth0UserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_placeholderClientToken_key" ON "User"("placeholderClientToken");

-- AddForeignKey
ALTER TABLE "Flow" ADD CONSTRAINT "Flow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTestPreset" ADD CONSTRAINT "BatchTestPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTestPreset" ADD CONSTRAINT "BatchTestPreset_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
