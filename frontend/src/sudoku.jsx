import React, { useState } from 'react';
import './Sudoku.css';

const isValidSudoku = (board) => {
  const isValidBlock = (block) => {
    const nums = block.filter(n => n !== '');
    return new Set(nums).size === nums.length;
  };

  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const col = board.map(row => row[i]);
    if (!isValidBlock(row) || !isValidBlock(col)) return false;
  }

  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 9; j += 3) {
      const block = [];
      for (let r = i; r < i + 3; r++) {
        for (let c = j; c < j + 3; c++) {
          block.push(board[r][c]);
        }
      }
      if (!isValidBlock(block)) return false;
    }
  }

  return true;
};

const SudokuBoard = () => {
  const initialBoard = Array(9).fill(null).map(() => Array(9).fill(''));
  const [board, setBoard] = useState(initialBoard);
  const [message, setMessage] = useState('');

  const handleChange = (row, col, value) => {
    if (/^[1-9]?$/.test(value)) {
      const newBoard = board.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? value : c))
      );
      setBoard(newBoard);
    }
  };

  const handleSubmit = () => {
    if (board.some(row => row.includes(''))) {
      setMessage('Please fill all cells');
    } else if (isValidSudoku(board)) {
      setMessage('✅ Valid Sudoku Solution!');
    } else {
      setMessage('❌ Invalid Solution. Check rows, columns, and blocks.');
    }
  };

  return (
    <div className="sudoku-container">
      <h2>Sudoku Puzzle</h2>
      <div className="sudoku-grid">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              value={cell}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className="sudoku-cell"
              maxLength="1"
            />
          ))
        )}
      </div>
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
      <p className="result-message">{message}</p>
    </div>
  );
};

export default SudokuBoard;
