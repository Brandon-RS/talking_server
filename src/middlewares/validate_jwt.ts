import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-token');

  const secret = process.env.SECRET_JWT_SEED;

  if (!secret) {
    console.log('❌ No secret found');
    return res.status(500).json({
      success: false,
      msg: 'Internal server error',
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      msg: 'No token in request',
    });
  }

  try {
    const { uid } = verify(token, secret) as JwtPayload;

    req.body.uid = uid;
    next();
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(401).json({
      success: false,
      msg: 'Invalid token',
    });
  }
};

export default validateJWT;
