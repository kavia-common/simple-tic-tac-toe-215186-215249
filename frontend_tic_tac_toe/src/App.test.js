import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { calculateWinner, initBoard, isDraw, validateMove } from './utils/gameLogic';

jest.useFakeTimers();

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

describe('App UI (smoke tests + AI)', () => {
  test('renders title and controls', () => {
    render(<App />);
    expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Game mode selector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AI difficulty selector/i)).toBeInTheDocument();
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

  test('AI responds after human move in Human vs AI mode', () => {
    render(<App />);
    const cells = screen.getAllByRole('button', { name: /Cell/i });
    // Human (X) moves
    fireEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');

    // After delay, AI (O) should move somewhere
    act(() => {
      jest.advanceTimersByTime(400);
    });
    const oCount = cells.filter((c) => c.textContent === 'O').length;
    expect(oCount).toBe(1);
  });

  test('Disabling clicks during AI turn', () => {
    render(<App />);
    const cells = screen.getAllByRole('button', { name: /Cell/i });

    // Human clicks, triggers AI turn
    fireEvent.click(cells[0]);
    // Immediately attempt another click on empty cell during AI turn; should not place X
    fireEvent.click(cells[1]);

    // Fast-forward AI
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Ensure that there is exactly one X and one O after AI turn
    const xCount = cells.filter((c) => c.textContent === 'X').length;
    const oCount = cells.filter((c) => c.textContent === 'O').length;
    expect(xCount).toBe(1);
    expect(oCount).toBe(1);
  });
});
