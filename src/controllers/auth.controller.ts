import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { generateJWT } from '../helpers/jwt';
import logger from '../helpers/logger.helper';
import {
  getErrorResponse,
  getSuccessResponse,
} from '../helpers/response.helper';
import accessSchema from '../models/access.schema';
import usersSchema from '../models/users.schema';

const User = usersSchema;
const Access = accessSchema;

export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info(`POST: api/auth - ${email}`);

  try {
    // Validate email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json(getErrorResponse('Email or Password is not correct'));
    }

    if (!user.verified) {
      return res
        .status(400)
        .json(getErrorResponse('Please verify your account first'));
    }

    // Validate password
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res
        .status(400)
        .json(getErrorResponse('Email or Password is not correct'));
    }

    // Generate JWT
    const token = await generateJWT(user.id);

    await handleAccessToken(user._id.toString(), token);

    return res.json(getSuccessResponse({ user, token }));
  } catch (error: any) {
    logger.error(`POST: api/auth - ${email} - ${error}`);

    return res.status(500).json(getErrorResponse('Error authenticating user'));
  }
};

export const renewToken = async (req: Request, res: Response) => {
  const { uid } = req.body;

  logger.info(`GET: api/renew-token - ${uid}`);

  try {
    if (!uid) {
      return res
        .status(400)
        .json(getErrorResponse('Error renewing user token, invalid token'));
    }

    const user = await User.findById(uid);

    if (!(user?.verified ?? false)) {
      return res
        .status(400)
        .json(getErrorResponse('Please verify your account first'));
    }

    const token = await generateJWT(uid);

    await handleAccessToken(uid, token);

    return res.json(getSuccessResponse({ user, token }));
  } catch (error: any) {
    logger.error(`GET: api/renew-token - ${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error renewing token, please try again later'));
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const { uid } = req.body;

  logger.info(`POST: api/renew-token - ${uid}`);

  try {
    if (!uid) {
      return res
        .status(400)
        .json(getErrorResponse('Error logging out user, invalid token'));
    }

    await Access.deleteMany({ userId: uid });

    return res.json(getSuccessResponse('User logged out'));
  } catch (error: any) {
    logger.error(`GET: api/renew-token - ${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error renewing token, please try again later'));
  }
};

const handleAccessToken = async (uid: string, token: any) => {
  const currentToken = await Access.findOne({ userId: uid });

  if (currentToken) {
    await Access.findByIdAndDelete(currentToken.id);
  }

  await Access.create({ userId: uid, token });
};
