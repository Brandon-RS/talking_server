import mongoose, { ConnectOptions } from 'mongoose';
import logger from '../helpers/logger.helper';

const dbConnection = async () => {
  try {
    const mongUri = process.env.MONGO_URI || '';

    const options: ConnectOptions = {
      dbName: process.env.MONGO_DB_NAME,
    };

    await mongoose
      .connect(mongUri, options)
      .then(() => {
        logger.info('✅ The database is connected');
      })
      .catch((err) => {
        logger.error(`❌ ${err}`);
      });
  } catch (error) {
    logger.error(`❌ ${error}`);

    throw new Error('❌ Error connecting to the database');
  }
};

export default dbConnection;
