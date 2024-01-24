import { Request, Response } from 'express';
import {
  comparePassword,
  createUser,
  getUserByUsername,
} from '../models/user.model';
import {
  badRequest,
  errorResponse,
  serverErrorResponse,
} from '../libs/api-response-generator';
import { generateToken } from '../libs/token';

export const signUp = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return badRequest(res);
  }

  const user = await getUserByUsername(username);

  if (user) {
    return errorResponse(res, 'username exists');
  }

  if (!(await createUser(username, password))) {
    return serverErrorResponse(res);
  }

  return res.status(201).json({ result: 'ok' });
};

export const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return badRequest(res);
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return errorResponse(res, 'user does not exist');
  }

  if (!comparePassword(user.password, password)) {
    return errorResponse(res, 'incorrect password');
  }

  const accessToken = generateToken(user.id);

  return res.json({ result: 'ok', accessToken });
};
