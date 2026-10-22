# Maintainer guide — Shape Up Shaping

How to release new versions, keep both install channels healthy, and improve the skills over time. Keep this file in the repository, so it changes along with the code it describes.

---

## 0. The one thing to remember

The two install channels decide "there's an update" in different ways:

- **Claude Code plugin users** move only when `version` in `.claude-plugin/plugin.json` changes. If you push without bumping it, they keep the old copy.
- **`npx skills` users** get whatever is in the skill folders on your default branch the moment they run `npx skills update`. The skills CLI compares file contents, not your version number.

Both rules point to the same two habits:

- **`main` is production.** Develop on the `next` branch, and merge into `main` only as a release.
- **Every release bumps the version.** Use `node tools/bump-version.mjs`; never edit versions by hand.

---

## 1. One-time setup

### 1.1 Replace the placeholders

`OWNER` stands for your GitHub username in `plugin.json` and `README.md`. The author name is in `plugin.json`, `marketplace.json` and `LICENSE`.

```bash
# macOS (on Linux, use: sed -i 's#...#...#g')
grep -rl "OWNER/" --include="*.json" --include="*.md" . | xargs sed -i '' 's#OWNER/#your-username/#g'
node tools/check.mjs  # the OWNER warnings should be gone
```

### 1.2 Create the repository and the two branches

Create an empty **public** repository named `shape-up-skills` on GitHub. Then:

```bash
git init && git add . && git commit -m "v1.0.0"
git branch -M main
git remote add origin git@github.com:your-username/shape-up-skills.git
git push -u origin main
git checkout -b next && git push -u origin next
```

### 1.3 Protect `main`

On GitHub, go to **Settings → Rules → Rulesets** (or **Branches** on older layouts) and add a rule for `main` that:

- requires a pull request before merging;
- requires the **CI / check** status check to pass.

From then on nothing reaches `main`, and therefore your npx users, without passing CI.

### 1.4 Publish v1.0.0

Go to **Releases → Draft a new release**:

1. Create the tag `v1.0.0` on `main`.
2. Use the title `v1.0.0`.
3. Paste the `## [1.0.0]` section of `CHANGELOG.md` as the notes.
4. Publish.

### 1.5 Install it yourself, both ways

Do this from GitHub, not from your local folder:

```bash
claude plugin marketplace add your-username/shape-up-skills
claude plugin install shape-up@shape-up-skills
claude plugin list  # shows shape-up@shape-up-skills, version 1.0.0

cd /tmp && mkdir npx-check && cd npx-check
npx skills add your-username/shape-up-skills -a claude-code -y
ls .claude/skills  # shaping  shapeup-sketch
```

### 1.6 Later: Anthropic's community marketplace

After a few stable releases, you can list the plugin in Anthropic's public community marketplace. Individuals submit through the Console form at `platform.claude.com/plugins/submit`.

- Run `claude plugin validate --profile directory .` first. It already passes for v1.0.0.
- Listings there are pinned to a specific commit, so check the submission portal for how to publish new versions to it.

---

## 2. How updates reach people

| | Claude Code plugin | npx skills |
|---|---|---|
| **Install** | `claude plugin marketplace add your-username/shape-up-skills`, then `claude plugin install shape-up@shape-up-skills` | `npx skills add your-username/shape-up-skills -a claude-code` (add `-g` for every project) |
| **What counts as new** | The `version` in `plugin.json` | The content of the skill folders on the default branch |
| **How users update** | `claude plugin update shape-up@shape-up-skills`. Auto-update exists but is **off by default** for third-party marketplaces | `npx skills check` shows whether one exists; `npx skills update` installs it |
| **If you push without bumping** | Users stay on the old version ("already at the latest version") | Users get the change on their next update |
| **Where it lands** | `~/.claude/plugins/cache/shape-up-skills/shape-up/<version>/` | `.claude/skills/<skill>/` in the project, or `~/.claude/skills/` with `-g` |
| **Command name** | `/shape-up:shaping` | `/shaping` |

Because npx users follow `main` directly, a half-finished change merged into `main` reaches them immediately. That's what the `next` branch protects against.

