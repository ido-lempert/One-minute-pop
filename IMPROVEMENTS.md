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

## 27. Stitched felt runner beneath Connect Four

A rounded woven felt runner now cushions the rack and catches its contact shadows. Fine instanced stitches follow its border, bringing the same tabletop material language as chess/checkers to Connect Four. Camera fitting includes the runner so its edge stays visible on narrow screens.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero errors/no390px overflow. Final phone/desktop pixels inspected against the previous bare tabletop. Physical-device FPS remains unverified.

## 28. Swept bishop stole inlays

Paired ceremonial metal stole ribbons now follow the bishop's turned ceramic shoulders and stem on both sides, with small rounded end details. The surface-fitted ribbon geometry adds recognizable bishop detail without changing the diagonal mitre opening or footprint.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-bishop studio before/after and final phone/desktop board pixels inspected. Studio images are model tests, not live boards. Physical-device FPS remains unverified.

## 29. Petalled ceramic queen mantle

Eight bevelled petal panels now wrap the queen mantle below its open crown. The raised ceramic relief replaces the plain neck with a layered sculpted silhouette while retaining the recessed crown and metal insets. The panel geometry is cached and shared across queens.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-queen studio before/after and final phone/desktop board pixels inspected. Studio images are model tests, not live boards. Physical-device FPS remains unverified.

## 30. Swept ceramic rack braces

Four rounded ceramic braces now sweep from the Connect Four uprights down to the feet, front and back. The supports add structural side depth to the toy rack without covering playable holes or changing its footprint. Shared bevelled geometry catches the studio lighting and casts real shadows.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero page errors/no390px overflow. Matched local desktop before/after and final phone board pixels inspected. Physical-device FPS remains unverified.

## 31. Layered flowing knight manes

Seven overlapping bevelled locks now follow the knight's rear neck, breaking the smooth metal slab into a flowing mane silhouette. Shared curved extrusions add real relief and light-catching edges without changing the horse face or bridle.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-knight studio before/after and final phone/desktop board pixels inspected. Studio images are model tests, not live boards. Physical-device FPS remains unverified.

## 32. Scalloped checker king tiers

Twelve rounded ceramic lobes now shape the checker king's raised disc into a scalloped royal tier. The upper level is distinct from the normal reeded disc and retains its metal belt and open crown. Shared lathed geometry adds physical relief without changing normal pieces.

Checks:32 rules/controller tests exit0. Chrome checkers move/reset-cancellation exit0, zero page errors/no390px overflow. Matched normal/king studio before/after and phone/desktop board pixels inspected using an explicit all-kings test fixture, not the normal opening. Physical-device FPS remains unverified.

## 33. Satin ash veneer board perimeter

The chess/checkers perimeter deck now uses fine deterministic ash grain, satin clearcoat and shallow wood bump beneath the brass inlay. The warm natural material replaces the flat yellow surface while preserving coordinate labels and sculpted corner hardware. The generated texture is shared by the frame.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode and checkers move/reset-cancellation exit0, zero page errors/no390px overflow. Matched desktop before/after and final phone board pixels inspected. Physical-device FPS remains unverified.

## 34. Arched metal king crown

Four raised metal arches now follow the chess king's ceramic dome from the royal band to a small cross seat. The curved ribs replace the plain dome with a traditional closed-crown silhouette, retaining the ceramic body and heraldic cross. One cached tube geometry is shared by all kings.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-king studio before/after and final phone/desktop board pixels inspected. Studio views are model tests, not live boards. Physical-device FPS remains unverified.

## 35. Sculpted crystal and open flame token emblems

Connect Four ivory discs now carry forked snow-crystal branches instead of plain six-spoke marks. Coral discs gain a real cut-through flame center with bevelled walls. The raised metal shapes remain visible on both token faces and use shared geometry.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero page errors/no390px overflow. Matched four-token studio before/after and final played phone/desktop board pixels inspected. Studio views are model tests, not live boards. Physical-device FPS remains unverified.

