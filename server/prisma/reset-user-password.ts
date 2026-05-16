import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2];
const temporaryPassword = process.argv[3];

async function main() {
  if (!email || !temporaryPassword) {
    throw new Error("Usage: npx tsx prisma/reset-user-password.ts <email> <password>");
  }

  const password = await bcrypt.hash(temporaryPassword, 12);

  const user = await prisma.user.update({
    where: { email },
    data: {
      password,
      status: "active",
      refreshTokens: {
        deleteMany: {},
      },
      activeSessions: {
        deleteMany: {},
      },
    },
    select: {
      email: true,
      name: true,
      status: true,
    },
  });

  console.table([user]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
