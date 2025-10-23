//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-UTILS-001
// User Story: As a developer, I want core game logic isolated in utilities to test easily.
// Acceptance Criteria:
// - Provide pure functions: initBoard, validateMove, calculateWinner, isDraw
// - Include JSDoc documentation and PUBLIC_INTERFACE markers
// GxP Impact: NO
// Risk Level: LOW
// ============================================================================

/**
 * @typedef {'X'|'O'|null} Cell
 */

/**
 * @typedef {{ valid: boolean, reason?: string }} ValidationResult
 */

// PUBLIC_INTERFACE
export function initBoard() {
  /** Returns a new empty 3x3 board as array of 9 nulls. */
  return Array(9).fill(null);
}

// PUBLIC_INTERFACE
export function validateMove(board, index) {
  /**
   * Validate a proposed move on the board.
   * @param {Cell[]} board - 9-length array of Cell
   * @param {number} index - Target index 0..8
   * @returns {ValidationResult}
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
   * Determine winner.
   * @param {Cell[]} board
   * @returns {'X'|'O'|null}
   */
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  return null;
}

// PUBLIC_INTERFACE
export function isDraw(board) {
  /**
   * Detect draw (full board without winner).
   * @param {Cell[]} board
   * @returns {boolean}
   */
  return !calculateWinner(board) && board.every((c) => c !== null);
}