## 36. Sculpted ceramic pawn calyx

A continuous six-lobed ceramic calyx now cradles each pawn orb above the turned collar. The smooth radial relief replaces the plain supporting neck without changing the pawn footprint or metal equator. A cached normal-smoothed mesh is shared across pawns. An initial separate-petal experiment was rejected during visual review before publication.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-pawn studio before/after and final phone/desktop board pixels inspected. Studio views are model tests, not live boards. Physical-device FPS remains unverified.

## 37. Lit inlaid move markers

Chess/checkers move destinations now combine large pale mint discs with physically lit rings. Amber inlays mark selection and the last move. Saturated orange rings and four corner tabs distinguish occupied capture targets, remaining visible around a piece at phone size. The first published small-ring variant was corrected before counting this iteration because it reduced move discovery. Both legends now call these mint rings.

Checks:32 rules/controller tests exit0. Separate Chrome chess capture/reset/AI/undo/mode and checkers move/reset-cancellation checks exit0, zero page errors/no390px overflow. Matched phone selection before/after, played chess capture position, chess desktop and checkers phone pixels inspected. Physical-device FPS remains unverified.

## 38. Turned ceramic rack columns

Connect Four's plain capsule uprights are now shaped lathe columns with tapered shafts, widened ceramic feet/capitals and thin metal collars. The change gives the rack a built tabletop silhouette without obscuring the42 playable holes or seven loading funnels.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero page errors/no390px overflow. Matched played desktop before/after and final phone pixels inspected. Physical-device FPS remains unverified.

## 39. Open metal checker rosettes

Ordinary checker faces now carry eight raised teardrop petals with real cut-through centers and a low central boss, replacing the solid star stamp. Shared bevelled geometry catches light around the open petals; body, grip and royal crown silhouettes remain unchanged.

Checks:32 rules/controller tests exit0. Chrome checkers move/reset-cancellation exit0, zero page errors/no390px overflow. Matched four-disc studio before/after and phone/desktop board pixels inspected. Studio is a model test, not a live board. Physical-device FPS remains unverified.

## 40. Fluted ceramic chess stems

Eight broad radial flutes are now sculpted directly into the shared chess stem, fading into the neck and foot collars. Normal-smoothed shared geometry replaces the plain turned surface on pawns, knights, bishops, queens and kings, without adding separate floating ribs. Rook and checker meshes are unchanged.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode exit0, zero page errors/no390px overflow. Matched four-piece studio before/after and final phone/desktop board pixels inspected. Studio is a model test, not a live board. Physical-device FPS remains unverified.

## 41. Turned ceramic aperture rims

Connect Four's inflated donut surrounds are replaced by turned ceramic rims with a broad shoulder, recessed inner wall and narrow lip. The opening reads wider and reveals more of the token face; the rack retains its42 real cut-through holes. Rejected shadow-filter and hidden-sleeve experiments were not published or counted.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI exit0, zero page errors/no390px overflow. Matched played desktop before/after and phone pixels inspected. Physical-device FPS remains unverified.

## 42. Curved rook battlements

Rook crown blocks now follow the circular tower wall as curved annular ceramic merlons, rather than rectangular blocks projecting outside it. Bevelled edges catch light around the continuous outside curve while six gaps and the hollow courtyard remain open. The change is clearest in the model studio and modest at phone board scale. Rejected contact-shadow experiments were reverted and not counted.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode lifecycle exit0, zero page errors/no390px overflow. Matched local studio before/after and actual390px/desktop board pixels inspected. Physical-device FPS remains unverified.

## 43. Rounded bishop mitre

