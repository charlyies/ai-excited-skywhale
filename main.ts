// Skywhale — "JUDGE, LOOK UP."
// A procedural 1024x1024 PNG for make.fun bounty ai-excited-01.
// A giant whale breaches through a burning sunset sky, carrying a tiny
// glowing city on its back. Node 22, standard library only, no network.
// Deterministic: a seeded PRNG is the only source of variation, so both
// grader runs write byte-identical output.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;
const fb = new Uint8Array(W * H * 4); // RGBA framebuffer

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic, no Math.random, no Date.
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20261116);

// ---------------------------------------------------------------------------
// Pixel helpers
// ---------------------------------------------------------------------------
function blend(x: number, y: number, r: number, g: number, b: number, a: number): void {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H || a <= 0) return;
  const i = (yi * W + xi) * 4;
  if (a >= 255) {
    fb[i] = r; fb[i + 1] = g; fb[i + 2] = b; fb[i + 3] = 255;
    return;
  }
  const inv = 255 - a;
  fb[i] = (r * a + fb[i] * inv) / 255;
  fb[i + 1] = (g * a + fb[i + 1] * inv) / 255;
  fb[i + 2] = (b * a + fb[i + 2] * inv) / 255;
  fb[i + 3] = 255;
}

type RGB = [number, number, number];

function fillRect(x: number, y: number, w: number, h: number, c: RGB, a = 255): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) blend(xx, yy, c[0], c[1], c[2], a);
  }
}

// Filled polygon, even-odd scanline fill. Points are [x, y] pairs.
function fillPoly(pts: Array<[number, number]>, c: RGB, a = 255): void {
  if (pts.length < 3) return;
  let minY = H - 1;
  let maxY = 0;
  for (const p of pts) {
    minY = Math.min(minY, Math.floor(p[1]));
    maxY = Math.max(maxY, Math.ceil(p[1]));
  }
  minY = Math.max(0, minY);
  maxY = Math.min(H - 1, maxY);
  for (let y = minY; y <= maxY; y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];
      if ((p0[1] <= yc && p1[1] > yc) || (p1[1] <= yc && p0[1] > yc)) {
        const t = (yc - p0[1]) / (p1[1] - p0[1]);
        xs.push(p0[0] + t * (p1[0] - p0[0]));
      }
    }
    xs.sort((u, v) => u - v);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k]));
      const x1 = Math.min(W - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) blend(x, y, c[0], c[1], c[2], a);
    }
  }
}

// Sampled ellipse as a polygon, then filled.
function ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB, a = 255): void {
  const pts: Array<[number, number]> = [];
  const n = 72;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
  }
  fillPoly(pts, c, a);
}

function disc(cx: number, cy: number, r: number, c: RGB, a = 255): void {
  ellipse(cx, cy, r, r, c, a);
}

// Thick line drawn as discs along the segment.
function thickLine(x0: number, y0: number, x1: number, y1: number, w: number, c: RGB, a = 255): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(len / Math.max(1, w * 0.4)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    disc(x0 + dx * t, y0 + dy * t, w / 2, c, a);
  }
}

// Polyline through points with a given width.
function polyline(pts: Array<[number, number]>, w: number, c: RGB, a = 255): void {
  for (let i = 0; i + 1 < pts.length; i++) {
    thickLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w, c, a);
  }
}

// ---------------------------------------------------------------------------
// 2D rotation helper (screen coords, y down). Angle -0.5 tilts +x up-right.
// ---------------------------------------------------------------------------
function rot(x: number, y: number, ang: number): [number, number] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [x * c - y * s, x * s + y * c];
}

// ---------------------------------------------------------------------------
// 5x7 bitmap font. '#' = on. Covers A-Z, 0-9 and , . ! ' -
// ---------------------------------------------------------------------------
const FONT: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ',': ['00000', '00000', '00000', '00000', '00100', '00100', '01000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale; // 5px glyph + 1px gap, per char
}

function drawTextRaw(s: string, x0: number, y0: number, scale: number, c: RGB, a = 255): void {
  let cx = x0;
  for (const ch of s) {
    const g = FONT[ch] ?? FONT[' '];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '1') {
          fillRect(cx + col * scale, y0 + r * scale, scale, scale, c, a);
        }
      }
    }
    cx += 6 * scale;
  }
}

