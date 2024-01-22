import { Schema, Types, model } from 'mongoose';

export interface IMessage {
  from: Types.ObjectId;
  to: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: '6h' },
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.methods.toJSON = function () {
  const { __v, _id, ...object } = this.toObject();
  return object;
};

export default model('Message', MessageSchema);
