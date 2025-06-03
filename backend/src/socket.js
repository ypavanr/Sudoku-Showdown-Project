import { isValidPlace, solve, createPuzzle, getRandomBoard, generatePuzzle } from "./sudoku/sudoku.js";
import { Util } from "./sudoku/sudokuUtil.js";

export default function setupSocket(io){
  const roomData=new Map();

  io.on('connection',(socket)=>{
    console.log('User connected:', socket.id);
    socket.on('new message',(msg)=>{
    console.log('Message:',msg);
    io.emit('new message',msg);
    });

    socket.on('create-room',(roomId)=>{
      let board=createPuzzle();
      board=getRandomBoard(board);
      solve(board);
      let solvedPuzzle=JSON.parse(JSON.stringify(board));
      let unsolvedPuzzle=generatePuzzle(board);
      roomData.set(roomId,{unsolvedPuzzle,solvedPuzzle,host:socket.id});
      socket.join(roomId);
      console.log(`Room created:${roomId} by ${socket.id}`);
      socket.emit('room-created',roomId);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      socket.emit('room-joined', roomId);
      socket.to(roomId).emit('user-joined', `${socket.id} has joined the room`);
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on('start-game', (roomId) => {
      const room=roomData.get(roomId);
      if (!room) {
        socket.emit('error','Room not found');
        return;
      }
      if (room.host!==socket.id) {
        socket.emit('error','Only the host can start the game');
        return;
      }
      const {unsolvedPuzzle, solvedPuzzle}=room;
      io.in(roomId).emit('puzzle', unsolvedPuzzle);
      console.log(`Game started in room ${roomId}, solved puzzle:`);
      Util.print2DArray(solvedPuzzle);
    });

    socket.on('validate-move',({roomId,row,col,number,socketId})=>{
      const room=roomData.get(roomId);
      if(!room) return;
      const correctValue=room.solvedPuzzle[row][col];
      const isCorrect=correctValue === number;
      io.in(roomId).emit('validate-result',{row, col,number,isCorrect});
    });

    socket.on("clear-cell",({roomId,row,col})=>{ 
      const room=roomData.get(roomId);
      if(!room) return;
      io.in(roomId).emit("clear-cell",{row,col});});

    socket.on('disconnect',()=>{
    console.log('User disconnected:',socket.id);});
  });
}
