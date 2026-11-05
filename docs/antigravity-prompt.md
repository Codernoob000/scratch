# Antigravity prompt

## Setup, before pasting anything

1. Create an empty folder `portfolio` and open it as the Antigravity workspace.
2. Make a `docs/` folder inside it and drop in: `prd.md`, `srs.md`, `system.md`, `design.md`, `rules.md`, `assets.md`, `antigravity-prompt.md`.
3. Put `content.json` at `src/content/content.json` (create the folders).
4. Put `rules.md` where Antigravity reads workspace rules too: `.agent/rules/rules.md`. If your version doesn't pick that up, the prompt below tells the agent to read it anyway.
5. Add your photo at `public/img/rithvik.jpg` and your résumé at `public/resume.pdf` if you have them. If not, the site still builds.

Then paste the prompt below. Run the phases one at a time and check the result in the browser before saying "continue".

---

## Master prompt (paste this first)

```
You're building my portfolio site for the AWS Builder Center challenge. Deadline is tomorrow, so keep it plain and finish it.

Before anything else, read these files in order: docs/rules.md, docs/prd.md, docs/srs.md, docs/system.md, docs/design.md, docs/assets.md. Then read src/content/content.json. Follow docs/rules.md for the whole task. Where the docs disagree, srs.md wins on behaviour and design.md wins on looks.

What it is: a single-page portfolio (About, Skills, Projects) with one interactive feature, a scratch-off ticket in the hero. Each panel is a project; scratching it reveals what it is and what went wrong. One golden panel stays locked until five others are revealed.

Hard constraints:
- Vite + React 18 + TypeScript (strict) + plain CSS. Fonts from @fontsource. No other dependencies.
- Static only. No backend, no API calls, no analytics.
- Look is flat, matte, paper and ink, one terracotta accent. No gradients, glow, blur, shadows, neon, purple or blue, mascots, sparkles, pixel art, emoji icons, pill tag clouds, skill bars. If it looks like a template or an AI demo, redo it.
- All copy comes from content.json. Do not invent facts, numbers, links or project details. Leave TODO values as they are and tell me about them.
- Don't use the banned words in rules.md in any text you write.
- Don't push, don't deploy, don't touch git remotes.

Work in the phases below. Do ONE phase, then stop and report using the format in rules.md. Wait for me to say "continue" before starting the next one.

Start with Phase 0 only.
```

---

## Phase prompts (paste one at a time)

### Phase 0: scaffold

```
Phase 0. Scaffold the project.
- Vite + React + TypeScript, strict mode.
- Install only: react, react-dom, vite, @vitejs/plugin-react, typescript, @types/react, @types/react-dom, @fontsource-variable/newsreader, @fontsource/ibm-plex-sans, @fontsource/ibm-plex-mono.
- Create the folder layout from docs/system.md.
- src/content/types.ts with types matching the data contract in docs/srs.md section 4. Make src/content/content.json type-check against it.
- styles/tokens.css with the exact custom properties from docs/design.md. base.css with a small reset, body font, colours, link style.
- Import the fonts in main.tsx.
- Write scripts/check-content.mjs as described in docs/system.md and add npm scripts: dev, build, preview, check:content.
- amplify.yml and customHttp.yml exactly as in docs/system.md.
- A plain App.tsx that renders the person's name from content.json.
Run `npm run build` and `npm run check:content`. check:content is EXPECTED to fail right now because content.json has TODO values. Show me its output. Don't edit content.json to make it pass.
```

### Phase 1: page structure and static sections

```
Phase 1. Build the page without the ticket.
- Header, Hero (name, line, hint text, empty placeholder where the ticket will go), About, Skills, Projects, Footer, as described in docs/design.md.
- Projects section lists all projects from content.json as flat cards. Don't render empty links, don't render an empty event. The golden project goes last with the label "The one I shelved". If a project's `wrong` is TODO, render it as-is for now.
- Anchor links in the header: #about, #skills, #projects, plus the Résumé link.
- Responsive per docs/design.md. Check at 360, 768 and 1280px wide and tell me what you saw.
- If public/img/rithvik.jpg doesn't exist, render the About section without the photo for now and tell me.
No ticket yet. Run `npm run build`.
```

