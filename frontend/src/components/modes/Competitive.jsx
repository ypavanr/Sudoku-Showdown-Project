import React, { useState, useEffect,useRef } from "react";
import { useNavigate} from "react-router-dom";
import "./sudoku.css";
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
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [originalPuzzle, setOriginalPuzzle] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const [validationChoice,setValidationChoice]=useState('on');
  const selectedLevelRef = useRef(selectedLevel);
  const selectedValidationRef=useRef(validationChoice)
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
  const pointsRef = useRef(0);

  const navigate = useNavigate();

  const handleStartGame = () => {
    let time=durationRef.current;
    let difficulty = selectedLevelRef.current;
    let validation=selectedValidationRef.current;
    socket.emit("start-game", {roomId,difficulty,validation,time});    
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
          socket.emit("time-up", roomId, pointsRef.current);
          setSubmitMessage("Time's up! Game over.");
         }
    };
    tick(); 
    intervalRef.current = setInterval(tick, 1000);
  };

  const durationRef = useRef(duration);

  const stopTimer = () => {
    clearInterval(intervalRef.current)
  };

  useEffect(() => {
    socket.on('reload',()=>{
      navigate('/room');
    })

    socket.emit('ready');  

    socket.on('socket-id',(sid)=>{
      setMySocketId(sid);
    });

    socket.emit('get-players', roomId);

    socket.on('return-players', ({ players,host }) => {
      setPlayers(players);
      setHostId(host);
    });

    socket.on("update-players",({players,host})=>{
      setPlayers(players);
      setHostId(host);
    });

    const handleUnload=()=>{
      socket.emit("leave-room");
    };

    const handlePopState=()=>{
      socket.emit("leave-room");
    };

    window.addEventListener("beforeunload",handleUnload); 

    window.addEventListener("popstate",handlePopState);

    durationRef.current = duration;

    socket.on("puzzle", ({puzzle,time}) => {
      setShowLeaderboard(false);
      setSubmitMessage('');
      setOriginalPuzzle(puzzle); 
      setPuzzle(puzzle.map(row => [...row]))
      setInputStatus({});
      startTimer(time);
      setStartButton(false);
    });

    socket.on("show-leaderboard", (leaderboard) => {
      setLeaderboard(leaderboard); 
      setShowLeaderboard(true);
      stopTimer();
    });

    socket.on('new-points',(points)=>{
      setPoints(points);
    });

    socket.on("player-finished",({playerId,points,name})=>{
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
      if (isCorrect==false) {
         setPoints(prev => {
        const newPoints = prev - 5;
        pointsRef.current = newPoints;
        return newPoints;
    });
      }     
      else {
        setPoints(prev => {
        const newPoints = prev + 10;
        pointsRef.current = newPoints;
        return newPoints;
    });
      }
      setInputStatus((prev) => ({
        ...prev,
        [`${row}-${col}`]: isCorrect ? "correct" : "wrong",
      }));
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
    
    socket.on('update-validation',(newValidation)=>{
      setValidationChoice(newValidation);
    })

    return () => 
    {
      socket.off('update-validation');
      socket.off('reload');
      socket.off('is-host');
      socket.off('update-duration');
      socket.off('not-host');
      socket.off('update-difficulty');
      socket.off('new-points');
      socket.off("show-leaderboard");
      socket.off("player-finished");
      socket.off("puzzle");
      socket.off("validate-result");
      socket.off("game-complete");
      socket.off("game-incomplete");
      socket.off("error");
      socket.off("update-players");
      socket.off("connect");
      socket.off('return-players');
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("popstate", handlePopState);
      clearInterval(intervalRef.current);
    };
  }, [duration]);
   
  const handleInputChange = (e, row, col) => {
    const val = e.target.value;
    if (selectedLevel === "expert"|| validationChoice==="off") {
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
      return;
    }

    const num = parseInt(val);
    if (num >= 1 && num <= 9) {
      setPuzzle((prev) => {
        const newPuzzle = prev.map((r) => [...r]);
        newPuzzle[row][col] = num;
        return newPuzzle;
      });
      socket.emit("validate-move", {roomId,puzzle,row,col,number: num,socketId: socket.id,});
    } 
  };

  const handleSubmission = () => {
    const total=durationRef.current*60;
    const remaining=timeLeft;     
    const percentageTimeLeft=(remaining/total)*100;

    if (selectedLevel==="expert"||validationChoice==="off"){
      const isComplete=puzzle.every(row=>row.every(cell=>cell!==0));
      if (!isComplete){
        setSubmitMessage("Game not yet completed");
        return;
      }
      if (!isValidCompletedSudoku(puzzle)){
        setSubmitMessage("Puzzle is not valid. Keep trying!");
      return;
      }

      const remaining=timeLeft;
      setPoints(remaining);
      socket.emit("expert-submission-competitive",{roomId,remaining});
      setSubmitMessage("Game completed. Hoorayy!!!");
      disableSubmitButton(true);
    }
    else {
      const total = durationRef.current * 60;
      const percentageTimeLeft = (timeLeft / total) * 100;
      socket.emit("validate-submission-competitive", {
        roomId,
        puzzle,
        points,
        percentageTimeLeft,
      });
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

        {showStartButton && isHost && (
          <div className="toggle-wrapper">
            <label className="toggle-label">
              Validation :&nbsp;
              <div className="toggle-container">
                <span className="toggle-option">Off</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={validationChoice==="on"}
                    onChange={(e)=>{
                      const newValidationChoice=e.target.checked?"on":"off";
                      setValidationChoice(newValidationChoice);
                      selectedValidationRef.current=newValidationChoice;
                      socket.emit('validation-change',{roomId,validation:newValidationChoice });
                    }}
                    disabled={selectedLevel==="expert"}
                  />
                  <span className="slider" />
                </div>
                <span className="toggle-option">On</span>
              </div>
            </label>
          </div>
        )}

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
              if(newDifficulty=='expert'){
                setValidationChoice("off");
                selectedValidationRef.current = "off";
                socket.emit('validation-change', { roomId, validation: "off" });
              }
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

        {!isHost&&puzzle.length==0 &&(
          <div className="toggle-wrapper">
            <h5>Validation set by Host :&nbsp;</h5>
            <div className="toggle-container">
              <h5>Off</h5>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={validationChoice === "on"}
                  readOnly
                  disabled
                />
                <span className="slider" />
              </div>
              <h5>On</h5>
            </div>
          </div>
        )}

        {!isHost&&puzzle.length==0&&(<h5>Difficulty level set by Host : {selectedLevel} </h5>)}

        {showStartButton&&isHost&&(<button className="start-game" onClick={handleStartGame}  >
          Start Game
        </button>)} 

        {!showStartButton&&(<h5>Difficulty Level : {selectedLevel}</h5>)}
        {!showStartButton&&(<h5>Validation : {validationChoice}</h5>)}

        <div className="sudoku-grid">
          {puzzle.length > 0 && puzzle.map((row, rIdx) => (
            <div className="sudoku-row" key={rIdx} style={{ display: "flex" }}>
              {row.map((cell, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const status = (selectedLevel === "expert"||validationChoice==='off') ? "" : inputStatus[key];
                const isOriginal = originalPuzzle[rIdx]?.[cIdx] !== 0;
                return (
                  <input  
                    key={key}
                    type="text"
                    maxLength={1}
                    className={`sudoku-input 
                    ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-right" : ""} 
                    ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-bottom" : ""} 
                    ${isOriginal ? "prefilled-cell" : ""} 
                    ${isOriginal && (selectedLevel === "expert"||validationChoice==='off') ? "expert-original" : ""} 
                    ${highlightedNumber !== null && cell === highlightedNumber ? "highlighted-cell" : ""} 
                    ${validationChoice==="on"?status || "":""}`}
                    value={cell === 0 ? "" : cell}
                    readOnly={isOriginal}
                    onChange={(e) => {
                      handleInputChange(e, rIdx, cIdx);
                    }}
                    onClick={() => {
                      const value = puzzle[rIdx][cIdx];
                      if (value !== 0) {
                        setHighlightedNumber(prev => prev === value ? null : value);
                      } 
                      else {
                        setHighlightedNumber(null);
                      }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div><br></br>

        <div className="game-actions">
          {!showStartButton && (
            <button className="start-game" onClick={handleSubmission} disabled={submitButton}>
              Submit
            </button>
          )}
          <button className="quit-game" onClick={handleQuit}>
            Quit
          </button>
        </div>

        <div className="left-panel">
          {submissionMessage&&(
            <div className="modal-overlay">
              <div className="modal-content leaderboard-modal">
                <div className="game-message">{submissionMessage}</div>
                <br></br>
                <button onClick={() => {setSubmitMessage('');}}>Close</button>
              </div>
            </div>)
          }

          <div className="score-time">
            <FaClock size={30} style={{ marginRight: '10px' }} />
            <span className="time-text">{formatTime(timeLeft)}</span>
            {(selectedLevel != "expert" && validationChoice=="on")&& <span className="points-text"> |&nbsp; Points: {points}</span>}
            <div className="rules-hover-container">
              <span className="rules-label">
                &nbsp; | &nbsp;Rules <span className="question-icon">?</span>
              </span>
              <div className="rules-fixed">
                <h3>Validation Rules</h3>
                <ul>
                  <li><strong>ON :</strong></li>
                    <ul>
                      <li>For every correct entry, it's +10 Points (green)</li>
                      <li>For every wrong entry, it's -5 Points (red)</li>
                      <li>
                        Bonus: If you complete the puzzle early, your final points are increased
                        by the percentage of time left.<br />
                        For example, if 40% time is left and you scored 60 points : Final Score = 60 × (1 + 0.4) = 84
                      </li>
                    </ul>

                  <li><strong>OFF :</strong></li>
                  <ul>
                    <li>Validation is performed only after the puzzle is submitted.</li>
                    <li>The leaderboard ranks players based on correct puzzle completion
                      , with points awarded equal to the number of seconds remaining.
                    </li>
                  </ul>
                </ul>

                <h3>Expert Level</h3>
                <ul>
                  <li>Since multiple valid solutions may exist in this mode
                    , validation is <strong>OFF</strong> by default.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="player-list">
            {players && Object.entries(players).map(([socketId, player]) => {
              const avatarPath = `/icons/${player.icon}`;
              const label =
                socketId === hostId && socketId === mySocketId ? `${player.name} (You) (Host)`
                : socketId === hostId ? `${player.name} (Host)`
                : socketId === mySocketId ? `${player.name} (You)`
                : player.name;
              const hasFinished = finishedPlayers.some(fp => fp.playerId === socketId);
              return (
                <div className={`player-item ${hasFinished ? "player-finished" : ""}`} key={socketId}>
                  <img src={avatarPath} alt={player.name}/>
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
                  <button onClick={() => {  
                    setShowLeaderboard(false);
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
                >Yes</button>
                <button
                  onClick={() => {
                    setShowQuitModal(false);
                    setSubmitMessage('');
                  }}
                >No</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
} 
