---
name: shapeup-sketch
description: Draw Shape Up breadboards (places, affordances, connection lines) and fat marker sketches as Excalidraw files plus PNGs from a small JSON spec, then check the render visually. Use whenever a pitch or shaping session needs a breadboard or a fat marker sketch, whenever the shaping skill reaches its drawing step, or when the user asks to sketch a flow, a screen layout or a rough UI in Excalidraw, even if they don't say "breadboard".
license: MIT
compatibility: Needs Node 22+. PNG rendering also needs the free Excalidraw CLI (npm i -g @excalidraw/cli) and an installed Chrome, Edge, Chromium or Firefox; without them it still writes editable .excalidraw files.
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/sketch.mjs *)
metadata:
  version: "1.0.0"
---

# Shape Up sketches in Excalidraw

Two drawings, both rough on purpose. A breadboard decides *what connects to what*; a fat marker sketch decides *rough layout* and nothing finer. Neither is a wireframe: if the drawing could settle a spacing, colour or copy argument, it has too much detail.

**The script:** `${CLAUDE_SKILL_DIR}/scripts/sketch.mjs`. If `${CLAUDE_SKILL_DIR}` appears literally, your agent doesn't expand it; it means the folder containing this SKILL.md. Everything below runs through this one script, so never call other drawing tools, and never run `excalidraw login` or the CLI's workspace commands (those need a paid Excalidraw+ account and nothing here uses them).

## Workflow

1. **Check the tools, once per session:** `node ${CLAUDE_SKILL_DIR}/scripts/sketch.mjs doctor`. It prints JSON. If `ok` is false, tell the user the `hint` in one line and carry on: you'll still produce `.excalidraw` files, just no PNGs.
2. **Write the spec** (formats below) into the output folder, e.g. `breadboard.json`.
3. **Generate and render:**
   ```
   node ${CLAUDE_SKILL_DIR}/scripts/sketch.mjs breadboard breadboard.json breadboard.excalidraw --png
   node ${CLAUDE_SKILL_DIR}/scripts/sketch.mjs fatmarker sketch-today.json sketch-today.excalidraw --png
   ```
   Read any `warning:` lines on stderr: unknown targets, long labels, too many places.
4. **Look at the PNG** when one was rendered. Check for text overlapping text, arrows crossing labels, a column so long it should be split, and labels long enough to read as real copy. Fix by editing the **spec** and regenerating, never by hand-editing the .excalidraw JSON. Stop after three passes; if it's still messy, the content needs splitting, not more layout tweaks.
5. **Keep all three files:** the spec `.json` (so a later change is a one-line edit), the `.excalidraw` (editable for free at excalidraw.com or in the VS Code Excalidraw extension), and the `.png` (what gets attached to the pitch). After someone edits the .excalidraw by hand, `sketch.mjs render file.excalidraw` refreshes its PNG.

**Language:** write every label in the pitch's language. Place names stay in CAPS in any language.

## Breadboard spec

```json
{
  "title": "Today's Jobs — main flow",
  "places": [
    { "id": "today", "name": "TODAY", "affordances": [
      { "label": "date + \"3 of 7 done\"" },
      { "label": "job row", "to": "job" }
    ]},
    { "id": "job", "name": "JOB", "affordances": [
      { "label": "address → phone's map app" },
      { "label": "[ Mark done ]", "to": "returned" }
    ]},
    { "id": "returned", "name": "TODAY (returned)", "affordances": [
      { "label": "next job at top" }
    ]}
  ],
  "notes": [ { "place": "job", "text": "~ photo proof is nice-to-have" } ]
}
```

- **Places** go left to right in the order given, so order them as the story is told. Names in CAPS.
- **Affordances** are things you can act on or read. Write buttons as `[ Label ]`. A hand-off outside the product goes inline as text (`address → phone's map app`), with no arrow.
- **`to`** draws a connection line to another place's title.
- **Returns:** when the story comes back to an earlier place, add a new column named `PLACE (returned)` instead of pointing back. Back-arrows work (they route under the diagram) but get busy fast.
- **Size:** at most 5 places per breadboard. More means two breadboards, or two alternatives to compare, one file each (`breadboard-a-signature.json`, `breadboard-b-no-signature.json`).
- **Notes** appear in red under a place. Use them for `~` nice-to-haves or a one-line clarification, never prose.
- **Non-UI work** (APIs, webhooks, background jobs): places can be systems or states (`OUR APP`, `PROVIDER`, `WEBHOOK HANDLER`), and affordances are the events and calls between them.

Reference: `examples/todays-jobs.breadboard.json` and its PNG.

## Fat marker spec

Only draw one when layout itself is part of the idea: relative size, position or grouping. If the breadboard already says everything, skip it.

```json
{
  "title": "TODAY — layout",
  "frame": "phone",
  "regions": [
    { "id": "header", "at": [0, 0, 6, 1], "kind": "block", "label": "3 of 7" },
    { "id": "rows",   "at": [0, 1, 6, 6], "kind": "list", "count": 3, "label": "9:00" }
  ],
  "notes": [
    { "to": "rows", "text": "big tappable rows, thumb-sized" },
    { "to": "rows", "text": "time on the right, nothing else", "side": "left" }
  ]
}
```

- **frame**: `phone` is a 6×12 grid, `desktop` is 16×10, `none` is 12×10 with no outline. Override with `"grid": [cols, rows]`.
- **at**: `[col, row, width, height]` in grid cells. The coarse grid is deliberate: it makes pixel-level placement impossible.
- **kind**:
  - `block`: a hatched bar standing for text or content.
  - `list`: `count` hatched rows.
  - `button`: rounded outline.
  - `box`: an outlined panel.
  - `image`: a box with an X.
  - `line`: a divider.
  - `text`: a bare label.
- **label**: optional, 1–3 words, and only when the words are the decision ("Mark done", "3 of 7"). Never realistic copy.
- **notes**: red annotations outside the frame with an arrow to the region, saying what the sketch *decides* ("big rows, nothing else on the screen"). Default side is right; use `"side": "left"` to balance.

If you could write a label small enough to read, the pen is too thin. The script draws with thick strokes and maximum roughness on purpose, so don't fight it.

Reference: `examples/todays-jobs.fatmarker.json`, plus `examples/kinds-pt.fatmarker.json` for every region kind with Portuguese labels.
