import jwt from 'jsonwebtoken';

const generateJWT = (uid: String) => {
  const secret = process.env.SECRET_JWT_SEED || '';

  return new Promise((resolve, reject) => {
    jwt.sign({ uid }, secret, { expiresIn: '24h' }, (err, token) => {
      err ? reject('Could not generate token') : resolve(token);
    });
  });
};

export default generateJWT;
