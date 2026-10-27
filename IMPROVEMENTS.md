# Verified improvement ledger

The requested series starts after the a78e585 tabletop redesign. Entries count a shipped, tested user-facing improvement, not tool calls or commit count. Real-device FPS, heard audio and home-screen install are not claimed.

## 1. Chess move history

Readable move-numbered history with both sides, latest-row emphasis and automatic scroll. Uses real chess.js notation, including captures and checks. Undo and New game update the history.

Checks: existing32 controller/rules regressions; real Chrome legal moves and capture notation, Undo removes the corresponding move, New clears the list; phone layout inspected.

## 2. Restore the board view

Chess and checkers now have an accessible Reset view button that restores the starting camera after dragging. It changes only the camera, never the game position.

Checks: existing32 controller/rules regressions; actual Chrome drag -> projected square positions change -> Reset view returns original projection in both games; board state remains unchanged. Phone control inspected.
