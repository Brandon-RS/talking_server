import { sign, verify } from 'jsonwebtoken';

export const generateJWT = (uid: String) => {
  const secret = process.env.SECRET_JWT_SEED;

  if (!secret) {
    throw new Error('No secret JWT seed');
  }

  return new Promise((resolve, reject) => {
    sign({ uid }, secret, { expiresIn: '24h' }, (err, token) => {
      err ? reject('Could not generate token') : resolve(token);
    });
  });
};

export const verifyJWT = (token: string) => {
  const secret = process.env.SECRET_JWT_SEED;

  if (!secret) {
    throw new Error('No secret JWT seed');
  }

  try {
    const { uid } = verify(token, secret) as any;
    return [true, uid];
  } catch (error: any) {
    return [false, null];
  }
};
