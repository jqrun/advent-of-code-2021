import { writeFileSync, readFileSync } from 'fs';

/**
 * This one was ultimatley solved by hand and not progrmatticaly.
 * I used hints for this one! And most credit goes to this post:
 * https://www.reddit.com/r/adventofcode/comments/rom5l5/2021_day_24pen_paper_monad_deparsed/
 */

type Variable = 'w' | 'x' | 'y' | 'z';

type Command = 'inp' | 'add' | 'mul' | 'div' | 'mod' | 'eql';

type Params = (Variable | number)[];

type Instruction = { command: Command; params: Params };

type State = Record<Variable, number>;

const defaultState: State = { w: 0, x: 0, y: 0, z: 0 };

const constants = [
  [15, 1, 15],
  [15, 1, 10],
  [12, 1, 2],
  [13, 1, 16],
  [-12, 26, 12],
  [10, 1, 11],
  [-9, 26, 5],
  [14, 1, 16],
  [13, 1, 6],
  [-14, 26, 15],
  [-11, 26, 3],
  [-2, 26, 12],
  [-16, 26, 10],
  [-14, 26, 13],
];

function executeDigit(state: State, digit: number): State {
  state = { ...state };

  /*

  + | D1 + 15
  + | D2 + 10
  + | D3 + 2
  + | D4 + 16
  - | D5 = (D4 + 16) - 12 <> D4 + 4
  + | D6 + 11
  - | D7 = (D6 + 11) - 9 <> D6 + 2
  + | D8 + 16
  + | D9 + 6
  - | D10 = (D9 + 6) - 14 <> D9 - 8
  - | D11 = (D8 + 16) - 11 <> D8 + 5
  - | D12 = (D3 + 2) - 2 <> D3
  - | D13 = (D2 + 10) - 16 <> D2 - 6
  - | D14 = (D1 + 15) - 14 <> D1 + 1

  12345678901234
  ...59.........
  ...5979.......
  89959794919939

  12345678901234
  ...15.........
  ...1513.......
  17115131916112

  */

  const [constantX, divZ, constantY] = constants[digit];

  state.x = (state.z % 26) + constantX;
  state.z = Math.floor(state.z / divZ);

  if (state.x !== state.w) {
    state.z *= 26;
    state.z += state.w + constantY;
  }

  return state;
}

function executeReverseEngineered(inputs: number[]): State {
  let state = { ...defaultState };

  for (let i = 0; i < inputs.length; i++) {
    state = executeDigit({ ...state, w: inputs[i] }, i);
  }

  return state;
}

function execute(instructions: Instruction[], inputs: number[]): State {
  const state: State = { w: 0, x: 0, y: 0, z: 0 };

  let inputIndex = 0;
  for (const { command, params } of instructions) {
    switch (command) {
      case 'inp':
        state[params[0] as Variable] = inputs[inputIndex];
        inputIndex++;
        break;
      case 'add': {
        const store = params[0] as Variable;
        const valParam = params[1];
        const val = typeof valParam === 'number' ? valParam : state[valParam];
        state[store] = state[store] + val;
        break;
      }
      case 'mul': {
        const store = params[0] as Variable;
        const valParam = params[1];
        const val = typeof valParam === 'number' ? valParam : state[valParam];
        state[store] = state[store] * val;
        break;
      }
      case 'div': {
        const store = params[0] as Variable;
        const valParam = params[1];
        const val = typeof valParam === 'number' ? valParam : state[valParam];
        state[store] = Math.floor(state[store] / val);
        break;
      }
      case 'mod': {
        const store = params[0] as Variable;
        const valParam = params[1];
        const val = typeof valParam === 'number' ? valParam : state[valParam];
        state[store] = state[store] % val;
        break;
      }
      case 'eql': {
        const store = params[0] as Variable;
        const valParam = params[1];
        const val = typeof valParam === 'number' ? valParam : state[valParam];
        state[store] = state[store] === val ? 1 : 0;
        break;
      }
    }
  }

  return state;
}

function translateToJavaScript(instructions: Instruction[]): void {
  let output = '';

  let inputIndex = 0;
  for (const { command, params } of instructions) {
    switch (command) {
      case 'inp':
        output += `${params[0]} = inputs[${inputIndex}];\n`;
        inputIndex++;
        break;
      case 'add':
        output += `${params[0]} += ${params[1]};\n`;
        break;
      case 'mul':
        output += `${params[0]} *= ${params[1]};\n`;
        break;
      case 'div':
        output += `${params[0]} = Math.floor(${params[0]} / ${params[1]});\n`;
        break;
      case 'mod':
        output += `${params[0]} %= ${params[1]};\n`;
        break;
      case 'eql':
        output += `${params[0]} = ${params[0]} === ${params[1]} ? 1 : 0;\n`;
        break;
    }
  }

  writeFileSync('./src/day-24/monad.txt', output);
}

function parseFile(path: string): Instruction[] {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .map((x) => {
      const tokens = x.split(' ');
      const command = tokens[0] as Command;
      const params = tokens
        .slice(1)
        .map((y) => (!Number.isNaN(parseInt(y)) ? Number(y) : y)) as Params;
      return {
        command,
        params,
      };
    });
}

const exampleInput = parseFile('./src/day-24/example.txt');
const puzzleInput = parseFile('./src/day-24/puzzle.txt');

console.log('Example input sanity check: ', execute(exampleInput, [15]));

translateToJavaScript(puzzleInput);

const maxModel = '89959794919939'.split('').map((x) => Number(x));

console.log(execute(puzzleInput, maxModel));
console.log(executeReverseEngineered(maxModel));

const minModel = '89959794919939'.split('').map((x) => Number(x));

console.log(execute(puzzleInput, minModel));
console.log(executeReverseEngineered(minModel));
