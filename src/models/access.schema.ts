import { Schema, Types, model } from 'mongoose';

export interface IAccess {
  userId: Types.ObjectId;
  token: string;
  createdAt: Date;
}

const AccessSchema = new Schema<IAccess>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    token: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

export default model('Access', AccessSchema);
