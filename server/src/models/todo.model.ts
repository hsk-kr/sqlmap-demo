import { getConnection } from '../configs/db';
import { loadEnv } from '../configs/env';

loadEnv();

export interface Todo {
  id: number;
  content: string;
  done: number;
}

export const createTodoTable = () => {
  getConnection((conn) => {
    conn.execute(`CREATE TABLE IF NOT EXISTS todo (
      id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      content VARCHAR(255) NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      user_id int NOT NULL,
      CONSTRAINT \`fk_user_id\`
        FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
    )`);
  });
};

export const getTodos = async (
  userId: number,
  offset: number,
  limit: number
) => {
  return await getConnection<Todo[]>(async (conn) => {
    return await conn.query(
      `SELECT id, content, done FROM todo WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  });
};

export const getTodo = async (userId: number, id: number) => {
  const todos = await getConnection<Todo[]>(async (conn) => {
    return await conn.query(
      `SELECT id, content, done FROM todo WHERE user_id = ? and id = ?`,
      [userId, id]
    );
  });

  return todos?.length === 1 ? todos[0] : undefined;
};

export const deleteTodo = async (userId: number, id: number) => {
  return await getConnection<boolean>(async (conn) => {
    const queryRes = await conn.query(
      `DELETE FROM todo WHERE user_id = ? and id = ?`,
      [userId, id]
    );

    return queryRes.affectedRows === 1;
  });
};

export const updateTodo = async (
  userId: number,
  id: number,
  {
    content,
    done,
  }: {
    content?: string;
    done?: boolean;
  }
) => {
  return await getConnection<{
    result: boolean;
    data: Todo | undefined;
  }>(async (conn) => {
    const setFields = Object.entries({ content, done }).filter(
      ([_, value]) => value !== undefined
    );
    let set = '';
    let values = setFields.map(([_, value]) => value);

    set = setFields.map(([key]) => `${key} = ?`).join(',');

    if (set === '')
      return {
        result: false,
        data: undefined,
      };

    const queryRes = await conn.query(
      `UPDATE todo SET ${set} WHERE user_id = ? and id = ?`,
      [...values, userId, id]
    );

    return {
      result: queryRes.affectedRows === 1,
      data: await getTodo(userId, id),
    };
  });
};

export const createTodo = async (userId: number, content: string) => {
  return await getConnection<{
    result: boolean;
    data: Todo | undefined;
  }>(async (conn) => {
    const queryRes = await conn.query(
      `INSERT todo(user_id, content) VALUES(?, ?)`,
      [userId, content]
    );

    return {
      result: queryRes.affectedRows === 1,
      data: await getTodo(userId, queryRes.insertId),
    };
  });
};
