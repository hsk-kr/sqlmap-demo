import { Request, Response } from 'express';
import {
  authenticationErrorResponse,
  badRequest,
  notFound,
  serverErrorResponse,
} from '../libs/api-response-generator';
import {
  createTodo as createTodoModel,
  updateTodo as updateTodoModel,
  deleteTodo as deleteTodoModel,
  getTodo as getTodoModel,
  getTodos as getTodosModel,
} from '../models/todo.model';

export const createTodo = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { content } = req.body;

  if (!userId) {
    return authenticationErrorResponse(res);
  }
  if (content === undefined) {
    return badRequest(res);
  }

  const { result, data } = await createTodoModel(userId, content);

  if (!result || !data) {
    return serverErrorResponse(res);
  }

  return res.status(201).json({ result: 'ok', data });
};

export const getTodos = async (req: Request, res: Response) => {
  const { userId } = res.locals;

  const { page = '1', limit = '10' } = req.query;

  const nPage = Number.isNaN(Number(page)) ? 1 : Number(page);
  const nLimit = Number.isNaN(Number(limit)) ? 10 : Number(limit);
  const offset = (nPage - 1) * nLimit;

  if (!userId) {
    return authenticationErrorResponse(res);
  }

  const todos = await getTodosModel(userId, offset, nLimit);
  return res.json({ result: 'ok', data: todos });
};

export const getTodo = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const todoId = Number(req.params.todoId);

  if (!userId) {
    return authenticationErrorResponse(res);
  } else if (Number.isNaN(todoId)) {
    return badRequest(res);
  }

  const todo = await getTodoModel(userId, todoId);
  if (!todo) {
    return notFound(res);
  }

  return res.json({ result: 'ok', data: todo });
};

export const updateTodo = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { content, done } = req.body;
  const todoId = Number(req.params.todoId);

  if (!userId) {
    return authenticationErrorResponse(res);
  } else if (
    Number.isNaN(todoId) ||
    (content === undefined && done === undefined)
  ) {
    return badRequest(res);
  }

  const updateTodoRes = await updateTodoModel(userId, todoId, {
    content,
    done,
  });

  if (!updateTodoRes.result || !updateTodoRes.data) {
    return serverErrorResponse(res);
  }
  return res.json({ result: 'ok', data: updateTodoRes.data });
};

export const deleteTodo = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const todoId = Number(req.params.todoId);

  if (!userId) {
    return authenticationErrorResponse(res);
  } else if (Number.isNaN(todoId)) {
    return badRequest(res);
  }

  deleteTodoModel(userId, todoId);

  return res.json({ result: 'ok' });
};
