# Portfolio

Single-page portfolio built for the AWS Builder Center challenge.

## What it is

A static portfolio with About, Skills, and Projects sections. The hero contains an interactive scratch-off ticket. Each panel on the ticket represents a project built during hackathons, showing what it was and what went wrong with it.

One golden panel stays locked until five other panels are revealed.

## Stack

- React 18
- TypeScript (strict)
- Vite
- Plain CSS with custom properties
- Fonts: Newsreader Variable, IBM Plex Sans, IBM Plex Mono via @fontsource

No backend, no database, no runtime API calls, and no analytics.

## How to run

Install dependencies:
```bash
npm install
```

Start local development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Verify content integrity:
```bash
npm run check:content
```

## How the ticket works

- 10 regular panels and 1 golden panel.
- Scratch with mouse or touch drag to erase the foil layer.
- At 55% cleared, the panel auto-reveals and opens its project details stub below the ticket.
- Keyboard accessible: focus any panel and press Enter or Space to reveal it.
- The golden panel stays locked until 5 other panels are revealed.
- A "Reveal all" button reveals every panel at once.
- Progress is saved to localStorage under the key `ticket.v1`.

## Deployment on AWS Amplify

The site deploys statically to AWS Amplify Hosting connected to the GitHub repository.

1. Connect the repository in the AWS Amplify console.
2. Amplify reads build settings from `amplify.yml`.
3. Pre-build sets Node 20 and installs dependencies with `npm ci`.
4. Build phase runs `npm run check:content` and `npm run build`.
5. Output directory is `dist/`, served globally via CloudFront.