// Centred text with a dark outline so it can never look garbled.
function drawText(s: string, cy: number, scale: number, fill: RGB, outline: RGB): void {
  const w = textWidth(s, scale);
  const x0 = (W - w) / 2;
  const y0 = cy - (7 * scale) / 2;
  const o = Math.max(2, Math.round(scale * 0.45));
  for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, -o], [-o, o], [o, o]] as Array<[number, number]>) {
    drawTextRaw(s, x0 + dx, y0 + dy, scale, outline);
  }
  drawTextRaw(s, x0, y0, scale, fill);
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function lerpColor(c0: RGB, c1: RGB, t: number): RGB {
  return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)];
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
const INDIGO: RGB = [27, 16, 64];
const VIOLET: RGB = [94, 32, 138];
const MAGENTA: RGB = [198, 44, 120];
const ORANGE: RGB = [255, 110, 60];
const EMBER: RGB = [255, 170, 80];
const GOLD: RGB = [255, 214, 140];
const PALE_GOLD: RGB = [255, 232, 178];
const WHALE: RGB = [46, 52, 158];
const WHALE_TOP: RGB = [74, 84, 205];
const BELLY: RGB = [158, 176, 242];
const DARK: RGB = [22, 16, 52];
const CLOUD_DARK: RGB = [58, 30, 92];
const CLOUD_LIT: RGB = [255, 150, 120];

function sky(): void {
  const stops: Array<[number, RGB]> = [
    [0.0, INDIGO],
    [0.35, VIOLET],
    [0.6, MAGENTA],
    [0.82, ORANGE],
    [1.0, EMBER],
  ];
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1);
    let i = 0;
    while (i + 1 < stops.length && stops[i + 1][0] < t) i++;
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[Math.min(i + 1, stops.length - 1)];
    const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
    const c = lerpColor(c0, c1, Math.max(0, Math.min(1, f)));
    fillRect(0, y, W, 1, [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]);
  }
}

const SUN: [number, number] = [512, 640];

function sunAndGlow(): void {
  // Smooth radial glow: per-pixel falloff, no banding rings.
  const [sx, sy] = SUN;
  const R = 430;
  for (let y = Math.max(0, sy - R); y <= Math.min(H - 1, sy + R); y++) {
    for (let x = Math.max(0, sx - R); x <= Math.min(W - 1, sx + R); x++) {
      const d = Math.hypot(x - sx, y - sy) / R;
      if (d >= 1) continue;
      const f = (1 - d) * (1 - d);
      blend(x, y, 255, 180, 90, Math.round(f * 64));
    }
  }
  disc(SUN[0], SUN[1], 132, GOLD, 255);
  disc(SUN[0], SUN[1], 96, PALE_GOLD, 255);
  disc(SUN[0], SUN[1], 52, [255, 246, 214], 255);
}

function godRays(): void {
  const [sx, sy] = SUN;
  const rayCols: RGB[] = [GOLD, [255, 190, 110], PALE_GOLD];
  for (let i = 0; i < 7; i++) {
    const ang = -Math.PI / 2 + (i - 3) * 0.24 + (rng() - 0.5) * 0.06;
    const len = 640 + rng() * 260;
    const spread = 0.05 + rng() * 0.05;
    const tipX = sx + Math.cos(ang) * len;
    const tipY = sy + Math.sin(ang) * len;
    const px = Math.cos(ang + Math.PI / 2);
    const py = Math.sin(ang + Math.PI / 2);
    const half = len * spread;
    fillPoly(
      [
        [sx, sy],
        [tipX + px * half, tipY + py * half],
        [tipX - px * half, tipY - py * half],
      ],
      rayCols[i % rayCols.length],
      16 + Math.floor(rng() * 14),
    );
  }
}

function cloudBand(cx: number, cy: number, scale: number, lit: boolean): void {
  // A soft band: overlapping ellipses, dark body, lit top edge near the sun.
  const puffs: Array<[number, number, number, number]> = [
    [-150, 0, 170, 34],
    [-60, -14, 190, 40],
    [50, -6, 200, 42],
    [150, 4, 160, 32],
    [0, 10, 230, 36],
  ];
  for (const [dx, dy, rx, ry] of puffs) {
    ellipse(cx + dx * scale, cy + dy * scale, rx * scale, ry * scale, CLOUD_DARK, 235);
  }
  if (lit) {
    for (const [dx, dy, rx, ry] of puffs) {
      ellipse(cx + dx * scale, cy + (dy - 16) * scale, rx * 0.92 * scale, ry * 0.55 * scale, CLOUD_LIT, 105);
    }
  }
}