The bishop mitre now has a rounded lens-shaped ceramic front and back instead of parallel slab faces. Subdivided cap triangles and shared smooth normals provide continuous highlights; the genuine diagonal slot remains open. Face jewels were moved outward to remain seated on the new surface. The change is clearest in studio close-ups and subtle at phone board scale. The initial faceted experiment was rejected.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode lifecycle exit0, zero page errors/no390px overflow. Matched local studio before/after and390px/desktop board pixels inspected. Physical-device FPS remains unverified.

## 44. Flared Connect Four loading funnels

Seven straight loading tubes become open flared ceramic funnels with turned shoulders and raised metal lips. Each funnel is separate from its neighbors; a too-wide experiment was narrowed before release. Camera fitting includes the taller rim. All42 cut-through rack apertures are unchanged.

Checks:32 rules/controller tests exit0. Chrome Connect Four win/reset-cancellation/AI lifecycle exit0, zero page errors/no390px overflow. Matched desktop before/after and390px played board pixels inspected. Physical-device FPS remains unverified.

## 45. Open heraldic checker crown points

Checker king crown points now have curved heraldic shoulders and genuine cut-through oval centers instead of plain tapered posts. Raised ceramic tips follow the taller silhouette. Ordinary discs are unchanged. Detail is clearest in studio; promoted silhouette remains clear at board scale.

Checks:32 rules/controller tests exit0. Chrome checkers move/reset-cancellation lifecycle exit0, zero page errors/no390px overflow. Matched studio before/after and390px/desktop all-kings fixture pixels inspected (fixture, not opening position). Physical-device FPS remains unverified.

## 46. Sculpted knight eyes

The knight's plain black beads become inset almond-shaped eyes with metal irises, dark pupils, tiny ceramic highlights and raised ceramic upper lids. Both sides are modelled. The change is clearest in studio close-ups and subtle at normal phone board scale; the horse silhouette is unchanged.

Checks:32 rules/controller tests exit0. Chrome chess capture/reset/AI/undo/mode lifecycle exit0, zero page errors/no390px overflow. Matched studio before/after and390px/desktop board pixels inspected. Physical-device FPS remains unverified.

## 47. Sculpted Connect Four sled feet
The support feet now have a curved narrow-waisted footprint, crowned ceramic tops and thin metal soles rather than flat rounded rectangular slabs. Matched local before/after and390px played screenshots inspected.32 local tests and Connect Four win/reset/AI lifecycle pass; live verification follows publication. Phone-scale difference is modest; physical-device FPS unverified.

## 48. Pierced heraldic king cross
The square-ended cross becomes a flared heraldic cross with curved shoulders and a real center opening. Small ceramic jewels sit above the opening on both faces. Matched studio before/after and390px selected-pawn board inspected, with clear king silhouette and legal destinations.32 rules/controller tests and local chess capture/reset/AI/undo/mode pass, zero errors/no overflow. Detail is clearest close-up; physical-device FPS unverified.

## 49. Forged board corner guards
Four L-shaped forged metal guards now wrap both perimeter rails, replacing the square plates. Screws sit on the outer bends, outside coordinates and tiles. Matched local desktop and390px board inspected.32 rules/controller tests plus local chess and checkers lifecycle pass, zero errors/no390px overflow. Physical-device FPS unverified.

## 50. Curved victory laurel leaves
Connect Four victory laurels now use pointed curved metal leaf surfaces with raised midribs, replacing ellipsoid beads. The wreath remains around actual winning tokens, with center symbols visible. Matched winning-position desktop before/after and390px pixels inspected.32 rules/controller tests and local C4 win/reset/AI lifecycle pass, zero errors/no390px overflow. Physical-device FPS unverified.

## 51. Turned queen crown finials
The open queen crown has eight turned ceramic teardrop finials, slightly splayed outward, replacing round beads. Matched studio before/after and390px board inspected, with distinct queen/king silhouettes.32 rules/controller tests and local chess capture/reset/AI/undo/mode lifecycle pass, zero errors/no overflow. Detail is clearest close-up; physical-device FPS unverified.

