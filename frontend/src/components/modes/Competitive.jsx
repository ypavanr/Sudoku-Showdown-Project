import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "../../socket.js";
import { useParams } from "react-router-dom";
import "./Competitive.css"
import Username from "../features/username";
import CopyButton from "../features/CopyButton";
import ChatBox from "../features/ChatBox.jsx";
import Logo from "../features/logo.jsx";
import isValidCompletedSudoku from "./expertValidation.js";
export default function Competitive() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [originalPuzzle, setOriginalPuzzle] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const selectedLevelRef = useRef(selectedLevel);
  const [leaderboard, setLeaderboard] = useState([]); 
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
  const deadlineRef = useRef(null);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration,setDuration]=useState(30);
  let [points,setPoints]=useState(0);
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [submitButton, disableSubmitButton]=useState(false);
  const [isHost, setIsHost]=useState(true);
  const intervalRef=useRef(null);
  const [players, setPlayers] = useState({});
  const [mySocketId, setMySocketId] = useState("");
  const [hostId, setHostId] = useState("");
  const navigate = useNavigate();
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
    socket.on('reload',()=>{
      navigate('/room');
    })
    socket.emit('ready');
        socket.on('socket-id',(sid)=>{
          setMySocketId(sid);
        });
        const handleBeforeUnload = () => {
        socket.disconnect();
      };
      socket.emit('get-players', roomId);
    socket.on('return-players', ({ players,host }) => {
      setPlayers(players);
      setHostId(host);
    });
    
       socket.on("update-players",({players,host})=>{
        console.log("Updated players:", players)
        setPlayers(players);
        setHostId(host);
      });
   
  window.addEventListener("beforeunload", function () {
    console.log("Triggering leave message");
    sendLeaveMessage();
  });
    durationRef.current = duration;
    socket.on("puzzle", ({puzzle,time}) => {
        setShowLeaderboard(false);
  setSubmitMessage('');
  setOriginalPuzzle(puzzle); 
  setPuzzle(puzzle.map(row => [...row]))
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
      navigate("/room");
    })
    socket.on('is-host',()=>{
       setIsHost(true);
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
      socket.off('reload');
     socket.off('is-host');
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
      socket.off("update-players");
      socket.off("connect");
      socket.off('return-players');
      socket.off('socket-id');
    };
  }, [duration]);
   
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

      return;
    }

    const num = parseInt(val);
    if (num >= 1 && num <= 9) {
      setPuzzle((prev) => {
        const newPuzzle = prev.map((r) => [...r]);
        newPuzzle[row][col] = num;
        return newPuzzle;
      });
    }

    return;
  }

  if (val === "") {
    socket.emit("clear-cell", { roomId, row, col });
    return;
  }

  const num = parseInt(val);
  if (num >= 1 && num <= 9) {
    setPuzzle((prev) => {
      const newPuzzle = prev.map((r) => [...r]);
      newPuzzle[row][col] = num;
      return newPuzzle;
    });

    socket.emit("validate-move", {
      roomId,
      puzzle,
      row,
      col,
      number: num,
      socketId: socket.id,
    });
  }
};


  const handleSubmission = () => {
  const total=durationRef.current*60;
  const remaining=timeLeft;     
  const percentageTimeLeft=(remaining/total)*100;
  if(selectedLevel!=='expert'){
     socket.emit("validate-submission-competitive", {
    roomId,
    puzzle,
    points,
    percentageTimeLeft
  });
  }
  else{
    if(isValidCompletedSudoku(puzzle)){
      socket.emit('expert-submission-competitive',{roomId,remaining})
      setPoints(remaining)
      setSubmitMessage("Game completed. Hoorayy!!!");
      disableSubmitButton(true);
    }
    else{
      setSubmitMessage("Game not yet completed.");
    }
  }
  console.log("durationRef.current:", durationRef.current);
  console.log("Time left:", remaining, "seconds");
  console.log("Percentage of time left:", percentageTimeLeft);
};

