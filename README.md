# Dhruv Khurana · Portfolio V2

React 19 + TypeScript + Vite personal portfolio, rebuilt from scratch.

## Getting started

Requires Node.js 22 or later.

```bash
npm ci
npm run dev
```

## Validate and build

```bash
npm run check
npm run build
npm run preview
```

Production build includes pre-rendered HTML for crawler accessibility.

## Deployment

The `portfolio-v2-react` branch runs CI and uploads a build artifact. It **does not deploy over the live site**. After review and merge to `master`, GitHub Actions deploys the built site to GitHub Pages, provided Pages is configured to use GitHub Actions.

## Assets

Images and icons are kept inside `public/assets/`, which is published as `/assets/`.

## Content & privacy

Experience, skills, education, and projects are based on Dhruv's latest resume. No downloadable resume or AI assistant. Do not add confidential internal employer content.

## Search engines

Includes static pre-rendering, JSON-LD Person markup, canonical URL, Open Graph metadata, sitemap, and robots.txt. Search Console verification and indexing remain separate after deployment.
