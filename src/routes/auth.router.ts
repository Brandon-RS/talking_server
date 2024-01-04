import { Router } from 'express';

const authRouter = Router();

authRouter.post('/auth', (req, res) => {
  const { username, password } = req.body;

  res.json({
    success: true,
    username,
    password,
  });
});

export default authRouter;
