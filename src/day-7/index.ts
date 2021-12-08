import { readFileSync } from 'fs';

function getBestConstantCostPosition(crabs: number[]): { position: number; total: number } {
  const sortedCrabs = crabs.slice(0);
  sortedCrabs.sort((a, b) => a - b);

  const [mid1, mid2] = [
    sortedCrabs[Math.floor((sortedCrabs.length - 1) / 2)],
    sortedCrabs[Math.floor(sortedCrabs.length / 2)],
  ];

  const position = Math.floor((mid1 + mid2) / 2);
  const total = sortedCrabs.reduce((acc, curr) => acc + Math.abs(curr - position), 0);

  return { position, total };
}

function getBestIncreasingCostPosition(crabs: number[]): { position: number; total: number } {
  let [min, max] = [crabs[0], crabs[0]];
  for (const crab of crabs) {
    min = Math.min(min, crab);
    max = Math.max(max, crab);
  }

  let bestCost = Number.MAX_SAFE_INTEGER;
  let bestPosition = min;
  for (let i = min; i <= max; i++) {
    const totalCost = getTotalCost(crabs, i);
    if (bestCost < totalCost) break;

    if (totalCost < bestCost) {
      bestCost = totalCost;
      bestPosition = i;
    }
  }

  return { position: bestPosition, total: bestCost };
}

function getTotalCost(crabs: number[], position: number): number {
  return crabs.reduce((acc, curr) => acc + getAdjustedCost(Math.abs(curr - position)), 0);
}

function getAdjustedCost(steps: number): number {
  return (steps * (steps + 1)) / 2;
}

function parseFile(path: string): number[] {
  return readFileSync(path, 'utf-8')
    .split(',')
    .map((x) => Number(x));
}

const exampleInput = parseFile('./src/day-7/example.txt');
const puzzleInput = parseFile('./src/day-7/puzzle.txt');

console.log('Part 1 Example input: ', getBestConstantCostPosition(exampleInput));
console.log('Part 1 Puzzle input: ', getBestConstantCostPosition(puzzleInput));

console.log('Part 2 Example input: ', getBestIncreasingCostPosition(exampleInput));
console.log('Part 2 Puzzle input: ', getBestIncreasingCostPosition(puzzleInput));
