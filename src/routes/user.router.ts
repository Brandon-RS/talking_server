import { Router } from 'express';
import { check } from 'express-validator';
import { createUser } from '../controllers/user.controller';
import validateFields from '../middlewares/validate_fields';

const userRouter = Router();

userRouter.post(
  '/new',
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

export default userRouter;
