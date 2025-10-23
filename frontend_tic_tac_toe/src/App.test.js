import { render, screen, fireEvent } from '@testing-library/react';
import App, { calculateWinner, initBoard, isDraw, validateMove } from './App';

describe('Core Logic (unit tests)', () => {
  test('initBoard returns 9 nulls', () => {
    const b = initBoard();
    expect(Array.isArray(b)).toBe(true);
    expect(b).toHaveLength(9);
    expect(b.every((x) => x === null)).toBe(true);
  });

  test('validateMove validates index and occupancy', () => {
    const b = initBoard();
    expect(validateMove(b, 0).valid).toBe(true);
    const invalidIndex = validateMove(b, 10);
    expect(invalidIndex.valid).toBe(false);
    expect(invalidIndex.reason).toBe('Invalid index');

    b[0] = 'X';
    const occupied = validateMove(b, 0);
    expect(occupied.valid).toBe(false);
    expect(occupied.reason).toBe('Cell occupied');
  });

  test('calculateWinner detects row, col, diag', () => {
    let b = ['X','X','X', null,null,null, null,null,null];
    expect(calculateWinner(b)).toBe('X');
    b = ['O',null,null,'O',null,null,'O',null,null];
    expect(calculateWinner(b)).toBe('O');
    b = ['X',null,null, null,'X',null, null,null,'X'];
    expect(calculateWinner(b)).toBe('X');
    b = ['X',null,'O', null,'O',null, 'O',null,'X'];
    expect(calculateWinner(b)).toBe('O');
  });

  test('isDraw true when board full and no winner', () => {
    const b = ['X','O','X','X','O','O','O','X','X'];
    expect(calculateWinner(b)).toBe(null);
    expect(isDraw(b)).toBe(true);
  });
});

describe('App UI (smoke tests)', () => {
  test('renders title and controls', () => {
    render(<App />);
    expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument();
  });

  test('plays a simple move and prevents overwrite', () => {
    render(<App />);
    const cells = screen.getAllByRole('button', { name: /Cell/i });
    expect(cells).toHaveLength(9);

    // First click places X
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');

    // Attempt overwrite should not change
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');
  });
});
