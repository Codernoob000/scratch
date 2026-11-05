# PRD: Rithvik's portfolio (AWS Builder Center challenge)

Deadline: Friday 6 November 2026. Check the exact cutoff time on the submission page before the last day. Don't assume midnight.

## What this is

A single-page portfolio with three sections (About, Skills, Projects) and one interactive feature: a scratch-off ticket. Each panel on the ticket is a project I built under hackathon pressure. Scratch a panel and you see what it was, and what went wrong with it. One panel is hidden until you've scratched five others.

It is hosted on AWS Amplify Hosting.

The old portfolio (rithvik-os on Vercel) is already public, so it can't be entered. This is a new site in a new repo. Only the written content carries over, and even that gets rewritten where it reads stiff.

## Who looks at it

1. Challenge judges. AI scoring first, then AWS staff. They open the URL on a laptop, maybe a phone, and give it a few minutes.
2. Recruiters and internship reviewers, later. They want to know what I built, whether it works, and whether I'm honest about it.

## What each of them should walk away with

- Judges: the site loads, the ticket works without instructions, the write-up explains the build clearly.
- Recruiters: this person ships things and says plainly what's unfinished.

## How the judging rubric maps to this

| Rubric item | Weight | What covers it |
|---|---|---|
| Creativity and memorability | 30% | Ticket with real project content, honest "what went wrong" lines, a locked panel that rewards curiosity |
| Working AWS implementation | 25% | Amplify Hosting from GitHub, live URL, every link tested, setup documented with screenshots |
| Communication quality | 25% | Submission write-up (see checklist), clear screenshots, short honest notes on what broke |
| Completeness and usability | 20% | About, Skills, Projects all present, works at 360px wide, ticket never blocks navigation |

## The feature: scratch-off ticket

- Lives in the hero, directly under the name. Can't be missed.
- 10 normal panels plus 1 locked panel (the "one I shelved").
- Scratch with mouse or finger. A panel clears itself once about 55% is scratched.
- Revealing a panel opens its "stub" under the ticket: title, event, what it is, what went wrong, stack, links.
- The locked panel unlocks after 5 other panels are revealed. Its foil is the only terracotta thing on the ticket.
- Visible hint above the ticket with a small coin icon: "Scratch the ticket. Each panel is something I built. One is hiding." Once the first scratch happens, the hint becomes a counter ("3 of 11").
- Never required. A "Reveal all" button sits under the ticket, panels work with the keyboard, and the Projects section below lists every project as plain text.
- Progress is remembered in localStorage so a refresh doesn't wipe it.

## Scope

In:
- One page, anchored sections, plain scroll
- Ticket feature
- About, Skills, Projects, footer with links and résumé
- Static deploy on Amplify
- A docs/ folder in the repo with the AWS setup notes

Out:
- Backend, database, login, analytics, contact form
- Dark mode (one theme only)
- Blog or notes section
- Any API call at runtime, including to LLMs
- Sound

## Content rules

- All copy lives in `content.json`. Nothing hardcoded in components.
- First person, plain words, short sentences.
- Every project has an honest "what went wrong" line. If it's marked TODO, I fill it in myself. Nobody invents it.
- No claims I can't back up. Numbers only where I measured them.

## Submission checklist

- [ ] Live Amplify URL loads on desktop and phone
- [ ] All three sections present, links work (GitHub, LinkedIn, résumé, project repos)
- [ ] GitHub repo is public, README explains the feature and the AWS setup
- [ ] Project entered on the hackathon page under "your project"
- [ ] Description of the creative feature
- [ ] Screenshots: site on desktop, site on phone, ticket mid-scratch, a revealed stub, the locked panel after unlocking
- [ ] AWS screenshots: Amplify app overview, build log (successful), domain/URL settings
- [ ] AWS services used, listed honestly (Amplify Hosting; it serves through CloudFront)
- [ ] What I learned and what went wrong during the build
- [ ] Re-check the live URL again a day later, since judging happens after the deadline

## Schedule

- Thu 5 Nov evening: build the site, push to GitHub.
- Thu night: deploy on Amplify, test on a real phone.
- Fri 6 Nov morning: fill every TODO in content, take screenshots, write the submission, submit with hours to spare.
