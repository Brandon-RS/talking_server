import { Server, Socket } from 'socket.io';
import { connectUser, disconnectUser } from '../controllers/socket.controller';
import { verifyJWT } from '../helpers/jwt';

const socketController = (io: Server) => {
  const nsp = io.of('/api/chats');

  nsp.on('connection', (client: Socket) => {
    const jwt = client.handshake.headers['x-token'];
    const [valid, uid] = verifyJWT(jwt as string);

    if (!valid) {
      return client.disconnect();
    }

    connectUser(uid as string);

    client.on('disconnect', () => {
      disconnectUser(uid as string);
    });

    client.on('send-message', (obj) => {
      obj.id = client.id;
      nsp.emit('send-response', obj);
    });
  });
};

export default socketController;
