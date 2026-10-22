#!/usr/bin/env node
// Prepare a release: `node tools/bump-version.mjs 1.1.0`
// Sets the version in plugin.json and in every SKILL.md, and turns the CHANGELOG's
// "Unreleased" notes into a dated section for the new version. Commit the result.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const next = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(next || "")) { console.error("usage: node tools/bump-version.mjs <x.y.z>"); process.exit(1); }

const pj = ".claude-plugin/plugin.json";
const plugin = JSON.parse(readFileSync(pj, "utf8"));
const prev = plugin.version;
const cmp = (a, b) => a.split(".").map(Number).reduce((r, n, i) => r || n - b.split(".").map(Number)[i], 0);
if (cmp(next, prev) <= 0) { console.error(`${next} must be greater than the current ${prev}`); process.exit(1); }

const log = readFileSync("CHANGELOG.md", "utf8");
const m = log.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/);
if (!m) { console.error('CHANGELOG.md needs a "## [Unreleased]" heading'); process.exit(1); }
if (!m[1].trim()) { console.error('Nothing under "## [Unreleased]" in CHANGELOG.md — write the release notes there first.'); process.exit(1); }

plugin.version = next;
writeFileSync(pj, JSON.stringify(plugin, null, 2) + "\n");
for (const s of readdirSync("skills")) {
  const p = `skills/${s}/SKILL.md`;
  if (!existsSync(p)) continue;
  const t = readFileSync(p, "utf8");
  const u = t.replace(/(\nmetadata:\n(?:\s+.*\n)*?\s+version:\s*)"[^"]*"/, `$1"${next}"`);
  if (u === t) console.warn(`warning: no metadata.version found in ${p}`);
  writeFileSync(p, u);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync("CHANGELOG.md", log.replace("## [Unreleased]\n", `## [Unreleased]\n\n## [${next}] — ${today}\n`));

console.log(`${prev} → ${next}. Next:
  node tools/check.mjs
  git commit -am "Release v${next}" && git push
  then create the GitHub release v${next} with the CHANGELOG section as its notes`);
