import { readFileSync } from 'fs';

function getNumIncreases(measurements: number[]) {
  if (measurements.length < 2) return 0;

  let increases = 0;
  let prev = measurements[0];

  measurements.forEach((measurement) => {
    if (measurement > prev) increases++;
    prev = measurement;
  });

  return increases;
}

function getNumSlidingWindowIncreases(measurements: number[]) {
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

const exampleInput = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263];
console.log('Part 1 Example input: ', getNumIncreases(exampleInput));

const puzzleInput = readFileSync('./src/day-1-sonar-sweep-input.txt', 'utf-8')
  .split(/\s/)
  .map(Number);
console.log('Part 1 Puzzle input: ', getNumIncreases(puzzleInput));

console.log('Part 2 Example input: ', getNumSlidingWindowIncreases(exampleInput));
console.log('Part 2 Puzzle input: ', getNumSlidingWindowIncreases(puzzleInput));
