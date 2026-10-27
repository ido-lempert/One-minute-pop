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

## 15. Gravity-driven token drop and landing bounce

Connect Four tokens now fall from the top with gravity-like acceleration, a small landing bounce and an exact settled position instead of appearing instantly in their cell. Each token keeps its own animation across AI redraws; New clears pending animations. Wall-clock timing prevents slow rendering from stretching the fall indefinitely.

Checks:32 rules/controller tests genuinely pass (npm test exit0); actual Chrome win/AI/reset and phone/desktop fall/settle/reset sampling passed. Actual falling and settled rendered frames inspected. Software rendering samples establish motion/settling, not physical-phone smoothness.

Test reporting correction for12-14: the25 rules/chess/checker tests passed but7 C4 controller harness tests failed because token() was outside its sliced controller source. Real-browser C4 tests passed. The harness now provides its rendering/time stubs and all32 pass; this harness repair is not counted as a separate graphical improvement.

## 16. Woven felt tabletop mat for chess and checkers

A rounded, physical felt mat now supports the board: deterministic woven bump texture, rough cloth material, a fine instanced stitched border and received shadows. Updated framing includes the mat so the lower seam is not cut off. Shared by chess and checkers.

Checks:32 rules/controller tests passed exit0. Chrome chess capture/reset/AI/undo/mode and checkers move/reset-cancellation passed exit0, zero page errors/no390px overflow. Before/after phone and desktop inspected; final phone chess/checkers framing inspected.

## 17. Distinctive knight leap and grounded chess glides

Knights now leap high over pieces with a restrained rocking motion and exact upright landing. Other chess pieces glide close to the board instead of all using the same hop. The moving contact shadow stays on the board and softens as the knight rises. Checkers keep their existing hop.

Checks:32 rules/controller tests exit0; ordinary Chrome chess/checkers lifecycle exit0, zero errors/no390px overflow. Deterministic-step rendered trajectory check: knight apex1.478 then exact .03 and zero tilt, pawn maximum .094. Actual leap/settled pixels inspected. Deterministic rendering is not evidence of physical-phone FPS. A stone-texture experiment was discarded before publication and does not count.

## 18. Modelled Connect Four victory laurels

The four winning discs receive lit metal laurel leaves and a fine gold ring within the rack holes, replacing large flat white outline rings. Winning discs have a restrained emissive material while other discs become muted and matte. The winner status now uses the winner's color instead of the next turn's color.

Checks:32 rules/controller tests exit0; actual Chrome Connect Four win/reset/AI exit0, zero errors/no390px overflow. Phone/desktop rendered victory inspected after adjusting leaves to fit inside holes. Decorator rendering is covered by browser tests; sliced controller harness stubs the decorator and does not test its geometry.

## 19. Refined turned ceramic chess pedestals

Rebuilt the shared pedestal profile with more closely spaced turning transitions, a rounder foot and neck and two fine metal rails instead of one thick generic ring. Applies across the chess set without changing piece silhouettes. A bead-relief experiment was removed before release to keep the ceramic clean.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched phone/desktop board pixels and dedicated before/after four-piece model views inspected. The model close-up is a test studio, not a live board screenshot.

## 20. Reeded ceramic checker edges

Added 32 rounded ceramic grip reeds around the stepped edges of each checker, with fine metal boundary rails. Kings retain their sculpted crown and stacked silhouette. One instanced mesh per piece keeps the new detail economical.

Checks:32 rules/controller tests exit0; Chrome checkers move/reset-cancellation exit0, zero errors/no390px overflow. Dedicated before/after normal/king model studio and phone/desktop board pixels inspected. Physical-device FPS remains unverified.

## 21. Studio reflection environment for Connect Four

Added a prefiltered studio environment to the Connect Four scene, bringing soft reflection cards into the glazed ceramic discs, rack and metal trim instead of leaving the reflective surfaces without an environment. Temporary environment geometry and generator are disposed after baking. Existing directional lighting/shadows remain.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero page errors/no390px overflow. Matched before/after phone board and final phone/desktop pixels inspected; reflection strength tuned down before release. Physical-device FPS remains unverified.

## 22. Recessed ceramic Connect Four catch tray

Replaced the solid plain bottom bar with a rounded open ceramic tray: a real inset opening, lower teal bed and29 fine physical ribs. The supported tray sits below the lowest playable row and preserves the existing rack feet and controls.

Checks:32 rules/controller tests exit0. Chrome C4 win/reset-cancellation/AI exit0, zero errors/no390px overflow. Actual final phone/desktop pixels inspected against the prior solid bar. Physical-device FPS remains unverified.

## 23. Paired sculpted knight ears and rounded muzzle

Replaced the knight's single extruded spike with two separated bevelled ears, each with a metal inset, and a rounded ceramic muzzle. The softened head outline keeps the existing mane/bridle and recognizable side-specific horse silhouette.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero errors/no390px overflow. Before/after four-knight studio and final phone/desktop board pixels inspected. Studio views are model tests, not live boards. Physical-device FPS remains unverified.

## 24. Open ceramic Connect Four loading funnels

Added seven open elliptical ceramic loading funnels across the rack's top edge, with thin metal lips. The flared walls give each playable column a real top opening instead of ending the model at a flat edge. The narrow depth keeps the openings aligned with the disc plane.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero errors/no390px overflow. Final phone/desktop pixels inspected. Physical-device FPS remains unverified.

## 25. Sculpted rook tower buttresses

Four swept ceramic buttresses now support the rook tower between the foot and crown. The bevelled supports replace a plain cylindrical shaft silhouette while preserving the hollow courtyard, battlements and inset shields. Shared cached geometry is used across all rooks.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-rook studio before/after and final phone/desktop board pixels inspected. Studio images are model tests, not live boards. Physical-device FPS remains unverified.

## 26. Kiln-glazed ceramic board tiles

Chess and checkers tiles now use a deterministic ceramic roughness/bump map with broad glaze variation and fine pores. The satin finish breaks up the previously uniform plastic reflections while preserving tile colors, bevels and clear legal-move markers. One small generated texture is shared across both tile materials.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode and checkers move/reset-cancellation exit0, zero page errors/no390px overflow. Matched desktop before/after, final phone chess/checkers and desktop chess pixels inspected. Physical-device FPS remains unverified.
