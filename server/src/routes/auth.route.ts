import express from 'express';
import { signIn, signUp } from '../controllers/auth.controller';
const router = express.Router();

router.post('/sign-in', signIn);

router.post('/sign-up', signUp);

export default router;
