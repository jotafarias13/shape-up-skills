# Shaping — A Travel Guide

**From a raw idea to a shaped pitch.** A working companion to *Shape Up* Part 1 (Ryan Singer, Basecamp — free at basecamp.com/shapeup).

Read this once end to end (about 20 minutes). After that, keep the checklist in §7 open while you shape. The numbered stages **0 → 5** match the numbers on the flowchart (`docs/shaping-flowchart.svg` in the repository), so you can locate yourself at any moment.

---

## 1. What shaping is

Shaping is the work of turning a raw request into a solution that is:

- **concrete enough** that a team knows what to build,
- **abstract enough** that the team still gets to design it and make the calls,
- **bounded**, so it fits inside a fixed amount of time.

Shaped work has two properties that sound contradictory but aren't:

| Property | What it means | What it does *not* mean |
|---|---|---|
| **Rough** | Unfinished on purpose. Boxes and words, not pixels. | Vague. |
| **Solved** | The main problem is worked out. You know the shape of the answer. | Every detail specified. |

### The level of abstraction

This is the single hardest thing to get right.

- **Too abstract** — "improve the scheduling experience." The team has to invent the project. They'll go in a direction you didn't intend, or freeze.
- **Too concrete** — a wireframe with real labels, spacing and states. The team becomes a pair of hands. They can't trade scope for time, so when they hit trouble they either blow the deadline or ship something bad.
- **Right** — "A screen that lists today's jobs; tapping one opens it; a button on it closes the job and returns you to the list." Every word is a decision that constrains, but nothing dictates the pixels.

### Who does it, and when

Shaping is **closed-door work done by one or two people** — someone with design sense and someone with technical sense. Two is the sweet spot. Six people in a room is a meeting, not shaping.

It runs **in parallel** with the current cycle, not inside it. Nothing you shape is promised to anyone. It becomes real only if it's bet on later.

> **Shaping is not estimating.** You are not asking "how long will this take?" You are deciding "how much is this worth?" and then designing something that fits.

---

## 2. Stage 0 — Capture the raw idea

Every shaping run starts with a **trigger**. The usual ones:

- a pattern in support tickets,
- a deal that stalled on a missing capability,
- a follow-up gap left by something we shipped,
- our own frustration using the product,
- a strategic bet nobody asked for.

**What to write down:** one or two lines, in the requester's own words, plus *what they were actually trying to do when they hit the wall*. That second half is what you'll need in Stage 2.

**What not to do:** don't promise anything, don't add it to a roadmap, don't groom it. If an idea matters, it comes back on its own. If it doesn't come back, it wasn't worth the time.

> **Running example — Stage 0**
> Sales: *"We need a mobile app."*
> Context noted: said after a renewal call where the customer's technicians were phoning the office all day to ask what job was next.

**You leave this stage with:** a one-liner, who raised it, and what happened.

---

## 3. Stage 1 — Set the appetite

The **appetite** is how much time this idea is worth — decided *before* you know the solution.

Two standard sizes, scaled to whatever cycle length we settle on:

| | 6-week cycle | 4-week cycle |
|---|---|---|
| **Small batch** | 1–2 weeks | 1 week |
| **Big batch** | 6 weeks — the whole cycle | 4 weeks — the whole cycle |

> **Cycle length is a team decision.** Set it once in `.shaping.json` (`cycleWeeks`). Until it's set, wherever this guide says "six weeks," read "one full cycle."

Fixed time, variable scope. The appetite is not a prediction; it's a constraint that changes which solutions you're even allowed to consider. "A mobile app" and "one cycle" produce completely different designs than "a mobile app" and "whatever it takes."

**How to set it:** ask the question in both directions.

- *If this took the whole cycle, would we still want it?* If no, it's a small batch — or nothing.
- *If we only gave it a week or two, would that version be worth shipping?* If yes, start there.

