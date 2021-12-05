import { readFileSync } from 'fs';

type Board = number[][];

function getFirstWinningBoard(
  draws: number[],
  boards: BingoBoard[]
): { board: Board; score: number } {
  for (const draw of draws) {
    boards.forEach((board) => board.mark(draw));
    const winningBoard = boards.find((board) => board.hasWon());

    if (winningBoard) {
      return { board: winningBoard.getBoard(), score: winningBoard.getScore() };
    }
  }

  return { board: [], score: 0 };
}

function getLastWinningBoard(
  draws: number[],
  boards: BingoBoard[]
): { board: Board; score: number } {
  let remaining = boards.slice(0);

  for (const draw of draws) {
    remaining.forEach((board) => board.mark(draw));
    const winningBoard = remaining.find((board) => board.hasWon());
    const isFinalBoard = remaining.length === 1;

    if (winningBoard && isFinalBoard) {
      return { board: winningBoard.getBoard(), score: winningBoard.getScore() };
    }

    remaining = remaining.filter((board) => !board.hasWon());
  }

  return { board: [], score: 0 };
}

class BingoBoard {
  board: Board;
  rows: number;
  cols: number;

  marked = new Set<number>();
  unmarked: Record<string, number> = {};
  numToIndiciesMap: Record<string, string[]> = {};
  markedIndicies = new Set<string>();
  isWinningState = false;
  lastMarked?: number;

  constructor(board: Board) {
    this.board = board;
    this.rows = board.length;
    this.cols = board[0]?.length;
    if (!this.rows || !this.cols) throw new Error('Invalid board');

    this.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        this.unmarked[cell] ??= 0;
        this.unmarked[cell]++;

        this.numToIndiciesMap[cell] ??= [];
        this.numToIndiciesMap[cell].push(this.#serializeIndex(i, j));
      });
    });
  }

  mark(mark: number): void {
    if (!(mark in this.unmarked)) return;
    delete this.unmarked[mark];
    this.marked.add(mark);
    this.lastMarked = mark;

    this.numToIndiciesMap[mark].forEach((index) => this.markedIndicies.add(index));
    this.#updateWinningState();
  }

  hasWon(): boolean {
    return this.isWinningState;
  }

  getBoard(): Board {
    return this.board;
  }

  getScore(): number {
    if (!this.hasWon() || typeof this.lastMarked === 'undefined') return 0;
    const remainingSum = Object.entries(this.unmarked).reduce(
      (acc, [num, count]) => acc + Number(num) * count,
      0
    );
    return remainingSum * this.lastMarked;
  }

  #serializeIndex(i: number, j: number): string {
    return `${i}-${j}`;
  }

  #deserializeIndex(s: string): [number, number] {
    const index = s.split('-').map((x) => Number(x));
    if (index.length !== 2) throw new Error('Invalid serialized index');
    return index as [number, number];
  }

  #updateWinningState(): void {
    if (this.isWinningState) return;

    const rowsToCheck = new Set<number>();
    const colsToCheck = new Set<number>();

    [...this.markedIndicies].forEach((serializedIndex) => {
      const [row, col] = this.#deserializeIndex(serializedIndex);
      rowsToCheck.add(row);
      colsToCheck.add(col);
    });

    for (const row of rowsToCheck.values()) {
      const required = [...Array(this.cols)].map((_, i) => this.#serializeIndex(row, i));
      if (required.every((x) => this.markedIndicies.has(x))) {
        this.isWinningState = true;
        return;
      }
    }

    for (const col of colsToCheck.values()) {
      const required = [...Array(this.rows)].map((_, i) => this.#serializeIndex(i, col));
      if (required.every((x) => this.markedIndicies.has(x))) {
        this.isWinningState = true;
        return;
      }
    }
  }
}

function parseFile(path: string): [number[], BingoBoard[]] {
  const [drawsLine, ...otherLines] = readFileSync(path, 'utf-8').split('\n');

  const draws = drawsLine.split(',').map((x) => Number(x));
  const boards: BingoBoard[] = [];

  let board: Board = [];
  [...otherLines, ''].forEach((line) => {
    if (!line) {
      if (board.length) boards.push(new BingoBoard(board));
      board = [];
      return;
    }
    board.push(
      line
        .trim()
        .split(/\s+/)
        .map((x) => Number(x))
    );
  });

  return [draws, boards];
}

const exampleInput = parseFile('./src/day-4/example.txt');
const puzzleInput = parseFile('./src/day-4/puzzle.txt');

console.log('Part 1 Example input: ', getFirstWinningBoard(...exampleInput));
console.log('Part 1 Puzzle input: ', getFirstWinningBoard(...puzzleInput));

console.log('Part 2 Example input: ', getLastWinningBoard(...exampleInput));
console.log('Part 2 Puzzle input: ', getLastWinningBoard(...puzzleInput));
