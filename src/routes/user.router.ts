import { Router } from 'express';
import { check } from 'express-validator';

import validateFields from '../middlewares/validate_fields';
import validateJWT from '../middlewares/validate_jwt';

import {
  createUser,
  deleteUser,
  getALlUsers,
  getUserChats,
  updateUser,
} from '../controllers/user.controller';

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

userRouter.get('/users/chats/:to', validateJWT, getUserChats);

userRouter.put(
  '/users/:id',
  [validateJWT, check('id', 'id is required').not().isEmpty(), validateFields],
  updateUser
);

userRouter.delete(
  '/users/:id',
  [validateJWT, check('id', 'id is required').not().isEmpty(), validateFields],
  deleteUser
);

export default userRouter;
