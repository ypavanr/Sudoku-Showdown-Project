import React, { useState, useEffect,useRef } from "react";
import isValidCompletedSudoku from "./expertValidation";
import "./Sudoku.css";
import { FaClock } from "react-icons/fa";
import Username from "../features/username";
import axios from "axios";
import Logo from "../features/logo";
export default function Solo() {
  const [puzzle, setPuzzle] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [originalPuzzle, setOriginalPuzzle] = useState([]);
  const [inputStatus, setInputStatus] = useState({});
  const [showStartButton, setStartButton]=useState(true);
  const [submissionMessage, setSubmitMessage]=useState('');
  const [secondsElapsed, setSecondsElapsed]=useState(0);
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const selectedLevelRef = useRef(selectedLevel);
  const intervalRef=useRef(null);
  const token = localStorage.getItem("token");
  const handleStartGame = async() => {
    let difficulty = selectedLevelRef.current;
    try{
        const puzzle=await axios.post("http://localhost:3000/sudoku/generate",{difficulty}   )
        setPuzzle(puzzle.data);
        setOriginalPuzzle(puzzle.data);
        startTimer();
        setStartButton(false);
        console.log(puzzle.data);
    }
    catch (err) {
      alert("error fetching puzzle, "+ err);
    }
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
    return () => {
    clearInterval(intervalRef.current);
    };
  }, []);
   
  const handleInputChange = (e, row, col) => {
    const val = e.target.value;
    if (val === "") {setPuzzle((prev) => {
      const newPuzzle=prev.map((r) => [...r]);
      newPuzzle[row][col]=0;
      return newPuzzle;
    });
      setInputStatus((prev) => {
      const copy={...prev};
      delete copy[`${row}-${col}`];
      return copy;
    });
    }

    const num = parseInt(val);
    if (num >= 1 && num <= 9) {
  if (selectedLevelRef.current === "expert") {
    setPuzzle((prev) => {
      const newPuzzle = prev.map((r) => [...r]);
      newPuzzle[row][col] = num;
      return newPuzzle;
    });
    setInputStatus((prev) => ({
      ...prev,
      [`${row}-${col}`]: "", 
    }));
  } else {
    const validateResult = async (row, col, number) => {
      try {
        const response = await axios.post(
          "http://localhost:3000/sudoku/verifymove",
          { row, col, number },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const isCorrect = response.data.isCorrect;
        setPuzzle((prev) => {
          const newPuzzle = prev.map((r) => [...r]);
          newPuzzle[row][col] = number;
          return newPuzzle;
        });
        setInputStatus((prev) => ({
          ...prev,
          [`${row}-${col}`]: isCorrect ? "correct" : "wrong",
        }));
      } catch (err) {
        alert("error validating move, " + err);
      }
    };
    validateResult(row, col, num);
  }
}

  };
  const handleSubmission = async () => {
  if (selectedLevelRef.current === "expert") {
    if (isValidCompletedSudoku(puzzle)) {
      setSubmitMessage("Game completed. Hooray!!!");
      stopTimer();
    } else {
      setSubmitMessage("Invalid solution. Check rows, columns, or boxes.");
    }
    return;
  }

  try {
    const result = await axios.post(
      "http://localhost:3000/sudoku/validatesubmission",
      { puzzle },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.data.solved) {
      setSubmitMessage("Game completed. Hooray!!!");
      stopTimer();
    } else {
      setSubmitMessage("Game not yet completed.");
    }
  } catch (err) {
    alert("error validating submission, " + err);
  }
};


  return (
    <div>
      <Username/>
    <div className="sudoku-container">
      <Logo/>
      <h1 className="Game">Sudoku Savvy</h1>
      <p>Game Mode : Solo</p>
      {showStartButton&&(<form>
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
  }}
  className="mode-select"
>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
  <option value="expert">Expert</option>
</select>
      </form>)}
     {showStartButton&&(<button className="start-game" onClick={handleStartGame}  >
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
                const isOriginal = originalPuzzle[rIdx]?.[cIdx] !== 0;
                return (
                  <input
  key={key}
  type="text"
  maxLength={1}
  className={`sudoku-input ${status || ""} 
    ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-right" : ""} 
    ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-bottom" : ""} 
    ${isOriginal ? "prefilled-cell" : ""} 
    ${isOriginal && selectedLevel === "expert" ? "expert-original" : ""}`}
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
         <button onClick={() => {
         if(submissionMessage=='Game completed. Hooray!!!')
          { setStartButton(true);
  setPuzzle([]);
  setInputStatus({});
  setSubmitMessage('');
  setSecondsElapsed(0);
  setIsRunning(false);
}
setSubmitMessage('');
         }}>Close</button>
    </div>
       </div>
          )}
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
                    <li>
                      Each number can appear only once in each row,
                      column, and 3x3 box.
                    </li>
                    <li>Correct entries turn green, incorrect ones turn red.</li>
                  </ul>
                 <h3>Expert Level</h3>
                  <ul>
                    <li>There can be many solutions for this mode 
                        so validation is only done after the game is completed.
                    </li>
                  </ul>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
} 
