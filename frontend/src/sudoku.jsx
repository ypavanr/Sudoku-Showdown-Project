import React, { useState, useEffect } from "react";
import "./Sudoku.css";

const puzzles = [
  [
    [5, 3, "", "", 7, "", "", "", ""],
    [6, "", "", 1, 9, 5, "", "", ""],
    ["", 9, 8, "", "", "", "", 6, ""],
    [8, "", "", "", 6, "", "", "", 3],
    [4, "", "", 8, "", 3, "", "", 1],
    [7, "", "", "", 2, "", "", "", 6],
    ["", 6, "", "", "", "", 2, 8, ""],
    ["", "", "", 4, 1, 9, "", "", 5],
    ["", "", "", "", 8, "", "", 7, 9]
  ],
  [
    ["", "", 3, "", 2, "", 6, "", ""],
    [9, "", "", 3, "", 5, "", "", 1],
    ["", "", 1, 8, "", 6, 4, "", ""],
    ["", "", 8, 1, "", 2, 9, "", ""],
    [7, "", "", "", "", "", "", "", 8],
    ["", "", 6, 7, "", 8, 2, "", ""],
    ["", "", 2, 6, "", 9, 5, "", ""],
    [8, "", "", 2, "", 3, "", "", 9],
    ["", "", 5, "", 1, "", 3, "", ""]
  ],
  [
    ["", "", "", 2, 6, "", 7, "", 1],
    [6, 8, "", "", 7, "", "", 9, ""],
    [1, 9, "", "", "", 4, 5, "", ""],
    [8, 2, "", 1, "", "", "", 4, ""],
    ["", "", 4, 6, "", 2, 9, "", ""],
    ["", 5, "", "", "", 3, "", 2, 8],
    ["", "", 9, 3, "", "", "", 7, 4],
    ["", 4, "", "", 5, "", "", 3, 6],
    [7, "", 3, "", 1, 8, "", "", ""]
  ]
];

// Check if a solution is valid
const isValidSudoku = (grid) => {
  const checkSet = (arr) => {
    const nums = arr.filter(val => val !== "");
    return new Set(nums).size === nums.length;
  };

  for (let i = 0; i < 9; i++) {
    const row = [], col = [], block = [];
    for (let j = 0; j < 9; j++) {
      row.push(grid[i][j]);
      col.push(grid[j][i]);

      const rowIndex = 3 * Math.floor(i / 3) + Math.floor(j / 3);
      const colIndex = 3 * (i % 3) + (j % 3);
      block.push(grid[rowIndex][colIndex]);
    }

    if (!checkSet(row) || !checkSet(col) || !checkSet(block)) {
      return false;
    }
  }
  return true;
};


export default function SudokuBoard() {
  const [cellStatus, setCellStatus] = useState([]);
  const [puzzle, setPuzzle] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
 useEffect(() => {
  const selectedPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  const stringifiedPuzzle = selectedPuzzle.map(row =>
    row.map(cell => (cell === "" ? "" : String(cell)))
  );
  setPuzzle(stringifiedPuzzle);
  setUserGrid(stringifiedPuzzle.map(row => [...row]));
  setCellStatus(stringifiedPuzzle.map(row => row.map(() => "")));
}, []);



 const handleChange = (row, col, value) => {
  const newValue = value.replace(/[^1-9]/, ""); // Allow only digits 1–9

  const newGrid = userGrid.map((r, i) =>
    r.map((cell, j) => (i === row && j === col ? newValue : cell))
  );

  const newStatus = newGrid.map((r, i) =>
    r.map((cell, j) =>
      puzzle[i][j] === "" ? validateCell(newGrid, i, j, cell) : ""
    )
  );

  setUserGrid(newGrid);
  setCellStatus(newStatus);
};


  // Recalculate validation for the entire grid
 


  const handleSubmit = () => {
    const isComplete = userGrid.every(row => row.every(cell => cell !== ""));
    if (!isComplete) {
      alert("Please fill all cells before submitting.");
      return;
    }

    if (isValidSudoku(userGrid)) {
      alert("Congratulations! Sudoku is solved correctly.");
    } else {
      alert("Oops! There’s a mistake in your solution.");
    }
  };
const validateCell = (grid, row, col, value) => {
  if (value === "") return "";

  // Check row
  for (let j = 0; j < 9; j++) {
    if (j !== col && grid[row][j] === value) return "invalid";
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && grid[i][col] === value) return "invalid";
  }

  // Check block
  const startRow = 3 * Math.floor(row / 3);
  const startCol = 3 * Math.floor(col / 3);
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if ((i !== row || j !== col) && grid[i][j] === value) return "invalid";
    }
  }

  return "valid";
};


  return (
    <div className="sudoku-container">
      <h2>Sudoku Puzzle</h2>
      <div className="sudoku-grid">
        {userGrid.map((row, i) =>
          row.map((cell, j) => (
            <input
  key={`${i}-${j}`}
  className={`sudoku-cell ${
    puzzle[i][j] !== ""
      ? ""
      : cellStatus[i][j] === "valid"
      ? "cell-valid"
      : cellStatus[i][j] === "invalid"
      ? "cell-invalid"
      : ""
  }`}
  value={cell}
  onChange={(e) => handleChange(i, j, e.target.value)}
  disabled={puzzle[i][j] !== ""}
/>

          ))
        )}
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
