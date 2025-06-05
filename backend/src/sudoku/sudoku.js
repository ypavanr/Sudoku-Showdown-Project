import { Util } from "./sudokuUtil.js";


function isValidPlace(grid, row,col,guess){
 for(let i=0;i<9;i++){
    if(grid[i][col]===guess){return false;}
 }
 for(let i=0;i<9;i++){
    if(grid[row][i]===guess){return false;}
 }
 let localBoxRow=row-(row%3);
 let localBoxcol=col-(col%3);
  for(let i=localBoxRow;i<localBoxRow+3;i++){
    for(let j=localBoxcol;j<localBoxcol+3;j++){
        if(grid[i][j]===guess){return false;}
    }
  }
 return true;
}

function solve(grid){
    for(let row=0;row<9;row++){
        for(let col=0;col<9;col++){
            if(grid[row][col]===0){
                for(let guess=1;guess<=9;guess++){
                    if(isValidPlace(grid, row, col, guess)){
                        grid[row][col]=guess;
                        if(solve(grid)){
                            return true;
                        }
                        grid[row][col]=0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}


function createPuzzle(){
    let puzzle=[];
    for(let i=0;i<9;i++){
        puzzle[i]=Array(9).fill(0);
    }
    return puzzle;
}

function getRandomBoard(board){
let number=0;
for(let i=0;i<9;i++){
    
        number = Math.floor(Math.random() * 9) + 1;
        while(!isValidPlace(board,i,0,number)){
            number = Math.floor(Math.random() * 9) + 1;
        }
        board[i][0]=number;
    
}
return board;
}

function generatePuzzle(board){
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
       if(Math.random()>0.5){
        board[i][j]=0;
       }
        }
    }
    return board;
}

function isSamePuzzle(p1, p2) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (p1[i][j] !== p2[i][j]) return false;
    }
  }
  return true;
}

let board=createPuzzle();
board=getRandomBoard(board);
solve(board);
let solvedPuzzle = JSON.parse(JSON.stringify(board));
let unsolvedPuzzle=generatePuzzle(board);
let sudoku=[solvedPuzzle,unsolvedPuzzle];
export {isSamePuzzle,isValidPlace,solve,createPuzzle,getRandomBoard,generatePuzzle}