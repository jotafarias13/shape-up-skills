#!/usr/bin/env node
// Shape Up sketches -> Excalidraw. No dependencies; Node 22+.
// Usage:
//   node sketch.mjs doctor                                     check Node, Excalidraw CLI and a test render
//   node sketch.mjs breadboard spec.json out.excalidraw [--png]
//   node sketch.mjs fatmarker  spec.json out.excalidraw [--png]
//   node sketch.mjs render     file.excalidraw              re-render a PNG after hand edits
// --png renders out.png beside the .excalidraw when the Excalidraw CLI and a browser are available.
// If rendering isn't possible, the .excalidraw file is still written and the script exits 0 with a hint.
// Set EXCALIDRAW_BROWSER_PATH to point the renderer at a specific Chrome/Edge/Chromium/Firefox binary.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const INK = "#1e1e1e";
const NOTE = "#e03131"; // annotations only
const MUTED = "#868e96";
const FONT = 5; // Excalifont (hand-drawn)
const CHAR_W = 0.56; // Excalifont average glyph width / fontSize, rounded up so text never overflows
const LINE_H = 1.25;

// ---------- element factory ----------
let counter = 0;
const rid = () => `el${(++counter).toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const seed = () => Math.floor(Math.random() * 2 ** 31);

function base(type, x, y, w, h, extra = {}) {
  return {
    id: rid(), type, x, y, width: w, height: h, angle: 0,
    strokeColor: INK, backgroundColor: "transparent", fillStyle: "solid",
    strokeWidth: 2, strokeStyle: "solid", roughness: 1, opacity: 100,
    groupIds: [], frameId: null, roundness: null,
    seed: seed(), version: 1, versionNonce: seed(), isDeleted: false,
    boundElements: null, updated: Date.now(), link: null, locked: false,
    ...extra,
  };
}

function measure(text, size) {
  const lines = String(text).split("\n");
  const longest = Math.max(...lines.map((l) => l.length));
  return { w: Math.ceil(longest * size * CHAR_W) + 4, h: Math.ceil(lines.length * size * LINE_H) };
}

function text(x, y, str, size = 20, extra = {}) {
  const { w, h } = measure(str, size);
  return base("text", x, y, w, h, {
    text: String(str), originalText: String(str), fontSize: size, fontFamily: FONT,
    textAlign: "left", verticalAlign: "top", containerId: null, autoResize: true,
    lineHeight: LINE_H, ...extra,
  });
}

function poly(type, pts, extra = {}) {
  const [x0, y0] = pts[0];
  const rel = pts.map(([x, y]) => [x - x0, y - y0]);
  const xs = rel.map((p) => p[0]), ys = rel.map((p) => p[1]);
  return base(type, x0, y0, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
    points: rel, lastCommittedPoint: null, startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: type === "arrow" ? "arrow" : null,
    ...(type === "arrow" ? { elbowed: false } : {}), ...extra,
  });
}
const arrow = (pts, extra) => poly("arrow", pts, extra);
const line = (pts, extra) => poly("line", pts, extra);
const rect = (x, y, w, h, extra) => base("rectangle", x, y, w, h, extra);

function scene(elements) {
  return { type: "excalidraw", version: 2, source: "shapeup-sketch", elements,
    appState: { viewBackgroundColor: "#ffffff", gridSize: null }, files: {} };
}

const warn = (m) => process.stderr.write(`warning: ${m}\n`);
const fail = (m) => { process.stderr.write(`error: ${m}\n`); process.exit(1); };

// ---------- breadboard ----------
// spec: { title?, places: [{ id, name, affordances: [{ label, to? }] }], notes?: [{ place, text }] }
function breadboard(spec) {
  const places = spec.places || [];
  if (!places.length) fail("breadboard spec needs at least one place");
  if (places.length > 5) warn(`${places.length} places in one breadboard; consider splitting it into several`);
  const ids = new Set(places.map((p) => p.id));

  const TITLE = 24, AFF = 20, GAP = 150, AFF_GAP = 14, TOP = spec.title ? 70 : 20, LEFT = 60;
  const els = [];
  if (spec.title) els.push(text(LEFT, 10, spec.title, 18, { strokeColor: MUTED }));

  // measure columns
  const cols = places.map((p) => {
    const t = measure(p.name, TITLE);
    const affs = (p.affordances || []).map((a) => ({ ...a, m: measure(a.label, AFF) }));
    const width = Math.max(t.w + 12, ...affs.map((a) => a.m.w), 80);
    return { p, t, affs, width };
  });

  let x = LEFT, bottom = 0;
  const anchors = {}; // place id -> {titleLeft, titleMidY, colLeft, colRight}
  const sources = []; // {from:{x,y}, colIdx, to}
  cols.forEach((c, i) => {
    const titleEl = text(x, TOP, c.p.name, TITLE);
    els.push(titleEl);
    const uy = TOP + c.t.h + 4;
    els.push(line([[x - 4, uy], [x + c.t.w + 8, uy]], { strokeWidth: 2 }));
    let y = uy + 18;
    c.affs.forEach((a) => {
      els.push(text(x, y, a.label, AFF));
      if (a.to) {
        if (!ids.has(a.to)) warn(`affordance "${a.label}" points to unknown place "${a.to}"; arrow skipped`);
        else if (a.to === c.p.id) warn(`affordance "${a.label}" points to its own place; arrow skipped`);
        else sources.push({ from: { x: x + a.m.w + 6, y: y + a.m.h / 2 }, exitX: x + c.width + 14, colIdx: i, to: a.to });
      }
      y += a.m.h + AFF_GAP;
    });
    (spec.notes || []).filter((n) => n.place === c.p.id).forEach((n) => {
      const ne = text(x, y + 6, n.text, 16, { strokeColor: NOTE });
      els.push(ne);
      y += ne.height + 10;
    });
    anchors[c.p.id] = { idx: i, titleLeft: x - 8, titleMidY: TOP + c.t.h / 2, colLeft: x, colRight: x + c.width };
    bottom = Math.max(bottom, y);
    x += c.width + GAP;
  });

  // arrows
  let lane = 0;
  const gapOffsets = {};
  const nextOffset = (key) => { gapOffsets[key] = (gapOffsets[key] || 0) + 1; return (gapOffsets[key] - 1) * 12; };
  sources.forEach((s) => {
    const t = anchors[s.to];
    const end = [t.titleLeft, t.titleMidY];
    const lead = s.exitX - s.from.x > 4 ? [[s.from.x, s.from.y], [s.exitX, s.from.y]] : [[s.from.x, s.from.y]];
    if (t.idx === s.colIdx + 1) {
      els.push(arrow([...lead, end]));
    } else {
      // route through the gaps and a lane under the diagram
      const laneY = bottom + 30 + lane++ * 22;
      const outX = anchors[places[s.colIdx].id].colRight + 34 + nextOffset(`r${s.colIdx}`);
      const inX = t.colLeft - 40 - nextOffset(`l${t.idx}`);
      els.push(arrow([[s.from.x, s.from.y], [Math.max(outX, s.exitX), s.from.y], [Math.max(outX, s.exitX), laneY], [inX, laneY], [inX, end[1]], end]));
    }
  });
  return els;
}

// ---------- fat marker sketch ----------
// spec: { title?, frame: "phone"|"desktop"|"none", grid?: [cols, rows],
//         regions: [{ id, at: [col,row,w,h], kind, label?, count? }],
//         notes?: [{ to, text, side?: "left"|"right" }] }
const FRAMES = { phone: [6, 12], desktop: [16, 10], none: [12, 10] };
const KINDS = ["block", "box", "button", "list", "image", "line", "text"];

function fatmarker(spec) {
  const frame = spec.frame || "phone";
  const [gc, gr] = spec.grid || FRAMES[frame] || FRAMES.phone;
  const U = 50, PAD = 10, NOTE_W = 230;
  const hasLeft = (spec.notes || []).some((n) => n.side === "left");
  const ox = hasLeft ? NOTE_W + 60 : 40, oy = spec.title ? 70 : 30;
  const fw = gc * U, fh = gr * U;
  const M = { strokeWidth: 4, roughness: 2 }; // the "fat marker"
  const els = [];
  if (spec.title) els.push(text(ox, 14, spec.title, 18, { strokeColor: MUTED }));

  if (frame !== "none") {
    els.push(rect(ox - PAD, oy - PAD, fw + 2 * PAD, fh + 2 * PAD, { ...M, roundness: { type: 3 } }));
  }

  const boxes = {};
  for (const r of spec.regions || []) {
    if (!KINDS.includes(r.kind)) { warn(`unknown kind "${r.kind}" on region "${r.id}"; drawn as box`); }
    if (r.label && r.label.length > 18) warn(`label "${r.label}" is long; fat marker labels should be 1-3 words`);
    const [c, rr, w, h] = r.at;
    const x = ox + c * U + 4, y = oy + rr * U + 4, W = w * U - 8, H = h * U - 8;
    boxes[r.id] = { x, y, W, H };
    const lbl = (lx, ly, size = 22) => r.label && els.push(text(lx, ly, r.label, size));
    switch (r.kind) {
      case "block": {
        const bw = r.label ? W - measure(r.label, 22).w - 24 : W;
        els.push(rect(x, y + H * 0.2, Math.max(bw, 30), H * 0.6, { ...M, fillStyle: "hachure", backgroundColor: INK }));
        if (r.label) lbl(x + bw + 14, y + H / 2 - 14);
        break;
      }
      case "list": {
        const n = Math.max(1, r.count || 3), rowH = H / n;
        const lw = r.label ? measure(r.label, 22).w + 24 : 0;
        for (let i = 0; i < n; i++) {
          const ry = y + i * rowH;
          els.push(rect(x, ry + rowH * 0.2, W - lw, rowH * 0.6, { ...M, fillStyle: "hachure", backgroundColor: INK }));
          if (r.label) els.push(text(x + W - lw + 12, ry + rowH / 2 - 14, r.label, 22));
        }
        break;
      }
      case "button": {
        els.push(rect(x, y, W, H, { ...M, roundness: { type: 3 } }));
        if (r.label) { const m = measure(r.label, 22); lbl(x + (W - m.w) / 2, y + (H - m.h) / 2); }
        break;
      }
      case "image": {
        els.push(rect(x, y, W, H, M));
        els.push(line([[x, y], [x + W, y + H]], M));
        els.push(line([[x + W, y], [x, y + H]], M));
        break;
      }
      case "line": {
        els.push(line([[x, y + H / 2], [x + W, y + H / 2]], M));
        break;
      }
      case "text": {
        lbl(x, y + H / 2 - 14, 24);
        break;
      }
      default: {
        els.push(rect(x, y, W, H, M));
        if (r.label) lbl(x + 12, y + 10);
      }
    }
  }

  // annotations, stacked per side so they never overlap
  const used = { left: [], right: [] };
  for (const n of spec.notes || []) {
    const b = boxes[n.to];
    if (!b) { warn(`note "${n.text}" points to unknown region "${n.to}"; skipped`); continue; }
    const side = n.side === "left" ? "left" : "right";
    const t = text(0, 0, wrap(n.text, 24), 18, { strokeColor: NOTE });
    let ty = b.y + b.H / 2 - t.height / 2;
    for (const [a, z] of used[side].sort((p, q) => p[0] - q[0])) if (ty < z + 12 && ty + t.height > a - 12) ty = z + 12;
    used[side].push([ty, ty + t.height]);
    const tx = side === "right" ? ox + fw + PAD + 60 : ox - PAD - 60 - t.width;
    t.x = tx; t.y = ty;
    els.push(t);
    const start = side === "right" ? [tx - 8, ty + t.height / 2] : [tx + t.width + 8, ty + t.height / 2];
    const end = side === "right" ? [b.x + b.W + 8, b.y + b.H / 2] : [b.x - 8, b.y + b.H / 2];
    els.push(arrow([start, end], { strokeColor: NOTE, strokeWidth: 2 }));
  }
  return els;
}

function wrap(s, max) {
  const words = String(s).split(/\s+/); const out = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { if (cur) out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) out.push(cur);
  return out.join("\n");
}

// ---------- rendering via the official Excalidraw CLI ----------
const IS_WIN = process.platform === "win32";
const q = (a) => (IS_WIN && /\s/.test(a) ? `"${a}"` : a);

function excalidraw(args) {
  const r = spawnSync("excalidraw", args.map(q), { shell: IS_WIN, encoding: "utf8", timeout: 120000 });
  return { ok: r.status === 0 && !r.error, out: `${r.stdout || ""}${r.stderr || ""}`.trim(), missing: r.error?.code === "ENOENT" };
}

const RENDER_HINT =
  "Install the renderer with `npm i -g @excalidraw/cli` (needs Node 22+ and an installed Chrome, Edge, Chromium or Firefox; " +
  "set EXCALIDRAW_BROWSER_PATH if it can't find yours). Meanwhile, open the .excalidraw file at https://excalidraw.com and export a PNG from there.";

function render(file) {
  const png = file.replace(/\.excalidraw$/, "") + ".png";
  const args = ["render", file, "--out", png, "--scale", "2"];
  if (process.env.EXCALIDRAW_BROWSER_PATH) args.push("--browser-path", process.env.EXCALIDRAW_BROWSER_PATH);
  const r = excalidraw(args);
  if (r.ok && existsSync(png)) return { rendered: true, png };
  return { rendered: false, reason: r.missing ? "excalidraw CLI not found" : r.out.split("\n").slice(-3).join(" ") || "render failed", hint: RENDER_HINT };
}

function doctor() {
  const major = Number(process.versions.node.split(".")[0]);
  const report = { node: process.versions.node, nodeOk: major >= 22 };
  const v = excalidraw(["--version"]);
  report.cli = v.ok ? v.out.split("\n")[0] : null;
  if (v.ok) {
    const dir = mkdtempSync(join(tmpdir(), "shapeup-sketch-"));
    const f = join(dir, "check.excalidraw");
    writeFileSync(f, JSON.stringify(scene([text(0, 0, "ok", 20)])));
    const r = render(f);
    report.render = r.rendered;
    if (!r.rendered) report.renderError = r.reason;
    rmSync(dir, { recursive: true, force: true });
  } else report.render = false;
  report.ok = report.nodeOk && report.render;
  if (!report.ok) report.hint = report.nodeOk ? RENDER_HINT : "Node 22 or newer is required for the Excalidraw CLI. " + RENDER_HINT;
  return report;
}

// ---------- main ----------
const argv = process.argv.slice(2);
const wantPng = argv.includes("--png");
const [mode, a1, a2] = argv.filter((a) => a !== "--png");
const say = (o) => process.stdout.write(JSON.stringify(o) + "\n");

if (mode === "doctor") {
  say(doctor());
} else if (mode === "render") {
  if (!a1 || !existsSync(a1)) fail("usage: node sketch.mjs render file.excalidraw");
  say({ ok: true, mode, file: a1, ...render(a1) });
} else if (["breadboard", "fatmarker"].includes(mode) && a1 && a2) {
  let spec;
  try { spec = JSON.parse(readFileSync(a1, "utf8")); } catch (e) { fail(`cannot read spec: ${e.message}`); }
  const elements = mode === "breadboard" ? breadboard(spec) : fatmarker(spec);
  writeFileSync(a2, JSON.stringify(scene(elements), null, 2));
  say({ ok: true, mode, out: a2, elements: elements.length, ...(wantPng ? render(a2) : {}) });
} else {
  fail("usage: node sketch.mjs <doctor | breadboard spec.json out.excalidraw [--png] | fatmarker spec.json out.excalidraw [--png] | render file.excalidraw>");
}
