import React, { useState, useEffect,useRef } from "react";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "./socket";
import { useParams } from "react-router-dom";
import "./Competitive.css"
import Username from "./username";
import CopyButton from "./CopyButton";
export default function Competitive() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]); 
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
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
    socket.emit("start-game", {roomId,time});    
  };
 socket.emit('check-host',roomId)
  const formatTime=(totalSeconds)=>{
    const minutes= String(Math.floor(totalSeconds/60)).padStart(2, '0');
    const seconds= String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
 const startTimer = (minutes) => {
    minutes=parseInt(minutes);
  if (minutes >= 2 && minutes <= 30) {
    const totalSeconds = minutes * 60;
    setTimeLeft(totalSeconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          socket.emit("time-up", roomId,points);
          setSubmitMessage("Time's up! Game over.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
};

const durationRef = useRef(duration);


  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
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
  setDuration(newDuration); // 🔁 Update local state
});

    return () => {
      socket.off('update-duration');
       window.removeEventListener("beforeunload", handleBeforeUnload);
       clearInterval(intervalRef.current);
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
    <div className="sudoku-container">
      <h1 className="Game">Sudoku Showdown</h1>
      <p>Game Mode : Competitive</p>
      <CopyButton/>
      {showStartButton&&isHost&&(<form>
        <label>
          Enter time to solve Sudoku (in minutes) :&nbsp;&nbsp;&nbsp;
          <input
            type="number"
            value={duration}
            onChange={(e) => {
  const newDuration = Number(e.target.value);
  setDuration(newDuration);
  socket.emit('duration-change', { roomId, duration: newDuration }); 
}}
            className="time-select"
            min="2"
            max="30"
            required
          />
        </label>
      </form>)}
      {!isHost&&puzzle.length==0&&(<h5>Time duration set by Host: {duration} minutes</h5>)}
     {showStartButton&&isHost&&(<button className="start-game" onClick={handleStartGame}  >
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
        </ul>
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
       <div className="finished-list">
  <h3>✔️ Players Finished :</h3>
  <ul>
    {finishedPlayers.map((p, idx) => (
      <li key={idx}>{p.name}: {p.points} points</li>
    ))}
  </ul>
</div>

        <div>
    {showLeaderboard && (
  <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
      <h2>🏆 Leaderboard</h2>
      <ol>
        {leaderboard.map(({ playerId, score, name }, idx) => (
          <li key={idx}>{name} : {score} points</li>
        ))}
      </ol>
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
