import { HttpError } from '../errors';
import { getPool } from './pool';
import { User } from './types'
import bcrypt from 'bcrypt'

export interface Queries {
  checkConnection(): Promise<boolean>;
  createUser(username: string, email: string, password: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
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
