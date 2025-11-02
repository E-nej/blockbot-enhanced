import express, { Express } from "express";
import cors from "cors";
import { Queries } from "./database/queries";
import { Middleware } from "./middleware";
import { makeHealthRoutes } from "./routes/health";
import { makeUserRoutes } from "./routes/user";
import { makeGameRoutes } from "./routes/game";
import { getConfig } from "./config";

export interface AppContext {
  queries: Queries;
  middleware: Middleware;
}

export function makeApp(ctx: AppContext): Express {
  const app = express();

  const config = getConfig();

  app.use(
    cors({
      origin: [config.frontend_url],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(ctx.middleware.logger);

  app.use("/health", makeHealthRoutes(ctx));
  app.use("/users", makeUserRoutes(ctx));
  app.use("/game", makeGameRoutes(ctx));

  app.use(ctx.middleware.routeNotFound);
  app.use(ctx.middleware.errorHandler);

  return app;
}
