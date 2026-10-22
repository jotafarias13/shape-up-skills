# Grill map

One section per stage of the travel guide. In each:

- **Done when** is the exit gate. Don't leave the stage until it's met.
- **Questions** are in rough priority order. Ask the first one that's still open, with your best guess attached.
- **Smells** tell you when to push back.

Stages normally run in order, but loops are allowed and expected. If the appetite is still a wish after Stage 1, go narrow the problem (Stage 2), then come back and confirm the appetite.

---

## Stage 0 — Capture the raw idea

**Done when** you have: the request in the requester's own words, who raised it, and what was happening when they hit the wall.

**Questions**

- Who asked for this, and what exactly did they say?
- What triggered it: a pattern in support, a stalled deal, a gap left by something you shipped, your own frustration, or a strategic bet nobody asked for?
- What was the person actually trying to do when they hit the wall?

**Smells**

- No trigger at all ("it would be nice"). That's fine for a strategic bet, but get the user to say so explicitly.
- The user starts promising or roadmapping it. Remind them, once, that nothing is promised until it's bet on.

---

## Stage 1 — Set the appetite

**Done when** it is small batch or big batch (one full cycle), plus one sentence on why it's worth exactly that much.

**Questions**, asked in both directions as the guide does:

- If this took the whole cycle, would we still want it? If no, it's a small batch or nothing.
- If we only gave it a week or two, would that version be worth shipping? If yes, start there.

Use the question tool here, with your recommendation and its reason.

**Smells**

- **An estimate instead of an appetite**, like "it'll take about three weeks." Reframe: forget how long it takes, how much is it worth?
- **A wish**, like "worth a full cycle, but only if we get all of it." There's no appetite yet. Go to Stage 2, narrow, and come back.
- **"Whatever it takes."** Name it as the absence of an appetite and ask the two questions again.

---

## Stage 2 — Narrow the problem

**Done when** you have one paragraph naming:

- a specific actor in a specific situation;
- what they do today instead (the workaround, or baseline);
- how often it happens;

plus an explicit list of what's out (the boundaries).

**Questions**

- What happened, specifically, right before you asked for this? This question does most of the work.
- Who was it? What were they doing? What did they do instead? How often?
- What does today's workaround cost them? Time, money, a customer, trust?
- What is this project *not* about? Offer boundaries as guesses for the user to confirm: which users, which surfaces, what time range, which existing flows stay untouched.

**Smells**

- **Warning phrases:**
  - "make it configurable" or "add a setting"
  - "like [competitor] has"
  - "a dashboard for it"
  - "we need an app"
  - "add AI to it"

  These are solutions wearing a problem's clothes. Dig for the person stuck in the moment.
- **A grab bag**, like "redesign the settings page" or a list of unrelated asks. Either pick the one problem that matters most and shape that, or give the verdict Don't shape.
- **No frequency or cost.** If nobody can say how often it hurts, the appetite is guesswork. Ask.

---

## Stage 3 — Find the elements

This is where the user's original solution comes back, now judged against the appetite and the narrowed problem.

**Done when** all of these hold:

- A breadboard covers the main use case end to end: places, affordances and connection lines.
- The story reads as one paragraph out loud.
- Real forks were compared as alternative breadboards, or explicitly dismissed.
- You've decided, and logged in the ledger, whether layout itself is part of the idea. Only then does it need a fat marker sketch.

**How to run it**

- Ask the user to walk one concrete use case from the start. Transcribe it into a text breadboard as they talk: places in CAPS, affordances underneath, `→` for connections, buttons as `[ Label ]`. Show it back after each change.
- Ask about the gaps you see: "After [ Mark done ], where do they land?" "What's on JOB besides the button?"
- Where a real fork exists ("signature required or not?"), sketch both as stories and let the user pick. The guide says to do several; they're cheap.
- **Non-UI work** (APIs, webhooks, background jobs, integrations): places become systems or states (`OUR APP`, `PROVIDER`, `WEBHOOK`), and affordances become the calls and events between them.
- **The layout question:** "Is anything about *where* things sit or how big they are part of the idea, or is the flow enough?" Default to no.

**Altitude checks**, from guide §5.3:

- Arguing about wording, colour or exact placement means you've dropped too low. Go back up to places and affordances.
- Not being able to name the places means you're too high. Pick a narrower case and walk it again.

**Smells**

- A list of features rather than one connected story.
- "The team will work that part out."
- The user can't explain it without describing a real, finished screen.
- The solution is clearly bigger than the appetite. Say so and ask what gets cut. Don't silently trim it yourself.

---

## Stage 4 — Risks and rabbit holes

**Done when** all of these hold:

- The slow-motion walkthrough is finished.
- Every hole found has exactly one move: **Cut**, **Patch** (with how), or **No-go**.
- Every technical unknown is answered, either by your own code check or a named engineer.
- The week-five question is answered: if we had to trade scope for time late in the cycle, what goes first? Mark those items `~` (nice-to-have).
- Nothing reads "we'll figure it out during the cycle."

**The slow-motion walkthrough.** Retell the story one step at a time. After each step, ask "and then what?" and "what if…?" You're hunting for four things:

- **Undesigned steps:** errors, empty states, conflicts, cancel and undo.
- **Unfamiliar technical territory:** something this team hasn't done before.
- **Interdependencies:** this can't ship until something else does.
- **Scope doublers:** a case that quietly doubles the work.

**For each hole,** ask the move through the question tool with your recommendation. Prefer duller, simpler mechanisms when patching (guide §6.2). Never accept "probably fine." The shorter the cycle, the higher the bar.

**Hunt list.** Run through these mentally. Ask only about the ones that apply to this shape.

- **Failure:**
  - The network drops mid-action.
  - A third party is down or slow.
  - Double-submits and retries.
- **First use and edges:**
  - Empty states.
  - Existing data that doesn't fit the new shape, or needs migrating.
  - Very large lists.
- **Who can do what:**
  - Auth and permissions.
  - Multi-tenant boundaries.
  - Users without accounts.
- **Time:**
  - Time zones.
  - Things spanning midnight or several days.
  - Deadlines and expiry.
- **Surfaces:**
  - Mobile vs desktop.
  - Notifications: who gets told, and does anyone need to be?
- **Money:**
  - Payments, refunds, plan limits, anything billable.
- **Language:**
  - UI copy in every language the product supports.
  - Date and number formats.
- **AI features**, when the shape uses a model:
  - What happens when the output is wrong or unusable, and how the user notices.
  - Latency, and whether it streams or waits.
  - Cost per call at expected volume.
  - Untrusted user content flowing into prompts.
  - How "good enough" gets judged before shipping.
- **External providers** (signatures, payments, messaging):
  - Webhooks arriving late, twice, or out of order.
  - Sandbox vs production differences.
  - Provider limits.

**Code checks.** Inside a repo, settle technical holes yourself before asking:

- Grep for the model or table.
- Read the existing endpoint.
- Check how auth or webhooks are done today.

Report in one line, for example: "Checked `app/models/job.py`: jobs have no status field, so marking done needs a migration. That's a hole: Patch with a `completed_at` column?"

**Smells**

- The word "just" in a place nobody has examined.
- Every part feels essential and nothing could be cut. Then the appetite is fiction; go back to Stage 1 or 2.
- A hole the user wants to leave open. That's Not ready, not a pitch with a caveat.

---

## Before playback

Check the guide's §9 checklist against the ledger. Anything that fails becomes either one more question, or a line in the not-ready note.
