# Today's Jobs on the phone

**Shaper:** Example Shaper · **Date:** 2026-10-21 · **Appetite:** Big batch (one full cycle) · **Status:** Shaped — ready for betting

## Problem

A technician standing outside a customer's building has no way to see what job is next, or to mark the one they just finished as done. They call dispatch, who reads it off the desktop schedule, 5–10 times a day per technician. Two of our three largest accounts raised it in renewal conversations. Sales asked for "a mobile app"; the pain is these two moments.

## Appetite

One full cycle, one team. Renewals are exposed, so it's worth the whole cycle, but not a native app project spanning months.

## Solution

A mobile web page at one URL, opened from a link dispatch texts each morning.

`TODAY` lists today's jobs as the biggest thing on the screen, with a "3 of 7 done" counter. Tapping a job opens `JOB`: customer, address (tap opens the phone's map app), phone (tap opens the dialer), dispatch's notes, and a **Mark done** button. Marking done returns to `TODAY` with the job struck through and the next one on top. That's the whole thing.

**Breadboard** — attached: `breadboard.png`

```text
TODAY
  date + "3 of 7 done"
  job row → JOB
JOB
  customer + address
  address → phone's map app
  phone → dialer
  notes from dispatch
  [ Mark done ] → TODAY (returned)
TODAY (returned)
  job shows as done
  next job at top
```

**Sketch** — attached: `sketch-today.png`. Big rows, time on the right, nothing else on the screen.

## Rabbit holes

- **Auth:** dispatch texts a magic link each morning, so there's no new account system. Confirmed with the backend lead.
- **Multi-day jobs:** they show on the start day only.
- **Time zones:** always the branch's time zone.
- **Bad connection:** one honest "couldn't save, tap to retry" state. Nothing clever.

## No-gos

- No offline mode.
- No photos or signatures.
- No week view.
- No dispatcher or customer views.
- No native app, no app stores.
- No editing job details.
