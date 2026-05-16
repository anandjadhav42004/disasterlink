import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tables = [
  ["users", () => prisma.user.count()],
  ["roles", () => prisma.role.count()],
  ["permissions", () => prisma.permission.count()],
  ["userRoles", () => prisma.userRole.count()],
  ["rolePermissions", () => prisma.rolePermission.count()],
  ["activeSessions", () => prisma.activeSession.count()],
  ["refreshTokens", () => prisma.refreshToken.count()],
  ["passwordResetCodes", () => prisma.passwordResetCode.count()],
  ["auditLogs", () => prisma.auditLog.count()],
  ["sosRequests", () => prisma.sOSRequest.count()],
  ["volunteers", () => prisma.volunteer.count()],
  ["shelters", () => prisma.shelter.count()],
  ["alerts", () => prisma.alert.count()],
  ["weatherSnapshots", () => prisma.weatherSnapshot.count()],
  ["weatherAlerts", () => prisma.weatherAlert.count()],
  ["weatherEvents", () => prisma.weatherEvent.count()],
  ["radarSnapshots", () => prisma.radarSnapshot.count()],
  ["floodRiskZones", () => prisma.floodRiskZone.count()],
  ["stormEvents", () => prisma.stormEvent.count()],
  ["operationalRisks", () => prisma.operationalRisk.count()],
  ["contactInquiries", () => prisma.contactInquiry.count()]
] as const;

async function main() {
  const counts = await Promise.all(
    tables.map(async ([name, count]) => ({
      table: name,
      count: await count()
    }))
  );

  const stale = {
    expiredRefreshTokens: await prisma.refreshToken.count({ where: { expiresAt: { lt: new Date() } } }),
    expiredPasswordResetCodes: await prisma.passwordResetCode.count({ where: { expiresAt: { lt: new Date() } } }),
    oldAuditLogs30d: await prisma.auditLog.count({ where: { createdAt: { lt: new Date(Date.now() - 30 * 86400_000) } } }),
    oldWeatherSnapshots24h: await prisma.weatherSnapshot.count({ where: { observedAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } }),
    oldWeatherEvents24h: await prisma.weatherEvent.count({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } }),
    oldRadarSnapshots24h: await prisma.radarSnapshot.count({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } } }),
    inactiveWeatherAlerts: await prisma.weatherAlert.count({ where: { status: { not: "active" } } }),
    resolvedFloodRiskZones: await prisma.floodRiskZone.count({ where: { status: { not: "active" } } }),
    resolvedOrCancelledSos: await prisma.sOSRequest.count({ where: { status: { in: ["RESOLVED", "CANCELLED"] } } })
  };

  console.table(counts);
  console.log("Stale/generated cleanup candidates:");
  console.table(Object.entries(stale).map(([key, count]) => ({ key, count })));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
