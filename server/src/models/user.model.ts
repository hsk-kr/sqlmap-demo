import crypto from 'crypto';
import { getConnection } from '../configs/db';
import { loadEnv } from '../configs/env';

loadEnv();

export interface User {
  id: number;
  username: string;
  password: string;
}

export const createUserTable = () => {
  getConnection((conn) => {
    conn.execute(`CREATE TABLE IF NOT EXISTS user (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )`);
  });
};

export const hashPwd = (password: string) => {
  const hmac = crypto.createHmac('sha256', process.env.PASSWORD_SALT ?? '');
  return hmac.update(password).digest('hex');
};

export const comparePassword = (hashedPwd: string, plainPwd: string) => {
  return hashedPwd === hashPwd(plainPwd);
};

export const getUserByUsername = async (username: string) => {
  return await getConnection<User | undefined>(async (conn) => {
    const users: User[] = await conn.query(
      `SELECT * FROM user WHERE username = ?`,
      username
    );

    return users?.length === 1 ? users[0] : undefined;
  });
};

export const createUser = async (username: string, plainPassword: string) => {
  const hashedPassword = hashPwd(plainPassword);

  return await getConnection<boolean>(async (conn) => {
    const queryRes = await conn.query(
      `INSERT user(USERNAME, PASSWORD) VALUES(?, ?)`,
      [username, hashedPassword]
    );

    return queryRes.affectedRows === 1;
  });
};
