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

  return new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      err ? reject('Could not verify token') : resolve(decoded);
    });
  });
};
