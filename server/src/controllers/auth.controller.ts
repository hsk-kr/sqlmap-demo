import { Request, Response } from 'express';
import {
  comparePassword,
  createUser,
  getUserByUsername,
} from '../models/user.model';
import { badRequest, errorResponse, serverErrorResponse } from './common';

export const signUp = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return badRequest(res);
  }

  const user = await getUserByUsername(username);
  if (user) {
    return errorResponse(res, 'username exists');
  }

  if (!createUser(username, password)) {
    return serverErrorResponse(res);
  }

  return res.json({ result: 'ok' });
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

  return res.json({ result: 'ok' });
};
