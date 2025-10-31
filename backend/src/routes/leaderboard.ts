import { Router } from 'express';
import { AppContext } from '../app';
import { makeLeaderboardController } from '../controllers/leaderboard';
import { authenticate } from '../middleware/auth';

export const makeLeaderboardRoutes = (ctx: AppContext): Router => {
  const router = Router();
  const controller = makeLeaderboardController(ctx);

  router.post('/', authenticate, controller.create);
  router.get('/:id', authenticate, controller.getStatus);
  router.get('/join/:id', authenticate, controller.join);
   // router.get('/logout', controller.logout);

  return router;
};
