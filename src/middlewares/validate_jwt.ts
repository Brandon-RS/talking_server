import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import logger from '../helpers/logger.helper';
import { getErrorResponse } from '../helpers/response.helper';
import accessSchema from '../models/access.schema';

const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-token');

  const secret = process.env.SECRET_JWT_SEED;

  if (!secret) {
    logger.error('No secret found');

    return res
      .status(500)
      .json(
        getErrorResponse(
          'Internal server error, if this persists please contact support'
        )
      );
  }

  if (!token) {
    return res
      .status(401)
      .json(getErrorResponse('No token provided, please login again'));
  }

  try {
    const { uid } = verify(token, secret) as JwtPayload;

    const Access = accessSchema;
    const currentToken = await Access.findOne({ userId: uid, token });

    if (!currentToken) {
      return res
        .status(401)
        .json(getErrorResponse('Invalid token, please login again'));
    }

    req.body.uid = uid;
    next();
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(401)
      .json(getErrorResponse('Invalid token, please login again'));
  }
};

export default validateJWT;
