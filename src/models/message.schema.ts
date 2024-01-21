import { Schema, Types, model } from 'mongoose';

export interface IMessage {
  from: Types.ObjectId;
  to: Types.ObjectId;
  text: string;
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
