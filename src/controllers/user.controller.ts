import { Request, Response } from 'express';
import usersSchema from '../models/users.schema';

const User = usersSchema;

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existsEmail = await User.findOne({ email });

    if (existsEmail) {
      return res.status(400).json({
        success: false,
        msg: 'Email already exists',
      });
    }

    const user = new User(req.body);

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error creating user',
    });
  }
};
