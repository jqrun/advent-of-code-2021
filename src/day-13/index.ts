import { readFileSync } from 'fs';

function drawPoints(points: [number, number][]): string {
  const grid: string[][] = [];
  for (const [x, y] of points) {
    while (grid.length < y + 1) {
      grid.push([]);
    }

    while (grid[y].length < x + 1) {
      grid[y].push('.');
    }

    grid[y][x] = '#';
  }

  return grid.map((x) => x.join('')).join('\n');
}

function getPointsAfterFolding(
  points: [number, number][],
  folds: [number, number][]
): { points: [number, number][]; count: number } {
  points = points.slice(0);
  const seen = new Set<string>(points.map((x) => serialize(x[0], x[1])));

  for (const [foldX, foldY] of folds) {
    const newPoints: typeof points = [];

    for (const [_x, _y] of points) {
      if ((foldX && _x < foldX) || (foldY && _y < foldY)) {
        newPoints.push([_x, _y]);
        continue;
      }

      const [x, y] = [getFoldDist(_x, foldX), getFoldDist(_y, foldY)];

      const serialized = serialize(x, y);
      if (seen.has(serialized)) continue;

      seen.add(serialized);
      newPoints.push([x, y]);
    }

    points = newPoints;
  }

  return { points, count: points.length };
}

function getFoldDist(current: number, fold: number): number {
  if (!fold) return current;
  return fold - (current - fold);
}

function serialize(x: number, y: number): string {
  return `${x}-${y}`;
}

function parseFile(path: string): { points: [number, number][]; folds: [number, number][] } {
  const lines = readFileSync(path, 'utf-8').split('\n');

  const divide = lines.indexOf('');
  const points = lines.slice(0, divide).map((x) => x.split(',').map((_x) => Number(_x))) as [
    number,
    number
  ][];
  const folds = lines.slice(divide + 1).map((x) => {
    const val = Number.parseInt(x.split('=')[1]);
    return x.includes('x=') ? [val, 0] : [0, val];
  }) as [number, number][];

  return { points, folds };
}

const exampleInput = parseFile('./src/day-13/example.txt');
const puzzleInput = parseFile('./src/day-13/puzzle.txt');

console.log(
  'Part 1 Example input: ',
  getPointsAfterFolding(exampleInput.points, [exampleInput.folds[0]]).count
);
console.log(
  'Part 1 Puzzle input: ',
  getPointsAfterFolding(puzzleInput.points, [puzzleInput.folds[0]]).count
);

console.log('Part 2 Example input:');
console.log(drawPoints(getPointsAfterFolding(exampleInput.points, exampleInput.folds).points));
console.log('Part 2 Puzzle input:');
console.log(drawPoints(getPointsAfterFolding(puzzleInput.points, puzzleInput.folds).points));
