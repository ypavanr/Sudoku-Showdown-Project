import { io } from 'socket.io-client';

const socket = io('https://sudoku-savvy.onrender.com', {
  transports: ['websocket']
});

export default socket;
