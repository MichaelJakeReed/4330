// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
//prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};
//export a singleton instance of Prisma Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

