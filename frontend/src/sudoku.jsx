import React, { useState, useEffect } from "react";
import "./Sudoku.css";
import socket from "./socket";
import { useParams } from "react-router-dom";


export default function Sudoku(){

  const {roomId}=useParams();
  const [puzzle, setPuzzle] = useState([]);
  const handleStartGame=()=>{
    socket.emit('start-game',roomId);
  }
useEffect(() => {
  socket.on('puzzle', (puzzle) => {
    setPuzzle(puzzle);
    console.log("Puzzle received:", puzzle);
  });

  return () => {
    socket.off('puzzle'); 
  };
}, []);



return (
<div>
  <button className="start-game" onClick={handleStartGame}>start game</button>
</div>

)

}