import { Schema, model } from 'mongoose';

const UserVerificationSchema = new Schema({
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

  expiredAt: {
    type: Date,
    required: true,
  },
});

export default model('UserVerification', UserVerificationSchema);
