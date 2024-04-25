import { Router } from 'express';
import { check } from 'express-validator';

import validateFields from '../middlewares/validate_fields';
import validateJWT from '../middlewares/validate_jwt';

import {
  changePassword,
  changeProfilePic,
  createUser,
  deleteUser,
  getALlUsers,
  getUserChats,
  updateUser,
  verifiedEmail,
  verifyUser,
} from '../controllers/user.controller';

import { upload } from '../helpers/cloudinary.helper';

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

userRouter.put(
  '/users/:id/change-password',
  [
    validateJWT,
    check(
      'current_password',
      'Password must be at least 6 characters'
    ).isLength({
      min: 6,
    }),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
    validateFields,
  ],
  changePassword
);

userRouter.put(
  '/users/:id/change-profile-pic',
  upload.single('image'),
  [validateJWT, validateFields],
  changeProfilePic
);

userRouter.get('/verify-email/:userId/:uniqueString', verifyUser);

userRouter.get('/verified', verifiedEmail);

export default userRouter;
