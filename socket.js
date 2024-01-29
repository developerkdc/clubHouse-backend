// admin-panel/socket.js
import { Server } from 'socket.io';

export default (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('User connected');

    // Handle chat messages
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });

    // Handle admin messages
    socket.on('admin message', (msg) => {
      io.emit('admin message', msg);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error: ${error.message}`);
      // Notify the client about the error
      socket.emit('error', { message: 'An error occurred. Please try again.' });
    });
  });
};
