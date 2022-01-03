import { readFileSync } from 'fs';

function someFunction(input: string[]): void {
  console.log(input);
}

function parseFile(path: string): string[] {
  return readFileSync(path, 'utf-8').split('\n');
}

const exampleInput = parseFile('./src/day-1/example.txt');
const puzzleInput = parseFile('./src/day-1/puzzle.txt');

console.log('Part 1 Example input: ', someFunction(exampleInput));
console.log('Part 1 Puzzle input: ', someFunction(puzzleInput));

// console.log('Part 2 Example input: ', someFunctionTwo(exampleInput));
// console.log('Part 2 Puzzle input: ', someFunctionTwo(puzzleInput));
