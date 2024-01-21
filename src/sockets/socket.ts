import { Server, Socket } from 'socket.io';

import { verifyJWT } from '../helpers/jwt';
import { IMessage } from '../models/message.schema';

import {
  connectUser,
  disconnectUser,
  saveMessage,
} from '../controllers/socket.controller';

const socketController = (io: Server) => {
  const nsp = io.of('/api/chats');

  nsp.on('connection', (client: Socket) => {
    const jwt = client.handshake.headers['x-token'];
    const [valid, uid] = verifyJWT(jwt as string);

    if (!valid || !uid) {
      return client.disconnect();
    }

    connectUser(uid);

    client.join(uid);

    client.on('personal-message', async (payload: IMessage) => {
      await saveMessage(payload);
      nsp.to(payload.to.toString()).emit('personal-message', payload);
    });

    client.on('disconnect', () => {
      disconnectUser(uid);
    });

    client.on('send-message', (obj) => {
      obj.id = client.id;
      nsp.emit('send-response', obj);
    });
  });
};

export default socketController;
