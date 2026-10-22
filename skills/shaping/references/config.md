# Configuration — `.shaping.json`

Optional. Without it the skill runs on defaults. It's read from two places, and the project file wins key by key:

1. **Project:** `.shaping.json` in the folder Claude was started in. Commit it, so the whole team shares the same cycle length and languages.
2. **Personal:** `~/.shaping.json` in your home folder, for your defaults across projects.

Settings live outside the skill on purpose, so updating the skill never overwrites them.

```json
{
  "cycleWeeks": 6,
  "languages": ["Português (pt-BR)", "English"],
  "outputDir": "shaping",
  "pitchDestination": "ClickUp",
  "shaper": "João"
}
```

## Keys

All keys are optional.

- **`cycleWeeks`** (number, `4` or `6`). It sets the appetite ladder, following guide §3:
  - **6 weeks:** small batch = 1–2 weeks, big batch = 6 weeks.
  - **4 weeks:** small batch = 1 week, big batch = 4 weeks.
  - **Any other number:** big batch = the full cycle, small batch = "a week or two".
  - **Absent:** appetites are stated as "small batch" or "big batch (one full cycle)" with no week counts.
- **`languages`** (array of display names). The choices offered when asking the pitch language. The first one is listed first. With exactly one entry the skill doesn't ask. Default: `["English", "Português (pt-BR)"]`.
- **`outputDir`** (string, a path relative to the project). Each shaping gets its own `YYYY-MM-DD-slug/` folder inside it. Default: `"shaping"`. Add it to `.gitignore` if you don't want pitches in the repo.
- **`pitchDestination`** (string). Where pitches get pasted. It only changes the wording of the final hand-off. Default: none.
- **`shaper`** (string). The name in the pitch header. With none, the skill uses `git config user.name`, or else asks once.

Unknown keys are ignored. If a value is invalid, the skill says so once and uses the default.
