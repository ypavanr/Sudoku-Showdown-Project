import React, { useState, useEffect,useRef } from "react";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "../../socket.js";
import { useParams } from "react-router-dom";
import "./Competitive.css"
import Username from "../features/username";
import CopyButton from "../features/CopyButton";
import ChatBox from "../features/ChatBox.jsx";
import Logo from "../features/logo.jsx";
export default function Competitive() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const selectedLevelRef = useRef(selectedLevel);
  const [leaderboard, setLeaderboard] = useState([]); 
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
  const deadlineRef = useRef(null);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration,setDuration]=useState(30);
  let [points,setPoints]=useState(0);
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [submitButton, disableSubmitButton]=useState(false);
  const [isHost, setIsHost]=useState(true);
  const intervalRef=useRef(null);
  const handleStartGame = () => {
  let time=durationRef.current;
  let difficulty = selectedLevelRef.current;
  socket.emit("start-game", {roomId,difficulty,time});    
  };
  const formatTime=(totalSeconds)=>{
    const minutes= String(Math.floor(totalSeconds/60)).padStart(2, '0');
    const seconds= String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  const startTimer = (minutes) => {
  const totalSeconds = parseInt(minutes) * 60;
  const deadline = Date.now() + totalSeconds * 1000;
  deadlineRef.current = deadline;

  const tick = () => {
    const remaining = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);

    if (remaining <= 0) {
      clearInterval(intervalRef.current);
     
      socket.emit("time-up", roomId, points);
      setSubmitMessage("Time's up! Game over.");
    }
  };
  tick(); 
  intervalRef.current = setInterval(tick, 1000);
  
};

const durationRef = useRef(duration);

  const stopTimer = () => {
    clearInterval(intervalRef.current);
 
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
    socket.disconnect();
  };
   
  window.addEventListener("beforeunload", handleBeforeUnload);
    durationRef.current = duration;
    socket.on("puzzle", ({puzzle,time}) => {
  setPuzzle(puzzle);
  setInputStatus({});
  console.log("Puzzle received:", puzzle);
  startTimer(time);
  setStartButton(false);
});
   socket.on("show-leaderboard", (leaderboard) => {
  console.log("Leaderboard:", leaderboard);
  setLeaderboard(leaderboard); 
  setShowLeaderboard(true);
});
socket.on('new-points',(points)=>{
    setPoints(points);
})
  socket.on("player-finished",({playerId,points,name})=>{
    console.log("player-finished received:", playerId, points);
    setFinishedPlayers((prev) => [...prev, { playerId, points, name}]);
  })

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
      if(isCorrect==false){
        points=points-5;
      }
      else{
        points+=10;
      }
    setPoints(points);
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
    disableSubmitButton(true);
    stopTimer();
  });
  socket.on("game-incomplete",(message)=>{
    setSubmitMessage(message);
  })
  socket.on('update-duration', (newDuration) => {
  setDuration(newDuration); 
});
socket.on('update-difficulty',(newDifficulty)=>{
  setSelectedLevel(newDifficulty);
})
    return () => {

      socket.off('update-duration');
      socket.off('not-host');
       window.removeEventListener("beforeunload", handleBeforeUnload);
       clearInterval(intervalRef.current);
       socket.off('update-difficulty');
       socket.off('new-points');
       socket.off("show-leaderboard");
       socket.off("player-finished");
      socket.off("puzzle");
      socket.off("validate-result");
      socket.off("clear-cell");
      socket.off("game-complete");
    socket.off("game-incomplete");
    socket.off("error");
    };
  }, [duration]);
   
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
  const handleSubmission = () => {
  const total=durationRef.current*60;
  const remaining=timeLeft;     
  const percentageTimeLeft=(remaining/total)*100;

  socket.emit("validate-submission-competitive", {
    roomId,
    puzzle,
    points,
    percentageTimeLeft
  });
  console.log("durationRef.current:", durationRef.current);
  console.log("Time left:", remaining, "seconds");
  console.log("Percentage of time left:", percentageTimeLeft);
};

  return (
    <div>
      <Username/>
      <ChatBox/>
    <div className="sudoku-container">
       <Logo/>
      <h1 className="Game">Sudoku Showdown</h1>
      <p>Game Mode : Competitive</p>
      <CopyButton/>
      {showStartButton&&isHost&&(<form>
        <label>Enter time to solve Sudoku (in minutes) :&nbsp;&nbsp;&nbsp;
          <select
            value={duration}
            onChange={(e) => {
            const newDuration = Number(e.target.value);
            setDuration(newDuration);
            socket.emit('duration-change', { roomId, duration: newDuration }); 
            }}
            className="time-select"
            required
          >
          <option value="" disabled></option>
           {[...Array(29)].map((_, i) => {
           const val = i + 2;
           return <option key={val} value={val}>{val}</option>;
           })}
          </select>
      </label>
      </form>)}
      {showStartButton&&isHost&&(<form>
        <label htmlFor="dropdown">
          Choose the Difficulty Level :&nbsp;&nbsp;
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
</select>
      </form>)}
      {!isHost&&puzzle.length==0&&(<h5>Time duration set by Host : {duration} minutes</h5>)}
      {!isHost&&puzzle.length==0&&(<h5>Difficulty level set by Host : {selectedLevel} </h5>)}
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
       {!showStartButton&&(<button className="start-game" onClick={handleSubmission}  disabled={submitButton}> 
        Submit
      </button>)} 
      <div/>
      <div className="left-panel">
        {submissionMessage&&(
          <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
          <div className="game-message">{submissionMessage}</div>
          <br></br>
          <button onClick={() => setSubmitMessage('')}>Close</button>
          </div>
          </div>)
          }
        <FaClock size={60} /> 
       <h1 style={{fontFamily:"'Major Mono Display',monospace"}}>
        {formatTime(timeLeft)}</h1>
       <h2>Points : {points}</h2>
      <div className="rules-fixed">
        <h3>Competition Rules</h3>
        <ul>
        <li>For every correct entry its +10 Points</li>
        <li>For every wrong entry its -5 Points</li>
        <li>Bonus : If you complete the puzzle early, your final points are increased by percentage of time left<br />
        For example, if 40% time is left and you scored 60 points<br />
        Final Score = 60 × (1 + 0.4) = 84 </li>
        </ul>
      </div>
       <div className="finished-list">
  
    {showLeaderboard && (
  <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
      <h2>🏆 Leaderboard</h2>
        {leaderboard.map(({ playerId, score, name }, idx) => (
          <li key={idx}>{idx+1} . {name} : {score} points</li>
        ))}
      <button onClick={() => setShowLeaderboard(false)}>Close</button>
    </div>
  </div>
)}
  </div>
  </div>
  </div>
    </div>
  );
} 
