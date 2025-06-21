import React from "react";
import "./Background.css";

const SudokuBlock = ({ top, left, numbers, delay }) => {
  const cells = Array(9).fill("");
  const positions = [];

  while (positions.length < numbers.length) {
    const pos = Math.floor(Math.random() * 9);
    if (!positions.includes(pos)) {
      positions.push(pos);
    }
  }

  positions.forEach((pos, i) => {
    cells[pos] = numbers[i];
  });

  return (
    <div className="sudoku-block" style={{ top, left, animationDelay: delay }}>
      {cells.map((num, i) => (
        <span key={i} className="sudoku-number">{num || ""}</span>
      ))}
    </div>
  );
};

const blocksData = [
  { top: "5%", left: "5%", numbers: [5, 3, 7], delay: "0s" },
  { top: "12%", left: "40%", numbers: [1, 9, 5], delay: "2.5s" },
  { top: "15%", left: "75%", numbers: [8, 6], delay: "4s" },
  { top: "30%", left: "10%", numbers: [4, 8, 3], delay: "1s" },
  { top: "35%", left: "55%", numbers: [2, 7, 6], delay: "3.5s" },
  { top: "40%", left: "80%", numbers: [3, 1, 9], delay: "0.5s" },
  { top: "60%", left: "5%", numbers: [6, 1, 9], delay: "2s" },
  { top: "65%", left: "45%", numbers: [8, 7, 9], delay: "4.5s" },
  { top: "70%", left: "70%", numbers: [2, 5, 4], delay: "1.5s" },
  { top: "85%", left: "15%", numbers: [1, 6, 8], delay: "3s" },
  { top: "90%", left: "60%", numbers: [7, 3, 2], delay: "0s" },
];

const Background = () => (
  <div className="floating-sudoku-container">
    {blocksData.map((block, index) => (
      <SudokuBlock key={index} {...block} />
    ))}
  </div>
);

export default Background;
