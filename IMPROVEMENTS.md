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

## 8. Sculpted Connect Four rack

The Connect Four rack has rounded outer corners, capsule-shaped uprights, wide bevelled stabilizing feet, recessed screw heads and a rounded support rail. These replace box supports and a knife-edge rectangular plate; the42 holes stay genuinely open.

Checks:32 rules/controller regressions and real Chrome win/AI/reset; matched populated phone/desktop before/after images inspected.

## 9. Turned chess king crown and bevelled cross

Replaced the king's cylinder/sphere/box assembly with a turned royal mantle, shallow dome, twin metal bands, eight fluted accents and a softly bevelled heraldic cross with inset ceramic stones. The silhouette stays distinct from the open queen crown.

Checks:32 rules/controller regressions; real Chrome chess capture/reset/AI/undo/mode tests, zero errors/no390px overflow; matched phone/desktop pixels inspected.

## 10. Sculpted knight mane and bridle

A swept bevelled mane follows the horse neck instead of a rectangular block. Paired cheeks, nostrils, curved bridle straps, small buckles and a rounded nose band give the knight a readable face. These are real lit mesh details, not a texture or interface layer.

Checks:32 rules/controller regressions; actual Chrome chess capture/reset/AI/undo/mode, zero errors/no390px overflow; matched phone/desktop before/after pixels inspected.

## 11. Inlaid board frame and sculpted corner shoes

Chess/checkers boards gain continuous thin brass perimeter inlays and recessed lower metal rails. Sculpted bevelled corner shoes with slotted screw heads replace the floating gold beads. The frame reads as a built object while retaining clear coordinate labels.

Checks:32 regressions; real Chrome chess capture/reset/AI/undo/mode and checkers move/reset pass, zero errors/no390px overflow. Matched phone/desktop pixels inspected.

## 12. Modelled Connect Four ceramic tokens

Bevelled lathed discs replace plain cylinders. Both faces have raised metal rims and real three-dimensional snow/star or flame symbols instead of flat texture decals. Lit ceramic shoulders and recessed faces stay readable through the rack holes.

Checks:32 rules/controller regressions; actual Chrome Connect Four win/AI/reset, zero errors/no390px overflow; populated phone/desktop matched before/after pixels inspected.

## 13. Turned pawn collar, orb inlay and crest

Pawn heads now sit on a turned ceramic collar with a fine metal edge, rather than intersecting the generic body. A thin metal equator wraps the higher-resolution orb and a turned crest replaces the top bead. Their shorter silhouette remains clearly separate from bishops and royalty.

Checks:32 rules/controller regressions; actual Chrome chess capture/reset/AI/undo/mode, zero errors/no390px overflow; matched phone/desktop before/after pixels inspected.

## 14. Physical Connect Four tabletop and cast shadows

The rack now stands on a matte physical tabletop instead of floating against a solid background. A correctly bounded shadow camera captures the complete rack and feet, with bias tuned to avoid surface acne and distant fog blending into the backdrop. The true rack holes cast patterned shadows.

Checks:32 rules/controller regressions; actual Chrome Connect Four win/AI/reset, zero errors/no390px overflow; matched phone/desktop rendering inspected after the tabletop/fog revision.
