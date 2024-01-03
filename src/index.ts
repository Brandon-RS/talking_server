import dotenv from 'dotenv';
import dbConnection from './database/config';

dotenv.config();

dbConnection();
