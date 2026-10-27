# Verified improvement ledger

The requested series starts after the a78e585 tabletop redesign. Entries count a shipped, tested user-facing improvement, not tool calls or commit count. Real-device FPS, heard audio and home-screen install are not claimed.

## 1. Chess move history

Readable move-numbered history with both sides, latest-row emphasis and automatic scroll. Uses real chess.js notation, including captures and checks. Undo and New game update the history.

Checks: existing32 controller/rules regressions; real Chrome legal moves and capture notation, Undo removes the corresponding move, New clears the list; phone layout inspected.

## Unnumbered usability maintenance

Reset view restores the starting camera after dragging in chess and checkers, without changing the position. Added before the user's graphics-priority correction; not counted toward graphical improvement2.

## 2. Sculpted board edges

Replaced sharp box tiles and frame layers with actual rounded, bevelled 3D geometry in chess and checkers. Tile shoulders and rounded corners catch light; layered frame edges have continuous shaped highlights instead of knife-edge boxes. Tile glaze has controlled roughness for legible light falloff. Existing ivory/coral pieces and lighting remain unchanged for a direct comparison.

Checks:32 existing rules/controller tests; real Chrome both boards load with no errors and no phone overflow, legal move and camera/reset checks. Before/after captures at matching390px and1280px sizes inspected.

## 3. Sculpted hollow rook towers

Rooks have their own tapered tower body rather than the generic chess stem, an actually hollow crown with a recessed dark courtyard, soft bevelled battlements, metal collars and small shield accents. This changes silhouette and depth, not interface.

Checks:32 existing rules/controller tests, real Chrome chess capture/AI/Undo/mode/reset, before/after desktop and phone rendering inspected. Real-device performance remains untested.

## 4. Open-slit bishop mitres

Replaced the stacked sphere/cone bishop head and painted slash with one curved, bevelled mitre silhouette containing a real diagonal opening. A metal collar and inset face jewel complete the model. Both sides keep consistent readable shapes.

Checks:32 existing rules/controller tests and real Chrome chess lifecycle regression; matched desktop/phone rendering inspected. This is model geometry, not an interface change.

## 5. Open royal queen crowns

Replaced the queen's solid cylinder and ball cluster with an open crown: curved metal prongs, scalloped band, recessed interior, ceramic tips and inset faceted stones. A distinct mantle supports the crown, keeping its silhouette separate from the king.

Checks:32 existing rules/controller tests and real Chrome chess lifecycle regression; before/after desktop and phone pixels inspected.

## 6. Sculpted checker discs

Checker pieces now have a double-ridged side profile, recessed ceramic face, raised eight-point metal seal and eight small metal inlays, replacing the plain flat metal center. Rounded shoulders and varied materials catch real light at board scale. King logic is unchanged.

Checks:32 rules/controller regressions and real Chrome legal checker move/reset, no errors or phone overflow. Matched before/after and phone rendering inspected.

## 7. Crowned double-stack checker kings

Promoted checkers get a second sculpted disc and an open five-point metal crown with ceramic tips, replacing the tiny cylinder/bead marker. The taller silhouette makes kings visually distinct even without color.

Checks:32 rules/controller regressions; actual Chrome near-promotion fixture promotes via legal pointer move, crown geometry inspected in phone/desktop fixture views; normal move/reset still pass.
