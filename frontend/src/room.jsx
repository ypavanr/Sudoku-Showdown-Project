import React from "react";
import './Room.css';
import { useNavigate } from "react-router-dom";

const Room = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/sudoku");
  };
  return (
    <div className="room-container">
      <h2>Welcome to Sudoku Showdown</h2>
      <div className="room-buttons">
        <button className="room-btn create" onClick={handleNavigate}>Create Room</button>
        <button className="room-btn join" onClick={handleNavigate}>Join Room</button>
      </div>
    </div>
  );
};

export default Room;
