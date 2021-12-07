import { readFileSync } from 'fs';

const getNumFish = ((): ((timerStart: number, days: number) => number) => {
  const memo: Record<string, number> = {};

  return (timerStart: number, days: number): number => {
    const serializedKey = `${timerStart}-${days}`;
    if (serializedKey in memo) return memo[serializedKey];

    let numFish = 1;
    if (!days) {
      numFish = 1;
    } else if (!timerStart) {
      numFish = getNumFish(6, days - 1) + getNumFish(8, days - 1);
    } else {
      numFish = getNumFish(timerStart - 1, days - 1);
    }
    memo[serializedKey] = numFish;
    return numFish;
  };
})();

function getTotalFish(timers: number[], days: number): number {
  return timers.map((timer) => getNumFish(timer, days)).reduce((acc, curr) => acc + curr, 0);
}

function parseFile(path: string): number[] {
  return readFileSync(path, 'utf-8')
    .split(',')
    .map((x) => Number(x));
}

const exampleInput = parseFile('./src/day-6/example.txt');
const puzzleInput = parseFile('./src/day-6/puzzle.txt');

console.log('Part 1 Example input: ', getTotalFish(exampleInput, 80));
console.log('Part 1 Puzzle input: ', getTotalFish(puzzleInput, 80));

console.log('Part 2 Example input: ', getTotalFish(exampleInput, 256));
console.log('Part 2 Puzzle input: ', getTotalFish(puzzleInput, 256));
