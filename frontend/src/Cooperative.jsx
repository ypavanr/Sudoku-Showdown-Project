import React, { useState, useEffect,useRef } from "react";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "./socket";
import { useParams } from "react-router-dom";
import Username from "./username";
import CopyButton from "./CopyButton";
export default function Cooperative() {
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [secondsElapsed, setSecondsElapsed]=useState(0);
  const intervalRef=useRef(null);
  const handleStartGame = () => {
    socket.emit("start-game", {roomId,});
    
  };
  const formatTime=(totalSeconds)=>{
    const minutes= String(Math.floor(totalSeconds/60)).padStart(2, '0');
    const seconds= String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
 const startTimer = () => {
    if (!isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  useEffect(() => {
    
    socket.on("puzzle", ({puzzle,}) => {
      setPuzzle(puzzle);
      startTimer();
      setInputStatus({});
      console.log("Puzzle received:", puzzle);
      setStartButton(false);
    });
    socket.on("error",(message)=>{
      alert(message);
    })

    socket.on("validate-result", ({ row, col, number, isCorrect }) => {
      setPuzzle((prev) => {
        const newPuzzle=prev.map((r)=>[...r]);
        newPuzzle[row][col]=number;
        return newPuzzle;
      });
      setInputStatus((prev) => ({
        ...prev,
        [`${row}-${col}`]: isCorrect ? "correct" : "wrong",
      }));
    });

    socket.on("clear-cell",({row,col}) => {
      setPuzzle((prev) => {
      const newPuzzle=prev.map((r) => [...r]);
      newPuzzle[row][col]=0;
      return newPuzzle;
    });
      setInputStatus((prev) => {
      const copy={...prev};
      delete copy[`${row}-${col}`];
      return copy;
    });
  });
  socket.on("game-complete",(message)=>{
    setSubmitMessage(message);
    stopTimer();
  });
  socket.on("game-incomplete",(message)=>{
    setSubmitMessage(message);
  })
    return () => {
    clearInterval(intervalRef.current);
    socket.off("puzzle");
    socket.off("validate-result");
    socket.off("clear-cell");
    socket.off("game-complete");
    socket.off("game-incomplete");
    socket.off("error");
    };
  }, []);
   
  const handleInputChange = (e, row, col) => {
    const val = e.target.value;
    if (val === "") {socket.emit("clear-cell",{roomId,row,col});
    return;
    }

    const num = parseInt(val);
    if (num >= 1 && num <= 9) {
      socket.emit("validate-move", {roomId,puzzle,row,col,number: num,socketId: socket.id,});
      setPuzzle((prev) => {
        const newPuzzle = prev.map((r) => [...r]);
        newPuzzle[row][col] = num;
        return newPuzzle;
      });
    }
  };
  const handleSubmission=()=>{
    socket.emit("validate-submission",{roomId,puzzle});
  }
  return (
    <div>
      <Username/>
    <div className="sudoku-container">
      <h1 className="Game">Sudoku Showdown</h1>
      
      <p>Game Mode : Cooperative</p>
      
      <CopyButton/>
     
      <br></br>
     {showStartButton&&(<button className="start-game" onClick={handleStartGame}  >
        Start Game
      </button>)} 
      <div className="sudoku-grid">
        {puzzle.length > 0 &&
          puzzle.map((row, rIdx) => (
            <div className="sudoku-row" key={rIdx} style={{ display: "flex" }}>
              {row.map((cell, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const status = inputStatus[key];
                const isOriginal = cell !== 0 && !["correct", "wrong"].includes(status);
                return (
                  <input
                    key={key}
                    type="text"
                    maxLength={1}
                    className={`sudoku-input ${status || ""} ${
                      (cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-right" : ""
                    } ${
                      (rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-bottom" : ""
                    }`}
                    value={cell === 0 ? "" : cell}
                    disabled={isOriginal}
                    onChange={(e) => handleInputChange(e, rIdx, cIdx)}
                  />
                );
              })}
            </div>
          ))}
      </div><br></br>
       {!showStartButton&&(<button className="start-game" onClick={handleSubmission}>
        Submit
      </button>)} 
      </div>
      <div className="left-panel">
        
         {submissionMessage&&(
          <div className="modal-overlay">
          <div className="modal-content leaderboard-modal">
          <div className="game-message">{submissionMessage}</div>
           <br></br>
         <button onClick={() => setSubmitMessage('')}>Close</button>
    </div>
       </div>
          )}
        <FaClock size={60} /> 
       <h1 style={{fontFamily:"'Major Mono Display',monospace"}}>{formatTime(secondsElapsed)}</h1> 
       <div className="rules-fixed">
        <h3>Sudoku Rules</h3>
        <ul>
          <li>Enter numbers 1-9 in empty white cells only.</li>
          <li>
            Each number can appear only once in each row,
            column, and 3x3 box.
          </li>
          <li>Correct entries turn green, incorrect ones turn red.</li>
        </ul>
       </div>
      </div>
    </div>
  );
} 
