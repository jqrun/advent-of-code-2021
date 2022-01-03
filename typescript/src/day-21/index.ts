import { readFileSync } from 'fs';

const diracCache: Record<string, [number, number]> = {};

function rollDiracDice(
  positions: [number, number],
  scores: [number, number] = [0, 0],
  roll = 0
): [number, number] {
  const serialized = JSON.stringify({ positions, scores, roll });
  if (diracCache[serialized]) return diracCache[serialized];

  const winningOutcomes: [number, number] = [0, 0];
  const winner = scores.findIndex((x) => x >= 21);
  if (winner > -1) {
    diracCache[serialized] = winningOutcomes;
    winningOutcomes[winner] = 1;
    return winningOutcomes;
  }

  const player = roll < 3 ? 0 : 1;
  for (let i = 1; i <= 3; i++) {
    const newPosisitions = positions.slice(0) as [number, number];
    const newScores = scores.slice(0) as [number, number];
    newPosisitions[player] = (newPosisitions[player] + i) % 10 || 10;
    if (roll === 2 || roll === 5) {
      newScores[player] += newPosisitions[player];
    }
    const outcome = rollDiracDice(newPosisitions, newScores, (roll + 1) % 6);
    winningOutcomes[0] += outcome[0];
    winningOutcomes[1] += outcome[1];
  }

  diracCache[serialized] = winningOutcomes;
  return winningOutcomes;
}

function rollDeterministic100UntilWin(startingPositions: [number, number]): number {
  const positions = startingPositions.slice(0);
  const scores = [0, 0];
  let dice = 1;
  let rolls = 0;
  let player = 0;

  while (scores.every((x) => x < 1000)) {
    const moves = dice + (dice + 1) + (dice + 2);
    positions[player] = (positions[player] + moves) % 10 || 10;
    scores[player] += positions[player];

    dice = (dice + 3) % 100 || 100;
    rolls += 3;
    player = (player + 1) % 2;
  }

  return rolls * Math.min(...scores);
}

function parseFile(path: string): [number, number] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => Number(x.split('position: ')[1]))
    .slice(0, 2) as [number, number];
}

const exampleInput = parseFile('./src/day-21/example.txt');
const puzzleInput = parseFile('./src/day-21/puzzle.txt');

console.log('Part 1 Example input: ', rollDeterministic100UntilWin(exampleInput));
console.log('Part 1 Puzzle input: ', rollDeterministic100UntilWin(puzzleInput));

console.log('Part 2 Example input: ', rollDiracDice(exampleInput));
console.log('Part 2 Puzzle input: ', rollDiracDice(puzzleInput));
