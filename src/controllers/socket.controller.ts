import usersSchema from '../models/users.schema';

const User = usersSchema;

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
