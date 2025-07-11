import React, { useState, useEffect,useRef } from "react";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "../../socket.js";
import Logo from "../features/logo.jsx";
import isValidCompletedSudoku from "./expertValidation.js";
import { useParams } from "react-router-dom";
import Username from "../features/username";
import CopyButton from "../features/CopyButton";
import ChatBox from "../features/ChatBox.jsx";
export default function Cooperative() {
  
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const selectedLevelRef = useRef(selectedLevel);
  const [isHost, setIsHost]=useState(true)
  const [players, setPlayers] = useState({});
  const [mySocketId, setMySocketId] = useState("");
  const [hostId, setHostId] = useState("");
  const handleStartGame = () => {
    let difficulty = selectedLevelRef.current;
    socket.emit("start-game", {roomId,difficulty,});
    
  };
  const formatTime=(totalSeconds)=>{
    const minutes= String(Math.floor(totalSeconds/60)).padStart(2, '0');
    const seconds= String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
const startTimer = () => {
  if (!isRunning) {
    startTimeRef.current = Date.now(); 
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - startTimeRef.current) / 1000);
      setSecondsElapsed(diffInSeconds);
    }, 1000);
    setIsRunning(true);
  }
};

  const stopTimer = () => {
  clearInterval(intervalRef.current);
  setIsRunning(false);
};

  useEffect(() => {
    socket.emit('ready');
    socket.on('socket-id',(sid)=>{
      setMySocketId(sid);
    });

  socket.emit('get-players', roomId);
socket.on('return-players', ({ players,host }) => {
  setPlayers(players);
  setHostId(host);
});

   socket.on("update-players",({players})=>{
    console.log("Updated players:", players)
    setPlayers(players);
  });
    
    socket.on("puzzle", ({puzzle,}) => {
        setSubmitMessage('');
      setPuzzle(puzzle);
      startTimer();
      setInputStatus({});
      console.log("Puzzle received:", puzzle);
      setStartButton(false);
    });
    socket.on("error",(message)=>{
      alert(message);
    })
 socket.on('not-host',()=>{
    setIsHost(false);
  })
  socket.emit('check-host',roomId);
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
  socket.on('update-difficulty',(newDifficulty)=>{
  setSelectedLevel(newDifficulty);
})
socket.on("update-expert-input", ({ row, col, number }) => {
  setPuzzle((prev) => {
    const newPuzzle = prev.map((r) => [...r]);
    newPuzzle[row][col] = number;
    return newPuzzle;
  });
});

socket.on("update-expert-clear", ({ row, col }) => {
  setPuzzle((prev) => {
    const newPuzzle = prev.map((r) => [...r]);
    newPuzzle[row][col] = 0;
    return newPuzzle;
  });
});

    return () => {
    clearInterval(intervalRef.current);
    socket.off("update-expert-input");
socket.off("update-expert-clear");

    socket.off('update-difficulty');
    socket.off('not-host');
    socket.off("puzzle");
    socket.off("validate-result");
    socket.off("clear-cell");
    socket.off("game-complete");
    socket.off("game-incomplete");
    socket.off("error");
    socket.off("update-players");
    socket.off("connect");
    socket.off('return-players');
    socket.off('socket-id');
    };
  }, []);
   
 const handleInputChange = (e, row, col) => {
  const val = e.target.value;

 if (selectedLevel === "expert") {
  if (val === "") {
    setPuzzle((prev) => {
      const newPuzzle = prev.map((r) => [...r]);
      newPuzzle[row][col] = 0;
      return newPuzzle;
    });
    setInputStatus((prev) => {
      const copy = { ...prev };
      delete copy[`${row}-${col}`];
      return copy;
    });
    socket.emit("expert-clear", { roomId, row, col }); 
    return;
  }

  const num = parseInt(val);
  if (num >= 1 && num <= 9) {
    setPuzzle((prev) => {
      const newPuzzle = prev.map((r) => [...r]);
      newPuzzle[row][col] = num;
      return newPuzzle;
    });
    socket.emit("expert-input", { roomId, row, col, number: num }); 
  }

  return;
}


  if (val === "") {
    socket.emit("clear-cell", { roomId, row, col });
    return;
  }

  const num = parseInt(val);
  if (num >= 1 && num <= 9) {
    socket.emit("validate-move", {
      roomId,
      puzzle,
      row,
      col,
      number: num,
      socketId: socket.id,
    });
    setPuzzle((prev) => {
      const newPuzzle = prev.map((r) => [...r]);
      newPuzzle[row][col] = num;
      return newPuzzle;
    });
  }
};

  const handleSubmission = () => {
  if (selectedLevel !== "expert") {
    socket.emit("validate-submission", { roomId, puzzle });
  } else {
    if (isValidCompletedSudoku(puzzle)) {
      socket.emit("expert-submission-cooperative",  roomId );
    } else {
      setSubmitMessage("Puzzle is not valid. Keep trying!");
    }
  }
};

  return (
    <div>
      <Username/>
      <ChatBox/>
    <div className="sudoku-container">
       <Logo/>
      <h1 className="Game">Sudoku Savvy</h1>
      <p>Game Mode : Cooperative</p>
      <CopyButton/>
      {showStartButton&&isHost&&(<form>
        <label htmlFor="dropdown">
          Choose the Difficulty Level : &nbsp;&nbsp;
        </label>
       <select style={{width:"107px",height:"47px"}}
  id="dropdown"
  value={selectedLevel}
  onChange={(e) => {
    const newDifficulty = e.target.value;
    setSelectedLevel(newDifficulty);
    selectedLevelRef.current = newDifficulty;
    socket.emit('difficulty-change', { roomId, difficulty: newDifficulty });
  }}
  className="mode-select"
>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
  <option value="expert">Expert</option>
</select>
      </form>)}
      {!isHost&&puzzle.length==0&&(<h5>Difficulty Level set by Host : {selectedLevel} </h5>)}
     {showStartButton&&isHost&&(<button className="start-game" onClick={handleStartGame}  >
        Start Game
      </button>)} 
      {!showStartButton&&(<h5>Difficulty Level : {selectedLevel}</h5>)}
      <div className="sudoku-grid">
        {puzzle.length > 0 &&
          puzzle.map((row, rIdx) => (
            <div className="sudoku-row" key={rIdx} style={{ display: "flex" }}>
              {row.map((cell, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const status = selectedLevel === "expert" ? "" : inputStatus[key];
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
                    value={cell === 0 ? "" : String(cell)}
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
{submissionMessage&&(
          <div className="modal-overlay">
          <div className="modal-content leaderboard-modal">
          <div className="game-message">{submissionMessage}</div>
           <br></br>
         <button onClick={() => {
         if(submissionMessage=='Puzzle solved! Hooray!!!')
          { setStartButton(true);
  setPuzzle([]);
  setInputStatus({});
  setSubmitMessage('');
}
setSubmitMessage('');
         }}>Close</button>
    </div>
       </div>
          )}
<div className="left-panel">
  <div className="top-left-box">
    <div className="score-time">
      <FaClock size={30} style={{ marginRight: '10px' }} />
      <span className="time-text">{formatTime(secondsElapsed)}</span>

      <div className="rules-hover-container">
        <span className="rules-label">
          &nbsp; | &nbsp;Rules <span className="question-icon">?</span>
        </span>
        <div className="rules-fixed">
          <h3>Sudoku Rules</h3>
          <ul>
            <li>Enter numbers 1-9 in empty white cells only.</li>
            <li>Each number can appear only once in each row, column, and 3×3 box.</li>
            <li>Correct entries turn green, incorrect ones turn red.</li>
            <li>+10 points for correct, -5 for wrong.</li>
            <li>Bonus if puzzle is solved early!</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div className="player-list">
    {players && Object.entries(players).map(([socketId, player]) => {
      const avatarPath = `/src/assets/icons/${player.icon}`;
      const label =
        socketId === hostId && socketId === mySocketId
          ? `${player.name} (You) (Host)`
          : socketId === hostId
          ? `${player.name} (Host)`
          : socketId === mySocketId
          ? `${player.name} (You)`
          : player.name;
      return (
        <div className="player-item" key={socketId}>
          <img src={avatarPath} alt={player.name} />
          <span>{label}</span>
        </div>
      );
    })}
  </div>
</div>

    </div>
  );
} 
