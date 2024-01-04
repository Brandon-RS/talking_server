import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import './sockets/socket';

dotenv.config();
const port = process.env.PORT;
const publicPath = path.join(path.dirname(__dirname), 'public');

const app = express();
app.use(express.static(publicPath));

const server = http.createServer(app);
export const io = new Server(server);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
