import { generateSudokuPuzzle, solve, isSamePuzzle } from "../sudoku/sudoku.js";
import { Util } from "../sudoku/sudokuUtil.js";
var solvedPuzzle;
const generatePuzzle=(req,res)=>{
   const {difficulty}=req.body;
   console.log(difficulty)
const unsolvedPuzzle = generateSudokuPuzzle(difficulty);
      const solved = JSON.parse(JSON.stringify(unsolvedPuzzle)); 
      solve(solved); 
      solvedPuzzle=solved
      console.log("solved puzzle:")
      Util.print2DArray(solvedPuzzle);
     res.status(200).json(unsolvedPuzzle)
}

const verifyMove=(req,res)=>{
    const {row,col,number}=req.body;
    var isCorrect;
    if(solvedPuzzle[row][col]==number){
        isCorrect=true;
    }
    else{
        isCorrect=false;
    }
  res.status(200).json({row,col,number,isCorrect});
}

const validateSubmission=(req,res)=>{
    const {puzzle}=req.body;
    var solved;
    if(isSamePuzzle(puzzle,solvedPuzzle)){
    solved=true;
    }
    else{
        solved=false;
    }
    res.status(200).json({solved});
}
export {generatePuzzle,verifyMove,validateSubmission}
