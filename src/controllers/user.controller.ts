import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import fs from 'fs';
import { createTransport } from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

import cloudinary from '../helpers/cloudinary.helper';
import logger from '../helpers/logger.helper';
import messageSchema from '../models/message.schema';
import usersSchema from '../models/users.schema';
import userVerificationSchema from '../models/userVerification.schema';

const User = usersSchema;
const Message = messageSchema;
const UserVerification = userVerificationSchema;

dotenv.config();

let transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

transporter.verify((error) =>
  error ? logger.error(`${error}`) : logger.info(`Email service is ready`)
);

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info('POST: api/users');

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

    // const token = await generateJWT(user.id);
    sendVerificationEmail(user, res);

    res.json({
      user,
      // token,
    });
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error creating user',
    });
  }
};

export const getALlUsers = async (req: Request, res: Response) => {
  const { limit = 10, from = 0 } = req.query;

  logger.info('GET: api/users');

  try {
    const users = await User.find({ _id: { $ne: req.body.uid } })
      .sort({ online: -1 })
      .skip(Number(from))
      .limit(Number(limit));

    res.json(users);
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error getting users',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`PUT: api/users/${uid}`);

  try {
    if (requestOwner !== uid) {
      return res.status(400).json({
        success: false,
        msg: "You can't update this account",
      });
    }

    const { name, email } = req.body;

    const emailExists = await User.findOne({
      email: req.body.email,
      _id: { $ne: uid },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        msg: 'Email already in use',
      });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found',
      });
    }

    res.json(user);
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error updating user',
    });
  }
};

export const getUserChats = async (req: Request, res: Response) => {
  const from = req.body.uid;
  const to = req.params.to;

  logger.info(`GET: api/users/chats/`);

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
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error getting messages',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`DELETE: api/users/${uid}`);

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
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error deleting user',
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;
  const { current_password, password } = req.body;

  logger.info(`PUT: api/users/${uid}/change-password`);

  try {
    if (requestOwner !== uid) {
      return res.status(400).json({
        success: false,
        msg: "You can't change this user`s password",
      });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found',
      });
    }

    // Check current password
    const validPassword = bcrypt.compareSync(current_password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        msg: 'Current password is incorrect',
      });
    }

    // Encrypt password
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    res.json(user);
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error changing password',
    });
  }
};

export const changeProfilePic = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`PUT: api/users/${uid}/change-profile-pic`);

  try {
    if (requestOwner !== uid) {
      return res.status(400).json({
        success: false,
        msg: "You can't change this user`s profile picture",
      });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (user.profileImage) {
      const publicId = user.profileImage.split('pics/').pop()?.split('.')[0];

      if (publicId) {
        cloudinary.uploader.destroy(`talking/profile-pics/${publicId}`, {
          invalidate: true,
          resource_type: 'image',
          type: 'authenticated',
        });
      }
    }

    cloudinary.uploader.upload(
      req.file.path,
      {
        upload_preset: 'profile-pics',
        resource_type: 'image',
        type: 'authenticated',
      },
      async (error, result) => {
        fs.unlinkSync(req.file!.path ?? '');

        if (error) {
          return res.status(500).json({
            success: false,
            error,
          });
        }

        if (result) {
          user.profileImage = result.secure_url;
          await user.save();

          return res.json({
            success: true,
            user,
            result,
          });
        }
      }
    );
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json({
      success: false,
      msg: 'Error changing profile picture',
      error,
    });
  }
};

// TODO(BRANDOM): Add interface for user, and send only required users parameters
const sendVerificationEmail = (user: any, res: Response) => {
  // const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

  logger.info(`Sending verification email to ${user.uid}`);

  const uniqueString = uuidv4() + user.uid;
  const url = `http://localhost:3000/verify-email/${user.uid}/${uniqueString}`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: 'Verify your email',
    html: `
      <h1>Email Verification</h1>
      <p>Click <a href="${url}">here</a> to verify your email</p>
      <p><span>This link expires in 2 hours</span></p>
    `,
  };

  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(uniqueString, salt);

  const userVerification = new UserVerification({
    userId: user.uid,
    uniqueString: hash,
    createdAt: new Date(),
    expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });

  userVerification
    .save()
    .then(() => {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          res.json({
            success: true,
            msg: 'Verification email sent',
          });
        })
        .catch((error) => {
          logger.error(`${error}`);

          return res.status(500).json({
            success: false,
            msg: 'Verification email failed to send',
          });
        });
    })
    .catch((error) => {
      logger.error(`${error}`);

      return res.status(500).json({
        success: false,
        msg: 'Email verification failed',
      });
    });
};