---

## 3. Repository map: where to change what

| You want to change… | Edit |
|---|---|
| The interview flow, grill rules, verdicts, playback, or the language step | `skills/shaping/SKILL.md` |
| Questions, smells and done-criteria for a stage | `skills/shaping/references/grill-map.md` |
| Pitch format, headings, languages, or the not-ready note | `skills/shaping/references/pitch-template.md` |
| The method text the skill treats as its source of truth | `skills/shaping/references/shaping-guide.md` |
| A config key | `skills/shaping/SKILL.md` (table), `references/config.md`, and `README.md`, all three |
| When a skill triggers | The `description` in that skill's frontmatter |
| Drawing rules or the spec format | `skills/shapeup-sketch/SKILL.md` |
| Drawing layout or rendering | `skills/shapeup-sketch/scripts/sketch.mjs`, then regenerate the example PNGs (§4) |
| Plugin metadata or the icon | `.claude-plugin/plugin.json`, `assets/icon.png` |
| The marketplace listing text | `.claude-plugin/marketplace.json` |
| Release notes | `CHANGELOG.md`, under `## [Unreleased]` |
| CI and its checks | `.github/workflows/ci.yml`, `tools/check.mjs` |

---

## 4. The development loop

Work on `next`. To try your working copy inside a real product repository, without touching your installed version:

```bash
git checkout next
claude plugin disable shape-up@shape-up-skills  # only if you also have it installed
cd ~/code/some-product-repo
claude --plugin-dir ~/code/shape-up-skills  # loads your working copy for this session only
# inside the session: /shape-up:shaping
```

Restart the session after editing skill files, to be sure the new text is loaded. When you're done, run `claude plugin enable shape-up@shape-up-skills`.

**Drawing script, without Claude:**

```bash
node skills/shapeup-sketch/scripts/sketch.mjs doctor
node skills/shapeup-sketch/scripts/sketch.mjs breadboard skills/shapeup-sketch/examples/todays-jobs.breadboard.json /tmp/bb.excalidraw --png
```

**If you change layout code in `sketch.mjs`,** regenerate the example PNGs and look at them. They're what the README shows.

```bash
cd skills/shapeup-sketch/examples
for f in todays-jobs.breadboard; do node ../scripts/sketch.mjs breadboard $f.json $f.excalidraw --png; done
for f in todays-jobs.fatmarker kinds-pt.fatmarker; do node ../scripts/sketch.mjs fatmarker $f.json $f.excalidraw --png; done
rm *.excalidraw
cp todays-jobs.breadboard.png ../../../docs/example/breadboard.png
cp todays-jobs.fatmarker.png ../../../docs/example/sketch-today.png
```

**Before every push:**

```bash
node tools/check.mjs
claude plugin validate --strict .
```

Write the release notes as you go, under `## [Unreleased]` in `CHANGELOG.md`, using the subheadings **Added**, **Changed**, **Fixed** and **Removed**. Release day is then a formality.

---

## 5. Releasing a new version

1. **Check the notes.** `## [Unreleased]` in `CHANGELOG.md` should describe everything in this release, in words a user understands.
2. **Pick the number** using §6.
3. **Bump it:**
   ```bash
   node tools/bump-version.mjs 1.1.0
   ```
   This sets the version in `plugin.json` and in both `SKILL.md` files, and turns the Unreleased notes into a dated `## [1.1.0]` section. It refuses to run if the notes are empty or the number isn't higher than the current one.
4. **Validate:**
   ```bash
   node tools/check.mjs && claude plugin validate --strict .
   ```
5. **Smoke test.** Run one real shaping with `claude --plugin-dir .` in a product repo, through to the pitch and a breadboard PNG.
6. **Commit and open a pull request:**
   ```bash
   git commit -am "Release v1.1.0" && git push
   ```
   Then open a PR from `next` into `main`, wait for CI to pass, and merge.
7. **Publish the GitHub release.** Go to **Releases → Draft a new release**, create the tag `v1.1.0` on `main`, paste the `## [1.1.0]` section as the notes, and publish.
8. **Verify both channels from GitHub:**
   ```bash
   claude plugin update shape-up@shape-up-skills && claude plugin list  # shows 1.1.0
   cd /tmp/npx-check && npx skills update  # picks up the new files
   ```
