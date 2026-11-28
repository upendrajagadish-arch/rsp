import * as THREE from "three";
import type { PassportGalleryItem } from "@/lib/passport/gallery-items";

export type GalleryPose = {
  th: number;
  r: number;
  yaw: number;
  y: number;
  pitch: number;
};

const R = 18;
const RIN = 12.2;
const H = 6.2;
const PW = 1.36;
const PH = (1.36 * 763) / 567;
const PY = 1.95;
const STEP = (Math.PI * 2) / 36;

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4;
}
function easeOutQuad(t: number) {
  return 1 - (1 - t) ** 2;
}
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}
function expoOut(t: number) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function makeVerticalGradient(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  for (const [p, col] of stops) grd.addColorStop(p, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRadialFloor() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d")!;
  const cx = 512;
  const cy = 512;
  const inner = 512 * (RIN / R);
  const grd = g.createRadialGradient(cx, cy, inner, cx, cy, 512);
  grd.addColorStop(0, "#EDD6B0");
  grd.addColorStop(0.55, "#F3E1C3");
  grd.addColorStop(1, "#EFDAB8");
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 1024);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeHalo() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,0.95)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function makeShadow() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(120,90,50,0.28)");
  grd.addColorStop(0.25, "rgba(120,90,50,0.14)");
  grd.addColorStop(1, "rgba(120,90,50,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function drawStampCard(item: PassportGalleryItem, fontsReady: boolean) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 1024;
  const g = c.getContext("2d")!;

  // Paper
  g.fillStyle = "#FFFEFA";
  g.fillRect(0, 0, 768, 1024);
  g.fillStyle = "rgba(182,154,89,0.08)";
  g.fillRect(0, 0, 768, 1024);

  // Border
  g.strokeStyle = "#D8C398";
  g.lineWidth = 4;
  g.strokeRect(24, 24, 720, 976);

  // Header bar
  g.fillStyle = "#08182D";
  g.fillRect(24, 24, 720, 96);
  g.fillStyle = "#D8C398";
  g.font = fontsReady ? "500 22px Newsreader, Georgia, serif" : "500 22px Georgia, serif";
  g.fillText("SKILL PASSPORT", 48, 82);

  // Stamp circle
  const cx = 384;
  const cy = 420;
  const col = item.colour || "#B69A59";
  g.beginPath();
  g.arc(cx, cy, 160, 0, Math.PI * 2);
  g.fillStyle = item.status === "verified" ? `${col}33` : "transparent";
  g.fill();
  g.strokeStyle = col;
  g.lineWidth = 6;
  if (item.status === "locked") g.setLineDash([8, 8]);
  g.stroke();
  g.setLineDash([]);
  g.beginPath();
  g.arc(cx, cy, 130, 0, Math.PI * 2);
  g.lineWidth = 2;
  g.stroke();

  // Crest
  g.beginPath();
  g.moveTo(cx, cy - 70);
  g.lineTo(cx + 40, cy - 30);
  g.lineTo(cx + 28, cy + 20);
  g.lineTo(cx, cy + 48);
  g.lineTo(cx - 28, cy + 20);
  g.lineTo(cx - 40, cy - 30);
  g.closePath();
  g.fillStyle = item.status === "verified" ? col : "transparent";
  g.fill();
  g.strokeStyle = col;
  g.lineWidth = 3;
  g.stroke();

  // Title block
  g.fillStyle = "#08182D";
  g.font = fontsReady ? "600 42px Oswald, Arial Narrow, sans-serif" : "600 42px sans-serif";
  const title = item.title.length > 28 ? `${item.title.slice(0, 26)}…` : item.title;
  g.fillText(title.toUpperCase(), 56, 680);

  g.fillStyle = "#3A3550";
  g.font = fontsReady ? "italic 400 28px Newsreader, Georgia, serif" : "italic 28px Georgia, serif";
  g.fillText(item.artist, 56, 730);

  g.fillStyle = "rgba(58,53,80,0.7)";
  g.font = fontsReady ? "500 22px 'DM Mono', monospace" : "500 22px monospace";
  g.fillText(`${item.year}  ·  ${item.priceLabel.toUpperCase()}`, 56, 780);

  g.fillStyle = "#B69A59";
  g.font = fontsReady ? "500 18px 'DM Mono', monospace" : "500 18px monospace";
  g.fillText(`STAMP ${item.stampCode}`, 56, 830);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function drawLabel(item: PassportGalleryItem, fontsReady: boolean) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 260;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, 640, 260);
  g.fillStyle = "#3A3550";
  g.font = fontsReady ? "500 58px Newsreader, Georgia, serif" : "500 58px Georgia, serif";
  g.fillText(item.artist.slice(0, 28), 30, 82);
  g.font = fontsReady ? "italic 400 54px Newsreader, Georgia, serif" : "italic 54px Georgia, serif";
  const t = item.title.length > 26 ? `${item.title.slice(0, 24)}…` : item.title;
  g.fillText(t, 30, 150);
  g.globalAlpha = 0.7;
  g.font = fontsReady ? "400 30px 'DM Mono', monospace" : "400 30px monospace";
  g.fillText(`${item.year} · STAMP`, 30, 215);
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class PassportGalleryScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  printMeshes: THREE.Mesh[] = [];
  printMeta: { itemIndex: number; wall: "outer" | "inner"; angle: number }[] = [];
  pose: GalleryPose;
  targetTh: number;
  D: number;
  focused: number | null = null;
  private glide: null | {
    from: GalleryPose;
    to: GalleryPose;
    t0: number;
    dur: number;
    reduce: boolean;
  } = null;
  private intro: null | { t0: number; fromTh: number; fromR: number; to: GalleryPose } = null;
  private raf = 0;
  private last = 0;
  private disposed = false;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private haloTex = makeHalo();
  private shadowTex = makeShadow();
  private onFrame?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    private items: PassportGalleryItem[],
    private small: boolean,
    private reduce: boolean,
  ) {
    this.D = small ? 0.14 + 0.9 * STEP : 0.14;
    this.pose = this.walkPose(0 + this.D);
    this.targetTh = this.pose.th;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#FFF9EC");
    this.scene.fog = new THREE.Fog("#FFF9EC", 10, 46);

    this.camera = new THREE.PerspectiveCamera(56, 1, 0.05, 100);
    this.scene.add(new THREE.HemisphereLight(0xfffdf6, 0xe9cfa6, 1.55));
    this.scene.add(new THREE.AmbientLight(0xfff6e6, 0.55));

    this.buildRoom();
    this.buildPrints(false);
    this.applyPose(this.pose);
    this.resize();
  }

  walkPose(th: number): GalleryPose {
    if (this.small) return { th, r: 15.4, yaw: -0.42, y: 1.9, pitch: -0.1 };
    return { th, r: 15.6, yaw: -0.3, y: 1.92, pitch: -0.12 };
  }

  focusPose(wall: "outer" | "inner", th: number): GalleryPose {
    if (wall === "outer") {
      return this.small
        ? { th, r: 18 - 5.2, yaw: Math.PI / 2, y: PY - 1.05, pitch: 0 }
        : { th, r: 18 - 4.26, yaw: Math.PI / 2, y: PY - 0.52, pitch: 0 };
    }
    return this.small
      ? { th, r: 12.2 + 5.2, yaw: -Math.PI / 2, y: PY - 1.05, pitch: 0 }
      : { th, r: 12.2 + 4.26, yaw: -Math.PI / 2, y: PY - 0.52, pitch: 0 };
  }

  private buildRoom() {
    const outerMat = new THREE.MeshBasicMaterial({
      map: makeVerticalGradient([
        [0, "#F5EBD8"],
        [0.2, "#FBF3E3"],
        [0.6, "#FBF3E3"],
        [0.86, "#F8EDD9"],
        [1, "#EFDFC4"],
      ]),
      side: THREE.BackSide,
    });
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 160, 1, true), outerMat);
    outer.position.y = H / 2;
    this.scene.add(outer);

    const innerMat = new THREE.MeshBasicMaterial({
      map: makeVerticalGradient([
        [0, "#F7EEDD"],
        [0.3, "#FFFAF0"],
        [0.8, "#FDF5E6"],
        [1, "#F1E1C6"],
      ]),
      side: THREE.FrontSide,
    });
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(RIN, RIN, H, 120, 1, true), innerMat);
    inner.position.y = H / 2;
    this.scene.add(inner);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(R, 160),
      new THREE.MeshBasicMaterial({ map: makeRadialFloor() }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const ceil = new THREE.Mesh(
      new THREE.CircleGeometry(R, 160),
      new THREE.MeshBasicMaterial({ color: "#FAF1E0", side: THREE.BackSide }),
    );
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.y = H;
    this.scene.add(ceil);
  }

  async buildPrints(fontsReady: boolean) {
    const seenGroups = new Set<THREE.Object3D>();
    for (const m of this.printMeshes) {
      const group = m.parent;
      if (group && !seenGroups.has(group)) {
        seenGroups.add(group);
        group.removeFromParent();
        group.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        });
      }
    }
    this.printMeshes = [];
    this.printMeta = [];

    const addGroup = (
      angle: number,
      radius: number,
      lookOut: boolean,
      itemIndex: number,
      wall: "outer" | "inner",
    ) => {
      const item = this.items[itemIndex];
      const group = new THREE.Group();
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      group.position.set(x, 0, z);
      if (lookOut) group.lookAt(x * 2, 0, z * 2);
      else group.lookAt(0, 0, 0);

      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1 * PW, 1.75 * PH),
        new THREE.MeshBasicMaterial({
          map: this.haloTex,
          transparent: true,
          depthWrite: false,
          fog: true,
        }),
      );
      halo.position.set(0, PY + 0.05, 0.005);
      group.add(halo);

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.25 * PW, 1.18 * PH),
        new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false }),
      );
      shadow.position.set(0.05, PY - 0.06, 0.01);
      group.add(shadow);

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(PW + 0.07, PH + 0.07, 0.06),
        new THREE.MeshBasicMaterial({ color: "#D3AA72" }),
      );
      frame.position.set(0, PY, 0.045);
      group.add(frame);

      const printTex = drawStampCard(item, fontsReady);
      printTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const print = new THREE.Mesh(
        new THREE.PlaneGeometry(PW, PH),
        new THREE.MeshBasicMaterial({ map: printTex }),
      );
      print.position.set(0, PY, 0.077);
      print.userData.itemIndex = itemIndex;
      print.userData.wall = wall;
      print.userData.angle = angle;
      group.add(print);
      this.printMeshes.push(print);
      this.printMeta.push({ itemIndex, wall, angle });

      const labelTex = drawLabel(item, fontsReady);
      const labelH = 0.92 * (260 / 640);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.92, labelH),
        new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }),
      );
      label.position.set(-PW / 2 + 0.46, PY - PH / 2 - 0.42, 0.02);
      group.add(label);

      this.scene.add(group);
    };

    for (let s = 0; s < 36; s++) {
      const angle = s * STEP;
      addGroup(angle, 17.98, false, s % 9, "outer");
    }
    for (let k = 0; k < 24; k++) {
      const angle = (k + 0.5) * ((Math.PI * 2) / 24);
      addGroup(angle, 12.22, true, (k + 4) % 9, "inner");
    }
  }

  applyPose(p: GalleryPose) {
    const x = p.r * Math.cos(p.th);
    const z = p.r * Math.sin(p.th);
    this.camera.position.set(x, p.y, z);
    const tangent = new THREE.Vector3(Math.sin(p.th), 0, -Math.cos(p.th));
    const normal = new THREE.Vector3(Math.cos(p.th), 0, Math.sin(p.th));
    const dir = tangent.multiplyScalar(Math.cos(p.yaw)).add(normal.multiplyScalar(Math.sin(p.yaw)));
    this.camera.lookAt(x + dir.x, p.y + p.pitch, z + dir.z);
  }

  resize() {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.fov = w >= h ? 56 : 70;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  startIntro() {
    const walk = this.walkPose(0 + this.D);
    this.pose = { ...walk, th: walk.th + 0.16, r: walk.r - 0.35 };
    this.targetTh = walk.th;
    this.intro = { t0: performance.now(), fromTh: this.pose.th, fromR: this.pose.r, to: walk };
    if (this.reduce) {
      this.pose = walk;
      this.intro = null;
      this.applyPose(this.pose);
    }
  }

  setTargetTh(th: number) {
    this.targetTh = th;
  }

  nudgeWalk(delta: number) {
    if (this.focused != null) {
      this.stepBack();
      return;
    }
    this.targetTh += delta;
  }

  snapStep(dir: 1 | -1) {
    if (this.focused != null) {
      this.stepBack();
      return;
    }
    const t = this.targetTh;
    this.targetTh = (Math.round((t - this.D) / STEP) - dir) * STEP + this.D;
  }

  private nearestAngle(from: number, to: number) {
    let a = to;
    while (a - from > Math.PI) a -= Math.PI * 2;
    while (a - from < -Math.PI) a += Math.PI * 2;
    return a;
  }

  focusItem(itemIndex: number, wall: "outer" | "inner", angle: number) {
    const th = this.nearestAngle(this.pose.th, angle);
    const to = this.focusPose(wall, th);
    this.focused = itemIndex;
    this.glideTo(to);
  }

  stepBack() {
    const th = this.pose.th;
    const to = this.walkPose(th + this.D);
    this.focused = null;
    this.targetTh = to.th;
    this.glideTo(to);
  }

  focusNearestOuter(itemIndex: number) {
    const candidates = this.printMeta.filter((m) => m.itemIndex === itemIndex && m.wall === "outer");
    if (!candidates.length) return;
    let best = candidates[0];
    let bestD = Infinity;
    for (const c of candidates) {
      const a = this.nearestAngle(this.pose.th, c.angle);
      const d = Math.abs(a - this.pose.th);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    this.focusItem(itemIndex, "outer", best.angle);
  }

  glideTo(to: GalleryPose) {
    this.glide = {
      from: { ...this.pose },
      to,
      t0: performance.now(),
      dur: this.reduce ? 0 : 950,
      reduce: this.reduce,
    };
  }

  pick(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.printMeshes, false);
    if (!hits.length) return null;
    const obj = hits[0].object as THREE.Mesh;
    return {
      itemIndex: obj.userData.itemIndex as number,
      wall: obj.userData.wall as "outer" | "inner",
      angle: obj.userData.angle as number,
      point: hits[0].point,
    };
  }

  projectPrintRect(itemIndex: number) {
    const mesh = this.printMeshes.find((m) => m.userData.itemIndex === itemIndex && m.userData.wall === "outer")
      ?? this.printMeshes.find((m) => m.userData.itemIndex === itemIndex);
    if (!mesh) return null;
    const geom = mesh.geometry as THREE.PlaneGeometry;
    geom.computeBoundingBox();
    const box = geom.boundingBox!;
    const corners = [
      new THREE.Vector3(box.min.x, box.min.y, 0),
      new THREE.Vector3(box.max.x, box.min.y, 0),
      new THREE.Vector3(box.min.x, box.max.y, 0),
      new THREE.Vector3(box.max.x, box.max.y, 0),
    ].map((v) => mesh.localToWorld(v.clone()));
    const rect = this.renderer.domElement.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of corners) {
      const p = c.project(this.camera);
      const x = (p.x * 0.5 + 0.5) * rect.width + rect.left;
      const y = (-p.y * 0.5 + 0.5) * rect.height + rect.top;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  }

  start(onFrame?: () => void) {
    this.onFrame = onFrame;
    this.last = performance.now();
    const loop = (now: number) => {
      if (this.disposed) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.tick(now, dt);
      this.renderer.render(this.scene, this.camera);
      this.onFrame?.();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private tick(now: number, dt: number) {
    if (this.intro) {
      const t = this.reduce ? 1 : Math.min(1, (now - this.intro.t0) / 1400);
      const e = expoOut(t);
      this.pose.th = this.intro.fromTh + (this.intro.to.th - this.intro.fromTh) * e;
      this.pose.r = this.intro.fromR + (this.intro.to.r - this.intro.fromR) * e;
      this.pose.yaw = this.intro.to.yaw;
      this.pose.y = this.intro.to.y;
      this.pose.pitch = this.intro.to.pitch;
      this.applyPose(this.pose);
      if (t >= 1) this.intro = null;
      return;
    }

    if (this.glide) {
      const t = this.glide.dur <= 0 ? 1 : Math.min(1, (now - this.glide.t0) / this.glide.dur);
      const f = this.glide.from;
      const to = this.glide.to;
      this.pose.th = f.th + (to.th - f.th) * easeOutQuart(t);
      this.pose.yaw = f.yaw + (to.yaw - f.yaw) * easeOutQuad(t);
      this.pose.r = f.r + (to.r - f.r) * easeOutCubic(t);
      this.pose.y = f.y + (to.y - f.y) * easeOutCubic(t);
      this.pose.pitch = f.pitch + (to.pitch - f.pitch) * easeOutCubic(t);
      this.applyPose(this.pose);
      if (t >= 1) this.glide = null;
      return;
    }

    if (this.focused == null) {
      if (this.reduce) this.pose.th = this.targetTh;
      else this.pose.th += (this.targetTh - this.pose.th) * (1 - Math.exp(-dt / 0.36));
    }
    this.applyPose(this.pose);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
  }
}
