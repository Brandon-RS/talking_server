import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import cloudinary from '../helpers/cloudinary.helper';
import logger from '../helpers/logger.helper';
import {
  MailServiceError,
  sendVerificationEmail,
} from '../helpers/mail.helper';
import {
  getErrorResponse,
  getSuccessResponse,
} from '../helpers/response.helper';
import messageSchema from '../models/message.schema';
import userVerificationSchema from '../models/userVerification.schema';
import usersSchema from '../models/users.schema';

const User = usersSchema;
const Message = messageSchema;
const UserVerification = userVerificationSchema;

dotenv.config();

export const createUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info('POST: api/users');

  try {
    const existsEmail = await User.findOne({ email });

    if (existsEmail) {
      return res.status(400).json(getErrorResponse('Email already in use'));
    }

    const user = new User(req.body);
    user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

    const uniqueString = uuidv4() + user._id;
    const userVerification = new UserVerification({
      userId: user._id,
      uniqueString: bcrypt.hashSync(uniqueString, bcrypt.genSaltSync()),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    const url = `${process.env.HOST_URL}/api/verify-email/${user._id}/${uniqueString}`;
    await sendVerificationEmail(user.email, url);

    await Promise.all([user.save(), userVerification.save()]);

    return res.json(getSuccessResponse(user));
  } catch (error: any) {
    logger.error(`${error}`);

    if (error instanceof MailServiceError) {
      return res.status(400).json(getErrorResponse(error.message));
    }

    return res
      .status(500)
      .json(getErrorResponse(error.message ?? 'Error creating user'));
  }
};

export const getALlUsers = async (req: Request, res: Response) => {
  const { limit = 10, from = 0 } = req.query;

  logger.info('GET: api/users');

  try {
    const [users, total] = await Promise.all([
      User.find({ _id: { $ne: req.body.uid } })
        .sort({ online: -1 })
        .skip(Number(from))
        .limit(Number(limit)),
      User.countDocuments({ _id: { $ne: req.body.uid } }),
    ]);

    res.json(getSuccessResponse({ users, total }));
  } catch (error: any) {
    logger.error(`${error}`);

    res.status(500).json(getErrorResponse('Error getting users'));
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`PUT: api/users/${uid}`);

  try {
    if (requestOwner !== uid) {
      return res
        .status(400)
        .json(getErrorResponse("You can't update this user's information"));
    }

    const { name, email } = req.body;

    const emailExists = await User.findOne({
      email: req.body.email,
      _id: { $ne: uid },
    });

    if (emailExists) {
      return res.status(400).json(getErrorResponse('Email already in use'));
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json(getErrorResponse('User not found'));
    }

    return res.json(getSuccessResponse(user));
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error updating user information'));
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

    return res.json(getSuccessResponse(messages));
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error getting user messages'));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`DELETE: api/users/${uid}`);

  try {
    if (requestOwner !== uid) {
      return res
        .status(400)
        .json(getErrorResponse("You can't delete this user's information"));
    }

    const user = await User.findByIdAndDelete(uid);

    if (!user) {
      return res
        .status(404)
        .json(getErrorResponse('User not found or already deleted'));
    }

    return res.json(getSuccessResponse(user));
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error deleting user information'));
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;
  const { current_password, password } = req.body;

  logger.info(`PUT: api/users/${uid}/change-password`);

  try {
    if (requestOwner !== uid) {
      return res
        .status(400)
        .json(getErrorResponse("You can't change this user`s password"));
    }

    const user = await User.findById(uid);

    if (!user) {
      return res
        .status(404)
        .json(getErrorResponse('User not found or already deleted'));
    }

    // Check current password
    const validPassword = bcrypt.compareSync(current_password, user.password);

    if (!validPassword) {
      return res
        .status(400)
        .json(getErrorResponse('Current password is not correct'));
    }

    // Encrypt password
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();

    return res.json(getSuccessResponse(user));
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error changing user password'));
  }
};

export const changeProfilePic = async (req: Request, res: Response) => {
  const requestOwner = req.body.uid;
  const uid = req.params.id;

  logger.info(`PUT: api/users/${uid}/change-profile-pic`);

  try {
    if (requestOwner !== uid) {
      return res
        .status(400)
        .json(getErrorResponse("You can't change this user`s profile picture"));
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json(getErrorResponse('User not found'));
    }

    if (!req.file) {
      return res
        .status(400)
        .json(getErrorResponse('Please upload a profile picture'));
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
          return res
            .status(500)
            .json(
              getErrorResponse(
                error.message ?? 'Error changing profile picture'
              )
            );
        }

        if (result) {
          user.profileImage = result.secure_url;
          await user.save();

          return res.json(getSuccessResponse({ user, result }));
        }
      }
    );
  } catch (error: any) {
    logger.error(`${error}`);

    return res
      .status(500)
      .json(getErrorResponse('Error changing user profile picture'));
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const { userId, uniqueString } = req.params;
  const webUrl = process.env.WEB_URL;
  const url = `${webUrl}/verified`;

  logger.info(`GET: api/verify-email/${userId}/${uniqueString}`);

  UserVerification.findOne({ userId })
    .then((verification) => {
      if (!verification) {
        logger.error(`${verification}`);
        const message = 'Something went wrong verifying email';
        res.redirect(`${url}?error=true&message=${message}`);
      }

      if (verification!.expiresAt < new Date()) {
        userVerificationSchema
          .deleteOne({ userId })
          .then((_) => {
            User.deleteOne({ _id: userId })
              .then((_) => {
                const message =
                  'Verification link has expired. Please sign up again!';
                res.redirect(`${url}?error=true&message=${message}`);
              })
              .catch((err) => {
                logger.error(`${err}`);

                const message = 'Error verifying email';
                res.redirect(`${url}?error=true&message=${message}`);
              });
          })
          .catch((err) => {
            logger.error(`${err}`);

            const message = 'Verification link expired';
            res.redirect(`${url}?error=true&message=${message}`);
          });
      } else {
        const valid = bcrypt.compareSync(
          uniqueString,
          verification!.uniqueString
        );

        if (!valid) {
          const message = 'Invalid verification link';
          res.redirect(`${url}?error=true&message=${message}`);
        }

        User.findByIdAndUpdate(userId, { verified: true })
          .then(() => {
            UserVerification.deleteOne({ _id: userId })
              .then((_) => {
                res.redirect(`${url}`);
              })
              .catch((err) => {
                logger.error(`${err}`);

                const message = 'Error verifying email';
                res.redirect(`${url}?error=true&message=${message}`);
              });
          })
          .catch((error) => {
            logger.error(`${error}`);

            const message = 'Error verifying email';
            res.redirect(`${url}?error=true&message=${message}`);
          });
      }
    })
    .catch((error) => {
      logger.error(`${error}`);

      const message = 'Error verifying email';
      res.redirect(`${url}?error=true&message=${message}`);
    });
};