function farClouds(): void {
  cloudBand(300, 620, 0.9, true);
  cloudBand(760, 560, 1.1, true);
  cloudBand(512, 800, 1.15, false);
}

// ---------------------------------------------------------------------------
// The whale. Local coords: +x toward the nose, +y down. Rotated -0.5 rad so
// the nose points up-right. Centre of the body on screen: (500, 470).
// ---------------------------------------------------------------------------
const WHALE_C: [number, number] = [500, 470];
const WHALE_ANG = -0.5;
const BODY_RX = 330;
const BODY_RY = 108;

function wpt(lx: number, ly: number): [number, number] {
  const [rx, ry] = rot(lx, ly, WHALE_ANG);
  return [WHALE_C[0] + rx, WHALE_C[1] + ry];
}

// Body outline with a tapered nose (x > 120 narrows toward the tip).
function bodyPoint(t: number): [number, number] {
  const x = Math.cos(t) * BODY_RX;
  let y = Math.sin(t) * BODY_RY;
  if (x > 120) {
    const f = (x - 120) / (BODY_RX - 120);
    y *= 1 - 0.38 * f;
  }
  return wpt(x, y);
}

function whale(): void {
  // Tail flukes first (body overlaps the joint).
  const flukeL: Array<[number, number]> = [
    wpt(-300, -6), wpt(-452, -108), wpt(-428, -30), wpt(-402, 2),
  ];
  const flukeR: Array<[number, number]> = [
    wpt(-300, 6), wpt(-448, 118), wpt(-420, 34), wpt(-398, 4),
  ];
  fillPoly(flukeL, WHALE, 255);
  fillPoly(flukeR, WHALE, 255);
  // Tail stalk.
  fillPoly([wpt(-330, -26), wpt(-300, -30), wpt(-296, 30), wpt(-330, 26)], WHALE, 255);

  // Pectoral fin (below the body, swept back).
  fillPoly(
    [wpt(30, 62), wpt(150, 168), wpt(96, 176), wpt(6, 92)],
    [38, 44, 138],
    255,
  );

  // Body.
  const bodyPts: Array<[number, number]> = [];
  const n = 96;
  for (let i = 0; i < n; i++) bodyPts.push(bodyPoint((i / n) * Math.PI * 2));
  fillPoly(bodyPts, WHALE, 255);

  // Lighter top sheen (upper arc band).
  const sheen: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const t = Math.PI + (i / 40) * Math.PI; // upper half in local coords
    const x = Math.cos(t) * BODY_RX * 0.97;
    let y = Math.sin(t) * BODY_RY * 0.97;
    if (x > 120) y *= 1 - 0.38 * ((x - 120) / (BODY_RX - 120));
    sheen.push(wpt(x, y));
  }
  for (let i = 40; i >= 0; i--) {
    const t = Math.PI + (i / 40) * Math.PI;
    const x = Math.cos(t) * BODY_RX * 0.82;
    let y = Math.sin(t) * BODY_RY * 0.82;
    if (x > 120) y *= 1 - 0.38 * ((x - 120) / (BODY_RX - 120));
    sheen.push(wpt(x, y + 18));
  }
  fillPoly(sheen, WHALE_TOP, 120);

  // Belly (lower arc band, pale).
  const belly: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI; // lower half
    const x = Math.cos(t) * BODY_RX * 0.94;
    let y = Math.sin(t) * BODY_RY * 0.94;
    if (x > 120) y *= 1 - 0.38 * ((x - 120) / (BODY_RX - 120));
    belly.push(wpt(x, y));
  }
  for (let i = 40; i >= 0; i--) {
    const t = (i / 40) * Math.PI;
    const x = Math.cos(t) * BODY_RX * 0.8;
    let y = Math.sin(t) * BODY_RY * 0.62;
    if (x > 120) y *= 1 - 0.38 * ((x - 120) / (BODY_RX - 120));
    belly.push(wpt(x, y));
  }
  fillPoly(belly, BELLY, 235);

  // Warm rim light along the top edge.
  const rim: Array<[number, number]> = [];
  for (let i = 0; i <= 48; i++) {
    const t = Math.PI + (i / 48) * Math.PI;
    rim.push(bodyPoint(t));
  }
  polyline(rim, 7, GOLD, 225);

  // Throat grooves under the head.
  for (let k = 0; k < 3; k++) {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 16; i++) {
      const t = 0.35 + (i / 16) * 0.9;
      const x = 150 + Math.cos(t) * 120;
      const y = 30 + Math.sin(t) * 62 + k * 13;
      pts.push(wpt(x, y));
    }
    polyline(pts, 5, [30, 34, 110], 130);
  }

  // Mouth line near the nose.
  const mouth: Array<[number, number]> = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    mouth.push(wpt(210 + t * 105, -18 + t * 26));
  }
  polyline(mouth, 5, [26, 28, 96], 200);

  // Eye + highlight.
  const [ex, ey] = wpt(218, -34);
  disc(ex, ey, 10, [12, 10, 34], 255);
  disc(ex + 3, ey - 3, 3.5, [255, 255, 255], 255);
}

