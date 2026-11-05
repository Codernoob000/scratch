# assets.md

Short list. The site is mostly type and borders, so there isn't much to source.

## You provide

| File | Where | Spec |
|---|---|---|
| `rithvik.jpg` | `public/img/` | Your own photo, 4:5 crop, about 800 x 1000 px, under 150 KB. No filter, no background removal. A normal, natural photo works best |
| `resume.pdf` | `public/` | Current résumé. Name the file exactly this so the link works |
| `og.png` | `public/` | 1200 x 630. Screenshot of the ticket header strip plus your name on the paper background. Take it from the finished site |

## Created in code, no download needed

- Foil texture: drawn on canvas (system.md describes it)
- Perforated edge: CSS mask
- Fonts: `npm i @fontsource-variable/newsreader @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono`

## Inline SVGs (write them directly in components, no icon package)

Coin, also used for the cursor. Save as `public/coin.svg` and reference it in CSS:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="12.5" fill="#B4573A" stroke="#1F1D1A" stroke-width="1.5"/>
  <circle cx="14" cy="14" r="8.5" fill="none" stroke="#1F1D1A" stroke-opacity="0.35" stroke-width="1"/>
  <line x1="14" y1="9" x2="14" y2="19" stroke="#1F1D1A" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

Favicon, `public/favicon.svg`: a small ticket shape.

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect x="3" y="8" width="26" height="16" rx="2" fill="#F4EFE6" stroke="#1F1D1A" stroke-width="2"/>
  <line x1="21" y1="8" x2="21" y2="24" stroke="#B4573A" stroke-width="2" stroke-dasharray="2 2"/>
</svg>
```

Header icons (GitHub, LinkedIn, mail): plain 20px outline SVGs, `currentColor`, written inline. If you'd rather not draw them, use text links ("GitHub", "LinkedIn", "Email"). Text links are fine and fit the style better.

## Not needed, don't add

Stock photos, illustrations, generated images, project screenshots (the ticket is text-first), background textures as image files, sound files, Lottie files.

## Screenshots to take for the submission

On the finished, deployed site:

1. Full page, desktop
2. Full page, phone
3. Ticket untouched, with the hint visible
4. Ticket mid-scratch (one panel half cleared)
5. A revealed stub open under the ticket
6. Golden panel locked, showing the count
7. Golden panel after unlocking

On AWS:

8. Amplify app overview, showing the app name, branch and live URL
9. A successful build, with the build log steps visible
10. The hosting/domain settings page
11. The connected GitHub repo and branch
12. A failed build, if you had one. It's honest, and the brief asks what challenges you hit

Keep a running note in `docs/aws-setup.md` as you go: what you clicked, what failed, what fixed it.
