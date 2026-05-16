import cron, { type ScheduledTask } from "node-cron";
import { logger } from "../../utils/logger.js";
import { radarService } from "./radar.service.js";
import { emitDistrictRiskUpdate, emitFloodRiskUpdate, emitRadarOverlay, emitRadarUpdate, emitStormUpdate } from "./radar.socket.js";

const jobs: ScheduledTask[] = [];

function intervalExpression(seconds: number) {
  if (seconds < 60) return `*/${Math.max(10, seconds)} * * * * *`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `*/${minutes} * * * *`;
}

async function safeRun(name: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    logger.warn(`Radar scheduler ${name} failed`, { error: error instanceof Error ? error.message : String(error) });
  }
}

export function startRadarScheduler() {
  if (jobs.length > 0) return jobs;

  const radarInterval = Number(process.env.RADAR_REFRESH_INTERVAL ?? 120);

  jobs.push(
    cron.schedule(intervalExpression(radarInterval), () =>
      safeRun("radar-tiles", async () => {
        const tiles = await radarService.refreshRadar();
        emitRadarUpdate(tiles);
        emitRadarOverlay(await radarService.getRadarOverlay());
      })
    )
  );

  jobs.push(
    cron.schedule("*/3 * * * *", () =>
      safeRun("storm-analysis", async () => {
        emitStormUpdate(await radarService.refreshStormAnalysis());
      })
    )
  );

  jobs.push(
    cron.schedule("*/5 * * * *", () =>
      safeRun("flood-risk-analysis", async () => {
        emitFloodRiskUpdate(await radarService.refreshFloodRiskAnalysis());
      })
    )
  );

  jobs.push(
    cron.schedule("*/1 * * * *", () =>
      safeRun("operational-risk", async () => {
        emitDistrictRiskUpdate(await radarService.recalculateOperationalRisk());
      })
    )
  );

  void safeRun("initial-radar-warmup", async () => {
    const tiles = await radarService.refreshRadar();
    emitRadarUpdate(tiles);
  });

  logger.info("Radar intelligence scheduler started", { radarInterval });
  return jobs;
}

export function stopRadarScheduler() {
  for (const job of jobs) job.stop();
  jobs.splice(0, jobs.length);
}
