# Presscut Founder Demo (Remotion)

## What this is

This composition is a founder-led, screen-first demo template:

- Big, readable UI in a browser frame
- Cursor moves + click ripples + callouts
- Short “founder voiceover” lines (text only for now)

## Files

- Composition: `PresscutFounderDemo`
- Code: [PresscutFounderDemo.tsx](file:///Users/torutano/personalos/personalos/personalos/frontend/remotion/presscut/PresscutFounderDemo.tsx)
- Assets folder: `frontend/public/remotion/presscut/`

## Run

```bash
npm run remotion:preview
npm run remotion:render:presscut
```

Output:

- `frontend/out/presscut-founder-demo.mp4`

## Make it look like the real product

Drop in real assets (preferred order):

1) 1920px-wide PNG screenshots of the actual app/web UI
2) Short MP4 screen recordings of key flows (we can cut/zoom them per scene)

Recommended initial assets:

- `public/remotion/presscut/homepage.png`
- `public/remotion/presscut/core-workflow.png`
- `public/remotion/presscut/result.png`

Then set `screens` in the default props in [Root.tsx](file:///Users/torutano/personalos/personalos/personalos/frontend/remotion/Root.tsx).

