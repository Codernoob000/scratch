# SRS: portfolio site

Short and testable. If a line here can't be checked by opening the site, it doesn't belong.

## 1. Constraints

- Static site. No server code, no environment variables, no API keys.
- Hosted on AWS Amplify Hosting, built from a public GitHub repo.
- Stack: Vite, React 18, TypeScript, plain CSS with custom properties. Fonts via @fontsource packages.
- No other runtime dependencies without a written reason in the PR/commit message.
- Works in current Chrome, Safari (iOS 16+), Firefox, Edge.

## 2. Functional requirements

### Page structure
- FR-1. One page with, in order: header, hero (name + ticket), About, Skills, Projects, footer.
- FR-2. Header has anchor links to About, Skills, Projects and a Résumé link. It stays simple: no hamburger menu, no dropdowns. On 360px wide it wraps or shrinks, it doesn't hide links.
- FR-3. Every anchor scrolls to its section and updates the URL hash (`#about`, `#skills`, `#projects`).

### Ticket
- FR-4. The ticket renders 11 panels from `content.json`: 10 normal, 1 with `golden: true`.
- FR-5. Each panel is covered by a foil layer drawn on a canvas. Pointer drag (mouse, touch, pen) erases the foil under the pointer.
- FR-6. When at least 55% of a panel's foil is erased, the rest fades out (250 ms) and the panel is marked revealed.
- FR-7. Revealing a panel opens its stub below the ticket. Clicking a revealed panel reopens its stub.
- FR-8. The golden panel is locked until 5 non-golden panels are revealed. While locked it shows a flat label "scratch 5 first · N of 5" and ignores pointer input. When it unlocks, the label changes to "unlocked" and the foil becomes scratchable.
- FR-9. A visible hint sits above the ticket (coin icon, one line of text). It pulses gently until the first scratch, then turns into a counter "N of 11".
- FR-10. "Reveal all" button under the ticket reveals everything, golden included, and opens no stub.
- FR-11. Every panel is a focusable button. Enter or Space reveals it and opens its stub. Locked golden panel is `aria-disabled`.
- FR-12. Revealed state is saved to localStorage (`ticket.v1`) inside try/catch. If storage fails, the ticket still works for the session.
- FR-13. A visually hidden live region announces "Revealed: <title>" and "Locked panel unlocked".

### Content sections
- FR-14. About: photo, 3 short paragraphs, links (GitHub, LinkedIn, email, résumé).
- FR-15. Skills: grouped lists from `content.json`. Plain text, no progress bars, no percentages.
- FR-16. Projects: all 11 projects as plain cards (title, event, what, what went wrong, stack, links). This section does not depend on the ticket.
- FR-17. Links with an empty URL are not rendered.

### Build checks
- FR-18. `npm run check:content` fails if any string in `content.json` contains `TODO`, if any `projects[].what` or `.wrong` is empty, or if a project id is duplicated.
- FR-19. The Amplify build runs `check:content` before `build`, so a site with TODOs doesn't deploy.

## 3. Non-functional requirements

- NFR-1. Works at 360, 390, 768, 1280 and 1920px wide. No horizontal page scroll at any of them.
- NFR-2. Lighthouse (mobile): Performance 90+, Accessibility 95+, Best Practices 95+, SEO 90+.
- NFR-3. Built JS under 150 KB gzipped. Total page weight under 500 KB excluding the photo.
- NFR-4. Text contrast at least 4.5:1. Small accent-coloured text uses `--accent-ink`, not `--accent`.
- NFR-5. `prefers-reduced-motion`: no pulse, no fade, no slide. State changes are instant.
- NFR-6. Touch targets at least 44 px.
- NFR-7. No layout shift when a stub opens: its space is reserved or it opens below the fold of the ticket without pushing the hero text.
- NFR-8. Page title, meta description and Open Graph tags set. Favicon present.
- NFR-9. Zero network requests at runtime except the page's own files.

## 4. Data contract

`src/content/content.json`, typed in `src/content/types.ts`.

```
person   { name, line, tagline, location, college, photo, links{github,linkedin,email,resume} }
about    string[]
skills   { group, items[] }[]
ticket   { title, serial, unlockAfter, hint }
projects { id, code, title, event, what, wrong, stack[], links[{label,url}], golden? }[]
```

## 5. Acceptance tests (manual, do all of them)

1. Open the live URL on a phone. Scroll the whole page without the ticket trapping the scroll (use the margins/gutters).
2. Scratch one panel with a finger until it clears. Stub appears.
3. Reload. That panel is still revealed.
4. Try the golden panel before 5 reveals. Nothing happens, label shows the count.
5. Reveal 5 panels. Golden unlocks. Scratch it. Its stub appears.
6. Tab through the ticket with a keyboard and reveal a panel with Enter.
7. Press "Reveal all". Everything opens.
8. Turn on reduced motion in the OS. Repeat 2. No animation.
9. Click every external link.
10. View source of the built `dist/`. Search for "TODO". There should be none.
