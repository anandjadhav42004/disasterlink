import "dotenv/config";
import http from "node:http";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware.js";
import { logger } from "./utils/logger.js";
import { authRouter } from "./routes/auth.routes.js";
import { sosRouter } from "./routes/sos.routes.js";
import { volunteerRouter } from "./routes/volunteer.routes.js";
import { shelterRouter } from "./routes/shelter.routes.js";
import { alertRouter } from "./routes/alert.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { mapRouter } from "./routes/map.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { requestRouter } from "./routes/request.routes.js";
import { contactRouter } from "./routes/contact.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { permissionsRouter } from "./modules/permissions/permissions.routes.js";
import { initSocket } from "./sockets/index.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (allowedOrigins.includes(requestOrigin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(apiRateLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get("user-agent") });
  next();
});

app.get("/health", (_req, res) => res.json({ success: true, status: "ok", timestamp: new Date(), uptime: process.uptime() }));
app.use("/api/auth", authRouter);
app.use("/api/sos", sosRouter);
app.use("/api/volunteer", volunteerRouter);
app.use("/api/shelters", shelterRouter);
app.use("/api/alerts", alertRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/requests", requestRouter);
app.use("/api/contact", contactRouter);
app.use("/api/map", mapRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permissions", permissionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

initSocket(server);

const port = Number(process.env.PORT ?? 8000);
server.listen(port, () => logger.info(`DisasterLink API listening on ${port}`));

export { app, server };
