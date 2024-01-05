import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { generateJWT } from '../helpers/jwt';
import usersSchema from '../models/users.schema';

const User = usersSchema;

export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Email or Password is not correct',
      });
    }

    // Validate password
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        msg: 'Email or Password is not correct',
      });
    }

    // Generate JWT
    const token = await generateJWT(user.id);

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error authenticating user',
    });
  }
};

export const renewToken = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    if (!uid) {
      return res.status(400).json({
        success: false,
        msg: 'No user id',
      });
    }

    const token = await generateJWT(uid);

    const user = await User.findById(uid);

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error renewing token',
    });
  }
};
