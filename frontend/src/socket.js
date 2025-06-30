// socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found. Cannot connect socket.");
    return;
  }

  socket = io("http://localhost:3000", {
    auth: {
      token: token,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });
};

export const getSocket = () => socket;
