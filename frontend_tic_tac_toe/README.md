# Tic Tac Toe (Frontend)

This React app implements a modern, responsive Tic Tac Toe game using the Ocean Professional theme.

Features:
- 3x3 grid, local two-player play (X then O)
- Win and draw detection (rows, columns, diagonals)
- Turn indicator and Restart button
- Error Boundary for resilient UX
- Minimal audit-style logs in console for moves and outcomes
- Unit tests for core game logic (calculateWinner, isDraw, validateMove, initBoard)

Design:
- Ocean Professional color palette with subtle shadows and rounded corners
- Centered board, controls beneath the board
- Responsive grid; accessible buttons with labels

Scripts:
- npm start
- npm test
- npm run build

Notes:
- No backend or external services
- Audit logs are console-only (ISO timestamps)
