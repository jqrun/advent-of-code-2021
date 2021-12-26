import { readFileSync } from 'fs';

type NestedArray<T> = (T | NestedArray<T>)[];

function getLargestTwoSum(pairsList: string[]): number {
  let largest = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < pairsList.length; i++) {
    for (let j = 0; j < pairsList.length && j !== i; j++) {
      const current = Math.max(
        getMagnitudeOfSum([pairsList[i], pairsList[j]]),
        getMagnitudeOfSum([pairsList[j], pairsList[i]])
      );
      largest = Math.max(largest, current);
    }
  }

  return largest;
}

function getMagnitudeOfSum(pairsList: string[]): number {
  let current = pairsList[0];
  for (let i = 1; i < pairsList.length; i++) {
    current = addPairs(current, pairsList[i]);
    current = reducePairs(current);
  }

  return getMagnitude(current);
}

function getMagnitude(pairs: string): number {
  const pairsList = JSON.parse(pairs) as NestedArray<number>;

  const recurseMagnitude = ([left, right]: NestedArray<number>): number => {
    if (typeof left !== 'number') {
      left = recurseMagnitude(left);
    }

    if (typeof right !== 'number') {
      right = recurseMagnitude(right);
    }

    return 3 * left + 2 * right;
  };

  return recurseMagnitude(pairsList);
}

function addPairs(a: string, b: string): string {
  return `[${a},${b}]`;
}

function reducePairs(pairs: string): string {
  let level = 0;
  for (let i = 0; i < pairs.length; i++) {
    const token = pairs[i];
    if (token === '[') level++;
    else if (token === ']') level--;
    if (level > 4) return reducePairs(explodeAt(pairs, i));
  }

  for (let i = 0; i < pairs.length; i++) {
    if (i > 0 && isStrNumber(pairs[i]) && isStrNumber(pairs[i - 1])) {
      return reducePairs(splitAt(pairs, i - 1));
    }
  }

  return pairs;
}

function splitAt(pairs: string, i: number): string {
  let splitNumStr = '';
  for (let j = i; j < pairs.length; j++) {
    const token = pairs[j];
    const isNumber = isStrNumber(token);
    if (splitNumStr.length && !isNumber) break;
    if (isNumber) splitNumStr += token;
  }

  const splitNum = Number(splitNumStr);
  const splitPair = `[${Math.floor(splitNum / 2)},${Math.ceil(splitNum / 2)}]`;
  const left = pairs.slice(0, i);
  const right = pairs.slice(i + splitNumStr.length);

  return left + splitPair + right;
}

function explodeAt(pairs: string, i: number): string {
  const end = i + pairs.slice(i).indexOf(']') + 1;
  const pair = JSON.parse(pairs.slice(i, end));

  let left = pairs.slice(0, i);
  let right = pairs.slice(end);

  let leftNumStr = '';
  let leftNumIndex = -1;
  for (let j = left.length - 1; j--; j >= 0) {
    const token = left[j];
    const isNumber = isStrNumber(token);
    if (leftNumStr.length && !isNumber) break;
    if (isNumber) {
      leftNumStr = token + leftNumStr;
      leftNumIndex = j;
    }
  }

  let rightNumStr = '';
  let rightNumIndex = -1;
  for (let j = 0; j < right.length; j++) {
    const token = right[j];
    const isNumber = isStrNumber(token);
    if (rightNumStr.length && !isNumber) break;
    if (isNumber) {
      rightNumStr += token;
      if (rightNumIndex < 0) rightNumIndex = j;
    }
  }

  if (leftNumStr) {
    const newLeftNum = Number(leftNumStr) + pair[0];
    left = left.slice(0, leftNumIndex) + newLeftNum + left.slice(leftNumIndex + leftNumStr.length);
  }

  if (rightNumStr) {
    const newRightNum = Number(rightNumStr) + pair[1];
    right =
      right.slice(0, rightNumIndex) + newRightNum + right.slice(rightNumIndex + rightNumStr.length);
  }

  return left + '0' + right;
}

function isStrNumber(str: string): boolean {
  return !Number.isNaN(Number.parseInt(str));
}

function parseFile(path: string): string[] {
  return readFileSync(path, 'utf-8').split('\n');
}

const exampleInput = parseFile('./src/day-18/example.txt');
const puzzleInput = parseFile('./src/day-18/puzzle.txt');

console.log('Part 1 Example input: ', getMagnitudeOfSum(exampleInput));
console.log('Part 1 Puzzle input: ', getMagnitudeOfSum(puzzleInput));

console.log('Part 2 Example input: ', getLargestTwoSum(exampleInput));
console.log('Part 2 Puzzle input: ', getLargestTwoSum(puzzleInput));
