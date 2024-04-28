import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  online: boolean;
  profileImage: string;
  verified: boolean;
  isPublic: boolean;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  online: {
    type: Boolean,
    default: false,
  },

  profileImage: {
    type: String,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },
});

UserSchema.methods.toJSON = function () {
  const { __v, _id, password, ...user } = this.toObject();
  user.uid = _id;
  return user;
};

export default model('User', UserSchema);
