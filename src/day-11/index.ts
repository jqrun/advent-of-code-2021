import { readFileSync } from 'fs';

const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

function getNumFlashes(grid: number[][], steps = 100): { grid: number[][]; flashes: number } {
  grid = grid.slice(0).map((x) => x.slice(0));
  let flashes = 0;

  while (steps--) {
    const { flashes: newFlashes } = stepGrid(grid);
    flashes += newFlashes;
  }

  return { grid, flashes };
}

function getSimultaneousStep(grid: number[][]): number {
  grid = grid.slice(0).map((x) => x.slice(0));
  const isFlashingAll = (x: number[][]): boolean => x.every((y) => y.every((z) => z === 0));
  let step = 0;

  while (!isFlashingAll(grid)) {
    step++;
    stepGrid(grid);
  }

  return step;
}

function stepGrid(grid: number[][]): { flashes: number } {
  const [rows, cols] = [grid.length, grid[0].length];
  const serialize = (i: number, j: number): string => `${i}-${j}`;
  let flashes = 0;

  const flashed = new Set<string>();
  const stack: [number, number][] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = (grid[i][j] + 1) % 10;
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (flashed.has(serialize(i, j))) continue;
      if (grid[i][j] !== 0) continue;

      flashed.add(serialize(i, j));
      stack.push([i, j]);

      while (stack.length) {
        const curr = stack.pop();
        flashes++;

        for (const [_i, _j] of dirs) {
          const [row, col] = [curr![0] + _i, curr![1] + _j];
          if (row < 0 || col < 0 || row >= rows || col >= cols) continue;
          if (flashed.has(serialize(row, col))) continue;

          if (grid[row][col] !== 0) {
            grid[row][col] = (grid[row][col] + 1) % 10;
          }

          if (grid[row][col] === 0) {
            flashed.add(serialize(row, col));
            stack.push([row, col]);
          }
        }
      }
    }
  }

  return { flashes };
}

function parseFile(path: string): number[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split('').map((x) => Number(x)));
}

const exampleInput = parseFile('./src/day-11/example.txt');
const puzzleInput = parseFile('./src/day-11/puzzle.txt');

console.log('Part 1 Example input: ', getNumFlashes(exampleInput));
console.log('Part 1 Puzzle input: ', getNumFlashes(puzzleInput));

console.log('Part 2 Example input: ', getSimultaneousStep(exampleInput));
console.log('Part 2 Puzzle input: ', getSimultaneousStep(puzzleInput));