If the honest answer is "this is worth six weeks but only if we get all of it," you don't have an appetite yet — you have a wish. Keep narrowing (Stage 2) until a real number fits.

> **Running example — Stage 1**
> Appetite: **one big batch — a full cycle, one team.** Renewals are exposed, so it's worth the whole cycle — but not a native app project spanning months.

**You leave this stage with:** a number (a small batch, or a full cycle) written down and defensible.

---

## 4. Stage 2 — Narrow the problem

People bring you solutions, not problems. Your job is to dig back down to the problem, then narrow it to something specific enough to solve.

**The question that does most of the work:**
> *"What happened, specifically, right before you asked for this?"*

Then keep pulling: who was it, what were they doing, what did they do instead, how often does it happen.

**Warning phrases** that mean you haven't found the problem yet:

- "make it configurable" / "add a setting for it"
- "like [competitor] has"
- "a dashboard for it"
- "we need a mobile app"

These are all solutions wearing a problem's clothes. Each one hides a specific person stuck in a specific moment.

**Then set boundaries.** Narrowing means deciding what the project is *about* — and saying out loud what it isn't.

| Raw request | Real problem underneath |
|---|---|
| "We need a mobile app." | Technicians in the field can't see today's schedule or close a job without calling the office. |
| "Add export to Excel." | Finance rebuilds one specific summary by hand every month. |
| "Make notifications configurable." | One noisy notification is training people to ignore all of them. |

> **Running example — Stage 2**
> **Problem:** A technician standing outside a customer's building has no way to see what job is next or mark the current one done. They phone dispatch, who reads it off the desktop schedule. It happens 5–10 times a day per technician.
> **Boundaries:** today's schedule only (not the week). Technicians only (not dispatchers, not customers). Mobile browser, not a native app. No changes to how jobs are created.

**You leave this stage with:** one paragraph naming a specific actor in a specific situation, plus an explicit list of what's out.

---

## 5. Stage 3 — Find the elements

Now you sketch — but at the right altitude. Two tools, in this order.

### 5.1 Breadboarding

Borrowed from electronics: wire up the components and check that current flows, before you care what the box looks like. Three parts, written in **words**:

- **PLACES** — things you can navigate to: screens, dialogs, panels, menus.
- **affordances** — things you can act on or read: buttons, fields, copy, a list.
- **connection lines** — arrows showing what leads where.

```
  TODAY                     JOB                       TODAY (returned)
  ─────                     ───                       ────────────────
  date + "3 of 7 done"      customer + address        job shows as done
  job row  ──────────────►  address → maps app        next job at top
  job row                   phone → dialer            "job closed" flash
  job row                   notes from dispatch
                            [ Mark done ] ──────────►
```

Read it out loud as a story: *"They open TODAY, see three of seven done, tap a job, land on JOB, tap the address to get directions, come back, tap Mark done, and they're back on TODAY with the next job at the top."*

That paragraph is a design. It contains real decisions — the job list is the home screen, closing a job returns you to the list, directions are handed to the phone's map app — and not one pixel.

**Do several.** Breadboards are cheap. Do a version where closing a job requires a signature, a version where it doesn't, and compare them as stories.

### 5.2 Fat marker sketch

Use this only when **layout itself is the question** — when relative size, position or grouping is part of the idea. Draw with a marker so thick you physically cannot add detail. On a tablet, use a huge brush. If you can write a label small enough to read, your pen is too thin.

```
 ┌──────────────────────────┐
 │  ▓▓▓▓▓  3 of 7           │   ← date + counter, small
 ├──────────────────────────┤
 │  ████████████████   9:00 │
 │  ████████████████  11:30 │   ← big tappable rows,
 │  ████████████████   2:00 │      thumb-sized
 └──────────────────────────┘
```

The point of the sketch above is *"big rows, time on the right, nothing else on the screen."* That's all it should be able to say.

### 5.3 How to run the session