### Phase 2: ticket layout, no scratching

```
Phase 2. Build the ticket's layout and state, still without the scratch canvas.
- Ticket.tsx, Panel.tsx, Stub.tsx, Hint.tsx under components/ticket/, following docs/design.md "The ticket" and "Stub".
- 4 columns on desktop, 2 on mobile, golden panel spans 2 columns.
- Panels are buttons. Clicking (or Enter/Space) marks a panel revealed and opens its stub. This is temporary: in the next phase, the scratch will do the revealing and clicking will only reopen already revealed panels. Keep that in mind in how you structure it.
- Golden panel locked until `ticket.unlockAfter` normal panels are revealed. Locked label as in docs/design.md.
- Counter in the ticket footer, "Reveal all" button, hint above the ticket that becomes the counter after the first reveal.
- Persist revealed ids with lib/storage.ts (try/catch), key `ticket.v1`.
- Visually hidden aria-live region for announcements.
- Make sure the ticket has at least 16px gutters on mobile.
Run `npm run build`. Check the layout at 360 and 1280px and tell me what you saw.
```

### Phase 3: the scratch

```
Phase 3. Add the scratch layer, following docs/system.md "Ticket internals".
- foil.ts: procedural foil with a seeded random keyed by project id. Speckles, hairlines, and the panel code printed in the mono font. Matte, no shine, no gradient. Golden panel uses the accent colour.
- useScratch.ts: pointer events with pointer capture, destination-out strokes, round brush, alpha sampling every 120ms and on pointerup, auto-reveal at 55%, 250ms fade, canvas removed afterwards.
- Canvas uses touch-action: none. Panels reveal only by scratching now (or by keyboard Enter/Space, or "Reveal all"). Clicking a revealed panel reopens its stub.
- Redraw fresh foil on resize if the panel isn't revealed.
- Coin cursor over unrevealed, unlocked panels, using public/coin.svg from docs/assets.md. Create that file from the SVG in assets.md.
- prefers-reduced-motion: no fade, no pulse, no stub fade.
- Panels already in saved state start revealed, with no canvas.
Test it for real: run the dev server, scratch a panel with the mouse until it clears, reload and check it persists, try the golden panel before and after five reveals. Tell me exactly what you tested and what happened. If you can't test touch, say so.
```

### Phase 4: polish and checks

```
Phase 4. Finish up.
- Set the page title, meta description, Open Graph tags (og.png may not exist yet, reference it anyway), favicon from assets.md.
- Read docs/srs.md section 3 and go through each NFR. Tell me which pass and which you couldn't verify.
- Run Lighthouse (mobile) if you can, and report the four scores.
- Check contrast on any small accent-coloured text. It should use --accent-ink.
- Go through docs/srs.md section 5 acceptance tests and report each as pass, fail or couldn't test.
- Search the whole repo for the banned words in docs/rules.md and for gradients, box-shadow, blur and neon colours. Report what you find and fix it.
- Write README.md: what the site is, how to run it, how the ticket works, how it deploys on Amplify. Plain words, short. No badges.
- Create docs/aws-setup.md with this header and an empty log I'll fill in: "What I clicked, what failed, what fixed it."
Run `npm run build` one last time. `npm run check:content` should fail only on the TODO values in content.json. List every TODO that's left, with its project id and field.
```

---

## After the agent is done (you, not the agent)

1. Fill every `TODO` in `content.json`. There are five to start: your LinkedIn URL, your email, and the "wrong" lines for PromptShield CI, POINT.FEEDBACK and TenderWin AI. Make them true and specific. One sentence is enough.
2. `npm run check:content && npm run build` locally.
3. Push to a public GitHub repo.
4. Amplify > Host web app > GitHub > pick the repo > deploy. Use `docs/system.md` "AWS deployment".
5. Test on your phone. Take the screenshots from `docs/assets.md`.
6. Submit.

If Antigravity misbehaves, the same prompts work in any other coding agent. The docs don't depend on the tool.
