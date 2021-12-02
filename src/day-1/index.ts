import { readFileSync } from 'fs';

function getNumIncreases(measurements: number[]): number {
  if (measurements.length < 2) return 0;

  let increases = 0;
  let prev = measurements[0];

  measurements.forEach((measurement) => {
    if (measurement > prev) increases++;
    prev = measurement;
  });

  return increases;
}

function getNumSlidingWindowIncreases(measurements: number[]): number {
  if (measurements.length < 4) return 0;

  let increases = 0;
  let prev = measurements.slice(0, 3).reduce((acc, prev) => acc + prev, 0);

  for (let i = 3; i < measurements.length; i++) {
    const current = prev - measurements[i - 3] + measurements[i];
    if (current > prev) increases++;
    prev = current;
  }

  return increases;
}

function parseFile(path: string): number[] {
  return readFileSync(path, 'utf-8').split(/\s/).map(Number);
}

const exampleInput = parseFile('./src/day-1/example.txt');
const puzzleInput = parseFile('./src/day-1/puzzle.txt');

console.log('Part 1 Example input: ', getNumIncreases(exampleInput));
console.log('Part 1 Puzzle input: ', getNumIncreases(puzzleInput));

console.log('Part 2 Example input: ', getNumSlidingWindowIncreases(exampleInput));
console.log('Part 2 Puzzle input: ', getNumSlidingWindowIncreases(puzzleInput));
