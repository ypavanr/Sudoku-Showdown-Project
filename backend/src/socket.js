import { isSamePuzzle,isValidPlace, solve, createPuzzle, getRandomBoard, generatePuzzle } from "./sudoku/sudoku.js";
import { Util } from "./sudoku/sudokuUtil.js";

export default function setupSocket(io){
  const roomData=new Map();
  const socketToRoom = new Map();

  io.on('connection',(socket)=>{
    console.log('User connected:', socket.id);

    socket.on('create-room',({roomId,mode})=>{
      let board=createPuzzle();
      board=getRandomBoard(board);
      solve(board);
      let solvedPuzzle=JSON.parse(JSON.stringify(board));   
      let unsolvedPuzzle=generatePuzzle(board);
      roomData.set(roomId,{unsolvedPuzzle,solvedPuzzle,host:socket.id, mode: mode,players: {[socket.id]:{score: 0, isFinished: false}}});
      socket.join(roomId);
       socketToRoom.set(socket.id, roomId);
      console.log(`Room created:${roomId} by ${socket.id}`);
      console.log("Received mode:", mode);
      socket.emit('room-created',{roomId,mode});
    });

    socket.on('join-room', (roomId) => {
        const room = roomData.get(roomId);
        if (!room) {
        socket.emit('error','Room not found');
        return;
      }
      socket.join(roomId);
       socketToRoom.set(socket.id, roomId);
      socket.emit('room-joined', roomId);
       
      socket.emit('mode', room.mode);
      socket.to(roomId).emit('user-joined', `${socket.id} has joined the room`);
      console.log(`${socket.id} joined room: ${roomId}`);
      if(room.mode==='competitive'){
        room.players[socket.id] = { score: 0, completed: false };
      }
    
    });

    socket.on('start-game', ({roomId,time}) => {
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
      io.in(roomId).emit('puzzle', {puzzle:unsolvedPuzzle,time});
      console.log(`Game started in room ${roomId}, solved puzzle:`);
      Util.print2DArray(solvedPuzzle);
    });
    
     


    socket.on('validate-move',({roomId,puzzle,row,col,number,socketId})=>{
      const room=roomData.get(roomId);
      if(!room) return;
      const correctValue=room.solvedPuzzle[row][col];
      const isCorrect=correctValue === number;
      if(room.mode==='cooperative'){
        io.in(roomId).emit('validate-result',{row, col,number,isCorrect});
        return;
      }
      else{
        socket.emit('validate-result',{row,col,number,isCorrect})
      }

      
    });
    socket.on('validate-submission',({roomId,puzzle})=>{
        const room=roomData.get(roomId);
        const solved=room.solvedPuzzle;
        if(isSamePuzzle(solved,puzzle)){
            
            io.in(roomId).emit('game-complete', "Puzzle solved! Hooray!!!");
                return;
            
           
        }
        else{
            socket.emit("game-incomplete",'Game not yet completed')
        }
    });

    socket.on('validate-submission-competitive', ({ roomId, puzzle, points,percentageTimeLeft }) => {
  const room = roomData.get(roomId);
  const solved = room.solvedPuzzle;
  
  if (!room.players[socket.id]) return;
   
  if (isSamePuzzle(solved, puzzle)) {
   if(points>0) {if(percentageTimeLeft>=75){
        points=Math.round(points*1.5);
    }
    else if(50<=percentageTimeLeft&&percentageTimeLeft<75){
        points=Math.round(points*1.25);
    }
     else if(25<=percentageTimeLeft&&percentageTimeLeft<50){
        points=Math.round(points*1.15);
    }
    else if(percentageTimeLeft>=1&&percentageTimeLeft<25){
        points=Math.round(points*1.05);
    }}

    room.players[socket.id].completed = true;
    room.players[socket.id].score = points;
    socket.emit('new-points',points);
    socket.emit('game-complete', "Puzzle solved! Hooray!!!");
    io.in(roomId).emit('player-finished', {
      playerId: socket.id,
      points,
    });
    const allDone = Object.values(room.players).every(p => p.completed);
    if (allDone) {
      const leaderboard = Object.entries(room.players)
        .map(([id, data]) => ({ playerId: id, score: data.score }))
        .sort((a, b) => b.score - a.score);

      io.in(roomId).emit('show-leaderboard', leaderboard);
    }
  } else {
    socket.emit('game-incomplete', 'Game not yet completed');
  }
});
socket.on("time-up", (roomId,points) => {
  const room = roomData.get(roomId);
  if (!room) return;
  room.players[socket.id].score = points;
  const leaderboard = Object.entries(room.players)
    .map(([id, data]) => ({ playerId: id,score: data.score }))
    .sort((a, b) => b.score - a.score);
  io.in(roomId).emit("show-leaderboard", leaderboard);
});

    socket.on("clear-cell",({roomId,row,col})=>{ 
      const room=roomData.get(roomId);
      if(!room) return;
      io.in(roomId).emit("clear-cell",{row,col});});

   socket.on('disconnect', async () => {
  console.log('User disconnected:', socket.id);

  const roomId = socketToRoom.get(socket.id);

  if (!roomId) return;

  const clients = await io.in(roomId).allSockets();

  if (clients.size === 0) {
    console.log(`Room ${roomId} is now empty. Deleting room data.`);
    roomData.delete(roomId);
  }

  socketToRoom.delete(socket.id);
});
  });
}
