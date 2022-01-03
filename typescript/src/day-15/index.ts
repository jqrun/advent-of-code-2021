import { readFileSync } from 'fs';

const dirs = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function getLowestTotalRisk(map: number[][]): number {
  const [rows, cols] = [map.length, map[0].length];
  const visited = new Set<string>();
  const memo = [...Array(rows)].map(() => [...Array(cols)].map(() => Number.POSITIVE_INFINITY));
  memo[0][0] = 0;

  const pq = new PriorityQueue<[number, number]>((a, b) => memo[a[0]][a[1]] < memo[b[0]][b[1]]);
  pq.push([0, 0]);

  while (!pq.isEmpty()) {
    const [i, j] = pq.pop()!;
    visited.add(`${i}-${j}`);

    for (const [_i, _j] of dirs) {
      const [row, col] = [i + _i, j + _j];
      if (row < 0 || col < 0 || row >= rows || col >= cols) continue;
      memo[row][col] = Math.min(memo[row][col], memo[i][j] + map[row][col]);
      if (!visited.has(`${row}-${col}`)) {
        pq.push([row, col]);
        visited.add(`${row}-${col}`);
      }
    }
  }

  return memo[rows - 1][cols - 1];
}

function expandMap(tile: number[][]): number[][] {
  const [rows, cols] = [tile.length, tile[0].length];
  const map = [...Array(rows * 5)].map(() => [...Array(cols * 5)].map(() => 0));
  const increaseRisk = (x: number): number => Math.max((x + 1) % 10, 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      map[row][col] = tile[row][col];
    }
  }

  for (let i = 1; i < 5; i++) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        map[row][col + cols * i] = increaseRisk(map[row][col + cols * (i - 1)]);
      }
    }
  }

  for (let i = 1; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          map[row + rows * i][col + cols * j] = increaseRisk(
            map[row + rows * (i - 1)][col + cols * j]
          );
        }
      }
    }
  }

  return map;
}

class PriorityQueue<T = number[]> {
  compareFn: (a: T, b: T) => boolean;
  tree: T[] = [];

  constructor(compareFn: (a: T, b: T) => boolean) {
    this.compareFn = compareFn;
  }

  push(item: T): void {
    this.tree.push(item);
    this._siftUp(this.tree.length - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;

    const popped = this.tree[0];
    this.tree[0] = this.tree[this.tree.length - 1];
    this.tree.pop();
    this._siftDown(0);
    return popped;
  }

  isEmpty(): boolean {
    return !this.tree.length;
  }

  getTree(): T[] {
    return this.tree;
  }

  _swap(i: number, j: number): void {
    [this.tree[i], this.tree[j]] = [this.tree[j], this.tree[i]];
  }

  _siftUp(i: number): void {
    const parent = Math.floor((i - 1) / 2);

    if (i > 0 && this.compareFn(this.tree[i], this.tree[parent])) {
      this._swap(i, parent);
      this._siftUp(parent);
    }
  }

  _siftDown(i: number): void {
    let largest = i;
    const left = i * 2 + 1;
    const right = left + 1;

    if (left < this.tree.length && this.compareFn(this.tree[left], this.tree[largest])) {
      largest = left;
    }

    if (right < this.tree.length && this.compareFn(this.tree[right], this.tree[largest])) {
      largest = right;
    }

    if (i !== largest) {
      this._swap(i, largest);
      this._siftDown(largest);
    }
  }
}

function parseFile(path: string): number[][] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => x.split('').map((_x) => Number(_x)));
}

const exampleInput = parseFile('./src/day-15/example.txt');
const puzzleInput = parseFile('./src/day-15/puzzle.txt');

console.log('Part 1 Example input: ', getLowestTotalRisk(exampleInput));
console.log('Part 1 Puzzle input: ', getLowestTotalRisk(puzzleInput));

console.log('Part 2 Example input: ', getLowestTotalRisk(expandMap(exampleInput)));
console.log('Part 2 Puzzle input: ', getLowestTotalRisk(expandMap(puzzleInput)));
