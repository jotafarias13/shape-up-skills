#!/usr/bin/env node
// Repo health check. Run before every release and in CI: `node tools/check.mjs`
// Checks manifests, skill frontmatter, version consistency, the changelog entry,
// and that the sketch generator still produces valid drawings from the examples.
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch (e) { err(`${p}: ${e.message}`); return {}; } };

// manifests
const plugin = readJson(".claude-plugin/plugin.json");
const market = readJson(".claude-plugin/marketplace.json");
const version = plugin.version;
if (!/^\d+\.\d+\.\d+$/.test(version || "")) err(`plugin.json version "${version}" is not x.y.z`);
const entry = (market.plugins || []).find((p) => p.name === plugin.name);
if (!entry) err(`marketplace.json has no entry named "${plugin.name}" (it must match plugin.json)`);
for (const f of [".claude-plugin/plugin.json", "README.md"]) {
  if (existsSync(f) && readFileSync(f, "utf8").includes("OWNER/")) warn(`${f} still contains the OWNER placeholder`);
}

// skills: frontmatter, names, versions
function frontmatter(path) {
  const t = readFileSync(path, "utf8");
  const m = t.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {}; let parent = null;
  for (const line of m[1].split("\n")) {
    const nested = line.match(/^\s+([\w-]+):\s*"?(.*?)"?\s*$/);
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (top) { parent = top[1]; fm[parent] = top[2] === "" ? {} : top[2].replace(/^"|"$/g, ""); }
    else if (nested && parent && typeof fm[parent] === "object") fm[parent][nested[1]] = nested[2];
  }
  return fm;
}
const skills = readdirSync("skills", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
if (!skills.length) err("no skills found in skills/");
for (const s of skills) {
  const p = `skills/${s}/SKILL.md`;
  if (!existsSync(p)) { err(`${p} missing`); continue; }
  const fm = frontmatter(p);
  if (!fm) { err(`${p}: no frontmatter`); continue; }
  if (fm.name !== s) err(`${p}: name "${fm.name}" must equal its folder "${s}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name || "") || fm.name.length > 64) err(`${p}: name must be lowercase-hyphenated, max 64 chars`);
  if (!fm.description) err(`${p}: description missing`);
  else if (fm.description.length > 1024) err(`${p}: description is ${fm.description.length} chars (max 1024 in the Agent Skills spec)`);
  const sv = fm.metadata && fm.metadata.version;
  if (sv !== version) err(`${p}: metadata.version "${sv}" differs from plugin.json "${version}" (run tools/bump-version.mjs)`);
  const lines = readFileSync(p, "utf8").split("\n").length;
  if (lines > 500) warn(`${p}: ${lines} lines; keep SKILL.md under 500 and move detail to references/`);
}

// changelog
const changelog = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8") : "";
if (!changelog.includes(`## [${version}]`)) err(`CHANGELOG.md has no "## [${version}]" section`);

// sketch smoke test
const sketch = "skills/shapeup-sketch/scripts/sketch.mjs";
if (existsSync(sketch)) {
  const dir = mkdtempSync(join(tmpdir(), "shapeup-check-"));
  for (const [mode, spec] of [["breadboard", "todays-jobs.breadboard.json"], ["fatmarker", "todays-jobs.fatmarker.json"], ["fatmarker", "kinds-pt.fatmarker.json"]]) {
    const out = join(dir, spec.replace(".json", ".excalidraw"));
    const r = spawnSync(process.execPath, [sketch, mode, `skills/shapeup-sketch/examples/${spec}`, out], { encoding: "utf8" });
    if (r.status !== 0) { err(`sketch ${mode} ${spec} failed: ${r.stderr.trim()}`); continue; }
    if (r.stderr.includes("warning:")) warn(`sketch ${spec}: ${r.stderr.trim()}`);
    const scene = readJson(out);
    if (scene.type !== "excalidraw" || !(scene.elements || []).length) err(`sketch ${spec}: output is not a valid scene`);
  }
  rmSync(dir, { recursive: true, force: true });
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`error:   ${e}`);
console.log(errors.length ? `\n✗ ${errors.length} error(s) — fix before releasing` : `\n✓ checks passed for v${version}${warnings.length ? ` (${warnings.length} warning(s))` : ""}`);
process.exit(errors.length ? 1 : 0);
