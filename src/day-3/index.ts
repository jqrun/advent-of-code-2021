import { readFileSync } from 'fs';

function getPowerConsumption(report: number[][]): {
  gamma: number;
  epsilon: number;
  power: number;
} {
  const squashed = [...Array(report[0].length)].map(() => 0);
  for (let i = 0; i < report.length; i++) {
    for (let j = 0; j < report[0].length; j++) {
      squashed[j] += report[i][j];
    }
  }

  const gammaBinary = squashed.map((x) => (x * 2 > report.length ? '1' : '0')).join('');
  const epsilonBinary = squashed.map((x) => (x * 2 <= report.length ? '1' : '0')).join('');
  const [gamma, epsilon] = [gammaBinary, epsilonBinary].map((x) => parseInt(x, 2));
  return { gamma, epsilon, power: gamma * epsilon };
}

function getLifeSupportRating(report: number[][]): {
  oxygen: number;
  co2: number;
  lifeSupport: number;
} {
  const oxygenNumbers = reduceByCommonality(report, true);
  const co2Numbers = reduceByCommonality(report, false);
  const [oxygen, co2] = [oxygenNumbers, co2Numbers].map((x) => parseInt(x.join(''), 2));
  return { oxygen, co2, lifeSupport: oxygen * co2 };
}

function reduceByCommonality(report: number[][], mostCommon = true): number[] {
  let numbers = report.slice(0);

  let i = 0;
  while (numbers.length > 1) {
    const squashed = numbers.reduce((acc, number) => acc + number[i], 0);
    const common = squashed * 2 >= numbers.length ? 1 : 0;
    numbers = numbers.filter((x) => (mostCommon ? x[i] === common : x[i] !== common));
    i++;
  }

  return numbers[0];
}

function parseFile(path: string): number[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split('').map((x) => Number(x)));
}

const exampleInput = parseFile('./src/day-3/example.txt');
const puzzleInput = parseFile('./src/day-3/puzzle.txt');

console.log('Part 1 Example input: ', getPowerConsumption(exampleInput));
console.log('Part 1 Puzzle input: ', getPowerConsumption(puzzleInput));

console.log('Part 2 Example input: ', getLifeSupportRating(exampleInput));
console.log('Part 2 Puzzle input: ', getLifeSupportRating(puzzleInput));
