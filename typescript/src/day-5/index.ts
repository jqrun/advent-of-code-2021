import { readFileSync } from 'fs';

type Point = number[];
type Line = Point[];

function getNumOverlappingPoints(lines: Line[], onlyHorizontalVertical = false): number {
  const pointsMap: Record<string, number> = {};

  for (const line of lines) {
    const points = getSerializedPoints(line, onlyHorizontalVertical);
    for (const point of points) {
      pointsMap[point] ??= 0;
      pointsMap[point]++;
    }
  }

  return Object.values(pointsMap).filter((x) => x > 1).length;
}

function getSerializedPoints([[x1, y1], [x2, y2]]: Line, onlyHorizontalVertical = false): string[] {
  if (onlyHorizontalVertical && x1 !== x2 && y1 !== y2) return [];

  const xModifier = getModifier(x1, x2);
  const yModifier = getModifier(y1, y2);
  const points: string[] = [`${x1}-${y1}`];

  let [x, y] = [x1, y1];
  while (x !== x2 || y !== y2) {
    x += xModifier;
    y += yModifier;
    points.push(`${x}-${y}`);
  }

  return points;
}

function getModifier(a: number, b: number): number {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

function parseFile(path: string): Line[] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split(' -> ').map((x) => x.split(',').map((x) => Number(x))));
}

const exampleInput = parseFile('./src/day-5/example.txt');
const puzzleInput = parseFile('./src/day-5/puzzle.txt');

console.log('Part 1 Example input: ', getNumOverlappingPoints(exampleInput, true));
console.log('Part 1 Puzzle input: ', getNumOverlappingPoints(puzzleInput, true));

console.log('Part 2 Example input: ', getNumOverlappingPoints(exampleInput));
console.log('Part 2 Puzzle input: ', getNumOverlappingPoints(puzzleInput));
