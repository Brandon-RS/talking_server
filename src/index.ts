import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import dbConnection from './database/config';
import router from './routes/app.router';
import authRouter from './routes/auth.router';
import userRouter from './routes/user.router';

dotenv.config();
const port = process.env.PORT;
const publicPath = path.join(path.dirname(__dirname), 'public');

dbConnection();
const app = express();
app.use(express.static(publicPath));
app.use(express.json());

// Routes
app.use('/api', router);
app.use('/api', authRouter);
app.use('/api', userRouter);

const server = http.createServer(app);
export const io = new Server(server);
// TODO(BRANDOM): Add socket.io implementation

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
