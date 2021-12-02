import { readFileSync } from 'fs';

type Horizontal = number;
type Depth = number;
type Aim = number;

const directionMap: Record<string, [Horizontal, Depth, Aim]> = {
  forward: [1, 0, 0],
  up: [0, -1, -1],
  down: [0, 1, 1],
};

function getPosition(moves: string[]): { horizontal: number; depth: number; multiplied: number } {
  let horizontal = 0;
  let depth = 0;

  moves.forEach((move) => {
    const [direction, multiplierStr] = move.split(' ');
    const multiplier = Number(multiplierStr);
    if (!Object.keys(directionMap).includes(direction)) return;
    horizontal += directionMap[direction][0] * multiplier;
    depth += directionMap[direction][1] * multiplier;
  });

  return { horizontal, depth, multiplied: horizontal * depth };
}

function getPositionWithAim(moves: string[]): {
  horizontal: number;
  depth: number;
  multiplied: number;
} {
  let horizontal = 0;
  let depth = 0;
  let aim = 0;

  moves.forEach((move) => {
    const [direction, multiplierStr] = move.split(' ');
    const multiplier = Number(multiplierStr);
    if (!Object.keys(directionMap).includes(direction)) return;
    horizontal += directionMap[direction][0] * multiplier;
    aim += directionMap[direction][2] * multiplier;

    if (direction === 'forward') {
      depth += aim * multiplier;
    }
  });

  return { horizontal, depth, multiplied: horizontal * depth };
}

function parseFile(path: string): string[] {
  return readFileSync(path, 'utf-8').split('\n');
}

const exampleInput = parseFile('./src/day-2/example.txt');
const puzzleInput = parseFile('./src/day-2/puzzle.txt');

console.log('Part 1 Example input: ', getPosition(exampleInput));
console.log('Part 1 Puzzle input: ', getPosition(puzzleInput));

console.log('Part 2 Example input: ', getPositionWithAim(exampleInput));
console.log('Part 2 Puzzle input: ', getPositionWithAim(puzzleInput));
