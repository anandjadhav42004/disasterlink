import "dotenv/config";
import http from "node:http";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware.js";
import { logger } from "./utils/logger.js";
import { authRouter } from "./routes/auth.routes.js";
import { sosRouter } from "./routes/sos.routes.js";
import { volunteerRouter } from "./routes/volunteer.routes.js";
import { shelterRouter } from "./routes/shelter.routes.js";
import { alertRouter } from "./routes/alert.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { initSocket } from "./sockets/index.js";

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimiter);

app.get("/health", (_req, res) => res.json({ success: true, status: "ok", service: "disasterlink-api" }));
app.use("/api/auth", authRouter);
app.use("/api/sos", sosRouter);
app.use("/api/volunteer", volunteerRouter);
app.use("/api/shelters", shelterRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

initSocket(server);

const port = Number(process.env.PORT ?? 8000);
server.listen(port, () => logger.info(`DisasterLink API listening on ${port}`));

export { app, server };
