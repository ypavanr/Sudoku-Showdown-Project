import React from "react";
import './Room.css';

const Room = () => {
  return (
    <div className="room-container">
      <h2>Welcome to Sudoku Showdown</h2>
      <div className="room-buttons">
        <button className="room-btn create">Create Room</button>
        <button className="room-btn join">Join Room</button>
      </div>
    </div>
  );
};

export default Room;
