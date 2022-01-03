import { readFileSync } from 'fs';

function getStepsUntilNoMovement(grid: string[][]): number {
  let steps = 0;

  while (true) {
    steps++;
    const result = stepGrid(grid);
    grid = result.grid;
    if (!result.moved) break;
  }

  return steps;
}

function stepGrid(grid: string[][]): { grid: string[][]; moved: number } {
  const [rows, cols] = [grid.length, grid[0].length];
  const newGrid = [...Array(rows)].map(() => [...Array(cols)].map(() => '.'));
  let moved = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] !== '>') continue;

      const destination = (j + 1) % cols;
      if (grid[i][destination] === '.') {
        newGrid[i][destination] = '>';
        moved++;
      } else {
        newGrid[i][j] = '>';
      }
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] !== 'v') continue;

      const destination = (i + 1) % rows;
      const blockedByEastHerd = newGrid[destination][j] === '>';
      const blockedBySouthHerd = grid[destination][j] === 'v';
      const canMove = !blockedByEastHerd && !blockedBySouthHerd;
      if (canMove) {
        newGrid[destination][j] = 'v';
        moved++;
      } else {
        newGrid[i][j] = 'v';
      }
    }
  }

  return { grid: newGrid, moved };
}

function parseFile(path: string): string[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split(''));
}

const exampleInput = parseFile('./src/day-25/example.txt');
const puzzleInput = parseFile('./src/day-25/puzzle.txt');

console.log('Part 1 Example input: ', getStepsUntilNoMovement(exampleInput));
console.log('Part 1 Puzzle input: ', getStepsUntilNoMovement(puzzleInput));
