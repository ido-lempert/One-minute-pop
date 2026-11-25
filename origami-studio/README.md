# Origami Studio

A colorful PWA that teaches origami in 3D, one fold at a time.

- **Daily challenge** — a new model every day, with a streak counter.
- **See it first** — the finished model spins in 3D before you start; moving
  models actually move (the plane flies, the frog hops, the boat rocks).
- **Step-by-step 3D folds** — every step is a true fold animation: the paper
  rotates around the real crease line, and you can drag to spin and zoom the
  paper at any step.
- **Pick freely** — browse models by level and fold any of them; no need to
  finish one first. Progress is saved on the device.
- **PWA** — installable, works offline (service worker), no build step, no
  framework. three.js is vendored in `vendor/`.

## Run it

Any static file server from this folder, e.g.:

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## How it works

`src/engine.js` is a small 2D origami simulator: the paper is a set of
triangles; a fold is written the way instructions read ("move this corner to
that spot") and the engine derives the crease (perpendicular bisector),
splits triangles crossed by it, reflects the moving side and tracks layer
order and which side of the paper faces up. `src/viewer.js` (three.js)
renders a state and animates a fold by rotating the moved triangles around
the crease axis in 3D. Models are pure data in `src/models.js`.

`tools/render.js` renders every step of every model to SVG/HTML in
`out/` for quick visual checks without a browser:

```sh
node tools/render.js
```

## Models

| Model | Level | Folds |
| --- | --- | --- |
| Sky Dart (paper plane) | 1 | 6 |
| Little Heart | 1 | 5 |
| Pocket Sailboat | 1 | 3 |
| Bubble Fish | 2 | 3 |
| Clever Fox | 2 | 4 |
| Hopping Frog | 3 | 3 |

Add a model by appending a definition to `src/models.js` and running
`node tools/render.js` to check the fold sequence.
