import { NextFunction, Request, Response } from 'express';
import { AppContext } from '../app';
import { HttpError } from '../errors';
import { getConfig } from '../config';
import { AuthRequest } from '../middleware/auth';
import { b } from 'vitest/dist/chunks/suite.d.FvehnV49.js';

interface CreateBody {
    name: string
}

export interface LeaderboardController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    join(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

export const makeLeaderboardController = ({ queries }: AppContext): LeaderboardController => {
    const config = getConfig();

    return {
        create: async (req, res, next) => {
            try {
                const { name } = req.body as CreateBody;
                
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                }

                let leaderbaord = queries.getLeaderboardByUser(req.userId!);
                let inLeaderboard = queries.getUserLeaderdboard(req.userId!);

                if(leaderbaord != null) {
                    queries.removeLeaderboard(req.userId!);
                }

                if(inLeaderboard != null) {
                    queries.removeFromLeaderbaord(req.userId!);
                }

                let newLeaderboard = queries.createLeaderbaord(name, req.userId!);

                if(newLeaderboard == null) {
                    next(new HttpError(500, "Failed to create leaderboard"));
                }

                res.status(200).json(newLeaderboard)

            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        },

        join: async (req, res, next) => {
            try {
                const { id } = req.params;
                
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                }

                let leaderbaord = queries.getLeaderboardByUser(req.userId!);
                let inLeaderboard = queries.getUserLeaderdboard(req.userId!);

                if(leaderbaord != null) {
                    queries.removeLeaderboard(req.userId!);
                }

                if(inLeaderboard != null) {
                    queries.removeFromLeaderbaord(req.userId!);
                }

                queries.addToLeaderbaord(req.userId!, parseInt(id));

                res.status(200).send();
            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        },

        getStatus: async (req, res, next) => {
            try {
                const { id } = req.params;
                
                if (!req.userId) {
                    next(new HttpError(401, 'Unauthorized'));
                }

                let data = queries.getLeaderboardData(parseInt(id));

                res.status(200).json(data);
            } catch(error: any) {
                next(new HttpError(500, error.message));
            }
        }
    }
}

