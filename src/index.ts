import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import dbConnection from './database/config';
import { initCloudinary } from './helpers/cloudinary.helper';
import logger from './helpers/logger.helper';
import { initMailService } from './helpers/mail.helper';
import router from './routes/app.router';
import authRouter from './routes/auth.router';
import userRouter from './routes/user.router';
import socketController from './sockets/socket';

dotenv.config();
const port = process.env.PORT;
const publicPath = path.join(path.dirname(__dirname), 'public');

dbConnection();
const app = express();
app.use(express.static(publicPath));
app.use(express.json());

initCloudinary();
initMailService();

// Routes
app.use('/api', router);
app.use('/api', authRouter);
app.use('/api', userRouter);

const server = http.createServer(app);
const io = new Server(server);
socketController(io);

server.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});
