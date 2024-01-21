import messageSchema, { IMessage } from '../models/message.schema';
import usersSchema from '../models/users.schema';

const User = usersSchema;
const Message = messageSchema;

export const connectUser = async (uid: String) => {
  const user = await User.findById(uid);

  if (!user) {
    throw new Error(`User with id ${uid} not found`);
  }
  console.log(`✅ ${user.id} connected`);

  user.online = true;
  await user.save();
  return user;
};

export const saveMessage = async (payload: IMessage): Promise<Boolean> => {
  try {
    const message = new Message(payload);
    await message.save();
    return true;
  } catch (error) {
    console.log(`❌ Error saving message: ${payload}: ${error}`);

    return false;
  }
};

export const disconnectUser = async (uid: String) => {
  const user = await User.findById(uid);

  if (!user) {
    throw new Error(`User with id ${uid} not found`);
  }
  console.log(`❌ ${user.id} disconnected`);

  user.online = false;
  await user.save();
  return user;
};
