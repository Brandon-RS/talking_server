import { Request, Response } from 'express';
import usersSchema from '../models/users.schema';

const User = usersSchema;

export const createUser = async (req: Request, res: Response) => {
  const user = new User(req.body);

  await user.save();

  res.json({
    success: true,
    user,
  });
};