// The tiny glowing city riding the whale's back.
function city(): void {
  // Walk along the top arc of the body; each building stands on the back.
  const tops: Array<[number, number]> = [];
  for (let x = -210; x <= 210; x += 1) {
    const f = x / BODY_RX;
    if (Math.abs(f) >= 1) continue;
    let y = -Math.sqrt(1 - f * f) * BODY_RY;
    if (x > 120) y *= 1 - 0.38 * ((x - 120) / (BODY_RX - 120));
    tops.push([x, y]);
  }
  let i = 0;
  while (i < tops.length) {
    const bw = 15 + Math.floor(rng() * 12);
    const bh = 20 + Math.floor(rng() * 30);
    const step = bw + 6 + Math.floor(rng() * 10);
    const [lx, ly] = tops[Math.min(i, tops.length - 1)];
    // Building as a rotated rect: base at the back, rising "up" from it.
    const up: [number, number] = rot(0, -1, WHALE_ANG);
    const along: [number, number] = rot(1, 0, WHALE_ANG);
    const [bx, by] = wpt(lx, ly + 4);
    const hw = bw / 2;
    const corners: Array<[number, number]> = [
      [bx - along[0] * hw, by - along[1] * hw],
      [bx + along[0] * hw, by + along[1] * hw],
      [bx + along[0] * hw + up[0] * bh, by + along[1] * hw + up[1] * bh],
      [bx - along[0] * hw + up[0] * bh, by - along[1] * hw + up[1] * bh],
    ];
    fillPoly(corners, [18, 14, 42], 255);
    // Warm lit windows: small dots up the face of the building.
    const rows = Math.max(1, Math.floor(bh / 12));
    const cols = Math.max(1, Math.floor(bw / 9));
    for (let r = 0; r < rows; r++) {
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        if (rng() < 0.35) continue;
        const wx = bx + along[0] * (-hw + 4 + cIdx * 9) + up[0] * (6 + r * 12);
        const wy = by + along[1] * (-hw + 4 + cIdx * 9) + up[1] * (6 + r * 12);
        fillRect(wx - 1.5, wy - 2, 3.5, 4.5, [255, 196, 90], 255);
      }
    }
    i += step;
  }

  // Lighthouse near the front of the back, with a beam.
  const [lx, ly] = wpt(148, -BODY_RY * 0.86);
  const up: [number, number] = rot(0, -1, WHALE_ANG);
  const along: [number, number] = rot(1, 0, WHALE_ANG);
  const lh = 58;
  const lw = 7;
  fillPoly(
    [
      [lx - along[0] * lw, ly - along[1] * lw],
      [lx + along[0] * lw, ly + along[1] * lw],
      [lx + along[0] * lw * 0.7 + up[0] * lh, ly + along[1] * lw * 0.7 + up[1] * lh],
      [lx - along[0] * lw * 0.7 + up[0] * lh, ly - along[1] * lw * 0.7 + up[1] * lh],
    ],
    [24, 18, 54],
    255,
  );
  const tx = lx + up[0] * (lh + 4);
  const ty = ly + up[1] * (lh + 4);
  disc(tx, ty, 7, [255, 240, 170], 255);
  // Beam sweeping up-right into the sky.
  const beamDir = rot(1, -0.45, 0);
  const bx2 = tx + beamDir[0] * 260;
  const by2 = ty + beamDir[1] * 260;
  const perp: [number, number] = [-beamDir[1], beamDir[0]];
  fillPoly(
    [
      [tx, ty],
      [bx2 + perp[0] * 26, by2 + perp[1] * 26],
      [bx2 - perp[0] * 26, by2 - perp[1] * 26],
    ],
    [255, 230, 150],
    60,
  );
}

