//
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-TTT-AI-001
// User Story: As a player, I want to play against an AI with selectable difficulty.
// Acceptance Criteria:
// - Provide pure function getAIMove(board, aiMark, difficulty)
// - Difficulty "random" chooses a valid empty cell uniformly
// - Difficulty "optimal" uses minimax to choose the best move
// - Input validation and robust error handling (throw descriptive errors)
// - No mutation of input arrays
// - No external services
// GxP Impact: NO (client-side game only); provide audit-friendly logs at call sites
// Risk Level: LOW
// Validation Protocol: VP-TTT-AI-LOGIC
// ============================================================================

/**
 * @typedef {'X'|'O'|null} Cell
 */

/**
 * Clone board defensively.
 * @param {Cell[]} board
 * @returns {Cell[]}
 */
function cloneBoard(board) {
  return board.slice();
}

/**
 * Determine winner on a 3x3 board.
 * @param {Cell[]} board
 * @returns {'X'|'O'|null}
 */
export function calculateWinner(board) {
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

/**
 * True if full board without winner.
 * @param {Cell[]} board
 * @returns {boolean}
 */
export function isDraw(board) {
  return !calculateWinner(board) && board.every((c) => c !== null);
}

/**
 * Get list of empty cell indices.
 * @param {Cell[]} board
 * @returns {number[]}
 */
function emptyCells(board) {
  const res = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === null) res.push(i);
  }
  return res;
}

/**
 * Score terminal state for minimax.
 * aiMark wins -> +10, opp wins -> -10, draw -> 0
 * @param {Cell[]} board
 * @param {'X'|'O'} aiMark
 * @returns {number|null} score or null if non-terminal
 */
function terminalScore(board, aiMark) {
  const win = calculateWinner(board);
  if (win === aiMark) return 10;
  if (win && win !== aiMark) return -10;
  if (isDraw(board)) return 0;
  return null;
}

/**
 * Minimax algorithm (no pruning; sufficient for 3x3).
 * Returns best score and move index.
 * @param {Cell[]} board
 * @param {'X'|'O'} aiMark
 * @param {'X'|'O'} currentMark
 * @returns {{ score: number, move: number|null }}
 */
function minimax(board, aiMark, currentMark) {
  const term = terminalScore(board, aiMark);
  if (term !== null) return { score: term, move: null };

  const avail = emptyCells(board);
  // If no available cells and no terminal recognized (shouldn't happen), return draw
  if (avail.length === 0) return { score: 0, move: null };

  let bestMove = null;

  if (currentMark === aiMark) {
    // Maximize
    let bestScore = -Infinity;
    for (const idx of avail) {
      const next = cloneBoard(board);
      next[idx] = currentMark;
      const { score } = minimax(next, aiMark, aiMark === 'X' ? 'O' : 'X');
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
    return { score: bestScore, move: bestMove };
  }

  // Minimize opponent
  let bestScore = Infinity;
  for (const idx of avail) {
    const next = cloneBoard(board);
    next[idx] = currentMark;
    const { score } = minimax(next, aiMark, aiMark === 'X' ? 'O' : 'X');
    if (score < bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  return { score: bestScore, move: bestMove };
}

// PUBLIC_INTERFACE
export function getAIMove(board, aiMark, difficulty = 'random') {
  /**
   * Select an AI move based on difficulty.
   * Parameters:
   * - board: Cell[] length 9
   * - aiMark: 'X' | 'O'
   * - difficulty: 'random' | 'optimal'
   * Returns:
   * - index 0..8 where AI should play
   * Throws:
   * - Error on invalid input or if no legal moves
   */
  // Input validation
  if (!Array.isArray(board) || board.length !== 9) {
    throw new Error('getAIMove: Invalid board');
  }
  if (aiMark !== 'X' && aiMark !== 'O') {
    throw new Error('getAIMove: Invalid aiMark');
  }
  if (difficulty !== 'random' && difficulty !== 'optimal') {
    throw new Error('getAIMove: Invalid difficulty');
  }
  if (calculateWinner(board) || isDraw(board)) {
    throw new Error('getAIMove: Game is already over');
  }

  const available = emptyCells(board);
  if (available.length === 0) {
    throw new Error('getAIMove: No available moves');
  }

  if (difficulty === 'random') {
    const r = Math.floor(Math.random() * available.length);
    return available[r];
  }

  // Optimal: minimax
  const currentMark = board.filter((c) => c !== null).length % 2 === 0 ? 'X' : 'O';
  const { move } = minimax(board, aiMark, currentMark);
  // Fallback safety
  if (move == null) {
    return available[0];
  }
  return move;
}
