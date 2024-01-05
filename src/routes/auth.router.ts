import { Router } from 'express';
import { check } from 'express-validator';

import { authUser } from '../controllers/auth.controller';
import validateFields from '../middlewares/validate_fields';

const authRouter = Router();

authRouter.post(
  '/auth',
  [
    check('email', 'A valid email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validateFields,
  ],
  authUser
);

export default authRouter;
