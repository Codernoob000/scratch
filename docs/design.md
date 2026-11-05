# design.md

The look: a printed ticket on warm paper. Flat, matte, quiet. If it could be mistaken for a SaaS landing page or an AI demo, it's wrong.

## One theme

Light only. No dark mode, no theme switcher.

## Colour

```css
:root {
  --paper:      #F4EFE6;  /* page background */
  --paper-2:    #EBE4D6;  /* ticket body, cards */
  --ink:        #1F1D1A;  /* text, borders */
  --ink-2:      #5E5950;  /* secondary text */
  --line:       #D8D0C0;  /* hairlines */
  --foil:       #CFC8BA;  /* scratch layer */
  --foil-dark:  #B9B2A3;  /* printed marks on the foil */
  --accent:     #B4573A;  /* fills, rules, golden foil. Not for small text */
  --accent-ink: #8F4128;  /* small accent text, links */
}
```

One accent only. Terracotta appears in: the golden panel, the hint's coin, link underlines, the stamp on the ticket header, the "unlocked" label. Nowhere else.

Contrast: `--accent` on `--paper` is about 4.2:1, so it's for large shapes and lines. Any accent text under 18px uses `--accent-ink` (about 6:1).

## Type

| Use | Font | Notes |
|---|---|---|
| Headings, project titles | Newsreader (variable) | Weights 500-600. Slightly tight tracking on large sizes |
| Body | IBM Plex Sans | 400, 500 |
| Codes, serial, labels on the ticket | IBM Plex Mono | 400, 500, small caps feel via uppercase + letter-spacing 0.08em |

Load with `@fontsource-variable/newsreader`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`. Import in `main.tsx`. Don't link Google Fonts.

Scale (desktop / mobile):

- Name in hero: 64px / 40px, line-height 1.02
- Section heading: 36px / 28px
- Project title: 22px / 20px
- Body: 17px / 16px, line-height 1.6
- Labels: 12px mono, uppercase, letter-spacing 0.08em

Body text column max width: 62ch.

## Layout

- Page max width 1120px, side padding 16px on mobile, 32px on desktop. Never less than 16px on the sides. The ticket needs the gutters for scrolling on phones.
- Section spacing: 96px between sections desktop, 64px mobile.
- Alignment: left-aligned. No centered hero text.
- Header: name wordmark left, three links and Résumé right. A hairline under it. Not sticky.

## Hero

Left side (desktop): name, one-line description, hint. Under it, the ticket at full content width. On mobile everything stacks.

Hero copy:

- Name: `Gattu Rithvik`
- Line: `Third-year IT student in Hyderabad. I build LLM tools and write down what broke.`
- Hint: `Scratch the ticket. Each panel is something I built. One is hiding.`

## The ticket

Anatomy, top to bottom:

1. Header strip (mono, 12px): `ADMIT ONE` left, `HACKATHON SEASON 2026` center-ish (hide on narrow), serial `No. 0011` right. A small rotated rectangular stamp in `--accent` outline reading `SCRATCH`, slightly off-axis (-3deg). Flat, outline only.
2. Perforation line: a dashed 1px line in `--line`, with a half-circle notch cut into the left and right edges using CSS masks. No shadows.
3. Panel grid: 4 columns on desktop, 2 on mobile, 8px gap. 10 normal panels at 1 column each, golden panel spans 2 columns. Desktop panel height about 132px, mobile about 112px.
4. Footer strip: counter on the left (`3 of 11 revealed`), "Reveal all" text button on the right.

Ticket body is `--paper-2`, 1px `--ink` border, 6px radius. No box-shadow.

### Panels

- Under the foil: code (`01`) top-left in mono, project title in Newsreader 18px, event tag in mono 11px if present.
- Foil: see system.md. Matte, no shine, no gradient.
- Border: 1px `--line`. Revealed panels get a 1px `--ink` border.
- Golden panel (locked): flat `--accent` fill, label in `--paper` mono 12px: `scratch 5 first · 2 of 5`. When unlocked the label becomes `unlocked` and the fill gets the same speckle foil treatment in terracotta tones.
- Hover (pointer devices): cursor becomes the coin. No scale, no lift.
- Focus: 2px `--ink` outline with 2px offset.

### Stub

A card under the ticket, `--paper` background, 1px `--ink` border, a dashed top edge to look torn from the ticket. Contents:

- mono line: `01 · OpsBrain AI · ET AI Hackathon 2026`
- title (Newsreader 28px)
- `what` paragraph
- label `What went wrong` (mono, `--accent-ink`) then the `wrong` paragraph
- stack as a plain comma-separated line in mono 13px, not pills
- links as underlined text

## Motion

Allowed, and that's all:

1. Foil fade-out when a panel clears (250ms, ease-out).
2. Stub text fade-in (150ms).
3. Hint pulse before the first scratch (opacity 1 to 0.55, 2.4s, ease-in-out, infinite).

Nothing animates on scroll. No parallax, no cursor trails, no confetti, no typing effects. All three above are off under `prefers-reduced-motion`.

## Coin cursor and icon

A flat circle, 28px, `--accent` fill, a 1.5px `--ink` outline, and a small `$`-free mark: a short vertical slot line in the middle (it's a coin you scratch with). SVG source is in assets.md. Use it as the cursor over unrevealed panels (`cursor: url(...) 14 14, pointer`) and as the hint icon.

## Sections below the hero

- About: photo left (4:5, 280px wide desktop, full width mobile, no filter, no rounded blob, 2px radius), text right.
- Skills: group name in mono label style, items as a comma-separated line in body text. Two columns on desktop. No bars.
- Projects: 2-column grid of flat cards (1px `--line` border, `--paper-2` background). Same fields as the stub. Golden project is listed last, labeled `The one I shelved`.
- Footer: hairline, one line of links, `Built on AWS Amplify.` and the year.

## Copy voice

Write like I talk to a classmate, not like a brochure.

| Don't | Do |
|---|---|
| "Passionate AI engineer leveraging cutting-edge LLMs" | "I build LLM tools." |
| "Seamless, robust, scalable solution" | "It works end to end. It isn't hardened yet." |
| "Embarking on a journey" | (just say what you did) |
| "Unlock the secret!" | "One is hiding." |

No emoji, no exclamation marks, no "Welcome to my world".

## Banned list

Anything that makes it look generated:

- Neon or any saturated colour, purple, electric blue, cyan
- Gradients (including text gradients), glow, blur, glassmorphism
- Box shadows (use borders)
- Dark hero with floating particles or grid lines
- Mascots, robots, sparkles, "AI" iconography, brain icons
- Pixel art or 8-bit arcade styling
- Emoji as icons, icon packs
- Stock photos, 3D renders, generated illustrations
- Pill-shaped tag clouds
- Rounded corners above 8px
- Centered everything
- Skill bars and percentages
- Scroll-triggered animations

## Responsive notes

- 360px: header links shrink to 14px and wrap to a second line if needed. Ticket in 2 columns. Panel height 112px.
- 768px: ticket in 4 columns, panel height 120px.
- 1280px and up: layout as described, max width 1120px.
- Check at 360, 390, 768, 1280, 1920.