9. **Tell people.** Send the release link with one line on what changed and the update command for their channel.
10. **Sync `next`:**
    ```bash
    git checkout next && git merge main && git push
    ```

`claude plugin tag` creates a `shape-up--v1.1.0` tag. You only need it if other plugins ever declare a version range on yours; the `v1.1.0` GitHub release tags are enough otherwise.

---

## 6. Choosing the version number

The project follows semantic versioning, read for a skill:

| Bump | When | Examples |
|---|---|---|
| **Patch** (1.0.**1**) | Fixes and wording; nobody needs to do anything | A clearer grill question, a layout bug in `sketch.mjs`, typos in the guide |
| **Minor** (1.**1**.0) | New behaviour that's backward compatible | A new config key, a new sketch region kind, a new hunt-list item, a new pitch language |
| **Major** (**2**.0.0) | Anything that can break an existing user's setup or habits | Removing or repurposing a config key, changing output file names or folder layout, an incompatible spec format change |

**Never rename these.** Existing installs are recorded under these names, so renaming them breaks everyone who installed before:

- the plugin `shape-up`;
- the marketplace `shape-up-skills`;
- the skills `shaping` and `shapeup-sketch`;
- the repository `your-username/shape-up-skills`.

If you want a different label, change `displayName` instead.

**Config compatibility.** Add new keys freely. Never change what an existing key means. To retire a key, keep reading it for one more major version and mention the replacement in the hand-off.

---

## 7. Improving the skills over time

### 7.1 Where the signal comes from

- **Your own sessions.** Keep the `ledger.md` and `pitch.md` of real shapings. They show exactly where the grill went wrong.
- **Friends' sessions.** Ask for the same two files, redacted, plus one sentence on what felt off.
- **GitHub issues** (§8).

### 7.2 Symptom → where to fix it

| Symptom | Usual fix |
|---|---|
| The grill asks too many questions, or obvious ones | Tighten the done-criteria in `grill-map.md`; reinforce "stop on done-criteria" in `SKILL.md` |
| The grill misses a kind of rabbit hole | Add it to the hunt list in `grill-map.md` |
| The guesses attached to questions are off | Add an example of a good guess for that stage in `grill-map.md` |
| The playback assumptions list is empty or useless | Strengthen "log assumptions as you make them" in `SKILL.md` |
| The pitch is too long or reads like a spec | Tighten `pitch-template.md`; quote guide §10's length smell |
| The wrong language, or the language question is skipped | Section 4 of `SKILL.md`, and the `languages` config handling |
| The skill doesn't trigger, or triggers on unrelated requests | That skill's `description`: add or remove trigger phrases |
| Drawings overlap or look like wireframes | Spec rules in `shapeup-sketch/SKILL.md`, or layout code in `sketch.mjs` |

Change one thing at a time, and write *why* in the CHANGELOG entry. That's what makes a regression easy to trace later.

### 7.3 Keep the skills lean

- **Check the token cost:** `claude plugin details shape-up@shape-up-skills` reports each component and its projected token cost. Watch it grow.
- **Keep each `SKILL.md` under 500 lines** (`tools/check.mjs` warns past that), and move detail into `references/`.
- **Keep the most important rules near the top of `SKILL.md`.** After a long session is compacted, Claude Code re-attaches only the first part of an invoked skill.

### 7.4 Evals, when you want them

`claude plugin eval` runs test cases from an `evals/` folder against the plugin, with a no-plugin baseline for comparison. Good first cases for this plugin:

- **Triggering:** "vamos fazer o shaping de…", "grill me on this idea", "write a pitch for…" should load `shaping`. "Write a blog post" should not.
- **Intake shape:** the first reply has at most three lines of playback, then exactly one question with a guess attached.
- **Drawing:** given a spec, the sketch skill produces `.excalidraw` and PNG files without editing the JSON by hand.