const handleQuit = () => {
  setSubmitMessage("Are you sure you want to quit?");
  setShowQuitModal(true);
};

  return (
    <div>
       <Username />
      <div className="top-bar">
 
</div>
<ChatBox />

      
    <div className="sudoku-container">
       <Logo/>
      <h1 className="Game">Sudoku Savvy</h1>
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
  <option value="expert">Expert</option>
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
                const status = selectedLevel === "expert" ? "" : inputStatus[key];
                const isOriginal = originalPuzzle[rIdx]?.[cIdx] !== 0;
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
       <div className="game-actions">
      {!showStartButton && (
        <button className="start-game" onClick={handleSubmission}>
           Submit
        </button>
      )}
      <button className="quit-game" onClick={handleQuit}>
        Quit
      </button>
</div>
      <div/>
      <div className="left-panel">
        {submissionMessage&&(
          <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
          <div className="game-message">{submissionMessage}</div>
          <br></br>
          <button onClick={() => {setSubmitMessage('');
          }}>Close</button>
          </div>
          </div>)
          }
          
         <div className="score-time">
  <FaClock size={30} style={{ marginRight: '10px' }} />
  <span className="time-text">{formatTime(timeLeft)}</span>
  <span className="points-text"> |&nbsp; Points: {points}</span>

  <div className="rules-hover-container">
    <span className="rules-label">
      &nbsp; | &nbsp;Rules <span className="question-icon">?</span>
    </span>
    <div className="rules-fixed">
      <h3>Competition Rules</h3>
      <ul>
        <li>For every correct entry, it's +10 Points</li>
        <li>For every wrong entry, it's -5 Points</li>
        <li>
          Bonus: If you complete the puzzle early, your final points are increased
          by the percentage of time left.<br />
          For example, if 40% time is left and you scored 60 points:<br />
          Final Score = 60 × (1 + 0.4) = 84
        </li>
      </ul>
    </div>
  </div>
</div>
      <div className="player-list">
  {players&& Object.entries(players).map(([socketId, player])=>{
    const avatarPath = `/src/assets/icons/${player.icon}`;
    const label = socketId === hostId && socketId === mySocketId ? `${player.name} (You) (Host)` 
    : socketId === hostId ? `${player.name} (Host)`
    : socketId === mySocketId ? `${player.name} (You)`
    : player.name;
    return (
      <div className="player-item" key={socketId}>
        <img src={avatarPath} alt={player.name} />
        <span>{label}</span>
      </div>
    );
  })}
</div>
       <div className="finished-list">
  
    {showLeaderboard && (
  <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
      <h2>🏆 Leaderboard</h2>
        {leaderboard.map(({ playerId, score, name }, idx) => {
          const displayName = playerId === mySocketId ? `${name} (You)` : name;
          return (<li key={idx}> {idx + 1}. {displayName} : {score} points </li>);
        })}
      <button onClick={() => {  setShowLeaderboard(false);
  setStartButton(true);
  setPuzzle([]);
  setInputStatus({});
  setPoints(0);
  setSubmitMessage('');
  disableSubmitButton(false);
  setFinishedPlayers([]);
      }}>Close</button>

    </div>
  </div>
)}
  </div>
  {showQuitModal && (
  <div className="modal-overlay">
    <div className="modal-content leaderboard-modal">
      <div className="game-message">{submissionMessage}</div>
      <br />
      <button
        onClick={() => {
          socket.emit('leave-room');
          setShowQuitModal(false);
          navigate('/room');
        }}
        style={{ backgroundColor: "#d9534f", color: "white", marginRight: "10px" }}
      >
        Yes
      </button>
      <button
        onClick={() => {
          setShowQuitModal(false);
          setSubmitMessage('');
        }}
      >
        No
      </button>
    </div>
  </div>
)}
  </div>
  </div>
    </div>
  );
} 
