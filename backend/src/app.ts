import express, { Express } from 'express';
import { Queries } from './database/queries';
import { Middleware } from './middleware';
import { makeHealthRoutes } from './routes/health';
import { makeUserRoutes } from './routes/user'
import { makeGameRoutes } from './routes/game'
import { makeLeaderboardRoutes } from './routes/leaderboard';

export interface AppContext {
    queries: Queries;
    middleware: Middleware;
}

export function makeApp(ctx: AppContext): Express {
    const app = express();
    app.use(express.json());
    app.use(ctx.middleware.logger);

    app.use('/health', makeHealthRoutes(ctx));
    app.use('/users', makeUserRoutes(ctx));
    app.use('/game', makeGameRoutes(ctx));
    app.use('/leaderboard', makeLeaderboardRoutes(ctx));

    app.use(ctx.middleware.routeNotFound);
    app.use(ctx.middleware.errorHandler);

    return app;
}