The grill is interactive, so judge full sessions by reading transcripts; evals are there to catch regressions. To tune descriptions, Anthropic's `skill-creator` plugin generates should-trigger and should-not-trigger prompts and measures the hit rate.

---

## 8. Feedback and issues

When someone reports a problem, ask for:

- **channel and version:** `claude plugin list`, or `metadata.version` in their installed `SKILL.md` for npx;
- **agent:** Claude Code, or another agent through npx;
- **the redacted `ledger.md`**, plus what they expected and what happened;
- **for drawing problems:** the output of `node <skill folder>/scripts/sketch.mjs doctor`.

Label each issue `grill`, `pitch`, `drawing`, `install` or `docs`, so patterns show up.

---

## 9. Routine maintenance

**Every month or two,** run CI by hand (**Actions → CI → Run workflow**). It installs the *latest* Claude Code validator and Excalidraw CLI, so a new requirement or a breaking change shows up here before your users hit it.

**When Claude Code ships changes to skills or plugins,** skim its release notes, then run `claude plugin validate --strict .`. New validator warnings are usually new directory requirements; fix them in a patch release.

**When the Excalidraw CLI changes,** the render step in CI is the canary. Fixes go in the `render()` function of `sketch.mjs`.

**When GitHub deprecates an action version,** bump `actions/checkout` or `actions/setup-node` in `ci.yml`.

There are no runtime dependencies to update. The skills need only Node and, optionally, the Excalidraw CLI.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Plugin users say the update never arrived | `version` wasn't bumped, or they didn't run update | Release with `tools/bump-version.mjs`; users run `claude plugin update shape-up@shape-up-skills` |
| npx users got a half-finished change | It was pushed or merged to `main` outside a release | Keep work on `next`; protect `main` (§1.3) |
| `tools/check.mjs`: version mismatch | A version was edited by hand | Use `tools/bump-version.mjs`, or make all three versions equal |
| CI fails with no code change | The newest validator added a requirement, or the Excalidraw CLI changed | Read the message; fix in a patch release |
| `Plugin name … is reserved` | The name starts with `claude-`, `anthropic-` and similar | Keep `shape-up`; never rename (§6) |
| PNGs are missing, only `.excalidraw` files | No Excalidraw CLI or browser on that machine | `sketch.mjs doctor` prints the hint; `EXCALIDRAW_BROWSER_PATH` points it at a browser |
| `/shaping` not found | It was installed as a plugin | Use `/shape-up:shaping`, or just say "let's shape…" |
| Two copies of the skill while developing | Installed plugin plus `--plugin-dir` | `claude plugin disable shape-up@shape-up-skills` while testing |
| `npx skills add` finds nothing | The skill folder or `name` doesn't match, or the frontmatter is broken | `node tools/check.mjs`; `npx skills add . --list` from the repo root |

---

## 11. Command cheat sheet

```bash
# health
node tools/check.mjs
claude plugin validate --strict .
claude plugin validate --profile directory .
claude plugin details shape-up@shape-up-skills

# develop
claude --plugin-dir ~/code/shape-up-skills
node skills/shapeup-sketch/scripts/sketch.mjs doctor

# release
node tools/bump-version.mjs X.Y.Z
git commit -am "Release vX.Y.Z" && git push  # then PR next → main, then GitHub release vX.Y.Z

# verify as a user
claude plugin update shape-up@shape-up-skills && claude plugin list
npx skills check && npx skills update
```

---

## Appendix — release checklist

Paste this into each release pull request.

```text
Release vX.Y.Z
[ ] CHANGELOG "Unreleased" describes every change, in user words
[ ] Version number follows §6 (patch / minor / major)
[ ] node tools/bump-version.mjs X.Y.Z
[ ] node tools/check.mjs passes
[ ] claude plugin validate --strict . passes
[ ] One real shaping run end-to-end with --plugin-dir (pitch + breadboard PNG)
[ ] Example PNGs regenerated if sketch.mjs layout changed
[ ] PR next → main merged with CI green
[ ] GitHub release vX.Y.Z published with the CHANGELOG section
[ ] Verified: claude plugin update shows X.Y.Z; npx skills update picks it up
[ ] next synced with main
```
