import { Response } from 'express';

export const badRequest = (res: Response) =>
  res.status(401).send('bad request');

export const errorResponse = (res: Response, message: string) =>
  res.status(401).json({ result: 'error', message });

export const serverErrorResponse = (
  res: Response,
  message = 'something went wrong'
) => res.status(500).json({ result: 'error', message });
