
import React, { useEffect, useState } from "react";
import './Room.css';
import { useNavigate } from "react-router-dom";
import socket from "./socket";
import { nanoid } from 'nanoid';

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
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [showMode,setShowMode]=useState(false);
  const [selectedMode, setSelectedMode] = useState('competitive');

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
    socket.emit('join-room', roomId);
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
    socket.emit('create-room', { roomId: newRoomId, mode } );
  };
useEffect(()=>{
  const handleRoomCreated=({roomId,mode})=>{
    console.log('Room created with ID:', roomId);
    navigate(`/room/${mode}/${roomId}`);
  };

  const handleUserJoined=(message)=>{
    console.log('User joined:'+message);
  };
  socket.on('room-created',handleRoomCreated);
  socket.on('user-joined',handleUserJoined);

  return ()=>{
    socket.off('room-created',handleRoomCreated);
    socket.off('user-joined', handleUserJoined);
  };
},[navigate]);
  return(
    <div className="room-wrapper">
      {blocksData.map(({ top, left, numbers, delay }, i) => (
        <SudokuBlock key={i} top={top} left={left} numbers={numbers} delay={delay} />
      ))}
      <div className="room-card">
        <h1 className="room-title">Sudoku Showdown</h1>
        <p className="room-subtitle">Challenge yourself or compete with friends!</p>
        <div className="room-buttons">
          <button className="room-btn create" onClick={handleCreateRoom}>Create Room</button>

          <button className="room-btn join" onClick={handleJoinClick}>Join Room</button>

          {showInput && (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={handleInputChange}
              />
              <button type="submit" disabled={!selectedMode}>Submit</button>
            </form>
          )}
        </div>
      </div>
     {showMode&&(<form onSubmit={handleSubmitMode}>
      <label htmlFor="dropdown">Choose mode:</label>
      <select id="dropdown" value={selectedMode} onChange={(e)=>setSelectedMode(e.target.value)}>
        <option value="competitive">competitive</option>
        <option value="cooperative">cooperative</option>
      </select>
      <button type="submit">Submit</button>
    </form>)} 
    </div>
  );
};

export default Room;
