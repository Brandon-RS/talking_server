import { Server, Socket } from 'socket.io';

const socketController = (io: Server) => {
  const nsp = io.of('/api/chats');

  nsp.on('connection', (client: Socket) => {
    console.log(`❌ ${client.id} connected`);

    client.on('disconnect', () => {
      console.log(`❌ ${client.id} disconnected`);
    });

    client.on('send-message', (obj) => {
      obj.id = client.id;
      nsp.emit('send-response', obj);
    });
  });
};

export default socketController;
