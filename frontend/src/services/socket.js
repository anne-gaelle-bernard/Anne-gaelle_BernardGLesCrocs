import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export function connectSocket(onQueueUpdate, onOrderCreated) {
  const socket = io(SOCKET_URL);

  // listen queue updates
  socket.on('queue_update', (data) => {
    if (onQueueUpdate) onQueueUpdate(data || []);
  });

  // listen new orders
  socket.on('order_created', (data) => {
    if (onOrderCreated) onOrderCreated(data);
  });

  // cleanup function
  return () => {
    socket.off('queue_update');
    socket.off('order_created');
    socket.disconnect();
  };
}
