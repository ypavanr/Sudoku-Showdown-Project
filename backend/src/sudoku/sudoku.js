
function generateSudokuPuzzle(level) {
  const SIZE = 9;
  const EMPTY = 0;

  // Create a blank 9x9 grid
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));

  // Helper: Check if placing num at (row, col) is valid
  function isValid(grid, row, col, num) {
    for (let i = 0; i < SIZE; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(col / 3) + i % 3;
      if (grid[boxRow][boxCol] === num) return false;
    }
    return true;
  }

  // Backtracking solver: returns number of solutions found (stop after 2)
  function countSolutions(grid, limit = 2) {
    let count = 0;
    function solve() {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c] === EMPTY) {
            for (let n = 1; n <= SIZE; n++) {
              if (isValid(grid, r, c, n)) {
                grid[r][c] = n;
                solve();
                grid[r][c] = EMPTY;
              }
            }
            return;
          }
        }
      }
      count++;
      if (count >= limit) return;
    }
    solve();
    return count;
  }

  // Fill the diagonal 3x3 boxes first to make solving faster
  function fillDiagonalBoxes(grid) {
    for (let box = 0; box < SIZE; box += 3) {
      const nums = shuffle([...Array(SIZE).keys()].map(n => n + 1));
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          grid[box + i][box + j] = nums[i * 3 + j];
    }
  }

  // Fill the entire grid with a valid solution
  function fillGrid(grid) {
    function fill(r = 0, c = 0) {
      if (r === SIZE) return true;
      const [nextR, nextC] = c === SIZE - 1 ? [r + 1, 0] : [r, c + 1];
      if (grid[r][c] !== EMPTY) return fill(nextR, nextC);

      const nums = shuffle([...Array(SIZE).keys()].map(n => n + 1));
      for (let num of nums) {
        if (isValid(grid, r, c, num)) {
          grid[r][c] = num;
          if (fill(nextR, nextC)) return true;
          grid[r][c] = EMPTY;
        }
      }
      return false;
    }
    return fill();
  }

  // Remove cells while keeping the puzzle solvable and unique
  function removeCells(grid) {
    let attempts=0;
    if(level==='easy')attempts=30;
    if(level==='medium')attempts=45;
    if(level==='difficult')attempts=60;
 
    for (let i = 0; i < attempts; i++) {
      const row = Math.floor(Math.random() * SIZE);
      const col = Math.floor(Math.random() * SIZE);
      const backup = grid[row][col];
      if (backup === EMPTY) {i--;}
      grid[row][col] = EMPTY;
      const gridCopy = grid.map(row => row.slice());
      if (countSolutions(gridCopy) !== 1) {
        grid[row][col] = backup; // revert if not unique
      }
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  fillDiagonalBoxes(grid);
  fillGrid(grid);
  const puzzle = grid.map(row => row.slice()); // deep copy
  removeCells(puzzle);

  return puzzle;
}
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
function isSamePuzzle(p1, p2) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (p1[i][j] !== p2[i][j]) return false;
    }
  }
  return true;
}

const solved = generateSudokuPuzzle('medium');
let unsolvedPuzzle = JSON.parse(JSON.stringify(solved));
solve(solved);
export {generateSudokuPuzzle, solve,isSamePuzzle}