- Two people, 45–90 minutes, whiteboard or paper.
- Walk one concrete use case from beginning to end. Name places out loud as you go.
- If you find yourselves arguing about wording, colour or exact placement — **you've dropped too low.** Go back up.
- If you can't name the places at all — **you're too high.** Pick a narrower case and walk it again.
- Expect two or three sessions on different days. Shaping benefits from sleep.

**You leave this stage with:** one to three breadboards that cover the main use case, and a sketch only if layout mattered.

---

## 6. Stage 4 — Risks and rabbit holes

This is the stage that saves cycles, and the one people skip. Assume your shape is broken and go hunting.

### 6.1 The slow-motion walkthrough

Re-tell the story one step at a time, and after every step ask **"and then what?"** and **"what if…?"** You're looking for:

- a step where **nobody has designed** what happens (an error, an empty state, a conflict),
- **unfamiliar technical territory** — something we've never done here before,
- an **interdependency** — this can't ship until something else does,
- a case that quietly **doubles the scope**.

### 6.2 Three legal moves

When you find a hole, you may do exactly one of these:

1. **Cut it.** The feature is smaller now. Fine.
2. **Patch the shape.** Change the design so the hole no longer exists — often by choosing a duller, simpler mechanism.
3. **Declare it out of bounds (a "no-go").** Write it in the pitch as explicitly not included.

What you may *not* do is write "we'll figure it out during the cycle." That sentence is how six-week projects become ten-week projects.

> **The shorter the cycle, the higher this bar.** One unexamined rabbit hole costs about a sixth of a six-week cycle and a quarter of a four-week one. If we run four weeks, "probably fine" is not an acceptable answer at this stage — send it back to yourself for another session instead.

### 6.3 Targeted technical consult

Bring a **specific question** to a specific engineer — fifteen minutes, not a design review.

Good: *"If the phone loses signal mid-submit, can we retry safely without double-closing a job?"*
Bad: *"What do you think of this?"*

> **Running example — Stage 4**
>
> | Hole found | Move |
> |---|---|
> | Offline use in basements/lifts | **No-go.** Show a clear "you're offline, try again" state. |
> | Photo proof of completion | **No-go this cycle.** Named in the pitch so nobody assumes it. |
> | Technician login — they have no accounts | **Patch:** dispatch texts a magic link each morning. 15-min check with backend: safe. |
> | Job spans midnight / multi-day jobs | **Patch:** it appears on the day it starts. Good enough. |
> | Time zones across branches | **Patch:** use the branch's time zone, always. |

**You leave this stage with:** every hole either cut, patched, or written down as a no-go. Nothing left open.

---

## 7. Stage 5 — Write the pitch

The pitch is how shaped work travels. Five ingredients:

1. **Problem** — the raw idea, the specific case, the actor. Why now.
2. **Appetite** — how much time this is worth. One line.
3. **Solution** — the shape, as breadboards/sketches plus prose. Annotate the sketches so a reader alone at 9pm understands them.
4. **Rabbit holes** — the holes you found and the decisions you made, so nobody re-opens them.
5. **No-gos** — what is explicitly excluded.

Write it, post it, let people read it **before** any meeting. Present it, don't sell it. If it needs selling, it isn't shaped.

### Worked example — the full pitch

> **Today's Jobs on the phone**
>
> **Problem.** A technician standing outside a customer's building has no way to see what job is next, or to mark the one they just finished as done. They call dispatch, who reads it off the desktop schedule — 5–10 times a day, per technician. Two of our three largest accounts raised it in renewal conversations. Sales asked for "a mobile app"; the pain is these two moments.
>
> **Appetite.** One full cycle, one team. Not a native app.
>
> **Solution.** A mobile web page at one URL, opened from a link dispatch texts each morning.
>
> `TODAY` lists today's jobs, biggest thing on the screen, with a "3 of 7 done" counter. Tapping a job opens `JOB`: customer, address (tap → phone's map app), phone (tap → dialer), dispatch's notes, and a **Mark done** button. Marking done returns to `TODAY` with the job struck through and the next one on top. That's the whole thing.
>
> **Rabbit holes.**
> • *Auth:* magic link per day, checked with backend — no new account system.
> • *Multi-day jobs:* show on the start day only.
> • *Time zones:* branch time zone, always.
> • *Bad connection:* one honest "couldn't save, tap to retry" state. Nothing clever.
>
> **No-gos.**
> • No offline mode. • No photos or signatures. • No week view. • No dispatcher or customer views. • No native app, no app stores. • No editing job details.

