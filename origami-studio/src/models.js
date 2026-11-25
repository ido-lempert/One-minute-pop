// models.js - origami model definitions.
// Folds are written like the instructions read: "move this corner/point to
// that spot"; the engine derives the crease. Coordinates are in paper units
// on the table (x right, y up), paper spans [0,w] x [0,h].
// mode 'top' folds only the top layer under the moving point (for flap folds).

export const MODELS = [
  {
    id: 'paper-plane',
    name: 'Sky Dart',
    kind: 'plane',
    level: 1,
    color: '#3b9df2',
    back: '#f4f9ff',
    ambient: 'fly',
    finalRotate: 180, // display nose forward
    w: 0.72, h: 1,
    blurb: 'The classic dart. Throw it and watch it glide!',
    steps: [
      {
        title: 'Corner to the middle',
        text: 'Fold the top-left corner down so the top edge lies on the center line.',
        folds: [{ move: [0, 1], to: [0.36, 0.64] }],
      },
      {
        title: 'Other corner too',
        text: 'Fold the top-right corner to the center line, matching the first side.',
        folds: [{ move: [0.72, 1], to: [0.36, 0.64] }],
      },
      {
        title: 'Sharpen the left',
        text: 'Fold the new slanted left edge to the center line.',
        folds: [{ move: [0, 0.64], to: [0.36, 0.491] }],
      },
      {
        title: 'Sharpen the right',
        text: 'Fold the slanted right edge to the center line as well.',
        folds: [{ move: [0.72, 0.64], to: [0.36, 0.491] }],
      },
      {
        title: 'Fold in half',
        text: 'Fold the whole plane in half along the center, flaps on the outside.',
        folds: [{ move: [0, 0.4], to: [0.72, 0.4] }],
      },
      {
        title: 'Wing down',
        text: 'Fold the top layer over to make a wing. Flip the plane and repeat on the back - then throw it!',
        folds: [{ move: [0.72, 0.5], to: [0.4, 0.5], mode: 'top' }],
      },
    ],
    // display pose: pre-wing state with the wing held half-raised, flight style
    display: { fromStep: 5, fold: { move: [0.72, 0.5], to: [0.4, 0.5], mode: 'top' }, theta: 1.9 },
  },
  {
    id: 'heart',
    name: 'Little Heart',
    kind: 'heart',
    level: 1,
    color: '#ef4565',
    back: '#fff0f3',
    ambient: 'bob',
    finalRotate: 180,
    w: 1, h: 1,
    blurb: 'A pocket heart for someone you like.',
    steps: [
      {
        title: 'Up and over',
        text: 'Fold the bottom edge up to the top edge.',
        folds: [{ move: [0.5, 0], to: [0.5, 1] }],
      },
      {
        title: 'Left corner up',
        text: 'Fold the bottom-left corner up to the middle of the top edge.',
        folds: [{ move: [0, 0.5], to: [0.5, 1] }],
      },
      {
        title: 'Right corner up',
        text: 'Fold the bottom-right corner up to the middle of the top edge.',
        folds: [{ move: [1, 0.5], to: [0.5, 1] }],
      },
      {
        title: 'Round the left',
        text: 'Fold the small top-left corner back a little to round the heart.',
        folds: [{ move: [0, 1], to: [0.14, 0.86] }],
      },
      {
        title: 'Round the right',
        text: 'Fold the small top-right corner back to match. Turn it over - a heart!',
        folds: [{ move: [1, 1], to: [0.86, 0.86] }],
      },
    ],
  },
  {
    id: 'sailboat',
    name: 'Pocket Sailboat',
    kind: 'boat',
    level: 1,
    color: '#00b3c7',
    back: '#effcfd',
    ambient: 'rock',
    finalRotate: 0,
    w: 1, h: 1,
    blurb: 'Bathtub-ready in four folds.',
    steps: [
      {
        title: 'Fold in half',
        text: 'Fold the bottom edge up to the top edge.',
        folds: [{ move: [0.5, 0], to: [0.5, 1] }],
      },
      {
        title: 'First sail',
        text: 'Fold the top-left corner down to the middle of the bottom edge (top layer only).',
        folds: [{ move: [0, 1], to: [0.5, 0.5], mode: 'top' }],
      },
      {
        title: 'Second sail',
        text: 'Fold the top-right corner down the same way (top layer only).',
        folds: [{ move: [1, 1], to: [0.5, 0.5], mode: 'top' }],
      },
    ],
  },
  {
    id: 'fish',
    name: 'Bubble Fish',
    kind: 'fish',
    level: 2,
    color: '#f6882f',
    back: '#fff6ec',
    ambient: 'swim',
    finalRotate: 45,
    w: 1, h: 1,
    details: [
      { kind: 'eye', at: [0.88, 0.14], r: 0.03 },
    ],
    blurb: 'It wiggles its tail when you tap it.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'Tail sweep',
        text: 'Fold the left corner across to the lower right - this becomes the tail.',
        folds: [{ move: [0, 1], to: [1.05, 0.2], mode: 'top' }],
      },
      {
        title: 'Fin flick',
        text: 'Fold the tip of the tail back out so the fin sticks out.',
        folds: [{ move: [1.05, 0.2], to: [0.82, 0.28], mode: 'top' }],
      },
    ],
  },
  {
    id: 'fox',
    name: 'Clever Fox',
    kind: 'fox',
    level: 2,
    color: '#e8632c',
    back: '#fdf3ec',
    ambient: 'bob',
    finalRotate: 225,
    startUp: false, // start colored-side down so the finished fox is orange, not white
    w: 1, h: 1,
    details: [
      { kind: 'eye', at: [0.6, 0.72], r: 0.026 },
      { kind: 'eye', at: [0.72, 0.6], r: 0.026 },
      { kind: 'dot', at: [0.9, 0.9], r: 0.022, color: '#22202a' },
    ],
    blurb: 'Ears out, nose down. Sly little face.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'Left ear',
        text: 'Fold the left corner down and out past the edge - that is the first ear.',
        folds: [{ move: [0, 1], to: [0.15, 0.55] }],
      },
      {
        title: 'Right ear',
        text: 'Fold the bottom corner down and out the same way for the second ear.',
        folds: [{ move: [1, 0], to: [0.55, 0.15] }],
      },
      {
        title: 'Nose',
        text: 'Fold the tip back a touch for the nose. Flip it over to see the face!',
        folds: [{ move: [1, 1], to: [0.88, 0.88], mode: 'top' }],
      },
    ],
  },
  {
    id: 'frog',
    name: 'Hopping Frog',
    kind: 'frog',
    level: 3,
    startUp: false, // colored side down, like real origami
    ambient: 'hop',
    finalRotate: 0,
    w: 1, h: 0.6,
    details: [
      { kind: 'eye', at: [0.32, 0.52], r: 0.032 },
      { kind: 'eye', at: [0.58, 0.52], r: 0.032 },
    ],
    color: '#3fbf5a',
    back: '#c8f0d0',
    blurb: 'Press its back and it really jumps.',
    steps: [
      {
        title: 'Long fold',
        text: 'Fold the bottom edge up to the top edge, making a long strip.',
        folds: [{ move: [0.5, 0], to: [0.5, 0.6] }],
      },
      {
        title: 'Back leg',
        text: 'Fold the whole left end down on a diagonal so it sticks out below - that is a back leg.',
        folds: [{ move: [0, 0.6], to: [0.4, 0.2] }],
      },
      {
        title: 'Other leg',
        text: 'Fold the right end down the same way. Press the frog’s back and watch it hop!',
        folds: [{ move: [1, 0.6], to: [0.6, 0.2] }],
      },
    ],
  },
  {
    id: 'butterfly',
    name: 'Flutter Butterfly',
    kind: 'butterfly',
    level: 1,
    startUp: false, // colored side down so the wings come out colored
    color: '#a855f7',
    back: '#f3e8ff',
    ambient: 'bob',
    finalRotate: 45,
    w: 1, h: 1,
    blurb: 'Two folds for wings that almost flap.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'First wing',
        text: 'Fold the left corner up past the top edge - that is one wing.',
        folds: [{ move: [0, 1], to: [0.3, 0.45] }],
      },
      {
        title: 'Second wing',
        text: 'Fold the bottom corner out the same way for the other wing.',
        folds: [{ move: [1, 0], to: [0.45, 0.3] }],
      },
      {
        title: 'Little head',
        text: 'Fold the tip between the wings back a touch for the head.',
        folds: [{ move: [1, 1], to: [0.9, 0.9], mode: 'top' }],
      },
    ],
  },
  {
    id: 'tulip',
    name: 'Spring Tulip',
    kind: 'tulip',
    level: 1,
    startUp: false,
    color: '#f43f5e',
    back: '#ffe4e6',
    ambient: 'bob',
    finalRotate: 225,
    w: 1, h: 1,
    blurb: 'A bright flower for the windowsill.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'First petal',
        text: 'Fold the left corner up past the top edge - that is one petal.',
        folds: [{ move: [0, 1], to: [0.3, 0.45] }],
      },
      {
        title: 'Second petal',
        text: 'Fold the bottom corner out the same way for the second petal.',
        folds: [{ move: [1, 0], to: [0.45, 0.3] }],
      },
    ],
  },
  {
    id: 'cat',
    name: 'Curious Cat',
    kind: 'cat',
    level: 1,
    startUp: false,
    color: '#f59e0b',
    back: '#fffbeb',
    ambient: 'bob',
    finalRotate: 225,
    w: 1, h: 1,
    blurb: 'Pointy ears, whiskers, the works.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'Left ear',
        text: 'Fold the left corner out a little so the ear sticks out.',
        folds: [{ move: [0, 1], to: [0.04, 0.86] }],
      },
      {
        title: 'Right ear',
        text: 'Fold the bottom corner out the same way for the other ear.',
        folds: [{ move: [1, 0], to: [0.86, 0.04] }],
      },
      {
        title: 'Chin',
        text: 'Fold the pointy chin back a touch to round the face.',
        folds: [{ move: [1, 1], to: [0.84, 0.84] }],
      },
    ],
    details: [
      { kind: 'eye', at: [0.58, 0.7], r: 0.028 },
      { kind: 'eye', at: [0.7, 0.58], r: 0.028 },
      { kind: 'dot', at: [0.72, 0.72], r: 0.02, color: '#f472b6' },
      { kind: 'line', pts: [[0.52, 0.76], [0.4, 0.8]], w: 0.005 },
      { kind: 'line', pts: [[0.52, 0.8], [0.4, 0.84]], w: 0.005 },
      { kind: 'line', pts: [[0.76, 0.52], [0.8, 0.4]], w: 0.005 },
      { kind: 'line', pts: [[0.8, 0.52], [0.84, 0.4]], w: 0.005 },
    ],
  },
  {
    id: 'swan',
    name: 'Graceful Swan',
    kind: 'swan',
    level: 2,
    color: '#f8fafc',
    back: '#bae6fd',
    ambient: 'bob',
    finalRotate: 0,
    w: 1, h: 1,
    blurb: 'Long neck, calm pond.',
    steps: [
      {
        title: 'Kite fold',
        text: 'Fold the bottom-right corner so the bottom edge lies on the diagonal.',
        folds: [{ move: [1, 0], to: [0.7071, 0.7071] }],
      },
      {
        title: 'Other side',
        text: 'Fold the top-left corner the same way, edge to the diagonal.',
        folds: [{ move: [0, 1], to: [0.7071, 0.7071] }],
      },
      {
        title: 'Fold in half',
        text: 'Fold the kite in half along the long diagonal.',
        folds: [{ move: [1, 0.35], to: [0.35, 1] }],
      },
      {
        title: 'Neck up',
        text: 'Fold the skinny point up at an angle - that is the neck.',
        folds: [{ move: [0, 0], to: [0.3, 0.42] }],
      },
      {
        title: 'Head',
        text: 'Fold the tip of the neck down a little for the head.',
        folds: [{ move: [0.3, 0.42], to: [0.34, 0.34], mode: 'top' }],
      },
    ],
  },
  {
    id: 'bat',
    name: 'Midnight Bat',
    kind: 'bat',
    level: 2,
    startUp: false,
    color: '#7c3aed',
    back: '#ede9fe',
    ambient: 'bob',
    finalRotate: 225,
    w: 1, h: 1,
    blurb: 'It only comes out at night.',
    steps: [
      {
        title: 'Big triangle',
        text: 'Fold the bottom-left corner up to the top-right corner.',
        folds: [{ move: [0, 0], to: [1, 1] }],
      },
      {
        title: 'Head',
        text: 'Fold the top corner down a little - that is the head between the ears.',
        folds: [{ move: [1, 1], to: [0.86, 0.86], mode: 'top' }],
      },
      {
        title: 'Left wing',
        text: 'Fold the left corner down and out to spread the wing.',
        folds: [{ move: [0, 1], to: [0.2, 0.35] }],
      },
      {
        title: 'Right wing',
        text: 'Fold the bottom corner out the same way.',
        folds: [{ move: [1, 0], to: [0.35, 0.2] }],
      },
    ],
    details: [
      { kind: 'eye', at: [0.7, 0.78], r: 0.02 },
      { kind: 'eye', at: [0.78, 0.7], r: 0.02 },
    ],
  },
];

export const LEVELS = [1, 2, 3];
export const LEVEL_NAMES = { 1: 'First folds', 2: 'Getting crafty', 3: 'Paper master' };

export function getModel(id) {
  return MODELS.find((m) => m.id === id);
}

// Deterministic daily pick: one model per calendar day, cycling the pool.
export function dailyModel(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return MODELS[day % MODELS.length];
}
