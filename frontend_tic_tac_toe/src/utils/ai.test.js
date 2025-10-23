import { getAIMove, calculateWinner, isDraw } from './ai';

describe('AI utils', () => {
  test('random difficulty never chooses occupied cells', () => {
    const board = [ 'X', null, 'O', null, 'X', null, null, 'O', null ];
    const tries = 100;
    for (let i = 0; i < tries; i += 1) {
      const idx = getAIMove(board, 'O', 'random');
      expect(board[idx]).toBeNull();
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(9);
    }
  });

  test('optimal chooses immediate winning move', () => {
    // O to play and can win at index 2
    const board = [
      'O','O',null,
      'X','X',null,
      null,null,null
    ];
    const move = getAIMove(board, 'O', 'optimal');
    expect(move).toBe(2);
  });

  test('optimal blocks opponent winning move', () => {
    // X threatens to win at index 2; O should block if O is AI and it is X's turn then board invalid for getAIMove; so set board for O to move
    const board = [
      'X','X',null,
      'O',null,null,
      null,null,null
    ];
    // It's X's turn since 2 marks X vs 1 mark O => currentMark 'O'? Actually 3 moves: X,X,O so currentMark = 'O'
    const move = getAIMove(board, 'O', 'optimal');
    expect(move).toBe(2);
  });

  test('throws on invalid inputs and game over', () => {
    expect(() => getAIMove([], 'X', 'random')).toThrow();
    expect(() => getAIMove(Array(9).fill(null), 'Z', 'random')).toThrow();
    expect(() => getAIMove(Array(9).fill(null), 'X', 'hard')).toThrow();

    const winBoard = ['X','X','X', null,null,null, null,null,null];
    expect(calculateWinner(winBoard)).toBe('X');
    expect(() => getAIMove(winBoard, 'O', 'random')).toThrow();

    const drawBoard = ['X','O','X','X','O','O','O','X','X'];
    expect(isDraw(drawBoard)).toBe(true);
    expect(() => getAIMove(drawBoard, 'X', 'random')).toThrow();
  });
});
