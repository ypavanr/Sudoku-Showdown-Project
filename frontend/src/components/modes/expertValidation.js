function isValidCompletedSudoku(grid) {
  const isValidSet = (nums) => {
    const seen = new Set();
    for (const num of nums) {
      if (num === 0 || seen.has(num)) return false;
      seen.add(num);
    }
    return true;
  };

  for (let i = 0; i < 9; i++) {
    const row = grid[i];
    const col = grid.map(row => row[i]);
    if (!isValidSet(row) || !isValidSet(col)) return false;
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          box.push(grid[3 * boxRow + i][3 * boxCol + j]);
        }
      }
      if (!isValidSet(box)) return false;
    }
  }

  return true;
}
export default isValidCompletedSudoku