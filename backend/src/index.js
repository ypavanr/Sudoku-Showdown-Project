import express from "express";
import bodyParser from "body-parser";
import db from "./config/pdDB.js";
import cors from "cors";
import env from "dotenv";
import { authRouter } from "./routes/authRoutes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import setupSocket from "./socket.js";
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
setupSocket(io);
app.use("/auth",authRouter)
server.listen(3000,()=>{
    console.log("server listening on port 3000")
})