import express from "express";
import bodyParser from "body-parser";
import db from "./config/pdDB.js";
import cors from "cors";
import env from "dotenv";
import { authRouter } from "./routes/authRoutes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
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
db.connect().then(()=>{
  console.log("connected to database")
})
app.post("/test", (req, res) => {
  return res.status(200).json({ message: "Test route working" });
});
io.on('connection', (socket) => {
    console.log("user connected,"+socket.id);
    
  socket.on('new message', (msg) => {
    console.log('message: ' + msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');});
});
app.use("/auth",authRouter)
server.listen(3000,()=>{
    console.log("server listening on port 3000")
})