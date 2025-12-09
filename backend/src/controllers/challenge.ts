import { NextFunction, Request, Response } from 'express';
import { AppContext } from '../app';
import { HttpError } from '../errors';
import { AuthRequest } from '../middleware/auth';

interface ChallengeRequestBody {
    challengee_username: string;
}

export interface ChallengeController {
    sendChallenge(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUserChallenges(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    finishChallenge(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;

}

export const makeChallengeController = ({ queries }: AppContext): ChallengeController => {
    return {

        sendChallenge: async (req: AuthRequest, res: Response, next: NextFunction) => {
            try {
                if (!req.userId) return next(new HttpError(401, 'Unauthorized'));

                const { challengee_username } = req.body as { challengee_username: string };
                if (!challengee_username) return next(new HttpError(400, 'Missing challengee_username'));


                const challengeeUser = await queries.getUserByUsername(challengee_username);
                if (!challengeeUser) return next(new HttpError(404, 'Challengee not found'));

                const newChallenge = await queries.createChallenge(req.userId, challengeeUser.id);

                res.status(201).json({
                    success: true,
                    challenge: {
                        id: newChallenge.id,
                        challenger_username: req.userId,
                        challengee_username: challengee_username,
                    },
                    message: `Challenge created: ${req.userId} → ${challengee_username}`,
                });
            } catch (error: any) {
                next(new HttpError(500, error.message));
            }
        },


        getUserChallenges: async (req, res, next) => {
            try {
                if (!req.userId) {
                    return next(new HttpError(401, 'Unauthorized'));
                }

                const challenges = await queries.getUserChallenges(req.userId);

                const formattedChallenges = challenges.map(challenge => ({
                    id: challenge.id,
                    challenger_id: challenge.challenger_id,
                    challengee_id: challenge.challengee_id,
                    challenger_username: challenge.challenger_username,
                    challengee_username: challenge.challengee_username,
                    display: `${challenge.challenger_username} → ${challenge.challengee_username}`
                }));

                console.log(`USER ${req.userId} CHALLENGES:`, formattedChallenges.map(c => c.display));

                res.status(200).json({
                    success: true,
                    challenges: formattedChallenges
                });

            } catch (error: any) {
                next(new HttpError(500, error.message));
            }
        },
        finishChallenge: async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) return next(new HttpError(401, "Unauthorized"));

    const challengeId = Number(req.params.id);
    const { stars } = req.body;

    if (!challengeId || stars === undefined) {
      return next(new HttpError(400, "Missing challengeId or stars"));
    }

    console.log("====== FINISH CHALLENGE DEBUG ======");
    console.log("Challenge ID:", challengeId);
    console.log("Stars to deduct:", stars);

    const challenge = await queries.getChallengeById(challengeId);
    if (!challenge) {
      console.log("Challenge NOT found.");
      return next(new HttpError(404, "Challenge not found"));
    }

    const userId = challenge.challengee_id;
    console.log("User who will lose stars (challengee_id):", userId);

    // Deduct stars across levels using your queries helper
    const starsDeducted = await queries.deductStarsFromLevels(userId, stars);


            const userStats = await queries.getUserStars(userId);
        const totalStarsNow = userStats?.total_stars ?? 0;
    // Optionally, posodobi status izziva (npr. accepted/finished)
    // await queries.updateChallengeStatus(challengeId, 'finished');

    const data = await queries.getLeaderboardData(1);
    console.log("Leaderboard data after deduction:", data);

        console.log("====== USER STARS DEBUG ======");
        console.log("User ID:", userId);
        console.log("Stars deducted:", starsDeducted);
        console.log("Total stars now:", totalStarsNow);
        console.log("================================");

    res.status(200).json({
      success: true,
      message: "Challenge completed, stars deducted",
      data
    });

  } catch (err: any) {
    console.log("ERROR in finishChallenge:", err);
    next(new HttpError(500, err.message));
  }
}




    };
};