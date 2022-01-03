import { readFileSync } from 'fs';
import { stdout } from 'process';

type Coordinates = [number, number, number];
type Scanner = Coordinates[];

// https://www.euclideanspace.com/maths/algebra/matrix/transforms/examples/index.htm
type Transformation = (coords: Coordinates) => Coordinates;

const rotationTransforms: Transformation[] = [
  ([x, y, z]: Coordinates): Coordinates => [x, y, z],
  ([x, y, z]: Coordinates): Coordinates => [x, -y, -z],
  ([x, y, z]: Coordinates): Coordinates => [x, z, -y],
  ([x, y, z]: Coordinates): Coordinates => [x, -z, y],
];

const directionTransforms: Transformation[] = [
  ([x, y, z]: Coordinates): Coordinates => [x, y, z],
  ([x, y, z]: Coordinates): Coordinates => [-x, -y, z],
  ([x, y, z]: Coordinates): Coordinates => [y, -x, z],
  ([x, y, z]: Coordinates): Coordinates => [-y, x, z],
  ([x, y, z]: Coordinates): Coordinates => [-z, y, x],
  ([x, y, z]: Coordinates): Coordinates => [-z, -y, -x],
];

const orientationTransforms: Transformation[] = [];
for (const directionTransform of directionTransforms) {
  for (const rotationTransform of rotationTransforms) {
    orientationTransforms.push(
      (coords: Coordinates): Coordinates => directionTransform(rotationTransform(coords))
    );
  }
}

function getLargestManhattanDistance(offsets: Coordinates[]): number {
  let largest = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < offsets.length; i++) {
    for (let j = 0; j < offsets.length && j !== i; j++) {
      const [a, b] = [offsets[i], offsets[j]];
      const distance = [0, 1, 2].reduce((acc, curr) => acc + Math.abs(b[curr] - a[curr]), 0);
      largest = Math.max(distance, largest);
    }
  }

  return largest;
}

function getNumUniqueBeacons(scanners: Scanner[]): number {
  const beacons = new Set<string>();

  for (const scanner of scanners) {
    for (const beacon of scanner) {
      beacons.add(serializeCoords(beacon));
    }
  }

  return beacons.size;
}

function normalizeAllScanners(scanners: Scanner[]): {
  scanners: Scanner[];
  offsets: Coordinates[];
} {
  const normalized = [scanners[0]];
  const offsets: Coordinates[] = [[0, 0, 0]];
  let remaining = scanners.slice(1);

  let normalizedStart = 0;
  while (remaining.length) {
    for (let i = normalizedStart; i < normalized.length; i++) {
      const normalizedScanner = normalized[i];
      const nextRemaining: Scanner[] = [];
      for (let j = 0; j < remaining.length; j++) {
        const remainingScanner = remaining[j];
        const overlappingResult = getOverlappingCoordinates(normalizedScanner, remainingScanner);
        if (!overlappingResult) {
          nextRemaining.push(remainingScanner);
          continue;
        }

        const { transformation, offset } = overlappingResult;
        normalized.push(transformScanner(remainingScanner, transformation, offset));
        offsets.push(offset);

        stdout.clearLine(0);
        stdout.cursorTo(0);
        stdout.write(`Processing scanners... ${scanners.length - normalized.length} remaining`);
      }
      remaining = nextRemaining;
    }
    normalizedStart++;
  }

  stdout.clearLine(0);
  stdout.cursorTo(0);

  return { scanners: normalized, offsets };
}

function getOverlappingCoordinates(
  a: Scanner,
  b: Scanner
): { transformation: Transformation; offset: Coordinates } | undefined {
  for (let i = 0; i < a.length - 12; i++) {
    const relativeCoords: Record<string, number> = {};

    for (let _i = 0; _i < a.length; _i++) {
      relativeCoords[serializeCoords(getOffset(a[_i], a[i]))] = _i;
    }

    for (const transformation of orientationTransforms) {
      const bOriented = b.map((x) => transformation(x));

      for (let j = 0; j < bOriented.length - 12; j++) {
        const matchingIndicies: [number, number][] = [];
        const matchedA = new Set<number>();

        for (let _j = 0; _j < bOriented.length; _j++) {
          const match = relativeCoords[serializeCoords(getOffset(bOriented[_j], bOriented[j]))];
          if (typeof match !== 'undefined' && !matchedA.has(match)) {
            matchingIndicies.push([match, _j]);
            matchedA.add(match);
          }
        }

        if (matchingIndicies.length >= 12) {
          const offset: Coordinates = [0, 0, 0];
          for (let k = 0; k < 3; k++) {
            offset[k] = a[matchingIndicies[0][0]][k] - bOriented[matchingIndicies[0][1]][k];
          }

          return { transformation, offset };
        }
      }
    }
  }

  return undefined;
}

function transformScanner(
  scanner: Scanner,
  transformation: Transformation,
  offset: Coordinates
): Scanner {
  return scanner.map((beacon) => {
    return transformation(beacon).map((x, i) => {
      return x + offset[i];
    }) as Coordinates;
  });
}

function getOffset(a: Coordinates, b: Coordinates): Coordinates {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
}

function serializeCoords(coords: Coordinates): string {
  return JSON.stringify(coords);
}

function parseFile(path: string): Scanner[] {
  const scanners: Scanner[] = [];
  const lines = readFileSync(path, 'utf-8').split('\n');

  let scanner: Coordinates[] = [];
  for (const line of lines) {
    if (line.includes('scanner')) continue;

    if (line === '') {
      scanners.push(scanner);
      scanner = [];
      continue;
    }

    scanner.push(line.split(',').map((x) => Number(x)) as Coordinates);
  }
  scanners.push(scanner);

  return scanners;
}

const exampleInput = parseFile('./src/day-19/example.txt');
const puzzleInput = parseFile('./src/day-19/puzzle.txt');

const { scanners: exampleScanners, offsets: exampleOffsets } = normalizeAllScanners(exampleInput);
console.log('Part 1 Example input: ', getNumUniqueBeacons(exampleScanners));
console.log('Part 2 Example input: ', getLargestManhattanDistance(exampleOffsets));

const { scanners: puzzleScanners, offsets: puzzleOffsets } = normalizeAllScanners(puzzleInput);
console.log('Part 1 Puzzle input: ', getNumUniqueBeacons(puzzleScanners));
console.log('Part 2 Puzzle input: ', getLargestManhattanDistance(puzzleOffsets));
