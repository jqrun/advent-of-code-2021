import { readFileSync } from 'fs';

const digits = [
  new Set(['a', 'b', 'c', 'e', 'f', 'g']), // 0
  new Set(['c', 'f']), // 1
  new Set(['a', 'c', 'd', 'e', 'g']), // 2
  new Set(['a', 'c', 'd', 'f', 'g']), // 3
  new Set(['b', 'c', 'd', 'f']), // 4
  new Set(['a', 'b', 'd', 'f', 'g']), // 5
  new Set(['a', 'b', 'd', 'e', 'f', 'g']), // 6
  new Set(['a', 'c', 'f']), // 7
  new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g']), // 8
  new Set(['a', 'b', 'c', 'd', 'f', 'g']), // 9
];

function getNumUniqueOutputDigits(observations: string[][][]): number {
  const uniqueLenghts = [1, 4, 7, 8].map((x) => digits[x].size);
  let numUniques = 0;

  for (const [, outputs] of observations) {
    for (const output of outputs) {
      if (uniqueLenghts.includes(output.length)) numUniques++;
    }
  }

  return numUniques;
}

function solveOutputs(observations: string[][][]): { digits: number[]; sum: number } {
  const digits: number[] = [];

  for (const [signals, outputs] of observations) {
    const map = buildMap(signals);
    const digit = Number.parseInt(outputs.map((x) => map[x.split('').sort().join('')]).join(''));
    digits.push(digit);
  }

  return { digits, sum: digits.reduce((acc, curr) => acc + curr, 0) };
}

function buildMap(signals: string[]): Record<string, string> {
  const map = [...Array(10)].map(() => '');

  let lengthFives = signals.filter((x) => x.length === 5);
  let lengthSixes = signals.filter((x) => x.length === 6);

  map[1] = signals.find((x) => x.length === 2) as string;
  map[7] = signals.find((x) => x.length === 3) as string;
  map[4] = signals.find((x) => x.length === 4) as string;
  map[8] = signals.find((x) => x.length === 7) as string;
  map[3] = lengthFives.find((x) => includes(x, map[7])) as string;
  lengthFives = lengthFives.filter((x) => !includes(x, map[3]));
  map[9] = lengthSixes.find((x) => includes(x, map[3])) as string;
  lengthSixes = lengthSixes.filter((x) => !includes(x, map[9]));
  map[0] = lengthSixes.find((x) => includes(x, map[7])) as string;
  lengthSixes = lengthSixes.filter((x) => !includes(x, map[0]));
  map[6] = lengthSixes[0] as string;
  map[5] = lengthFives.find((x) => includes(map[9], x)) as string;
  lengthFives = lengthFives.filter((x) => !includes(x, map[5]));
  map[2] = lengthFives[0] as string;

  return Object.fromEntries(map.map((x, i) => [x.split('').sort().join(''), String(i)]));
}

function includes(a: string, b: string): boolean {
  return b.split('').every((x) => a.includes(x));
}

function parseFile(path: string): string[][][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split(' | ').map((x) => x.split(' ').map((x) => x.trim())));
}

const exampleInput = parseFile('./src/day-8/example.txt');
const puzzleInput = parseFile('./src/day-8/puzzle.txt');

console.log('Part 1 Example input: ', getNumUniqueOutputDigits(exampleInput));
console.log('Part 1 Puzzle input: ', getNumUniqueOutputDigits(puzzleInput));

console.log('Part 2 Example input: ', solveOutputs(exampleInput));
console.log('Part 2 Puzzle input: ', solveOutputs(puzzleInput));
