import { readFileSync } from 'fs';

const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function getRiskLevels(map: number[][]): { lows: number[]; risk: number } {
  const lows: number[] = [];
  const [rows, cols] = [map.length, map[0].length];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const point = map[i][j];
      const isLowPoint = dirs.every(([_i, _j]) => {
        const [row, col] = [i + _i, j + _j];
        if (row < 0 || col < 0 || row >= rows || col >= cols) return true;
        return point < map[row][col];
      });
      if (isLowPoint) lows.push(point);
    }
  }

  return { lows, risk: lows.reduce((acc, curr) => acc + curr + 1, 0) };
}

function getLargestBasins(map: number[][]): { basins: number[]; product: number } {
  const basins: number[] = [];
  const [rows, cols] = [map.length, map[0].length];
  const seen = new Set<string>();
  const serialize = (i: number, j: number): string => `${i}-${j}`;
  const stack: [number, number][] = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (seen.has(serialize(i, j))) continue;
      if (map[i][j] === 9) continue;

      stack.push([i, j]);
      seen.add(serialize(i, j));

      let basin = 0;
      while (stack.length) {
        const curr = stack.pop();
        basin++;

        for (const [_i, _j] of dirs) {
          const [row, col] = [curr![0] + _i, curr![1] + _j];
          if (row < 0 || col < 0 || row >= rows || col >= cols) continue;
          if (seen.has(serialize(row, col))) continue;
          if (map[row][col] === 9) continue;
          seen.add(serialize(row, col));
          stack.push([row, col]);
        }
      }
      basins.push(basin);
    }
  }

  basins.sort((a, b) => b - a);

  return { basins, product: basins.slice(0, 3).reduce((acc, curr) => acc * curr, 1) };
}

function parseFile(path: string): number[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split('').map((x) => Number(x)));
}

const exampleInput = parseFile('./src/day-9/example.txt');
const puzzleInput = parseFile('./src/day-9/puzzle.txt');

console.log('Part 1 Example input: ', getRiskLevels(exampleInput));
console.log('Part 1 Puzzle input: ', getRiskLevels(puzzleInput));

console.log('Part 2 Example input: ', getLargestBasins(exampleInput));
console.log('Part 2 Puzzle input: ', getLargestBasins(puzzleInput));
