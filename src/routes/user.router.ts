import { Router } from 'express';
import { check } from 'express-validator';

import { createUser, getALlUsers } from '../controllers/user.controller';
import validateFields from '../middlewares/validate_fields';
import validateJWT from '../middlewares/validate_jwt';

const userRouter = Router();

userRouter.post(
  '/users',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Email must be valid').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
    validateFields,
  ],
  createUser
);

userRouter.get('/users', validateJWT, getALlUsers);

export default userRouter;
