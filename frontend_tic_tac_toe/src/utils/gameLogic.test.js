import { calculateWinner, initBoard, isDraw, validateMove } from './gameLogic';

describe('gameLogic utils', () => {
  test('initBoard returns empty board', () => {
    const b = initBoard();
    expect(b.length).toBe(9);
    expect(b.every((c) => c === null)).toBe(true);
  });

  test('validateMove validates inputs and occupancy', () => {
    const b = initBoard();
    expect(validateMove(b, 0).valid).toBe(true);
    expect(validateMove([], 0).valid).toBe(false);
    expect(validateMove(b, -1).valid).toBe(false);
    b[0] = 'X';
    const res = validateMove(b, 0);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('Cell occupied');
  });

  test('calculateWinner returns proper winners', () => {
    const row = ['X','X','X', null,null,null, null,null,null];
    expect(calculateWinner(row)).toBe('X');

    const col = ['O',null,null,'O',null,null,'O',null,null];
    expect(calculateWinner(col)).toBe('O');

    const diag = ['X',null,null, null,'X',null, null,null,'X'];
    expect(calculateWinner(diag)).toBe('X');

    const none = ['X','O','X','X','O','O','O','X','X'];
    expect(calculateWinner(none)).toBe(null);
  });

  test('isDraw true only when full and no winner', () => {
    const fullNoWin = ['X','O','X','X','O','O','O','X','X'];
    expect(isDraw(fullNoWin)).toBe(true);

    const notFull = ['X',null,'O', null,null,null, null,null,null];
    expect(isDraw(notFull)).toBe(false);

    const winBoard = ['X','X','X', null,null,null, null,null,null];
    expect(isDraw(winBoard)).toBe(false);
  });
});
