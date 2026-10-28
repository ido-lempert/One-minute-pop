Jet-ski demo web build (Godot 4.7.2 web export, release, threads disabled).
Serve this directory at a subpath (e.g. /jet-ski/) of the existing games Pages site.
Entry point: index.html. Requires no special HTTP headers (thread_support=false, so no COOP/COEP needed).
Mobile: touch controls in portrait/landscape; '?auto=1' URL param starts autopilot demo mode.
Attribution: see THIRD_PARTY_LICENSES.md (Grab3D jet-ski model, CC0).
Verified: native Linux staged runs of this exact build code (0 script errors; input/ammo/restart gates passed 06:52; hit-feedback pixel check 06:59). Browser/WASM runtime NOT yet functionally tested - test after deploy before sharing as playable. No phone-performance claims.
