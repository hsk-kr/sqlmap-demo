import { loadEnv } from '../configs/env';
import jwt from 'jsonwebtoken';

loadEnv();

interface TokenData {
  userId: number;
}

type VerifyTokenReturnValue =
  | {
      result: true;
      data: TokenData;
    }
  | { result: false; data: undefined };

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '30m';

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
};

export const verifyToken = (token: string): VerifyTokenReturnValue => {
  try {
    const data = jwt.verify(token, JWT_SECRET) as TokenData;
    if (typeof data.userId !== 'number') throw new Error('invalid token data');

    return {
      result: true,
      data,
    };
  } catch (err) {
    return {
      result: false,
      data: undefined,
    };
  }
};
