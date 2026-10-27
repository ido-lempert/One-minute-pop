# Gameplay regression checks

Run from the repository root with Node 22+:

```sh
node tests/test.mjs
node tests/c4-controller.mjs
```

32 local logic checks cover rules, delayed computer callbacks, reset, mode switches, Undo and terminal states. Rendering and sound are stubbed. These tests do not prove visual quality, real-device performance, heard audio, installation or offline behavior.
