import { readFileSync } from 'fs';

const illegalPoints: Record<string, number> = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

const fixPoints: Record<string, number> = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

const tokens: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};

const openingTokens = new Set(Object.keys(tokens));

function getCorruptionsAndFixes(lines: string[][]): {
  illegalChars: string[];
  fixes: string[];
  fixScores: number[];
  corruptionScore: number;
  fixWinner: number;
} {
  const illegalChars: string[] = [];
  const fixes: string[][] = [];

  for (const line of lines) {
    let stack: string[] = [];
    for (const token of line) {
      if (openingTokens.has(token)) {
        stack.push(token);
        continue;
      }

      if (tokens[stack[stack.length - 1]] === token) {
        stack.pop();
        continue;
      }

      illegalChars.push(token);
      stack = [];
      break;
    }

    if (stack.length) {
      const fix = stack.reverse().map((x) => tokens[x]);
      fixes.push(fix);
    }
  }

  const fixScores = fixes.map((x) => x.reduce((acc, curr) => 5 * acc + fixPoints[curr], 0));
  fixScores.sort((a, b) => a - b);

  return {
    illegalChars,
    fixes: fixes.map((x) => x.join('')),
    fixScores,
    corruptionScore: illegalChars.reduce((acc, curr) => acc + illegalPoints[curr], 0),
    fixWinner: fixScores[Math.floor(fixScores.length / 2)],
  };
}

function parseFile(path: string): string[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split(''));
}

const exampleInput = parseFile('./src/day-10/example.txt');
const puzzleInput = parseFile('./src/day-10/puzzle.txt');

console.log('Part 1 & 2 Example input: ', getCorruptionsAndFixes(exampleInput));
console.log('Part 1 & 2 Puzzle input: ', getCorruptionsAndFixes(puzzleInput));
