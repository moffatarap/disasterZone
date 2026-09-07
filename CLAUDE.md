# Working on this project

## Always work on a branch

Any update or edit — code, docs, config — goes on its own branch off the
target branch, never committed straight to `main`. Branch, commit there, then
merge (and push only when the user asks). One branch per logical piece of
work; name it for what it does (`fix/…`, `feat/…`, `docs/…`, `chore/…`).

## Nothing is pushed without a code review

Before **any** `git push`, run `/code-review` and work through what it reports.
Run it on **Opus 5** — pass `model: "opus"` explicitly to any review agent
rather than relying on the session or default inheriting it.

Order of operations for landing work:

1. `npm run lint` and `tsc` clean.
2. `npm run audit` green, screenshots looked at (see below).
3. `/code-review` on Opus 5; fix or consciously accept every finding.
4. Merge, then push — and only when the user has asked for it.

A review finding that's deliberately not being fixed gets recorded (a comment
at the site, or a note in `docs/DECISIONS.md`) so the next review doesn't
re-raise it and "fix" an intentional trade-off.

## UI changes require a mockup review first

Any change to the UI — layout, components, styling, interaction, copy on a
control — **must** go through a mockup review before any code in `src/` is
touched. No exceptions, including changes that look like a one-line tweak.

The loop:

1. **Understand the current behaviour.** Read the affected component(s) and the
   relevant part of [`docs/DECISIONS.md`](docs/DECISIONS.md).
2. **Ask** when the change has a real design trade-off, before mocking anything.
3. **Build a mockup as a published Artifact** — one HTML page showing every
   state of the affected UI, rendered faithfully against the app's real
   palette/chrome, plus a short "decisions / open questions" list. Utilitarian
   treatment, not a landing page.
4. **The user comments on the Artifact.** Read them (`Artifact` action
   `comments`), fold every comment into the mockup, bump a `rev N` label, and
   republish to the **same URL**.
5. Repeat 4 until the user explicitly approves.
6. **Then** implement to match the approved mockup, and run `npm run lint`.

Notes:
- Keep the mockup file in the scratchpad; keep republishing to the one artifact
  URL so the comment history stays intact.
- Comment threads are usually not "sent to Claude", so they can't be replied to
  or resolved from the tool — address them in the mockup and summarise the
  outcomes in chat.

## Every UI change ends with a full visual audit

After **any** UI change — and before reporting it as done — run the exhaustive
browser audit. Lint and typecheck do not substitute for it: they cannot see a
clipped popup, an unreachable button, or a panel covering a control.

```bash
npm run dev          # in another terminal
npm run audit        # drives real Chromium at 3 viewports
```

[`scripts/visual-audit.mjs`](scripts/visual-audit.mjs) walks the user flows,
asserts the features [`docs/DECISIONS.md`](docs/DECISIONS.md) says must exist,
and writes screenshots to `.audit/` (gitignored). It exits non-zero on failure.

Rules:

- **Look at the screenshots**, don't just read the pass count. Some faults only
  show visually.
- **The map is part of the audit** — markers, alert circles, popups, the key,
  zoom/attribution chrome, and how each behaves at every viewport.
- **A failure is the app's fault until proven otherwise.** Confirm the test is
  right before "fixing" it; a wrong selector still means the check was wrong.
- **If a change alters a user flow, stop and ask for review before adding or
  amending flows in the suite.** The flows encode agreed behaviour, so changing
  them is a product decision, not a test fix.
- Keep the suite in step with the docs: a feature added to `docs/DECISIONS.md`
  needs a matching assertion.

## Other

- `npm run lint` must pass before a change is considered done.
- The `gh-pages` branch is the archived 2016–2018 original, not a deploy target.
