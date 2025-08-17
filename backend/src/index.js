import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import env from "dotenv";
import { createServer } from 'http';
import { Server } from 'socket.io';
import setupSocket from "./socket.js";
import { sudokuRouter } from "./routes/sudokuRoutes.js";
const app=express()
env.config()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:5173','https://sudoku-savvy.vercel.app'],
  credentials: true
}));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173','https://sudoku-savvy.vercel.app'],
    credentials: true
  },
});

const { roomData, socketToRoom } = setupSocket(io);

function logState(io, roomData, socketToRoom) {
  console.log("========== CURRENT STATE ==========");

  console.log("ROOM DATA:");
  for (const [roomId, data] of roomData.entries()) {
    console.log(`Room ${roomId}:`, JSON.stringify(data, null, 2));
  }

  console.log("SOCKET TO ROOM:");
  for (const [sid, rid] of socketToRoom.entries()) {
    console.log(`${sid} -> ${rid}`);
  }

  console.log("SOCKET.IO ROOMS:");
  for (const [room, sockets] of io.sockets.adapter.rooms) {
    if (io.sockets.sockets.has(room)) continue; 
    console.log(`Room ${room} has ${sockets.size} sockets`);
  }

  console.log("===================================");
}

app.get("/debug-state", (req, res) => {
  logState(io, roomData, socketToRoom);
  res.send("✅ State logged to backend console");
});

app.post("/test", (req, res) => {
  return res.status(200).json({ message: "Test route working" });
});
setupSocket(io);

app.use("/sudoku",sudokuRouter)
const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("server listening on port 3000")
})