import { PrismaClient } from "@prisma/client";
import { withExclude } from "prisma-exclude";

const prismaClientSingleton = () => {
  return withExclude(new PrismaClient());
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
