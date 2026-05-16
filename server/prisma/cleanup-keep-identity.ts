import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type DeleteResult = {
  table: string;
  deleted: number;
};

async function main() {
  const deleted = await prisma.$transaction(
    async (tx) => {
      const results: DeleteResult[] = [];

      const record = async (
        table: string,
        operation: () => Promise<{ count: number }>
      ) => {
        const result = await operation();
        results.push({ table, deleted: result.count });
      };

      await record("activeSessions", () => tx.activeSession.deleteMany());
      await record("refreshTokens", () => tx.refreshToken.deleteMany());
      await record("passwordResetCodes", () => tx.passwordResetCode.deleteMany());
      await record("auditLogs", () => tx.auditLog.deleteMany());
      await record("contactInquiries", () => tx.contactInquiry.deleteMany());

      await record("sosRequests", () => tx.sOSRequest.deleteMany());
      await record("volunteers", () => tx.volunteer.deleteMany());
      await record("shelters", () => tx.shelter.deleteMany());
      await record("alerts", () => tx.alert.deleteMany());

      await record("weatherAlerts", () => tx.weatherAlert.deleteMany());
      await record("weatherEvents", () => tx.weatherEvent.deleteMany());
      await record("weatherSnapshots", () => tx.weatherSnapshot.deleteMany());

      await record("radarSnapshots", () => tx.radarSnapshot.deleteMany());
      await record("floodRiskZones", () => tx.floodRiskZone.deleteMany());
      await record("stormEvents", () => tx.stormEvent.deleteMany());
      await record("operationalRisks", () => tx.operationalRisk.deleteMany());

      return results;
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    }
  );

  console.table(deleted);
  console.log(
    "Preserved: users, roles, permissions, userRoles, rolePermissions."
  );
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
