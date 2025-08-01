import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./sudoku.css";
import { FaClock } from "react-icons/fa";
import socket from "../../socket.js";
import Logo from "../features/logo.jsx";
import isValidCompletedSudoku from "./expertValidation.js";
import { useParams } from "react-router-dom";
import Username from "../features/username";
import CopyButton from "../features/CopyButton";
import ChatBox from "../features/ChatBox.jsx";

export default function Cooperative() {
  const [originalCells, setOriginalCells] = useState([]);
  const [validationChoice,setValidationChoice]=useState('on');
  const selectedValidationRef=useRef(validationChoice)
  const {roomId } = useParams();
  const [puzzle, setPuzzle] = useState([]);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const selectedLevelRef = useRef(selectedLevel);
  const [isHost, setIsHost]=useState(true)
  const [players, setPlayers] = useState({});
  const [mySocketId, setMySocketId] = useState("");
  const [hostId, setHostId] = useState("");
  const [lockedCells,setLockedCells]=useState(new Set());
  const navigate = useNavigate();

  const handleStartGame = () => {
    let difficulty = selectedLevelRef.current;
    let validation=selectedValidationRef.current;
    socket.emit("start-game", {roomId,difficulty,validation,}); 
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
    socket.on('update-validation',(newValidation)=>{
      setValidationChoice(newValidation);
    })

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

    socket.on("puzzle", ({puzzle,}) => {
      setSubmitMessage('');
      setPuzzle(puzzle);
      setOriginalCells(puzzle.map(row => row.map(cell => cell !== 0)) );
      startTimer();
      setInputStatus({});
      setStartButton(false);
      setLockedCells(new Set());
    });

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
      setInputStatus((prev) => ({
        ...prev,
        [`${row}-${col}`]: isCorrect ? "correct" : "wrong",
      }));
      if(isCorrect) {
        setLockedCells((prev)=>new Set(prev).add(`${row}-${col}`));
      }
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
      socket.off('update-validation');
      socket.off("update-expert-input");
      socket.off("update-expert-clear");
      socket.off('reload');
      socket.off('is-host');
      socket.off('not-host');
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
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
   
  const handleInputChange = (e, row, col) => {
    const val = e.target.value;
    if (selectedLevel === "expert"||validationChoice === "off") {
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
      socket.emit("validate-move", {roomId,puzzle,row,col,number: num,socketId: socket.id,});
      setPuzzle((prev) => {
        const newPuzzle = prev.map((r) => [...r]);
        newPuzzle[row][col] = num;
        return newPuzzle;
      });
    }
  };

  const handleSubmission = () => {
    if (selectedLevel==="expert"||validationChoice==="off"){
      const isComplete=puzzle.every(row=>row.every(cell=>cell!==0));
      if (!isComplete){
        setSubmitMessage("Game not yet completed");
        return;
      }
      if (!isValidCompletedSudoku(puzzle)){
        setSubmitMessage("Puzzle is not valid. Keep trying!");
        return;
      };
        socket.emit("expert-submission-cooperative",roomId);
    }
    else {
        socket.emit("validate-submission", { roomId, puzzle });
    }
  };
    const handleQuit = () => {
    setSubmitMessage("Are you sure you want to quit?");
    setShowQuitModal(true);
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
            Choose the Difficulty Level : &nbsp;&nbsp;
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

        {!isHost&&puzzle.length==0&&(<h5>Difficulty Level set by Host : {selectedLevel} </h5>)}
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

        {showStartButton&&isHost&&(<button className="start-game" onClick={handleStartGame}>
          Start Game
        </button>)} 

        {!showStartButton&&(<h5>Difficulty Level : {selectedLevel}</h5>)}
        {!showStartButton&&(<h5>Validation : {validationChoice}</h5>)}

        <div className="sudoku-grid">
          {puzzle.length > 0 && puzzle.map((row, rIdx) => (
            <div className="sudoku-row" key={rIdx} style={{ display: "flex" }}>
              {row.map((cell, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const status = (selectedLevel === "expert"||validationChoice==="off") ? "" : inputStatus[key];
                const isOriginal = originalCells[rIdx]?.[cIdx] === true;

                return (
                  <input
                    key={key}
                    type="text"
                    maxLength={1}
                    className={`sudoku-input 
                    ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-right" : ""} 
                    ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-bottom" : ""} 
                    ${isOriginal ? "prefilled-cell" : ""} 
                    ${isOriginal && (selectedLevel === "expert" || validationChoice==="off") ? "expert-original" : ""} 
                    ${highlightedNumber !== null && cell === highlightedNumber ? "highlighted-cell" : ""} 
                    ${validationChoice==="on"?status || "":""}`}
                    value={cell === 0 ? "" : cell}
                    readOnly={isOriginal||lockedCells.has(`${rIdx}-${cIdx}`)}
                    onChange={(e) => {
                      handleInputChange(e, rIdx, cIdx); 
                    }}
                    onClick={() => {
                      const value = puzzle[rIdx][cIdx];
                      if (value !== 0) {
                        setHighlightedNumber(prev => prev === value ? null : value);
                      } else {
                        setHighlightedNumber(null);
                      }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div><br></br>

        < div className="game-actions">
          {!showStartButton && (
            <button className="start-game" onClick={handleSubmission}>
              Submit
            </button>
          )}
          <button className="quit-game" onClick={handleQuit}>
            Quit
          </button>
        </div>
      </div>

      <div className="left-panel">
        {submissionMessage&&(
          <div className="modal-overlay">
            <div className="modal-content leaderboard-modal">
              <div className="game-message">{submissionMessage}</div>
              <br></br>
              <button onClick={() => {
                if(submissionMessage=='Puzzle solved! Hooray!!!'){ 
                  setStartButton(true);
                  setPuzzle([]);
                  setInputStatus({});
                  setSubmitMessage('');
                  setLockedCells(new Set());
                }
                setSubmitMessage('');
              }}>Close</button>
            </div>
          </div>
        )}

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
                </ul>

                <h3>Validation Rules</h3>
                <ul>
                  <li><strong>ON :</strong></li>
                    <ul>
                      <li>Correct entries turn green, incorrect ones turn red.</li>
                    </ul>

                  <li><strong>OFF :</strong></li>
                  <ul>
                    <li>Validation is performed only after the puzzle is submitted.</li>
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
        </div>

        <div className="player-list">
          {players && Object.entries(players).map(([socketId, player]) => {
            const avatarPath = `/icons/${player.icon}`;
            const label = socketId === hostId && socketId === mySocketId
              ? `${player.name} (You) (Host)`: socketId === hostId
              ? `${player.name} (Host)`: socketId === mySocketId
              ? `${player.name} (You)`: player.name;

            return (
              <div className="player-item" key={socketId}>
                <img src={avatarPath} alt={player.name} />
                <span>{label}</span>
              </div>
            );
          })}
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
  );
} 
