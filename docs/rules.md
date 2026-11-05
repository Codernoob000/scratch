# rules.md

For the coding agent. Follow these on every task in this repo.

## Read first

Before writing code, read `docs/prd.md`, `docs/srs.md`, `docs/system.md`, `docs/design.md` and `docs/assets.md`, in that order. If two docs disagree, `srs.md` wins for behaviour and `design.md` wins for looks.

## Stack, fixed

- Vite, React 18, TypeScript (strict), plain CSS with custom properties.
- Fonts from `@fontsource` packages.
- Nothing else. No Tailwind, no component library, no animation library, no icon package, no state library, no router.
- If you think a new dependency is needed, stop and say why instead of installing it.

## Content

- All visible text comes from `src/content/content.json`. Components don't contain copy, except button labels and aria labels.
- Never invent facts: no project names, numbers, dates, links, employers, awards or quotes. If something is missing, leave a `TODO` in the JSON and tell me. Don't fill it with something plausible.
- Don't reword the `wrong` lines. They're deliberately plain.

## Copy and tone, for any text you write

- Short sentences. First person where it's me talking.
- No exclamation marks. No emoji.
- Don't use these words: seamless, leverage, cutting-edge, passionate, innovative, robust, empower, delve, tapestry, ever-evolving, game-changing, revolutionize, journey, unlock the power, world-class.
- Comments in code explain why, not what. Skip comments that restate the line.

## Look

`design.md` is the spec. The short version: flat, matte, paper and ink, one terracotta accent. No gradients, glows, blur, shadows, neon, purple or blue, mascots, sparkles, pixel art, emoji icons, pill tag clouds or skill bars. Corners 8px or less. If a design choice isn't in `design.md`, pick the plainer option.

## Behaviour

- The ticket must never block the page. Gutters of at least 16px, "Reveal all" button, keyboard access, and the same content in the Projects section.
- No network calls at runtime. No analytics, no fonts from a CDN, no remote images.
- localStorage access goes through `lib/storage.ts` and is always in try/catch.
- Respect `prefers-reduced-motion`.
- No `any` types. No `// @ts-ignore`.

## How to work

- Build in the phases listed in `docs/antigravity-prompt.md`. Finish one before starting the next.
- After each phase run `npm run check:content` (once it exists) and `npm run build`. Both must pass. Fix failures before moving on, don't skip them.
- When a phase involves the UI, run the dev server and look at it at 360, 768 and 1280px wide. Report what you saw, including anything off.
- Small commits, one per phase, message says what changed in plain words.
- If something fails twice, simplify. Don't stack workarounds or add libraries to get past it.
- Don't edit files in `docs/` unless I ask.
- Don't touch git remotes, don't push, don't deploy. I do the Amplify setup myself.

## Reporting

At the end of each phase, say:
1. What you built.
2. What you ran and the result.
3. Anything you weren't sure about or left out.

Don't call something finished if you haven't run it.
