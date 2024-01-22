import { Response } from 'express';

export const badRequest = (res: Response) =>
  res.status(400).send('bad request');

export const notFound = (res: Response) => res.status(404).send('Not Found');

export const errorResponse = (res: Response, message: string) =>
  res.status(400).json({ result: 'error', message });

export const authenticationErrorResponse = (
  res: Response,
  message = 'failed authentication'
) =>
  res.status(401).json({ result: 'error', message: 'Failed Authentication' });

export const serverErrorResponse = (
  res: Response,
  message = 'something went wrong'
) => res.status(500).json({ result: 'error', message });
