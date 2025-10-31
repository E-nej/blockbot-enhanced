import { HttpError } from '../errors';
import { getPool } from './pool';
import { LevelsUsers, User } from './types'
import bcrypt from 'bcrypt'

export interface Queries {
  checkConnection(): Promise<boolean>;
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
        checkConnection: async () => {
            try {
                const { rows } = await pool.query<{ conn_test: number }>('SELECT 1 as conn_test');
                return rows[0].conn_test === 1;
            } catch {
                return false;
            }
        },

        createUser: async (username: string, email: string, password: string) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 16)
                console.log("Hashed passwrod: ", hashedPassword)
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
