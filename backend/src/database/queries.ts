import { HttpError } from '../errors';
import { getPool } from './pool';
import { Leaderboard, LevelsUsers, LeaderboardRow, User, UsersLeaderboard } from './types'
import bcrypt from 'bcrypt'

export interface Queries {
  checkConnection(): Promise<boolean>;
  addToLeaderbaord(user: number, leaderboard: number): Promise<void>;
  removeFromLeaderbaord(user: number): Promise<void>;
  getLeaderboardData(leaderboard: number): Promise<Array<LeaderboardRow>>
  getUserLeaderdboard(user: number): Promise<UsersLeaderboard | null>;
  removeLeaderboard(id: number): Promise<void>;
  createLeaderbaord(name: string, creator: number): Promise<Leaderboard>;
  getLeaderboardById(id: number): Promise<Leaderboard | null>;
  getLeaderboardByUser(creator: number): Promise<Leaderboard | null>;
  createUser(username: string, email: string, password: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
  getUserCompletedGameById(userId: number, gameId: number): Promise<LevelsUsers | null>;
  createCompletedGame(userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean): Promise<LevelsUsers | null>;
  updateCompletedGame(userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean): Promise<LevelsUsers | null>;
  /*getAllPeople(): Promise<Person[]>;
  addPerson(person: Person): Promise<Person>;*/
}

export const makeQueries = (databaseUrl: string): Queries => {
    const pool = getPool(databaseUrl);

    return {
        getLeaderboardData: async (leaderboard: number) => {
            const { rows } = await pool.query<LeaderboardRow>(`
                    SELECT
                        ul.user AS user,
                        SUM(lu.blocks_used) AS blocks 
                    FROM users_leaderboard ul
                    JOIN levels_users lu ON lu.user = ul.user
                    WHERE ul.leaderboard = $1
                    GROUP BY ul.user
                    ORDER BY blocks DESC`,
                    [leaderboard]
            );

            return rows;
        },

        checkConnection: async () => {
            try {
                const { rows } = await pool.query<{ conn_test: number }>('SELECT 1 as conn_test');
                return rows[0].conn_test === 1;
            } catch {
                return false;
            }
        },

        addToLeaderbaord: async (user: number, leaderboard: number) => {
            const { rowCount } = await pool.query<UsersLeaderboard>(
                `INSERT INTO "users_leaderboard" ("user", leaderboard)
                 VALUES ($1, $2)
                 RETURNING id, "user", leaderboard`,
                 [user, leaderboard]
            );

            if (rowCount === 0) {
                throw new HttpError(500, "Failed to add user to leaderboard");
            }
        }, 

        removeFromLeaderbaord: async (user: number) => {
            const { rowCount } = await pool.query(
                `DELETE FROM "users_leaderboard" WHERE "user" = $1`,
                [user]
            );

            if(rowCount === 0) {
                throw new HttpError(404, "User not in any leaderbaords");
            }
        },
  
        getUserLeaderdboard: async (user: number) => {
            const { rows, rowCount } = await pool.query<UsersLeaderboard>(
                `SELECT id, "user", Leaderboard
                 FROM "users_leaderboard"
                 WHERE "user" = $1`,
                [user]
            );

            return rows[0] || null;
        },

        removeLeaderboard: async (id: number) => {
            const { rowCount } = await pool.query(
                `DELETE FROM "leaderboard" WHERE id = $1`,
                [id]
            );

            if(rowCount === 0) {
                throw new HttpError(404, "Failed to delete specified leaderboard");
            }
        },

        getLeaderboardById: async (id: number) => {
            const { rows } = await pool.query<Leaderboard>(
                `SELECT id, name, creator, "createdAt"
                 FROM "leaderboard"
                 WHERE id = $1`,
                [id] 
            );
            
            return rows[0] || null;
        },

        getLeaderboardByUser: async (creator: number) => {
            const { rows } = await pool.query<Leaderboard>(
                `SELECT id, name, creator, "createdAt"
                 FROM "leaderboard"
                 WHERE creator = $1
                 LIMIT 1`,
                [creator] 
            );
            
            return rows[0] || null;
        },

        createLeaderbaord: async (name: string, creator: number) => {
            const { rows, rowCount } = await pool.query<Leaderboard>(
                `INSERT INTO "leaderboard" (name, creator)
                 VALUES ($1, $2)
                 RETURNING id, name, creator, "createdAt"`,
                 [name, creator]
            );

            if (rowCount !== 1) {
                throw new HttpError(500, 'Failed to create leaderboard');
            }

            return rows[0];
        },

        createUser: async (username: string, email: string, password: string) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 16)
                const { rows, rowCount } = await pool.query<User>(
                    `INSERT INTO "user" (username, email, password)
                     VALUES ($1, $2, $3)
                     RETURNING id, username, email, "createdAt"`,
                    [username, email, hashedPassword]
                );

                if (rowCount !== 1) {
                    throw new HttpError(500, 'Failed to create user');
                }

                return rows[0]
            }
            catch (error: any) {
                throw error
            }
        },

        getUserByUsername: async (username: string) => {
            try {
                const { rows } = await pool.query<User>(
                    `SELECT id, username, email, password, "createdAt"
                     FROM "user"
                     WHERE username = $1`,
                    [username]
                );
                return rows[0] || null;
            }
            catch (error) {
                throw error;
            }
        },

        getUserById: async (id: number) => {
            try {
                const { rows } = await pool.query<User>(
                    `SELECT id, username, email, password, "createdAt"
                     FROM "user"
                     WHERE id = $1`,
                    [id] 
                );
                return rows[0] || null;
            }
            catch(error) {
                throw error;
            }
        },
        
        getUserCompletedGameById: async (userId: number, gameId: number) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `SELECT id 
                     FROM "levels_users" 
                     WHERE "user" = $1 
                     AND "level" = $2`,
                     [userId, gameId]
                );
                
                return rows[0] || null;
            } catch (error) {
                throw error;
            }
        }, 

        updateCompletedGame: async (userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `UPDATE "levels_users"
                     SET blocks_used = $1,
                         stars = $2
                     WHERE "user" = $3 AND "level" = $4
                     RETURNING *`,
                    [blocks_used, stars, userId, gameId]
                );

                return rows[0] || null
            } catch(error) {
                throw error;
            }
        },

        createCompletedGame: async (userId: number, gameId: number, blocks_used: string, stars: number, completed: boolean) => {
            try {
                const { rows } = await pool.query<LevelsUsers>(
                    `INSERT INTO "levels_users" ("user", "level", blocks_used, stars)
                     VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                     [userId, gameId, blocks_used, stars]
                );

                return rows[0] || null
            } catch(error) {
                throw error;
            }

        }
    };
}


/*import { Person } from './types';

export interface Queries {
  checkConnection(): Promise<boolean>;
  getAllPeople(): Promise<Person[]>;
  addPerson(person: Person): Promise<Person>;
}

export const makeQueries = (databaseUrl: string): Queries => {
  const pool = getPool(databaseUrl);

  return {
    checkConnection: async () => {
      try {
        const { rows } = await pool.query<{ conn_test: number }>('SELECT 1 as conn_test');
        return rows[0].conn_test === 1;
      } catch {
        return false;
      }
    },
    getAllPeople: async () => {
      const { rows } = await pool.query<Person>(
        `
        SELECT name, age
        FROM people
        `,
      );
      return rows;
    },
    addPerson: async ({ name, age }) => {
      const { rows, rowCount } = await pool.query<Person, [string, number]>(
        `
        INSERT INTO people (name, age)
        VALUES ($1, $2)
        RETURNING name, age
        `,
        [name, age],
      );
      if (rowCount !== 1) {
        throw new HttpError(500, 'Something went wrong');
      }
      return rows[0];
    },
  };
};*/
