import mariadb, { Pool, PoolConnection } from 'mariadb';
import { loadEnv } from './env';
import { createUserTable } from '../models/user.model';
import { createTodoTable } from '../models/todo.model';

loadEnv();

let pool: Pool;

const initPool = async () => {
  try {
    const dbConnectionData = {
      host: process.env.MARIADB_HOST,
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWORD,
      connectionLimit: Number(process.env.MARIADB_CONNECTION_LIMIT) ?? 0,
      connectTimeout: Number(process.env.MARIADB_INIT_TIMEOUT) ?? 0,
    };

    const dbConn = await mariadb.createConnection(dbConnectionData);

    const createSqlmapDemoDatabase = async () => {
      await dbConn.execute(
        `CREATE DATABASE IF NOT EXISTS ${process.env.MARIADB_DATABASE} CHARACTER SET utf8`
      );
      await dbConn.end();
    };

    await createSqlmapDemoDatabase();

    pool = await mariadb.createPool({
      ...dbConnectionData,
      database: process.env.MARIADB_DATABASE,
    });
  } catch {
    await initPool();
  }
};

export const getConnection = async <RT>(
  cb: (conn: PoolConnection) => Promise<RT> | RT
): Promise<RT> => {
  let conn;
  let res;

  try {
    conn = await pool.getConnection();
    res = await cb(conn);
  } catch (err) {
    throw err;
  } finally {
    conn?.end();
  }
  return res;
};

export const initDatabase = async () => {
  await initPool();
  createUserTable();
  createTodoTable();
};
