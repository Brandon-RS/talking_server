import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { generateJWT } from '../helpers/jwt';
import messageSchema from '../models/message.schema';
import usersSchema from '../models/users.schema';

const User = usersSchema;
const Message = messageSchema;

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existsEmail = await User.findOne({ email });

    // Check if email exists
    if (existsEmail) {
      return res.status(400).json({
        success: false,
        msg: 'Email already exists',
      });
    }

    const user = new User(req.body);

    // Encrypt password
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    const token = await generateJWT(user.id);

    res.json({
      user,
      token,
    });
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error creating user',
    });
  }
};

export const getALlUsers = async (req: Request, res: Response) => {
  const { limit = 10, from = 0 } = req.query;

  try {
    const users = await User.find({ _id: { $ne: req.body.uid } })
      .sort({ online: -1 })
      .skip(Number(from))
      .limit(Number(limit));

    res.json(users);
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error getting users',
    });
  }
};

export const getUserChats = async (req: Request, res: Response) => {
  const from = req.body.uid;
  const to = req.params.to;

  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    })
      .sort({ createdAt: 'desc' })
      .limit(30);

    res.json(messages);
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error getting messages',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  try {
    if (requestOwner !== uid) {
      return res.status(400).json({
        success: false,
        msg: "You can't delete this account",
      });
    }

    const user = await User.findByIdAndDelete(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found',
      });
    }

    res.json(user);
  } catch (error: any) {
    console.log(`❌ ${error}`);
    res.status(500).json({
      success: false,
      msg: 'Error deleting user',
    });
  }
};
