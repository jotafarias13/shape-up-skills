# Pitch template

## Rules

- **Paste-safe markdown only:** headings, bold, italics, bullet lists, inline code, fenced code blocks. That subset survives pasting into ClickUp, Notion, Linear, Jira and GitHub alike.
  - No tables, no HTML.
  - No image embeds. Local paths don't resolve once pasted, so refer to attached PNGs by filename.
- **Five ingredients, in this order** (guide §7): Problem, Appetite, Solution, Rabbit holes, No-gos. No other sections.
- **Length:** at most about a page and a half. If it's longer, it isn't shaped yet (guide §10).
- **Audience:** a reader alone at 9pm who never saw the grill. No "as we discussed", no references to the ledger.
- **No pixels:** no exact copy, spacing or colours. Button labels appear only when the label *is* the decision.
- **No open questions.** If you need an "open questions" section, it's the not-ready note instead.
- **Where each move goes:**
  - Patches go under Rabbit holes.
  - No-gos go under No-gos.
  - A Cut appears under No-gos only if someone might otherwise assume it's included.

## Language

Use the language chosen after playback for everything, drawing labels included.

The table covers English and Portuguese. For any other configured language, translate the headings naturally. In every language other than English, keep the Shape Up terms in English, since that's how teams learn them from the book: shaping, pitch, small batch, big batch, rabbit holes, no-gos, betting table. Translate everything else naturally. Don't translate place names in the breadboard into English if the product UI is in Portuguese, or the other way round; use the names the product actually uses.

**Headings and labels:**

| English | Português |
|---|---|
| Problem | Problema |
| Appetite | Apetite |
| Solution | Solução |
| Rabbit holes | Rabbit holes |
| No-gos | No-gos |
| Shaper / Date / Status | Shaper / Data / Status |
| Shaped — ready for betting | Shaped — pronto para a betting table |
| Breadboard — attached: | Breadboard — anexo: |
| Sketch — attached: | Sketch — anexo: |
| Checked in code: | Verificado no código: |
| Confirmed with | Confirmado com |

## Pitch skeleton (English shown; swap labels per the table)

````markdown
# <Title: the thing, in plain words, not a feature name>

**Shaper:** <name> · **Date:** <YYYY-MM-DD> · **Appetite:** <Small batch | Big batch (one full cycle)> · **Status:** Shaped — ready for betting

## Problem

<The specific actor in the specific moment, what they do instead today, and how often.
Why now: the trigger. If the request arrived as a solution ("we need an app"), name the
request and then say what the real pain is.>

## Appetite

<One line plus one reason it's worth exactly that much. Mention the cycle length only if the team has set one.>

## Solution

<The story in one or two short paragraphs, walking the main use case. Places in `CAPS`
as inline code, affordances in plain words, buttons in **bold**. Every sentence should
be a decision.>

**Breadboard** — attached: `breadboard.png`

```text
TODAY
  date + "3 of 7 done"
  job row → JOB
JOB
  address → phone's map app
  [ Mark done ] → TODAY (returned)
```

<Only if a fat marker sketch exists:>
**Sketch** — attached: `sketch-<name>.png`. <One line on what it decides, e.g. "big rows, time on the right, nothing else on the screen.">

<Only if any:> Items marked `~` are nice-to-haves, the first to go if time runs short.

## Rabbit holes

- **<Hole>:** <the decision: how it's patched, or that it's cut>. <Add "Checked in code: `path`" or "Confirmed with <name>" when a check was done.>

## No-gos

- <Explicitly excluded thing.>
- <Another.>
````

## Not-ready note

Use this instead of a pitch when the verdict is Not ready. It is the honest output when something is still open. Same language rules apply. Save it as `not-ready.md`.

````markdown
# <Title> — not ready to pitch

**Shaper:** <name> · **Date:** <YYYY-MM-DD> · **Status:** Not ready

## What's solid
<Problem, appetite, and the parts of the shape that are settled, briefly.>

## What's open
- <Open item> → <what would close it: the specific question, and who or what can answer it>

## Next shaping session starts with
<One line.>
````

In Portuguese: "não está pronto para pitch", "O que está sólido", "O que está em aberto", "A próxima sessão de shaping começa por".
