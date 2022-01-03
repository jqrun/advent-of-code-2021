import { readFileSync } from 'fs';

type Cuboid = number[][];

interface Step {
  value: number;
  cuboid: Cuboid;
}

function getNumInitializationCubes(steps: Step[]): number {
  const initializationSteps = steps.filter(
    ({ cuboid }) => !cuboid.some(([start, end]) => Math.abs(start) > 50 || Math.abs(end) > 50)
  );
  return getNumCubesAfterSteps(initializationSteps);
}

function getNumCubesAfterSteps(steps: Step[]): number {
  let onCuboids: Cuboid[] = [];

  for (const { value, cuboid } of steps) {
    const nextOnCuboids: Cuboid[] = [];
    for (const _cuboid of onCuboids) {
      if (!areIntersecting(_cuboid, cuboid)) {
        nextOnCuboids.push(_cuboid);
        continue;
      }

      const intersectingCuboid = getIntersectingCuboid(_cuboid, cuboid);
      const splits = subtractCuboid(_cuboid, intersectingCuboid);
      nextOnCuboids.push(...splits);
    }

    if (value) nextOnCuboids.push(cuboid);
    onCuboids = nextOnCuboids;
  }

  return onCuboids.map((x) => getNumCubesInCuboid(x)).reduce((acc, curr) => acc + curr, 0);
}

function getNumCubesInCuboid(cuboid: Cuboid): number {
  let numCubes = 1;
  for (const [start, end] of cuboid) {
    numCubes *= Math.abs(end - start) + 1;
  }
  return numCubes;
}

function areIntersecting(a: Cuboid, b: Cuboid): boolean {
  return [0, 1, 2].every((i) => {
    return !(b[i][0] > a[i][1] || b[i][1] < a[i][0]);
  });
}

function getIntersectingCuboid(a: Cuboid, b: Cuboid): Cuboid {
  const cuboid = [
    [0, 0],
    [0, 0],
    [0, 0],
  ];

  for (let i = 0; i < 3; i++) {
    cuboid[i][0] = Math.max(a[i][0], b[i][0]);
    cuboid[i][1] = Math.min(a[i][1], b[i][1]);
  }

  return cuboid;
}

function subtractCuboid(a: Cuboid, b: Cuboid): Cuboid[] {
  const cuboids: Cuboid[] = [];

  const [aStartX, aEndX, aStartY, aEndY, aStartZ, aEndZ] = a.flat();
  const [bStartX, bEndX, bStartY, bEndY, bStartZ, bEndZ] = b.flat();

  const xStartSegment = bStartX > aStartX ? [aStartX, bStartX - 1] : null;
  const xEndSegment = aEndX > bEndX ? [bEndX + 1, aEndX] : null;
  const yStartSegment = bStartY > aStartY ? [aStartY, bStartY - 1] : null;
  const yEndSegment = aEndY > bEndY ? [bEndY + 1, aEndY] : null;
  const zStartSegment = bStartZ > aStartZ ? [aStartZ, bStartZ - 1] : null;
  const zEndSegment = aEndZ > bEndZ ? [bEndZ + 1, aEndZ] : null;

  const xRange = [xStartSegment ? bStartX : aStartX, xEndSegment ? bEndX : aEndX];
  const yRange = [yStartSegment ? bStartY : aStartY, yEndSegment ? bEndY : aEndY];

  if (xStartSegment) cuboids.push([xStartSegment, a[1], a[2]]);
  if (xEndSegment) cuboids.push([xEndSegment, a[1], a[2]]);
  if (yStartSegment) cuboids.push([xRange, yStartSegment, a[2]]);
  if (yEndSegment) cuboids.push([xRange, yEndSegment, a[2]]);
  if (zStartSegment) cuboids.push([xRange, yRange, zStartSegment]);
  if (zEndSegment) cuboids.push([xRange, yRange, zEndSegment]);

  return cuboids;
}

function parseFile(path: string): Step[] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => {
      return {
        value: x.startsWith('on') ? 1 : 0,
        cuboid: x
          .replace('on x=', '')
          .replace('off x=', '')
          .replace('y=', '')
          .replace('z=', '')
          .split(',')
          .map((x) => x.split('..').map((x) => Number(x))),
      };
    });
}

const exampleInput = parseFile('./src/day-22/example.txt');
const puzzleInput = parseFile('./src/day-22/puzzle.txt');

console.log('Part 1 Example input: ', getNumInitializationCubes(exampleInput));
console.log('Part 1 Puzzle input: ', getNumInitializationCubes(puzzleInput));

console.log('Part 2 Example input: ', getNumCubesAfterSteps(exampleInput));
console.log('Part 2 Puzzle input: ', getNumCubesAfterSteps(puzzleInput));
