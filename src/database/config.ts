import mongoose, { ConnectOptions } from 'mongoose';

const dbConnection = async () => {
  try {
    const mongUri = process.env.MONGO_URI || '';

    const options: ConnectOptions = {
      dbName: process.env.MONGO_DB_NAME,
    };

    await mongoose
      .connect(mongUri, options)
      .then(() => {
        console.log('✅ Database connected');
      })
      .catch((err) => {
        console.log(`❌ ${err}`);
      });
  } catch (error) {
    console.log(`❌ ${error}`);

    throw new Error('❌ Error connecting to the database');
  }
};

export default dbConnection;