## 52. Heraldic rook shields
Four oval shaft beads become raised metal shields with curved shoulders, pointed bases and recessed ceramic centers. Matched studio before/after and390px board inspected.32 rules/controller tests and local chess capture/reset/AI/undo/mode lifecycle pass, zero errors/no overflow. Tiny at board scale; physical-device FPS unverified.

## 53. Swept lacquer board apron
The two flat under-board slabs become one continuous sculpted ogee apron with a rounded outward lip and inward waist. The turquoise lacquer edge is visible outside the dark upper plinth. Matched desktop before/after and390px board inspected.32 rules/controller tests and local chess/checkers lifecycle pass, zero errors/no overflow. Physical-device FPS unverified.

## 54. Fluted rack columns
Connect Four support columns now have eight ceramic flutes, gently swept along the long shaft and fading into the foot and capital. Matched desktop before/after and390px played board inspected.32 rules/controller tests and local C4 win/reset/AI lifecycle pass, zero errors/no overflow. Physical-device FPS unverified.

## 55. Rounded knight neck and cheeks
The horse's flat extruded side becomes a subdivided curved ceramic neck and cheek. Eyes, bridle and buckles sit outside the new surface rather than sinking into it. Matched studio before/after and390px board inspected.32 rules/controller tests and local chess capture/reset/AI/undo/mode lifecycle pass, zero errors/no overflow. Detail clearest in studio; physical-device FPS unverified.

## 56. Turned checker crown finials
The promoted checker crown's round beads become turned ceramic teardrop finials, tilted slightly outward. Matched studio before/after and390px crowned-position board inspected.32 rules/controller tests and local checkers move/reset lifecycle pass, zero errors/no overflow. Detail tiny at board scale; physical-device FPS unverified.

## 57. Soft kiln glaze
Shared chess/checker ceramic uses procedural broad glaze roughness and fine pores, reducing hard plastic hotspots while leaving metal trim intact. Matched studio before/after and390px chess/crowned-checker pixels inspected.32 rules/controller tests and separate local chess/checker lifecycles pass, zero errors/no overflow. Physical-device FPS unverified.

## 58. Scalloped Connect Four token edges
The plain ceramic token edge becomes a smoothly sampled24-lobed minted edge, with flat recessed faces and raised emblems preserved. Matched token studio before/after and390px played-board pixels inspected.32 rules/controller tests and local C4 win/reset/AI lifecycle pass, zero errors/no overflow. Edge detail is tiny in the rack; physical-device FPS unverified.

## 59. Lobed ceramic loading funnels
Twelve gentle ceramic lobes run from each C4 funnel throat towards its lip, replacing the smooth conical surface while preserving its open throat and metal lip. Matched desktop before/after and390px played-board inspected.32 rules/controller tests and local C4 win/reset/AI lifecycle pass, zero errors/no overflow. Modest detail; physical-device FPS unverified.

## 60. Fluted rook tower shafts
Twelve gentle ceramic flutes sculpt the rook shaft between foot and crown. Shield insets are raised to clear the new surface. Matched rook studio before/after and390px board inspected.32 rules/controller tests and local chess capture/reset/AI/undo/mode pass, zero errors/no overflow. Detail subtle at board scale; physical-device FPS unverified.

## 61. Fluted royal dome
The chess king ceramic dome has eight recessed curved flutes between its metal arches instead of a plain hemisphere. Matched studio before/after and390px board inspected.32 rules/controller tests and local chess capture/reset/AI/undo/mode pass, zero errors/no overflow. Very subtle at board scale; physical-device FPS unverified.

## 62. Bevelled checker inlays
The ordinary checker rosette and eight surrounding beads now use bevelled octagonal metal settings rather than flattened spheres. Matched studio before/after and390px/desktop board inspected.32 rules/controller tests and local checkers move/reset lifecycle pass, zero errors/no overflow. Tiny at board scale; physical-device FPS unverified.
