import { generateSudokuPuzzle, solve, isSamePuzzle } from "./sudoku/sudoku.js";
import { Util } from "./sudoku/sudokuUtil.js";

export default function setupSocket(io){
  const roomData=new Map();
  const socketToRoom = new Map();

  io.on('connection',(socket)=>{
    console.log('User connected:', socket.id);
    socket.on('create-room',async ({roomId,mode,username})=>{
      roomData.set(roomId,{unsolvedPuzzle:null,solvedPuzzle:null,hostid:socket.id,host:username, mode: mode,players: {[socket.id]:{name:username, score: 0, isFinished: false}}});
      if(socketToRoom.get(socket.id)){
        const prevRoom=socketToRoom.get(socket.id);
        socket.leave(prevRoom);
        const clients = await io.in(prevRoom).allSockets();
        if (clients.size === 0) {
          console.log(`Room ${prevRoom} is now empty. Deleting room data.`);
          roomData.delete(prevRoom);
        }
      }
      socketToRoom.set(socket.id,roomId);
      socket.join(roomId);
      console.log(`Room created:${roomId} by ${username}`);
      console.log("Received mode:", mode);
      socket.emit('room-created',{roomId,mode}); 
    });

    socket.on('join-room',async (roomId,username) => {
    const room = roomData.get(roomId);
    if(!room){
        socket.emit('error',"room not found");
        return;
      }
      if(socketToRoom.get(socket.id))
      {
        const prevRoom=socketToRoom.get(socket.id);
        socket.leave(prevRoom);
        const clients = await io.in(prevRoom).allSockets();
        if (clients.size === 0) 
        {
         console.log(`Room ${prevRoom} is now empty. Deleting room data.`);
         roomData.delete(prevRoom);
        }
      }
      socketToRoom.set(socket.id,roomId);      
      socket.join(roomId);
      socket.emit('room-joined', roomId); 
      socket.emit('mode', room.mode);
      socket.to(roomId).emit('user-joined', `${username} has joined the room`);
      console.log(`${username} joined room: ${roomId}`);
      if(room.mode==='competitive'){
        room.players[socket.id] = { name:username, score: 0, completed: false };
      }
    });

    socket.on("duration-change", ({ roomId, duration }) => {
    socket.to(roomId).emit("update-duration", duration);
    });

    socket.on("difficulty-change",({roomId,difficulty})=>{
    socket.to(roomId).emit("update-difficulty", difficulty);
    })

    socket.on('start-game', ({roomId,difficulty,time}) => {
      const room=roomData.get(roomId);
      if(!room){
        socket.emit('error',"room not found");
        return;
      }
      if (room.hostid!==socket.id) {
        socket.emit('not-host');
        return;
      }
      const unsolvedPuzzle = generateSudokuPuzzle(difficulty);
      const solvedPuzzle = JSON.parse(JSON.stringify(unsolvedPuzzle)); 
      solve(solvedPuzzle); 
      room.solvedPuzzle = solvedPuzzle;
      room.unsolvedPuzzle = unsolvedPuzzle;
      io.in(roomId).emit('puzzle', {puzzle:unsolvedPuzzle,time});
      console.log(`Game started in room ${roomId}.difficulty level: ${difficulty} solved puzzle:`);
      Util.print2DArray(solvedPuzzle);
    });

    socket.on('check-host',(roomId)=>{
      const room=roomData.get(roomId);
      if(!room){
        socket.emit('error',"room not found");
        return;
      }
      if (room.hostid!==socket.id) {
        socket.emit('not-host');
        return;
      }
    })
     
    socket.on('validate-move',({roomId,puzzle,row,col,number,socketId})=>{
      const room=roomData.get(roomId);
      if (!room || !room.solvedPuzzle) return;
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
      if (!room || !room.solvedPuzzle) return;
      const solved=room.solvedPuzzle;
      if(isSamePuzzle(solved,puzzle)){
        io.in(roomId).emit('game-complete',"Puzzle solved! Hooray!!!");
        return;
      }
      else{
        socket.emit("game-incomplete",'Game not yet completed')
      }
    });

    socket.on('validate-submission-competitive', ({ roomId, puzzle, points,percentageTimeLeft }) => {
      const room = roomData.get(roomId);
      const solved = room.solvedPuzzle;
      let name;
      if (!room.players[socket.id]) return;
      if (isSamePuzzle(solved, puzzle)) {
      if(points>0) {
        let factor=(percentageTimeLeft/100)+1;
        points=Math.round(factor*points);
      }
      room.players[socket.id].completed = true;
      room.players[socket.id].score = points;
      name = room.players[socket.id].name;
      socket.emit('new-points',points);
      socket.emit('game-complete', "Puzzle solved! Hooray!!!");
      io.in(roomId).emit('player-finished', {
        playerId: socket.id,
        points,
        name,
      });

      const allDone = Object.values(room.players).every(p => p.completed);
      if (allDone) {
        const leaderboard = Object.entries(room.players)
        .map(([id, data]) => ({ playerId: id, score: data.score, name:data.name}))
        .sort((a, b) => b.score - a.score);
        io.in(roomId).emit('show-leaderboard', leaderboard);
      }} 
      else {
        socket.emit('game-incomplete', 'Game not yet completed');
      }
    });

    socket.on("time-up", (roomId,points) => {
      const room = roomData.get(roomId);
      if (!room) return;
      room.players[socket.id].score = points;
      const leaderboard = Object.entries(room.players)
      .map(([id, data]) => ({ playerId: id,score: data.score,name:data.name }))
      .sort((a, b) => b.score - a.score);
      io.in(roomId).emit("show-leaderboard", leaderboard);
    });

    socket.on("clear-cell",({roomId,row,col})=>{ 
      const room=roomData.get(roomId);
      if(!room) return;
      io.in(roomId).emit("clear-cell",{row,col});
    });

    socket.on('disconnect', async () => {
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