**You leave this stage with:** a document someone can read cold and act on.

---

## 8. After the pitch

The pitch goes to the **betting table** (that's Part 2 of the book — a separate guide). Two things worth knowing now:

- A pitch that isn't bet on is **not rejected**. It just wasn't this cycle's best use of six weeks.
- There is **no backlog**. Pitches don't rot in a queue; if the idea still matters next cycle, someone re-pitches it. That takes minutes, because the shaping is already done.

---

## 9. Checklist before you post a pitch

- [ ] I can name the specific person and the specific moment they're stuck in.
- [ ] The appetite was set before the solution, and is written down.
- [ ] Someone could build this **without me** and I'd still recognise the result.
- [ ] There are no pixels, no exact copy, no exact spacing in it.
- [ ] I walked the whole story in slow motion, out loud.
- [ ] Every rabbit hole is cut, patched, or declared a no-go.
- [ ] Someone technical answered my specific unknowns.
- [ ] The no-gos are written down, not just understood by me.
- [ ] If we had to trade scope for time in week five, it's obvious what we'd drop.
- [ ] It reads as an offer, not an order.

## 10. Smells that it isn't shaped yet

- It's a list of features rather than one connected story.
- The word "just" appears in a place you haven't examined.
- You can't explain it without drawing a real screen.
- You catch yourself thinking "the team will work that part out."
- Every part feels essential — nothing could be cut. (Then the appetite is fiction.)
- It's longer than roughly a page and a half.

## 11. Common mistakes

| Mistake | Fix |
|---|---|
| Shaping alone with no technical input | 15-minute consults, specific questions |
| Shaping in a group of six | One or two people, closed door |
| Producing wireframes | Breadboard in words first, always |
| Estimating instead of setting an appetite | Decide the time, then design to it |
| Skipping the no-gos | They're the cheapest insurance in the process |
| Promising the idea at Stage 0 | Nothing is promised until it's bet on |
| Treating shaped-but-unbet work as a backlog | Let it go; re-pitch if it still matters |

## 12. Glossary

- **Appetite** — time we're willing to spend, chosen before the solution.
- **Small batch / big batch** — 1–2 weeks vs. a full six-week cycle.
- **Breadboarding** — sketching in words: places, affordances, connection lines.
- **Fat marker sketch** — a drawing too coarse to contain detail.
- **Rabbit hole** — an unexamined part that can swallow a cycle.
- **No-go** — something deliberately excluded, written down.
- **Pitch** — the five-ingredient write-up of shaped work.
- **Betting table** — where we decide what to bet the next cycle on.
- **Circuit breaker** — if a bet isn't done by the deadline, it doesn't get extended by default.

---

## 13. Make it yours

The rest of this guide is method. This part is the decisions each team makes once, then writes down. The cycle length and languages go in `.shaping.json`, so the skill applies them for you.

- **Cycle length:** 4 or 6 weeks. This sets the appetite ladder in §3.
- **Who shapes:** always one or two people, one design-leaning and one technical.
- **When:** during the current cycle, in protected blocks.
- **Where pitches live:** one document per pitch, using the five ingredients as headings.
- **Cadence:** when raw ideas get reviewed, and how many days before the betting table a pitch must be posted.
- **One rule worth keeping from day one:** no pitch reaches the table with an open rabbit hole.
