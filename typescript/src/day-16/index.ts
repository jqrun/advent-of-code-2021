import { readFileSync } from 'fs';

const Types = {
  SUM: 0,
  PRODUCT: 1,
  MIN: 2,
  MAX: 3,
  LITERAL: 4,
  GREATER_THAN: 5,
  LESS_THAN: 6,
  EQUAL: 7,
} as const;

interface Packet {
  version: number;
  type: number;
  subpackets: Packet[];
  literal?: number;
}

function getVersionSum(hexStr: string): number {
  const binaryStr = hexToBinary(hexStr);
  const { packet } = parsePacket(binaryStr);
  let sum = 0;

  const recurseSum = (p: Packet): void => {
    sum += p.version;
    for (const subpacket of p.subpackets) recurseSum(subpacket);
  };
  recurseSum(packet);

  return sum;
}

function evaluatePacket(hexStr: string): number {
  const binaryStr = hexToBinary(hexStr);
  const { packet } = parsePacket(binaryStr);

  const recurseEvaluation = ({ type, literal, subpackets }: Packet): number => {
    if (type === Types.LITERAL) {
      return literal as number;
    }

    const subValues = subpackets.map((subpacket) => recurseEvaluation(subpacket));
    switch (type) {
      case Types.SUM:
        return subValues.reduce((acc, curr) => acc + curr, 0);
      case Types.PRODUCT:
        return subValues.reduce((acc, curr) => acc * curr, 1);
      case Types.MIN:
        return Math.min(...subValues);
      case Types.MAX:
        return Math.max(...subValues);
      case Types.GREATER_THAN:
        return subValues[0] > subValues[1] ? 1 : 0;
      case Types.LESS_THAN:
        return subValues[0] < subValues[1] ? 1 : 0;
      case Types.EQUAL:
        return subValues[0] === subValues[1] ? 1 : 0;
    }

    return 0;
  };
  return recurseEvaluation(packet);
}

function parsePacket(packetStr: string): { packet: Packet; next: number } {
  const version = parseInt(packetStr.slice(0, 3), 2);
  const type = parseInt(packetStr.slice(3, 6), 2);
  const root: Packet = { version, type, subpackets: [] };
  let i = 6;

  if (type === Types.LITERAL) {
    let literal = '';

    while (i + 5 <= packetStr.length) {
      literal += packetStr.slice(i + 1, i + 5);
      i += 5;
      if (packetStr[i - 5] === '0') break;
    }

    root.literal = parseInt(literal, 2);
  } else {
    if (packetStr[6] === '0') {
      const subpacketsLength = parseInt(packetStr.slice(7, 22), 2);

      i = 22 + subpacketsLength;
      const subpacketsStr = packetStr.slice(22, i);

      let start = 0;
      while (start < subpacketsLength - 1) {
        const { packet: subpacket, next } = parsePacket(subpacketsStr.slice(start));
        root.subpackets.push(subpacket);
        start += next;
      }
    } else {
      let numSubpackets = parseInt(packetStr.slice(7, 18), 2);
      const subpacketsStr = packetStr.slice(18);
      let start = 0;
      while (numSubpackets--) {
        const { packet: subpacket, next } = parsePacket(subpacketsStr.slice(start));
        root.subpackets.push(subpacket);
        start += next;
      }
      i = 18 + start;
    }
  }

  return { packet: root, next: i };
}

function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map((x) => parseInt(x, 16).toString(2).padStart(4, '0'))
    .join('');
}

function parseFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

const exampleInput = parseFile('./src/day-16/example.txt');
const puzzleInput = parseFile('./src/day-16/puzzle.txt');

console.log('Part 1 Example input: ', getVersionSum(exampleInput));
console.log('Part 1 Puzzle input: ', getVersionSum(puzzleInput));

console.log('Part 2 Example input: ', evaluatePacket(exampleInput));
console.log('Part 2 Puzzle input: ', evaluatePacket(puzzleInput));
