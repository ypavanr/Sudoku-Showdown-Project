import { generateSudokuPuzzle, solve, isSamePuzzle } from "./sudoku/sudoku.js";
import { Util } from "./sudoku/sudokuUtil.js";
import { supabase } from "./config/supabase.js";

export default function setupSocket(io){
  const roomData=new Map();
  const socketToRoom = new Map();

  io.on('connection',(socket)=>{

    socket.emit('reload')
    console.log('User connected:', socket.id);

    socket.on('ready',() =>{
       socket.emit('socket-id',socket.id);
    });
    
    socket.on('create-room',async ({roomId,mode,username,avatar,teamName})=>{
      roomData.set(roomId,{unsolvedPuzzle:null,solvedPuzzle:null,hostid:socket.id,host:username, mode: mode,players: {[socket.id]:{name:username,icon: avatar, score: 0, completed: false, team: teamName}}});

      if(socketToRoom.get(socket.id)){
        const prevRoom=socketToRoom.get(socket.id);
      await leaveRoom(socket,prevRoom)

      }

      socketToRoom.set(socket.id,roomId);
      socket.join(roomId);
      console.log(`Room created:${roomId} by ${username}`);
      socket.emit('room-created',{roomId,mode}); 
      const { error } = await supabase.from('game_details').insert([{roomid:roomId,mode:mode,level:null }]);

      if (error) console.error('Supabase insert error (game_datails):', error.message);
      await supabase.from('username').upsert([{username,roomid: roomId}], 
        { onConflict: ['username', 'roomid'] }).then(({ error }) => {
          if (error) console.error('Supabase insert error (username):', error.message);
        });
    });

    socket.on('join-room',async (roomId,username,avatar) => {
      const room = roomData.get(roomId);

      if(!room){
        socket.emit('error',"room not found");
        return;
      }

      if(socketToRoom.get(socket.id))
      {
      const Room=socketToRoom.get(socket.id);
      await leaveRoom(socket,Room)
         }

      socketToRoom.set(socket.id,roomId);      
      socket.join(roomId);

      if(room.mode==='competitive'||room.mode==='cc'||room.mode==='cooperative'){
        room.players[socket.id] = { name:username, icon:avatar,score: 0, completed: false };
        io.to(roomId).emit("update-players", {
          players: room.players,
          host: room.hostid
        });
      }

      socket.emit('room-joined', roomId); 
      socket.emit('mode', room.mode);
      socket.to(roomId).emit('display-messages', {text:`${username} has joined the room.`,sid: "system",senderusername:username,type: "join"});
      await supabase.from('username').upsert([{username,roomid:roomId}], { 
        onConflict: ['username', 'roomid'] }).then(({ error }) => {
          if (error) console.error('Supabase insert error (username):', error.message);
        });
    });

    socket.on('create-team', ({ roomId, teamName }) => {
      const room = roomData.get(roomId);
      if (!room) return;
      room.players[socket.id].team = teamName;
      broadcastTeams(roomId);
    });

    socket.on('join-team', ({ roomId, teamName }) => {
      const room = roomData.get(roomId);
      if (!room) return;
      room.players[socket.id].team = teamName;
      broadcastTeams(roomId);
    });

    socket.on('leave-team', ({ roomId }) => {
      const room = roomData.get(roomId);
      if (!room) return;
      delete room.players[socket.id].team;
      broadcastTeams(roomId);
    });

    function broadcastTeams(roomId) {
      const room = roomData.get(roomId);
      if (!room) return;
      const teams = {};
      for (const [id, p] of Object.entries(room.players)) {
        const t = p.team || 'No Team';
        teams[t] = teams[t] || [];
        teams[t].push({ id, name: p.name, icon: p.icon });
      }
      io.to(roomId).emit('teams-updated', { teams });
    }

    socket.on('get-players', (roomId) => {
      const room = roomData.get(roomId);
      if (room && room.players) {
        socket.emit('return-players', { players: room.players,host: room.hostid });
      } 
      else {
        socket.emit('return-players', { players: [] });
      }
    });

    socket.on('new-message',(roomId,input,sid)=>{
      const room=roomData.get(roomId);
      if(!room){
        socket.emit('error',"room not found");
        return;
      }
      const playerInfo = room.players[sid];
      if (!playerInfo) {
        socket.emit('error',"sender not found in room");
        return;
      }
      io.to(roomId).emit('display-messages',
        {text:input,sid,senderusername: playerInfo.name,type: "chat"}
      );
    });
      

    async function leaveRoom(socket, roomId) {
  if (!roomId) return;
  const room = roomData.get(roomId);
  if (!room || !room.players[socket.id]) return;

  const username = room.players[socket.id].name || "Unknown";
  delete room.players[socket.id];
  socketToRoom.delete(socket.id);
  socket.leave(roomId);

  const clients = await io.in(roomId).allSockets();
  if (clients.size === 0) {
    console.log(`Room ${roomId} is now empty. Deleting room data.`);
    roomData.delete(roomId);
    return;
  }

  socket.to(roomId).emit("display-messages", {
    text: `${username} has left the room.`,
    sid: "system",
    senderusername: username,
    type: "leave"
  });

  if (room.hostid === socket.id) {
    const remainingPlayerIds = Object.keys(room.players);
    if (remainingPlayerIds.length > 0) {
      const newHostId = remainingPlayerIds[0];
      room.hostid = newHostId;
      const targetSocket = io.sockets.sockets.get(newHostId);
      if (targetSocket) targetSocket.emit('is-host');

      const newHostName = room.players[newHostId].name;
      io.to(roomId).emit("display-messages", {
        text: `${newHostName} is now the host.`,
        sid: newHostId,
        senderusername: newHostName,
        type: "host"
      });
    } else {
      roomData.delete(roomId);
      return;
    }
  }

  if (roomData.has(roomId)) {
    io.to(roomId).emit("update-players", {
      players: room.players,
      host: room.hostid
    });
   broadcastleaderboard(roomId);
  }
}

    


    function broadcastleaderboard(roomId,) {
      const room = roomData.get(roomId);
      const allDone = Object.values(room.players).every(p => p.completed);
      if (allDone) {
        const leaderboard = Object.entries(room.players)
        .map(([id, data]) => ({ playerId: id,sid: data.socketId, score: data.score, name:data.name}))
        .sort((a, b) => b.score - a.score);
        io.in(roomId).emit('show-leaderboard', leaderboard);
        Object.values(room.players).forEach(player=>{
          player.completed = false;
        });
      } 
    }

    socket.on("leave-room", async () => {
      const roomId = socketToRoom.get(socket.id);
    await leaveRoom(socket,roomId)
     
    });

    socket.on("duration-change", ({ roomId, duration }) => {
    socket.to(roomId).emit("update-duration", duration);
    });

    socket.on("difficulty-change",({roomId,difficulty})=>{
    socket.to(roomId).emit("update-difficulty", difficulty);
    })

    socket.on("validation-change",({roomId,validation})=>{
    socket.to(roomId).emit("update-validation", validation);
    })

    socket.on('start-game',async ({roomId,difficulty,validation,time}) => {
      const room=roomData.get(roomId);
      if(!room){
        socket.emit('error',"room not found");
        return;
      }
      if (room.hostid!==socket.id) {
        socket.emit('not-host');
        return;
      }

      Object.values(room.players).forEach(player => {
        player.score = 0;
        player.completed = false;
      });

      socket.to(roomId).emit("update-difficulty", difficulty);
      socket.to(roomId).emit("update-validation", validation);
      const unsolvedPuzzle = generateSudokuPuzzle(difficulty);
      const solvedPuzzle = JSON.parse(JSON.stringify(unsolvedPuzzle)); 
      solve(solvedPuzzle); 
      room.solvedPuzzle = solvedPuzzle;
      room.unsolvedPuzzle = unsolvedPuzzle;
      io.in(roomId).emit('puzzle', {puzzle:unsolvedPuzzle,time});
      console.log(`Game started in room ${roomId}.difficulty level: ${difficulty} solved puzzle:`);
      Util.print2DArray(solvedPuzzle);
      await supabase
      .from('game_details')
      .update({ level: difficulty })
      .eq('roomid', roomId)
      .then(({ error }) => {
        if (error) console.error('Supabase update error (game_datails.level):', error.message);
      });
    });

    socket.on('check-host',(roomId)=>{
      const room=roomData.get(roomId);
      if(!room){
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
      console.log(`[FINISHED] ${name} | basePoints=${points}`);

      if (!room.players[socket.id]) return;
      let factor=0
      if (isSamePuzzle(solved, puzzle)) {
      if(points>0) {
        factor=(percentageTimeLeft/100)+1;
        points=Math.round(factor*points);
      }
      room.players[socket.id].completed = true;
      room.players[socket.id].score = points;
      console.log(`bonus=${factor} | total=${points}`);
      name = room.players[socket.id].name;
      socket.emit('new-points',points);
      socket.emit('game-complete', "Puzzle solved! Hooray!!!");
      io.in(roomId).emit('player-finished', {playerId:socket.id,points,name,});
      broadcastleaderboard(roomId);
    }
    else {
      socket.emit('game-incomplete', 'Game not yet completed');
    }
  });

    socket.on("expert-input", ({ roomId, row, col, number }) => {
      socket.to(roomId).emit("update-expert-input", { row, col, number });
    });

    socket.on("expert-clear", ({ roomId, row, col }) => {
      socket.to(roomId).emit("update-expert-clear", { row, col });
    });
 
    socket.on('expert-submission-competitive',({roomId,remaining})=>{
      const roomID = socketToRoom.get(socket.id);
      if (!roomID) return;
      const room = roomData.get(roomId);
      let name;
      if (!room.players[socket.id]) return;
      let points=remaining;
      room.players[socket.id].completed = true;
      room.players[socket.id].score = points;
      name = room.players[socket.id].name;
      io.in(roomId).emit('player-finished', {playerId: socket.id,points,name,});
      broadcastleaderboard(roomId);
    })

    socket.on("expert-submission-cooperative",  (roomId)=>{
      io.in(roomId).emit('game-complete',"Puzzle solved! Hooray!!!");
    });

    socket.on("time-up", (roomId,points) => {
      const room = roomData.get(roomId);
      if (!room) return;
      const player = room.players[socket.id];
      if (!player.completed) {
        player.score = points;
        player.completed = true;
      }
      broadcastleaderboard(roomId);
    });

    socket.on("clear-cell",({roomId,row,col})=>{ 
      const room=roomData.get(roomId);
      if(!room) return;
      io.in(roomId).emit("clear-cell",{row,col});
    });

    socket.on('disconnect', async () => {
      const roomId = socketToRoom.get(socket.id);
      await leaveRoom(socket,roomId)    
    });
  });
}
