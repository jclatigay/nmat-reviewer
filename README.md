# NMAT Reviewer

A personal NMAT review web app built with HTML, CSS, and JavaScript only.

## Features

- **8 subtests** — Part 1 (Verbal, Inductive Reasoning, Quantitative, Perceptual Acuity) and Part 2 (Biology, Physics, Chemistry, Social Science)
- **Study Mode** — untimed, optional hints, explanations after finishing
- **Exam Mode** — 30-minute section timer, flag questions, submit for score
- **Review page** — all explanations with filters (Incorrect, Unanswered, Flagged)
- **Editable JSON questions** — add your own questions without changing app code

## Quick start

This app must be served over HTTP (not opened as `file://`) because it loads JSON with `fetch()`.

```bash
cd nmat-reviewer
npx serve .
```

Then open the URL shown (usually `http://localhost:3000`).

Alternative:

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy to GitHub Pages

This repo is ready for GitHub Pages as a static site.

1. Push the code to the `main` branch on GitHub.
2. In your repository, open `Settings` > `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push any change to `main`, or run the `Deploy to GitHub Pages` workflow manually.

The site will be published from the workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

## Project structure

```
nmat-reviewer/
├── index.html          # App entry point
├── manifest.json       # PWA stub (ready for service worker later)
├── css/                # Stylesheets
├── js/                 # App logic (router, views, services, components)
├── data/               # subjects.json + questions/*.json
├── assets/images/      # Question figures and app icon
└── docs/               # Question authoring guide
```

## Adding questions

See [docs/question-format.md](docs/question-format.md) for the JSON schema and examples.

## PWA support

This app now includes a service worker (`sw.js`) for offline-ready asset caching and `manifest.json` for installability. Serve the app over HTTP and open it in a browser that supports service workers to register the PWA.

## Disclaimer

For personal review only. Not affiliated with CEM or the official NMAT. Sample questions are original and written in NMAT-style formats.
