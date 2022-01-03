import { readFileSync } from 'fs';

const getMemoizedInsertCountsRecursive = (): ((
  pair: string,
  steps: number,
  rules: Record<string, string>
) => Record<string, number>) => {
  const memo: Record<string, Record<string, number>> = {};

  const insertCountsRecurisve = (
    pair: string,
    steps: number,
    rules: Record<string, string>
  ): Record<string, number> => {
    if (!steps) return {};
    if (memo[pair + steps]) return memo[pair + steps];

    const insert = rules[pair];
    const counts: Record<string, number> = { [insert]: 1 };
    const left = insertCountsRecurisve(pair[0] + insert, steps - 1, rules);
    const right = insertCountsRecurisve(insert + pair[1], steps - 1, rules);

    for (const [letter, count] of Object.entries(left).concat(Object.entries(right))) {
      counts[letter] ??= 0;
      counts[letter] += count;
    }

    memo[pair + steps] = counts;
    return counts;
  };
  return insertCountsRecurisve;
};

function getMostLeast(
  template: string,
  rules: Record<string, string>,
  steps = 10
): { most: string; least: string; delta: number } {
  const counts: Record<string, number> = {};
  for (let i = 0; i < template.length; i++) {
    const letter = template[i];
    counts[letter] ??= 0;
    counts[letter]++;
  }

  const insertCountsRecurisve = getMemoizedInsertCountsRecursive();

  const additionalCounts: [string, number][] = [];
  for (let i = 0; i < template.length - 1; i++) {
    additionalCounts.push(
      ...Object.entries(insertCountsRecurisve(template[i] + template[i + 1], steps, rules))
    );
  }

  for (const [letter, count] of additionalCounts) {
    counts[letter] ??= 0;
    counts[letter] += count;
  }

  const sortedLetters = Object.entries(counts);
  sortedLetters.sort((a, b) => a[1] - b[1]);
  const least = sortedLetters[0][0];
  const most = sortedLetters[sortedLetters.length - 1][0];

  return { most, least, delta: counts[most] - counts[least] };
}

function parseFile(path: string): { template: string; rules: Record<string, string> } {
  const lines = readFileSync(path, 'utf-8').split('\n');
  const template = lines[0];
  const rules = Object.fromEntries(
    lines.slice(2).map((x) => x.split(' -> ').slice(0, 2) as [string, string])
  );

  return { template, rules };
}

const exampleInput = parseFile('./src/day-14/example.txt');
const puzzleInput = parseFile('./src/day-14/puzzle.txt');

console.log('Part 1 Example input: ', getMostLeast(exampleInput.template, exampleInput.rules));
console.log('Part 1 Puzzle input: ', getMostLeast(puzzleInput.template, puzzleInput.rules));

console.log('Part 2 Example input: ', getMostLeast(exampleInput.template, exampleInput.rules, 40));
console.log('Part 2 Puzzle input: ', getMostLeast(puzzleInput.template, puzzleInput.rules, 40));
