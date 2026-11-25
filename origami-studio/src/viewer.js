// viewer.js - three.js rendering of paper states and fold animations.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { T, applyFold, bounds } from './engine.js';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
const norm2 = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
function pointInTri2(p, t) {
  const s = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  const sg = s(t[0], t[1], t[2]) >= 0 ? 1 : -1;
  return sg * s(t[0], t[1], p) >= -1e-9 && sg * s(t[1], t[2], p) >= -1e-9 && sg * s(t[2], t[0], p) >= -1e-9;
}

export class FoldViewer {
  constructor(container, model) {
    this.model = model;
    this.container = container;
    this.front = new THREE.Color(model.color);
    this.back = new THREE.Color(model.back || '#ffffff');
    this.ambient = 'none';
    this._animToken = 0;
    this._time = 0;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8890ff, 1.05);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.6);
    dir.position.set(1.6, 3.2, 1.2);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = dir.shadow.camera.bottom = -2;
    dir.shadow.camera.right = dir.shadow.camera.top = 2;
    dir.shadow.radius = 5;
    dir.shadow.bias = -0.0004;
    dir.shadow.normalBias = 0.02;
    this.scene.add(dir);

    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(3, 48),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.002;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.spin = new THREE.Group(); // display rotation / finalRotate
    this.pose = new THREE.Group(); // ambient motion
    this.spin.add(this.pose);
    this.scene.add(this.spin);

    this.edges = null;      // crease/boundary line overlay
    this.guide = null;      // per-step fold guide group
    this._guideAnims = [];  // traveling dots on guide arrows
    this.detailGroup = null; // face/feature decals on the finished model

    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.FrontSide,
      shadowSide: THREE.DoubleSide,
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI * 0.55;

    const qp = new URLSearchParams(location.search);
    if (qp.has('noshadow')) dir.castShadow = false;
    if (qp.has('flat')) this.material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.FrontSide });
    if (qp.has('debug')) this._dbg = true;

    this._resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    };
    new ResizeObserver(this._resize).observe(container);
    this._resize();

    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  dispose() {
    this.controls.dispose();
    this.renderer.dispose();
    this.container.innerHTML = '';
  }

  // paper coords -> three coords: paper x -> x, paper y -> -z, layer -> +y
  _center(state) {
    const b = bounds(state);
    return [b.cx, b.cy];
  }

  _buildGeometry(tris, posOf) {
    // posOf(triIndex, vertIndex) -> [x,y,z] in three space
    const n = tris.length;
    const positions = new Float32Array(n * 6 * 3);
    const colors = new Float32Array(n * 6 * 3);
    let o = 0;
    for (let ti = 0; ti < n; ti++) {
      const t = tris[ti];
      const p = [posOf(ti, 0), posOf(ti, 1), posOf(ti, 2)];
      const cf = t.up ? this.front : this.back; // colored side is the CCW (right-hand) side
      const cb = t.up ? this.back : this.front;
      // front-facing copy (a,b,c) colored cf, back-facing copy (a,c,b) colored cb
      positions.set([...p[0], ...p[1], ...p[2]], o * 3);
      colors.set([cf.r, cf.g, cf.b, cf.r, cf.g, cf.b, cf.r, cf.g, cf.b], o * 3);
      o += 3;
      positions.set([...p[0], ...p[2], ...p[1]], o * 3);
      colors.set([cb.r, cb.g, cb.b, cb.r, cb.g, cb.b, cb.r, cb.g, cb.b], o * 3);
      o += 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }

  _setMesh(geo) {
    if (this.mesh) {
      this.pose.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false; // receiving causes self-shadow acne on the thin paper
    this.pose.add(this.mesh);
  }

  // Thin dark lines along every flap edge: these ARE the crease marks, and
  // they make the folded layers readable at a glance.
  _setEdges(tris, posOf) {
    if (this.edges) {
      this.pose.remove(this.edges);
      this.edges.geometry.dispose();
      this.edges = null;
    }
    if (!tris) return;
    // Only edges where the layer changes are real crease/flap boundaries;
    // same-layer edges are just triangulation artifacts and stay invisible.
    const k2 = (x, z) => `${x.toFixed(4)},${z.toFixed(4)}`;
    const edgeMap = new Map(); // key -> {layers:Set, a:[3], b:[3], y}
    for (let i = 0; i < tris.length; i++) {
      const p = [posOf(i, 0), posOf(i, 1), posOf(i, 2)];
      const layer = tris[i].layer ?? 0;
      for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
        const kA = k2(p[a][0], p[a][2]), kB = k2(p[b][0], p[b][2]);
        const key = kA < kB ? `${kA}|${kB}` : `${kB}|${kA}`;
        let e = edgeMap.get(key);
        if (!e) { e = { layers: new Set(), a: p[a], b: p[b], y: Math.max(p[a][1], p[b][1]) }; edgeMap.set(key, e); }
        e.layers.add(layer);
        e.y = Math.max(e.y, p[a][1], p[b][1]);
      }
    }
    const pts = [];
    for (const e of edgeMap.values()) {
      if (e.layers.size < 2) continue;
      pts.push(e.a[0], e.y + 0.0007, e.a[2], e.b[0], e.y + 0.0007, e.b[2]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    this.edges = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: 0x3b3244, transparent: true, opacity: 0.34 })
    );
    this.pose.add(this.edges);
  }

  _clearGuide() {
    if (this.guide) {
      this.pose.remove(this.guide);
      this.guide.traverse((o) => { o.geometry?.dispose?.(); });
      this.guide = null;
    }
    this._guideAnims = [];
  }

  // Draw the fold marks for the step about to be folded: a dashed crease
  // line where the paper bends, plus an arrow (with a dot travelling along
  // it) from the point being moved to where it should land.
  showGuide(folds) {
    this._clearGuide();
    const state = this.currentState;
    if (!state || !folds || !folds.length) return;
    const [cx, cy] = this._center(state);
    const b = bounds(state);
    const topY = Math.max(0, ...state.tris.map((t) => t.layer)) * T;
    const yLine = topY + 0.006;
    this.guide = new THREE.Group();
    const dashMat = new THREE.LineDashedMaterial({ color: 0xc2185b, dashSize: 0.03, gapSize: 0.013 });
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xd92662 });

    for (const f of folds) {
      const spec = f.spec || f;
      const n = norm2(sub2(spec.move, spec.to));
      const m = [(spec.move[0] + spec.to[0]) / 2, (spec.move[1] + spec.to[1]) / 2];
      const d = [-n[1], n[0]]; // crease direction
      // clip the crease line to the paper bounds box
      let t0 = -3, t1 = 3;
      for (let axis = 0; axis < 2; axis++) {
        if (Math.abs(d[axis]) < 1e-9) continue;
        const lo = ((axis ? b.minY : b.minX) - m[axis]) / d[axis];
        const hi = ((axis ? b.maxY : b.maxX) - m[axis]) / d[axis];
        t0 = Math.max(t0, Math.min(lo, hi));
        t1 = Math.min(t1, Math.max(lo, hi));
      }
      const pad = 0.03;
      const A = [m[0] + d[0] * (t0 - pad), m[1] + d[1] * (t0 - pad)];
      const B = [m[0] + d[0] * (t1 + pad), m[1] + d[1] * (t1 + pad)];
      const lgeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(A[0] - cx, yLine, -(A[1] - cy)),
        new THREE.Vector3(B[0] - cx, yLine, -(B[1] - cy)),
      ]);
      const line = new THREE.Line(lgeo, dashMat);
      line.computeLineDistances();
      this.guide.add(line);

      // arrow from move -> to, arcing up like the paper lifts
      const mv = new THREE.Vector3(spec.move[0] - cx, yLine, -(spec.move[1] - cy));
      const tv = new THREE.Vector3(spec.to[0] - cx, yLine + 0.004, -(spec.to[1] - cy));
      const lift = 0.05 + mv.distanceTo(tv) * 0.25;
      const ctrl = mv.clone().lerp(tv, 0.5).add(new THREE.Vector3(0, lift, 0));
      const curve = new THREE.QuadraticBezierCurve3(mv, ctrl, tv);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0045, 6, false), arrowMat);
      this.guide.add(tube);
      const tip = curve.getTangent(1).normalize();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.04, 10), arrowMat);
      cone.position.copy(tv);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip);
      this.guide.add(cone);
      // a bright dot sliding along the arrow, so the direction reads instantly
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
      this.guide.add(dot);
      // a soft ring marking the point to pick up
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.018, 0.026, 24), new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(mv);
      this.guide.add(ring);
      this._guideAnims.push({ curve, dot, ring });
    }
    this.pose.add(this.guide);
  }

  // Face/feature decals for the finished model (eyes, noses, ...), placed on
  // the top layer of the final flat state. Skipped for posed displays.
  _showDetails(state) {
    if (this.detailGroup) {
      this.pose.remove(this.detailGroup);
      this.detailGroup.traverse((o) => { o.geometry?.dispose?.(); });
      this.detailGroup = null;
    }
    const ds = this.model.details;
    if (!ds || !ds.length) return;
    const [cx, cy] = this._center(state);
    const topAt = (p) => {
      let best = 0;
      for (const t of state.tris) {
        const pts = t.v.map((i) => state.pts[i]);
        if (pointInTri2(p, pts)) best = Math.max(best, t.layer);
      }
      return best * T + 0.006;
    };
    this.detailGroup = new THREE.Group();
    const flat = (geo, x, y, z) => {
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: z }));
      return mesh;
    };
    for (const d of ds) {
      if (d.kind === 'eye') {
        const y = topAt(d.at);
        const eye = flat(new THREE.CircleGeometry(d.r, 20), 0, 0, 0x22202a);
        eye.position.set(d.at[0] - cx, y, -(d.at[1] - cy));
        this.detailGroup.add(eye);
        const glint = flat(new THREE.CircleGeometry(d.r * 0.35, 12), 0, 0, 0xffffff);
        glint.position.set(d.at[0] - cx + d.r * 0.3, y + 0.0012, -(d.at[1] - cy) - d.r * 0.3);
        this.detailGroup.add(glint);
      } else if (d.kind === 'dot') {
        const y = topAt(d.at);
        const dot = flat(new THREE.CircleGeometry(d.r, 16), 0, 0, new THREE.Color(d.color || '#22202a'));
        dot.position.set(d.at[0] - cx, y, -(d.at[1] - cy));
        this.detailGroup.add(dot);
      } else if (d.kind === 'line') {
        const [a2, b2] = d.pts;
        const y = Math.max(topAt(a2), topAt(b2));
        const len = Math.hypot(b2[0] - a2[0], b2[1] - a2[1]);
        const geo = new THREE.PlaneGeometry(len, d.w || 0.006);
        geo.rotateX(-Math.PI / 2);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(d.color || '#22202a') }));
        mesh.position.set((a2[0] + b2[0]) / 2 - cx, y, -((a2[1] + b2[1]) / 2 - cy));
        mesh.rotation.y = Math.atan2(-(b2[1] - a2[1]), b2[0] - a2[0]);
        this.detailGroup.add(mesh);
      }
    }
    this.pose.add(this.detailGroup);
  }

  _stateTris(state) {
    return state.tris.map((t) => ({ pts: t.v.map((i) => state.pts[i]), layer: t.layer, up: t.up }));
  }

  setState(state, { fit = true } = {}) {
    this._animToken++;
    this._clearGuide();
    if (this.detailGroup) { this.pose.remove(this.detailGroup); this.detailGroup = null; }
    this.currentState = state;
    const [cx, cy] = this._center(state);
    const tris = this._stateTris(state);
    const posOf = (i, j) => [tris[i].pts[j][0] - cx, tris[i].layer * T, -(tris[i].pts[j][1] - cy)];
    const geo = this._buildGeometry(tris, posOf);
    this._setMesh(geo);
    this._setEdges(tris, posOf);
    if (fit) this.fitCamera(state);
  }

  fitCamera(state, elevation = 1.26, margin = 1.04) {
    const b = bounds(state);
    const r = Math.max(b.w, b.h) * 0.5 + 0.08;
    const dist = r / Math.tan((this.camera.fov * Math.PI) / 360) * margin;
    this.controls.target.set(0, 0, 0);
    this.camera.position.set(0, dist * Math.sin(elevation) , dist * Math.cos(elevation));
    this.controls.update();
  }

  // Animate a fold (anim array from applyFold) into newState.
  animateFold(anim, newState, duration = 1100) {
    const token = ++this._animToken;
    this._clearGuide(); // the marks have done their job once the fold starts
    this._setEdges(null); // paper stays clean mid-flight; lines return on land
    this.currentState = newState;
    const [cx, cy] = this._center(newState);

    // working data per anim triangle. Moved triangles keep their PRE-fold
    // side coloring during the flight (the flip happens through the 3D
    // rotation itself), so color by the pre-fold `up`.
    const work = anim.map((a, i) => ({
      a,
      up: a.moved ? !newState.tris[i].up : newState.tris[i].up,
      cur: a.start.map((p) => [p[0] - cx, a.zStart, -(p[1] - cy)]),
    }));
    const geo = this._buildGeometry(work, (i, j) => work[i].cur[j]);
    this._setMesh(geo);
    const pos = geo.attributes.position;

    const axis = new THREE.Vector3(), pivot = new THREE.Vector3(), v = new THREE.Vector3();
    const update = (t) => {
      const theta = easeInOut(t) * Math.PI;
      for (const w of work) {
        const a = w.a;
        for (let j = 0; j < 3; j++) {
          let p;
          if (a.moved) {
            pivot.set(a.axisPoint[0] - cx, a.zStart, -(a.axisPoint[1] - cy));
            axis.set(a.axisDir[0], 0, -a.axisDir[1]).normalize();
            v.set(a.start[j][0] - cx, a.zStart, -(a.start[j][1] - cy));
            v.sub(pivot).applyAxisAngle(axis, theta).add(pivot);
            v.y += (a.zEnd - a.zStart) * easeInOut(t);
            v.y += Math.sin(theta) * 0.035; // slight lift so the flap clears the stack mid-flight
            p = [v.x, v.y, v.z];
          } else {
            p = [a.start[j][0] - cx, a.zEnd, -(a.start[j][1] - cy)];
          }
          w.cur[j] = p;
        }
      }
      let o = 0;
      for (const w of work) {
        const [p0, p1, p2] = w.cur;
        pos.setXYZ(o++, ...p0); pos.setXYZ(o++, ...p1); pos.setXYZ(o++, ...p2);
        pos.setXYZ(o++, ...p0); pos.setXYZ(o++, ...p2); pos.setXYZ(o++, ...p1);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    };

    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = () => {
        if (token !== this._animToken) return resolve(false);
        const t = Math.min(1, (performance.now() - t0) / duration);
        update(t);
        if (t >= 1) {
          this.setState(newState, { fit: false });
          return resolve(true);
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  // Display pose for the finished model (intro screen / completion).
  showDisplay(states) {
    const m = this.model;
    let state = states[states.length - 1];
    this._animToken++;
    this._clearGuide();
    this._setEdges(null);
    if (m.display) {
      const base = states[m.display.fromStep];
      const r = applyFold(base, m.display.fold);
      // hold the fold at partial theta
      const [cx, cy] = this._center(r.state);
      const pivot = new THREE.Vector3(), axis = new THREE.Vector3(), v = new THREE.Vector3();
      const tris = r.anim.map((a, i) => {
        const upPre = a.moved ? !r.state.tris[i].up : r.state.tris[i].up;
        const pts = a.start.map((p) => {
          if (!a.moved) return [p[0] - cx, a.zEnd, -(p[1] - cy)];
          pivot.set(a.axisPoint[0] - cx, a.zStart, -(a.axisPoint[1] - cy));
          axis.set(a.axisDir[0], 0, -a.axisDir[1]).normalize();
          v.set(p[0] - cx, a.zStart, -(p[1] - cy));
          v.sub(pivot).applyAxisAngle(axis, m.display.theta).add(pivot);
          v.y += (a.zEnd - a.zStart) * (m.display.theta / Math.PI);
          return [v.x, v.y, v.z];
        });
        return { pts3: pts, up: upPre };
      });
      const geo = this._buildGeometry(tris, (i, j) => tris[i].pts3[j]);
      this._setMesh(geo);
      this._setEdges(tris, (i, j) => tris[i].pts3[j]);
      this.currentState = r.state;
      // fit to the POSED geometry, inflated by the ambient sway so the model
      // stays in frame through its whole animation cycle
      let rr = 0;
      for (const t of tris) for (const p of t.pts3) rr = Math.max(rr, Math.hypot(p[0], p[2]), Math.abs(p[1]));
      rr += m.ambient === 'fly' ? 0.5 : 0.12;
      const dist = rr / Math.tan((this.camera.fov * Math.PI) / 360) * 1.08;
      const el = m.ambient === 'fly' ? 0.92 : 0.72;
      const ty = m.ambient === 'fly' ? 0.22 : 0.1;
      this.controls.target.set(0, ty, 0);
      this.camera.position.set(0, ty + dist * Math.sin(el), dist * Math.cos(el));
      this.controls.update();
    } else {
      this.setState(state);
      this.fitCamera(state, m.details ? 1.05 : 0.72, 1.15); // faces read best from higher up
      this._showDetails(state);
    }
    this.spin.rotation.y = THREE.MathUtils.degToRad(m.finalRotate || 0);
    this.ambient = m.ambient || 'bob';
  }

  _loop() {
    requestAnimationFrame(this._loop);
    const t = (this._time = performance.now() / 1000);
    const g = this.pose;
    for (let i = 0; i < this._guideAnims.length; i++) {
      const ga = this._guideAnims[i];
      const k = (t * 0.55 + i * 0.37) % 1;
      ga.dot.position.copy(ga.curve.getPoint(k));
      const s = 1 + 0.18 * Math.sin(t * 3.4 + i);
      ga.ring.scale.setScalar(s);
    }
    if (this.ambient === 'fly') {
      const R = 0.16;
      const a = t * 0.9;
      g.position.set(Math.cos(a) * R, 0.22 + Math.sin(t * 1.7) * 0.04, Math.sin(a) * R);
      g.rotation.set(0, -a, Math.sin(t * 0.9) * 0.16);
      g.rotation.x = -0.08;
    } else if (this.ambient === 'hop') {
      const c = Math.abs(Math.sin(t * 2.4));
      g.position.y = c * 0.22;
      g.scale.set(1 + (1 - c) * 0.08, 1 - (1 - c) * 0.12, 1 + (1 - c) * 0.08);
      g.rotation.y = Math.sin(t * 0.6) * 0.3;
    } else if (this.ambient === 'rock') {
      g.rotation.z = Math.sin(t * 1.4) * 0.12;
      g.position.y = Math.abs(Math.sin(t * 1.4)) * 0.02;
      g.rotation.y = Math.sin(t * 0.4) * 0.35;
    } else if (this.ambient === 'swim') {
      g.rotation.y = t * 0.5;
      g.rotation.z = Math.sin(t * 2.2) * 0.15;
      g.position.y = 0.1 + Math.sin(t * 1.3) * 0.04;
    } else if (this.ambient === 'bob') {
      // sway around the model's good side (faces must stay readable)
      g.rotation.y = Math.sin(t * 0.5) * 0.26;
      g.position.y = 0.06 + Math.sin(t * 1.2) * 0.03;
    } else {
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
      g.scale.set(1, 1, 1);
    }
    this.controls.update();
    if (this._dbg && (this._dbgTick = (this._dbgTick || 0) + 1) % 30 === 0) {
      const p = this.pose.position, c = this.camera.position, t2 = this.controls.target;
      document.title = `pose(${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}) cam(${c.x.toFixed(2)},${c.y.toFixed(2)},${c.z.toFixed(2)}) tgt(${t2.x.toFixed(2)},${t2.y.toFixed(2)},${t2.z.toFixed(2)})`;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
