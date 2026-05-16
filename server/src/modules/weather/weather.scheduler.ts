import cron, { type ScheduledTask } from "node-cron";
import { logger } from "../../utils/logger.js";
import { weatherService } from "./weather.service.js";
import { emitWeatherOverlay } from "./weather.socket.js";

const jobs: ScheduledTask[] = [];
const watchCities = (process.env.WEATHER_WATCH_CITIES ?? "Mumbai,Delhi,Ahmedabad,Chennai,Kolkata,Guwahati,Bhubaneswar,Kochi")
  .split(",")
  .map((city) => city.trim())
  .filter(Boolean);

function intervalExpression(seconds: number) {
  if (seconds < 60) return `*/${Math.max(10, seconds)} * * * * *`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `*/${minutes} * * * *`;
}

async function safeRun(name: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    logger.warn(`Weather scheduler ${name} failed`, { error: error instanceof Error ? error.message : String(error) });
  }
}

export function startWeatherScheduler() {
  if (jobs.length > 0) return jobs;

  const currentInterval = Number(process.env.WEATHER_REFRESH_INTERVAL ?? 300);

  jobs.push(
    cron.schedule(intervalExpression(currentInterval), () =>
      safeRun("current-refresh", async () => {
        await weatherService.refreshCities(watchCities);
        const overlay = await weatherService.getMapOverlay();
        emitWeatherOverlay(overlay);
      })
    )
  );

  jobs.push(
    cron.schedule("*/30 * * * *", () =>
      safeRun("forecast-refresh", async () => {
        await Promise.allSettled(watchCities.map((city) => weatherService.getForecast(city)));
      })
    )
  );

  jobs.push(
    cron.schedule("*/2 * * * *", () =>
      safeRun("severe-alert-poll", async () => {
        await weatherService.pollSevereAlerts(watchCities);
      })
    )
  );

  void safeRun("initial-weather-warmup", async () => {
    await weatherService.refreshCities(watchCities.slice(0, 3));
  });

  logger.info("Weather intelligence scheduler started", { watchCities, currentInterval });
  return jobs;
}

export function stopWeatherScheduler() {
  for (const job of jobs) job.stop();
  jobs.splice(0, jobs.length);
}
