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
  origin:process.env.CORS_ORIGIN_URL
}));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.post("/test", (req, res) => {
  return res.status(200).json({ message: "Test route working" });
});
setupSocket(io);

app.use("/sudoku",sudokuRouter)

server.listen(3000,()=>{
    console.log("server listening on port 3000")
})