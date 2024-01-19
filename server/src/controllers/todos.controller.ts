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

export const craeteTodo = async (req: Request, res: Response) => {
  const { userId } = res.locals;
  const { content } = req.body;

  if (!userId) {
    return authenticationErrorResponse(res);
  }
  if (content === undefined) {
    return badRequest(res);
  }

  if (!(await createTodoModel(userId, content))) {
    return serverErrorResponse(res);
  }

  return res.json({ result: 'ok' });
};

export const getTodos = async (req: Request, res: Response) => {
  const { userId } = res.locals;

  if (!userId) {
    return authenticationErrorResponse(res);
  }

  const todos = await getTodosModel(userId);
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
  } else if (Number.isNaN(todoId)) {
    return badRequest(res);
  } else if (content === undefined && done === undefined) {
    return badRequest(res);
  }

  const success = updateTodoModel(userId, todoId, { content, done });
  if (!success) {
    return serverErrorResponse(res);
  }
  return res.json({ result: 'ok' });
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
