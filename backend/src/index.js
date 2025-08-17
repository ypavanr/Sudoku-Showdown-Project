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

setupSocket(io);

app.use("/sudoku",sudokuRouter)
const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("server listening on port 3000")
})