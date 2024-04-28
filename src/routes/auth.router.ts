import { Router } from 'express';
import { check } from 'express-validator';

import {
  authUser,
  logoutUser,
  renewToken,
} from '../controllers/auth.controller';
import validateFields from '../middlewares/validate_fields';
import validateJWT from '../middlewares/validate_jwt';

const authRouter = Router();

authRouter.get('/renew-token', validateJWT, renewToken);

authRouter.post(
  '/auth',
  [
    check('email', 'A valid email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validateFields,
  ],
  authUser
);

authRouter.post('/logout', validateJWT, logoutUser);

export default authRouter;
