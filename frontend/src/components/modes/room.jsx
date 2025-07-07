import React, { useEffect, useState } from "react";
import './Room.css';
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";
import Logo from "../features/logo";
import { nanoid } from 'nanoid';
import Username from "../features/username";

const SudokuBlock = ({ top, left, numbers, delay }) => {
  const cells = Array(9).fill("");
  const positions = [];

  while (positions.length < numbers.length) {
    const pos = Math.floor(Math.random() * 9);
    if (!positions.includes(pos)) {
      positions.push(pos);
    }
  }

  positions.forEach((pos, i) => {
    cells[pos] = numbers[i];
  });

  return (
    <div className="sudoku-block" style={{ top, left, animationDelay: delay }}>
      {cells.map((num, i) => (
        <span key={i} className="sudoku-number">{num || ""}</span>
      ))}
    </div>
  );
};

const blocksData = [
  { top: "5%", left: "5%", numbers: [5, 3, 7], delay: "0s" },
  { top: "12%", left: "40%", numbers: [1, 9, 5], delay: "2.5s" },
  { top: "15%", left: "75%", numbers: [8, 6], delay: "4s" },

  { top: "30%", left: "10%", numbers: [4, 8, 3], delay: "1s" },
  { top: "35%", left: "55%", numbers: [2, 7, 6], delay: "3.5s" },
  { top: "40%", left: "80%", numbers: [3, 1, 9], delay: "0.5s" },

  { top: "60%", left: "5%", numbers: [6, 1, 9], delay: "2s" },
  { top: "65%", left: "45%", numbers: [8, 7, 9], delay: "4.5s" },
  { top: "70%", left: "70%", numbers: [2, 5, 4], delay: "1.5s" },

  { top: "85%", left: "15%", numbers: [1, 6, 8], delay: "3s" },
  { top: "90%", left: "60%", numbers: [7, 3, 2], delay: "0s" },
];

const Room = () => {
  const socket = getSocket();
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [showMode,setShowMode]=useState(false);
  const [selectedMode, setSelectedMode] = useState('competitive');
  const [username,setUsername]=useState(null);
  const handleCreateRoom = () => {
    setShowMode(true);
    
  };

  const handleJoinClick=()=>{
    setShowInput(true);
  };

  const handleInputChange=(e)=>{
    setRoomId(e.target.value);
  };

  const handleSubmit =(e)=>{
    e.preventDefault();
    console.log('Joining room with ID:', roomId);
    socket.emit('join-room',roomId,username);
    socket.once('mode',(mode)=>{
      navigate(`/room/${mode}/${roomId}`);
    });
    
    setShowInput(false);
  setRoomId('');
  };  
  
const handleSubmitMode = (event) => {
    event.preventDefault();
    const newRoomId = nanoid(6);
    const mode = selectedMode;
    if (!mode) {
  alert('Please select a mode');
  return;
}
if(mode==='solo'){
  navigate(`/room/solo`);
}
else
   { socket.emit('create-room', { roomId: newRoomId, mode,username} );}
  };
useEffect(()=>{
  const storedUsername=localStorage.getItem('username');
    setUsername(storedUsername);
  const handleRoomCreated=({roomId,mode})=>{
    console.log('Room created with ID:', roomId);
    navigate(`/room/${mode}/${roomId}`);
  };
   socket.on("error",(message)=>{
      alert(message);
    })
  socket.on('room-created',handleRoomCreated);

  return ()=>{
    socket.off("error");
    socket.off('room-created',handleRoomCreated);
  };
},[navigate]);
  return(
    
    <div>
      <Username/>
    <div className="room-wrapper">
      {blocksData.map(({ top, left, numbers, delay }, i) => (
        <SudokuBlock key={i} top={top} left={left} numbers={numbers} delay={delay} />
      ))}
      <div className="room-card">
         <Logo/>
        <h1 className="room-title">Sudoku Showdown</h1>
        <p className="room-subtitle">Challenge yourself or compete with friends!</p>
        <div className="room-buttons">
          <button className="room-btn create" onClick={handleCreateRoom}>Create Room</button>

          <button className="room-btn join" onClick={handleJoinClick}>Join Room</button>  
        </div>
      </div>
      <div className="form-wraper">
           {showMode&&(<form onSubmit={handleSubmitMode} className="mode-form">
            <label htmlFor="dropdown">Choose mode:</label>
             <select id="dropdown" value={selectedMode} onChange={(e)=>setSelectedMode(e.target.value)} className="mode-select">
             <option value="competitive">Competitive</option>
             <option value="cooperative">Cooperative</option>
             <option value="solo">Solo</option>
             </select>
            <button type="submit" className="mode-submit">Submit</button>
    </form>)} 

          {showInput && (
            <form onSubmit={handleSubmit} className="room-form">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={handleInputChange}
                className="room-input"
              />
              <button type="submit" disabled={!selectedMode} className="room-submit">Submit</button>
            </form>
          )}
    
    </div>
    </div>
    </div>
  );
};

export default Room;
