# Working on this project

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

## Other

- `npm run lint` must pass before a change is considered done.
- The `gh-pages` branch is the archived 2016–2018 original, not a deploy target.
