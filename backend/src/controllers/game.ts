import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'
import { AppContext } from '../app';
import { HttpError } from '../errors';

interface CompleteGameBody {
    blocks_used: string;
    stars: number;
    completed: boolean;
}

export interface GameController {
    completeGame(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

export const makeGameController = ({ queries }: AppContext): GameController => {
    return {
       completeGame: async (req, res, next) => {
            try {
                if (!req.userId) next(new HttpError(401, 'Unauthorized'));
            
                const gameId = Number(req.params.game_id);

                if (!gameId) next(new HttpError(400, 'Game ID is required'));

                const { blocks_used, stars, completed } = req.body as CompleteGameBody;

                if (blocks_used === undefined || completed === undefined) next(new HttpError(400, 'Missing required fields: blocks_used and completed'));

                if (typeof blocks_used !== 'string' || blocks_used.length <= 0) next(new HttpError(400, 'blocks_used must be a string'));

                if (typeof completed !== 'boolean') next(new HttpError(400, 'completed must be a boolean'));

                const gameExists = await queries.getUserCompletedGameById(req.userId!, gameId);
                
                if (gameExists != null) {
                    const updatedGame = await queries.updateCompletedGame(req.userId!, gameId, blocks_used, stars, completed);

                    res.status(200).json({
                        message: 'Game updated successfully',
                        game: updatedGame
                    });

                    return;
                }
                 
                const newGame = await queries.createCompletedGame(req.userId!, gameId, blocks_used, stars, completed);

                res.status(201).json({
                    message: 'Game created successfully',
                    game: newGame
                });
            } catch(error) {
                next(error)
            }
       }, 
    }
}   
