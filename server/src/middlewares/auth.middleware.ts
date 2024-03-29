import { NextFunction, Request, Response } from 'express';
import { authenticationErrorResponse } from '../libs/api-response-generator';
import { verifyToken } from '../libs/token';

const authenticate = (req: Request<any,any,any,any,{userId: number}>, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('token not exists');
    }

    const { result, data } = verifyToken(token);

    if (!result) {
      throw new Error('failed to authenticate');
    }

    res.locals.userId = data.userId;

    next();
  } catch {
    authenticationErrorResponse(res);
  }
};

export default authenticate;