function spray(): void {
  // White spray bursting around the tail.
  const [tx, ty] = wpt(-430, -10);
  for (let i = 0; i < 110; i++) {
    const ang = rng() * Math.PI * 2;
    const d = 12 + rng() * 150;
    const px = tx + Math.cos(ang) * d * 1.25;
    const py = ty + Math.sin(ang) * d * 0.8 - d * 0.25;
    const r = 1.5 + rng() * 5;
    const a = 90 + Math.floor(rng() * 165);
    disc(px, py, r, rng() < 0.7 ? [255, 255, 255] : [190, 225, 255], a);
  }
  // Streaks arcing away from the tail.
  for (let i = 0; i < 14; i++) {
    const ang = -Math.PI * 0.75 + rng() * Math.PI * 0.5;
    const d0 = 60 + rng() * 60;
    const d1 = d0 + 40 + rng() * 70;
    thickLine(
      tx + Math.cos(ang) * d0,
      ty + Math.sin(ang) * d0,
      tx + Math.cos(ang) * d1,
      ty + Math.sin(ang) * d1,
      3 + rng() * 3,
      [255, 255, 255],
      120 + Math.floor(rng() * 100),
    );
  }
}

function birds(): void {
  for (let i = 0; i < 14; i++) {
    const x = 80 + rng() * 864;
    const y = 200 + rng() * 260;
    // Keep birds clear of the headline text band.
    if (y < 190) continue;
    const s = 9 + rng() * 9;
    const flap = 0.5 + rng() * 0.5;
    polyline(
      [
        [x - s, y - s * 0.4 * flap],
        [x, y],
        [x + s, y - s * 0.4 * flap],
      ],
      4,
      [28, 18, 58],
      235,
    );
  }
}

function nearClouds(): void {
  // Dark wisps framing the bottom corners.
  ellipse(110, 990, 210, 46, CLOUD_DARK, 245);
  ellipse(230, 1012, 180, 40, CLOUD_DARK, 245);
  ellipse(910, 992, 220, 48, CLOUD_DARK, 245);
  ellipse(790, 1014, 170, 38, CLOUD_DARK, 245);
  // Warm lit rims on their top edges.
  ellipse(110, 976, 195, 22, [255, 130, 80], 60);
  ellipse(910, 978, 200, 22, [255, 130, 80], 60);
}

function vignette(): void {
  const cx = W / 2;
  const cy = H / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, y - cy) / maxD;
      if (d < 0.55) continue;
      const f = (d - 0.55) / 0.45;
      const dark = 1 - f * f * 0.26;
      const i = (y * W + x) * 4;
      fb[i] = fb[i] * dark;
      fb[i + 1] = fb[i + 1] * dark;
      fb[i + 2] = fb[i + 2] * dark;
    }
  }
}

// ---------------------------------------------------------------------------
// PNG encoder: raw scanlines (filter 0), zlib level 9, own CRC32.
// ---------------------------------------------------------------------------
function crc32(buf: Buffer): number {
  let table = (crc32 as unknown as { t?: Int32Array }).t;
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    (crc32 as unknown as { t: Int32Array }).t = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    raw.set(fb.subarray(y * W * 4, (y + 1) * W * 4), y * (1 + W * 4) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------------
// Render, back to front.
// ---------------------------------------------------------------------------
sky();
sunAndGlow();
godRays();
farClouds();
whale();
city();
spray();
birds();
nearClouds();
drawText('JUDGE, LOOK UP.', 96, 9, [255, 244, 220], [20, 10, 50]);
vignette();

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng());
