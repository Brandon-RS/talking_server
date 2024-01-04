import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
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
});

export default model('User', UserSchema);
