import { readFileSync } from 'fs';

function getNumPixelsLit(image: string[][]): number {
  let count = 0;

  for (const row of image) {
    for (const pixel of row) {
      if (pixel === '#') count++;
    }
  }

  return count;
}

function enhanceImageNtimes(image: string[][], algorithm: string, times = 1): string[][] {
  const shouldSwapInfiniteSpacePixels =
    algorithm[0] === '#' && algorithm[algorithm.length - 1] === '.';

  let newImage = image;
  for (let i = 0; i < times; i++) {
    const swappingPixel = i % 2 === 0 ? '.' : '#';
    const infiniteSpacePixel = shouldSwapInfiniteSpacePixels ? swappingPixel : '.';
    newImage = enhanceImage(newImage, algorithm, infiniteSpacePixel);
  }
  return newImage;
}

function enhanceImage(image: string[][], algorithm: string, infiniteSpacePixel = '.'): string[][] {
  const paddedImage = padImage(image, infiniteSpacePixel);
  const newImage = cloneImage(paddedImage);
  const [rows, cols] = [newImage.length, newImage[0].length];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      newImage[i][j] = algorithm[getDecimalConversion(i, j, paddedImage, infiniteSpacePixel)];
    }
  }

  return newImage;
}

function padImage(image: string[][], pixel = '.', width = 1): string[][] {
  const [rows, cols] = [image.length, image[0].length];
  const [newRows, newCols] = [rows + width * 2, cols + width * 2];
  const newImage: string[][] = [...Array(newRows)].map(() => [...Array(newCols)]);

  for (let i = 0; i < newRows; i++) {
    for (let j = 0; j < newCols; j++) {
      if (i < width || j < width || i >= newRows - width || j >= newCols - width) {
        newImage[i][j] = pixel;
        continue;
      }

      newImage[i][j] = image[i - width][j - width];
    }
  }

  return newImage;
}

function cloneImage(image: string[][]): string[][] {
  return image.slice(0).map((x) => x.slice(0));
}

function getDecimalConversion(
  x: number,
  y: number,
  image: string[][],
  infiniteSpacePixel = '.'
): number {
  const bounds = [-1, 0, 1];
  const [rows, cols] = [image.length, image[0].length];

  let binary = '';
  for (const i of bounds) {
    for (const j of bounds) {
      const [row, col] = [x + i, y + j];
      let pixel = infiniteSpacePixel;
      if (row >= 0 && col >= 0 && row < rows && col < cols) {
        pixel = image[row][col];
      }

      binary += pixel === '#' ? 1 : 0;
    }
  }

  return parseInt(binary, 2);
}

function parseFile(path: string): { algorithm: string; image: string[][] } {
  const lines = readFileSync(path, 'utf-8').split('\n');

  return {
    algorithm: lines[0],
    image: lines.slice(2).map((x) => x.split('')),
  };
}

const exampleInput = parseFile('./src/day-20/example.txt');
const puzzleInput = parseFile('./src/day-20/puzzle.txt');

console.log(
  'Part 1 Example input: ',
  getNumPixelsLit(enhanceImageNtimes(exampleInput.image, exampleInput.algorithm, 2))
);
console.log(
  'Part 1 Puzzle input: ',
  getNumPixelsLit(enhanceImageNtimes(puzzleInput.image, puzzleInput.algorithm, 2))
);

console.log(
  'Part 2 Example input: ',
  getNumPixelsLit(enhanceImageNtimes(exampleInput.image, exampleInput.algorithm, 50))
);
console.log(
  'Part 2 Puzzle input: ',
  getNumPixelsLit(enhanceImageNtimes(puzzleInput.image, puzzleInput.algorithm, 50))
);
