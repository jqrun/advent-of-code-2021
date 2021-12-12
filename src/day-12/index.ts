import { readFileSync } from 'fs';

type CaveType = 'start' | 'end' | 'small' | 'big';

function getPathsSmallCavesOnce(edges: [string, string][]): { paths: string[]; count: number } {
  const paths: string[] = [];
  const nodes: Record<string, string[]> = {};

  for (const [a, b] of edges) {
    nodes[a] ??= [];
    nodes[b] ??= [];
    nodes[a].push(b);
    nodes[b].push(a);
  }

  bfsSmallCavesOnce(nodes, new Set(), ['start'], paths);

  return { paths, count: paths.length };
}

function bfsSmallCavesOnce(
  nodes: Record<string, string[]>,
  visitedSmalls: Set<string>,
  path: string[],
  paths: string[]
): void {
  const current = path[path.length - 1];

  for (const node of nodes[current]) {
    switch (getCaveType(node)) {
      case 'start':
        break;
      case 'end':
        paths.push([...path, 'end'].join(','));
        break;
      case 'small':
        if (visitedSmalls.has(node)) break;
        bfsSmallCavesOnce(nodes, new Set([...visitedSmalls, node]), [...path, node], paths);
        break;
      case 'big':
        bfsSmallCavesOnce(nodes, new Set([...visitedSmalls]), [...path, node], paths);
        break;
    }
  }
}

function getPathsComplexConditions(edges: [string, string][]): { paths: string[]; count: number } {
  const paths: string[] = [];
  const nodes: Record<string, string[]> = {};

  for (const [a, b] of edges) {
    nodes[a] ??= [];
    nodes[b] ??= [];
    nodes[a].push(b);
    nodes[b].push(a);
  }

  bfsComplexConditions(nodes, new Set(), '', ['start'], paths);

  return { paths, count: paths.length };
}

function bfsComplexConditions(
  nodes: Record<string, string[]>,
  visitedSmalls: Set<string>,
  doubledSmall: string,
  path: string[],
  paths: string[]
): void {
  const current = path[path.length - 1];

  for (const node of nodes[current]) {
    switch (getCaveType(node)) {
      case 'start':
        break;
      case 'end':
        paths.push([...path, 'end'].join(','));
        break;
      case 'small':
        if (visitedSmalls.has(node) && doubledSmall) break;
        bfsComplexConditions(
          nodes,
          new Set([...visitedSmalls, node]),
          visitedSmalls.has(node) ? node : doubledSmall,
          [...path, node],
          paths
        );
        break;
      case 'big':
        bfsComplexConditions(
          nodes,
          new Set([...visitedSmalls]),
          doubledSmall,
          [...path, node],
          paths
        );
        break;
    }
  }
}

function getCaveType(cave: string): CaveType {
  if (cave === 'start' || cave === 'end') return cave;
  if (cave.toUpperCase() === cave) return 'big';
  return 'small';
}

function parseFile(path: string): [string, string][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split('-')) as [string, string][];
}

const exampleInput = parseFile('./src/day-12/example.txt');
const puzzleInput = parseFile('./src/day-12/puzzle.txt');

console.log('Part 1 Example input: ', getPathsSmallCavesOnce(exampleInput));
console.log('Part 1 Puzzle input: ', getPathsSmallCavesOnce(puzzleInput));

console.log('Part 2 Example input: ', getPathsComplexConditions(exampleInput));
console.log('Part 2 Puzzle input: ', getPathsComplexConditions(puzzleInput));
