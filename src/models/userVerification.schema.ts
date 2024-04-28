import { Schema, model } from 'mongoose';

export interface IUserVerification {
  userId: string;
  uniqueString: string;
  createdAt: Date;
  expiresAt: Date;
}

const UserVerificationSchema = new Schema<IUserVerification>({
  userId: {
    type: String,
    required: true,
  },

  uniqueString: {
    type: String,
    unique: true,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

export default model('UserVerification', UserVerificationSchema);
