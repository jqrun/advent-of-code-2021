import { readFileSync } from 'fs';
import { stdout } from 'process';

interface State {
  hallway: string[];
  rooms: string[][];
}

interface Branch extends State {
  cost: number;
}

const winningRooms = serializeRooms([
  ['A', 'A'],
  ['B', 'B'],
  ['C', 'C'],
  ['D', 'D'],
]);

const winningRoomsFolded = serializeRooms([
  ['A', 'A', 'A', 'A'],
  ['B', 'B', 'B', 'B'],
  ['C', 'C', 'C', 'C'],
  ['D', 'D', 'D', 'D'],
]);

const amphipodCosts: Record<string, number> = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

const amphipodDestinations: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

function getMinCostOrganizeFolded(state: State): number {
  state = cloneState(state);
  state.rooms[0].splice(1, 0, 'D', 'D');
  state.rooms[1].splice(1, 0, 'B', 'C');
  state.rooms[2].splice(1, 0, 'A', 'B');
  state.rooms[3].splice(1, 0, 'C', 'A');

  return getMinCostOrganize(state, winningRoomsFolded, 4);
}

function getMinCostOrganize(state: State, winningState = winningRooms, roomSize = 2): number {
  const visitedBranches: Record<string, number> = {};
  let minCost = Number.POSITIVE_INFINITY;
  let branches: Branch[] = [{ ...state, cost: 0 }];

  while (branches.length) {
    const newBranches: Branch[] = [];
    for (const { hallway, rooms, cost } of branches) {
      const serializedState = serializeState({ hallway, rooms });
      if (visitedBranches && visitedBranches[serializedState] <= cost) continue;

      const serializedRooms = serializeRooms(rooms);
      if (serializedRooms === winningState) {
        minCost = Math.min(minCost, cost);
        continue;
      }

      if (cost >= minCost) continue;

      visitedBranches[serializedState] = cost;

      for (let i = 0; i < hallway.length; i++) {
        const amphipod = hallway[i];
        if (!amphipod) continue;

        if (i === 0 && hallway[1]) continue;
        if (i === 6 && hallway[5]) continue;

        const extraHallwaySteps = i === 0 || i === 6 ? 1 : 0;
        const hallwayNum = Math.min(5, Math.max(1, i));

        const targetRoom = amphipodDestinations[amphipod];
        if (rooms[targetRoom].length && !rooms[targetRoom].every((x) => x === amphipod)) continue;

        const extraRoomSteps = roomSize - 1 - rooms[targetRoom].length;
        const targetLeft = targetRoom + 1;
        const targetRight = targetLeft + 1;

        const enterFromLeft =
          hallwayNum <= targetLeft &&
          hallway.slice(hallwayNum + 1, targetLeft + 1).every((x) => !x);
        const enterFromRight =
          hallwayNum >= targetRight && hallway.slice(targetRight, hallwayNum).every((x) => !x);

        if (enterFromLeft || enterFromRight) {
          const newState = cloneState({ hallway, rooms });
          const room = newState.rooms[targetRoom];
          room.push(amphipod);
          newState.hallway[i] = '';

          const hallwaySteps = enterFromLeft
            ? (targetLeft + 1 - hallwayNum) * 2
            : (hallwayNum + 1 - targetRight) * 2;
          const newCost =
            amphipodCosts[amphipod] * (extraRoomSteps + hallwaySteps + extraHallwaySteps);

          newBranches.push({ ...newState, cost: cost + newCost });
        }
      }

      for (let i = 0; i < rooms.length; i++) {
        if (!rooms[i].length) continue;

        const extraRoomSteps = roomSize - rooms[i].length;

        for (let j = i + 2; j < hallway.length; j++) {
          if (hallway[j]) break;

          const newState = cloneState({ hallway, rooms });
          const room = newState.rooms[i];
          const amphipod = room.pop()!;
          newState.hallway[j] = amphipod;

          let hallwaySteps = (j - (i + 1)) * 2;
          if (j === 6) hallwaySteps--;
          const newCost = amphipodCosts[amphipod] * (extraRoomSteps + hallwaySteps);

          newBranches.push({ ...newState, cost: cost + newCost });
        }

        for (let j = i + 1; j >= 0; j--) {
          if (hallway[j]) break;

          const newState = cloneState({ hallway, rooms });
          const room = newState.rooms[i];
          const amphipod = room.pop()!;
          newState.hallway[j] = amphipod;

          let hallwaySteps = (i + 2 - j) * 2;
          if (j === 0) hallwaySteps--;
          const newCost = amphipodCosts[amphipod] * (extraRoomSteps + hallwaySteps);

          newBranches.push({ ...newState, cost: cost + newCost });
        }
      }
    }
    branches = newBranches;

    stdout.clearLine(0);
    stdout.cursorTo(0);
    stdout.write(`Processing branches... ${branches.length} remaining`);
  }

  stdout.clearLine(0);
  stdout.cursorTo(0);

  return minCost;
}

function serializeRooms(rooms: string[][]): string {
  return JSON.stringify(rooms);
}

function serializeState(state: State): string {
  return JSON.stringify(state);
}

function cloneState(state: State): State {
  return JSON.parse(JSON.stringify(state));
}

function parseFile(path: string): State {
  const lines = readFileSync(path, 'utf-8').split('\n');
  const hallway = [...Array(7)].map(() => '');
  const rooms: string[][] = [[], [], [], []];

  lines[3]
    .trim()
    .split('#')
    .filter((x) => Boolean(x))
    .forEach((amphipod, i) => rooms[i].push(amphipod));
  lines[2]
    .trim()
    .split('#')
    .filter((x) => Boolean(x))
    .forEach((amphipod, i) => rooms[i].push(amphipod.replace(/#/g, '')));

  return { hallway, rooms };
}

const exampleInput = parseFile('./src/day-23/example.txt');
const puzzleInput = parseFile('./src/day-23/puzzle.txt');

console.log('Part 1 Example input: ', getMinCostOrganize(exampleInput));
console.log('Part 1 Puzzle input: ', getMinCostOrganize(puzzleInput));

console.log('Part 2 Example input: ', getMinCostOrganizeFolded(exampleInput));
console.log('Part 2 Puzzle input: ', getMinCostOrganizeFolded(puzzleInput));
