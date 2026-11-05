# system.md: how it's built

## Shape

A static single-page React app. `npm run build` produces `dist/`, Amplify serves it. Nothing runs on a server. All content comes from one JSON file imported at build time.

```
GitHub (main) ──push──> Amplify Hosting ──build──> dist/ ──> CloudFront ──> visitor
```

## Repo layout

```
/
  amplify.yml
  customHttp.yml            (optional headers, see below)
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  README.md
  public/
    favicon.svg
    og.png
    img/rithvik.jpg
    resume.pdf
  scripts/
    check-content.mjs
  src/
    main.tsx
    App.tsx
    content/
      content.json
      types.ts
    components/
      Header.tsx
      Hero.tsx
      About.tsx
      Skills.tsx
      Projects.tsx
      Footer.tsx
      ticket/
        Ticket.tsx
        Panel.tsx
        Stub.tsx
        Hint.tsx
        useScratch.ts
        foil.ts
    lib/
      storage.ts
    styles/
      tokens.css
      base.css
      layout.css
      ticket.css
  docs/
    (prd, srs, system, design, rules, assets, antigravity-prompt)
    aws-setup.md
```

## Ticket internals

State lives in `Ticket.tsx`:

- `revealed: Set<string>` of project ids
- `openStub: string | null`
- `unlocked: boolean`, derived: count of revealed non-golden panels >= `ticket.unlockAfter`

`Panel.tsx` renders the content layer (code, title, event tag) and, if not revealed, a `<canvas>` foil on top. Content is in the DOM from the start, so screen readers and "view source" see it. Only the canvas hides it visually.

### Foil (`foil.ts`)

Drawn procedurally, no image file:

1. Fill with `--foil` (golden panel: `--accent`).
2. Add about 1,200 speckles, 1 px, random positions, alternating a slightly darker and slightly lighter tone at 6-14% alpha. Use a seeded random (seed = project id) so each panel's foil looks the same on every load.
3. Add 6-10 horizontal hairlines at 4-8% alpha.
4. Print the panel code (`01`, `02`...) bottom-left in the mono font, `--foil-dark`.

### Scratching (`useScratch.ts`)

- Size the canvas to the panel's client rect times `min(devicePixelRatio, 2)`.
- On `pointerdown`: `setPointerCapture`, start a stroke, mark `scratching = true`.
- On `pointermove` while scratching: with `globalCompositeOperation = 'destination-out'`, draw a line from the last point to the current one. `lineCap = 'round'`, `lineWidth = 22 * dpr`.
- Every 120 ms during a stroke and on `pointerup`: sample the alpha channel with `getImageData`, stepping 8 pixels in x and y. Cleared ratio = transparent samples / total samples.
- At >= 0.55: fade the canvas out (opacity transition 250 ms), then remove it. Call `onReveal(id)`.
- Canvas gets `touch-action: none` so a drag scratches instead of scrolling. Because of that, the ticket sits inside page gutters of at least 16 px, and the header and the "Reveal all" row stay scrollable. Don't make the ticket full-bleed on mobile.
- On resize, if the panel is unrevealed, redraw a fresh foil and reset progress. Revealed panels stay revealed.
- `prefers-reduced-motion: reduce` swaps the fade for instant removal.

### Stub

`Stub.tsx` shows the selected project below the ticket: code, title, event, what, wrong (with a small label "What went wrong"), stack, links. It replaces its content when another panel opens. Don't animate height; fade only.

### Persistence (`lib/storage.ts`)

```
get(key)  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
set(key, value) try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
```

Key: `ticket.v1`. Value: array of revealed ids. On load, panels in the saved list start revealed with no foil.

## Content check (`scripts/check-content.mjs`)

Reads `src/content/content.json`. Exits 1 with a readable message if:

- any string anywhere contains `TODO`
- a project has an empty `what` or `wrong`
- project ids repeat
- there isn't exactly one project with `golden: true`
- fewer than `ticket.unlockAfter + 1` projects exist

## AWS deployment

Service used: AWS Amplify Hosting (connected to GitHub). That's the only service. Amplify serves the built files through its CDN (CloudFront), but nothing there is configured by hand, so don't claim S3 or CloudFront as services I set up.

Steps:

1. Push the repo to GitHub (public).
2. AWS Console > Amplify > Create new app > Host web app > GitHub. Authorize, pick the repo and `main`.
3. Build settings: use the repo's `amplify.yml`.
4. Deploy. Open the `*.amplifyapp.com` URL.
5. Test on a phone.
6. Take screenshots (see assets.md).

`amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 20
        - nvm use 20
        - npm ci
    build:
      commands:
        - npm run check:content
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

`customHttp.yml` (optional):

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'Referrer-Policy'
        value: 'strict-origin-when-cross-origin'
  - pattern: '/assets/**'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
```

`docs/aws-setup.md` is a short log of what I clicked and what went wrong, written as I go, so the submission write-up isn't written from memory.

## Things that can go wrong

| Problem | Likely cause | Fix |
|---|---|---|
| Amplify build fails on `check:content` | A TODO is still in content.json | Fill it in. That's the check doing its job |
| Amplify build fails on npm | Node version | Keep the `nvm install 20` lines |
| Blank page on Amplify only | Wrong `baseDirectory` | Must be `dist` |
| Ticket can't scroll on phone | Ticket is full-bleed | Keep 16 px gutters |
| Foil looks different each load | Unseeded random | Seed with project id |
| Fonts flash | Fonts not imported in main.tsx | Import @fontsource packages at the top of main.tsx |
