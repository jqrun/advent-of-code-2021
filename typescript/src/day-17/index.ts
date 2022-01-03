import { readFileSync } from 'fs';

type Trajectory = 'undershot' | 'overshot' | 'hit';

interface TargetArea {
  x: [number, number];
  y: [number, number];
}

const trajectoryCache: Record<string, Trajectory> = {};

function getNumDistinctInitialVelocities(target: TargetArea): number {
  let count = 0;

  for (let x = 1; x <= target.x[1]; x++) {
    for (let y = target.y[0]; y <= target.x[1]; y++) {
      switch (getTrajectory(x, y, target)) {
        case 'hit':
          count++;
          break;
        case 'overshot':
          y = Number.POSITIVE_INFINITY;
          break;
      }
    }
  }

  return count;
}

function getMaxYPos(target: TargetArea): number {
  let maxYVel = 0;
  for (let i = 0; i <= target.x[1]; i++) {
    if (canReachWithY(i, target)) {
      maxYVel = i;
    }
  }
  return getMaxHeightWithY(maxYVel);
}

function getMaxHeightWithY(y: number): number {
  return (y * (y + 1)) / 2;
}

function canReachWithY(y: number, target: TargetArea): boolean {
  let [left, mid, right] = [1, 1, target.x[1] + 1];

  while (left < right) {
    mid = Math.floor((left + right) / 2);
    switch (getTrajectory(mid, y, target)) {
      case 'hit':
        return true;
      case 'undershot':
        left = mid + 1;
        break;
      case 'overshot':
        right = mid;
        break;
    }
  }

  return false;
}

function getTrajectory(x: number, y: number, target: TargetArea): Trajectory {
  const serialized = `${x}-${y}-${JSON.stringify(target)}`;
  if (trajectoryCache[serialized]) return trajectoryCache[serialized];

  let [xPos, yPos] = [0, 0];
  while (xPos <= target.x[1] && yPos >= target.y[0]) {
    if (xPos >= target.x[0] && yPos <= target.y[1]) {
      trajectoryCache[serialized] = 'hit';
      return 'hit';
    }
    xPos += x;
    yPos += y;
    if (x !== 0) x += x > 0 ? -1 : 1;
    y -= 1;
  }

  const trajectory = xPos > target.x[1] ? 'overshot' : 'undershot';
  trajectoryCache[serialized] = trajectory;
  return trajectory;
}

function parseFile(path: string): TargetArea {
  const ranges = readFileSync(path, 'utf-8')
    .replace('target area: ', '')
    .split(', ')
    .map((x) => x.replace(/\w=/g, ''));

  return {
    x: ranges[0].split('..').map((x) => Number(x)) as [number, number],
    y: ranges[1].split('..').map((x) => Number(x)) as [number, number],
  };
}

const exampleInput = parseFile('./src/day-17/example.txt');
const puzzleInput = parseFile('./src/day-17/puzzle.txt');

console.log('Part 1 Example input: ', getMaxYPos(exampleInput));
console.log('Part 1 Puzzle input: ', getMaxYPos(puzzleInput));

console.log('Part 2 Example input: ', getNumDistinctInitialVelocities(exampleInput));
console.log('Part 2 Puzzle input: ', getNumDistinctInitialVelocities(puzzleInput));
