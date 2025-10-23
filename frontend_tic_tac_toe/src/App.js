import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-001
// User Story: As two local users, we want to play Tic Tac Toe on one device.
// Acceptance Criteria:
// - 3x3 board; clickable cells; cannot overwrite occupied cells
// - Alternate turns (X then O)
// - Win detection for rows/cols/diagonals; draw detection
// - Turn indicator and Restart button
// - Responsive modern UI (Ocean Professional theme)
// - Console audit logs (timestamp + player + action)
// - Error boundary shows friendly fallback
// - Unit tests for game logic helpers (>=80% coverage target)
// GxP Impact: NO - local game, no data persistence; still provide basic audit-style logs
// Risk Level: LOW
// Validation Protocol: VP-TTT-CORE-LOGIC
// ============================================================================ 
*/

/**
 * Theme tokens for Ocean Professional
 */
const themeTokens = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#06b6d4',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

/**
 * Lightweight audit logger for client console (no persistence).
 * Provides structured, timestamped logs.
 */
const auditLog = {
  // PUBLIC_INTERFACE
  info(event, data = {}) {
    /** Log informational audit events (ISO timestamp + event + data) */
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[AUDIT][INFO] ${ts} :: ${event}`, data);
  },
  // PUBLIC_INTERFACE
  error(event, data = {}) {
    /** Log error audit events (ISO timestamp + event + data) */
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.error(`[AUDIT][ERROR] ${ts} :: ${event}`, data);
  },
};

/**
 * ErrorBoundary component to catch render/runtime errors in subtree.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    auditLog.error('UI_ERROR', { error: error?.message, stack: info?.componentStack });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: themeTokens.background,
          color: themeTokens.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: themeTokens.surface,
            borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            padding: 24,
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            border: `1px solid ${themeTokens.secondary}22`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px 0' }}>Something went wrong</h2>
            <p style={{ margin: 0, color: themeTokens.secondary }}>
              Please try reloading the page or starting a new game.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Square cell component
 */
function Square({ value, onClick, disabled, index }) {
  return (
    <button
      aria-label={`Cell ${index + 1} ${value ? 'occupied by ' + value : 'empty'}`}
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
    >
      {value}
    </button>
  );
}

/**
 * Board component renders grid and delegates click events
 */
function Board({ board, onSquareClick, gameOver }) {
  return (
    <div className="ttt-grid" role="grid" aria-label="Tic Tac Toe board">
      {board.map((cell, idx) => (
        <Square
          key={idx}
          index={idx}
          value={cell}
          onClick={() => onSquareClick(idx)}
          disabled={!!cell || gameOver}
        />
      ))}
    </div>
  );
}

/**
 * Game status text
 */
function Status({ winner, isDraw, xIsNext }) {
  let text = '';
  if (winner) text = `Winner: ${winner}`;
  else if (isDraw) text = 'Draw game';
  else text = `Turn: ${xIsNext ? 'X' : 'O'}`;
  return (
    <div className="ttt-status" aria-live="polite">{text}</div>
  );
}

// PUBLIC_INTERFACE
export function initBoard() {
  /** Returns a new empty 3x3 board as array of 9 nulls. */
  return Array(9).fill(null);
}

// PUBLIC_INTERFACE
export function validateMove(board, index) {
  /**
   * Validate move.
   * Parameters:
   * - board: (Array) 9-length array with 'X' | 'O' | null
   * - index: (number) 0..8
   * Returns:
   * - { valid: boolean, reason?: string }
   */
  if (!Array.isArray(board) || board.length !== 9) {
    return { valid: false, reason: 'Invalid board' };
    }
  if (typeof index !== 'number' || index < 0 || index > 8) {
    return { valid: false, reason: 'Invalid index' };
  }
  if (board[index] !== null) {
    return { valid: false, reason: 'Cell occupied' };
  }
  return { valid: true };
}

// PUBLIC_INTERFACE
export function calculateWinner(board) {
  /**
   * Check winner on a 3x3 board.
   * Returns:
   * - 'X' | 'O' | null
   */
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diagonals
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
export function isDraw(board) {
  /**
   * True if no empty cells and no winner.
   */
  return !calculateWinner(board) && board.every((c) => c !== null);
}

/**
 * Main App: Tic Tac Toe Game
 */
function App() {
  const [board, setBoard] = useState(() => initBoard());
  const [xIsNext, setXIsNext] = useState(true);
  const [theme, setTheme] = useState('light');

  const winner = useMemo(() => calculateWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);
  const gameOver = !!winner || draw;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize theme tokens in CSS at runtime to match Ocean Professional
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', themeTokens.surface);
    root.style.setProperty('--bg-secondary', themeTokens.background);
    root.style.setProperty('--text-primary', themeTokens.text);
    root.style.setProperty('--text-secondary', themeTokens.primary);
    root.style.setProperty('--border-color', '#e5e7eb');
    root.style.setProperty('--button-bg', themeTokens.primary);
    root.style.setProperty('--button-text', '#ffffff');
  }, []);

  const currentPlayer = xIsNext ? 'X' : 'O';

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    /**
     * Handles a user click on a square with validation and audit logging.
     * Audit: { action: 'MOVE_ATTEMPT'|'MOVE_APPLY'|'MOVE_REJECT', player, index, before, after }
     */
    try {
      const validation = validateMove(board, index);
      auditLog.info('MOVE_ATTEMPT', { player: currentPlayer, index, before: board });

      if (!validation.valid) {
        auditLog.info('MOVE_REJECT', { reason: validation.reason, player: currentPlayer, index });
        return;
      }
      if (gameOver) {
        auditLog.info('MOVE_REJECT', { reason: 'Game over', player: currentPlayer, index });
        return;
      }

      const next = board.slice();
      next[index] = currentPlayer;
      setBoard(next);
      setXIsNext((prev) => !prev);
      auditLog.info('MOVE_APPLY', { player: currentPlayer, index, after: next });

    } catch (err) {
      auditLog.error('MOVE_ERROR', { message: err?.message });
    }
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    /** Restart the game state and log */
    auditLog.info('GAME_RESTART', { before: board });
    setBoard(initBoard());
    setXIsNext(true);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light/dark UI modes (cosmetic) */
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (winner) {
      auditLog.info('GAME_WIN', { winner, finalBoard: board });
    } else if (draw) {
      auditLog.info('GAME_DRAW', { finalBoard: board });
    }
  }, [winner, draw, board]);

  return (
    <div className="App">
      <header className="ttt-header">
        <div className="ttt-title">Tic Tac Toe</div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main className="ttt-container">
        <div className="ttt-card">
          <Status winner={winner} isDraw={draw} xIsNext={xIsNext} />
          <Board board={board} onSquareClick={handleSquareClick} gameOver={gameOver} />
          <div className="ttt-controls">
            <button className="ttt-btn" onClick={handleRestart} aria-label="Restart game">
              Restart
            </button>
          </div>
        </div>
      </main>

      <footer className="ttt-footer">
        <span>Ocean Professional</span>
      </footer>
    </div>
  );
}

export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
